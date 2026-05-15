import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiVolume2, FiHeart, FiRepeat, FiShuffle,
  FiChevronDown, FiList, FiVolumeX, FiShare2, FiPlus
} from 'react-icons/fi';
import axios from 'axios';

/* Stable outside Player — never remounts */
const SeekBar = ({ refEl, played, onSeekStart }) => (
  <div
    ref={refEl}
    className="flex-1 h-[5px] rounded-full cursor-pointer relative group"
    style={{ background: 'rgba(255,255,255,0.1)' }}
    onMouseDown={e => onSeekStart(e, refEl)}
    onTouchStart={e => onSeekStart(e, refEl)}
  >
    <div
      className="absolute top-0 left-0 h-full rounded-full bg-white transition-all duration-150"
      style={{ width: `${played * 100}%` }}
    />
    <div
      className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-xl scale-0 group-hover:scale-100 md:group-hover:scale-100 transition-transform"
      style={{ left: `calc(${played * 100}% - 7px)` }}
    />
  </div>
);

const Player = () => {
  const {
    currentVideo, isPlaying, setIsPlaying, playNext, playPrevious,
    playlist, favorites, toggleFavorite, autoplay, quality,
    openAddToPlaylistModal, setCurrentVideo, currentIndex
  } = usePlayerStore();

  const [played, setPlayed]     = useState(0);
  const [volume, setVolume]     = useState(0.8);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded]         = useState(false);
  const [isSeeking, setIsSeeking]           = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [isMuted, setIsMuted]   = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd,   setTouchEnd]   = useState(null);
  const isSwiping = useRef(false);

  const audioRef          = useRef(null);
  const seekRef           = useRef(null);
  const fullSeekRef       = useRef(null);
  const fullVolumeRef     = useRef(null);
  const activeProgressRef = useRef(null);
  const activeVolumeRef   = useRef(null);

  const fmt = s => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleNext = () => {
    if (currentIndex < playlist.length - 1) playNext();
    else if (recommendedSongs.length > 0) setCurrentVideo(recommendedSongs[0], [...playlist, ...recommendedSongs]);
  };

  const handleSwipeStart = e => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); isSwiping.current = false; };
  const handleSwipeMove  = e => { setTouchEnd(e.targetTouches[0].clientX); if (touchStart && Math.abs(touchStart - e.targetTouches[0].clientX) > 10) isSwiping.current = true; };
  const handleSwipeEnd   = () => { if (!touchStart || !touchEnd) return; const d = touchStart - touchEnd; if (d > 50) handleNext(); else if (d < -50) playPrevious(); };

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
    if (isPlaying) audioRef.current.play().catch(console.error);
    else audioRef.current.pause();
  }, [isPlaying, currentVideo, volume, isMuted]);

  useEffect(() => {
    if (!currentVideo?.primaryArtists) return;
    axios.get('https://jio-saavn-api-sigma.vercel.app/search/songs', {
      params: { query: currentVideo.primaryArtists.split(',')[0].trim() + ' songs', limit: 15 }
    }).then(r => setRecommendedSongs((r.data?.data?.results || []).filter(v => v.id !== currentVideo.id))).catch(() => {});
  }, [currentVideo]);

  const updateSeek = clientX => {
    if (!activeProgressRef.current) return;
    const rect = activeProgressRef.current.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setPlayed(pct);
    if (audioRef.current && !isNaN(audioRef.current.duration))
      audioRef.current.currentTime = pct * audioRef.current.duration;
  };
  const handleSeekStart = (e, ref) => { setIsSeeking(true); activeProgressRef.current = ref.current; updateSeek(e.clientX || e.touches?.[0]?.clientX); };

  const updateVol = clientX => {
    if (!activeVolumeRef.current) return;
    const rect = activeVolumeRef.current.getBoundingClientRect();
    setVolume(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)));
  };
  const handleVolStart = (e, ref) => { setIsDraggingVolume(true); activeVolumeRef.current = ref.current; updateVol(e.clientX || e.touches?.[0]?.clientX); };

  useEffect(() => {
    const onMove = e => { const x = e.clientX ?? e.touches?.[0]?.clientX; if (isSeeking) updateSeek(x); if (isDraggingVolume) updateVol(x); };
    const onUp   = () => { setIsSeeking(false); setIsDraggingVolume(false); };
    if (isSeeking || isDraggingVolume) { window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp); window.addEventListener('touchmove', onMove, { passive: false }); window.addEventListener('touchend', onUp); }
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp); };
  }, [isSeeking, isDraggingVolume]);

  if (!currentVideo) return null;

  const audioUrl  = (!currentVideo?.downloadUrl?.length) ? '' : (currentVideo.downloadUrl.find(d => d.quality === quality) || currentVideo.downloadUrl[currentVideo.downloadUrl.length - 1]).link;
  const imageUrl  = currentVideo?.image?.[2]?.link || currentVideo?.image?.[1]?.link || currentVideo?.image?.[0]?.link || '';
  const title     = currentVideo?.name || 'Unknown';
  const artist    = currentVideo?.primaryArtists || currentVideo?.label || 'Unknown Artist';
  const isFav     = favorites.some(v => v.id === currentVideo.id);
  const seekBound = (e, ref) => handleSeekStart(e, ref);

  return (
    <>
      <audio
        ref={audioRef} src={audioUrl} autoPlay
        onTimeUpdate={() => { if (audioRef.current && !isNaN(audioRef.current.duration) && !isSeeking) setPlayed(audioRef.current.currentTime / audioRef.current.duration || 0); }}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => autoplay && handleNext()}
        onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}
      />

      {/* ══ MOBILE MINI PLAYER (Above Bottom Nav) ══ */}
      <div
        className={`md:hidden fixed left-4 right-4 z-[100] transition-all duration-500 ease-out ${isExpanded ? 'bottom-0 opacity-0 pointer-events-none' : 'bottom-[88px] opacity-100'}`}
        onClick={() => setIsExpanded(true)}
      >
        <div 
          className="mx-auto max-w-[400px] h-[64px] flex items-center px-3 gap-3 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
          style={{
            background: 'rgba(18,18,18,0.95)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 32,
          }}
        >
          <div className="w-11 h-11 rounded-[20px] overflow-hidden shrink-0 shadow-lg border border-white/5">
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-bold text-[13px] truncate leading-tight" dangerouslySetInnerHTML={{ __html: title }} />
            <p className="text-white/40 text-[11px] font-medium truncate mt-0.5" dangerouslySetInnerHTML={{ __html: artist }} />
          </div>
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <button onClick={() => toggleFavorite(currentVideo)} className={`w-9 h-9 flex items-center justify-center transition-colors ${isFav ? 'text-white' : 'text-white/20'}`}>
              <FiHeart size={18} className={isFav ? 'fill-current' : ''} />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-90 transition-transform"
            >
              {isPlaying ? <FiPause size={20} className="fill-current" /> : <FiPlay size={20} className="fill-current ml-0.5" />}
            </button>
          </div>
          {/* Progress bar line at the very bottom of the mini player pill */}
          <div className="absolute bottom-[2px] left-8 right-8 h-[2.5px] bg-white/[0.03] overflow-hidden rounded-full">
            <div className="h-full bg-white transition-none opacity-80" style={{ width: `${played * 100}%` }} />
          </div>
        </div>
      </div>

      {/* ══ DESKTOP BOTTOM PLAYER BAR (Full Width) ══ */}
      <div
        className={`hidden md:block fixed left-0 right-0 z-[100] transition-all duration-300 ${isExpanded ? 'bottom-0 opacity-0 pointer-events-none' : 'bottom-0 opacity-100'}`}
        style={{
          background: 'rgba(10,10,10,0.98)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          height: 80
        }}
      >
        <div className="flex items-center h-full px-6 gap-6 max-w-[1800px] mx-auto">
          {/* Left: Track Info */}
          <div className="flex items-center gap-4 w-[30%] min-w-[200px] shrink-0">
            <div 
              className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-2xl border border-white/5 cursor-pointer"
              onClick={() => setIsExpanded(true)}
            >
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-[14px] truncate leading-tight cursor-pointer hover:underline" 
                onClick={() => setIsExpanded(true)}
                dangerouslySetInnerHTML={{ __html: title }} />
              <p className="text-white/40 text-[12px] font-medium truncate mt-0.5" 
                dangerouslySetInnerHTML={{ __html: artist }} />
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button onClick={() => toggleFavorite(currentVideo)} className={`p-2 transition-colors ${isFav ? 'text-white' : 'text-white/20 hover:text-white/60'}`}>
                <FiHeart size={16} className={isFav ? 'fill-current' : ''} />
              </button>
              <button className="p-2 text-white/20 hover:text-white/60 transition-colors">
                <FiShare2 size={16} />
              </button>
            </div>
          </div>

          {/* Center: Progress & Controls */}
          <div className="flex-1 flex flex-col items-center gap-1.5 px-4">
            <div className="flex items-center gap-8 mb-0.5">
               <button className="text-white/20 hover:text-white/60 transition-colors"><FiShuffle size={16} /></button>
               <button onClick={playPrevious} className="text-white/60 hover:text-white transition-colors active:scale-90"><FiSkipBack size={20} /></button>
               <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  {isPlaying ? <FiPause size={18} className="fill-current" /> : <FiPlay size={18} className="fill-current ml-0.5" />}
                </button>
               <button onClick={handleNext} className="text-white/60 hover:text-white transition-colors active:scale-90"><FiSkipForward size={20} /></button>
               <button className="text-white/20 hover:text-white/60 transition-colors"><FiRepeat size={16} /></button>
            </div>
            <div className="flex items-center gap-4 w-full max-w-2xl">
              <span className="text-[10px] font-bold text-white/25 tabular-nums w-8 text-right">{fmt(played * duration)}</span>
              <SeekBar refEl={seekRef} played={played} onSeekStart={seekBound} />
              <span className="text-[10px] font-bold text-white/25 tabular-nums w-8">{fmt(duration)}</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 w-[30%] justify-end shrink-0">
             <button onClick={() => setIsExpanded(true)} className="p-2.5 text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <FiList size={18} />
             </button>
             <div className="flex items-center gap-3 group relative">
                <button onClick={() => setIsMuted(!isMuted)} className="p-2.5 text-white/30 hover:text-white transition-all">
                  {isMuted || volume === 0 ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                </button>
                <div 
                  ref={fullVolumeRef}
                  className="w-24 h-1 rounded-full cursor-pointer relative hidden lg:block"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                  onMouseDown={e => handleVolStart(e, fullVolumeRef)}
                  onTouchStart={e => handleVolStart(e, fullVolumeRef)}
                >
                  <div className="absolute top-0 left-0 h-full rounded-full bg-white/80" style={{ width: `${(isMuted ? 0 : volume) * 100}%` }} />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* ══ FULL PLAYER OVERLAY ══ */}
      <div
        className={`fixed inset-0 z-[200] flex flex-col transition-all duration-500 ease-out ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}
        style={{ background: '#0a0a0a' }}
      >
        {/* Blurred bg */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img src={imageUrl} alt="" className="w-full h-full object-cover scale-125 blur-[100px] opacity-[0.06]" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,rgba(10,10,10,0.6) 0%,#0a0a0a 65%)' }} />
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-6 md:pt-8 pb-3 shrink-0">
          <button onClick={() => setIsExpanded(false)} className="w-10 h-10 rounded-2xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.07] transition-all">
            <FiChevronDown size={26} />
          </button>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">Now Playing</p>
          <button onClick={() => openAddToPlaylistModal(currentVideo)} className="w-10 h-10 rounded-2xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.07] transition-all">
            <FiPlus size={20} />
          </button>
        </div>

        {/* Body: art + tracklist (desktop) OR stacked (mobile) */}
        <div
          className="relative z-10 flex-1 overflow-y-auto scrollbar-hide"
          onTouchStart={handleSwipeStart} onTouchMove={handleSwipeMove} onTouchEnd={handleSwipeEnd}
        >
          <div className="flex flex-col xl:flex-row items-center xl:items-start gap-8 px-6 md:px-10 py-4 md:py-8 mx-auto" style={{ maxWidth: 1200 }}>

            {/* Left Column — Album art + controls */}
            <div className="flex flex-col items-center gap-6 xl:sticky xl:top-0 w-full xl:w-auto shrink-0 max-w-[450px]">
              <div
                className={`w-full aspect-square rounded-[32px] md:rounded-[48px] overflow-hidden transition-all duration-700 shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/5 ${isPlaying ? 'scale-100' : 'scale-[0.94] opacity-75'}`}
              >
                <img src={imageUrl} alt={title} className="w-full h-full object-cover block" />
              </div>

              {/* Track info + heart */}
              <div className="flex items-start justify-between gap-4 w-full px-2">
                <div className="min-w-0">
                  <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight line-clamp-1" dangerouslySetInnerHTML={{ __html: title }} />
                  <p className="text-white/45 text-sm md:text-base font-medium truncate mt-1" dangerouslySetInnerHTML={{ __html: artist }} />
                </div>
                <button onClick={() => toggleFavorite(currentVideo)} className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${isFav ? 'text-white bg-white/10' : 'text-white/20 hover:text-white'}`}>
                  <FiHeart size={22} className={isFav ? 'fill-current' : ''} />
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full px-2">
                <div className="flex items-center gap-4 w-full">
                  <span className="text-[11px] font-bold text-white/25 w-10 text-right tabular-nums">{fmt(played * duration)}</span>
                  <div className="flex-1 h-[6px] relative">
                    <SeekBar refEl={fullSeekRef} played={played} onSeekStart={seekBound} />
                  </div>
                  <span className="text-[11px] font-bold text-white/25 w-10 tabular-nums">{fmt(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between w-full px-4 mb-2">
                <button className="w-10 h-10 flex items-center justify-center text-white/15 hover:text-white/50 transition-colors"><FiShuffle size={18} /></button>
                <div className="flex items-center gap-8 md:gap-12">
                  <button onClick={playPrevious} className="text-white/80 hover:text-white transition-colors active:scale-90"><FiSkipBack size={32} /></button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_12px_40px_rgba(255,255,255,0.25)]"
                  >
                    {isPlaying ? <FiPause size={28} className="fill-current" /> : <FiPlay size={28} className="fill-current ml-1" />}
                  </button>
                  <button onClick={handleNext} className="text-white/80 hover:text-white transition-colors active:scale-90"><FiSkipForward size={32} /></button>
                </div>
                <button className="w-10 h-10 flex items-center justify-center text-white/15 hover:text-white/50 transition-colors"><FiRepeat size={18} /></button>
              </div>

              {/* Volume (hidden on very small screens) */}
              <div className="hidden md:flex items-center gap-4 w-full px-4 py-2 bg-white/[0.03] rounded-2xl border border-white/5" onClick={e => e.stopPropagation()}>
                <button onClick={() => setIsMuted(!isMuted)} className="text-white/30 hover:text-white transition-colors shrink-0">
                  {isMuted || volume === 0 ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
                </button>
                <div
                  ref={fullVolumeRef}
                  className="flex-1 h-1 rounded-full cursor-pointer relative group"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                  onMouseDown={e => handleVolStart(e, fullVolumeRef)}
                  onTouchStart={e => handleVolStart(e, fullVolumeRef)}
                >
                  <div className="absolute top-0 left-0 h-full rounded-full bg-white" style={{ width: `${(isMuted ? 0 : volume) * 100}%` }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white scale-0 group-hover:scale-100 transition-transform shadow-lg" style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - 7px)` }} />
                </div>
              </div>
            </div>

            {/* Right Column — Up Next queue */}
            {playlist.length > 0 && (
              <div className="flex-1 w-full min-w-0 pb-10">
                <div className="flex items-center justify-between mb-6 px-1">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 mb-1">Queue</p>
                    <h3 className="text-xl font-bold text-white tracking-tight">Up Next</h3>
                  </div>
                  <button className="text-[11px] font-bold text-white/25 hover:text-white transition-colors uppercase tracking-widest">Clear</button>
                </div>

                <div className="space-y-1">
                  {playlist.map((song, idx) => {
                    const isCurrentSong = song.id === currentVideo.id;
                    return (
                      <div
                        key={`${song.id}-${idx}`}
                        onClick={() => setCurrentVideo(song, playlist)}
                        className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all group cursor-pointer ${isCurrentSong ? 'bg-white/[0.07] border border-white/5' : 'hover:bg-white/[0.04] border border-transparent'}`}
                      >
                        <span className="text-white/10 font-bold text-xs w-6 text-right tabular-nums shrink-0">{idx + 1}</span>
                        <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-lg">
                          <img src={song.image?.[0]?.link || song.image?.[1]?.link} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-[14px] font-bold truncate ${isCurrentSong ? 'text-white' : 'text-white/80 group-hover:text-white'}`}
                            dangerouslySetInnerHTML={{ __html: song.name }}
                          />
                          <p className="text-[12px] text-white/30 truncate mt-0.5 font-medium" dangerouslySetInnerHTML={{ __html: song.primaryArtists }} />
                        </div>
                        {isCurrentSong && isPlaying && (
                          <div className="flex items-end gap-[3px] h-4 shrink-0 mx-2">
                            {[1,2,3].map(i => (
                              <div key={i} className="w-[3px] bg-white rounded-full animate-[bounce_1s_infinite]" style={{ height: `${[10,14,8][i-1]}px`, animationDelay: `${i * 0.15}s` }} />
                            ))}
                          </div>
                        )}
                        <span className="text-white/20 text-[12px] font-bold tabular-nums shrink-0 ml-2">
                          .. {fmt((song.duration || 0) * 1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Player;
