/**
 * Shared seek bar with modern gradient fill and neon dot handle.
 */
const SeekBar = ({ refEl, played, onSeekStart }) => (
  <div
    ref={refEl}
    className="flex-1 h-[5px] rounded-full cursor-pointer relative group transition-all duration-300"
    style={{ background: 'rgba(255,255,255,0.12)' }}
    onMouseDown={(e) => onSeekStart(e, refEl)}
    onTouchStart={(e) => onSeekStart(e, refEl)}
  >
    <div
      className="absolute top-0 left-0 h-full rounded-full bg-[#d6ff42] transition-all duration-150"
      style={{ width: `${played * 100}%` }}
    />
    <div
      className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_12px_rgba(244,63,94,0.9)] scale-0 group-hover:scale-100 transition-all duration-200 cursor-pointer"
      style={{ left: `calc(${played * 100}% - 7px)` }}
    />
  </div>
);

/**
 * Toggle control button (shuffle, repeat) with active rose dot.
 */
const ControlButton = ({ active, onClick, children, className = '' }) => (
  <button
    onClick={onClick}
      className={`p-2 transition-all relative ${active ? 'text-[#d6ff42] font-bold' : 'text-white/40 hover:text-white/80'} ${className}`}
  >
    {children}
    {active && (
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#d6ff42]" />
    )}
  </button>
);

export { SeekBar, ControlButton };
