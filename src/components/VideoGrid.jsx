import React from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { FiPlay, FiPlus, FiSkipForward, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { cleanText } from '../utils/text';
import { pickImageUrl } from '../utils/media';

const formatDuration = (seconds) => {
  if (!seconds || Number.isNaN(Number(seconds))) return '';
  const total = Number(seconds);
  const minutes = Math.floor(total / 60);
  const remaining = Math.floor(total % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`;
};

const VideoGrid = ({ videos, title, horizontal = false, onShowAll }) => {
  const { setCurrentVideo, addToQueue, playNextInQueue } = usePlayerStore();
  const scrollContainerRef = React.useRef(null);

  if (!videos || videos.length === 0) return null;

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mb-14 relative group/grid">
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
          
          <div className="flex items-center gap-3">
            {horizontal && (
              <div className="flex items-center gap-1.5 mr-1">
                <button
                  type="button"
                  onClick={() => scroll('left')}
                  className="w-8 h-8 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all duration-200 active:scale-90"
                  aria-label="Scroll left"
                >
                  <FiChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => scroll('right')}
                  className="w-8 h-8 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all duration-200 active:scale-90"
                  aria-label="Scroll right"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            )}
            {horizontal && onShowAll && (
              <button
                onClick={onShowAll}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors"
              >
                See All
              </button>
            )}
          </div>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className={
          horizontal
            ? 'flex overflow-x-auto gap-4 md:gap-6 pb-6 scrollbar-hide snap-x scroll-smooth'
            : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6'
        }
      >
        {videos.map((video, idx) => (
          <div
            key={`${video.id}-${idx}`}
            className={`group cursor-pointer transition-all duration-300 ${horizontal ? 'min-w-[140px] max-w-[140px] md:min-w-[180px] md:max-w-[180px] snap-start' : ''}`}
            onClick={() => setCurrentVideo(video, videos)}
          >
            {/* Thumbnail */}
            <div
              className="relative aspect-square rounded-xl overflow-hidden mb-3 md:mb-3.5 transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/5 bg-[#121212]"
            >
              <img
                src={pickImageUrl(video.image)}
                alt={cleanText(video.name, 'Song cover')}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-all duration-300">
                  <FiPlay className="fill-current" size={18} style={{ marginLeft: 2 }} />
                </div>
              </div>
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  title="Play next"
                  onClick={(e) => {
                    e.stopPropagation();
                    playNextInQueue(video);
                  }}
                  className="w-8 h-8 rounded-full bg-black/65 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                >
                  <FiSkipForward size={14} />
                </button>
                <button
                  type="button"
                  title="Add to queue"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToQueue(video);
                  }}
                  className="w-8 h-8 rounded-full bg-black/65 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                >
                  <FiPlus size={15} />
                </button>
              </div>
              {video.duration && (
                <span className="absolute right-2 bottom-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white/80">
                  {formatDuration(video.duration)}
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="px-1">
              <h3
                className="text-white font-bold text-[14px] md:text-[15px] truncate leading-tight mb-0.5 md:mb-1 group-hover:text-white/90 transition-colors"
              >
                {cleanText(video.name, 'Unknown Song')}
              </h3>
              <p
                className="text-white/30 text-[11px] md:text-[13px] font-medium truncate"
              >
                {cleanText(video.primaryArtists || video.label, 'Unknown Artist')}
              </p>
              {video.album?.name && (
                <p className="text-white/18 text-[10px] md:text-[11px] font-medium truncate mt-1">
                  {cleanText(video.album.name)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;
