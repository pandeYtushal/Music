import axios from 'axios';
import { sanitizeSongList } from '../utils/library';

const api = axios.create({
  baseURL: 'https://jio-saavn-api-sigma.vercel.app',
  timeout: 8000,
});

export const searchSongs = async (query, { limit = 10, signal } = {}) => {
  const trimmedQuery = String(query || '').trim().slice(0, 120);
  if (!trimmedQuery) return [];

  const response = await api.get('/search/songs', {
    params: { query: trimmedQuery, limit },
    signal,
  });

  return sanitizeSongList(response.data?.data?.results, limit);
};
