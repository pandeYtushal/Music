import { useState, useEffect } from 'react';
import { FiWifiOff } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';

const NetworkStatus = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-destructive text-destructive-foreground px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl font-bold text-xs tracking-[0.2em] uppercase"
        >
          <FiWifiOff size={16} />
          <span>You are offline. Some features may be unavailable.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NetworkStatus;
