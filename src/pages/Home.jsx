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
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
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

        const [quickPicks, jumpBackIn, recommended, trending] = await Promise.all([
          fetchCategory('latest punjabi', 6),
          fetchCategory('bollywood hits', 6),
          fetchCategory('arijit singh', 6),
          fetchCategory('hip hop', 6)
        ]);

        setCategories({ quickPicks, jumpBackIn, recommended, trending });
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
    <div className="p-4 sm:p-6 md:p-8 pb-32 relative min-h-full">
      {/* Dynamic Background Gradient (Spotify Style) */}
      <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-b from-primary/30 via-background to-background pointer-events-none -z-10 transition-colors duration-1000"></div>

      <h1 className="text-3xl md:text-4xl font-bold text-textPrimary mb-8 tracking-tight drop-shadow-md">{getGreeting()}</h1>

      {/* Quick Picks - Spotify Style Top Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
        {categories.quickPicks.map((video, idx) => (
          <div 
            key={idx} 
            className="group flex items-center bg-surface/40 hover:bg-surface/80 rounded-md overflow-hidden transition-all duration-300 cursor-pointer border border-transparent hover:border-white/10 shadow-sm"
            onClick={() => setCurrentVideo(video, categories.quickPicks)}
          >
            <div className="relative w-20 h-20 min-w-[5rem] flex-shrink-0 shadow-lg">
              <img 
                src={video.image?.[1]?.link || video.image?.[0]?.link || ''} 
                alt={video.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <FiPlay className="text-white drop-shadow-lg" size={20} />
              </div>
            </div>
            <div className="p-4 flex-1 overflow-hidden flex items-center justify-between">
              <div>
                <h3 className="text-textPrimary font-bold text-sm line-clamp-2 group-hover:text-white drop-shadow-sm" dangerouslySetInnerHTML={{ __html: video.name }}></h3>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2">
                 <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                   <FiPlay size={18} className="text-black ml-1 fill-current" />
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recently Played */}
      {recentlyPlayed && recentlyPlayed.length > 0 && (
        <VideoGrid videos={recentlyPlayed} title="Recently Played" horizontal />
      )}

      {/* Horizontal Carousels */}
      <VideoGrid videos={categories.jumpBackIn} title="Top Bollywood Hits" horizontal onShowAll={() => navigate('/search?q=bollywood hits')} />
      <VideoGrid videos={categories.recommended} title="Punjabi Chartbusters" horizontal onShowAll={() => navigate('/search?q=latest punjabi')} />
      <VideoGrid videos={categories.trending} title="Desi Hip Hop & Trending" horizontal onShowAll={() => navigate('/search?q=hip hop')} />
      
    </div>
  );
};

export default Home;
