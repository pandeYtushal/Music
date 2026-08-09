import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiVolume2, FiVolumeX, FiHeart, FiRepeat, FiShuffle, FiMaximize2,
} from 'react-icons/fi';
import { SeekBar, ControlButton } from './SeekBar';
import { formatDuration as fmt } from '../../utils/format';

/**
 * Desktop floating bottom player bar — modern sleek aesthetic with neon gradients & glassmorphism.
 */
const DesktopPlayerBar = ({
  title, artist, imageUrl,
  isPlaying, isFav, played, duration, volume, isMuted,
  shuffle, repeatMode,
  isExpanded,
  onTogglePlay, onToggleFav, onNext, onPrev,
  onToggleShuffle, onCycleRepeat,
  onExpand, onToggleMute,
  seekRef, barVolumeRef,
  onSeekStart, onVolStart,
}) => (
  <div
    className={`hidden md:block fixed left-1/2 z-[100] w-[min(calc(100vw-3rem),1180px)] -translate-x-1/2 overflow-hidden rounded-full transition-all duration-500 ease-out ${isExpanded ? 'bottom-0 opacity-0 scale-95 pointer-events-none' : 'bottom-6 opacity-100 scale-100'}`}
    style={{
      background: 'rgba(23, 23, 20, 0.92)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(244,241,232,0.15)',
      boxShadow: '0 18px 50px rgba(0,0,0,.45)',
      height: 80,
    }}
  >
    <div className="grid h-full grid-cols-[minmax(180px,0.85fr)_minmax(280px,1.3fr)_minmax(140px,0.6fr)] items-center gap-4 px-5">
      {/* Left: Track Info */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-[0_8px_20px_rgba(0,0,0,0.6)] border border-white/10 cursor-pointer hover:scale-105 transition-transform duration-300 relative group"
          onClick={onExpand}
        >
          <img src={imageUrl} alt={title} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/icon-192.png'; }} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <FiMaximize2 size={16} className="text-white" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="text-white font-extrabold text-[14px] truncate leading-tight cursor-pointer hover:text-rose-400 transition-colors"
            onClick={onExpand}
          >
            {title}
          </p>
          <p className="text-white/50 text-[11.5px] font-semibold truncate mt-1 leading-none">
            {artist}
          </p>
        </div>

        <button
          onClick={onToggleFav}
          className={`p-2 rounded-full transition-all hover:scale-110 active:scale-95 ${isFav ? 'text-rose-500 bg-rose-500/10' : 'text-white/30 hover:text-white'}`}
          title={isFav ? 'Liked' : 'Like'}
        >
          <FiHeart size={16} className={isFav ? 'fill-current' : ''} />
        </button>
      </div>

      {/* Center: Controls & Seeker */}
      <div className="min-w-0 flex flex-col items-center gap-1.5 px-2">
        <div className="flex items-center gap-5">
          <ControlButton active={shuffle} onClick={onToggleShuffle}>
            <FiShuffle size={14} />
          </ControlButton>
          <button onClick={onPrev} className="text-white/60 hover:text-white transition-all active:scale-90">
            <FiSkipBack size={18} />
          </button>
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-[#d6ff42] text-[#10100e] flex items-center justify-center hover:scale-110 active:scale-93 transition-all shadow-none"
          >
            {isPlaying ? <FiPause size={18} className="fill-current" /> : <FiPlay size={18} className="fill-current ml-0.5" />}
          </button>
          <button onClick={onNext} className="text-white/60 hover:text-white transition-all active:scale-90">
            <FiSkipForward size={18} />
          </button>
          <ControlButton active={repeatMode !== 'off'} onClick={onCycleRepeat}>
            <FiRepeat size={14} />
            {repeatMode === 'one' && (
              <span className="absolute -right-1 -top-1 text-[7px] font-black leading-none bg-rose-500 text-white rounded-full px-0.5">1</span>
            )}
          </ControlButton>
        </div>

        <div className="flex items-center gap-3 w-full max-w-md">
          <span className="text-[10px] font-bold text-white/35 tabular-nums w-8 text-right select-none">
            {fmt(played * duration)}
          </span>
          <SeekBar refEl={seekRef} played={played} onSeekStart={onSeekStart} />
          <span className="text-[10px] font-bold text-white/35 tabular-nums w-8 select-none">
            {fmt(duration)}
          </span>
        </div>
      </div>

      {/* Right: Volume & Expand */}
      <div className="flex items-center gap-3 justify-end min-w-0">
        <div className="flex items-center gap-2 group">
          <button onClick={onToggleMute} className="text-white/40 hover:text-white transition-colors">
            {isMuted || volume === 0 ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
          </button>
          <div
            ref={barVolumeRef}
            onMouseDown={(event) => onVolStart(event, barVolumeRef)}
            onTouchStart={(event) => onVolStart(event, barVolumeRef)}
            className="w-20 h-1.5 bg-white/15 rounded-full cursor-pointer relative overflow-hidden group-hover:bg-white/25 transition-all"
            role="slider"
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round((isMuted ? 0 : volume) * 100)}
          >
            <div className="h-full bg-[#d6ff42] rounded-full" style={{ width: `${(isMuted ? 0 : volume) * 100}%` }} />
          </div>
        </div>

        <button onClick={onExpand} className="p-2 text-white/40 hover:text-white transition-all hover:scale-110" title="Full Screen Player">
          <FiMaximize2 size={16} />
        </button>
      </div>
    </div>
  </div>
);

export default DesktopPlayerBar;
