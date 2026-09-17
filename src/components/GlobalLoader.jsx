import { motion } from 'motion/react';
import { FiRadio } from 'react-icons/fi';

const GlobalLoader = () => {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-primary/50 mb-6"
      >
        <FiRadio size={48} />
      </motion.div>
      <div className="text-secondary font-bold text-xs tracking-[0.4em] uppercase animate-pulse">
        LOADING SIGNAL
      </div>
    </div>
  );
};

export default GlobalLoader;
