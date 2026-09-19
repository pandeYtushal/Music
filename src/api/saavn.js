import axios from 'axios';
import { sanitizeSong, sanitizeSongList } from '../utils/library';
import { searchYouTube } from './youtube';

// ── Saavn API endpoints (raced concurrently — first good response wins) ───────
// Add more mirrors here if any go down; they're raced so adding extras is free.
const ENDPOINTS = [
  import.meta.env.VITE_SAAVN_API_URL,
  'https://saavn.dev/api',
  'https://jiosaavn-api-privatecvc2.vercel.app',
  'https://jiosaavn-api-nu.vercel.app',
  'https://jiosaavn-api-2-harsh-patel.vercel.app',
].filter(Boolean);

const REQUEST_TIMEOUT = 9000; // ms per individual endpoint request

// ── Response cache ────────────────────────────────────────────────────────────
const cache    = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const cacheGet = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null; }
  return entry.data;
};

const cacheSet = (key, data) => {
  if (cache.size > 100) {
    // Evict oldest entry
    const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
    if (oldest) cache.delete(oldest[0]);
  }
  cache.set(key, { data, ts: Date.now() });
};

// ── Signal helpers ────────────────────────────────────────────────────────────
/**
 * Combine multiple AbortSignals — fires when ANY one fires.
 * Safely handles already-aborted signals.
 */
const anySignal = (signals) => {
  const ctrl = new AbortController();
  for (const sig of signals) {
    if (!sig) continue;
    // If already aborted, propagate immediately but DON'T abort the result
    // controller synchronously here — we return it and the caller's axios request
    // will handle the abort. Abort it on next tick so caller code runs first.
    if (sig.aborted) {
      Promise.resolve().then(() => ctrl.abort());
      break;
    }
    sig.addEventListener('abort', () => ctrl.abort(), { once: true });
  }
  return ctrl.signal;
};

/**
 * Promise.any polyfill (Safari < 15)
 */
const promiseAny = (promises) => {
  if (typeof Promise.any === 'function') return Promise.any(promises);
  return new Promise((resolve, reject) => {
    let rejections = 0;
    promises.forEach((p) =>
      Promise.resolve(p).then(resolve).catch(() => {
        if (++rejections === promises.length) reject(new Error('All Saavn endpoints failed'));
      }),
    );
  });
};

// ── Core fetcher — races all endpoints simultaneously ─────────────────────────
/**
 * Fires requests to all endpoints concurrently.
 * The first endpoint to return a valid (non-empty) response wins;
 * all others are aborted immediately.
 *
 * @param {string}      path         API path, e.g. "/search/songs"
 * @param {object}      params       Query params
 * @param {AbortSignal} [callerSignal]  Optional caller-provided abort signal
 */
const fetchWithFallback = async (path, params, callerSignal) => {
  const controllers = [];

  const requests = ENDPOINTS.map((baseURL) => {
    const perRequestCtrl = new AbortController();
    controllers.push(perRequestCtrl);

    // Per-request timeout signal
    const timeoutSignal = AbortSignal.timeout
      ? AbortSignal.timeout(REQUEST_TIMEOUT)
      : (() => {
          const c = new AbortController();
          setTimeout(() => c.abort(), REQUEST_TIMEOUT);
          return c.signal;
        })();

    const signals = [timeoutSignal, perRequestCtrl.signal];
    if (callerSignal) signals.push(callerSignal);
    const combined = anySignal(signals);

    return axios
      .get(`${baseURL}${path}`, { params, signal: combined })
      .then((res) => {
        // Only accept responses that actually contain data
        const d = res.data;
        if (
          d &&
          (d.data || d.status === 'SUCCESS' || d.results || Array.isArray(d))
        ) {
          return d;
        }
        return Promise.reject(new Error('Empty or invalid response'));
      });
  });

  try {
    const result = await promiseAny(requests);
    return result;
  } finally {
    // Cancel all remaining in-flight requests
    controllers.forEach((c) => { try { c.abort(); } catch { /* */ } });
  }
};

