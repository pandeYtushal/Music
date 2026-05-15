import React from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { FiPlay } from 'react-icons/fi';

const VideoGrid = ({ videos, title, horizontal = false, onShowAll }) => {
  const { setCurrentVideo } = usePlayerStore();

  if (!videos || videos.length === 0) return null;

  return (
    <div className="mb-14">
      {title && (
        <div className="flex items-center justify-between mb-6">
           <div className="flex flex-col gap-1">
            {horizontal && <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">For You</p>}
            <h2
              onClick={onShowAll}
              className={`text-2xl font-bold text-white tracking-tight ${onShowAll ? 'cursor-pointer hover:text-white/70 transition-colors' : ''}`}
            >
              {title}
            </h2>
          </div>
          {horizontal && onShowAll && (
            <button
              onClick={onShowAll}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors"
            >
              See All
            </button>
          )}
        </div>
      )}

      <div className={
        horizontal
          ? 'flex overflow-x-auto gap-4 md:gap-6 pb-6 scrollbar-hide snap-x'
          : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6'
      }>
        {videos.map((video, idx) => (
          <div
            key={`${video.id}-${idx}`}
            className={`group cursor-pointer transition-all duration-300 ${horizontal ? 'min-w-[140px] max-w-[140px] md:min-w-[180px] md:max-w-[180px] snap-start' : ''}`}
            onClick={() => setCurrentVideo(video, videos)}
          >
            {/* Thumbnail */}
            <div
              className="relative aspect-square rounded-[20px] md:rounded-[28px] overflow-hidden mb-3 md:mb-3.5 transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/5 bg-[#121212]"
            >
              <img
                src={video.image?.[2]?.link || video.image?.[1]?.link || video.image?.[0]?.link || ''}
                alt={video.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-all duration-300">
                  <FiPlay className="fill-current" size={18} style={{ marginLeft: 2 }} />
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="px-1">
              <h3
                className="text-white font-bold text-[14px] md:text-[15px] truncate leading-tight mb-0.5 md:mb-1 group-hover:text-white/90 transition-colors"
                dangerouslySetInnerHTML={{ __html: video.name }}
              />
              <p
                className="text-white/30 text-[11px] md:text-[13px] font-medium truncate"
                dangerouslySetInnerHTML={{ __html: video.primaryArtists || video.label }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;
