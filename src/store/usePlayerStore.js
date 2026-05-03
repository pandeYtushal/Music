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
      quality: '320kbps',
      playlists: [],
      isAddToPlaylistModalOpen: false,
      pendingSong: null,
      
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
      },

      toggleAutoplay: () => set((state) => ({ autoplay: !state.autoplay })),
      setQuality: (quality) => set({ quality }),

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
        quality: state.quality,
        playlists: state.playlists 
      }),
    }
  )
);
