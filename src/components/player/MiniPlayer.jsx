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
    className={`md:hidden fixed left-0 right-0 z-[100] transition-all duration-500 ease-out ${isExpanded ? 'bottom-0 opacity-0 pointer-events-none' : 'bottom-[75px] opacity-100'} ${miniFeedback ? 'scale-[0.985]' : 'scale-100'}`}
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
      className="relative mx-auto max-w-[460px] min-h-[70px] flex items-center px-4 gap-3 shadow-[0_-8px_34px_rgba(0,0,0,0.45)]"
      style={{
background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))',
        backdropFilter: 'blur(34px)',
        WebkitBackdropFilter: 'blur(34px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.035)',
        touchAction: 'pan-y',
      }}
    >
      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-lg border border-white/5">
        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          {isPlaying && (
            <span className="flex items-end gap-[2px] h-3 shrink-0">
              {[8, 11, 6].map((height, idx) => (
                <span key={idx} className="w-[2px] rounded-full bg-white/70 animate-[bounce_1s_infinite]" style={{ height, animationDelay: `${idx * 0.14}s` }} />
              ))}
            </span>
          )}
          <p className="text-white font-bold text-[13px] truncate leading-tight">{title}</p>
        </div>
        <p className="text-white text-[11px] font-medium truncate mt-0.5">{artist}</p>
      </div>
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => { pulse(); onToggleFav(); }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${isFav ? 'text-white bg-white/[0.07]' : 'text-white'}`}
        >
          <FiHeart size={18} className={isFav ? 'fill-current' : ''} />
        </button>
        <button
          onClick={() => { pulse(); onTogglePlay(); }}
          className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-90 transition-all hover:bg-white/90"
        >
          {isPlaying ? <FiPause size={20} className="fill-current" /> : <FiPlay size={20} className="fill-current ml-0.5" />}
        </button>
        <button
          onClick={() => { pulse('swipe'); onNext(); }}
          className="hidden min-[390px]:flex w-10 h-10 rounded-full items-center justify-center text-white/35 active:scale-90 transition-all"
        >
          <FiSkipForward size={18} />
        </button>
      </div>
      {/* Progress bar line at the bottom of the mini player pill */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/[0.035] overflow-hidden">
        <div className="h-full bg-white transition-none opacity-80" style={{ width: `${played * 100}%` }} />
      </div>
    </div>
  </div>
);

export default MiniPlayer;
