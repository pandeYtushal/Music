import React from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { FiPlay, FiPlus } from 'react-icons/fi';

const VideoGrid = ({ videos, title, horizontal = false, onShowAll }) => {
  const { setCurrentVideo, openAddToPlaylistModal } = usePlayerStore();

  if (!videos || videos.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-end justify-between mb-6">
        <h2 onClick={onShowAll} className={`text-2xl font-bold text-textPrimary tracking-tight ${onShowAll ? 'hover:underline cursor-pointer' : ''} inline-block`}>{title}</h2>
        {horizontal && onShowAll && <span onClick={onShowAll} className="text-xs font-bold text-textSecondary uppercase tracking-widest hover:text-textPrimary cursor-pointer transition-colors">Show all</span>}
      </div>
      
      <div className={horizontal 
        ? "flex overflow-x-auto gap-6 pb-6 scrollbar-hide snap-x" 
        : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:gap-6 gap-4"
      }>
        {videos.map((video, idx) => (
          <div 
            key={idx} 
            className={`group bg-surface/20 hover:bg-surface/60 rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg shadow-black/5 hover:shadow-black/20 ${horizontal ? 'min-w-[140px] max-w-[140px] sm:min-w-[180px] sm:max-w-[180px] snap-start' : ''}`}
            onClick={() => setCurrentVideo(video, videos)}
          >
            <div className={`relative overflow-hidden rounded-md mb-3 shadow-lg shadow-black/30 ${horizontal ? 'aspect-square' : 'aspect-video'}`}>
              <img 
                src={video.image && video.image.length > 2 ? video.image[2].link : (video.image?.[0]?.link || '')} 
                alt={video.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Play Button Overlay (Spotify Style: slides up) */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentVideo(video, videos); }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center text-black shadow-xl hover:scale-110 active:scale-95 transition-all"
              >
                <FiPlay className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5 sm:ml-1" />
              </button>
            </div>
            </div>
            <div>
              <h3 className="text-textPrimary font-semibold text-xs sm:text-sm line-clamp-1 group-hover:text-white transition-colors" dangerouslySetInnerHTML={{ __html: video.name }}></h3>
              <p className="text-textSecondary text-[10px] sm:text-xs mt-1.5 line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: video.primaryArtists || video.label }}></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;
