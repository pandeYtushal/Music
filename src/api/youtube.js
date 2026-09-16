import axios from 'axios';

const asImageList = (url) => url ? [{ quality: '500x500', link: url }] : [];

const normalizeTrack = (track) => ({
  ...track,
  image: Array.isArray(track.image) ? track.image : asImageList(track.image),
  downloadUrl: Array.isArray(track.downloadUrl) ? track.downloadUrl : [],
});

const SEARCH_INSTANCES = [
  { base: 'https://pipedapi.in.projectsegfau.lt', type: 'piped' },
  { base: 'https://pipedapi.osphost.fi', type: 'piped' },
  { base: 'https://pipedapi.kavin.rocks', type: 'piped' },
  { base: 'https://invidious.flokinet.to/api/v1', type: 'invidious' },
  { base: 'https://inv.tux.pizza/api/v1', type: 'invidious' },
];

// Per-instance timeout (ms). Invidious is slow — give it extra time.
const INSTANCE_TIMEOUT = {
  piped: 7000,
  invidious: 10000,
};

/**
 * Combine multiple AbortSignals — fires when ANY one fires.
 */
const anySignal = (signals) => {
  const ctrl = new AbortController();
  for (const sig of signals) {
    if (!sig) continue;
    if (sig.aborted) { ctrl.abort(); break; }
    sig.addEventListener('abort', () => ctrl.abort(), { once: true });
  }
  return ctrl.signal;
};

/**
 * Promise.any polyfill (Safari < 15 compat)
 */
const promiseAny = (promises) => {
  if (typeof Promise.any === 'function') return Promise.any(promises);
  return new Promise((resolve, reject) => {
    let rejections = 0;
    promises.forEach((p) =>
      Promise.resolve(p).then(resolve).catch(() => {
        if (++rejections === promises.length) reject(new Error('All YouTube instances failed'));
      }),
    );
  });
};

/**
 * Normalize a raw result item from any Piped or Invidious instance
 * into a consistent track object.
 */
const normalizeItem = (item) => {
  const vId =
    item.videoId ||
    (item.url ? item.url.replace('/watch?v=', '') : null) ||
    item.id;
  if (!vId || typeof vId !== 'string') return null;

  return normalizeTrack({
    id: vId,
    name: (item.title || 'Song')
      .replace(/(\(Official.*?\)|\[Official.*?\]|LYRICAL|Official Video|Official Audio)/gi, '')
      .trim(),
    primaryArtists: item.author || item.uploaderName || item.channelTitle || 'Unknown Artist',
    image: `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`,
    duration: item.lengthSeconds || item.duration || 240,
  });
};

/**
 * Search YouTube via community Piped/Invidious instances.
 * Races all instances concurrently — uses whichever responds first.
 *
 * @param {string}      query
 * @param {AbortSignal} [callerSignal]  Optional signal from the call site.
 */
export const searchYouTubeInstances = async (query, callerSignal) => {
  const q = String(query || '').trim();
  if (!q) return [];

  const instanceControllers = [];

  const requests = SEARCH_INSTANCES.map(({ base, type }) => {
    const ctrl = new AbortController();
    instanceControllers.push(ctrl);

    // Combine our per-instance timeout signal with the caller's signal
    const timeoutSignal = AbortSignal.timeout
      ? AbortSignal.timeout(INSTANCE_TIMEOUT[type])
      : (() => {
        const c = new AbortController();
        setTimeout(() => c.abort(), INSTANCE_TIMEOUT[type]);
        return c.signal;
      })();

    const signals = [timeoutSignal, ctrl.signal];
    if (callerSignal) signals.push(callerSignal);
    const combined = anySignal(signals);

    const isInvidious = type === 'invidious';
    const url = `${base}/search`;
    const params = isInvidious
      ? { q: `${q} music`, type: 'video' }
      : { q: `${q} music`, filter: 'music_songs' };

    return axios
      .get(url, { params, signal: combined })
      .then((res) => {
        const items = res.data?.items || res.data || [];
        if (!Array.isArray(items) || items.length === 0) {
          return Promise.reject(new Error('Empty result'));
        }
        const tracks = items
          .slice(0, 20)
          .map((item) => normalizeItem(item, type))
          .filter(Boolean);
        if (tracks.length === 0) return Promise.reject(new Error('No valid tracks'));
        return tracks;
      });
  });

  try {
    const tracks = await promiseAny(requests);
    return tracks;
  } finally {
    // Cancel all still-running requests once we have a winner
    instanceControllers.forEach((c) => { try { c.abort(); } catch { /* */ } });
  }
};

// ── Official YouTube Data API v3 (used when VITE_YOUTUBE_API_KEY is set) ──────
const searchYouTubeOfficial = async (query) => {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: `${query} song audio`,
        type: 'video',
        videoCategoryId: '10',
        maxResults: 20,
        key: apiKey,
      },
      timeout: 8000,
    });
    return (res.data.items || [])
      .map((item) =>
        normalizeTrack({
          id: item.id.videoId,
          name: item.snippet.title
            .replace(/(\(Official.*?\)|\[Official.*?\]|LYRICAL|Video|Audio)/gi, '')
            .trim(),
          primaryArtists: item.snippet.channelTitle
            .replace(' - Topic', '')
            .replace('VEVO', ''),
          image:
            item.snippet.thumbnails?.high?.url ||
            item.snippet.thumbnails?.medium?.url ||
            `https://i.ytimg.com/vi/${item.id.videoId}/hqdefault.jpg`,
          duration: 240,
        }),
      )
      .filter((t) => t.id);
  } catch (e) {
    console.warn('[YT Official API] failed:', e.message);
    return null;
  }
};

/**
 * Main export: search YouTube. Tries official API first (if key present),
 * then falls back to community instances raced concurrently.
 */
export const searchYouTube = async (query, callerSignal) => {
  const q = String(query || '').trim();
  if (!q) return [];

  // Try official API first (free quota, no SSL issues)
  const official = await searchYouTubeOfficial(q);
  if (official?.length) return official;

  // Race community instances
  try {
    return await searchYouTubeInstances(q, callerSignal);
  } catch (e) {
    if (e?.name !== 'AbortError') console.warn('[YT Community instances] all failed:', e.message);
    return [];
  }
};
