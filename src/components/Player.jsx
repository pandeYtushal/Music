import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiHeart, FiRepeat, FiShuffle, FiChevronDown, FiMaximize2, FiDownload } from 'react-icons/fi';

const Player = () => {
  const { currentVideo, isPlaying, setIsPlaying, playNext, playPrevious, playlist, favorites, toggleFavorite } = usePlayerStore();
  const [played, setPlayed] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef(null);

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

  const handleTimeUpdate = () => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      setPlayed(audioRef.current.currentTime / audioRef.current.duration || 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setPlayed(percent);
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      audioRef.current.currentTime = percent * audioRef.current.duration;
    }
  };

  const handleVolumeChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newVolume = (e.clientX - rect.left) / rect.width;
    setVolume(Math.max(0, Math.min(1, newVolume)));
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (!currentVideo) return null;

  const getAudioUrl = () => {
    if (!currentVideo?.downloadUrl?.length) return '';
    return currentVideo.downloadUrl[currentVideo.downloadUrl.length - 1].link; // highest quality
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
        onEnded={playNext}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        autoPlay
      />

      {/* MINI PLAYER (Visible when NOT expanded) */}
      <div 
        onClick={() => setIsExpanded(true)}
        className={`fixed left-0 right-0 h-20 md:h-24 bg-surface/95 backdrop-blur-xl border-t border-white/5 flex items-center px-4 md:px-6 z-[100] transition-all duration-500 ease-out cursor-pointer hover:bg-surface/100 bottom-16 md:bottom-0 ${isExpanded ? 'translate-y-[200%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
      >
        <div className="flex items-center w-full md:w-1/4 min-w-[150px] md:min-w-[200px] group">
          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-md overflow-hidden shadow-lg shadow-black/40 border border-white/5 mr-3 md:mr-4 bg-background flex-shrink-0">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="text-textPrimary font-semibold text-sm truncate" dangerouslySetInnerHTML={{ __html: title }}></h4>
            <p className="text-textSecondary text-xs truncate mt-0.5 md:mt-1" dangerouslySetInnerHTML={{ __html: artist }}></p>
          </div>
          <button 
            className={`ml-2 md:ml-4 transition-colors hidden sm:block hover:scale-110 active:scale-95 ${isFavorite ? 'text-primary' : 'text-textSecondary hover:text-primary'}`} 
            onClick={(e) => { e.stopPropagation(); toggleFavorite(currentVideo); }}
          >
            <FiHeart size={20} className={isFavorite ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Mobile Mini Controls */}
        <div className="md:hidden flex items-center gap-3 ml-auto" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setIsPlaying(!isPlaying)} className="text-textPrimary p-2">
            {isPlaying ? <FiPause size={24} className="fill-current" /> : <FiPlay size={24} className="fill-current ml-1" />}
          </button>
        </div>

        {/* Desktop Mini Controls */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center max-w-2xl px-8" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-6 mb-2">
            <button className="text-textSecondary hover:text-textPrimary transition-colors hover:scale-110 active:scale-95">
              <FiShuffle size={18} />
            </button>
            <button onClick={playPrevious} className="text-textPrimary hover:text-primary transition-colors hover:scale-110 active:scale-95">
              <FiSkipBack size={24} />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-textPrimary text-background flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              {isPlaying ? <FiPause size={20} className="fill-current" /> : <FiPlay size={20} className="fill-current ml-1" />}
            </button>
            <button onClick={playNext} className="text-textPrimary hover:text-primary transition-colors hover:scale-110 active:scale-95">
              <FiSkipForward size={24} />
            </button>
            <button className="text-textSecondary hover:text-textPrimary transition-colors hover:scale-110 active:scale-95">
              <FiRepeat size={18} />
            </button>
          </div>
          <div className="w-full flex items-center gap-3 group">
            <span className="text-xs text-textSecondary w-10 text-right">{formatTime(played * duration)}</span>
            <div 
              className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer relative overflow-hidden group-hover:h-2 transition-all"
              onMouseDown={handleSeek}
            >
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: `${played * 100}%`, pointerEvents: 'none' }}></div>
            </div>
            <span className="text-xs text-textSecondary w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Desktop Mini Volume & Expand */}
        <div className="hidden md:flex items-center justify-end w-1/4 min-w-[200px] gap-4" onClick={(e) => e.stopPropagation()}>
          <FiVolume2 className="text-textSecondary" size={20} />
          <div 
            className="w-24 h-1.5 bg-white/10 rounded-full cursor-pointer overflow-hidden hover:h-2 transition-all group"
            onMouseDown={handleVolumeChange}
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
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20 p-6 sm:p-8 max-w-6xl mx-auto w-full overflow-y-auto scrollbar-hide pb-20">
          
          {/* Large Album Art */}
          <div className="w-full max-w-[280px] sm:max-w-sm md:max-w-md aspect-square rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(139,92,246,0.25)] border border-white/10 group flex-shrink-0">
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
                  className="w-full h-2.5 bg-white/10 rounded-full cursor-pointer relative overflow-hidden group"
                  onMouseDown={handleSeek}
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
                  <FiSkipBack size={36} />
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_35px_rgba(139,92,246,0.4)]"
                >
                  {isPlaying ? <FiPause size={40} className="fill-current" /> : <FiPlay size={40} className="fill-current ml-2" />}
                </button>
                <button onClick={playNext} className="text-textPrimary hover:text-primary transition-colors active:scale-90">
                  <FiSkipForward size={36} />
                </button>
                <button className="text-textSecondary hover:text-textPrimary transition-colors">
                  <FiRepeat size={24} />
                </button>
             </div>

             {/* Full Screen Volume */}
             <div className="flex items-center gap-4 w-full max-w-[280px] mx-auto">
                <FiVolume2 className="text-textSecondary" size={24} />
                <div 
                  className="flex-1 h-2.5 bg-white/10 rounded-full cursor-pointer overflow-hidden group"
                  onMouseDown={handleVolumeChange}
                >
                  <div
                    className="h-full bg-textPrimary group-hover:bg-primary rounded-full transition-colors pointer-events-none"
                    style={{ width: `${volume * 100}%` }}
                  ></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Player;
