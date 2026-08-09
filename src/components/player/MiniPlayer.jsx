import {
  FiPlay, FiPause, FiHeart, FiSkipForward,
} from 'react-icons/fi';

/**
 * Mobile mini-player pill — sleek modern glass pill for mobile views.
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
    className={`md:hidden fixed left-4 right-4 z-[95] transition-all duration-500 ease-out ${isExpanded ? 'bottom-0 opacity-0 pointer-events-none' : 'bottom-[96px] opacity-100'} ${miniFeedback ? 'scale-[0.985]' : 'scale-100'}`}
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
      className="relative mx-auto max-w-[420px] min-h-[64px] flex items-center px-3.5 gap-3 shadow-[0_16px_48px_rgba(0,0,0,.45)] rounded-full border border-[#f4f1e8]/15"
      style={{
        background: 'rgba(23,23,20,.94)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        touchAction: 'pan-y',
      }}
    >
      <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 shadow-md border border-[#f4f1e8]/10">
        <img src={imageUrl} alt="" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/icon-192.png'; }} className="w-full h-full object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          {isPlaying && (
            <span className="flex items-end gap-[2px] h-3 shrink-0">
              {[8, 11, 6].map((height, idx) => (
                <span key={idx} className="w-[2px] rounded-full bg-[#d6ff42] animate-[bounce_1s_infinite]" style={{ height, animationDelay: `${idx * 0.14}s` }} />
              ))}
            </span>
          )}
          <p className="text-white font-extrabold text-[13px] truncate leading-tight">{title}</p>
        </div>
        <p className="text-white/50 text-[11px] font-semibold truncate leading-none mt-0.5">{artist}</p>
      </div>

      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => { pulse(); onToggleFav(); }}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${isFav ? 'text-rose-500 bg-rose-500/10' : 'text-white/40 hover:text-white'}`}
        >
          <FiHeart size={16} className={isFav ? 'fill-current' : ''} />
        </button>

        <button
          onClick={() => { pulse(); onTogglePlay(); }}
          className="w-10 h-10 rounded-full bg-[#d6ff42] text-[#10100e] flex items-center justify-center shadow-none active:scale-90 transition-all hover:scale-105"
        >
          {isPlaying ? <FiPause size={16} className="fill-current text-black" /> : <FiPlay size={16} className="fill-current text-black ml-0.5" />}
        </button>

        <button
          onClick={() => { pulse('swipe'); onNext(); }}
          className="hidden min-[380px]:flex w-9 h-9 rounded-full items-center justify-center text-white/40 active:scale-90 transition-all"
        >
          <FiSkipForward size={16} />
        </button>
      </div>

      {/* Sleek progress line */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5 overflow-hidden rounded-b-2xl">
        <div className="h-full bg-[#d6ff42] transition-none" style={{ width: `${played * 100}%` }} />
      </div>
    </div>
  </div>
);

export default MiniPlayer;
