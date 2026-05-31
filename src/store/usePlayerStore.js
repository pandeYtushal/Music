import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createPlaylistId,
  sanitizeLibrary,
  sanitizePlaylistName,
  sanitizeSong,
  sanitizeSongList,
} from '../utils/library';

export const usePlayerStore = create(
  persist(
    (set, get) => ({
      currentVideo: null,
      isPlaying: false,
      playlist: [],
      currentIndex: -1,
      favorites: [],
      recentlyPlayed: [],
      autoplay: true,
      shuffle: false,
      repeatMode: 'off',
      quality: '320kbps',
      playlists: [],
      isAddToPlaylistModalOpen: false,
      pendingSong: null,
      
      setCurrentVideo: (video, contextPlaylist = null) => {
        if (!video) {
          set({
            currentVideo: null,
            isPlaying: false,
            playlist: contextPlaylist || [],
            currentIndex: -1
          });
          return;
        }

        const state = get();
        const cleanVideo = sanitizeSong(video);
        if (!cleanVideo) return;

        let newPlaylist = contextPlaylist ? sanitizeSongList(contextPlaylist, 100) : state.playlist;
        
        if (!contextPlaylist && state.playlist.length === 0) {
          newPlaylist = [cleanVideo];
        }
        
        const videoIdToFind = cleanVideo.id;
        const index = newPlaylist.findIndex(v => v.id === videoIdToFind);
        
        // Add to recently played (keep max 20)
        const newRecentlyPlayed = [cleanVideo, ...state.recentlyPlayed.filter(v => v.id !== cleanVideo.id)].slice(0, 20);
        
        set({ 
          currentVideo: cleanVideo, 
          isPlaying: true,
          playlist: newPlaylist,
          currentIndex: index !== -1 ? index : 0,
          recentlyPlayed: newRecentlyPlayed
        });
      },
      
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      
      playNext: () => {
        const state = get();
        if (state.playlist.length === 0) return;

        let nextIndex = state.currentIndex + 1;
        if (state.shuffle && state.playlist.length > 1) {
          const availableIndexes = state.playlist
            .map((_, index) => index)
            .filter(index => index !== state.currentIndex);
          nextIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
        } else if (nextIndex >= state.playlist.length && state.repeatMode === 'all') {
          nextIndex = 0;
        }

        if (nextIndex < 0 || nextIndex >= state.playlist.length) return;

        const nextVideo = state.playlist[nextIndex];
        const newRecentlyPlayed = [nextVideo, ...state.recentlyPlayed.filter(v => v.id !== nextVideo.id)].slice(0, 20);
        set({ currentVideo: nextVideo, currentIndex: nextIndex, isPlaying: true, recentlyPlayed: newRecentlyPlayed });
      },
      
      playPrevious: () => {
        const state = get();
        if (state.playlist.length === 0) return;

        let prevIndex = state.currentIndex - 1;
        if (prevIndex < 0 && state.repeatMode === 'all') {
          prevIndex = state.playlist.length - 1;
        }

        if (prevIndex < 0 || prevIndex >= state.playlist.length) return;

        const prevVideo = state.playlist[prevIndex];
        const newRecentlyPlayed = [prevVideo, ...state.recentlyPlayed.filter(v => v.id !== prevVideo.id)].slice(0, 20);
        set({ currentVideo: prevVideo, currentIndex: prevIndex, isPlaying: true, recentlyPlayed: newRecentlyPlayed });
      },

      addToQueue: (video) => {
        const cleanVideo = sanitizeSong(video);
        if (!cleanVideo?.id) return;
        const state = get();
        if (state.playlist.some(song => song.id === cleanVideo.id)) return;
        set({ playlist: [...state.playlist, cleanVideo] });
      },

      playNextInQueue: (video) => {
        const cleanVideo = sanitizeSong(video);
        if (!cleanVideo?.id) return;
        const state = get();
        const filteredQueue = state.playlist.filter(song => song.id !== cleanVideo.id);
        const insertIndex = Math.max(0, state.currentIndex + 1);
        const nextQueue = [
          ...filteredQueue.slice(0, insertIndex),
          cleanVideo,
          ...filteredQueue.slice(insertIndex)
        ];
        set({
          playlist: nextQueue,
          currentIndex: state.currentVideo?.id
            ? nextQueue.findIndex(song => song.id === state.currentVideo.id)
            : state.currentIndex,
        });
      },

      removeFromQueue: (videoId, queueIndex) => {
        const state = get();
        const removeIndex = typeof queueIndex === 'number'
          ? queueIndex
          : state.playlist.findIndex(song => song.id === videoId);
        if (removeIndex < 0) return;

        const nextQueue = state.playlist.filter((_, index) => index !== removeIndex);
        const removedCurrent = removeIndex === state.currentIndex;
        let nextIndex = state.currentIndex;
        let nextCurrentVideo = state.currentVideo;
        let nextIsPlaying = state.isPlaying;

        if (removedCurrent) {
          nextIndex = Math.min(removeIndex, nextQueue.length - 1);
          nextCurrentVideo = nextIndex >= 0 ? nextQueue[nextIndex] : null;
          nextIsPlaying = Boolean(nextCurrentVideo);
        } else if (removeIndex < state.currentIndex) {
          nextIndex = state.currentIndex - 1;
        }

        set({
          playlist: nextQueue,
          currentIndex: nextIndex,
          currentVideo: nextCurrentVideo,
          isPlaying: nextIsPlaying,
        });
      },

      clearQueue: () => {
        const state = get();
        if (!state.currentVideo) {
          set({ playlist: [], currentIndex: -1 });
          return;
        }

        set({
          playlist: [state.currentVideo],
          currentIndex: 0,
        });
      },

      toggleFavorite: (video) => {
        const cleanVideo = sanitizeSong(video);
        if (!cleanVideo) return;
        const state = get();
        const isFavorite = state.favorites.some(v => v.id === cleanVideo.id);
        if (isFavorite) {
          set({ favorites: state.favorites.filter(v => v.id !== cleanVideo.id) });
        } else {
          set({ favorites: [cleanVideo, ...state.favorites].slice(0, 50) });
        }
      },

      clearRecentlyPlayed: () => set({ recentlyPlayed: [] }),

      toggleAutoplay: () => set((state) => ({ autoplay: !state.autoplay })),
      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
      cycleRepeatMode: () => set((state) => ({
        repeatMode: state.repeatMode === 'off' ? 'all' : state.repeatMode === 'all' ? 'one' : 'off'
      })),
      setQuality: (quality) => set({ quality: sanitizeLibrary({ quality }).quality }),
      setLibraryFromCloud: (library) => set((state) => {
        const sanitized = sanitizeLibrary(library);

        return {
          favorites: Array.isArray(library?.favorites) ? sanitized.favorites : state.favorites,
          recentlyPlayed: Array.isArray(library?.recentlyPlayed) ? sanitized.recentlyPlayed : state.recentlyPlayed,
          playlists: Array.isArray(library?.playlists) ? sanitized.playlists : state.playlists,
          autoplay: typeof library?.autoplay === 'boolean' ? sanitized.autoplay : state.autoplay,
          shuffle: typeof library?.shuffle === 'boolean' ? sanitized.shuffle : state.shuffle,
          repeatMode: typeof library?.repeatMode === 'string' ? sanitized.repeatMode : state.repeatMode,
          quality: typeof library?.quality === 'string' ? sanitized.quality : state.quality,
        };
      }),

      createPlaylist: (name) => {
        const id = createPlaylistId();
        const newPlaylist = { id, name: sanitizePlaylistName(name), songs: [], image: null };
        set((state) => ({ playlists: [...state.playlists, newPlaylist] }));
        return id;
      },

      deletePlaylist: (id) => set((state) => ({ 
        playlists: state.playlists.filter(p => p.id !== id) 
      })),

      renamePlaylist: (id, name) => set((state) => ({
        playlists: state.playlists.map(p => p.id === id ? { ...p, name: sanitizePlaylistName(name) } : p)
      })),

      addToPlaylist: (playlistId, video) => set((state) => ({
        playlists: state.playlists.map(p => {
          const cleanVideo = sanitizeSong(video);
          if (!cleanVideo) return p;
          if (p.id === playlistId) {
            // Check if already exists
            if (p.songs.some(s => s.id === cleanVideo.id)) return p;
            return { ...p, songs: [...p.songs, cleanVideo].slice(0, 100) };
          }
          return p;
        })
      })),

      removeFromPlaylist: (playlistId, videoId) => set((state) => ({
        playlists: state.playlists.map(p => 
          p.id === playlistId ? { ...p, songs: p.songs.filter(s => s.id !== videoId) } : p
        )
      })),

      openAddToPlaylistModal: (song) => set({ isAddToPlaylistModalOpen: true, pendingSong: song }),
      closeAddToPlaylistModal: () => set({ isAddToPlaylistModalOpen: false, pendingSong: null })
    }),
    {
      name: 'melody-player-storage',
      version: 2,
      migrate: (persistedState) => sanitizeLibrary(persistedState),
      partialize: (state) => ({ 
        favorites: sanitizeSongList(state.favorites, 50), 
        recentlyPlayed: sanitizeSongList(state.recentlyPlayed, 20), 
        autoplay: state.autoplay, 
        shuffle: state.shuffle,
        repeatMode: state.repeatMode,
        quality: state.quality,
        playlists: sanitizeLibrary({ playlists: state.playlists }).playlists 
      }),
    }
  )
);
