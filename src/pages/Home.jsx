import { useEffect, useState } from 'react';
import VideoGrid from '../components/VideoGrid';
import { usePlayerStore } from '../store/usePlayerStore';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiPlus, FiSkipForward, FiTrendingUp } from 'react-icons/fi';
import AdSense from '../components/AdSense';
import { cleanText } from '../utils/text';
import { searchSongs } from '../api/saavn';
import { pickImageUrl } from '../utils/media';

const formatDuration = (seconds) => {
  if (!seconds || Number.isNaN(Number(seconds))) return '';
  const total = Number(seconds);
  const minutes = Math.floor(total / 60);
  const remaining = Math.floor(total % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`;
};

const getSignal = (video, idx) => {
  const seed = `${video?.id || video?.name || idx}`.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const plays = ((seed % 48) + 12).toFixed(1);
  const direction = idx < 3 ? 'Rising' : seed % 2 === 0 ? 'Steady' : 'New';
  return { plays, direction };
};

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState({
    quickPicks: [], jumpBackIn: [], recommended: [], trending: []
  });
  const [loading, setLoading] = useState(true);
  const { setCurrentVideo, recentlyPlayed, addToQueue, playNextInQueue } = usePlayerStore();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    if (h < 21) return 'Good Evening';
    return 'Late Night';
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchHomeData = async () => {
      try {
        const hour = new Date().getHours();
        let qpQuery = 'latest punjabi';
        if (hour >= 5 && hour < 12) qpQuery = 'morning energy hits';
        else if (hour >= 12 && hour < 17) qpQuery = 'afternoon chill bollywood';
        else if (hour >= 17 && hour < 21) qpQuery = 'evening party hits';
        else qpQuery = 'late night lofi';

        let recQ = 'arijit singh', jbiQ = 'bollywood hits';
        if (recentlyPlayed?.length > 0) {
          if (recentlyPlayed[0]?.primaryArtists)
            recQ = recentlyPlayed[0].primaryArtists.split(',')[0].trim() + ' songs';
          if (recentlyPlayed[1]?.primaryArtists)
            jbiQ = recentlyPlayed[1].primaryArtists.split(',')[0].trim();
        }
        const [quickPicks, jumpBackIn, recommended, trending] = await Promise.all([
          searchSongs(qpQuery, { limit: 10, signal: controller.signal }),
          searchSongs(jbiQ, { limit: 8, signal: controller.signal }),
          searchSongs(recQ, { limit: 8, signal: controller.signal }),
          searchSongs('trending india', { limit: 10, signal: controller.signal }),
        ]);
        setCategories({ quickPicks, jumpBackIn, recommended, trending, recommendedQuery: recQ, jumpBackInQuery: jbiQ });
      } catch (e) {
        if (e.name !== 'CanceledError' && e.code !== 'ERR_CANCELED') console.error(e);
      }
      finally { setLoading(false); }
    };
    fetchHomeData();
    const interval = setInterval(fetchHomeData, 60 * 60 * 1000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [recentlyPlayed]);

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

  const featured = categories.quickPicks[0];

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden pb-32 relative">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0)_240px)]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-6 md:pt-12">
        {/* COMPACT HEADER */}
        <header className="mb-8 md:mb-10">
          <p className="text-[8px] uppercase tracking-[0.25em] text-white/10 font-bold mb-1.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-white/90 to-purple-400 bg-clip-text text-transparent">
            {getGreeting()}
          </h1>
        </header>

        {/* COMPACT HERO STRIP */}
        {featured && (
          <div
            onClick={() => setCurrentVideo(featured, categories.quickPicks)}
            className="relative w-full overflow-hidden rounded-[24px] md:rounded-[32px] mb-10 md:mb-12 group border border-white/5 bg-white/[0.02] shadow-[0_12px_40px_rgba(0,0,0,0.5)] cursor-pointer"
            style={{ height: 'clamp(200px, 28vw, 400px)' }}
          >
            <img
              src={pickImageUrl(featured.image)}
              alt={featured.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end items-start gap-2 md:gap-3">
              <div className="px-2.5 py-0.5 rounded-md bg-white/10 backdrop-blur-xl border border-white/10 text-[7px] uppercase tracking-widest text-white/50 font-bold">
            On Rotation
              </div>
              <h2
                className="text-xl md:text-4xl font-bold tracking-tight leading-tight max-w-2xl"
              >
                {cleanText(featured.name, 'Featured Song')}
              </h2>
              <p className="text-white/30 text-[11px] md:text-sm font-medium max-w-xl line-clamp-1">
                {cleanText(featured.primaryArtists, 'Unknown Artist')}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentVideo(featured, categories.quickPicks); }}
                  className="h-9 md:h-10 px-6 rounded-full bg-white text-black font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg text-[12px] md:text-xs"
                >
                  <FiPlay size={14} className="fill-current" />
                  Play
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QUICK PICKS - HIGHER DENSITY */}
        <section className="mb-10 md:mb-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="section-overline mb-1">Made for now</p>
              <h2 className="text-lg md:text-xl font-bold tracking-tight">Quick Picks</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.quickPicks.slice(1, 7).map((video, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentVideo(video, categories.quickPicks)}
                className="relative overflow-hidden rounded-[18px] bg-white/[0.015] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all duration-300 p-2.5 flex items-center gap-3.5 text-left group"
              >
                <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-[12px] overflow-hidden shrink-0 shadow-sm">
                  <img src={pickImageUrl(video.image)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiPlay className="text-white fill-current" size={14} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white font-bold text-[13px] truncate mb-0.5">{cleanText(video.name, 'Unknown Song')}</p>
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
            ))}
          </div>
        </section>

        {/* SECTIONS - REDUCED GAP */}
        <div className="space-y-12 md:space-y-14">
          {recentlyPlayed?.length > 0 && (
            <VideoGrid videos={recentlyPlayed} title="Recent" horizontal />
          )}

          <VideoGrid
            videos={categories.jumpBackIn}
            title="Based on Your Listening"
            horizontal
            onShowAll={() => navigate(`/search?q=${categories.jumpBackInQuery || 'bollywood hits'}`)}
          />

          {/* TRENDING NOW - TIGHTER LIST */}
          <section className="pb-16">
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Trending Now</h2>
              <button
                onClick={() => navigate('/search?q=trending india')}
                className="text-[9px] font-bold text-white/20 hover:text-white transition-colors uppercase tracking-widest"
              >
                Full Chart
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {categories.trending.slice(0, 10).map((video, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentVideo(video, categories.trending)}
                  className="relative overflow-hidden rounded-xl bg-white/[0.015] border border-white/5 hover:border-white/10 hover:bg-white/[0.035] transition-all duration-300 p-2.5 flex items-center gap-3 cursor-pointer group"
                >
                  <span className="text-xl md:text-2xl font-bold text-white/[0.02] w-6 md:w-8 text-center group-hover:text-white/5 transition-colors">
                    {idx + 1}
                  </span>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden shrink-0 shadow-sm">
                    <img src={pickImageUrl(video.image)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-white font-bold text-[13px] truncate">{cleanText(video.name, 'Unknown Song')}</p>
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] shrink-0">
                        <FiTrendingUp className="text-white/35" size={9} />
                        <span className="text-[7px] font-bold text-white/35 uppercase tracking-wider">{getSignal(video, idx).direction}</span>
                      </div>
                    </div>
                    <p className="text-white/25 text-[10px] font-medium truncate">
                      <span>{cleanText(video.primaryArtists, 'Unknown Artist')}</span>
                      {video.duration ? <span className="text-white/15"> / {formatDuration(video.duration)}</span> : null}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 pr-2">
                    <div className="opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <FiTrendingUp className="text-white/40" size={14} />
                    </div>
                    <p className="text-[8px] font-bold text-white/10 uppercase tracking-tighter tabular-nums">{getSignal(video, idx).plays}k</p>
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
              ))}
            </div>
          </section>

        </div>

        {/* ADS - COMPACT */}
        <div className="mt-10 py-8 border-t border-white/5 opacity-10">
          <AdSense adSlot="7792854986" />
        </div>
      </div>
    </div>
  );
};

export default Home;
