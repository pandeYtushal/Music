import { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useToast } from '../hooks/useToast';
import { cleanText } from '../utils/text';
import { searchSongs } from '../api/saavn';
import { pickAudioUrl, pickImageUrl } from '../utils/media';
import { isSongAcceptable } from '../utils/library';

// Sub-components
import MiniPlayer from './player/MiniPlayer';
import DesktopPlayerBar from './player/DesktopPlayerBar';

const FullScreenPlayer = lazy(() => import('./player/FullScreenPlayer'));

// ── Helpers for smart recommendations ──
const getAllArtists = (song) =>
  (song?.primaryArtists || '')
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean);

const getMoodQuery = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 9) return 'morning calm acoustic';
  if (h >= 9 && h < 12) return 'upbeat energy hindi';
  if (h >= 12 && h < 15) return 'chill afternoon vibes';
  if (h >= 15 && h < 18) return 'feel good bollywood';
  if (h >= 18 && h < 21) return 'evening party hits';
  return 'late night lofi hindi';
};

const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ── Check if user is typing in any text input/editable element ──
const isInputFieldActive = () => {
  const activeEl = document.activeElement;
  if (!activeEl) return false;
  const tagName = activeEl.tagName.toUpperCase();
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    activeEl.isContentEditable ||
    activeEl.getAttribute('role') === 'textbox'
  );
};

