import { usePlayerStore } from '../store/usePlayerStore';
import VideoGrid from '../components/VideoGrid';
import { FiClock, FiPlay, FiTrash2 } from 'react-icons/fi';

const RecentlyPlayed = () => {
  const { recentlyPlayed, setCurrentVideo, clearRecentlyPlayed } = usePlayerStore();

  return (
    <div className="page-wrap animate-fade-up">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-7 mb-10 mt-4 w-full">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-7 text-center sm:text-left">
          <div
            className="w-40 h-40 sm:w-52 sm:h-52 shrink-0 rounded-3xl flex items-center justify-center shadow-lift relative group"
            style={{
              background: 'linear-gradient(145deg, #1f1c2c, #0b0a10)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="absolute inset-0 bg-purple-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity pointer-events-none" />
            <FiClock
              size={60}
              className="text-white relative z-10"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(255,255,255,0.15))' }}
            />
          </div>

          <div>
            <p className="section-overline">Playback History</p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-white/90 to-purple-400 bg-clip-text text-transparent tracking-tight leading-tight mb-3">
              Recently Played
            </h1>
            <p className="text-white/40 text-sm font-medium mb-5">
              Your Profile &nbsp;·&nbsp; {recentlyPlayed.length} {recentlyPlayed.length === 1 ? 'song' : 'songs'}
            </p>
            {recentlyPlayed.length > 0 && (
              <button
                onClick={() => setCurrentVideo(recentlyPlayed[0], recentlyPlayed)}
                className="btn-primary flex items-center gap-2.5 px-6 py-3 text-sm mx-auto sm:mx-0"
              >
                <FiPlay size={15} className="fill-current" />
                Play All
              </button>
            )}
          </div>
        </div>

        {/* Clear History Action */}
        {recentlyPlayed.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear your playback history?")) {
                clearRecentlyPlayed();
              }
            }}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-red-500/10 hover:border-red-500/20 text-white/50 hover:text-red-400 text-xs font-bold tracking-wide uppercase transition-all duration-300 active:scale-95 shrink-0 self-center sm:self-end"
          >
            <FiTrash2 size={13} />
            Clear History
          </button>
        )}
      </div>

      <div className="divider mb-8" />

      {recentlyPlayed.length > 0 ? (
        <VideoGrid videos={recentlyPlayed} />
      ) : (
        <div
          className="flex flex-col items-center justify-center py-36 rounded-3xl"
          style={{
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid rgba(255,255,255,0.03)',
          }}
        >
          <FiClock size={48} className="text-white/10 mb-5 animate-pulse" />
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">No listening history yet</h2>
          <p className="text-white/35 text-sm font-medium text-center max-w-xs leading-relaxed">
            Start listening to songs from Home or Search to build your profile's playback history.
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentlyPlayed;
