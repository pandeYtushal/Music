import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null, // null means not logged in
  isLoading: true, // initializing firebase auth
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null }),
}));
