import { FiPlay, FiPause } from 'react-icons/fi';

/**
 * Shared seek bar used in both the desktop bar and full-screen player.
 * Rendered outside Player to avoid unnecessary remounts.
 */
const SeekBar = ({ refEl, played, onSeekStart }) => (
  <div
    ref={refEl}
    className="flex-1 h-[5px] rounded-full cursor-pointer relative group transition-all duration-300"
    style={{ background: 'rgba(255,255,255,0.1)' }}
    onMouseDown={(e) => onSeekStart(e, refEl)}
    onTouchStart={(e) => onSeekStart(e, refEl)}
  >
    <div
      className="absolute top-0 left-0 h-full rounded-full bg-white transition-all duration-150 shadow-[0_0_8px_rgba(255,255,255,0.35)]"
      style={{ width: `${played * 100}%` }}
    />
    <div
      className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-2xl scale-0 group-hover:scale-100 md:group-hover:scale-100 transition-all duration-200 cursor-pointer"
      style={{ left: `calc(${played * 100}% - 7px)` }}
    />
  </div>
);

/**
 * Toggle-style control button (shuffle, repeat, etc.)
 * Shows a small dot indicator when active.
 */
const ControlButton = ({ active, onClick, children, className = '' }) => (
  <button
    onClick={onClick}
    className={`p-2 transition-colors relative ${active ? 'text-white' : 'text-white/40 hover:text-white/80'} ${className}`}
  >
    {children}
    {active && (
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
    )}
  </button>
);

/**
 * Format seconds into "m:ss" display string.
 */
const fmt = (s) => {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
};

export { SeekBar, ControlButton, fmt };
