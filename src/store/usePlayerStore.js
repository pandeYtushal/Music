import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
        let newPlaylist = contextPlaylist || state.playlist;
        
        if (!contextPlaylist && state.playlist.length === 0) {
          newPlaylist = [video];
        }
        
        const videoIdToFind = video.id;
        const index = newPlaylist.findIndex(v => v.id === videoIdToFind);
        
        // Add to recently played (keep max 20)
        const newRecentlyPlayed = [video, ...state.recentlyPlayed.filter(v => v.id !== video.id)].slice(0, 20);
        
        set({ 
          currentVideo: video, 
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
        if (!video?.id) return;
        const state = get();
        if (state.playlist.some(song => song.id === video.id)) return;
        set({ playlist: [...state.playlist, video] });
      },

      playNextInQueue: (video) => {
        if (!video?.id) return;
        const state = get();
        const filteredQueue = state.playlist.filter(song => song.id !== video.id);
        const insertIndex = Math.max(0, state.currentIndex + 1);
        const nextQueue = [
          ...filteredQueue.slice(0, insertIndex),
          video,
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
        const state = get();
        const isFavorite = state.favorites.some(v => v.id === video.id);
        if (isFavorite) {
          set({ favorites: state.favorites.filter(v => v.id !== video.id) });
        } else {
          set({ favorites: [video, ...state.favorites] });
        }
      },

      toggleAutoplay: () => set((state) => ({ autoplay: !state.autoplay })),
      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
      cycleRepeatMode: () => set((state) => ({
        repeatMode: state.repeatMode === 'off' ? 'all' : state.repeatMode === 'all' ? 'one' : 'off'
      })),
      setQuality: (quality) => set({ quality }),
      setLibraryFromCloud: (library) => set((state) => ({
        favorites: Array.isArray(library?.favorites) ? library.favorites : state.favorites,
        recentlyPlayed: Array.isArray(library?.recentlyPlayed) ? library.recentlyPlayed : state.recentlyPlayed,
        playlists: Array.isArray(library?.playlists) ? library.playlists : state.playlists,
        autoplay: typeof library?.autoplay === 'boolean' ? library.autoplay : state.autoplay,
        shuffle: typeof library?.shuffle === 'boolean' ? library.shuffle : state.shuffle,
        repeatMode: ['off', 'all', 'one'].includes(library?.repeatMode) ? library.repeatMode : state.repeatMode,
        quality: library?.quality || state.quality,
      })),

      createPlaylist: (name) => {
        const id = 'playlist_' + Date.now();
        const newPlaylist = { id, name, songs: [], image: null };
        set((state) => ({ playlists: [...state.playlists, newPlaylist] }));
        return id;
      },

      deletePlaylist: (id) => set((state) => ({ 
        playlists: state.playlists.filter(p => p.id !== id) 
      })),

      renamePlaylist: (id, name) => set((state) => ({
        playlists: state.playlists.map(p => p.id === id ? { ...p, name } : p)
      })),

      addToPlaylist: (playlistId, video) => set((state) => ({
        playlists: state.playlists.map(p => {
          if (p.id === playlistId) {
            // Check if already exists
            if (p.songs.some(s => s.id === video.id)) return p;
            return { ...p, songs: [...p.songs, video] };
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
      partialize: (state) => ({ 
        favorites: state.favorites, 
        recentlyPlayed: state.recentlyPlayed, 
        autoplay: state.autoplay, 
        shuffle: state.shuffle,
        repeatMode: state.repeatMode,
        quality: state.quality,
        playlists: state.playlists 
      }),
    }
  )
);
