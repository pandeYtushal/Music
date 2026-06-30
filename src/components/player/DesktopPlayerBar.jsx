import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiVolume2, FiVolumeX, FiHeart, FiRepeat, FiShuffle, FiMaximize2,
} from 'react-icons/fi';
import { SeekBar, ControlButton } from './SeekBar';
import { formatDuration as fmt } from '../../utils/format';

/**
 * Desktop floating bottom player bar — hidden on mobile, visible md+.
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
    className={`hidden md:block fixed left-1/2 z-[100] w-[min(calc(100vw-3rem),1000px)] -translate-x-1/2 overflow-hidden rounded-2.5xl transition-all duration-500 ease-out ${isExpanded ? 'bottom-0 opacity-0 scale-95 pointer-events-none' : 'bottom-6 opacity-100 scale-100'}`}
    style={{
      background: 'rgba(20,20,24,0.72)',
      backdropFilter: 'blur(36px)',
      WebkitBackdropFilter: 'blur(36px)',
      border: '1px solid rgba(255,255,255,0.09)',
      boxShadow: '0 20px 48px rgba(0,0,0,0.6), 0 0 30px rgba(249,115,22,0.04)',
      height: 76,
    }}
  >
    <div className="grid h-full grid-cols-[minmax(160px,0.8fr)_minmax(260px,1.2fr)_minmax(110px,0.5fr)] lg:grid-cols-[minmax(200px,0.85fr)_minmax(320px,1.25fr)_minmax(140px,0.55fr)] items-center gap-3 px-4 lg:gap-4 lg:px-5">
      {/* Left: Track Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-lg border border-white/5 cursor-pointer hover:scale-[1.03] transition-transform duration-300"
          onClick={onExpand}
        >
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-white font-extrabold text-[13.5px] truncate leading-tight cursor-pointer hover:underline"
            onClick={onExpand}
          >
            {title}
          </p>
          <p className="text-white/45 text-[11px] font-semibold truncate mt-0.5 leading-none">
            {artist}
          </p>
        </div>
        <div className="hidden xl:flex items-center gap-1 shrink-0 ml-1">
          <button
            onClick={onToggleFav}
            className={`p-2 transition-all hover:scale-105 active:scale-95 ${isFav ? 'text-red-500' : 'text-white/20 hover:text-white/60'}`}
          >
            <FiHeart size={15} className={isFav ? 'fill-current' : ''} />
          </button>
        </div>
      </div>

      {/* Center: Progress & Controls */}
      <div className="min-w-0 flex flex-col items-center gap-1 px-2">
        <div className="flex items-center gap-4 lg:gap-5 mb-0.5">
          <ControlButton active={shuffle} onClick={onToggleShuffle}>
            <FiShuffle size={14} />
          </ControlButton>
          <button onClick={onPrev} className="text-white/50 hover:text-white transition-all active:scale-90">
            <FiSkipBack size={18} />
          </button>
          <button
            onClick={onTogglePlay}
            className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-[0_4px_16px_rgba(255,255,255,0.18)] hover:bg-white/90"
          >
            {isPlaying ? <FiPause size={16} className="fill-current" /> : <FiPlay size={16} className="fill-current ml-0.5" />}
          </button>
          <button onClick={onNext} className="text-white/50 hover:text-white transition-all active:scale-90">
            <FiSkipForward size={18} />
          </button>
          <ControlButton active={repeatMode !== 'off'} onClick={onCycleRepeat}>
            <FiRepeat size={14} />
            {repeatMode === 'one' && (
              <span className="absolute -right-1 -top-1 text-[7px] font-black leading-none bg-white text-black rounded-full px-0.5">1</span>
            )}
          </ControlButton>
        </div>
        <div className="flex items-center gap-3.5 w-full max-w-md">
          <span className="text-[9.5px] font-extrabold text-white/25 tabular-nums w-8 text-right select-none">
            {fmt(played * duration)}
          </span>
          <SeekBar refEl={seekRef} played={played} onSeekStart={onSeekStart} />
          <span className="text-[9.5px] font-extrabold text-white/25 tabular-nums w-8 select-none">
            {fmt(duration)}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 justify-end min-w-0">
        <button
          onClick={onToggleFav}
          className={`xl:hidden p-2 rounded-xl transition-all active:scale-95 ${isFav ? 'text-red-500 bg-white/[0.04]' : 'text-white/25 hover:text-white/60'}`}
        >
          <FiHeart size={15} className={isFav ? 'fill-current' : ''} />
        </button>
        <button
          onClick={onExpand}
          className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-all active:scale-95"
          title="Open full screen player"
        >
          <FiMaximize2 size={16} />
        </button>
        <div className="flex items-center gap-2 group relative">
          <button onClick={onToggleMute} className="p-2 text-white/30 hover:text-white transition-all active:scale-95">
            {isMuted || volume === 0 ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
          </button>
          <div
            ref={barVolumeRef}
            className="w-14 xl:w-18 h-[3.5px] rounded-full cursor-pointer relative hidden lg:block group bg-white/[0.08]"
            onMouseDown={(e) => onVolStart(e, barVolumeRef)}
            onTouchStart={(e) => onVolStart(e, barVolumeRef)}
          >
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-white/70 group-hover:bg-white transition-colors"
              style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white scale-0 group-hover:scale-100 transition-transform cursor-pointer"
              style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - 5px)` }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DesktopPlayerBar;
