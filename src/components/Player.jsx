import { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useToast } from '../hooks/useToast';
import { cleanText } from '../utils/text';
import { searchSongs } from '../api/saavn';
import { pickAudioUrl, pickImageUrl, isYouTubeId } from '../utils/media';
import { isSongAcceptable } from '../utils/library';
import { ytPlayer, YT_STATE } from '../utils/youtube-player';

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

const getMoodPool = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 9) return ['sunrise acoustic', 'morning chill indie', 'soft coffeehouse'];
  if (h >= 9 && h < 12) return ['upbeat energy hits', 'feel good pop', 'workout motivation'];
  if (h >= 12 && h < 15) return ['afternoon chill vibes', 'smooth R&B', 'mellow indie'];
  if (h >= 15 && h < 18) return ['golden hour bollywood', 'feel good classics', 'drive time hits'];
  if (h >= 18 && h < 21) return ['evening party anthems', 'dance floor energy', 'club remixes'];
  return ['late night lofi', 'midnight neo soul', 'dark ambient chill'];
};

const getVibeQueries = (lang) => {
  const L = (lang || 'hindi').toLowerCase();
  const vibes = [
    `${L} deep cuts`,
    `${L} underrated gems`,
    `${L} viral hits 2024`,
    `${L} radio remixes`,
    `similar to ${L} hits`,
  ];
  return vibes;
};

