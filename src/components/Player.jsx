import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiVolume2, FiHeart, FiRepeat, FiShuffle,
  FiChevronDown, FiVolumeX, FiPlus, FiX, FiMaximize2
} from 'react-icons/fi';
import axios from 'axios';
import { cleanText } from '../utils/text';

/* ─── Global styles injected once ─────────────────────────────── */
const PLAYER_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --gold: #c9a96e;
    --gold-dim: rgba(201,169,110,0.18);
    --gold-glow: rgba(201,169,110,0.08);
    --ink: #0c0b09;
    --surface: rgba(18,16,12,0.97);
    --glass: rgba(255,255,255,0.035);
    --glass-border: rgba(255,255,255,0.07);
    --text-primary: rgba(255,255,255,0.93);
    --text-muted: rgba(201,169,110,0.45);
    --text-dim: rgba(255,255,255,0.2);
  }

  .player-font { font-family: 'DM Sans', sans-serif; }
  .player-display { font-family: 'Cormorant Garamond', serif; }

  @keyframes waveBar {
    0%,100% { transform: scaleY(0.4); }
    50% { transform: scaleY(1); }
  }
  @keyframes spinVinyl {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulseGold {
    0%,100% { box-shadow: 0 0 0 0 rgba(201,169,110,0.3); }
    50% { box-shadow: 0 0 0 8px rgba(201,169,110,0); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  .vinyl-spin { animation: spinVinyl 3s linear infinite; }
  .vinyl-paused { animation-play-state: paused; }

  .seek-track {
    background: linear-gradient(90deg, rgba(201,169,110,0.08) 0%, rgba(201,169,110,0.05) 100%);
    position: relative;
    overflow: visible;
  }
  .seek-track::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(90deg, transparent, rgba(201,169,110,0.06), transparent);
    background-size: 200% 100%;
    animation: shimmer 3s infinite;
  }

  .queue-item { animation: fadeSlideUp 0.3s ease both; }
  .queue-item:nth-child(1) { animation-delay: 0.05s; }
  .queue-item:nth-child(2) { animation-delay: 0.1s; }
  .queue-item:nth-child(3) { animation-delay: 0.15s; }
  .queue-item:nth-child(4) { animation-delay: 0.2s; }
  .queue-item:nth-child(5) { animation-delay: 0.25s; }

  .mini-player-shadow {
    box-shadow: 0 -12px 48px rgba(0,0,0,0.7), 0 -2px 0 rgba(201,169,110,0.12);
  }

  .gold-btn:active { transform: scale(0.92); }
  .play-btn-pulse:active { animation: pulseGold 0.4s ease; }

  .skeleton-gold {
    background: linear-gradient(90deg, rgba(201,169,110,0.05) 25%, rgba(201,169,110,0.1) 50%, rgba(201,169,110,0.05) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
`;

/* ─── Inject styles once ───────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('player-styles')) {
  const el = document.createElement('style');
  el.id = 'player-styles';
  el.textContent = PLAYER_STYLES;
  document.head.appendChild(el);
}

/* ─── Wave Animation for "now playing" ────────────────────────── */
const WaveBars = ({ playing, bars = 4, height = 12 }) => (
  <span className="flex items-end gap-[2.5px] shrink-0" style={{ height }}>
    {Array.from({ length: bars }).map((_, i) => (
      <span
        key={i}
        style={{
          width: 2.5,
          height: playing ? `${[55, 90, 65, 80][i % 4]}%` : '30%',
          borderRadius: 2,
          background: 'var(--gold)',
          transformOrigin: 'bottom',
          animation: playing ? `waveBar ${0.8 + i * 0.15}s ease-in-out infinite` : 'none',
          animationDelay: `${i * 0.12}s`,
          transition: 'height 0.4s ease',
          display: 'block',
        }}
      />
    ))}
  </span>
);

/* ─── Vinyl disc ornament ──────────────────────────────────────── */
const VinylDisc = ({ src, playing, size = 220 }) => (
  <div
    className="relative flex items-center justify-center shrink-0"
    style={{ width: size, height: size }}
  >
    {/* Outer glow */}
    <div
      className="absolute inset-0 rounded-full"
      style={{
        background: `radial-gradient(circle, rgba(201,169,110,0.12) 0%, transparent 70%)`,
        filter: 'blur(24px)',
        transform: 'scale(1.2)',
      }}
    />
    {/* Disc */}
    <div
      className={`relative rounded-full overflow-hidden ${playing ? 'vinyl-spin' : 'vinyl-paused vinyl-spin'}`}
      style={{
        width: '100%',
        height: '100%',
        boxShadow: '0 0 0 1px rgba(201,169,110,0.15), 0 24px 64px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      {/* Album art */}
      <img src={src} alt="" className="w-full h-full object-cover" />
      {/* Vinyl overlay rings */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(circle at 50% 50%, transparent 26%, rgba(0,0,0,0.45) 27%, rgba(0,0,0,0.35) 32%, transparent 33%),
          radial-gradient(circle at 50% 50%, transparent 38%, rgba(0,0,0,0.1) 39%, transparent 40%),
          radial-gradient(circle at 50% 50%, transparent 50%, rgba(0,0,0,0.07) 51%, transparent 52%)
        `,
      }} />
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{
          width: '28%',
          height: '28%',
          borderRadius: '50%',
          background: 'rgba(10,9,7,0.9)',
          border: '1px solid rgba(201,169,110,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '22%',
            height: '22%',
            borderRadius: '50%',
            background: 'var(--gold)',
            opacity: 0.8,
          }} />
        </div>
      </div>
    </div>
  </div>
);

