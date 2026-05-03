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
      
      setCurrentVideo: (video, contextPlaylist = null) => {
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
        if (state.playlist.length > 0 && state.currentIndex < state.playlist.length - 1) {
          const nextVideo = state.playlist[state.currentIndex + 1];
          const newRecentlyPlayed = [nextVideo, ...state.recentlyPlayed.filter(v => v.id !== nextVideo.id)].slice(0, 20);
          set({ currentVideo: nextVideo, currentIndex: state.currentIndex + 1, isPlaying: true, recentlyPlayed: newRecentlyPlayed });
        }
      },
      
      playPrevious: () => {
        const state = get();
        if (state.playlist.length > 0 && state.currentIndex > 0) {
          const prevVideo = state.playlist[state.currentIndex - 1];
          const newRecentlyPlayed = [prevVideo, ...state.recentlyPlayed.filter(v => v.id !== prevVideo.id)].slice(0, 20);
          set({ currentVideo: prevVideo, currentIndex: state.currentIndex - 1, isPlaying: true, recentlyPlayed: newRecentlyPlayed });
        }
      },

      toggleFavorite: (video) => {
        const state = get();
        const isFavorite = state.favorites.some(v => v.id === video.id);
        if (isFavorite) {
          set({ favorites: state.favorites.filter(v => v.id !== video.id) });
        } else {
          set({ favorites: [video, ...state.favorites] });
        }
      }
    }),
    {
      name: 'melody-player-storage',
      partialize: (state) => ({ favorites: state.favorites, recentlyPlayed: state.recentlyPlayed }),
    }
  )
);
