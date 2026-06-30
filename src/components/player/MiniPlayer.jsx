import {
  FiPlay, FiPause, FiHeart, FiSkipForward,
} from 'react-icons/fi';

/**
 * Mobile mini-player pill — fixed above BottomNav on small screens.
 * Swipe left/right to skip, swipe up to expand.
 */
const MiniPlayer = ({
  title, artist, imageUrl,
  isPlaying, isFav, played,
  isExpanded, miniFeedback,
  onTogglePlay, onToggleFav, onNext,
  onExpand, onTouchStart, onTouchEnd,
  miniGestureRef, pulse,
}) => (
  <div
    className={`md:hidden fixed left-4 right-4 z-[95] transition-all duration-500 ease-out ${isExpanded ? 'bottom-0 opacity-0 pointer-events-none' : 'bottom-[84px] opacity-100'} ${miniFeedback ? 'scale-[0.985]' : 'scale-100'}`}
    onClick={() => {
      if (miniGestureRef.current) {
        miniGestureRef.current = false;
        return;
      }
      pulse();
      onExpand();
    }}
    onTouchStart={onTouchStart}
    onTouchEnd={onTouchEnd}
  >
    <div
      className="relative mx-auto max-w-[420px] min-h-[64px] flex items-center px-3.5 gap-3 shadow-[0_12px_40px_rgba(0,0,0,0.65)] rounded-2xl border border-white/[0.08]"
      style={{
        background: 'rgba(24,24,28,0.75)',
        backdropFilter: 'blur(36px)',
        WebkitBackdropFilter: 'blur(36px)',
        touchAction: 'pan-y',
      }}
    >
      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-md border border-white/5">
        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          {isPlaying && (
            <span className="flex items-end gap-[2px] h-3 shrink-0">
              {[8, 11, 6].map((height, idx) => (
                <span key={idx} className="w-[1.5px] rounded-full bg-white/70 animate-[bounce_1s_infinite]" style={{ height, animationDelay: `${idx * 0.14}s` }} />
              ))}
            </span>
          )}
          <p className="text-white font-bold text-[12.5px] truncate leading-tight">{title}</p>
        </div>
        <p className="text-white/45 text-[10.5px] font-semibold truncate leading-none mt-0.5">{artist}</p>
      </div>
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => { pulse(); onToggleFav(); }}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${isFav ? 'text-white bg-white/[0.07]' : 'text-white/60 hover:text-white'}`}
        >
          <FiHeart size={16} className={isFav ? 'fill-current text-red-500' : ''} />
        </button>
        <button
          onClick={() => { pulse(); onTogglePlay(); }}
          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-90 transition-all hover:scale-105"
        >
          {isPlaying ? <FiPause size={16} className="fill-current" /> : <FiPlay size={16} className="fill-current ml-0.5" />}
        </button>
        <button
          onClick={() => { pulse('swipe'); onNext(); }}
          className="hidden min-[380px]:flex w-9 h-9 rounded-full items-center justify-center text-white/35 active:scale-90 transition-all"
        >
          <FiSkipForward size={16} />
        </button>
      </div>
      {/* Progress bar line at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/[0.035] overflow-hidden rounded-b-2xl">
        <div className="h-full bg-white transition-none opacity-80" style={{ width: `${played * 100}%` }} />
      </div>
    </div>
  </div>
);

export default MiniPlayer;
