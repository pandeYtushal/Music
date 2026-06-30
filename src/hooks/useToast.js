import { useCallback } from 'react';
import { useToastStore } from '../store/useToastStore';

export const useToast = () => {
  const addToast = useToastStore((s) => s.addToast);
  const toast = useCallback(
    (message, variant) => addToast(message, variant),
    [addToast],
  );
  return toast;
};
