import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiVolume2, FiVolumeX, FiHeart, FiRepeat, FiShuffle, FiMaximize2,
} from 'react-icons/fi';
import { SeekBar, ControlButton, fmt } from './SeekBar';

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
    className={`hidden md:block fixed left-1/2 z-[100] w-[min(calc(100vw-2rem),1040px)] -translate-x-1/2 overflow-hidden rounded-3xl transition-all duration-500 ease-out ${isExpanded ? 'bottom-0 opacity-0 scale-95 pointer-events-none' : 'bottom-6 opacity-100 scale-100'}`}
    style={{
      background: 'linear-gradient(135deg, rgba(15,15,15,0.92) 0%, rgba(8,8,8,0.96) 100%)',
      backdropFilter: 'blur(45px)',
      WebkitBackdropFilter: 'blur(45px)',
      border: '1px solid rgba(255,255,255,0.09)',
      boxShadow: '0 24px 60px rgba(0,0,0,0.65), 0 0 40px rgba(249,115,22,0.06)',
      height: 80,
    }}
  >
    <div className="grid h-full grid-cols-[minmax(170px,0.85fr)_minmax(280px,1.15fr)_minmax(116px,0.55fr)] lg:grid-cols-[minmax(210px,0.9fr)_minmax(340px,1.2fr)_minmax(150px,0.6fr)] items-center gap-3 px-4 lg:gap-4 lg:px-5">
      {/* Left: Track Info */}
      <div className="flex items-center gap-3 lg:gap-4 min-w-0">
        <div
          className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-2xl border border-white/5 cursor-pointer"
          onClick={onExpand}
        >
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-white font-bold text-[14px] truncate leading-tight cursor-pointer hover:underline"
            onClick={onExpand}
          >
            {title}
          </p>
          <p className="text-white/40 text-[12px] font-medium truncate mt-0.5">
            {artist}
          </p>
        </div>
        <div className="hidden xl:flex items-center gap-1 shrink-0 ml-1">
          <button
            onClick={onToggleFav}
            className={`p-2 transition-colors ${isFav ? 'text-white' : 'text-white/20 hover:text-white/60'}`}
          >
            <FiHeart size={16} className={isFav ? 'fill-current' : ''} />
          </button>
        </div>
      </div>

      {/* Center: Progress & Controls */}
      <div className="min-w-0 flex flex-col items-center gap-1.5 px-2">
        <div className="flex items-center gap-4 lg:gap-5 mb-0.5">
          <ControlButton active={shuffle} onClick={onToggleShuffle}>
            <FiShuffle size={16} />
          </ControlButton>
          <button onClick={onPrev} className="text-white/60 hover:text-white transition-colors active:scale-90">
            <FiSkipBack size={20} />
          </button>
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_4px_16px_rgba(255,255,255,0.25)] hover:bg-white/90"
          >
            {isPlaying ? <FiPause size={18} className="fill-current" /> : <FiPlay size={18} className="fill-current ml-0.5" />}
          </button>
          <button onClick={onNext} className="text-white/60 hover:text-white transition-colors active:scale-90">
            <FiSkipForward size={20} />
          </button>
          <ControlButton active={repeatMode !== 'off'} onClick={onCycleRepeat}>
            <FiRepeat size={16} />
            {repeatMode === 'one' && (
              <span className="absolute -right-1 -top-1 text-[8px] font-black leading-none">1</span>
            )}
          </ControlButton>
        </div>
        <div className="flex items-center gap-3 w-full max-w-md">
          <span className="text-[10px] font-bold text-white/25 tabular-nums w-8 text-right">
            {fmt(played * duration)}
          </span>
          <SeekBar refEl={seekRef} played={played} onSeekStart={onSeekStart} />
          <span className="text-[10px] font-bold text-white/25 tabular-nums w-8">
            {fmt(duration)}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 lg:gap-2 justify-end min-w-0">
        <button
          onClick={onToggleFav}
          className={`xl:hidden p-2.5 rounded-xl transition-colors ${isFav ? 'text-white bg-white/[0.06]' : 'text-white/25 hover:text-white/60'}`}
        >
          <FiHeart size={17} className={isFav ? 'fill-current' : ''} />
        </button>
        <button
          onClick={onExpand}
          className="p-2.5 text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          title="Open full screen player"
        >
          <FiMaximize2 size={18} />
        </button>
        <div className="flex items-center gap-3 group relative">
          <button onClick={onToggleMute} className="p-2.5 text-white/30 hover:text-white transition-all">
            {isMuted || volume === 0 ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
          </button>
          <div
            ref={barVolumeRef}
            className="w-14 xl:w-20 h-1 rounded-full cursor-pointer relative hidden lg:block group"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            onMouseDown={(e) => onVolStart(e, barVolumeRef)}
            onTouchStart={(e) => onVolStart(e, barVolumeRef)}
          >
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-white/80"
              style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white scale-0 group-hover:scale-100 transition-transform cursor-pointer"
              style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - 6px)` }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DesktopPlayerBar;
