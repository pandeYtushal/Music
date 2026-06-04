import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null, // null means not logged in
  isLoading: true, // initializing firebase auth
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  logout: async () => {
    try {
      const [{ auth }, { signOut }] = await Promise.all([
        import('../firebase'),
        import('firebase/auth'),
      ]);
      await signOut(auth);
      set({ user: null });
    } catch (error) {
      console.error('Error signing out:', error);
      set({ user: null });
    }
  },
}));
