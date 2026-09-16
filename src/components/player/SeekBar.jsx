const SeekBar = ({ refEl, played, onSeekStart, className = '' }) => (
  <div
    ref={refEl}
    className={`flex-1 h-1 hover:h-2 rounded-none cursor-pointer relative group transition-all duration-200 bg-white/20 ${className}`}
    onMouseDown={(e) => onSeekStart(e, refEl)}
    onTouchStart={(e) => onSeekStart(e, refEl)}
    role="slider"
    aria-label="Seek position"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(played * 100)}
  >
    <div
      className="absolute top-0 left-0 h-full bg-primary transition-all duration-75 flex items-center justify-end"
      style={{ width: `${Math.min(Math.max(played * 100, 0), 100)}%` }}
    >
      <div className="w-3 h-3 bg-white rounded-full shadow-md translate-x-1/2 scale-100 group-hover:scale-125 transition-transform" />
    </div>
  </div>
);

const ControlButton = ({ active, onClick, children, title, className = '' }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 transition-colors duration-200 relative flex items-center justify-center ${
      active
        ? 'text-primary'
        : 'text-secondary hover:text-primary'
    } ${className}`}
  >
    {children}
    {active && (
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary" />
    )}
  </button>
);

export { SeekBar, ControlButton };
