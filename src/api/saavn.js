import axios from 'axios';
import { sanitizeSong, sanitizeSongList } from '../utils/library';
import { searchYouTube } from './youtube';

// ── Multi-endpoint API mirrors for high availability ────────────────────────
const ENDPOINTS = [
  import.meta.env.VITE_SAAVN_API_URL,
  'https://saavn.dev/api',
  'https://jiosaavn-api-privatecvc2.vercel.app',
  'https://jiosaavn-api-nu.vercel.app',
].filter(Boolean);

// ── Simple in-memory response cache ─────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const cacheGet = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null; }
  return entry.data;
};

const cacheSet = (key, data) => {
  // Evict oldest entries if cache grows too large
  if (cache.size > 80) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
    if (oldest) cache.delete(oldest[0]);
  }
  cache.set(key, { data, ts: Date.now() });
};

/**
 * Race all endpoints simultaneously — use whichever responds first.
 * This is much faster than the old sequential fallback because slow/down
 * mirrors don't block the fast ones.
 */
const fetchWithFallback = async (path, params, signal) => {
  const controllers = [];

  const requests = ENDPOINTS.map((baseURL) => {
    const ctrl = new AbortController();
    controllers.push(ctrl);
    // Use a combined signal: caller's abort OR individual race winner abort
    const combinedSignal = signal
      ? anySignal([signal, ctrl.signal])
      : ctrl.signal;

    return axios.get(`${baseURL}${path}`, {
      params,
      timeout: 8000,
      signal: combinedSignal,
    }).then((response) => {
      if (response.data && (
        response.data.data ||
        response.data.status === 'SUCCESS' ||
        response.data.results
      )) {
        return response.data;
      }
      // Treat empty-but-200 as failure so other mirrors get a chance
      return Promise.reject(new Error('Empty response'));
    });
  });

  try {
    // any() resolves with the first successful result
    const result = await any(requests);
    return result;
  } finally {
    // Cancel all remaining in-flight requests once we have a winner
    controllers.forEach(ctrl => { try { ctrl.abort(); } catch { /* */ } });
  }
};

/**
 * Like Promise.any() but with proper fallback for Safari <15.
 */
const any = (promises) => {
  if (typeof Promise.any === 'function') return Promise.any(promises);
  // Polyfill: resolve on first fulfillment, reject only if all reject
  return new Promise((resolve, reject) => {
    let rejections = 0;
    promises.forEach(p =>
      Promise.resolve(p).then(resolve).catch(() => {
        if (++rejections === promises.length) reject(new Error('All endpoints failed'));
      })
    );
  });
};

/**
 * Combine multiple AbortSignals — aborts when any one fires.
 */
const anySignal = (signals) => {
  const ctrl = new AbortController();
  signals.forEach(sig => {
    if (sig?.aborted) { ctrl.abort(); return; }
    sig?.addEventListener('abort', () => ctrl.abort(), { once: true });
  });
  return ctrl.signal;
};

// ── In-flight request deduplication ─────────────────────────────────────────
const inFlight = new Map();

const dedupe = (key, factory) => {
  if (inFlight.has(key)) return inFlight.get(key);
  const promise = factory().finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
};

// ── API functions ─────────────────────────────────────────────────────────────

/**
 * Search for songs by query string.
 */
export const searchSongs = async (query, { limit = 10, page = 1, signal } = {}) => {
  const trimmedQuery = String(query || '').trim().slice(0, 120);
  if (!trimmedQuery) return [];

  const clampedLimit = Math.min(50, Math.max(1, limit));
  const dedupeKey = `search:${trimmedQuery}:${clampedLimit}:${page}`;

  // Check cache first — avoids network entirely for repeated queries
  const cached = cacheGet(dedupeKey);
  if (cached) return cached;

  return dedupe(dedupeKey, async () => {
    try {
      const data = await fetchWithFallback('/search/songs', { query: trimmedQuery, limit: clampedLimit, page }, signal);
      const results = data?.data?.results || data?.data || data?.results || [];
      const sanitized = sanitizeSongList(Array.isArray(results) ? results : [], clampedLimit);
      cacheSet(dedupeKey, sanitized);
      return sanitized;
    } catch (err) {
      if (axios.isCancel(err)) throw err;
      console.warn('Saavn search failed; using the YouTube discovery fallback:', err);
      const fallbackResults = await searchYouTube(trimmedQuery);
      return sanitizeSongList(fallbackResults, clampedLimit);
    }
  });
};

/**
 * Fetch a single song by its Saavn song ID.
 */
export const getSongById = async (id, { signal } = {}) => {
  const cleanId = String(id || '').trim();
  if (!cleanId) return null;

  const cacheKey = `song:${cleanId}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  return dedupe(cacheKey, async () => {
    try {
      const data = await fetchWithFallback('/songs', { id: cleanId }, signal);
      const raw = data?.data?.[0] || (Array.isArray(data?.data) ? data?.data[0] : data?.data);
      const result = raw ? sanitizeSong(raw) : null;
      if (result) cacheSet(cacheKey, result);
      return result;
    } catch (err) {
      console.warn('Get song failed:', err);
      return null;
    }
  });
};

/**
 * Fetch lyrics by Saavn song ID.
 */
export const getLyrics = async (id, { signal } = {}) => {
  const cleanId = String(id || '').trim();
  if (!cleanId) return null;

  const cacheKey = `lyrics:${cleanId}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  return dedupe(cacheKey, async () => {
    try {
      const data = await fetchWithFallback('/lyrics', { id: cleanId }, signal);
      const lyrics = data?.data?.lyrics || data?.data?.snippet || null;
      if (lyrics) cacheSet(cacheKey, lyrics);
      return lyrics;
    } catch {
      return null;
    }
  });
};
