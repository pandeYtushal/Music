import { useState, useRef, useEffect } from 'react';
import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiVolume2, FiVolumeX, FiHeart, FiRepeat, FiShuffle,
  FiChevronDown, FiPlus, FiShare2, FiX, FiMenu, FiMoon, FiMic,
} from 'react-icons/fi';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SeekBar, ControlButton } from './SeekBar';
import { formatDuration as fmt } from '../../utils/format';
import { cleanText } from '../../utils/text';
import { pickImageUrl } from '../../utils/media';

// ── Sortable queue item ──
const SortableSongItem = ({ song, isCurrentSong, isPlaying, onPlay, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all group ${isCurrentSong ? 'bg-white/[0.07] border border-white/5' : 'hover:bg-white/[0.04] border border-transparent'}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-white/30 hover:text-white/60">
        <FiMenu size={16} />
      </div>
      <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-lg cursor-pointer" onClick={onPlay}>
        <img src={pickImageUrl(song.image)} alt="" loading="lazy" className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0 flex-1 cursor-pointer" onClick={onPlay}>
        <p className={`text-[14px] font-bold truncate ${isCurrentSong ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
          {cleanText(song.name, 'Unknown Song')}
        </p>
        <p className="text-[12px] text-white/30 truncate mt-0.5 font-medium">
          {cleanText(song.primaryArtists, 'Unknown Artist')}
        </p>
      </div>
      {isCurrentSong && isPlaying && (
        <div className="flex items-end gap-[3px] h-4 shrink-0 mx-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-[3px] bg-white rounded-full animate-[bounce_1s_infinite]"
              style={{ height: `${[10, 14, 8][i - 1]}px`, animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}
      <span className="text-white/20 text-[12px] font-bold tabular-nums shrink-0 ml-2">
        {fmt((song.duration || 0) * 1)}
      </span>
      <button
        onClick={onRemove}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/18 hover:text-red-400 hover:bg-red-400/5 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
        title="Remove from queue"
      >
        <FiX size={16} />
      </button>
    </div>
  );
};

/**
 * Full-screen player overlay — album art, controls, queue, recommendations.
 */
const FullScreenPlayer = ({
  // Track data
  title, artist, imageUrl, currentVideo,
  // Playback state
  isPlaying, isFav, played, duration, volume, isMuted,
  shuffle, repeatMode, isExpanded,
  // Queue data
  playlist, recommendedSongs, isLoadingRecommendations, autoplay,
  // Callbacks
  onTogglePlay, onToggleFav, onNext, onPrev,
  onToggleShuffle, onCycleRepeat, onToggleMute,
  onCollapse, onShare, onAddToPlaylist,
  onSetCurrentVideo, onRemoveFromQueue, onClearQueue, onReorderQueue,
  onPlayNextInQueue, onAddToQueue,
  // Seek / volume
  fullSeekRef, fullVolumeRef, onSeekStart, onVolStart,
  // Touch gesture handlers for swipe skip
  onSwipeStart, onSwipeMove, onSwipeEnd,
}) => {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'lyrics'
  const [sleepTimer, setSleepTimer] = useState(null); // in minutes, null = off
  const [isSleepMenuOpen, setIsSleepMenuOpen] = useState(false);
  const sleepTimerRef = useRef(null); // holds the timeout id
  const sleepMenuRef = useRef(null);

  useEffect(() => {
    if (!isSleepMenuOpen) return;
    const handleOutsideClick = (e) => {
      if (sleepMenuRef.current && !sleepMenuRef.current.contains(e.target)) {
        setIsSleepMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isSleepMenuOpen]);

  const handleSleepTimer = (minutes) => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (!minutes) { setSleepTimer(null); return; }
    setSleepTimer(minutes);
    sleepTimerRef.current = setTimeout(() => {
      // Pause playback when sleep timer fires
      if (typeof onTogglePlay === 'function') onTogglePlay(false);
      setSleepTimer(null);
    }, minutes * 60 * 1000);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = playlist.findIndex((song) => song.id === active.id);
    const newIndex = playlist.findIndex((song) => song.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorderQueue(oldIndex, newIndex);
    }
  };

  const seekBound = (e, ref) => onSeekStart(e, ref);

  const sleepTimerOptions = [5, 15, 30, 60];

  return (
    <div
      className={`fixed top-0 left-0 w-full h-[100dvh] md:h-screen z-[200] flex flex-col transition-all duration-500 ease-out ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}
      style={{ background: '#08080a' }}
    >
      {/* Blurred bg (Apple Music style) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img src={imageUrl} alt="" className="w-full h-full object-cover scale-150 blur-[90px] opacity-[0.38] transition-all duration-1000" />
        <div className="absolute inset-0 bg-[#08080a]/60 backdrop-blur-[20px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-[#08080a]/80" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6 md:pt-8 pb-3 shrink-0">
        <button onClick={onCollapse} className="w-12 h-12 md:w-10 md:h-10 rounded-2xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.07] active:scale-95 transition-all">
          <FiChevronDown size={26} />
        </button>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">Now Playing</p>
        <div className="flex items-center gap-1">
          {/* Sleep Timer */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSleepMenuOpen(prev => !prev);
              }}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${sleepTimer ? 'text-orange-400 bg-orange-500/10' : 'text-white/40 hover:text-white hover:bg-white/[0.07]'}`}
              title="Sleep Timer"
            >
              <FiMoon size={16} />
            </button>
            {isSleepMenuOpen && (
              <div
                ref={sleepMenuRef}
                className="absolute right-0 top-full mt-2 z-50 min-w-[130px] rounded-2xl border border-white/10 py-1.5 transition-all duration-200"
                style={{ background: 'rgba(22,22,28,0.95)', backdropFilter: 'blur(30px)' }}
              >
                <p className="text-[9px] uppercase font-black tracking-widest text-white/25 px-4 py-1.5">Sleep Timer</p>
                {sleepTimerOptions.map(m => (
                  <button
                    key={m}
                    onClick={() => {
                      handleSleepTimer(sleepTimer === m ? null : m);
                      setIsSleepMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${sleepTimer === m ? 'text-orange-400' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                  >
                    {m} min{sleepTimer === m ? ' ✓' : ''}
                  </button>
                ))}
                {sleepTimer && (
                  <button
                    onClick={() => {
                      handleSleepTimer(null);
                      setIsSleepMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-colors border-t border-white/5 mt-1"
                  >
                    Cancel Timer
                  </button>
                )}
              </div>
            )}
          </div>
          <button onClick={() => onAddToPlaylist(currentVideo)} className="w-10 h-10 rounded-2xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.07] active:scale-95 transition-all">
            <FiPlus size={20} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div
        className="relative z-10 flex-1 overflow-y-auto scrollbar-hide"
        onTouchStart={onSwipeStart}
        onTouchMove={onSwipeMove}
        onTouchEnd={onSwipeEnd}
      >
        <div className="flex flex-col xl:flex-row items-center xl:items-start gap-8 px-6 md:px-10 py-4 md:py-8 mx-auto" style={{ maxWidth: 1200 }}>

          {/* Left column: album art and controls */}
          <div className="flex flex-col items-center gap-6 xl:sticky xl:top-0 w-full xl:w-auto shrink-0 max-w-[450px]">
            <div className="relative w-full max-w-[340px] md:max-w-full mx-auto aspect-square">
              {/* Dynamic Aura Glow Backdrop */}
              <div className="absolute inset-4 rounded-full album-art-aura pointer-events-none z-0" />
              <div
                className={`relative z-10 w-full h-full rounded-[32px] md:rounded-[48px] overflow-hidden transition-all duration-700 shadow-[0_40px_100px_rgba(0,0,0,0.85)] border border-white/5 ${isPlaying ? 'scale-100' : 'scale-[0.94] opacity-75'}`}
              >
                <img src={imageUrl} alt={title} className="w-full h-full object-cover block" />
              </div>
            </div>

            {/* Track info + heart + share */}
            <div className="flex items-start justify-between gap-4 w-full px-2">
              <div className="min-w-0">
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight line-clamp-1">{title}</h2>
                <p className="text-white/45 text-sm md:text-base font-medium truncate mt-1">{artist}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={onShare} className="w-14 h-14 md:w-12 md:h-12 flex items-center justify-center rounded-2xl active:scale-95 transition-all text-white/50 hover:text-white" title="Share Song">
                  <FiShare2 size={22} />
                </button>
                <button onClick={onToggleFav} className={`w-14 h-14 md:w-12 md:h-12 flex items-center justify-center rounded-2xl active:scale-95 transition-all ${isFav ? 'text-white bg-white/10' : 'text-white/50 hover:text-white'}`}>
                  <FiHeart size={22} className={isFav ? 'fill-current' : ''} />
                </button>
              </div>
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
              <ControlButton active={shuffle} onClick={onToggleShuffle} className="w-12 h-12 md:w-10 md:h-10 flex items-center justify-center active:scale-95">
                <FiShuffle size={18} />
              </ControlButton>
              <div className="flex items-center gap-5 md:gap-12">
                <button onClick={onPrev} className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-white/80 hover:text-white transition-colors active:scale-90">
                  <FiSkipBack size={28} className="md:w-8 md:h-8" />
                </button>
                <button
                  onClick={onTogglePlay}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_12px_40px_rgba(255,255,255,0.25)] hover:bg-white/90"
                >
                  {isPlaying ? <FiPause size={24} className="fill-current md:w-7 md:h-7" /> : <FiPlay size={24} className="fill-current ml-1 md:w-7 md:h-7" />}
                </button>
                <button onClick={onNext} className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-white/80 hover:text-white transition-colors active:scale-90">
                  <FiSkipForward size={28} className="md:w-8 md:h-8" />
                </button>
              </div>
              <ControlButton active={repeatMode !== 'off'} onClick={onCycleRepeat} className="w-12 h-12 md:w-10 md:h-10 flex items-center justify-center active:scale-95">
                <FiRepeat size={18} />
                {repeatMode === 'one' && <span className="absolute right-1 top-1 text-[8px] font-black leading-none">1</span>}
              </ControlButton>
            </div>

            {/* Volume (hidden on very small screens) */}
            <div className="hidden md:flex items-center gap-4 w-full px-4 py-2 bg-white/[0.03] rounded-2xl border border-white/5" onClick={(e) => e.stopPropagation()}>
              <button onClick={onToggleMute} className="text-white/30 hover:text-white transition-colors shrink-0">
                {isMuted || volume === 0 ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
              </button>
              <div
                ref={fullVolumeRef}
                className="flex-1 h-1 rounded-full cursor-pointer relative group"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                onMouseDown={(e) => onVolStart(e, fullVolumeRef)}
                onTouchStart={(e) => onVolStart(e, fullVolumeRef)}
              >
                <div className="absolute top-0 left-0 h-full rounded-full bg-white" style={{ width: `${(isMuted ? 0 : volume) * 100}%` }} />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white scale-0 group-hover:scale-100 transition-transform shadow-lg cursor-pointer"
                  style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - 7px)` }}
                />
              </div>
            </div>
          </div>

          {/* Right column: Tabs (Queue / Lyrics) */}
          {playlist.length > 0 && (
            <div className="flex-1 w-full min-w-0 pb-10">
              {/* Tab bar */}
              <div className="flex items-center gap-1 mb-6 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                <button
                  onClick={() => setActiveTab('queue')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'queue' ? 'bg-white text-black shadow-lg' : 'text-white/50 hover:text-white'}`}
                >
                  <FiMenu size={12} /> Queue
                </button>
                <button
                  onClick={() => setActiveTab('lyrics')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'lyrics' ? 'bg-white text-black shadow-lg' : 'text-white/50 hover:text-white'}`}
                >
                  <FiMic size={12} /> Lyrics
                </button>
              </div>

              {/* Queue Tab Content */}
              {activeTab === 'queue' && (
                <>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <p className="text-sm font-black text-white/60">Up Next — {playlist.length} tracks</p>
                    <button onClick={onClearQueue} className="text-[11px] font-bold text-white/25 hover:text-white transition-colors uppercase tracking-widest">
                      Clear
                    </button>
                  </div>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={playlist.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-1">
                        {playlist.map((song, idx) => (
                          <SortableSongItem
                            key={`${song.id}-${idx}`}
                            song={song}
                            isCurrentSong={song.id === currentVideo.id}
                            isPlaying={isPlaying}
                            onPlay={() => onSetCurrentVideo(song, playlist)}
                            onRemove={(e) => { e.stopPropagation(); onRemoveFromQueue(song.id, idx); }}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </>
              )}

              {/* Lyrics Tab Content */}
              {activeTab === 'lyrics' && (
                <div className="px-1 py-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-5 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                    <FiMic size={20} className="text-white/40" />
                  </div>
                  <p className="text-sm font-black text-white/60 mb-2">Now Playing</p>
                  <p className="text-2xl font-black text-white mb-1 leading-tight">{title}</p>
                  <p className="text-white/45 text-sm font-semibold mb-8">{artist}</p>
                  <div className="space-y-4 text-center max-w-sm mx-auto">
                    <p className="text-base font-bold text-white/80 leading-relaxed">Lyrics are coming soon.</p>
                    <p className="text-xs font-semibold text-white/35 leading-relaxed">
                      Synced timed lyrics with word-level highlighting will be available in a future update.
                    </p>
                    <div className="flex items-end justify-center gap-1 mt-6 h-8">
                      {[8, 14, 6, 12, 10, 16, 8].map((h, i) => (
                        <span key={i} className="w-1 rounded-full bg-orange-500/60 animate-[bounce_1s_infinite]" style={{ height: h, animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations section */}
              {(isLoadingRecommendations || recommendedSongs.length > 0 || autoplay) && (
                <div className="mt-8">
                  <div className="mb-4 px-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 mb-1">Autoplay</p>
                    <h3 className="text-lg font-bold text-white tracking-tight">From Your Listening</h3>
                  </div>
                  {isLoadingRecommendations ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-center gap-4 p-3.5 rounded-2xl border border-white/[0.04] bg-white/[0.015]">
                          <div className="w-11 h-11 rounded-xl skeleton shrink-0" />
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="h-3 rounded-full skeleton w-2/3" />
                            <div className="h-2.5 rounded-full skeleton w-1/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recommendedSongs.length > 0 ? (
                    <div className="space-y-1">
                      {recommendedSongs.slice(0, 8).map((song, idx) => (
                        <div
                          key={`${song.id}-recommended-${idx}`}
                          onClick={() => onSetCurrentVideo(song, [...playlist, ...recommendedSongs])}
                          className="flex items-center gap-4 p-3.5 rounded-2xl transition-all group cursor-pointer hover:bg-white/[0.04] border border-transparent"
                        >
                          <span className="text-white/10 font-bold text-xs w-6 text-right tabular-nums shrink-0">{idx + 1}</span>
                          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-lg">
                            <img src={pickImageUrl(song.image)} alt="" loading="lazy" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-bold truncate text-white/80 group-hover:text-white">
                              {cleanText(song.name, 'Unknown Song')}
                            </p>
                            <p className="text-[12px] text-white/30 truncate mt-0.5 font-medium">
                              {cleanText(song.primaryArtists, 'Unknown Artist')}
                            </p>
                          </div>
                          <span className="text-white/20 text-[12px] font-bold tabular-nums shrink-0 ml-2">
                            {fmt((song.duration || 0) * 1)}
                          </span>
                          <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); onPlayNextInQueue(song); }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/25 hover:text-white hover:bg-white/[0.05] transition-all"
                              title="Play next"
                            >
                              <FiSkipForward size={15} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onAddToQueue(song); }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/25 hover:text-white hover:bg-white/[0.05] transition-all"
                              title="Add to queue"
                            >
                              <FiPlus size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
                      <p className="text-sm font-bold text-white/70">Recommendations are warming up</p>
                      <p className="text-xs text-white/32 mt-1">Play a few more songs and Melody will build a better autoplay queue.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FullScreenPlayer;
