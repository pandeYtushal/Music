import { useState, useMemo } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import VideoGrid from '../components/VideoGrid';
import { FiClock, FiPlay, FiTrash2, FiSearch, FiX, FiCompass } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useToast } from '../hooks/useToast';
import { formatTotalDuration } from '../utils/format';

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
  const navigate = useNavigate();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const recentlyPlayed = usePlayerStore(state => state.recentlyPlayed);
  const setCurrentVideo = usePlayerStore(state => state.setCurrentVideo);
  const clearRecentlyPlayed = usePlayerStore(state => state.clearRecentlyPlayed);
  useDocumentTitle('Recently Played');

  // Filter history based on search query
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return recentlyPlayed;
    const q = searchQuery.toLowerCase().trim();
    return recentlyPlayed.filter(song =>
      (song.name && song.name.toLowerCase().includes(q)) ||
      (song.primaryArtists && song.primaryArtists.toLowerCase().includes(q)) ||
      (song.album?.name && song.album.name.toLowerCase().includes(q))
    );
  }, [recentlyPlayed, searchQuery]);

  const groupedHistory = useMemo(() => groupHistory(filteredHistory), [filteredHistory]);
  const totalPlaybackString = useMemo(() => formatTotalDuration(recentlyPlayed), [recentlyPlayed]);

  const handleClearHistory = () => {
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
      setTimeout(() => setIsConfirmingClear(false), 4000);
      return;
    }
    clearRecentlyPlayed();
    setIsConfirmingClear(false);
    toast('Playback history cleared');
  };

  return (
    <div className="page-wrap animate-fade-up">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-7 mb-10 mt-2 w-full">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-7 text-center sm:text-left">
          <div
            className="w-36 h-36 sm:w-44 sm:h-44 shrink-0 rounded-3xl flex items-center justify-center border border-[#f4f1e8]/15 bg-white/[0.015] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-transparent blur-xl" />
            <FiClock
              size={52}
              className="text-[#d6ff42] relative z-10 animate-[pulse_4s_infinite]"
            />
          </div>

          <div>
            <p className="section-overline mb-2">Playback History</p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal text-[#f4f1e8] tracking-[-.05em] leading-none font-['Instrument_Serif'] mb-3">
              Recently Played
            </h1>
            <p className="text-[#a9a79d] text-sm font-medium mb-5">
              {recentlyPlayed.length} {recentlyPlayed.length === 1 ? 'song' : 'songs'}
              {totalPlaybackString ? ` · ${totalPlaybackString} total listening` : ''}
            </p>

            {recentlyPlayed.length > 0 && (
              <button
                onClick={() => setCurrentVideo(recentlyPlayed[0], recentlyPlayed)}
                className="btn-primary flex items-center gap-2 px-6 py-2.5 text-xs font-bold shadow-none hover:scale-[1.04] active:scale-[0.96] transition-all cursor-pointer mx-auto sm:mx-0"
              >
                <FiPlay size={14} className="fill-current" />
                Play All History
              </button>
            )}
          </div>
        </div>

        {/* Clear History Action */}
        {recentlyPlayed.length > 0 && (
          <div className="flex flex-col items-center sm:items-end gap-2 shrink-0 self-center sm:self-end">
            <button
              onClick={handleClearHistory}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold tracking-wide transition-all duration-300 active:scale-95 cursor-pointer ${
                isConfirmingClear
                  ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30'
                  : 'border-[#f4f1e8]/15 bg-transparent hover:bg-red-500/10 hover:border-red-500/30 text-[#a9a79d] hover:text-red-400'
              }`}
            >
              <FiTrash2 size={13} />
              {isConfirmingClear ? 'Confirm Clear?' : 'Clear History'}
            </button>
            {isConfirmingClear && (
              <span className="text-[10px] text-red-400/80 font-mono">Click again to wipe history</span>
            )}
          </div>
        )}
      </div>

      {/* Filter / Search Bar if history is not empty */}
      {recentlyPlayed.length > 3 && (
        <div className="mb-8 relative max-w-md">
          <div className="relative flex items-center">
            <FiSearch className="absolute left-3.5 text-[#a9a79d]" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in listening history..."
              className="w-full bg-white/[0.02] border border-[#f4f1e8]/15 rounded-full py-2 pl-10 pr-9 text-xs text-[#f4f1e8] placeholder-[#a9a79d]/50 focus:outline-none focus:border-[#d6ff42]/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-[#a9a79d] hover:text-white transition-colors"
              >
                <FiX size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="divider mb-8" />

      {filteredHistory.length > 0 ? (
        <div className="space-y-12">
          {Object.entries(groupedHistory).map(([title, videos]) => {
            if (videos.length === 0) return null;
            return (
              <div key={title} className="animate-fade-up">
                <div className="flex items-center gap-3 mb-4 px-1">
                  <span className="section-overline">{title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#a9a79d]">
                    {videos.length}
                  </span>
                </div>
                <VideoGrid videos={videos} />
              </div>
            );
          })}
        </div>
      ) : recentlyPlayed.length > 0 ? (
        /* Search Query No Results */
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-[#f4f1e8]/10 bg-white/[0.01]">
          <FiSearch size={36} className="text-[#a9a79d]/40 mb-3" />
          <h2 className="text-lg font-semibold text-[#f4f1e8] mb-1">No matching tracks found</h2>
          <p className="text-[#a9a79d] text-xs mb-4">No recent songs match "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-4 py-1.5 rounded-full border border-[#f4f1e8]/15 text-xs text-[#f4f1e8] hover:border-[#d6ff42] hover:text-[#d6ff42] transition-colors cursor-pointer"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        /* Completely Empty History State */
        <div className="flex flex-col items-center justify-center py-24 rounded-3xl border border-[#f4f1e8]/10 bg-white/[0.01] text-center px-6">
          <div className="w-16 h-16 rounded-full bg-[#d6ff42]/10 border border-[#d6ff42]/20 flex items-center justify-center mb-5 text-[#d6ff42]">
            <FiClock size={28} />
          </div>
          <h2 className="text-2xl font-normal font-['Instrument_Serif'] text-[#f4f1e8] mb-2 tracking-tight">
            No listening history yet
          </h2>
          <p className="text-[#a9a79d] text-xs max-w-sm leading-relaxed mb-6">
            Start listening to songs from Home, Search, or Playlists to automatically build your profile's playback history.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-none cursor-pointer"
          >
            <FiCompass size={15} />
            Explore Music
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentlyPlayed;
