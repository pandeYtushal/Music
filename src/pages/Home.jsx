import { useEffect, useState, useMemo } from 'react';
import VideoGrid from '../components/VideoGrid';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiPlus, FiSkipForward, FiTrendingUp } from 'react-icons/fi';
import AdSense from '../components/AdSense';
import { cleanText } from '../utils/text';
import { formatDuration } from '../utils/format';
import { searchSongs } from '../api/saavn';
import { pickImageUrl } from '../utils/media';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { isSongAcceptable } from '../utils/library';

const FILTER_CATEGORIES = [
  { id: 'all', label: 'For You' },
  { id: 'relax', label: 'Relax', queries: ['acoustic hindi chill', 'lofi chill study', 'meditation ambient', 'relaxing instrumental'] },
  { id: 'workout', label: 'Workout', queries: ['workout dance energy', 'electronic fitness', 'fast tempo workout', 'gym motivation'] },
  { id: 'party', label: 'Party', queries: ['party dance music', 'bollywood party hits', 'edm club mixes', 'punjabi dance hits'] },
  { id: 'romance', label: 'Romance', queries: ['romantic songs hindi', 'love hits english', 'melodious romantic', 'latest love songs'] },
  { id: 'focus', label: 'Focus', queries: ['deep focus instrumental', 'classical piano background', 'ambient focus study', 'lofi beats focus'] }
];

