import { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { pickImageUrl } from '../utils/media';

/**
 * Atmospheric background component that dynamically extracts color 
 * visually from the active artwork using heavy blurring and scale.
 */
const ArtworkAtmosphere = ({ image, isActive = true }) => {
  if (!image || !isActive) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={image}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 0.15, scale: 1.25 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden"
      >
        <img
          src={pickImageUrl(image, 'high')}
          alt="Atmosphere"
          className="w-full h-full object-cover blur-[100px] opacity-100"
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default memo(ArtworkAtmosphere);
