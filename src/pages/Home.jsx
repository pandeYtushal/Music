import { useEffect, useState, useMemo } from 'react';
import VideoGrid from '../components/VideoGrid';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiPlus, FiSkipForward, FiArrowUpRight } from 'react-icons/fi';
import AdSense from '../components/AdSense';
import { cleanText } from '../utils/text';
import { searchSongs } from '../api/saavn';
import { pickImageUrl } from '../utils/media';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { isSongAcceptable } from '../utils/library';

const FILTER_CATEGORIES = [
  { id: 'all', label: 'For You' },
  { id: 'relax', label: 'Relax', queries: ['acoustic chill vibes', 'soft indie evening', 'lofi study beats', 'ambient piano calm'] },
  { id: 'workout', label: 'Workout', queries: ['high energy workout', 'gym pump anthems', 'fast tempo electronic', 'motivation dance hits'] },
  { id: 'party', label: 'Party', queries: ['club party bangers', 'bollywood dance floor', 'edm festival drops', 'punjabi party mashup'] },
  { id: 'romance', label: 'Romance', queries: ['slow romantic ballads', 'late night love songs', 'soulful duet hits', 'heartfelt acoustic love'] },
  { id: 'focus', label: 'Focus', queries: ['deep focus instrumental', 'concentration piano', 'ambient productivity', 'minimal lofi focus'] },
  { id: 'discover', label: 'Discover', queries: ['underrated indie gems', 'viral underground hits', 'hidden bollywood gems', 'fresh artist discoveries'] },
];

const getTimeAwareQueries = (recentArtist, favorites, recentlyPlayed) => {
  const hour = new Date().getHours();
  const mood =
    hour >= 5 && hour < 12 ? 'morning energy hits' :
    hour >= 12 && hour < 17 ? 'afternoon golden chill' :
    hour >= 17 && hour < 21 ? 'evening glow party' : 'midnight neon lofi';

  const topFavArtist = favorites?.[0]?.primaryArtists?.split(',')[0]?.trim();
  const secondRecent = recentlyPlayed?.[1]?.primaryArtists?.split(',')[0]?.trim();

  return {
    qpQuery: topFavArtist ? `${topFavArtist} mix` : mood,
    jbiQuery: recentArtist ? `${recentArtist} deep cuts` : (secondRecent ? `${secondRecent} songs` : 'bollywood deep cuts'),
  };
};

const FEATURED_PLAYLISTS = [
  { name: 'Sukoon', description: 'Soft songs for a quieter hour.', query: 'sukoon hindi lofi songs', tone: 'from-[#8b9271] via-[#343d31] to-[#161b18]', number: '01' },
  { name: 'Gym Mode', description: 'No skips. Just momentum.', query: 'gym workout hindi punjabi songs', tone: 'from-[#bc5b35] via-[#702c25] to-[#251612]', number: '02' },
  { name: 'Night Drive', description: 'After-dark songs for the road.', query: 'night drive hindi songs', tone: 'from-[#3c506e] via-[#202b3e] to-[#131722]', number: '03' },
  { name: 'Bollywood Gold', description: 'The classics you already know.', query: 'best bollywood 90s songs', tone: 'from-[#b89a4c] via-[#675225] to-[#211b11]', number: '04' },
];

