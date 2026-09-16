import { FiPlay, FiPause } from 'react-icons/fi';
import { motion } from 'motion/react';
import { cleanText } from '../../utils/text';

const MiniPlayer = ({
  title, artist, imageUrl,
  isPlaying, played,
  isExpanded, onTogglePlay, onExpand, onTouchStart, onTouchEnd,
  miniGestureRef, pulse,
}) => (
  <div
    className={`md:hidden fixed left-0 right-0 z-[95] transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] bg-background border-t border-border/20 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] ${
      isExpanded ? 'translate-y-full pointer-events-none' : 'translate-y-0'
    }`}
    style={{ bottom: 'calc(64px + env(safe-area-inset-bottom))' }}
    onClick={() => {
      if (miniGestureRef.current) { miniGestureRef.current = false; return; }
      pulse();
      onExpand();
    }}
    onTouchStart={onTouchStart}
    onTouchEnd={onTouchEnd}
  >
    <div className="absolute top-0 left-0 right-0 h-[1px] bg-border/30">
      <div className="h-full bg-primary/50 transition-none" style={{ width: `${Math.min(Math.max(played * 100, 0), 100)}%` }} />
    </div>

    <div className="relative flex items-center px-4 gap-4 h-16 touch-pan-y">
      <div className="w-10 h-10 shrink-0 bg-surface overflow-hidden relative">
        <motion.img
          src={imageUrl}
          alt={title}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/icon-192.png'; }}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-display font-bold text-base text-primary truncate leading-tight">{cleanText(title)}</p>
        <p className="text-[10px] tracking-widest text-secondary truncate uppercase">{cleanText(artist)}</p>
      </div>

      <div className="flex items-center gap-4 pr-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => { pulse(); onTogglePlay(); }}
          className="text-primary active:scale-90 transition-all flex items-center justify-center"
        >
          {isPlaying ? <FiPause size={24} className="fill-current" /> : <FiPlay size={24} className="fill-current" />}
        </button>
      </div>
    </div>
  </div>
);

export default MiniPlayer;
