import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiVolumeX, FiShuffle, FiRepeat, FiMaximize2 } from 'react-icons/fi';
import { motion } from 'motion/react';
import { cleanText } from '../../utils/text';
import { formatDuration } from '../../utils/format';

const DesktopPlayerBar = ({
  title, artist, imageUrl, trackId,
  isPlaying, isExpanded, played, duration,
  onTogglePlay, onExpand, onNext, onPrev,
  volume, isMuted, onToggleMute, onSeekStart, onVolStart,
  seekRef, volRef, shuffle, repeatMode, onToggleShuffle, onCycleRepeat
}) => {
  return (
    <div
      className={`hidden md:grid grid-cols-[1fr_auto_1fr] fixed bottom-0 left-0 right-0 z-50 h-[84px] transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] bg-background border-t border-border/20 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] ${
        isExpanded ? 'translate-y-full pointer-events-none' : 'translate-y-0'
      }`}
      style={{ transform: isExpanded ? 'translateY(100%)' : 'translateY(0)' }}
    >
      {/* LEFT PANE - NOW PLAYING */}
      <div className="flex items-center gap-4 px-6 min-w-0 justify-self-start w-full max-w-[420px]">
        <div 
          className="w-14 h-14 shrink-0 bg-surface rounded-md overflow-hidden relative shadow-md cursor-pointer group/art border border-white/5"
          onClick={onExpand}
        >
          <motion.img
            layoutId={`player-artwork-${trackId || title}`}
            src={imageUrl}
            alt={title}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/icon-192.png'; }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/art:scale-105"
          />
        </div>

        <div className="min-w-0 flex flex-col justify-center">
          <p 
            className="text-sm font-medium text-primary truncate cursor-pointer hover:underline"
            onClick={onExpand}
          >
            {cleanText(title)}
          </p>
          <p 
            className="text-xs text-secondary truncate mt-0.5"
          >
            {cleanText(artist)}
          </p>
        </div>
      </div>

      {/* CENTER PANE - PLAYBACK & PROGRESS */}
      <div className="flex flex-col items-center justify-center w-full min-w-[400px] max-w-[600px] px-4 justify-self-center">
        <div className="flex items-center gap-6 mb-2">
          <button 
            onClick={onToggleShuffle} 
            className={`transition-colors active:scale-95 ${shuffle ? 'text-primary' : 'text-secondary hover:text-primary'}`}
            aria-label="Toggle shuffle"
          >
            <FiShuffle size={18} />
          </button>

          <button 
            onClick={onPrev} 
            className="text-secondary hover:text-primary transition-colors active:scale-95"
            aria-label="Previous track"
          >
            <FiSkipBack size={20} className="fill-current" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-11 h-11 rounded-full bg-primary text-background flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <FiPause size={20} className="fill-current" /> : <FiPlay size={20} className="fill-current ml-1" />}
          </button>

          <button 
            onClick={onNext} 
            className="text-secondary hover:text-primary transition-colors active:scale-95"
            aria-label="Next track"
          >
            <FiSkipForward size={20} className="fill-current" />
          </button>

          <button 
            onClick={onCycleRepeat} 
            className={`relative transition-colors active:scale-95 ${repeatMode !== 'off' ? 'text-primary' : 'text-secondary hover:text-primary'}`}
            aria-label="Toggle repeat"
          >
            <FiRepeat size={18} />
            {repeatMode === 'one' && (
              <span className="absolute -right-2 -top-1.5 text-[9px] font-bold text-primary">1</span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 w-full">
          <span className="text-xs text-muted font-mono w-10 text-right shrink-0 select-none">
            {formatDuration(played * (duration || 0))}
          </span>
          
          <div
            ref={seekRef}
            className="flex-1 h-4 flex items-center cursor-pointer group/seek relative"
            onMouseDown={(e) => onSeekStart(e, seekRef)}
          >
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden group-hover/seek:h-1.5 transition-all">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${Math.min(Math.max(played * 100, 0), 100)}%` }} 
              />
            </div>
            {/* Thumb */}
            <div 
              className="absolute w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover/seek:opacity-100 transition-opacity z-10 pointer-events-none"
              style={{ left: `${Math.min(Math.max(played * 100, 0), 100)}%`, transform: 'translateX(-50%)' }}
            />
          </div>
          
          <span className="text-xs text-muted font-mono w-10 shrink-0 select-none">
            {formatDuration(duration || 0)}
          </span>
        </div>
      </div>

      {/* RIGHT PANE - VOLUME & EXTRAS */}
      <div className="flex items-center justify-end gap-3 px-6 justify-self-end w-full max-w-[240px]">
        <button 
          onClick={onToggleMute} 
          className="text-secondary hover:text-primary transition-colors"
          aria-label="Volume"
        >
          {isMuted || volume === 0 ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
        </button>
        
        <div
          ref={volRef}
          className="w-24 h-4 flex items-center cursor-pointer group/vol relative"
          onMouseDown={(e) => onVolStart(e, volRef)}
        >
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden group-hover/vol:h-1.5 transition-all">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${(isMuted ? 0 : volume) * 100}%` }} 
            />
          </div>
          {/* Thumb */}
          <div 
            className="absolute w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover/vol:opacity-100 transition-opacity z-10 pointer-events-none"
            style={{ left: `${(isMuted ? 0 : volume) * 100}%`, transform: 'translateX(-50%)' }}
          />
        </div>

        <button 
          onClick={onExpand}
          className="text-secondary hover:text-primary transition-colors ml-2 active:scale-95"
          aria-label="Expand player"
        >
          <FiMaximize2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default DesktopPlayerBar;