/* ─── Seek bar ─────────────────────────────────────────────────── */
const SeekBar = ({ refEl, played, onSeekStart }) => (
  <div
    ref={refEl}
    className="flex-1 rounded-full cursor-pointer relative group seek-track"
    style={{ height: 4 }}
    onMouseDown={e => onSeekStart(e, refEl)}
    onTouchStart={e => onSeekStart(e, refEl)}
  >
    {/* Fill */}
    <div
      className="absolute top-0 left-0 h-full rounded-full transition-all duration-150"
      style={{
        width: `${played * 100}%`,
        background: 'linear-gradient(90deg, rgba(201,169,110,0.6), var(--gold))',
      }}
    />
    {/* Thumb */}
    <div
      className="absolute top-1/2 -translate-y-1/2 rounded-full scale-0 group-hover:scale-100 transition-transform duration-200"
      style={{
        width: 14,
        height: 14,
        left: `calc(${played * 100}% - 7px)`,
        background: 'var(--gold)',
        boxShadow: '0 0 10px rgba(201,169,110,0.6)',
      }}
    />
  </div>
);

/* ─── Control button ───────────────────────────────────────────── */
const ControlButton = ({ active, className = '', children, ...props }) => (
  <button
    className={`${className} relative transition-all gold-btn ${active ? '' : ''}`}
    style={{ color: active ? 'var(--gold)' : 'rgba(255,255,255,0.22)' }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.22)'; }}
    {...props}
  >
    {children}
    {active && (
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: 'var(--gold)' }} />
    )}
  </button>
);

/* ─── Play button ──────────────────────────────────────────────── */
const PlayButton = ({ playing, onClick, size = 'md' }) => {
  const dims = { sm: 44, md: 52, lg: 76 };
  const iconSizes = { sm: 16, md: 20, lg: 28 };
  const d = dims[size];
  const ic = iconSizes[size];

  return (
    <button
      onClick={onClick}
      className="play-btn-pulse gold-btn flex items-center justify-center rounded-full transition-all"
      style={{
        width: d, height: d,
        background: 'linear-gradient(135deg, #d4a96a 0%, #b8893e 100%)',
        boxShadow: `0 4px 24px rgba(201,169,110,0.35), inset 0 1px 0 rgba(255,255,255,0.2)`,
        color: '#1a1208',
        flexShrink: 0,
      }}
    >
      {playing
        ? <FiPause size={ic} className="fill-current" />
        : <FiPlay size={ic} className="fill-current" style={{ marginLeft: size === 'lg' ? 3 : 2 }} />
      }
    </button>
  );
};

/* ─── Time display ─────────────────────────────────────────────── */
const TimeStr = ({ val }) => (
  <span className="player-font tabular-nums" style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
    {val}
  </span>
);

/* ─── Helpers ──────────────────────────────────────────────────── */
const getLeadArtist = (song) => song?.primaryArtists?.split(',')?.[0]?.trim();
const fmt = s => {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
};

