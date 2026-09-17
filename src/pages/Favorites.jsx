import { useMemo } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiCompass } from 'react-icons/fi';
import { formatTotalDuration, formatDuration } from '../utils/format';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { cleanText } from '../utils/text';

function TrackRow({ song, index, playlist }) {
  const setCurrentVideo = usePlayerStore((s) => s.setCurrentVideo);
  const currentVideo = usePlayerStore((s) => s.currentVideo);
  const isCurrent = currentVideo?.id === song.id;

  return (
    <div 
      className={`group flex items-baseline gap-4 py-4 md:py-6 border-b border-border/30 cursor-pointer transition-colors ${isCurrent ? 'bg-surface/30' : 'hover:bg-surface/10'}`}
      onClick={() => setCurrentVideo(song, playlist)}
    >
      <span className="text-xs font-mono font-bold text-secondary w-8 md:w-12 shrink-0">{String(index + 1).padStart(2, '0')}</span>
      <div className="min-w-0 flex-1 flex flex-col md:flex-row md:items-baseline md:gap-6">
        <span className={`font-display font-bold text-2xl md:text-3xl group-hover:text-primary transition-colors truncate ${isCurrent ? 'text-primary' : 'text-secondary'}`}>
          {cleanText(song.name)}
        </span>
        <span className="text-xs md:text-sm font-bold tracking-[0.2em] text-secondary truncate uppercase">
          {cleanText(song.album?.name, 'Single')}
        </span>
      </div>
      <div className="text-xs font-bold tracking-[0.2em] text-secondary tabular-nums ml-4 shrink-0">
        {formatDuration(song.duration)}
      </div>
    </div>
  );
}

const Favorites = () => {
  const navigate = useNavigate();
  const favorites = usePlayerStore((state) => state.favorites);
  const setCurrentVideo = usePlayerStore((state) => state.setCurrentVideo);
  useDocumentTitle('Liked Songs — MELDMUSIC');

  const totalDurationStr = useMemo(() => {
    if (!favorites || favorites.length === 0) return '';
    return formatTotalDuration(favorites);
  }, [favorites]);

  return (
    <div className="w-full pt-32 pb-32 px-6 md:px-12 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24 md:mb-32">
        <div>
          <p className="text-[10px] font-bold tracking-[0.4em] text-secondary uppercase mb-8">Favorites</p>
          <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-primary leading-none uppercase tracking-tight">
            Liked Songs
          </h1>
          <p className="text-xs font-bold tracking-[0.2em] text-secondary uppercase mt-8">
            {favorites.length} {favorites.length === 1 ? 'Track' : 'Tracks'}
            {totalDurationStr ? ` • ${totalDurationStr} RUNTIME` : ''}
          </p>
        </div>
        {favorites.length > 0 && (
          <button
            onClick={() => setCurrentVideo(favorites[0], favorites)}
            className="flex items-center gap-3 px-8 py-4 bg-primary text-background text-sm font-bold tracking-[0.2em] uppercase hover:bg-accent transition-colors self-start md:self-auto active:scale-95"
          >
            <FiPlay size={20} className="fill-current" />
            PLAY ALL
          </button>
        )}
      </header>

      {favorites.length > 0 ? (
        <div className="flex flex-col">
          {favorites.map((song, i) => (
            <TrackRow key={song.id} song={song} index={i} playlist={favorites} />
          ))}
        </div>
      ) : (
        <div className="py-32 text-center">
          <p className="font-display font-bold text-3xl md:text-5xl text-primary mb-6">No liked songs yet</p>
          <p className="text-xs font-bold tracking-[0.2em] text-secondary uppercase mb-12">Tap the heart icon to save tracks.</p>
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

export default Favorites;
