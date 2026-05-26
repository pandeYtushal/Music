import { create } from 'zustand';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export const useAuthStore = create((set) => ({
  user: null, // null means not logged in
  isLoading: true, // initializing firebase auth
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null });
    } catch (error) {
      console.error('Error signing out:', error);
      set({ user: null });
    }
  },
}));
