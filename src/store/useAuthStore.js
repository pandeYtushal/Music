import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_PROFILE = {
  uid: 'local',
  displayName: 'Listener',
  email: null,
  photoURL: null,
};

export const useAuthStore = create(
  persist(
    (set) => ({
      user: DEFAULT_PROFILE,
      isLoading: false,
      setUser: (user) => set({ user: user || DEFAULT_PROFILE }),
      setDisplayName: (displayName) =>
        set((state) => ({
          user: {
            ...(state.user || DEFAULT_PROFILE),
            displayName: String(displayName || 'Listener').trim().slice(0, 40) || 'Listener',
          },
        })),
      setIsLoading: (isLoading) => set({ isLoading }),
      // Local-only app — no remote sign-out; reset display name only
      logout: () => set({ user: DEFAULT_PROFILE }),
    }),
    {
      name: 'melody-local-profile',
      partialize: (state) => ({
        user: {
          uid: 'local',
          displayName: state.user?.displayName || 'Listener',
          email: null,
          photoURL: null,
        },
      }),
    },
  ),
);