const topArtistsFromHistory = (songs, limit = 4) => {
  const counts = new Map();
  (songs || []).forEach((song) => {
    getAllArtists(song).forEach((artist) => {
      counts.set(artist, (counts.get(artist) || 0) + 1);
    });
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([artist]) => artist);
};

const scoreRecommendation = (song, { currentVideo, favoriteArtists, recentArtists }) => {
  let score = Math.random() * 0.4; // light shuffle spice
  const artists = getAllArtists(song).map((a) => a.toLowerCase());
  const currentArtists = getAllArtists(currentVideo).map((a) => a.toLowerCase());

  if (artists.some((a) => currentArtists.includes(a))) score += 3;
  if (artists.some((a) => favoriteArtists.has(a))) score += 2.5;
  if (artists.some((a) => recentArtists.has(a))) score += 1.5;
  if (song.language && currentVideo?.language &&
      song.language.toLowerCase() === currentVideo.language.toLowerCase()) score += 1;
  if (currentVideo?.album?.name && song.album?.name &&
      song.album.name.toLowerCase() === currentVideo.album.name.toLowerCase()) score += 2;
  return score;
};

const interleaveBySource = (buckets, limit) => {
  const result = [];
  const seen = new Set();
  let added = true;
  while (result.length < limit && added) {
    added = false;
    for (const bucket of buckets) {
      while (bucket.length > 0) {
        const song = bucket.shift();
        if (!song?.id || seen.has(song.id)) continue;
        seen.add(song.id);
        result.push(song);
        added = true;
        break;
      }
      if (result.length >= limit) break;
    }
  }
  return result;
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

  // isYTSource: song has no Saavn stream URL but ID looks like a YouTube video ID
  const isYTSource = !audioUrl && isYouTubeId(currentVideo?.id);

  // ── YouTube player refs ──
  const ytPlayerRef = useRef(null);       // tracks the current YT video ID loaded
  const ytDurationRef = useRef(0);        // caches YT duration to avoid repeated IPC calls

  // ── Haptic pulse helper ──
  const pulse = useCallback((type = 'tap') => {
    setMiniFeedback(type);
    window.setTimeout(() => setMiniFeedback(''), 180);
    if (navigator.vibrate) navigator.vibrate(type === 'swipe' ? 18 : 8);
  }, []);

  // ── Init YouTube IFrame API on mount ──────────────────────────
  // Pre-load the YT IFrame API eagerly (no callbacks yet) so the script
  // is already fetched and the player is warm before any YT song plays.
  useEffect(() => {
    // Kick off API load immediately — no callbacks needed at this stage
    ytPlayer.init({});

    // Re-init with actual callbacks once the component is ready
    ytPlayer.init({
      onStateChange: (state) => {
        if (state === YT_STATE.PLAYING) {
          setIsPlaying(true);
          // capture duration once we know it
          const dur = ytPlayer.getDuration();
          if (dur > 0) {
            ytDurationRef.current = dur;
            setDuration(dur);
          }
        } else if (state === YT_STATE.PAUSED) {
          setIsPlaying(false);
        } else if (state === YT_STATE.ENDED) {
          handleEnded();
        }
      },
      onProgress: ({ current, total }) => {
        if (total > 0) {
          if (ytDurationRef.current !== total) {
            ytDurationRef.current = total;
            setDuration(total);
          }
          setPlayed(current / total);
          // trigger prefetch near end
          if (total - current < 20 || current / total > 0.85) {
            setShouldPrefetch(true);
          } else if (current / total < 0.80) {
            setShouldPrefetch(false);
          }
        }
      },
      onError: (code) => {
        console.warn('[YT IFrame] playback error, code:', code);
        // Auto-advance on unplayable video errors (101, 150)
        if (code === 101 || code === 150 || code === 5 || code === 2) {
          handleEnded();
        }
      },
    });
    // Cleanup on unmount
    return () => ytPlayer.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (repeatMode === 'one') {
      if (isYTSource) {
        ytPlayer.seekTo(0);
        ytPlayer.resume();
      } else if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
      return;
    }
    if (autoplay || repeatMode === 'all' || shuffle) handleNext();
    else setIsPlaying(false);
  }, [repeatMode, autoplay, shuffle, handleNext, setIsPlaying, isYTSource]);

  // ── Load YouTube video when current song changes (YT source) ──
  useEffect(() => {
    if (!isYTSource || !currentVideo?.id) {
      // Switching AWAY from a YT source — stop the YT player so its ENDED
      // event doesn't fire later and trigger an unexpected handleNext()
      if (!isYTSource) ytPlayer.pause();
      return;
    }
    // Only reload if the video actually changed
    if (ytPlayerRef.current === currentVideo.id) return;
    ytPlayerRef.current = currentVideo.id;
    ytDurationRef.current = 0;
    setPlayed(0);
    setDuration(0);
    // Always autoplay on song change — the store always sets isPlaying=true on setCurrentVideo
    ytPlayer.play(currentVideo.id, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideo?.id, isYTSource]);

  // ── Sync play/pause with isPlaying state ──
  useEffect(() => {
    if (isYTSource) {
      // YouTube engine
      if (isPlaying) {
        ytPlayer.resume();
      } else {
        ytPlayer.pause();
      }
      return;
    }
    // Saavn <audio> engine
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, isYTSource]);

  // ── Sync volume and mute ──
  useEffect(() => {
    if (isYTSource) {
      if (isMuted) {
        ytPlayer.mute();
      } else {
        ytPlayer.unMute();
        ytPlayer.setVolume(Math.round(volume * 100));
      }
      return;
    }
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted, isYTSource]);


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
            setIsExpanded((expanded) => !expanded);
            toast(isExpanded ? 'Compact player' : 'Full-screen player');
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
    isExpanded,
    toast,
    volume,
    isMuted,
  ]);

  // ── Smart recommendation queries ──
  // Lean set: 3 queries max to keep background traffic minimal
  const recommendationQueries = useMemo(() => {
    const queries = [];
    const lang = currentVideo?.language || 'hindi';
    const history = [currentVideo, ...(recentlyPlayed || []), ...(favorites || [])].filter(Boolean);

    // Current track — top artist (highest relevance)
    const topArtist = getAllArtists(currentVideo || {})[0];
    if (topArtist) {
      queries.push({ q: `${topArtist} songs`, bucket: 'artist' });
    }

    // Taste: top artist from listening history
    const tasteArtist = topArtistsFromHistory(history, 2).find(a => a !== topArtist);
    if (tasteArtist) {
      queries.push({ q: `${tasteArtist} hits`, bucket: 'taste' });
    }

    // Mood of the moment
    const mood = shuffleArray(getMoodPool())[0];
    queries.push({ q: `${mood} ${lang}`, bucket: 'mood' });

    // Dedupe by query string
    const seen = new Set();
    return queries.filter(({ q }) => {
      if (seen.has(q)) return false;
      seen.add(q);
      return true;
    }).slice(0, 3);
  }, [currentVideo, recentlyPlayed, favorites]);

  const queueIds = useMemo(
    () => new Set([currentVideo?.id, ...playlist.map((song) => song.id)].filter(Boolean)),
    [currentVideo?.id, playlist],
  );

  // ── Debounced recommendation fetches (scored + interleaved) ──
  useEffect(() => {
    let cancelled = false;
    const debounceTimer = setTimeout(async () => {
      try {
        setIsLoadingRecommendations(true);
        const responses = await Promise.allSettled(
          recommendationQueries.map(({ q }) => searchSongs(q, { limit: 8 })),
        );

        const currentLang = currentVideo?.language;
        const allowedLangs = new Set(
          [currentLang, ...(recentlyPlayed || []).map(s => s.language)].filter(Boolean).map(l => l.toLowerCase())
        );

        const favoriteArtists = new Set(
          (favorites || []).flatMap(getAllArtists).map((a) => a.toLowerCase()),
        );
        const recentArtists = new Set(
          (recentlyPlayed || []).slice(0, 12).flatMap(getAllArtists).map((a) => a.toLowerCase()),
        );

        const seen = new Set(queueIds);
        const buckets = { artist: [], album: [], taste: [], mood: [], vibe: [] };

        responses.forEach((response, idx) => {
          if (response.status !== 'fulfilled') return;
          const bucket = recommendationQueries[idx]?.bucket || 'vibe';
          (response.value || []).forEach((song) => {
            if (!song?.id || seen.has(song.id)) return;
            if (!isSongAcceptable(song, currentLang, allowedLangs)) return;
            seen.add(song.id);
            buckets[bucket].push(song);
          });
        });

        // Score within each bucket, then interleave for variety
        const scoredBuckets = Object.values(buckets).map((list) =>
          list
            .map((song) => ({
              song,
              score: scoreRecommendation(song, { currentVideo, favoriteArtists, recentArtists }),
            }))
            .sort((a, b) => b.score - a.score)
            .map(({ song }) => song),
        );

        const ranked = interleaveBySource(scoredBuckets, 16);
        if (!cancelled) setRecommendedSongs(ranked);
      } catch {
        if (!cancelled) setRecommendedSongs([]);
      } finally {
        if (!cancelled) setIsLoadingRecommendations(false);
      }
    }, 2500); // longer debounce = fewer wasted requests when skipping songs quickly
    return () => { cancelled = true; clearTimeout(debounceTimer); };
  }, [recommendationQueries, queueIds, currentVideo, recentlyPlayed, favorites]);

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
    if (isYTSource) {
      const dur = ytDurationRef.current || ytPlayer.getDuration();
      if (dur > 0) ytPlayer.seekTo(pct * dur);
    } else if (audioRef.current && !isNaN(audioRef.current.duration)) {
      audioRef.current.currentTime = pct * audioRef.current.duration;
    }
  }, [isYTSource]);

  const handleSeekStart = useCallback((e, ref) => {
    setIsSeeking(true);
    activeProgressRef.current = ref.current;
    updateSeek(e.clientX || e.touches?.[0]?.clientX);
  }, [updateSeek]);

  const updateVol = useCallback((clientX) => {
    if (!activeVolumeRef.current || !Number.isFinite(clientX)) return;
    const rect = activeVolumeRef.current.getBoundingClientRect();
    const nextVolume = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setVolume(nextVolume);
    if (nextVolume > 0) setIsMuted(false);
  }, []);

  const handleVolStart = useCallback((e, ref) => {
    if (!ref?.current) return;
    e.preventDefault();
    setIsDraggingVolume(true);
    activeVolumeRef.current = ref.current;
    updateVol(e.clientX ?? e.touches?.[0]?.clientX);
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
      {/* Audio element — only for Saavn songs (keyed by URL so it remounts on song change) */}
      {!isYTSource && audioUrl && (
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
