import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiHeart, FiRepeat, FiShuffle, FiChevronDown, FiMaximize2, FiDownload, FiPlus } from 'react-icons/fi';
import axios from 'axios';

const Player = () => {
  const { currentVideo, isPlaying, setIsPlaying, playNext, playPrevious, playlist, favorites, toggleFavorite, autoplay, quality, openAddToPlaylistModal, setCurrentVideo, currentIndex } = usePlayerStore();
  const [played, setPlayed] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const isSwiping = useRef(false);

  const handleSwipeStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    isSwiping.current = false;
  };

  const handleSwipeMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
    if (touchStart) {
      const distance = touchStart - e.targetTouches[0].clientX;
      if (Math.abs(distance) > 10) {
        isSwiping.current = true;
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < playlist.length - 1) {
      playNext();
    } else if (recommendedSongs.length > 0) {
      setCurrentVideo(recommendedSongs[0], [...playlist, ...recommendedSongs]);
    }
  };

  const handleSwipeEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      playPrevious();
    }
  };
  
  const audioRef = useRef(null);
  const miniProgressRef = useRef(null);
  const fullProgressRef = useRef(null);
  const miniVolumeRef = useRef(null);
  const fullVolumeRef = useRef(null);
  const activeProgressBarRef = useRef(null);
  const activeVolumeBarRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio playback error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentVideo, volume]);

  useEffect(() => {
    if (currentVideo && currentVideo.primaryArtists) {
      const fetchRecommendations = async () => {
        try {
          const artist = currentVideo.primaryArtists.split(',')[0].trim();
          const res = await axios.get('https://jiosaavn-api-privatecvc2.vercel.app/search/songs', {
            params: { query: artist + ' songs', limit: 15 }
          });
          if (res.data?.data?.results) {
            const recs = res.data.data.results.filter(v => v.id !== currentVideo.id && !playlist.some(p => p.id === v.id));
            setRecommendedSongs(recs);
          }
        } catch(e) { console.error("Error fetching recommendations:", e); }
      };
      fetchRecommendations();
    }
  }, [currentVideo]);

  const handleTimeUpdate = () => {
    if (audioRef.current && !isNaN(audioRef.current.duration) && !isSeeking) {
      setPlayed(audioRef.current.currentTime / audioRef.current.duration || 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const updateSeekPosition = (clientX) => {
    if (!activeProgressBarRef.current) return;
    const rect = activeProgressBarRef.current.getBoundingClientRect();
    let percent = (clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    setPlayed(percent);
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      audioRef.current.currentTime = percent * audioRef.current.duration;
    }
  };

  const handleSeekStart = (e, ref) => {
    setIsSeeking(true);
    activeProgressBarRef.current = ref.current;
    updateSeekPosition(e.clientX || (e.touches && e.touches[0].clientX));
  };

  const updateVolumePosition = (clientX) => {
    if (!activeVolumeBarRef.current) return;
    const rect = activeVolumeBarRef.current.getBoundingClientRect();
    let newVolume = (clientX - rect.left) / rect.width;
    newVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(newVolume);
  };

  const handleVolumeStart = (e, ref) => {
    setIsDraggingVolume(true);
    activeVolumeBarRef.current = ref.current;
    updateVolumePosition(e.clientX || (e.touches && e.touches[0].clientX));
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isSeeking) {
        updateSeekPosition(e.clientX || (e.touches && e.touches[0].clientX));
      }
      if (isDraggingVolume) {
        updateVolumePosition(e.clientX || (e.touches && e.touches[0].clientX));
      }
    };

    const handleGlobalMouseUp = () => {
      if (isSeeking) setIsSeeking(false);
      if (isDraggingVolume) setIsDraggingVolume(false);
    };

    if (isSeeking || isDraggingVolume) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchmove', handleGlobalMouseMove, { passive: false });
      window.addEventListener('touchend', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalMouseMove);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isSeeking, isDraggingVolume]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (!currentVideo) return null;

  const getAudioUrl = () => {
    if (!currentVideo?.downloadUrl?.length) return '';
    // Find the link that matches the selected quality, or fall back to the highest available
    const qualityLink = currentVideo.downloadUrl.find(d => d.quality === quality);
    return qualityLink ? qualityLink.link : currentVideo.downloadUrl[currentVideo.downloadUrl.length - 1].link;
  };
  const audioUrl = getAudioUrl();
  const imageUrl = currentVideo?.image?.[2]?.link || currentVideo?.image?.[1]?.link || currentVideo?.image?.[0]?.link || '';
  const title = currentVideo?.name || 'No track selected';
  const artist = currentVideo?.primaryArtists || currentVideo?.label || 'Unknown Artist';
  const isFavorite = favorites.some(v => v.id === currentVideo.id);

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `${title}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          if (autoplay) {
            handleNext();
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        autoPlay
      />

      {/* MINI PLAYER (Visible when NOT expanded) */}
      <div 
        onClick={() => {
          if (isSwiping.current) {
            isSwiping.current = false;
            return;
          }
          setIsExpanded(true);
        }}
        onTouchStart={handleSwipeStart}
        onTouchMove={handleSwipeMove}
        onTouchEnd={handleSwipeEnd}
        className={`fixed left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-5xl h-20 bg-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center px-4 md:px-6 z-[100] transition-all duration-500 ease-out cursor-pointer hover:bg-surface bottom-20 md:bottom-6 shadow-2xl shadow-black/50 ${isExpanded ? 'translate-y-[200%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
      >
        <div className="flex items-center w-full md:w-[30%] min-w-[150px] gap-2 md:gap-4 group">
          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-md overflow-hidden shadow-lg shadow-black/40 border border-white/5 bg-background flex-shrink-0">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="text-textPrimary font-semibold text-sm truncate" dangerouslySetInnerHTML={{ __html: title }}></h4>
            <p className="text-textSecondary text-[10px] md:text-xs truncate mt-0.5 md:mt-1" dangerouslySetInnerHTML={{ __html: artist }}></p>
          </div>
          <div className="flex items-center gap-1 md:gap-3">
            <button 
              className={`p-1.5 transition-colors hover:scale-110 active:scale-95 ${isFavorite ? 'text-primary' : 'text-textSecondary hover:text-primary'}`} 
              onClick={(e) => { e.stopPropagation(); toggleFavorite(currentVideo); }}
            >
              <FiHeart size={18} className={isFavorite ? 'fill-current' : ''} />
            </button>
            <button 
              className="p-1.5 text-textSecondary hover:text-primary transition-colors hover:scale-110 active:scale-95" 
              onClick={(e) => { e.stopPropagation(); openAddToPlaylistModal(currentVideo); }}
            >
              <FiPlus size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Mini Controls */}
        <div className="md:hidden flex items-center gap-3 ml-auto" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setIsPlaying(!isPlaying)} className="text-textPrimary p-2">
            {isPlaying ? <FiPause size={24} className="fill-current" /> : <FiPlay size={24} className="fill-current ml-1" />}
          </button>
        </div>

        {/* Desktop Mini Controls */}
        <div className="hidden md:flex flex-[0.4] flex-col items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-6 mb-2">
            <button className="text-textSecondary hover:text-textPrimary transition-colors hover:scale-110 active:scale-95">
              <FiShuffle size={18} />
            </button>
            <button onClick={playPrevious} className="text-textPrimary hover:text-primary transition-colors hover:scale-110 active:scale-95">
              <FiSkipBack size={24} />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-textPrimary text-background flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              {isPlaying ? <FiPause size={20} className="fill-current" /> : <FiPlay size={20} className="fill-current ml-1" />}
            </button>
            <button onClick={handleNext} className="text-textPrimary hover:text-primary transition-colors hover:scale-110 active:scale-95">
              <FiSkipForward size={24} />
            </button>
            <button className="text-textSecondary hover:text-textPrimary transition-colors hover:scale-110 active:scale-95">
              <FiRepeat size={18} />
            </button>
          </div>
          <div className="w-full flex items-center gap-3">
            <span className="text-[10px] text-textSecondary w-8 text-right font-medium">{formatTime(played * duration)}</span>
            <div 
              ref={miniProgressRef}
              className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer relative overflow-hidden group hover:h-1.5 transition-all"
              onMouseDown={(e) => handleSeekStart(e, miniProgressRef)}
              onTouchStart={(e) => handleSeekStart(e, miniProgressRef)}
            >
              <div className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-150" style={{ width: `${played * 100}%` }}></div>
            </div>
            <span className="text-[10px] text-textSecondary w-8 font-medium">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Desktop Mini Volume & Expand */}
        <div className="hidden md:flex items-center justify-end w-[30%] gap-4" onClick={(e) => e.stopPropagation()}>
          <FiVolume2 className="text-textSecondary" size={20} />
          <div 
            ref={miniVolumeRef}
            className="w-24 h-1 bg-white/10 rounded-full cursor-pointer overflow-hidden hover:h-1.5 transition-all group"
            onMouseDown={(e) => handleVolumeStart(e, miniVolumeRef)}
            onTouchStart={(e) => handleVolumeStart(e, miniVolumeRef)}
          >
            <div className="h-full bg-textPrimary group-hover:bg-primary rounded-full transition-colors pointer-events-none" style={{ width: `${volume * 100}%` }}></div>
          </div>
          <button onClick={() => setIsExpanded(true)} className="ml-4 text-textSecondary hover:text-textPrimary transition-colors">
            <FiMaximize2 size={18} />
          </button>
        </div>
      </div>

      {/* FULL SCREEN PLAYER (Visible when expanded) */}
      <div className={`fixed inset-0 z-[200] bg-background/95 backdrop-blur-3xl flex flex-col transition-all duration-500 ease-in-out ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
          <button onClick={() => setIsExpanded(false)} className="text-textSecondary hover:text-textPrimary p-2 hover:bg-white/10 rounded-full transition-colors">
            <FiChevronDown size={32} />
          </button>
          <div className="text-center">
            <p className="text-[10px] sm:text-xs text-textSecondary tracking-widest uppercase font-semibold">Now Playing</p>
            <p className="text-sm text-textPrimary font-medium mt-0.5">Top Playlist</p>
          </div>
          <div className="w-12"></div> {/* Spacer for centering */}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-start md:justify-center gap-8 md:gap-20 p-6 sm:p-8 max-w-6xl mx-auto w-full overflow-y-auto scrollbar-hide pb-32">
          
          {/* Large Album Art */}
          <div 
            className="w-full max-w-[220px] sm:max-w-[280px] md:max-w-md aspect-square rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.25)] border border-white/10 group flex-shrink-0 mt-4 md:mt-0"
            onTouchStart={handleSwipeStart}
            onTouchMove={handleSwipeMove}
            onTouchEnd={handleSwipeEnd}
          >
             <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>

          {/* Controls Container */}
          <div className="w-full max-w-md flex flex-col mt-4 md:mt-0">
             
             {/* Title & Heart */}
             <div className="flex items-start justify-between mb-8">
               <div className="overflow-hidden pr-4 flex-1">
                 <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-textPrimary mb-2 truncate" dangerouslySetInnerHTML={{ __html: title }}></h1>
                 <p className="text-base sm:text-lg text-primary truncate" dangerouslySetInnerHTML={{ __html: artist }}></p>
               </div>
               <div className="flex items-center gap-4 mt-1">
                 <button onClick={handleDownload} className="text-textSecondary hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                   <FiDownload size={24} />
                 </button>
                 <button 
                   onClick={() => toggleFavorite(currentVideo)} 
                   className={`transition-colors p-2 hover:bg-white/10 rounded-full ${isFavorite ? 'text-primary' : 'text-textSecondary hover:text-primary'}`}
                 >
                   <FiHeart size={28} className={isFavorite ? 'fill-current' : ''} />
                 </button>
               </div>
             </div>

             {/* Progress Bar */}
             <div className="w-full flex flex-col gap-3 mb-10">
                <div 
                  ref={fullProgressRef}
                  className="w-full h-2.5 bg-white/10 rounded-full cursor-pointer relative overflow-hidden group"
                  onMouseDown={(e) => handleSeekStart(e, fullProgressRef)}
                  onTouchStart={(e) => handleSeekStart(e, fullProgressRef)}
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    style={{ width: `${played * 100}%`, pointerEvents: 'none' }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-textSecondary font-medium">
                  <span>{formatTime(played * duration)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
             </div>

             {/* Massive Play Controls */}
             <div className="flex items-center justify-between mb-12 sm:mb-14 px-2">
                <button className="text-textSecondary hover:text-textPrimary transition-colors">
                  <FiShuffle size={24} />
                </button>
                <button onClick={playPrevious} className="text-textPrimary hover:text-primary transition-colors active:scale-90">
                  <FiSkipBack className="w-7 h-7 sm:w-9 sm:h-9" />
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_35px_rgba(16,185,129,0.4)]"
                >
                  {isPlaying ? <FiPause className="w-8 h-8 sm:w-10 sm:h-10 fill-current" /> : <FiPlay className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1 sm:ml-2" />}
                </button>
                <button onClick={handleNext} className="text-textPrimary hover:text-primary transition-colors active:scale-90">
                  <FiSkipForward className="w-7 h-7 sm:w-9 sm:h-9" />
                </button>
                <button className="text-textSecondary hover:text-textPrimary transition-colors">
                  <FiRepeat size={24} />
                </button>
             </div>

             {/* Full Screen Volume */}
             <div className="flex items-center gap-4 w-full max-w-[280px] mx-auto mb-12">
                <FiVolume2 className="text-textSecondary" size={20} />
                <div 
                  ref={fullVolumeRef}
                  className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer overflow-hidden group"
                  onMouseDown={(e) => handleVolumeStart(e, fullVolumeRef)}
                  onTouchStart={(e) => handleVolumeStart(e, fullVolumeRef)}
                >
                  <div
                    className="h-full bg-textPrimary group-hover:bg-primary rounded-full transition-colors pointer-events-none"
                    style={{ width: `${volume * 100}%` }}
                  ></div>
                </div>
             </div>

             {/* Up Next / Recommendations */}
             <div className="w-full">
               <div className="flex items-center justify-between mb-4 px-1">
                 <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Up Next</h3>
                 <span className="text-[10px] text-textSecondary">{playlist.slice(currentIndex + 1).length} songs remaining</span>
               </div>
               <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                 {playlist.slice(currentIndex + 1, currentIndex + 6).map((song, idx) => (
                   <div 
                    key={`${song.id}-${idx}`}
                    onClick={() => setCurrentVideo(song, playlist)}
                    className="flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
                   >
                     <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/5 relative">
                       <img src={song.image?.[0]?.link} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <FiPlay size={16} className="text-white fill-current" />
                       </div>
                     </div>
                     <div className="overflow-hidden flex-1">
                       <p className="text-sm font-semibold text-textPrimary truncate" dangerouslySetInnerHTML={{ __html: song.name }}></p>
                       <p className="text-xs text-textSecondary truncate" dangerouslySetInnerHTML={{ __html: song.primaryArtists }}></p>
                     </div>
                   </div>
                 ))}
                 {playlist.slice(currentIndex + 1).length === 0 && recommendedSongs.length === 0 && (
                   <div className="text-center py-8 bg-white/5 rounded-2xl border border-dashed border-white/10">
                     <p className="text-xs text-textSecondary">No more songs in queue</p>
                   </div>
                 )}
                 {recommendedSongs.length > 0 && (
                   <div className="mt-4 pt-2">
                     <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-3 px-1">Autoplay • Recommended</h3>
                     {recommendedSongs.slice(0, 10).map((song, idx) => (
                       <div 
                        key={`rec-${song.id}-${idx}`}
                        onClick={() => setCurrentVideo(song, [...playlist, ...recommendedSongs])}
                        className="flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
                       >
                         <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/5 relative">
                           <img src={song.image?.[0]?.link} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                             <FiPlay size={16} className="text-white fill-current" />
                           </div>
                         </div>
                         <div className="overflow-hidden flex-1">
                           <p className="text-sm font-semibold text-textPrimary truncate" dangerouslySetInnerHTML={{ __html: song.name }}></p>
                           <p className="text-xs text-textSecondary truncate" dangerouslySetInnerHTML={{ __html: song.primaryArtists }}></p>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Player;
