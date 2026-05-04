import React, { useEffect, useState } from 'react';
import VideoGrid from '../components/VideoGrid';
import { usePlayerStore } from '../store/usePlayerStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiPlay } from 'react-icons/fi';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState({
    quickPicks: [],
    jumpBackIn: [],
    recommended: [],
    trending: []
  });
  const [loading, setLoading] = useState(true);
  const { setCurrentVideo, recentlyPlayed } = usePlayerStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "GM bestie ✨";
    if (hour < 17) return "Vibe check 🎧";
    if (hour < 21) return "Main character energy 💅";
    return "Late night feels 🌙";
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const fetchCategory = async (query, limit) => {
          const res = await axios.get('https://jiosaavn-api-privatecvc2.vercel.app/search/songs', {
            params: { query, limit }
          });
          return res.data?.data?.results || [];
        };

        // Use recently played to personalize
        let recommendedQuery = 'arijit singh';
        let jumpBackInQuery = 'bollywood hits';
        
        if (recentlyPlayed && recentlyPlayed.length > 0) {
           const lastPlayed = recentlyPlayed[0];
           if (lastPlayed.primaryArtists) {
              recommendedQuery = lastPlayed.primaryArtists.split(',')[0].trim() + ' songs';
           }
           if (recentlyPlayed.length > 1 && recentlyPlayed[1].primaryArtists) {
              jumpBackInQuery = recentlyPlayed[1].primaryArtists.split(',')[0].trim();
           }
        }

        const [quickPicks, jumpBackIn, recommended, trending] = await Promise.all([
          fetchCategory('latest punjabi', 6),
          fetchCategory(jumpBackInQuery, 6),
          fetchCategory(recommendedQuery, 6),
          fetchCategory('hip hop', 6)
        ]);

        setCategories({ quickPicks, jumpBackIn, recommended, trending, recommendedQuery, jumpBackInQuery });
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-40 md:pb-32 relative min-h-full">
      {/* Dynamic Background Gradient (Spotify Style) */}
      <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-b from-primary/30 via-background to-background pointer-events-none -z-10 transition-colors duration-1000"></div>

      <h1 className="text-3xl md:text-4xl font-bold text-textPrimary mb-6 tracking-tight drop-shadow-md">{getGreeting()}</h1>

      {/* Hero Banner */}
      {categories.quickPicks.length > 0 && (
        <div 
          onClick={() => setCurrentVideo(categories.quickPicks[0], categories.quickPicks)}
          className="relative w-full h-64 sm:h-72 md:h-80 rounded-3xl overflow-hidden mb-10 cursor-pointer group shadow-2xl shadow-primary/10 border border-white/5"
        >
          <img 
            src={categories.quickPicks[0].image?.[2]?.link || categories.quickPicks[0].image?.[1]?.link || ''} 
            alt={categories.quickPicks[0].name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-90"></div>
          <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
            <span className="text-primary font-bold tracking-widest uppercase text-xs sm:text-sm mb-2 drop-shadow-md">Featured Mix</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2 line-clamp-1 drop-shadow-lg" dangerouslySetInnerHTML={{ __html: categories.quickPicks[0].name }}></h2>
            <p className="text-textSecondary text-sm sm:text-base line-clamp-1 max-w-lg drop-shadow-md" dangerouslySetInnerHTML={{ __html: categories.quickPicks[0].primaryArtists }}></p>
            <div className="mt-6 flex items-center gap-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
              <button className="bg-primary text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                <FiPlay className="fill-current" /> Play Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redesigned Quick Picks */}
      {categories.quickPicks.slice(1, 7).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
          {categories.quickPicks.slice(1, 7).map((video, idx) => (
            <div 
              key={idx} 
              className="group flex items-center bg-surface/30 backdrop-blur-md hover:bg-surface/60 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer border border-white/5 hover:border-white/20 hover:-translate-y-1 shadow-lg shadow-black/10"
              onClick={() => setCurrentVideo(video, categories.quickPicks)}
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 min-w-[4rem] sm:min-w-[5rem] flex-shrink-0 m-2 rounded-xl overflow-hidden shadow-md">
                <img 
                  src={video.image?.[1]?.link || video.image?.[0]?.link || ''} 
                  alt={video.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <FiPlay className="text-white drop-shadow-lg" size={20} />
                </div>
              </div>
              <div className="p-3 sm:p-4 flex-1 overflow-hidden flex items-center justify-between">
                <div>
                  <h3 className="text-textPrimary font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors" dangerouslySetInnerHTML={{ __html: video.name }}></h3>
                  <p className="text-textSecondary text-[10px] sm:text-xs line-clamp-1 mt-1" dangerouslySetInnerHTML={{ __html: video.primaryArtists }}></p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2">
                   <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                     <FiPlay size={16} className="ml-1 fill-current" />
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recently Played */}
      {recentlyPlayed && recentlyPlayed.length > 0 && (
        <VideoGrid videos={recentlyPlayed} title="Recently Played" horizontal />
      )}

      {/* Horizontal Carousels */}
      <VideoGrid videos={categories.jumpBackIn} title="Jump Back In" horizontal onShowAll={() => navigate(`/search?q=${categories.jumpBackInQuery || 'bollywood hits'}`)} />
      <VideoGrid videos={categories.recommended} title="Made For You" horizontal onShowAll={() => navigate(`/search?q=${categories.recommendedQuery || 'arijit singh'}`)} />
      
      {/* Trending List View */}
      {categories.trending.length > 0 && (
        <div className="mb-12">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl font-bold text-textPrimary tracking-tight">Trending Now</h2>
            <span onClick={() => navigate('/search?q=hip hop')} className="text-xs font-bold text-textSecondary uppercase tracking-widest hover:text-textPrimary cursor-pointer transition-colors">See All</span>
          </div>
          <div className="flex flex-col gap-3">
            {categories.trending.slice(0, 5).map((video, idx) => (
              <div 
                key={idx}
                onClick={() => setCurrentVideo(video, categories.trending)}
                className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-surface/40 transition-colors cursor-pointer border border-transparent hover:border-white/5"
              >
                <span className="text-textSecondary font-bold text-sm w-4 text-right group-hover:text-primary">{idx + 1}</span>
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md">
                  <img src={video.image?.[1]?.link || ''} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <FiPlay className="text-white fill-current" size={16} />
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-textPrimary font-semibold text-sm truncate group-hover:text-primary transition-colors" dangerouslySetInnerHTML={{ __html: video.name }}></h4>
                  <p className="text-textSecondary text-xs truncate" dangerouslySetInnerHTML={{ __html: video.primaryArtists }}></p>
                </div>
                <div className="hidden sm:block text-textSecondary text-xs">
                  {video.playCount ? `${(parseInt(video.playCount) / 1000000).toFixed(1)}M plays` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Home;
