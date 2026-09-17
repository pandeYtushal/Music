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
      className={`hidden md:flex justify-between items-center fixed bottom-6 left-0 right-0 mx-auto w-[95%] max-w-[1000px] z-[150] h-[88px] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] bg-black/60 backdrop-blur-3xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-[2.5rem] px-3 ${
        isExpanded ? 'translate-y-[150%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}
    >
      {/* LEFT PANE - NOW PLAYING */}
      <div className="flex items-center gap-4 px-4 w-[30%] min-w-[200px]">
        <div 
          className="w-[3.25rem] h-[3.25rem] shrink-0 bg-black rounded-xl overflow-hidden relative shadow-lg cursor-pointer group/art border border-white/10"
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
            className="text-sm font-bold text-white truncate cursor-pointer hover:underline tracking-wide"
            onClick={onExpand}
          >
            {cleanText(title)}
          </p>
          <p 
            className="text-[11px] text-white/60 truncate mt-0.5 uppercase tracking-widest font-medium"
          >
            {cleanText(artist)}
          </p>
        </div>
      </div>

      {/* CENTER PANE - PLAYBACK & PROGRESS */}
      <div className="flex flex-col items-center justify-center w-[40%] max-w-[600px] px-4">
        <div className="flex items-center gap-6 mb-1.5">
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
            className="w-[2.75rem] h-[2.75rem] rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <FiPause size={22} className="fill-current" /> : <FiPlay size={22} className="fill-current ml-1" />}
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
      <div className="flex items-center justify-end gap-4 px-4 w-[30%] min-w-[200px]">
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