/* ─── Main Player ──────────────────────────────────────────────── */
const Player = () => {
  const {
    currentVideo, isPlaying, setIsPlaying, playNext, playPrevious,
    playlist, favorites, recentlyPlayed, toggleFavorite, autoplay, quality,
    shuffle, repeatMode, toggleShuffle, cycleRepeatMode,
    openAddToPlaylistModal, setCurrentVideo, currentIndex,
    addToQueue, playNextInQueue, removeFromQueue, clearQueue
  } = usePlayerStore();

  const [played, setPlayed] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [miniTouchStart, setMiniTouchStart] = useState(null);
  const [miniFeedback, setMiniFeedback] = useState('');
  const isSwiping = useRef(false);

  const audioRef = useRef(null);
  const seekRef = useRef(null);
  const fullSeekRef = useRef(null);
  const barVolumeRef = useRef(null);
  const fullVolumeRef = useRef(null);
  const activeProgressRef = useRef(null);
  const activeVolumeRef = useRef(null);
  const miniGestureRef = useRef(false);

  const handleNext = () => {
    if (shuffle && playlist.length > 1) playNext();
    else if (currentIndex < playlist.length - 1) playNext();
    else if (repeatMode === 'all' && playlist.length > 0) playNext();
    else if (recommendedSongs.length > 0) {
      const next = shuffle
        ? recommendedSongs[Math.floor(Math.random() * recommendedSongs.length)]
        : recommendedSongs[0];
      setCurrentVideo(next, [...playlist, ...recommendedSongs]);
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
      return;
    }
    if (autoplay || repeatMode === 'all' || shuffle) handleNext();
    else setIsPlaying(false);
  };

  const pulse = (type = 'tap') => {
    setMiniFeedback(type);
    window.setTimeout(() => setMiniFeedback(''), 180);
    if (navigator.vibrate) navigator.vibrate(type === 'swipe' ? 18 : 8);
  };

  const handleSwipeStart = e => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); isSwiping.current = false; };
  const handleSwipeMove = e => { setTouchEnd(e.targetTouches[0].clientX); if (touchStart && Math.abs(touchStart - e.targetTouches[0].clientX) > 10) isSwiping.current = true; };
  const handleSwipeEnd = () => { if (!touchStart || !touchEnd) return; const d = touchStart - touchEnd; if (d > 50) handleNext(); else if (d < -50) playPrevious(); };

  const handleMiniTouchStart = (e) => {
    const touch = e.targetTouches[0];
    setMiniTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchEnd(null);
  };

  const handleMiniTouchEnd = (e) => {
    if (!miniTouchStart) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - miniTouchStart.x;
    const dy = touch.clientY - miniTouchStart.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (absY > 42 && absY > absX && dy < 0) {
      miniGestureRef.current = true; pulse('swipe'); setIsExpanded(true);
    } else if (absX > 52 && absX > absY) {
      miniGestureRef.current = true; pulse('swipe');
      if (dx < 0) handleNext(); else playPrevious();
    }
    setMiniTouchStart(null);
  };

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
    if (isPlaying) audioRef.current.play().catch(console.error);
    else audioRef.current.pause();
  }, [isPlaying, currentVideo, volume, isMuted]);

  useEffect(() => {
    let cancelled = false;
    const fetchRecommendations = async () => {
      const artistSeeds = [currentVideo, ...(recentlyPlayed || [])].map(getLeadArtist).filter(Boolean);
      const uniqueSeeds = [...new Set(artistSeeds)].slice(0, 5);
      const queries = uniqueSeeds.length > 0 ? uniqueSeeds.map(a => `${a} songs`) : ['trending india'];
      const queueIds = new Set([currentVideo?.id, ...playlist.map(s => s.id)].filter(Boolean));
      try {
        setIsLoadingRecommendations(true);
        const responses = await Promise.allSettled(queries.map(q => axios.get('https://jio-saavn-api-sigma.vercel.app/search/songs', { params: { query: q, limit: 10 } })));
        const seen = new Set(queueIds);
        const merged = [];
        responses.forEach(r => {
          if (r.status !== 'fulfilled') return;
          (r.value.data?.data?.results || []).forEach(song => {
            if (!song?.id || seen.has(song.id)) return;
            seen.add(song.id); merged.push(song);
          });
        });
        if (!cancelled) setRecommendedSongs(merged.slice(0, 12));
      } catch { if (!cancelled) setRecommendedSongs([]); }
      finally { if (!cancelled) setIsLoadingRecommendations(false); }
    };
    fetchRecommendations();
    return () => { cancelled = true; };
  }, [currentVideo, recentlyPlayed, playlist]);

  const updateSeek = clientX => {
    if (!activeProgressRef.current) return;
    const rect = activeProgressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
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
    const onUp = () => { setIsSeeking(false); setIsDraggingVolume(false); };
    if (isSeeking || isDraggingVolume) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isSeeking, isDraggingVolume]);

  if (!currentVideo) return null;

  const audioUrl = (!currentVideo?.downloadUrl?.length) ? '' : (currentVideo.downloadUrl.find(d => d.quality === quality) || currentVideo.downloadUrl[currentVideo.downloadUrl.length - 1]).link;
  const imageUrl = currentVideo?.image?.[2]?.link || currentVideo?.image?.[1]?.link || currentVideo?.image?.[0]?.link || '';
  const title = cleanText(currentVideo?.name, 'Unknown');
  const artist = cleanText(currentVideo?.primaryArtists || currentVideo?.label, 'Unknown Artist');
  const isFav = favorites.some(v => v.id === currentVideo.id);
  const seekBound = (e, ref) => handleSeekStart(e, ref);
  const volPct = (isMuted ? 0 : volume) * 100;

  return (
    <>
      <audio
        ref={audioRef}
        src={audioUrl}
        autoPlay
        onTimeUpdate={() => {
          if (audioRef.current && !isNaN(audioRef.current.duration) && !isSeeking)
            setPlayed(audioRef.current.currentTime / audioRef.current.duration || 0);
        }}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* ── Mobile mini-player ─────────────────────────────────────── */}
      <div
        className={`player-font md:hidden fixed left-0 right-0 z-[100] transition-all duration-500 ease-out
          ${isExpanded ? 'bottom-0 opacity-0 pointer-events-none' : 'bottom-[75px] opacity-100'}
          ${miniFeedback ? 'scale-[0.982]' : 'scale-100'}`}
        onClick={() => {
          if (miniGestureRef.current) { miniGestureRef.current = false; return; }
          pulse(); setIsExpanded(true);
        }}
        onTouchStart={handleMiniTouchStart}
        onTouchEnd={handleMiniTouchEnd}
      >
        <div
          className="relative mx-auto max-w-[460px] flex items-center px-3.5 gap-3.5 mini-player-shadow"
          style={{
            height: 68,
            background: 'linear-gradient(135deg, rgba(22,19,13,0.98) 0%, rgba(15,13,9,0.98) 100%)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            borderTop: '1px solid rgba(201,169,110,0.15)',
            borderLeft: '1px solid rgba(201,169,110,0.06)',
            borderRight: '1px solid rgba(201,169,110,0.06)',
            touchAction: 'pan-y',
          }}
        >
          {/* Album art with vinyl ring */}
          <div className="relative w-11 h-11 shrink-0">
            <div className={`absolute inset-0 rounded-full ${isPlaying ? 'vinyl-spin' : ''}`}
              style={{ border: '1.5px solid rgba(201,169,110,0.25)' }}
            />
            <div className="w-10 h-10 rounded-full overflow-hidden absolute top-[2px] left-[2px]"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Track info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              {isPlaying && <WaveBars playing={true} bars={3} height={10} />}
              <p className="player-font text-[13px] font-medium truncate leading-tight" style={{ color: 'var(--text-primary)' }}>{title}</p>
            </div>
            <p className="player-font text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{artist}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { pulse(); toggleFavorite(currentVideo); }}
              className="w-9 h-9 flex items-center justify-center rounded-full gold-btn transition-all"
              style={{ color: isFav ? 'var(--gold)' : 'rgba(255,255,255,0.3)' }}
            >
              <FiHeart size={16} className={isFav ? 'fill-current' : ''} />
            </button>
            <PlayButton playing={isPlaying} onClick={() => { pulse(); setIsPlaying(!isPlaying); }} size="sm" />
            <button
              onClick={() => { pulse('swipe'); handleNext(); }}
              className="hidden min-[390px]:flex w-9 h-9 items-center justify-center rounded-full gold-btn transition-all"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              <FiSkipForward size={16} />
            </button>
          </div>

          {/* Gold progress line at top */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'rgba(201,169,110,0.07)' }}>
            <div
              className="h-full transition-none"
              style={{
                width: `${played * 100}%`,
                background: 'linear-gradient(90deg, rgba(201,169,110,0.5), var(--gold))',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Desktop bottom bar ────────────────────────────────────── */}
      <div
        className={`player-font hidden md:block fixed left-0 right-0 z-[100] transition-all duration-300
          ${isExpanded ? 'bottom-0 opacity-0 pointer-events-none' : 'bottom-0 opacity-100'}`}
        style={{
          height: 88,
          background: 'linear-gradient(180deg, rgba(20,17,11,0.98) 0%, rgba(12,11,9,0.99) 100%)',
          backdropFilter: 'blur(44px)',
          WebkitBackdropFilter: 'blur(44px)',
          borderTop: '1px solid rgba(201,169,110,0.12)',
        }}
      >
        <div
          className="grid items-center h-full px-5 lg:px-8 gap-4 lg:gap-6 max-w-[1800px] mx-auto"
          style={{ gridTemplateColumns: 'minmax(210px,1fr) minmax(340px,1.3fr) minmax(170px,1fr)' }}
        >
          {/* Left: Track info */}
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Thumbnail with vinyl ring */}
            <div
              className="relative shrink-0 cursor-pointer"
              style={{ width: 52, height: 52 }}
              onClick={() => setIsExpanded(true)}
            >
              <div
                className={`absolute inset-0 rounded-full ${isPlaying ? 'vinyl-spin' : ''}`}
                style={{ border: '1.5px solid rgba(201,169,110,0.2)' }}
              />
              <div
                className="absolute rounded-full overflow-hidden"
                style={{ inset: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.7)' }}
              >
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="player-display font-semibold truncate leading-tight cursor-pointer hover:underline"
                style={{ fontSize: 15, color: 'var(--text-primary)', textDecorationColor: 'var(--gold)' }}
                onClick={() => setIsExpanded(true)}
              >
                {title}
              </p>
              <p className="player-font text-[11px] font-medium truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {artist}
              </p>
            </div>

            <button
              onClick={() => toggleFavorite(currentVideo)}
              className="p-2 gold-btn transition-all shrink-0 ml-1"
              style={{ color: isFav ? 'var(--gold)' : 'rgba(255,255,255,0.2)' }}
            >
              <FiHeart size={15} className={isFav ? 'fill-current' : ''} />
            </button>
          </div>

          {/* Center: Controls + seek */}
          <div className="flex flex-col items-center gap-2 min-w-0">
            {/* Transport */}
            <div className="flex items-center gap-5 lg:gap-7">
              <ControlButton active={shuffle} onClick={toggleShuffle}><FiShuffle size={15} /></ControlButton>
              <button
                onClick={playPrevious}
                className="gold-btn transition-all"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              >
                <FiSkipBack size={19} />
              </button>
              <PlayButton playing={isPlaying} onClick={() => setIsPlaying(!isPlaying)} size="md" />
              <button
                onClick={handleNext}
                className="gold-btn transition-all"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              >
                <FiSkipForward size={19} />
              </button>
              <ControlButton active={repeatMode !== 'off'} onClick={cycleRepeatMode}>
                <FiRepeat size={15} />
                {repeatMode === 'one' && (
                  <span className="absolute -right-1 -top-1 text-[8px] font-black" style={{ color: 'var(--gold)' }}>1</span>
                )}
              </ControlButton>
            </div>

            {/* Seek row */}
            <div className="flex items-center gap-3 w-full max-w-2xl">
              <TimeStr val={fmt(played * duration)} />
              <SeekBar refEl={seekRef} played={played} onSeekStart={seekBound} />
              <TimeStr val={fmt(duration)} />
            </div>
          </div>

          {/* Right: Volume + expand */}
          <div className="flex items-center gap-2 lg:gap-3 justify-end min-w-0">
            <button
              onClick={() => setIsExpanded(true)}
              className="p-2 rounded-xl gold-btn transition-all"
              style={{ color: 'rgba(255,255,255,0.25)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
              title="Full screen"
            >
              <FiMaximize2 size={16} />
            </button>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="gold-btn transition-all"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
              >
                {isMuted || volume === 0 ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
              </button>
              <div
                ref={barVolumeRef}
                className="hidden lg:block rounded-full cursor-pointer relative"
                style={{
                  width: 84, height: 4,
                  background: 'rgba(201,169,110,0.1)',
                }}
                onMouseDown={e => handleVolStart(e, barVolumeRef)}
                onTouchStart={e => handleVolStart(e, barVolumeRef)}
              >
                <div
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{
                    width: `${volPct}%`,
                    background: 'linear-gradient(90deg, rgba(201,169,110,0.6), var(--gold))',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top edge gold line */}
        <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,169,110,0.25) 30%, rgba(201,169,110,0.25) 70%, transparent 100%)' }} />
      </div>

      {/* ── Full-screen overlay ───────────────────────────────────── */}
      <div
        className={`player-font fixed inset-0 z-[200] flex flex-col transition-all duration-500 ease-out
          ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}
        style={{ background: '#0e0c08' }}
      >
        {/* Blurred album art bg */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img src={imageUrl} alt="" className="w-full h-full object-cover scale-[1.4] blur-[90px]" style={{ opacity: 0.08 }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(14,12,8,0.55) 0%, rgba(10,9,6,0.92) 60%, #0a0906 100%)' }} />
          {/* Grain overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
            opacity: 0.4,
          }} />
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-6 md:pt-8 pb-3 shrink-0">
          <button
            onClick={() => setIsExpanded(false)}
            className="w-11 h-11 rounded-2xl flex items-center justify-center gold-btn transition-all"
            style={{
              color: 'rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <FiChevronDown size={22} />
          </button>

          <div className="text-center">
            <p className="player-font font-medium uppercase tracking-[0.35em]" style={{ fontSize: 9, color: 'rgba(201,169,110,0.4)' }}>
              Now Playing
            </p>
          </div>

          <button
            onClick={() => openAddToPlaylistModal(currentVideo)}
            className="w-11 h-11 rounded-2xl flex items-center justify-center gold-btn transition-all"
            style={{
              color: 'rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <FiPlus size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div
          className="relative z-10 flex-1 overflow-y-auto scrollbar-hide"
          onTouchStart={handleSwipeStart}
          onTouchMove={handleSwipeMove}
          onTouchEnd={handleSwipeEnd}
        >
          <div
            className="flex flex-col xl:flex-row items-center xl:items-start gap-8 xl:gap-12 px-6 md:px-10 py-4 md:py-8 mx-auto"
            style={{ maxWidth: 1200 }}
          >
            {/* Left: Art + controls */}
            <div className="flex flex-col items-center gap-6 xl:sticky xl:top-0 w-full xl:w-auto shrink-0" style={{ maxWidth: 420 }}>

              {/* Vinyl disc */}
              <div style={{ width: '100%', maxWidth: 380 }}>
                <VinylDisc
                  src={imageUrl}
                  playing={isPlaying}
                  size={typeof window !== 'undefined' && window.innerWidth < 768 ? Math.min(window.innerWidth - 80, 320) : 380}
                />
              </div>

              {/* Track info + heart */}
              <div className="flex items-start justify-between gap-4 w-full px-1">
                <div className="min-w-0">
                  <h2
                    className="player-display font-semibold leading-tight line-clamp-1"
                    style={{ fontSize: 28, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
                  >
                    {title}
                  </h2>
                  <p className="player-font font-medium truncate mt-1" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {artist}
                  </p>
                </div>
                <button
                  onClick={() => toggleFavorite(currentVideo)}
                  className="shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl gold-btn transition-all"
                  style={{
                    color: isFav ? 'var(--gold)' : 'rgba(255,255,255,0.2)',
                    background: isFav ? 'var(--gold-glow)' : 'transparent',
                    border: `1px solid ${isFav ? 'rgba(201,169,110,0.25)' : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  <FiHeart size={20} className={isFav ? 'fill-current' : ''} />
                </button>
              </div>

              {/* Seek bar */}
              <div className="w-full px-1">
                <div className="flex items-center gap-3.5 w-full">
                  <TimeStr val={fmt(played * duration)} />
                  <SeekBar refEl={fullSeekRef} played={played} onSeekStart={seekBound} />
                  <TimeStr val={fmt(duration)} />
                </div>
              </div>

              {/* Transport controls */}
              <div className="flex items-center justify-between w-full px-2 mb-1">
                <ControlButton active={shuffle} onClick={toggleShuffle} className="w-11 h-11 flex items-center justify-center active:scale-95">
                  <FiShuffle size={17} />
                </ControlButton>

                <div className="flex items-center gap-6 md:gap-10">
                  <button
                    onClick={playPrevious}
                    className="w-12 h-12 flex items-center justify-center gold-btn transition-all"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    <FiSkipBack size={28} />
                  </button>
                  <PlayButton playing={isPlaying} onClick={() => setIsPlaying(!isPlaying)} size="lg" />
                  <button
                    onClick={handleNext}
                    className="w-12 h-12 flex items-center justify-center gold-btn transition-all"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    <FiSkipForward size={28} />
                  </button>
                </div>

                <ControlButton active={repeatMode !== 'off'} onClick={cycleRepeatMode} className="w-11 h-11 flex items-center justify-center active:scale-95">
                  <FiRepeat size={17} />
                  {repeatMode === 'one' && (
                    <span className="absolute right-1 top-1 text-[8px] font-black leading-none" style={{ color: 'var(--gold)' }}>1</span>
                  )}
                </ControlButton>
              </div>

              {/* Volume (desktop only) */}
              <div
                className="hidden md:flex items-center gap-3.5 w-full px-4 py-3 rounded-2xl"
                style={{
                  background: 'rgba(201,169,110,0.04)',
                  border: '1px solid rgba(201,169,110,0.1)',
                }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="gold-btn transition-all shrink-0"
                  style={{ color: 'rgba(201,169,110,0.5)' }}
                >
                  {isMuted || volume === 0 ? <FiVolumeX size={15} /> : <FiVolume2 size={15} />}
                </button>
                <div
                  ref={fullVolumeRef}
                  className="flex-1 rounded-full cursor-pointer relative group"
                  style={{ height: 4, background: 'rgba(201,169,110,0.1)' }}
                  onMouseDown={e => handleVolStart(e, fullVolumeRef)}
                  onTouchStart={e => handleVolStart(e, fullVolumeRef)}
                >
                  <div
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{
                      width: `${volPct}%`,
                      background: 'linear-gradient(90deg, rgba(201,169,110,0.5), var(--gold))',
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 rounded-full scale-0 group-hover:scale-100 transition-transform"
                    style={{
                      width: 13, height: 13,
                      left: `calc(${volPct}% - 6.5px)`,
                      background: 'var(--gold)',
                      boxShadow: '0 0 8px rgba(201,169,110,0.5)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Queue */}
            {playlist.length > 0 && (
              <div className="flex-1 w-full min-w-0 pb-10">
                {/* Queue header */}
                <div className="flex items-center justify-between mb-6 px-1">
                  <div>
                    <p className="player-font font-semibold uppercase tracking-[0.3em] mb-1" style={{ fontSize: 9, color: 'rgba(201,169,110,0.3)' }}>
                      Queue
                    </p>
                    <h3 className="player-display font-semibold tracking-tight" style={{ fontSize: 22, color: 'var(--text-primary)' }}>
                      Up Next
                    </h3>
                  </div>
                  <button
                    onClick={clearQueue}
                    className="player-font font-semibold uppercase tracking-widest gold-btn transition-all"
                    style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
                  >
                    Clear
                  </button>
                </div>

                {/* Queue items */}
                <div className="space-y-1">
                  {playlist.map((song, idx) => {
                    const isCurrent = song.id === currentVideo.id;
                    return (
                      <div
                        key={`${song.id}-${idx}`}
                        onClick={() => setCurrentVideo(song, playlist)}
                        className="queue-item flex items-center gap-3.5 px-3.5 py-3 rounded-2xl cursor-pointer group transition-all"
                        style={{
                          background: isCurrent ? 'rgba(201,169,110,0.06)' : 'transparent',
                          border: `1px solid ${isCurrent ? 'rgba(201,169,110,0.15)' : 'transparent'}`,
                        }}
                        onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                        onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span className="font-bold text-right tabular-nums shrink-0" style={{ fontSize: 11, color: 'rgba(255,255,255,0.1)', width: 22 }}>
                          {idx + 1}
                        </span>
                        <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                          <img src={song.image?.[0]?.link || song.image?.[1]?.link} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="player-font font-medium truncate" style={{ fontSize: 13, color: isCurrent ? 'var(--text-primary)' : 'rgba(255,255,255,0.72)' }}>
                            {cleanText(song.name, 'Unknown Song')}
                          </p>
                          <p className="player-font truncate mt-0.5" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {cleanText(song.primaryArtists, 'Unknown Artist')}
                          </p>
                        </div>
                        {isCurrent && isPlaying && <WaveBars playing={true} bars={4} height={16} />}
                        <span className="tabular-nums shrink-0 ml-2" style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.18)' }}>
                          {fmt((song.duration || 0) * 1)}
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); removeFromQueue(song.id, idx); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center gold-btn transition-all opacity-0 group-hover:opacity-100"
                          style={{ color: 'rgba(255,255,255,0.2)' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#e05050'; e.currentTarget.style.background = 'rgba(224,80,80,0.08)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'transparent'; }}
                        >
                          <FiX size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Recommendations */}
                {(isLoadingRecommendations || recommendedSongs.length > 0 || autoplay) && (
                  <div className="mt-10">
                    <div className="mb-5 px-1">
                      <p className="player-font font-semibold uppercase tracking-[0.3em] mb-1" style={{ fontSize: 9, color: 'rgba(201,169,110,0.3)' }}>
                        Autoplay
                      </p>
                      <h3 className="player-display font-semibold tracking-tight" style={{ fontSize: 20, color: 'var(--text-primary)' }}>
                        From Your Listening
                      </h3>
                    </div>

                    {isLoadingRecommendations ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex items-center gap-3.5 p-3.5 rounded-2xl" style={{ border: '1px solid rgba(201,169,110,0.05)', background: 'rgba(201,169,110,0.02)' }}>
                            <div className="w-11 h-11 rounded-xl skeleton-gold shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 rounded-full skeleton-gold" style={{ width: '60%' }} />
                              <div className="h-2.5 rounded-full skeleton-gold" style={{ width: '35%' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : recommendedSongs.length > 0 ? (
                      <div className="space-y-1">
                        {recommendedSongs.slice(0, 8).map((song, idx) => (
                          <div
                            key={`${song.id}-rec-${idx}`}
                            onClick={() => setCurrentVideo(song, [...playlist, ...recommendedSongs])}
                            className="queue-item flex items-center gap-3.5 px-3.5 py-3 rounded-2xl cursor-pointer group transition-all"
                            style={{ border: '1px solid transparent' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span className="font-bold text-right tabular-nums shrink-0" style={{ fontSize: 11, color: 'rgba(255,255,255,0.08)', width: 22 }}>
                              {idx + 1}
                            </span>
                            <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                              <img src={song.image?.[0]?.link || song.image?.[1]?.link} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="player-font font-medium truncate" style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>
                                {cleanText(song.name, 'Unknown Song')}
                              </p>
                              <p className="player-font truncate mt-0.5" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                {cleanText(song.primaryArtists, 'Unknown Artist')}
                              </p>
                            </div>
                            <span className="tabular-nums shrink-0 ml-2" style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.15)' }}>
                              {fmt((song.duration || 0) * 1)}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={e => { e.stopPropagation(); playNextInQueue(song); }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center gold-btn transition-all"
                                style={{ color: 'rgba(255,255,255,0.25)' }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.background = 'var(--gold-glow)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'transparent'; }}
                                title="Play next"
                              >
                                <FiSkipForward size={14} />
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); addToQueue(song); }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center gold-btn transition-all"
                                style={{ color: 'rgba(255,255,255,0.25)' }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.background = 'var(--gold-glow)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'transparent'; }}
                                title="Add to queue"
                              >
                                <FiPlus size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl p-5 text-center" style={{ border: '1px solid rgba(201,169,110,0.08)', background: 'rgba(201,169,110,0.02)' }}>
                        <p className="player-font font-semibold" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Recommendations are warming up</p>
                        <p className="player-font mt-1" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          Play a few more songs and Melody will build a better queue.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Player;