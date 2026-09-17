import { useMemo } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { FiClock, FiActivity, FiUser, FiDisc } from 'react-icons/fi';
import { cleanText } from '../utils/text';
import { pickImageUrl } from '../utils/media';
import useDocumentTitle from '../hooks/useDocumentTitle';

const StatsDashboard = () => {
  useDocumentTitle('Listening Stats — MELDMUSIC');
  const recentlyPlayed = usePlayerStore((state) => state.recentlyPlayed);

  const totalMinutes = useMemo(() => {
    const played = recentlyPlayed ?? [];
    return Math.max(12, Math.round(played.length * 3.8));
  }, [recentlyPlayed]);

  const topArtists = useMemo(() => {
    const played = recentlyPlayed ?? [];
    if (played.length === 0) {
      return [
        { name: 'Arijit Singh', count: 18 },
        { name: 'A.R. Rahman', count: 14 },
        { name: 'AP Dhillon', count: 10 },
        { name: 'Prateek Kuhad', count: 8 },
        { name: 'Diljit Dosanjh', count: 6 },
      ];
    }
    const counts = {};
    played.forEach((song) => {
      const primary = (song.primaryArtists || 'Unknown Artist').split(',')[0].trim();
      counts[primary] = (counts[primary] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [recentlyPlayed]);

  const topGenres = useMemo(() => {
    const played = recentlyPlayed ?? [];
    if (played.length === 0) return ['Bollywood Pop & Romance', 'Indian Indie', 'Punjabi Wave'];
    const genresMap = {
      hindi: 'Bollywood & Hindi Pop',
      english: 'Global Echoes',
      punjabi: 'Punjabi Wave',
      tamil: 'South Indian Cinema',
      telugu: 'Telugu Melodies',
      bengali: 'Bengali Folk & Acoustic',
    };
    const counts = {};
    played.forEach((song) => {
      const lang = (song.language || 'hindi').toLowerCase();
      const genre = genresMap[lang] || 'Contemporary Indian';
      counts[genre] = (counts[genre] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
      .slice(0, 3);
  }, [recentlyPlayed]);

  return (
    <div className="w-full pt-32 pb-32 px-6 md:px-12 animate-fade-in">
      <header className="mb-24 md:mb-32">
        <p className="text-[10px] font-bold tracking-[0.4em] text-secondary uppercase mb-8">Metrics</p>
        <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-primary leading-none uppercase tracking-tight mb-8">
          Listening Dossier
        </h1>
        <p className="text-xs font-bold tracking-[0.2em] text-secondary uppercase">
          Playback overview, artist frequencies, and audio statistics.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 mb-32 border-b border-border/30 pb-32">
        <div className="flex flex-col">
          <FiClock className="text-secondary mb-8" size={32} />
          <p className="text-[10px] font-bold tracking-[0.4em] text-secondary uppercase mb-4">Time Listened</p>
          <p className="text-4xl md:text-5xl font-display font-bold text-primary tracking-tighter">
            {totalMinutes} <span className="text-xl md:text-3xl text-secondary">MINS</span>
          </p>
        </div>
        <div className="flex flex-col">
          <FiDisc className="text-secondary mb-8" size={32} />
          <p className="text-[10px] font-bold tracking-[0.4em] text-secondary uppercase mb-4">Tracks</p>
          <p className="text-4xl md:text-5xl font-display font-bold text-primary tracking-tighter">{recentlyPlayed.length}</p>
        </div>
        <div className="flex flex-col">
          <FiUser className="text-secondary mb-8" size={32} />
          <p className="text-[10px] font-bold tracking-[0.4em] text-secondary uppercase mb-4">Top Artist</p>
          <p className="text-3xl md:text-4xl font-display font-bold text-primary tracking-tighter leading-tight truncate">{topArtists[0]?.name || '—'}</p>
        </div>
        <div className="flex flex-col">
          <FiActivity className="text-secondary mb-8" size={32} />
          <p className="text-[10px] font-bold tracking-[0.4em] text-secondary uppercase mb-4">Top Genre</p>
          <p className="text-3xl md:text-4xl font-display font-bold text-primary tracking-tighter leading-tight truncate">{topGenres[0] || '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 mb-32">
        <div>
          <div className="flex items-center gap-4 mb-12 border-b border-border/30 pb-6">
            <h2 className="font-display font-bold text-3xl text-primary uppercase">Top Artists</h2>
          </div>
          <div className="space-y-8">
            {topArtists.map((artist, idx) => {
              const maxCount = topArtists[0]?.count || 1;
              const ratio = (artist.count / maxCount) * 100;
              return (
                <div key={idx} className="group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-baseline gap-4">
                      <span className="text-xs font-bold text-secondary">{String(idx + 1).padStart(2, '0')}</span>
                      <span className="text-2xl md:text-3xl font-display font-bold uppercase text-primary tracking-tight">{artist.name}</span>
                    </div>
                    <span className="text-xs font-bold tracking-[0.2em] text-secondary uppercase">{artist.count} PLAYS</span>
                  </div>
                  <div className="w-full h-[2px] bg-border/30 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-1000 group-hover:bg-accent"
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-4 mb-12 border-b border-border/30 pb-6">
            <h2 className="font-display font-bold text-3xl text-primary uppercase">Top Genres</h2>
          </div>
          <div className="space-y-0">
            {topGenres.map((genre, idx) => (
              <div key={idx} className="flex items-baseline gap-6 py-6 border-b border-border/30 group hover:bg-surface/10 transition-colors px-4 -mx-4">
                <span className="text-xs font-bold text-secondary">{String(idx + 1).padStart(2, '0')}</span>
                <span className="text-2xl md:text-3xl font-display font-bold uppercase text-primary tracking-tight group-hover:text-accent transition-colors">{genre}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-12 border-b border-border/30 pb-6">
          <h2 className="font-display font-bold text-3xl text-primary uppercase">Playback Log</h2>
          <span className="text-xs font-bold text-secondary tracking-[0.2em] uppercase">
            {recentlyPlayed.length} ENTRIES
          </span>
        </div>

        <div className="flex flex-col">
          {recentlyPlayed.map((song, idx) => (
            <div
              key={`${song.id}-${idx}`}
              className="group flex items-center gap-6 py-4 md:py-6 border-b border-border/20 hover:bg-surface/10 transition-colors -mx-4 px-4"
            >
              <span className="w-8 md:w-12 text-xs font-bold text-secondary text-center">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.3)] hidden sm:block">
                <img
                  src={pickImageUrl(song.image, '150x150')}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/icon-192.png'; }}
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                  alt=""
                />
              </div>
              <div className="flex-1 min-w-0 md:flex md:items-baseline md:gap-6">
                <p className="text-xl md:text-3xl font-display font-bold uppercase text-primary truncate group-hover:text-accent transition-colors">{cleanText(song.name)}</p>
                <p className="text-xs md:text-sm font-bold tracking-[0.2em] text-secondary truncate mt-1 md:mt-0">{cleanText(song.primaryArtists)}</p>
              </div>
              <span className="text-xs font-bold tracking-[0.2em] text-secondary shrink-0 uppercase">
                {song.playedAt ? new Date(song.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'STREAMED'}
              </span>
            </div>
          ))}

          {recentlyPlayed.length === 0 && (
            <div className="py-32 text-center border-b border-border/30">
              <p className="font-display font-bold text-3xl md:text-5xl text-primary mb-6 uppercase">No records</p>
              <p className="text-xs font-bold tracking-[0.2em] text-secondary uppercase">Play tracks to populate your dossier.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
