import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';
import { FiPlay, FiTrash2, FiSearch, FiX, FiCompass } from 'react-icons/fi';
import { formatTotalDuration, formatDuration } from '../utils/format';
import { useToast } from '../hooks/useToast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { cleanText } from '../utils/text';
import { pickImageUrl } from '../utils/media';

const groupHistory = (history) => {
  const groups = {
    'Today': [],
    'Yesterday': [],
    'Earlier This Week': [],
    'Older': [],
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 86400000 * 7;

  history.forEach((song) => {
    if (!song.playedAt) {
      groups['Older'].push(song);
      return;
    }

    if (song.playedAt >= todayStart) {
      groups['Today'].push(song);
    } else if (song.playedAt >= yesterdayStart) {
      groups['Yesterday'].push(song);
    } else if (song.playedAt >= weekStart) {
      groups['Earlier This Week'].push(song);
    } else {
      groups['Older'].push(song);
    }
  });

  return groups;
};

function TrackRow({ song, playlist }) {
  const setCurrentVideo = usePlayerStore((s) => s.setCurrentVideo);
  const currentVideo = usePlayerStore((s) => s.currentVideo);
  const isCurrent = currentVideo?.id === song.id;

  return (
    <div 
      className={`group flex items-baseline gap-4 py-4 md:py-6 border-b border-border/30 cursor-pointer transition-colors ${isCurrent ? 'bg-surface/30' : 'hover:bg-surface/10'}`}
      onClick={() => setCurrentVideo(song, playlist)}
    >
      <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.3)] hidden sm:block self-center">
         <img src={pickImageUrl(song.image, '150x150')} alt={song.name} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
      </div>
      <div className="min-w-0 flex-1 flex flex-col md:flex-row md:items-baseline md:gap-6 sm:ml-4">
        <span className={`font-display font-bold text-2xl md:text-3xl group-hover:text-primary transition-colors truncate ${isCurrent ? 'text-primary' : 'text-secondary'}`}>
          {cleanText(song.name)}
        </span>
        <span className="text-xs md:text-sm font-bold tracking-[0.2em] text-secondary truncate uppercase">
          {cleanText(song.album?.name, 'Single')}
        </span>
      </div>
      <div className="text-xs font-bold tracking-[0.2em] text-secondary tabular-nums ml-4 shrink-0 self-center">
        {formatDuration(song.duration)}
      </div>
    </div>
  );
}

const RecentlyPlayed = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const recentlyPlayed = usePlayerStore((state) => state.recentlyPlayed);
  const setCurrentVideo = usePlayerStore((state) => state.setCurrentVideo);
  const clearRecentlyPlayed = usePlayerStore((state) => state.clearRecentlyPlayed);
  useDocumentTitle('Recently Played — MELDMUSIC');

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return recentlyPlayed;
    const q = searchQuery.toLowerCase().trim();
    return recentlyPlayed.filter(
      (song) =>
        (song.name && song.name.toLowerCase().includes(q)) ||
        (song.primaryArtists && song.primaryArtists.toLowerCase().includes(q)) ||
        (song.album?.name && song.album.name.toLowerCase().includes(q)),
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
    <div className="w-full pt-32 pb-32 px-6 md:px-12 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24 md:mb-32">
        <div>
          <p className="text-[10px] font-bold tracking-[0.4em] text-secondary uppercase mb-8">History</p>
          <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-primary leading-none uppercase tracking-tight">
            Recently Played
          </h1>
          <p className="text-xs font-bold tracking-[0.2em] text-secondary uppercase mt-8">
            {recentlyPlayed.length} {recentlyPlayed.length === 1 ? 'Track' : 'Tracks'}
            {totalPlaybackString ? ` • ${totalPlaybackString} listening time` : ''}
          </p>
        </div>
        <div className="flex flex-col gap-4 self-start md:self-auto w-full md:w-auto">
          {recentlyPlayed.length > 0 && (
            <>
              <button
                onClick={() => setCurrentVideo(recentlyPlayed[0], recentlyPlayed)}
                className="flex items-center gap-3 px-8 py-4 bg-primary text-background text-sm font-bold tracking-[0.2em] uppercase hover:bg-accent transition-colors active:scale-95 justify-center"
              >
                <FiPlay size={20} className="fill-current" />
                PLAY ALL
              </button>
              <button
                onClick={handleClearHistory}
                className={`flex items-center gap-3 px-8 py-4 border text-sm font-bold tracking-[0.2em] uppercase transition-colors justify-center active:scale-95 ${
                  isConfirmingClear
                    ? 'bg-primary text-background border-primary'
                    : 'border-border/50 text-secondary hover:text-primary hover:border-primary'
                }`}
              >
                <FiTrash2 size={20} />
                {isConfirmingClear ? 'CONFIRM CLEAR?' : 'CLEAR HISTORY'}
              </button>
            </>
          )}
        </div>
      </header>

      {recentlyPlayed.length > 4 && (
        <div className="mb-24 md:mb-32 relative max-w-2xl">
          <div className="relative flex items-center border-b-2 border-border/30 focus-within:border-primary transition-colors duration-300">
            <FiSearch className="text-secondary mr-6" size={32} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH HISTORY..."
              className="w-full py-6 md:py-8 bg-transparent font-display font-bold text-3xl md:text-5xl text-primary outline-none placeholder:text-border/50 uppercase tracking-tight"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-4 text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                <FiX size={32} />
              </button>
            )}
          </div>
        </div>
      )}

      {filteredHistory.length > 0 ? (
        <div className="space-y-24 md:space-y-32">
          {Object.entries(groupedHistory).map(([groupTitle, videos]) => {
            if (videos.length === 0) return null;
            return (
              <div key={groupTitle}>
                <div className="flex items-center justify-between border-b border-border/30 pb-6 mb-12">
                  <h2 className="font-display font-bold text-3xl text-primary uppercase">{groupTitle}</h2>
                  <span className="text-xs font-bold tracking-[0.2em] text-secondary uppercase">
                    {videos.length} {videos.length === 1 ? 'track' : 'tracks'}
                  </span>
                </div>
                <div className="flex flex-col">
                  {videos.map((song, i) => (
                    <TrackRow key={`${song.id}-${i}`} song={song} index={i} playlist={videos} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : recentlyPlayed.length > 0 ? (
        <div className="py-32 text-center">
          <p className="font-display font-bold text-3xl md:text-5xl text-primary mb-6">No matching history</p>
          <p className="text-xs font-bold tracking-[0.2em] text-secondary uppercase mb-12">No tracks match "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery('')}
            className="inline-flex items-center gap-3 px-8 py-4 border border-primary text-primary text-sm font-bold tracking-[0.2em] uppercase hover:bg-primary hover:text-background transition-colors active:scale-95"
          >
            CLEAR SEARCH
          </button>
        </div>
      ) : (
        <div className="py-32 text-center">
          <p className="font-display font-bold text-3xl md:text-5xl text-primary mb-6">No playback history yet</p>
          <p className="text-xs font-bold tracking-[0.2em] text-secondary uppercase mb-12">Start listening to build your history.</p>
          <button
            onClick={() => navigate('/home')}
            className="inline-flex items-center gap-3 px-8 py-4 border border-primary text-primary text-sm font-bold tracking-[0.2em] uppercase hover:bg-primary hover:text-background transition-colors active:scale-95"
          >
            <FiCompass size={20} />
            EXPLORE MUSIC
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentlyPlayed;