// ── In-flight deduplication ───────────────────────────────────────────────────
const inFlight = new Map();

const dedupe = (key, factory) => {
  if (inFlight.has(key)) return inFlight.get(key);
  const promise = factory().finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Search for songs by query string.
 * Automatically falls back to YouTube search if all Saavn endpoints fail.
 *
 * @param {string}      query
 * @param {object}      [opts]
 * @param {number}      [opts.limit=10]
 * @param {number}      [opts.page=1]
 * @param {AbortSignal} [opts.signal]   Caller abort signal (e.g. from React useEffect cleanup)
 */
export const searchSongs = async (query, { limit = 10, page = 1, signal } = {}) => {
  const q = String(query || '').trim().slice(0, 120);
  if (!q) return [];

  const clampedLimit = Math.min(50, Math.max(1, limit));
  const dedupeKey    = `search:${q}:${clampedLimit}:${page}`;

  const cached = cacheGet(dedupeKey);
  if (cached) return cached;

  return dedupe(dedupeKey, async () => {
    try {
      const data = await fetchWithFallback(
        '/search/songs',
        { query: q, limit: clampedLimit, page },
        signal,
      );
      const results   = Array.isArray(data) ? data : (data?.data?.results || data?.data || data?.results || []);
      const sanitized = sanitizeSongList(Array.isArray(results) ? results : [], clampedLimit);
      if (sanitized.length) cacheSet(dedupeKey, sanitized);
      return sanitized;
    } catch (err) {
      // Don't fall back to YouTube if the caller deliberately cancelled the request
      if (axios.isCancel(err) || err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') {
        throw err;
      }
      console.warn('[Saavn] all endpoints failed — falling back to YouTube:', err.message);
      const ytResults = await searchYouTube(q, signal);
      const sanitized = sanitizeSongList(ytResults, clampedLimit);
      if (sanitized.length) cacheSet(dedupeKey, sanitized);
      return sanitized;
    }
  });
};

/**
 * Fetch a single song by its Saavn ID.
 *
 * @param {string}      id
 * @param {object}      [opts]
 * @param {AbortSignal} [opts.signal]
 */
export const getSongById = async (id, { signal } = {}) => {
  const cleanId = String(id || '').trim();
  if (!cleanId) return null;

  const cacheKey = `song:${cleanId}`;
  const cached   = cacheGet(cacheKey);
  if (cached) return cached;

  return dedupe(cacheKey, async () => {
    try {
      const data = await fetchWithFallback('/songs', { id: cleanId }, signal);
      const raw  = Array.isArray(data) ? data[0] : (data?.data?.[0] ?? (Array.isArray(data?.data) ? data.data[0] : data?.data));
      const song = raw ? sanitizeSong(raw) : null;
      if (song) cacheSet(cacheKey, song);
      return song;
    } catch (err) {
      if (err?.name !== 'AbortError') console.warn('[Saavn getSongById]', err.message);
      return null;
    }
  });
};

/**
 * Fetch lyrics by Saavn song ID.
 *
 * @param {string}      id
 * @param {object}      [opts]
 * @param {AbortSignal} [opts.signal]
 */
export const getLyrics = async (id, { signal } = {}) => {
  const cleanId = String(id || '').trim();
  if (!cleanId) return null;

  const cacheKey = `lyrics:${cleanId}`;
  const cached   = cacheGet(cacheKey);
  if (cached) return cached;

  return dedupe(cacheKey, async () => {
    try {
      const data   = await fetchWithFallback('/lyrics', { id: cleanId }, signal);
      const lyrics = Array.isArray(data) ? (data[0]?.lyrics || data[0]?.snippet) : (data?.data?.lyrics || data?.data?.snippet || data?.lyrics || null);
      if (lyrics) cacheSet(cacheKey, lyrics);
      return lyrics;
    } catch {
      return null;
    }
  });
};
