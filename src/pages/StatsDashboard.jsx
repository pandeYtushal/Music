import { useMemo } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { FiClock, FiMusic, FiTrendingUp, FiActivity, FiUser } from 'react-icons/fi';
import { cleanText } from '../utils/text';
import { pickImageUrl } from '../utils/media';
import useDocumentTitle from '../hooks/useDocumentTitle';

const StatsDashboard = () => {
  useDocumentTitle('Listening Statistics');
  const recentlyPlayed = usePlayerStore(state => state.recentlyPlayed);

  // Compute mock stats based on recentlyPlayed or defaults
  const totalMinutes = useMemo(() => {
    const played = recentlyPlayed ?? [];
    return Math.max(12, played.length * 3.5);
  }, [recentlyPlayed]);

  const topArtists = useMemo(() => {
    const played = recentlyPlayed ?? [];
    if (played.length === 0) {
      return [
        { name: 'Pritam', count: 12 },
        { name: 'Arijit Singh', count: 9 },
        { name: 'The Weeknd', count: 6 }
      ];
    }
    const counts = {};
    played.forEach(song => {
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
    if (played.length === 0) return ['Bollywood Pop', 'Acoustic Chill', 'EDM'];
    const genresMap = {
      hindi: 'Bollywood Pop',
      english: 'Global Pop/EDM',
      punjabi: 'Punjabi Dance Hits',
      tamil: 'South Indian Melody'
    };
    const counts = {};
    played.forEach(song => {
      const lang = (song.language || 'hindi').toLowerCase();
      const genre = genresMap[lang] || 'Global Hits';
      counts[genre] = (counts[genre] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
      .slice(0, 3);
  }, [recentlyPlayed]);

  return (
    <div className="page-wrap animate-fade-up">
      <div className="mb-8">
        <p className="section-overline">Dashboard</p>
        <h1 className="section-heading">Listening Stats</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2.5xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.025] transition-all">
          <FiClock className="text-orange-500 mb-3" size={20} />
          <p className="text-[10px] uppercase tracking-wider text-white/35 font-bold mb-1">Time Listened</p>
          <p className="text-xl md:text-2xl font-black text-white">{Math.round(totalMinutes)} <span className="text-xs font-bold text-white/45">Mins</span></p>
        </div>

        <div className="p-5 rounded-2.5xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.025] transition-all">
          <FiMusic className="text-purple-400 mb-3" size={20} />
          <p className="text-[10px] uppercase tracking-wider text-white/35 font-bold mb-1">Songs Streamed</p>
          <p className="text-xl md:text-2xl font-black text-white">{recentlyPlayed.length} <span className="text-xs font-bold text-white/45">Tracks</span></p>
        </div>

        <div className="p-5 rounded-2.5xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.025] transition-all">
          <FiUser className="text-cyan-400 mb-3" size={20} />
          <p className="text-[10px] uppercase tracking-wider text-white/35 font-bold mb-1">Favorite Artist</p>
          <p className="text-xl md:text-2xl font-black text-white truncate">{topArtists[0]?.name || 'None'}</p>
        </div>

        <div className="p-5 rounded-2.5xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.025] transition-all">
          <FiActivity className="text-pink-400 mb-3" size={20} />
          <p className="text-[10px] uppercase tracking-wider text-white/35 font-bold mb-1">Primary Vibe</p>
          <p className="text-xl md:text-2xl font-black text-white truncate">{topGenres[0] || 'Chilled Out'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Top Artists Leaderboard */}
        <div className="p-6 rounded-3xl border border-white/[0.08] bg-white/[0.01]">
          <h2 className="text-sm font-black uppercase tracking-wider text-white/40 mb-5 flex items-center gap-2">
            <FiUser size={16} /> Top Artists
          </h2>
          <div className="space-y-4">
            {topArtists.map((artist, idx) => {
              const maxCount = topArtists[0]?.count || 1;
              const ratio = (artist.count / maxCount) * 100;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white/80">{artist.name}</span>
                    <span className="text-white/40">{artist.count} plays</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-purple-600 transition-all duration-1000"
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Favorite Genres List */}
        <div className="p-6 rounded-3xl border border-white/[0.08] bg-white/[0.01]">
          <h2 className="text-sm font-black uppercase tracking-wider text-white/40 mb-5 flex items-center gap-2">
            <FiTrendingUp size={16} /> Top Genres
          </h2>
          <div className="space-y-3">
            {topGenres.map((genre, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center text-xs font-bold text-orange-500">{idx + 1}</span>
                  <span className="text-xs font-black text-white/80">{genre}</span>
                </div>
                <span className="text-[10px] font-black uppercase text-orange-500/80 bg-orange-500/5 px-2.5 py-1 rounded-full">Streamed</span>
              </div>
            ))}
            {topGenres.length === 0 && (
              <p className="text-xs text-white/35 text-center py-10">Stream tracks to generate genre statistics.</p>
            )}
          </div>
        </div>
      </div>

      {/* Playback History Row list */}
      <div>
        <h2 className="text-lg font-black tracking-tight text-white mb-5 flex items-center gap-2">
          <FiClock size={18} /> Stream Log History
        </h2>
        <div className="space-y-1.5">
          {recentlyPlayed.map((song, idx) => (
            <div 
              key={`${song.id}-${idx}`}
              className="flex items-center gap-3.5 p-2.5 rounded-2xl hover:bg-white/[0.035] border border-transparent hover:border-white/[0.05] transition-all duration-300"
            >
              <span className="w-6 text-[11px] font-bold text-white/20 text-center">{idx + 1}</span>
              <img src={pickImageUrl(song.image)} className="w-10 h-10 rounded-xl object-cover" alt="" />
              <div className="min-w-0 flex-1 text-left">
                <p className="text-xs font-black text-white truncate">{cleanText(song.name)}</p>
                <p className="text-[10.5px] text-white/40 font-semibold truncate mt-0.5">{cleanText(song.primaryArtists)}</p>
              </div>
              <span className="text-[10px] text-white/35 font-bold tracking-tight">
                {song.playedAt ? new Date(song.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </span>
            </div>
          ))}
          {recentlyPlayed.length === 0 && (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-[32px] bg-white/[0.01]">
              <FiClock size={36} className="mx-auto text-white/10 mb-4 animate-pulse" />
              <p className="text-white/35 font-semibold text-xs uppercase tracking-wider">No streaming logs yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