const Player = () => {
  const {
    currentVideo, isPlaying, setIsPlaying, playNext, playPrevious,
    playlist, favorites, recentlyPlayed, toggleFavorite, autoplay, quality,
    shuffle, repeatMode, toggleShuffle, cycleRepeatMode,
    openAddToPlaylistModal, setCurrentVideo, currentIndex,
    addToQueue, playNextInQueue, removeFromQueue, clearQueue, reorderQueue,
  } = usePlayerStore();

  const toast = useToast();

  // ── Audio state ──
  const [played, setPlayed] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [shouldPrefetch, setShouldPrefetch] = useState(false);
  const [prevVideoId, setPrevVideoId] = useState(currentVideo?.id);
  if (currentVideo?.id !== prevVideoId) {
    setPrevVideoId(currentVideo?.id);
    setShouldPrefetch(false);
  }

  // ── Touch gesture state ──
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [miniTouchStart, setMiniTouchStart] = useState(null);
  const [miniFeedback, setMiniFeedback] = useState('');
  const isSwiping = useRef(false);

  // ── Refs ──
  const audioRef = useRef(null);
  const seekRef = useRef(null);
  const fullSeekRef = useRef(null);
  const barVolumeRef = useRef(null);
  const fullVolumeRef = useRef(null);
  const activeProgressRef = useRef(null);
  const activeVolumeRef = useRef(null);
  const miniGestureRef = useRef(false);

  // ── Derived values ──
  const audioUrl = pickAudioUrl(currentVideo?.downloadUrl, quality);
  const imageUrl = pickImageUrl(currentVideo?.image);
  const title = cleanText(currentVideo?.name, 'Unknown');
  const artist = cleanText(currentVideo?.primaryArtists || currentVideo?.label, 'Unknown Artist');
  const isFav = favorites.some((v) => v.id === currentVideo?.id);

  // ── Haptic pulse helper ──
  const pulse = useCallback((type = 'tap') => {
    setMiniFeedback(type);
    window.setTimeout(() => setMiniFeedback(''), 180);
    if (navigator.vibrate) navigator.vibrate(type === 'swipe' ? 18 : 8);
  }, []);

  // ── Next handler (with recommendation fallback) ──
  const handleNext = useCallback(() => {
    if (shuffle && playlist.length > 1) playNext();
    else if (currentIndex < playlist.length - 1) playNext();
    else if (repeatMode === 'all' && playlist.length > 0) playNext();
    else if (recommendedSongs.length > 0) {
      const nextRecommendation = shuffle
        ? recommendedSongs[Math.floor(Math.random() * recommendedSongs.length)]
        : recommendedSongs[0];
      setCurrentVideo(nextRecommendation, [...playlist, ...recommendedSongs]);
    }
  }, [shuffle, playlist, currentIndex, repeatMode, recommendedSongs, playNext, setCurrentVideo]);

  // ── Audio ended handler ──
  const handleEnded = useCallback(() => {
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
      return;
    }
    if (autoplay || repeatMode === 'all' || shuffle) handleNext();
    else setIsPlaying(false);
  }, [repeatMode, autoplay, shuffle, handleNext, setIsPlaying]);

  // ── Sync play/pause with isPlaying state ──
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // ── Sync volume and mute ──
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);


  // ── Helper to determine the next song to prefetch ──
  const getNextSong = useCallback(() => {
    if (repeatMode === 'one') {
      return currentVideo;
    }
    if (shuffle && playlist.length > 1) {
      const available = playlist.filter((_, idx) => idx !== currentIndex);
      if (available.length > 0) {
        return available[0];
      }
    }
    if (currentIndex < playlist.length - 1) {
      return playlist[currentIndex + 1];
    }
    if (repeatMode === 'all' && playlist.length > 0) {
      return playlist[0];
    }
    if (recommendedSongs.length > 0) {
      return recommendedSongs[0];
    }
    return null;
  }, [currentVideo, repeatMode, shuffle, playlist, currentIndex, recommendedSongs]);

  const nextSong = getNextSong();

  // ── Prefetch next track using an off-DOM Audio object (never renders to JSX) ──
  const prefetchRef = useRef(null);
  const prefetchUrlRef = useRef(null);
  useEffect(() => {
    if (!nextSong || !shouldPrefetch) {
      if (prefetchRef.current) {
        prefetchRef.current.src = '';
        prefetchRef.current = null;
        prefetchUrlRef.current = null;
      }
      return;
    }
    const url = pickAudioUrl(nextSong.downloadUrl, quality);
    if (!url || url === audioUrl || url === prefetchUrlRef.current) return;
    // Create a muted, non-playing Audio node purely to warm up the browser cache
    const prefetch = new Audio();
    prefetch.muted = true;
    prefetch.preload = 'auto';
    prefetch.src = url;
    prefetchRef.current = prefetch;
    prefetchUrlRef.current = url;
  }, [nextSong, shouldPrefetch, quality, audioUrl]);

  // ── Global Keyboard Shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isInputFieldActive()) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (audioRef.current) {
            const newTime = Math.max(0, audioRef.current.currentTime - 5);
            audioRef.current.currentTime = newTime;
            setPlayed(newTime / (duration || 1));
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (audioRef.current) {
            const newTime = Math.min(duration, audioRef.current.currentTime + 5);
            audioRef.current.currentTime = newTime;
            setPlayed(newTime / (duration || 1));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          {
            const newVol = Math.min(1, volume + 0.05);
            setVolume(newVol);
            toast(`Volume: ${Math.round(newVol * 100)}%`);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          {
            const newVol = Math.max(0, volume - 0.05);
            setVolume(newVol);
            toast(`Volume: ${Math.round(newVol * 100)}%`);
          }
          break;
        case 'KeyM':
          e.preventDefault();
          {
            const nextMuted = !isMuted;
            setIsMuted(nextMuted);
            toast(nextMuted ? 'Muted 🔇' : 'Unmuted 🔊');
          }
          break;
        case 'KeyN':
          e.preventDefault();
          handleNext();
          toast('Next Track ⏭️');
          break;
        case 'KeyP':
          e.preventDefault();
          playPrevious();
          toast('Previous Track ⏮️');
          break;
        case 'KeyS':
          e.preventDefault();
          toggleShuffle();
          toast(`Shuffle: ${!shuffle ? 'On 🔀' : 'Off ➡️'}`);
          break;
        case 'KeyR': {
          e.preventDefault();
          cycleRepeatMode();
          const modes = { off: 'All 🔁', all: 'One 🔂', one: 'Off ➡️' };
          toast(`Repeat: ${modes[repeatMode] || repeatMode}`);
          break;
        }
        case 'KeyF':
          e.preventDefault();
          if (currentVideo) {
            toggleFavorite(currentVideo);
            toast(isFav ? 'Removed from Favorites 🤍' : 'Added to Favorites ❤️');
          }
          break;
        case 'Escape':
          if (isExpanded) {
            e.preventDefault();
            setIsExpanded(false);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPlaying,
    setIsPlaying,
    duration,
    handleNext,
    playPrevious,
    toggleShuffle,
    shuffle,
    cycleRepeatMode,
    repeatMode,
    currentVideo,
    isFav,
    toggleFavorite,
    isExpanded,
    toast,
    volume,
    isMuted,
  ]);

  // ── Smart recommendation queries ──
  // Builds a diverse pool from: all co-artists, album names, language+mood,
  // co-artist discovery from recent history, and time-of-day vibes.
  const recommendationQueries = useMemo(() => {
    const queries = new Set();
    const recentSongs = [currentVideo, ...(recentlyPlayed || [])].filter(Boolean);

    // 1. All co-artists from current song (not just lead)
    //    e.g. "Arijit Singh, Mithoon" → "Arijit Singh songs", "Mithoon songs"
    if (currentVideo) {
      getAllArtists(currentVideo).forEach((a) => queries.add(`${a} songs`));
    }

    // 2. Album-based query — find more from the same album
    //    e.g. "Aashiqui 2 songs"
    if (currentVideo?.album?.name) {
      queries.add(`${cleanText(currentVideo.album.name)} songs`);
    }

    // 3. Co-artist discovery from recently played
    //    Grabs unique artists from last 5 songs for variety
    const recentArtists = new Set();
    recentSongs.slice(0, 5).forEach((song) => {
      getAllArtists(song).forEach((a) => recentArtists.add(a));
    });
    recentArtists.forEach((a) => queries.add(`${a} songs`));

    // 4. Language-aware popular songs and hits
    const lang = currentVideo?.language || 'hindi';
    queries.add(`${lang} popular songs`);
    queries.add(`${lang} hits`);

    // 5. Time-of-day mood query for ambient variety
    queries.add(getMoodQuery());

    // 6. Fallback if nothing else worked
    if (queries.size === 0) {
      queries.add('trending hindi hits');
      queries.add('top bollywood hits');
    }

    // Shuffle and cap at 5 queries to keep API calls reasonable
    // but ensure the current song's artists are always included first
    const currentArtistQueries = getAllArtists(currentVideo || {}).map((a) => `${a} songs`);
    const otherQueries = [...queries].filter((q) => !currentArtistQueries.includes(q));

    return [
      ...currentArtistQueries.slice(0, 2),
      ...shuffleArray(otherQueries),
    ].slice(0, 5);
  }, [currentVideo, recentlyPlayed]);

  const queueIds = useMemo(
    () => new Set([currentVideo?.id, ...playlist.map((song) => song.id)].filter(Boolean)),
    [currentVideo?.id, playlist],
  );

  // ── Debounced recommendation fetches ──
  useEffect(() => {
    let cancelled = false;
    const debounceTimer = setTimeout(async () => {
      try {
        setIsLoadingRecommendations(true);
        const responses = await Promise.allSettled(
          recommendationQueries.map((query) => searchSongs(query, { limit: 10 })),
        );

        const currentLang = currentVideo?.language;
        const allowedLangs = new Set(
          [currentLang, ...(recentlyPlayed || []).map(s => s.language)].filter(Boolean).map(l => l.toLowerCase())
        );

        const seen = new Set(queueIds);
        const merged = [];
        responses.forEach((response) => {
          if (response.status !== 'fulfilled') return;
          (response.value || []).forEach((song) => {
            if (!song?.id || seen.has(song.id)) return;

            // Filter out regional and devotional music
            if (!isSongAcceptable(song, currentLang, allowedLangs)) return;

            seen.add(song.id);
            merged.push(song);
          });
        });
        if (!cancelled) setRecommendedSongs(merged.slice(0, 12));
      } catch {
        if (!cancelled) setRecommendedSongs([]);
      } finally {
        if (!cancelled) setIsLoadingRecommendations(false);
      }
    }, 2000);
    return () => { cancelled = true; clearTimeout(debounceTimer); };
  }, [recommendationQueries, queueIds, currentVideo?.language, recentlyPlayed]);

  // ── Media Session API ──
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentVideo) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album: currentVideo?.album?.name || '',
      artwork: imageUrl ? [{ src: imageUrl, sizes: '512x512', type: 'image/jpeg' }] : [],
    });
    navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
    navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
    navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
    navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
    return () => {
      ['play', 'pause', 'previoustrack', 'nexttrack'].forEach((action) =>
        navigator.mediaSession.setActionHandler(action, null),
      );
    };
  }, [currentVideo, title, artist, imageUrl, playNext, playPrevious, setIsPlaying]);

  // ── Seek / volume drag logic ──
  const updateSeek = useCallback((clientX) => {
    if (!activeProgressRef.current) return;
    const rect = activeProgressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setPlayed(pct);
    if (audioRef.current && !isNaN(audioRef.current.duration))
      audioRef.current.currentTime = pct * audioRef.current.duration;
  }, []);

  const handleSeekStart = useCallback((e, ref) => {
    setIsSeeking(true);
    activeProgressRef.current = ref.current;
    updateSeek(e.clientX || e.touches?.[0]?.clientX);
  }, [updateSeek]);

  const updateVol = useCallback((clientX) => {
    if (!activeVolumeRef.current) return;
    const rect = activeVolumeRef.current.getBoundingClientRect();
    setVolume(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)));
  }, []);

  const handleVolStart = useCallback((e, ref) => {
    setIsDraggingVolume(true);
    activeVolumeRef.current = ref.current;
    updateVol(e.clientX || e.touches?.[0]?.clientX);
  }, [updateVol]);

  useEffect(() => {
    const onMove = (e) => {
      const x = e.clientX ?? e.touches?.[0]?.clientX;
      if (isSeeking) updateSeek(x);
      if (isDraggingVolume) updateVol(x);
    };
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
  }, [isSeeking, isDraggingVolume, updateSeek, updateVol]);

  // ── Swipe gestures (full-screen) ──
  const handleSwipeStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); isSwiping.current = false; };
  const handleSwipeMove = (e) => { setTouchEnd(e.targetTouches[0].clientX); if (touchStart && Math.abs(touchStart - e.targetTouches[0].clientX) > 10) isSwiping.current = true; };
  const handleSwipeEnd = () => { if (!touchStart || !touchEnd) return; const d = touchStart - touchEnd; if (d > 50) handleNext(); else if (d < -50) playPrevious(); };

  // ── Mini-player touch gestures ──
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
      miniGestureRef.current = true;
      pulse('swipe');
      setIsExpanded(true);
    } else if (absX > 52 && absX > absY) {
      miniGestureRef.current = true;
      pulse('swipe');
      if (dx < 0) handleNext();
      else playPrevious();
    }
    setMiniTouchStart(null);
  };

  // ── Share handler ──
  const handleShare = useCallback(() => {
    if (!currentVideo?.id) return;
    const url = `${window.location.origin}/play?id=${currentVideo.id}`;
    if (navigator.share) {
      navigator.share({ title: `Listen to ${title} on MeldMusic`, url }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      toast('Link copied to clipboard!');
    }
  }, [currentVideo, title, toast]);

  // ── Guard: nothing to render ──
  if (!currentVideo) return null;

  // ── Shared callback shorthands ──
  const onTogglePlay = () => setIsPlaying(!isPlaying);
  const onToggleFav = () => toggleFavorite(currentVideo);
  const onToggleMute = () => setIsMuted(!isMuted);

  return (
    <>
      {/* Audio element — keyed by URL so it fully remounts on song change */}
      {audioUrl && (
        <audio
          key={audioUrl}
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={() => {
            if (audioRef.current && !isNaN(audioRef.current.duration) && !isSeeking) {
              const current = audioRef.current.currentTime;
              const dur = audioRef.current.duration;
              const pct = current / dur || 0;
              setPlayed(pct);
              if (dur > 0) {
                if (dur - current < 20 || pct > 0.85) {
                  setShouldPrefetch(true);
                } else if (pct < 0.80) {
                  setShouldPrefetch(false);
                }
              }
            }
          }}
          onLoadedMetadata={() => {
            if (!audioRef.current) return;
            audioRef.current.volume = isMuted ? 0 : volume;
            setDuration(audioRef.current.duration);
            if (isPlaying) audioRef.current.play().catch(console.error);
          }}

          onEnded={handleEnded}
        />
      )}

      {/* Mobile mini player */}
      <MiniPlayer
        title={title}
        artist={artist}
        imageUrl={imageUrl}
        isPlaying={isPlaying}
        isFav={isFav}
        played={played}
        isExpanded={isExpanded}
        miniFeedback={miniFeedback}
        onTogglePlay={onTogglePlay}
        onToggleFav={onToggleFav}
        onNext={handleNext}
        onExpand={() => setIsExpanded(true)}
        onTouchStart={handleMiniTouchStart}
        onTouchEnd={handleMiniTouchEnd}
        miniGestureRef={miniGestureRef}
        pulse={pulse}
      />

      {/* Desktop bottom player bar */}
      <DesktopPlayerBar
        title={title}
        artist={artist}
        imageUrl={imageUrl}
        isPlaying={isPlaying}
        isFav={isFav}
        played={played}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        shuffle={shuffle}
        repeatMode={repeatMode}
        isExpanded={isExpanded}
        onTogglePlay={onTogglePlay}
        onToggleFav={onToggleFav}
        onNext={handleNext}
        onPrev={playPrevious}
        onToggleShuffle={toggleShuffle}
        onCycleRepeat={cycleRepeatMode}
        onExpand={() => setIsExpanded(true)}
        onToggleMute={onToggleMute}
        seekRef={seekRef}
        barVolumeRef={barVolumeRef}
        onSeekStart={handleSeekStart}
        onVolStart={handleVolStart}
      />

      {/* Full-screen player overlay */}
      <Suspense fallback={null}>
        <FullScreenPlayer
          title={title}
          artist={artist}
          imageUrl={imageUrl}
          currentVideo={currentVideo}
          isPlaying={isPlaying}
          isFav={isFav}
          played={played}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          shuffle={shuffle}
          repeatMode={repeatMode}
          isExpanded={isExpanded}
          playlist={playlist}
          currentIndex={currentIndex}
          recommendedSongs={recommendedSongs}
          isLoadingRecommendations={isLoadingRecommendations}
          autoplay={autoplay}
          onTogglePlay={onTogglePlay}
          onToggleFav={onToggleFav}
          onNext={handleNext}
          onPrev={playPrevious}
          onToggleShuffle={toggleShuffle}
          onCycleRepeat={cycleRepeatMode}
          onToggleMute={onToggleMute}
          onCollapse={() => setIsExpanded(false)}
          onShare={handleShare}
          onAddToPlaylist={openAddToPlaylistModal}
          onSetCurrentVideo={setCurrentVideo}
          onRemoveFromQueue={removeFromQueue}
          onClearQueue={clearQueue}
          onReorderQueue={reorderQueue}
          onPlayNextInQueue={playNextInQueue}
          onAddToQueue={addToQueue}
          fullSeekRef={fullSeekRef}
          fullVolumeRef={fullVolumeRef}
          onSeekStart={handleSeekStart}
          onVolStart={handleVolStart}
          onSwipeStart={handleSwipeStart}
          onSwipeMove={handleSwipeMove}
          onSwipeEnd={handleSwipeEnd}
        />
      </Suspense>
    </>
  );
};

export default Player;
