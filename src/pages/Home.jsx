import React, { useEffect, useState } from 'react';
import VideoGrid from '../components/VideoGrid';
import { usePlayerStore } from '../store/usePlayerStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiPlay, FiTrendingUp } from 'react-icons/fi';
import AdSense from '../components/AdSense';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState({
    quickPicks: [], jumpBackIn: [], recommended: [], trending: []
  });
  const [loading, setLoading] = useState(true);
  const { setCurrentVideo, recentlyPlayed } = usePlayerStore();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    if (h < 21) return 'Good Evening';
    return 'Late Night';
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const hour = new Date().getHours();
        let qpQuery = 'latest punjabi';
        if (hour >= 5 && hour < 12) qpQuery = 'morning energy hits';
        else if (hour >= 12 && hour < 17) qpQuery = 'afternoon chill bollywood';
        else if (hour >= 17 && hour < 21) qpQuery = 'evening party hits';
        else qpQuery = 'late night lofi';

        const fetch = async (query, limit) => {
          const res = await axios.get('https://jio-saavn-api-sigma.vercel.app/search/songs', { params: { query, limit } });
          return res.data?.data?.results || [];
        };
        let recQ = 'arijit singh', jbiQ = 'bollywood hits';
        if (recentlyPlayed?.length > 0) {
          if (recentlyPlayed[0]?.primaryArtists)
            recQ = recentlyPlayed[0].primaryArtists.split(',')[0].trim() + ' songs';
          if (recentlyPlayed[1]?.primaryArtists)
            jbiQ = recentlyPlayed[1].primaryArtists.split(',')[0].trim();
        }
        const [quickPicks, jumpBackIn, recommended, trending] = await Promise.all([
          fetch(qpQuery, 10),
          fetch(jbiQ, 8),
          fetch(recQ, 8),
          fetch('trending india', 10),
        ]);
        setCategories({ quickPicks, jumpBackIn, recommended, trending, recommendedQuery: recQ, jumpBackInQuery: jbiQ });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchHomeData();
    const interval = setInterval(fetchHomeData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [recentlyPlayed]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white animate-spin" />
      </div>
    );
  }

  const featured = categories.quickPicks[0];

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden pb-32 relative">
      {/* Ambient Background - Sharp & Subtle */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[350px] h-[350px] bg-purple-500/5 blur-[80px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[350px] h-[350px] bg-pink-500/5 blur-[80px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.01),transparent_25%)]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-6 md:pt-12">
        {/* COMPACT HEADER */}
        <header className="mb-8 md:mb-10">
          <p className="text-[8px] uppercase tracking-[0.25em] text-white/10 font-bold mb-1.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white/80">
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
              src={featured.image?.[2]?.link || featured.image?.[1]?.link || ''}
              alt={featured.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end items-start gap-2 md:gap-3">
              <div className="px-2.5 py-0.5 rounded-md bg-white/10 backdrop-blur-xl border border-white/10 text-[7px] uppercase tracking-widest text-white/50 font-bold">
                Featured
              </div>
              <h2
                className="text-xl md:text-4xl font-bold tracking-tight leading-tight max-w-2xl"
                dangerouslySetInnerHTML={{ __html: featured.name }}
              />
              <p
                className="text-white/30 text-[11px] md:text-sm font-medium max-w-xl line-clamp-1"
                dangerouslySetInnerHTML={{ __html: featured.primaryArtists }}
              />
              <div className="flex items-center gap-3 mt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentVideo(featured, categories.quickPicks); }}
                  className="h-9 md:h-10 px-6 rounded-full bg-white text-black font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg text-[12px] md:text-xs"
                >
                  <FiPlay size={14} className="fill-current" />
                  Play Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QUICK PICKS - HIGHER DENSITY */}
        <section className="mb-10 md:mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg md:text-xl font-bold tracking-tight">Quick Picks</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.quickPicks.slice(1, 7).map((video, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentVideo(video, categories.quickPicks)}
                className="relative overflow-hidden rounded-[18px] bg-white/[0.015] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all duration-300 p-2.5 flex items-center gap-3.5 text-left group"
              >
                <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-[12px] overflow-hidden shrink-0 shadow-sm">
                  <img src={video.image?.[2]?.link || video.image?.[1]?.link} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiPlay className="text-white fill-current" size={14} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white font-bold text-[13px] truncate mb-0.5" dangerouslySetInnerHTML={{ __html: video.name }} />
                  <p className="text-white/25 text-[10px] font-medium truncate" dangerouslySetInnerHTML={{ __html: video.primaryArtists }} />
                </div>
              </button>
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
            title="Discovery"
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
                  className="relative overflow-hidden rounded-[18px] bg-white/[0.015] border border-white/5 hover:border-purple-500/10 transition-all duration-300 p-2.5 flex items-center gap-3 cursor-pointer group"
                >
                  <span className="text-xl md:text-2xl font-bold text-white/[0.02] w-6 md:w-8 text-center group-hover:text-white/5 transition-colors">
                    {idx + 1}
                  </span>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-[10px] overflow-hidden shrink-0 shadow-sm">
                    <img src={video.image?.[2]?.link || video.image?.[1]?.link} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-white font-bold text-[13px] truncate" dangerouslySetInnerHTML={{ __html: video.name }} />
                      <div className="flex items-center gap-1 px-1 py-0.5 rounded-sm bg-purple-500/10 border border-purple-500/20 shrink-0">
                        <span className="w-1 h-1 rounded-full bg-purple-400 animate-pulse" />
                        <span className="text-[7px] font-bold text-purple-400 uppercase tracking-wider">Live</span>
                      </div>
                    </div>
                    <p className="text-white/25 text-[10px] font-medium truncate" dangerouslySetInnerHTML={{ __html: video.primaryArtists }} />
                  </div>
                  <div className="flex flex-col items-end gap-0.5 pr-2">
                    <div className="opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <FiTrendingUp className="text-purple-400/60" size={14} />
                    </div>
                    <p className="text-[8px] font-bold text-white/5 uppercase tracking-tighter tabular-nums">{(Math.random() * 50 + 10).toFixed(1)}k</p>
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