const Home = () => {
  const navigate = useNavigate();
  const [rawHomeData, setRawHomeData] = useState({
    quickPicks: [], jumpBackIn: [], trending: [], jumpBackInQuery: ''
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const currentVideo = usePlayerStore(state => state.currentVideo);
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const recentlyPlayed = usePlayerStore(state => state.recentlyPlayed);
  const setCurrentVideo = usePlayerStore(state => state.setCurrentVideo);
  const addToQueue = usePlayerStore(state => state.addToQueue);
  const playNextInQueue = usePlayerStore(state => state.playNextInQueue);
  const { user } = useAuthStore();

  useDocumentTitle('Home');

  const recentArtist = recentlyPlayed?.[0]?.primaryArtists?.split(',')[0]?.trim() || '';

  const getGreeting = () => {
    const h = new Date().getHours();
    let greet;
    if (h >= 5 && h < 12) greet = 'Good Morning';
    else if (h >= 12 && h < 17) greet = 'Good Afternoon';
    else if (h >= 17 && h < 22) greet = 'Good Evening';
    else greet = 'Late Night';

    const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Listener';
    return `${greet}, ${firstName}`;
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchHomeData = async () => {
      try {
        setLoading(true);
        let qpQuery, jbiQuery, trendQuery;

        if (activeFilter === 'all') {
          const hour = new Date().getHours();
          qpQuery = hour >= 5 && hour < 12 ? 'morning energy hits' :
                    hour >= 12 && hour < 17 ? 'afternoon chill bollywood' :
                    hour >= 17 && hour < 21 ? 'evening party hits' : 'late night lofi';

          jbiQuery = recentArtist ? `${recentArtist} songs` : 'bollywood hits';
          trendQuery = 'trending hindi hits';
        } else {
          const cat = FILTER_CATEGORIES.find(c => c.id === activeFilter);
          qpQuery = cat.queries[0];
          jbiQuery = cat.queries[1];
          trendQuery = cat.queries[3];
        }

        // Fetch slightly more items than needed to account for filtering
        const [quickPicks, jumpBackIn, trending] = await Promise.all([
          searchSongs(qpQuery, { limit: 20, signal: controller.signal }),
          searchSongs(jbiQuery, { limit: 15, signal: controller.signal }),
          searchSongs(trendQuery, { limit: 20, signal: controller.signal }),
        ]);

        setRawHomeData({ 
          quickPicks: quickPicks || [], 
          jumpBackIn: jumpBackIn || [], 
          trending: trending || [], 
          jumpBackInQuery: jbiQuery 
        });
      } catch (e) {
        if (e.name !== 'CanceledError' && e.code !== 'ERR_CANCELED') console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
    const interval = setInterval(fetchHomeData, 60 * 60 * 1000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [recentArtist, activeFilter]);

  const currentLang = currentVideo?.language || 'hindi';
  const allowedLangs = useMemo(() => new Set(
    [currentLang, ...(recentlyPlayed || []).map(s => s.language)].filter(Boolean).map(l => l.toLowerCase())
  ), [currentLang, recentlyPlayed]);

  const filteredQuickPicks = useMemo(() => 
    (rawHomeData.quickPicks || []).filter(song => isSongAcceptable(song, currentLang, allowedLangs)).slice(0, 10),
    [rawHomeData.quickPicks, currentLang, allowedLangs]
  );
  const filteredJumpBackIn = useMemo(() => 
    (rawHomeData.jumpBackIn || []).filter(song => isSongAcceptable(song, currentLang, allowedLangs)).slice(0, 8),
    [rawHomeData.jumpBackIn, currentLang, allowedLangs]
  );
  const filteredTrending = useMemo(() => 
    (rawHomeData.trending || []).filter(song => isSongAcceptable(song, currentLang, allowedLangs)).slice(0, 10),
    [rawHomeData.trending, currentLang, allowedLangs]
  );

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-8 md:pt-12 pb-40 animate-fade-up">
        <div className="h-4 w-28 rounded-full skeleton mb-3" />
        <div className="h-9 w-48 rounded-full skeleton mb-8" />
        <div className="h-[240px] md:h-[340px] rounded-2xl skeleton mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(item => (
            <div key={item} className="flex items-center gap-3.5 p-2.5 rounded-2xl border border-white/[0.05] bg-white/[0.015]">
              <div className="w-14 h-14 rounded-xl skeleton shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 rounded-full skeleton w-2/3" />
                <div className="h-2.5 rounded-full skeleton w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const featured = filteredQuickPicks[0];

  return (
    <div className="w-full text-white overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-6 md:pt-12">
        {/* COMPACT HEADER */}
        <header className="mb-6 md:mb-8 animate-fade-up" style={{ animationDelay: '0ms' }}>
          <p className="text-[8px] uppercase tracking-[0.25em] text-white/10 font-bold mb-1.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-white/90 to-purple-400 bg-clip-text text-transparent">
            {getGreeting()}
          </h1>
        </header>

        {/* CATEGORY FILTER PILLS */}
        <div 
          className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide animate-fade-up"
          style={{ animationDelay: '70ms' }}
        >
          {FILTER_CATEGORIES.map((cat) => {
            const isActive = activeFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all duration-300 whitespace-nowrap border shrink-0 hover:scale-[1.04] active:scale-[0.96] cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white border-transparent shadow-[0_8px_24px_rgba(249,115,22,0.25)]'
                    : 'bg-white/[0.03] border-white/[0.06] text-white/55 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.15]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* COMPACT HERO STRIP WITH AMBIENT ARTWORK AURA */}
        {featured && (
          <div 
            className="relative mb-10 md:mb-14 group/hero animate-fade-up"
            style={{ animationDelay: '140ms' }}
          >
            {/* Ambient artwork shadow reflection */}
            <div className="absolute inset-4 rounded-[40px] pointer-events-none opacity-40 blur-[60px] scale-[0.98] transition-all duration-1000 group-hover/hero:scale-100 group-hover/hero:opacity-65 -z-10">
              <img
                src={pickImageUrl(featured.image)}
                alt=""
                className="w-full h-full object-cover rounded-[40px]"
              />
            </div>

            <div
              onClick={() => setCurrentVideo(featured, filteredQuickPicks)}
              className="relative w-full overflow-hidden rounded-[2.5xl] md:rounded-[4xl] border border-white/[0.08] bg-white/[0.015] shadow-[0_32px_96px_rgba(0,0,0,0.7)] hover:border-white/20 transition-all duration-500 cursor-pointer"
              style={{ height: 'clamp(280px, 35vw, 440px)' }}
            >
              <img
                src={pickImageUrl(featured.image)}
                alt={featured.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover/hero:scale-[1.03]"
              />
              {/* Overlay shading to focus on the text card */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent hidden md:block" />

              {/* Floating Glassmorphic Text Card */}
              <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-10 p-6 md:p-8 rounded-[2.5xl] backdrop-blur-3xl bg-black/30 border border-white/12 max-w-[min(90vw,480px)] shadow-[0_24px_50px_rgba(0,0,0,0.6)] transition-all duration-500 group-hover/hero:border-white/20 group-hover/hero:bg-black/40">
                <div className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-purple-500 border border-white/10 text-[8px] uppercase tracking-widest text-white font-extrabold w-fit mb-3 shadow-md">
                  On Rotation
                </div>
                <h2 className="text-xl md:text-3xl font-black tracking-tight leading-tight text-white mb-1.5 line-clamp-2">
                  {cleanText(featured.name, 'Featured Song')}
                </h2>
                <p className="text-white/60 text-xs md:text-sm font-semibold mb-4 line-clamp-1">
                  {cleanText(featured.primaryArtists, 'Unknown Artist')}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentVideo(featured, filteredQuickPicks); }}
                  className="h-10 px-6 rounded-full bg-white text-black font-extrabold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md text-xs hover:bg-orange-500 hover:text-white"
                >
                  <FiPlay size={14} className="fill-current" />
                  Play Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QUICK PICKS */}
        <section 
          className="mb-10 md:mb-12 animate-fade-up"
          style={{ animationDelay: '210ms' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="section-overline mb-1">Made for now</p>
              <h2 className="text-lg md:text-xl font-bold tracking-tight">Quick Picks</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredQuickPicks.slice(1, 7).map((video, idx) => {
              const isCurrent = video.id === currentVideo?.id;

              return (
                <div
                  key={idx}
                  onClick={() => setCurrentVideo(video, filteredQuickPicks)}
                  className={`relative overflow-hidden rounded-2xl bg-white/[0.01] border transition-all duration-500 p-2.5 flex items-center gap-3.5 text-left group cursor-pointer ${
                    isCurrent 
                      ? 'border-orange-500/25 bg-orange-500/[0.02] shadow-[0_8px_24px_rgba(249,115,22,0.06)]' 
                      : 'border-white/[0.05] hover:border-white/[0.15] hover:bg-white/[0.04] hover:shadow-[0_12px_32px_rgba(0,0,0,0.45)] hover:translate-y-[-3px]'
                  }`}
                >
                  {/* Hover Left Indicator Line */}
                  <div className={`absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-orange-500 to-purple-500 transition-opacity duration-300 ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

                  <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-[12px] overflow-hidden shrink-0 shadow-sm">
                    <img src={pickImageUrl(video.image)} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-all ${isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      {isCurrent && isPlaying ? (
                        <div className="flex items-end gap-[2px] h-3.5">
                          {[6, 12, 8].map((h, i) => (
                            <span key={i} className="w-[2px] rounded-full bg-orange-400 animate-[bounce_1s_infinite]" style={{ height: h, animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      ) : (
                        <FiPlay className="text-white fill-current" size={14} />
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-bold text-[13px] truncate mb-0.5 ${isCurrent ? 'text-orange-400' : 'text-white'}`}>{cleanText(video.name, 'Unknown Song')}</p>
                    <p className="text-white/25 text-[10px] font-medium truncate">{cleanText(video.primaryArtists, 'Unknown Artist')}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button
                      title="Play next"
                      onClick={() => playNextInQueue(video)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white/25 hover:text-white hover:bg-white/[0.06] transition-all"
                    >
                      <FiSkipForward size={15} />
                    </button>
                    <button
                      title="Add to queue"
                      onClick={() => addToQueue(video)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white/25 hover:text-white hover:bg-white/[0.06] transition-all"
                    >
                      <FiPlus size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTIONS */}
        <div className="space-y-12 md:space-y-14">
          {recentlyPlayed?.length > 0 && (
            <div className="animate-fade-up" style={{ animationDelay: '280ms' }}>
              <VideoGrid videos={recentlyPlayed} title="Recent" horizontal />
            </div>
          )}

          <div className="animate-fade-up" style={{ animationDelay: '350ms' }}>
            <VideoGrid
              videos={filteredJumpBackIn}
              title="Based on Your Listening"
              horizontal
              onShowAll={() => navigate(`/search?q=${rawHomeData.jumpBackInQuery || 'bollywood hits'}`)}
            />
          </div>

          {/* TRENDING NOW - LEADERBOARD */}
          <section 
            className="pb-16 animate-fade-up"
            style={{ animationDelay: '420ms' }}
          >
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-orange-500/80 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Global Top</p>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">Trending Now</h2>
              </div>
              <button
                onClick={() => navigate('/search?q=trending india')}
                className="px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-[10px] font-bold text-white/60 hover:text-white hover:bg-white/[0.08] transition-all uppercase tracking-widest cursor-pointer"
              >
                Full Chart
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5">
              {filteredTrending.slice(0, 10).map((video, idx) => {
                const isTop3 = idx < 3;
                const isCurrent = video.id === currentVideo?.id;
                const rankColor =
                  idx === 0 ? 'text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-yellow-500 drop-shadow-[0_4px_12px_rgba(250,204,21,0.25)]' :
                  idx === 1 ? 'text-transparent bg-clip-text bg-gradient-to-br from-slate-200 to-slate-400 drop-shadow-[0_4px_12px_rgba(203,213,225,0.25)]' :
                  idx === 2 ? 'text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-orange-600 drop-shadow-[0_4px_12px_rgba(251,146,60,0.25)]' :
                  'text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-white/5';

                return (
                  <div
                    key={idx}
                    onClick={() => setCurrentVideo(video, filteredTrending)}
                    className={`relative overflow-hidden rounded-2.5xl transition-all duration-500 p-3.5 flex items-center gap-4 cursor-pointer group border ${
                      isCurrent 
                        ? 'border-orange-500/25 bg-orange-500/[0.02] shadow-[0_8px_24px_rgba(249,115,22,0.06)]' 
                        : isTop3 
                          ? 'bg-white/[0.012] border-white/[0.06] hover:border-white/22 hover:bg-white/[0.035] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] hover:translate-y-[-2px]' 
                          : 'bg-transparent border-transparent hover:bg-white/[0.025] hover:border-white/[0.08] hover:translate-y-[-1px]'
                    }`}
                  >
                    {/* Left Border Highlight for Top 3 */}
                    {(isTop3 || isCurrent) && (
                      <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-orange-400 to-purple-500 transition-opacity duration-300" />
                    )}

                    <span className={`text-3xl md:text-5xl font-black w-10 md:w-14 text-center select-none text-stroke-gradient ${rankColor}`}>
                      {idx + 1}
                    </span>

                    <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden shrink-0 shadow-lg">
                      <img src={pickImageUrl(video.image)} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-all ${isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {isCurrent && isPlaying ? (
                          <div className="flex items-end gap-[3px] h-4">
                            {[8, 14, 10].map((h, i) => (
                              <span key={i} className="w-[3px] rounded-full bg-orange-400 animate-[bounce_1s_infinite]" style={{ height: h, animationDelay: `${i * 0.15}s` }} />
                            ))}
                          </div>
                        ) : (
                          <FiPlay className="text-white fill-current" size={16} />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 py-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-bold text-[14px] md:text-[15px] truncate group-hover:text-orange-100 transition-colors ${isCurrent ? 'text-orange-400' : 'text-white'}`}>{cleanText(video.name, 'Unknown Song')}</p>
                        {isTop3 && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 shrink-0">
                            <FiTrendingUp className="text-orange-400" size={9} />
                            <span className="text-[8px] font-bold text-orange-400 uppercase tracking-widest">Hot</span>
                          </div>
                        )}
                      </div>
                      <p className="text-white/40 text-[11px] font-medium truncate">
                        <span>{cleanText(video.primaryArtists, 'Unknown Artist')}</span>
                        {video.duration ? <span className="text-white/20"> &bull; {formatDuration(video.duration)}</span> : null}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pr-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        title="Play next"
                        onClick={() => playNextInQueue(video)}
                        className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 text-white/60 hover:text-white hover:bg-white/20 transition-all shadow-lg backdrop-blur-md"
                      >
                        <FiSkipForward size={14} />
                      </button>
                      <button
                        title="Add to queue"
                        onClick={() => addToQueue(video)}
                        className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 text-white/60 hover:text-white hover:bg-white/20 transition-all shadow-lg backdrop-blur-md"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>

        {/* ADS */}
        <div className="mt-10 py-8 border-t border-white/5 animate-fade-up" style={{ animationDelay: '490ms' }}>
          <AdSense adSlot="7792854986" />
        </div>
      </div>
    </div>
  );
};

export default Home;