const Home = () => {
  const navigate = useNavigate();
  const [rawHomeData, setRawHomeData] = useState({
    quickPicks: [], jumpBackIn: [], jumpBackInQuery: ''
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const currentVideo = usePlayerStore(state => state.currentVideo);
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const recentlyPlayed = usePlayerStore(state => state.recentlyPlayed);
  const favorites = usePlayerStore(state => state.favorites);
  const setCurrentVideo = usePlayerStore(state => state.setCurrentVideo);
  const addToQueue = usePlayerStore(state => state.addToQueue);
  const playNextInQueue = usePlayerStore(state => state.playNextInQueue);
  const { user } = useAuthStore();

  useDocumentTitle('Home');

  const recentArtist = recentlyPlayed?.[0]?.primaryArtists?.split(',')[0]?.trim() || '';

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    let greet;
    if (h >= 5 && h < 12) greet = 'Good Morning';
    else if (h >= 12 && h < 17) greet = 'Good Afternoon';
    else if (h >= 17 && h < 22) greet = 'Good Evening';
    else greet = 'Late Night';

    const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Listener';
    return `${greet}, ${firstName}`;
  }, [user]);

  const favFirstId = favorites?.[0]?.id || '';
  const recentSecondId = recentlyPlayed?.[1]?.id || '';

  useEffect(() => {
    const controller = new AbortController();

    const fetchHomeData = async () => {
      try {
        setLoading(true);
        let qpQuery, jbiQuery;

        if (activeFilter === 'all') {
          ({ qpQuery, jbiQuery } = getTimeAwareQueries(recentArtist, favorites, recentlyPlayed));
        } else {
          const cat = FILTER_CATEGORIES.find(c => c.id === activeFilter);
          qpQuery = cat.queries[0];
          jbiQuery = cat.queries[1];
        }

        // Fetch slightly more items than needed to account for filtering
        const [quickPicks, jumpBackIn] = await Promise.all([
          searchSongs(qpQuery, { limit: 20, signal: controller.signal }),
          searchSongs(jbiQuery, { limit: 15, signal: controller.signal }),
        ]);

        setRawHomeData({ 
          quickPicks: quickPicks || [], 
          jumpBackIn: jumpBackIn || [], 
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
  }, [recentArtist, activeFilter, favFirstId, recentSecondId, favorites, recentlyPlayed]);

  const currentLang = currentVideo?.language || 'hindi';
  const allowedLangs = useMemo(() => new Set(
    [currentLang, ...(recentlyPlayed || []).map(s => s.language)].filter(Boolean).map(l => l.toLowerCase())
  ), [currentLang, recentlyPlayed]);

  const filteredQuickPicks = useMemo(() => {
    const raw = rawHomeData.quickPicks || [];
    if (raw.length === 0) return [];
    const strictFiltered = raw.filter(song => isSongAcceptable(song, currentLang, allowedLangs));
    if (strictFiltered.length >= 7) {
      return strictFiltered.slice(0, 12);
    }
    const keywordOnly = raw.filter(song => isSongAcceptable(song, null, null));
    return keywordOnly.slice(0, 12);
  }, [rawHomeData.quickPicks, currentLang, allowedLangs]);

  const filteredJumpBackIn = useMemo(() => {
    const raw = rawHomeData.jumpBackIn || [];
    if (raw.length === 0) return [];
    const strictFiltered = raw.filter(song => isSongAcceptable(song, currentLang, allowedLangs));
    if (strictFiltered.length >= 4) return strictFiltered.slice(0, 8);
    const keywordOnly = raw.filter(song => isSongAcceptable(song, null, null));
    return keywordOnly.slice(0, 8);
  }, [rawHomeData.jumpBackIn, currentLang, allowedLangs]);

  const featured = filteredQuickPicks[0];

  const quickPicksGrid = useMemo(() => {
    if (!featured) return [];
    return filteredQuickPicks.filter(s => s.id !== featured.id).slice(0, 6);
  }, [filteredQuickPicks, featured]);

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

  return (
    <div className="w-full text-white overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-6 md:pt-12">
        {/* COMPACT HEADER */}
        <header className="mb-8 md:mb-10 animate-fade-up border-b border-[#f4f1e8]/15 pb-7" style={{ animationDelay: '0ms' }}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#a9a79d] font-medium mb-3">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          <h1 className="text-5xl md:text-7xl font-normal tracking-[-.05em] leading-none text-[#f4f1e8] font-['Instrument_Serif']">
          {greeting}
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
                    ? 'bg-[#d6ff42] text-[#10100e] border-[#d6ff42] shadow-none'
                    : 'bg-transparent border-[#f4f1e8]/15 text-[#a9a79d] hover:text-[#f4f1e8] hover:bg-white/[0.06] hover:border-[#f4f1e8]/35'
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
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/icon-192.png'; }}
                className="w-full h-full object-cover rounded-[40px]"
              />
            </div>

            <div
              onClick={() => setCurrentVideo(featured, filteredQuickPicks)}
              className="relative w-full overflow-hidden rounded-none border border-[#f4f1e8]/15 bg-white/[0.015] shadow-[0_32px_96px_rgba(0,0,0,0.45)] hover:border-[#f4f1e8]/35 transition-all duration-500 cursor-pointer"
              style={{ height: 'clamp(280px, 35vw, 440px)' }}
            >
              <img
                src={pickImageUrl(featured.image)}
                alt={featured.name}
                loading="lazy"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/icon-192.png'; }}
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
                  className="h-10 px-6 rounded-full bg-[#d6ff42] text-[#10100e] font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-none text-xs"
                >
                  <FiPlay size={14} className="fill-current" />
                  Play Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QUICK PICKS */}
        {quickPicksGrid.length > 0 && (
          <section 
            className="mb-10 md:mb-12 animate-fade-up"
            style={{ animationDelay: '210ms' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="section-overline mb-1">Tuned to you</p>
                <h2 className="text-lg md:text-xl font-bold tracking-tight">Quick Picks</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickPicksGrid.map((video, idx) => {
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
                      <img src={pickImageUrl(video.image)} alt="" loading="lazy" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/icon-192.png'; }} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
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
        )}

        {/* SECTIONS */}
        <div className="space-y-12 md:space-y-14">
          {recentlyPlayed?.length > 0 && (
            <div className="animate-fade-up" style={{ animationDelay: '280ms' }}>
              <VideoGrid
                videos={recentlyPlayed}
                title="Recent"
                horizontal
                onShowAll={() => navigate('/recently-played')}
              />
            </div>
          )}

          <div className="animate-fade-up" style={{ animationDelay: '350ms' }}>
            <VideoGrid
              videos={filteredJumpBackIn}
              title="More Like Your Taste"
              horizontal
              onShowAll={() => navigate(`/search?q=${rawHomeData.jumpBackInQuery || 'bollywood hits'}`)}
            />
          </div>

          <section className="pb-16 animate-fade-up" style={{ animationDelay: '420ms' }}>
            <div className="flex items-end justify-between gap-5 mb-6 border-t border-[#f4f1e8]/15 pt-5">
              <div>
                <p className="section-overline mb-2">Built for the moment</p>
                <h2 className="text-4xl md:text-5xl leading-none tracking-[-.04em] font-normal font-['Instrument_Serif'] text-[#f4f1e8]">Perfect playlists</h2>
              </div>
              <p className="hidden sm:block max-w-[220px] text-right text-sm text-[#a9a79d]">A few good places to start.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#f4f1e8]/15 border border-[#f4f1e8]/15">
              {FEATURED_PLAYLISTS.map((playlist) => (
                <button
                  key={playlist.name}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(playlist.query)}`)}
                  className={`group relative min-h-[240px] overflow-hidden bg-gradient-to-br ${playlist.tone} p-6 text-left transition-transform duration-500 hover:-translate-y-1`}
                >
                  <span className="font-['DM_Mono'] text-[10px] tracking-[.16em] text-white/55">{playlist.number}</span>
                  <FiArrowUpRight className="absolute right-5 top-5 text-[#d6ff42] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1" size={20} />
                  <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/0" />
                  <div className="relative mt-24">
                    <h3 className="font-['Instrument_Serif'] text-4xl leading-none tracking-[-.04em] text-white mb-3">{playlist.name}</h3>
                    <p className="max-w-[200px] text-sm font-medium leading-snug text-white/65">{playlist.description}</p>
                  </div>
                </button>
              ))}
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
