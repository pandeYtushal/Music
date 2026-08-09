import axios from 'axios';
import { sanitizeSong, sanitizeSongList } from '../utils/library';
import { searchYouTube } from './youtube';

// ── Multi-endpoint API mirrors for high availability ────────────────────────
const ENDPOINTS = [
  import.meta.env.VITE_SAAVN_API_URL,
  'https://saavn.sumit.co/api',
  'https://saavn-api-murex.vercel.app',
].filter(Boolean);

/**
 * Execute request across available endpoints until one succeeds.
 */
const fetchWithFallback = async (path, params, signal) => {
  let lastError = null;
  for (const baseURL of ENDPOINTS) {
    try {
      const response = await axios.get(`${baseURL}${path}`, {
        params,
        timeout: 7000,
        signal,
      });
      if (response.data && (response.data.data || response.data.status === 'SUCCESS' || response.data.results)) {
        return response.data;
      }
    } catch (err) {
      if (axios.isCancel(err)) throw err;
      lastError = err;
    }
  }
  throw lastError || new Error('All Saavn API mirrors failed');
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

  return dedupe(dedupeKey, async () => {
    try {
      const data = await fetchWithFallback('/search/songs', { query: trimmedQuery, limit: clampedLimit, page }, signal);
      const results = data?.data?.results || data?.data || data?.results || [];
      return sanitizeSongList(Array.isArray(results) ? results : [], clampedLimit);
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

  return dedupe(`song:${cleanId}`, async () => {
    try {
      const data = await fetchWithFallback('/songs', { id: cleanId }, signal);
      const raw = data?.data?.[0] || (Array.isArray(data?.data) ? data?.data[0] : data?.data);
      return raw ? sanitizeSong(raw) : null;
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

  return dedupe(`lyrics:${cleanId}`, async () => {
    try {
      const data = await fetchWithFallback('/lyrics', { id: cleanId }, signal);
      return data?.data?.lyrics || data?.data?.snippet || null;
    } catch {
      return null;
    }
  });
};
