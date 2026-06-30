import { create } from 'zustand';

export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (message, variant = 'success') => {
    let id;
    set((state) => {
      if (state.toasts.length > 0) {
        const existing = state.toasts[0];
        id = existing.id;
        return {
          toasts: [{ ...existing, message, variant }],
        };
      }
      id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      return {
        toasts: [{ id, message, variant }],
      };
    });
    return id;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
