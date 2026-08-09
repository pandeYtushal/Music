import axios from 'axios';

const asImageList = (url) => url ? [{ quality: '500x500', link: url }] : [];

const normalizeYouTubeTrack = (track) => ({
  ...track,
  image: Array.isArray(track.image) ? track.image : asImageList(track.image),
  // YouTube discovery results do not expose a stream URL. Keeping this shape
  // consistent lets them render and be saved like results from Saavn.
  downloadUrl: Array.isArray(track.downloadUrl) ? track.downloadUrl : [],
});

export const PLAYLIST_CATEGORIES = [
  { id: 'all', name: 'All Songs' },
  { id: '90s', name: '90s Bollywood' },
  { id: 'romantic', name: 'Romantic Hits' },
  { id: 'party', name: 'Party & Punjabi' },
];

const SEARCH_INSTANCES = [
  'https://invidious.flokinet.to/api/v1',
  'https://pipedapi.in.projectsegfau.lt',
  'https://pipedapi.kavin.rocks',
];

export const searchYouTube = async (query) => {
  const q = String(query || '').trim();
  if (!q) return [];

  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  if (apiKey) {
    try {
      const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: `${q} song audio`,
          type: 'video',
          videoCategoryId: '10',
          maxResults: 20,
          key: apiKey,
        },
      });
      return (res.data.items || []).map(item => normalizeYouTubeTrack({
        id: item.id.videoId,
        name: item.snippet.title.replace(/(\(Official.*?\)|\[Official.*?\]|LYRICAL|Video|Audio)/gi, '').trim(),
        primaryArtists: item.snippet.channelTitle.replace(' - Topic', '').replace('VEVO', ''),
        image: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${item.id.videoId}/hqdefault.jpg`,
        duration: 240,
      }));
    } catch (e) {
      console.warn('YouTube official API failed, falling back:', e);
    }
  }

  for (const instance of SEARCH_INSTANCES) {
    try {
      const isInvidious = instance.includes('/v1');
      const url = `${instance}/search`;
      const params = isInvidious ? { q: `${q} music`, type: 'video' } : { q: `${q} music`, filter: 'music_songs' };

      const res = await axios.get(url, { params, timeout: 5000 });
      const rawItems = res.data.items || res.data || [];
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        return rawItems
          .slice(0, 20)
          .map(item => {
            const vId = item.videoId || (item.url ? item.url.replace('/watch?v=', '') : item.id);
            if (!vId) return null;
            return normalizeYouTubeTrack({
              id: String(vId),
              name: (item.title || 'Song').replace(/(\(Official.*?\)|\[Official.*?\]|LYRICAL|Video|Audio)/gi, '').trim(),
              primaryArtists: item.author || item.uploaderName || item.channelTitle || 'Artist',
              image: item.videoThumbnails?.[0]?.url || item.thumbnail || `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`,
              duration: item.lengthSeconds || item.duration || 240,
            });
          })
          .filter(Boolean);
      }
    } catch {
      // Continue to next mirror
    }
  }

  return [];
};

