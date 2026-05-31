import { cleanText } from './text';
import { safeUrl } from './media';

const MAX_TEXT_LENGTH = 180;
const MAX_LIST_ITEMS = 50;
const MAX_PLAYLISTS = 30;
const MAX_PLAYLIST_SONGS = 100;
const VALID_REPEAT_MODES = new Set(['off', 'all', 'one']);
const VALID_QUALITIES = new Set(['48kbps', '96kbps', '160kbps', '320kbps']);

const clampText = (value, fallback = '') => cleanText(value, fallback).slice(0, MAX_TEXT_LENGTH);

const sanitizeMediaList = (items) => {
  if (!Array.isArray(items)) return [];

  return items
    .map(item => ({
      quality: clampText(item?.quality),
      link: safeUrl(item?.link),
    }))
    .filter(item => item.link)
    .slice(0, 8);
};

export const sanitizeSong = (song) => {
  if (!song || !song.id) return null;

  return {
    id: clampText(song.id),
    name: clampText(song.name, 'Unknown Song'),
    primaryArtists: clampText(song.primaryArtists, ''),
    label: clampText(song.label, ''),
    duration: Number.isFinite(Number(song.duration)) ? Math.max(0, Number(song.duration)) : 0,
    album: song.album?.name ? { name: clampText(song.album.name) } : null,
    image: sanitizeMediaList(song.image),
    downloadUrl: sanitizeMediaList(song.downloadUrl),
  };
};

export const sanitizeSongList = (songs, limit = MAX_LIST_ITEMS) => {
  if (!Array.isArray(songs)) return [];

  const seen = new Set();
  const sanitized = [];

  for (const song of songs) {
    const item = sanitizeSong(song);
    if (!item || seen.has(item.id)) continue;
    seen.add(item.id);
    sanitized.push(item);
    if (sanitized.length >= limit) break;
  }

  return sanitized;
};

export const sanitizePlaylistName = (name) => clampText(name, 'Untitled Playlist').slice(0, 60);

export const createPlaylistId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `playlist_${crypto.randomUUID()}`;
  }

  return `playlist_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export const sanitizePlaylists = (playlists) => {
  if (!Array.isArray(playlists)) return [];

  return playlists
    .map(playlist => ({
      id: clampText(playlist?.id || createPlaylistId()),
      name: sanitizePlaylistName(playlist?.name),
      image: safeUrl(playlist?.image),
      songs: sanitizeSongList(playlist?.songs, MAX_PLAYLIST_SONGS),
    }))
    .slice(0, MAX_PLAYLISTS);
};

export const sanitizeLibrary = (library = {}) => ({
  favorites: sanitizeSongList(library.favorites, MAX_LIST_ITEMS),
  recentlyPlayed: sanitizeSongList(library.recentlyPlayed, 20),
  playlists: sanitizePlaylists(library.playlists),
  autoplay: typeof library.autoplay === 'boolean' ? library.autoplay : true,
  shuffle: typeof library.shuffle === 'boolean' ? library.shuffle : false,
  repeatMode: VALID_REPEAT_MODES.has(library.repeatMode) ? library.repeatMode : 'off',
  quality: VALID_QUALITIES.has(library.quality) ? library.quality : '320kbps',
});
