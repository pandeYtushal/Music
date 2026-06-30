import { useMemo } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import VideoGrid from '../components/VideoGrid';
import { FiClock, FiPlay, FiTrash2 } from 'react-icons/fi';
import useDocumentTitle from '../hooks/useDocumentTitle';

const groupHistory = (history) => {
  const groups = {
    'Today': [],
    'Yesterday': [],
    'This Week': [],
    'Older': []
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 86400000 * 7;

  history.forEach(song => {
    if (!song.playedAt) {
      groups['Older'].push(song);
      return;
    }
    
    if (song.playedAt >= todayStart) {
      groups['Today'].push(song);
    } else if (song.playedAt >= yesterdayStart) {
      groups['Yesterday'].push(song);
    } else if (song.playedAt >= weekStart) {
      groups['This Week'].push(song);
    } else {
      groups['Older'].push(song);
    }
  });

  return groups;
};

const RecentlyPlayed = () => {
  const recentlyPlayed = usePlayerStore(state => state.recentlyPlayed);
  const setCurrentVideo = usePlayerStore(state => state.setCurrentVideo);
  const clearRecentlyPlayed = usePlayerStore(state => state.clearRecentlyPlayed);
  useDocumentTitle('Recently Played');

  const groupedHistory = useMemo(() => groupHistory(recentlyPlayed), [recentlyPlayed]);

  return (
    <div className="page-wrap animate-fade-up">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-7 mb-10 mt-4 w-full">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-7 text-center sm:text-left">
          <div
            className="w-40 h-40 sm:w-48 sm:h-48 shrink-0 rounded-[32px] flex items-center justify-center shadow-lg border border-white/10"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)',
              boxShadow: '0 20px 40px rgba(139, 92, 246, 0.1)',
            }}
          >
            <FiClock
              size={56}
              className="text-purple-400 relative z-10 animate-[pulse_3s_infinite]"
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
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-full border border-white/10 bg-white/[0.02] hover:bg-red-500/10 hover:border-red-500/20 text-white/50 hover:text-red-400 text-xs font-bold tracking-wide uppercase transition-all duration-300 active:scale-95 shrink-0 self-center sm:self-end"
          >
            <FiTrash2 size={13} />
            Clear History
          </button>
        )}
      </div>

      <div className="divider mb-8" />

      {recentlyPlayed.length > 0 ? (
        <div className="space-y-12">
          {Object.entries(groupedHistory).map(([title, videos]) => {
            if (videos.length === 0) return null;
            return (
              <div key={title}>
                <h2 className="text-xl font-bold text-white mb-5 tracking-tight px-1">{title}</h2>
                <VideoGrid videos={videos} />
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-28 rounded-3xl border border-white/[0.06] bg-white/[0.015]"
        >
          <FiClock size={44} className="text-white/10 mb-5 animate-pulse" />
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
