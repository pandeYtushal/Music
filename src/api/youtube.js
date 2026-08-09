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
  { id: 'ar_rahman', name: 'A.R. Rahman' },
  { id: 'party', name: 'Party & Punjabi' },
];

export const DEFAULT_YOUTUBE_TRACKS = [
  // 90s Bollywood
  { id: '1poXw3a02a0', name: 'Chaiyya Chaiyya', primaryArtists: 'Sukhwinder Singh, A.R. Rahman', category: '90s', image: 'https://i.ytimg.com/vi/1poXw3a02a0/hqdefault.jpg', duration: 412 },
  { id: 'K0Eke3p4sM8', name: 'Kuch Kuch Hota Hai', primaryArtists: 'Udit Narayan, Alka Yagnik', category: '90s', image: 'https://i.ytimg.com/vi/K0Eke3p4sM8/hqdefault.jpg', duration: 296 },
  { id: 'h7gyJRdWj30', name: 'Dil Se Re', primaryArtists: 'A.R. Rahman', category: '90s', image: 'https://i.ytimg.com/vi/h7gyJRdWj30/hqdefault.jpg', duration: 415 },
  { id: 'cUMKuEU35wU', name: 'Kal Ho Naa Ho', primaryArtists: 'Sonu Nigam, Shankar-Ehsaan-Loy', category: '90s', image: 'https://i.ytimg.com/vi/cUMKuEU35wU/hqdefault.jpg', duration: 322 },
  { id: 'atV-J2dMvWc', name: 'Tujhe Dekha To', primaryArtists: 'Kumar Sanu, Lata Mangeshkar', category: '90s', image: 'https://i.ytimg.com/vi/atV-J2dMvWc/hqdefault.jpg', duration: 304 },
  { id: 'a5uQMwj21vU', name: 'Pehla Nasha', primaryArtists: 'Udit Narayan, Sadhana Sargam', category: '90s', image: 'https://i.ytimg.com/vi/a5uQMwj21vU/hqdefault.jpg', duration: 291 },

  // Romantic Hits
  { id: 'BddP6PYo2gs', name: 'Kesariya', primaryArtists: 'Arijit Singh, Pritam', category: 'romantic', image: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg', duration: 268 },
  { id: 'V7LwfY5U5WI', name: 'Tum Hi Ho', primaryArtists: 'Arijit Singh, Mithoon', category: 'romantic', image: 'https://i.ytimg.com/vi/V7LwfY5U5WI/hqdefault.jpg', duration: 262 },
  { id: 'YxWlaYCA8f0', name: 'Apna Bana Le', primaryArtists: 'Arijit Singh, Sachin-Jigar', category: 'romantic', image: 'https://i.ytimg.com/vi/YxWlaYCA8f0/hqdefault.jpg', duration: 261 },
  { id: 'gvyUuxd6R4c', name: 'Raataan Lambiyan', primaryArtists: 'Jubin Nautiyal, Tanishk Bagchi', category: 'romantic', image: 'https://i.ytimg.com/vi/gvyUuxd6R4c/hqdefault.jpg', duration: 230 },
  { id: 'dTUUA8i-lK4', name: 'Chaleya', primaryArtists: 'Arijit Singh, Shilpa Rao', category: 'romantic', image: 'https://i.ytimg.com/vi/dTUUA8i-lK4/hqdefault.jpg', duration: 200 },
  { id: 'sAZVto4mSno', name: 'Satranga', primaryArtists: 'Arijit Singh, Shreyas Puranik', category: 'romantic', image: 'https://i.ytimg.com/vi/sAZVto4mSno/hqdefault.jpg', duration: 271 },

  // A.R. Rahman
  { id: 'mS81a-cE1g0', name: 'Kun Faya Kun', primaryArtists: 'A.R. Rahman, Javed Ali, Mohit Chauhan', category: 'ar_rahman', image: 'https://i.ytimg.com/vi/mS81a-cE1g0/hqdefault.jpg', duration: 472 },
  { id: 'ab3x4WfFqS8', name: 'Tere Bina', primaryArtists: 'A.R. Rahman, Chinmayi', category: 'ar_rahman', image: 'https://i.ytimg.com/vi/ab3x4WfFqS8/hqdefault.jpg', duration: 310 },
  { id: '5E8X6rP7-Lg', name: 'Agar Tum Saath Ho', primaryArtists: 'Arijit Singh, Alka Yagnik, A.R. Rahman', category: 'ar_rahman', image: 'https://i.ytimg.com/vi/5E8X6rP7-Lg/hqdefault.jpg', duration: 341 },
  { id: 'w9X5yS6h-6g', name: 'Khwaja Mere Khwaja', primaryArtists: 'A.R. Rahman', category: 'ar_rahman', image: 'https://i.ytimg.com/vi/w9X5yS6h-6g/hqdefault.jpg', duration: 418 },

  // Party & Punjabi
  { id: 'v7K4vGYL9zI', name: 'Softly', primaryArtists: 'Karan Aujla, Ikky', category: 'party', image: 'https://i.ytimg.com/vi/v7K4vGYL9zI/hqdefault.jpg', duration: 156 },
  { id: 'hD-4u_GkM0Y', name: 'Excuses', primaryArtists: 'AP Dhillon, Gurinder Gill', category: 'party', image: 'https://i.ytimg.com/vi/hD-4u_GkM0Y/hqdefault.jpg', duration: 176 },
  { id: '34Na4j8AVgA', name: 'Starboy (Bollywood Mix)', primaryArtists: 'Badshah, Yo Yo Honey Singh', category: 'party', image: 'https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg', duration: 215 },
  { id: 'hEJnMQGLai8', name: 'Pasoori', primaryArtists: 'Ali Sethi, Shae Gill', category: 'party', image: 'https://i.ytimg.com/vi/hEJnMQGLai8/hqdefault.jpg', duration: 224 },
];

const SEARCH_INSTANCES = [
  'https://pipedapi.adminforge.de',
  'https://api.piped.video',
  'https://pipedapi.kavin.rocks',
];

export const searchYouTube = async (query) => {
  const q = String(query || '').trim();
  if (!q) return DEFAULT_YOUTUBE_TRACKS;

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
      const res = await axios.get(`${instance}/search`, {
        params: { q: `${q} music`, filter: 'music_songs' },
        timeout: 5000,
      });
      const items = res.data.items || res.data || [];
      if (Array.isArray(items) && items.length > 0) {
        return items
          .filter(i => i.type === 'stream' || i.url)
          .slice(0, 20)
          .map(item => {
            const vId = item.url ? item.url.replace('/watch?v=', '') : item.id;
            return normalizeYouTubeTrack({
              id: vId,
              name: item.title?.replace(/(\(Official.*?\)|\[Official.*?\]|LYRICAL|Video|Audio)/gi, '').trim() || 'Song',
              primaryArtists: item.uploaderName || item.channelTitle || 'Artist',
              image: item.thumbnail || `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`,
              duration: item.duration || 240,
            });
          });
      }
    } catch (_) {}
  }

  const localMatches = DEFAULT_YOUTUBE_TRACKS.filter(t =>
    t.name.toLowerCase().includes(q.toLowerCase()) ||
    t.primaryArtists.toLowerCase().includes(q.toLowerCase())
  );
  // Do not turn an API outage into a blank search screen. The library remains
  // browsable and the closest local tracks are shown first.
  return (localMatches.length > 0 ? localMatches : DEFAULT_YOUTUBE_TRACKS)
    .map(normalizeYouTubeTrack);
};
