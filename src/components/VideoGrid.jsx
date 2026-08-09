import React from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { FiPlay, FiPlus, FiSkipForward, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { cleanText } from '../utils/text';
import { formatDuration, formatTimeAgo } from '../utils/format';
import { pickImageUrl } from '../utils/media';

const VideoGrid = ({ videos, title, horizontal = false, onShowAll }) => {
  const setCurrentVideo = usePlayerStore(state => state.setCurrentVideo);
  const addToQueue = usePlayerStore(state => state.addToQueue);
  const playNextInQueue = usePlayerStore(state => state.playNextInQueue);
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
        <div className="flex items-end justify-between mb-6 border-t border-[#f4f1e8]/15 pt-4">
          <div className="flex flex-col gap-1">
            {horizontal && <p className="text-[10px] font-medium text-[#a9a79d] uppercase tracking-[0.18em]">Selected for you</p>}
            <h2
              onClick={onShowAll}
              className={`text-3xl font-normal text-[#f4f1e8] tracking-tight font-['Instrument_Serif'] ${onShowAll ? 'cursor-pointer hover:text-[#d6ff42] transition-colors' : ''}`}
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
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors whitespace-nowrap shrink-0"
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
            className={`group cursor-pointer transition-all duration-300 ${horizontal ? 'min-w-[150px] max-w-[150px] md:min-w-[190px] md:max-w-[190px] snap-start' : ''}`}
            onClick={() => setCurrentVideo(video, videos)}
          >
            {/* Thumbnail */}
            <div
              className="relative aspect-[4/5] rounded-none overflow-hidden mb-3 md:mb-4 transition-all duration-500 group-hover:shadow-[0_24px_50px_rgba(0,0,0,0.45)] group-hover:-translate-y-1 border border-[#f4f1e8]/10 bg-white/[0.015]"
            >
              <img
                src={pickImageUrl(video.image)}
                alt={cleanText(video.name, 'Song cover')}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                <div className="w-12 h-12 md:w-13 md:h-13 rounded-full bg-[#d6ff42] text-[#10100e] flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-all duration-300">
                  <FiPlay className="fill-current" size={16} style={{ marginLeft: 2 }} />
                </div>
              </div>
              <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
                <button
                  type="button"
                  title="Play next"
                  onClick={(e) => {
                    e.stopPropagation();
                    playNextInQueue(video);
                  }}
                  className="w-7 h-7 rounded-full bg-black/55 backdrop-blur-md border border-white/12 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all active:scale-90"
                >
                  <FiSkipForward size={12} />
                </button>
                <button
                  type="button"
                  title="Add to queue"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToQueue(video);
                  }}
                  className="w-7 h-7 rounded-full bg-black/55 backdrop-blur-md border border-white/12 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all active:scale-90"
                >
                  <FiPlus size={13} />
                </button>
              </div>
              {video.playedAt && (
                <span className="absolute left-2 bottom-2 rounded-md bg-black/75 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-mono text-[#d6ff42] border border-white/10">
                  {formatTimeAgo(video.playedAt)}
                </span>
              )}
              {video.duration && (
                <span className="absolute right-2 bottom-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white/80">
                  {formatDuration(video.duration)}
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="px-1">
              <h3
                className="text-[#f4f1e8] font-semibold text-[14px] md:text-[15px] truncate leading-tight mb-0.5 md:mb-1 group-hover:text-[#d6ff42] transition-colors"
              >
                {cleanText(video.name, 'Unknown Song')}
              </h3>
              <p
                className="text-[#a9a79d] text-[11px] md:text-[13px] font-medium truncate"
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

export default React.memo(VideoGrid);
