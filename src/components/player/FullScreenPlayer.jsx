import { useState } from 'react';
import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiVolume2, FiVolumeX, FiHeart, FiRepeat, FiShuffle,
  FiChevronDown, FiPlus, FiX, FiMenu, FiList,
} from 'react-icons/fi';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'motion/react';
import { SeekBar, ControlButton } from './SeekBar';
import { formatDuration as fmt } from '../../utils/format';
import { cleanText } from '../../utils/text';

const SortableSongItem = ({ song, isCurrentSong, onPlay, onRemove, index }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-baseline gap-4 py-4 border-b border-border/20 cursor-pointer relative transition-colors ${
        isCurrentSong ? 'bg-surface/30' : 'hover:bg-surface/10'
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-secondary hover:text-primary transition-colors shrink-0">
        <FiMenu size={16} />
      </div>
      <span className="text-xs font-mono font-bold text-secondary w-6 shrink-0">{String(index + 1).padStart(2, '0')}</span>
      <div className="min-w-0 flex-1 flex flex-col md:flex-row md:items-baseline md:gap-4 cursor-pointer" onClick={onPlay}>
        <span className={`font-display text-2xl group-hover:text-primary transition-colors truncate ${isCurrentSong ? 'text-primary font-bold' : 'text-secondary'}`}>
          {cleanText(song.name)}
        </span>
        <span className="text-sm font-bold tracking-widest text-secondary truncate uppercase">
          {cleanText(song.primaryArtists)}
        </span>
      </div>
      <span className="text-xs font-bold tracking-widest text-secondary tabular-nums shrink-0 ml-4">
        {fmt((song.duration || 0) * 1)}
      </span>
      <div className="absolute right-0 top-0 bottom-0 flex items-center bg-gradient-to-l from-background via-background to-transparent pl-8 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onRemove} className="p-2 text-secondary hover:text-accent transition-colors">
          <FiX size={20} />
        </button>
      </div>
    </div>
  );
};

const FullScreenPlayer = ({
  title, artist, imageUrl, currentVideo,
  isFav, isPlaying, played, duration, volume, isMuted,
  shuffle, repeatMode, isExpanded,
  playlist, onTogglePlay, onToggleFav, onNext, onPrev,
  onToggleShuffle, onCycleRepeat, onToggleMute,
  onCollapse, onAddToPlaylist,
  onSetCurrentVideo, onRemoveFromQueue, onClearQueue, onReorderQueue,
  fullSeekRef, fullVolumeRef, onSeekStart, onVolStart,
  onSwipeStart, onSwipeMove, onSwipeEnd,
}) => {
  const [activeTab, setActiveTab] = useState('none');

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

  const renderQueueList = () => (
    <>
      <div className="flex items-center justify-between mb-8 xl:sticky xl:top-0 xl:bg-background/80 xl:backdrop-blur-xl xl:py-4 xl:z-10 xl:-mt-8 xl:pt-8 border-b border-white/5 pb-4">
        <h3 className="font-display font-bold text-2xl xl:text-4xl text-primary uppercase">Up Next</h3>
        {playlist.length > 0 && (
          <button onClick={onClearQueue} className="text-xs xl:text-sm tracking-[0.2em] uppercase font-bold text-secondary hover:text-primary transition-colors">
            Clear Queue
          </button>
        )}
      </div>

      {playlist.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={playlist.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {playlist.map((song, idx) => (
                <SortableSongItem
                  key={`${song.id}-${idx}`}
                  song={song}
                  index={idx}
                  isCurrentSong={song.id === currentVideo?.id}
                  isPlaying={isPlaying}
                  onPlay={() => onSetCurrentVideo(song, playlist)}
                  onRemove={(e) => { e.stopPropagation(); onRemoveFromQueue(song.id, idx); }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="text-secondary tracking-widest uppercase font-bold text-center py-12">Queue is empty</p>
      )}
    </>
  );

  return (
    <div
      className={`fixed inset-0 w-full h-[100dvh] md:h-screen z-[200] flex flex-col bg-background/60 backdrop-blur-[60px] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-[20%] opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-between px-6 md:px-12 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 shrink-0 absolute top-0 left-0 right-0 z-10 pointer-events-auto">
        <button
          onClick={onCollapse}
          className="uppercase tracking-[0.2em] text-xs font-bold text-primary transition-colors flex items-center gap-2 drop-shadow-md hover:text-secondary"
        >
          <FiChevronDown size={24} />
          CLOSE
        </button>
      </div>

      <div
        className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden pt-[calc(5rem+env(safe-area-inset-top))] pb-[calc(8rem+env(safe-area-inset-bottom))] px-6 md:px-16 flex flex-col items-center relative"
        onTouchStart={onSwipeStart}
        onTouchMove={onSwipeMove}
        onTouchEnd={onSwipeEnd}
      >
        <div className="flex flex-col xl:flex-row items-center xl:items-start justify-center gap-8 md:gap-12 xl:gap-16 w-full max-w-[1800px] my-auto shrink-0 py-4 xl:h-[80vh]">
          
          {/* LEFT COLUMN: Player Hub (Artwork + Info + Controls) */}
          <div className="w-full xl:w-1/2 flex flex-col items-center justify-between max-w-[600px] xl:max-w-[700px] shrink-0 xl:h-full xl:overflow-hidden xl:pr-8 py-4">
            
            {/* Artwork Container - Flexes to fill available space but shrinks if needed */}
            <div className="w-full flex-1 min-h-0 flex items-center justify-center mb-6 xl:mb-8">
              <div className="w-full max-w-[320px] md:max-w-[500px] xl:max-h-[100%] aspect-square bg-black shadow-[0_0_40px_rgba(255,255,255,0.05),0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden group rounded-2xl md:rounded-3xl border border-white/5">
                <motion.img
                  src={imageUrl}
                  alt={title}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/icon-192.png'; }}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
                />
              </div>
            </div>
            
            {/* Info & Controls Wrapper */}
            <div className="w-full flex flex-col items-center text-center max-w-[500px] shrink-0">
              {/* Title & Artist */}
              <div className="w-full mb-8 px-4">
                <h2 
                  className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-primary leading-tight tracking-tight mb-2 line-clamp-2 drop-shadow-md"
                  title={cleanText(title)}
                >
                  {cleanText(title)}
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-secondary tracking-[0.2em] uppercase font-medium line-clamp-1">
                  {cleanText(artist)}
                </p>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-4 w-full mb-10">
                <span className="text-xs font-bold tracking-widest text-secondary w-12 text-right">
                  {fmt(played * duration)}
                </span>
                <SeekBar refEl={fullSeekRef} played={played} onSeekStart={seekBound} />
                <span className="text-xs font-bold tracking-widest text-secondary w-12">
                  {fmt(duration)}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6 md:gap-10 w-full mb-12">
                <ControlButton active={shuffle} onClick={onToggleShuffle}>
                  <FiShuffle size={20} />
                </ControlButton>

                <button onClick={onPrev} className="text-primary hover:text-accent transition-colors active:scale-90">
                  <FiSkipBack size={32} />
                </button>
                <button
                  onClick={onTogglePlay}
                  className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center text-background bg-primary rounded-full hover:scale-105 transition-all active:scale-95 shadow-xl shrink-0"
                >
                  {isPlaying ? <FiPause size={36} className="fill-current" /> : <FiPlay size={36} className="fill-current ml-2" />}
                </button>
                <button onClick={onNext} className="text-primary hover:text-accent transition-colors active:scale-90">
                  <FiSkipForward size={32} />
                </button>

                <ControlButton active={repeatMode !== 'off'} onClick={onCycleRepeat}>
                  <FiRepeat size={20} />
                  {repeatMode === 'one' && (
                    <span className="absolute -right-2 -top-2 text-[10px] font-bold text-primary">1</span>
                  )}
                </ControlButton>
              </div>

              {/* Extra Actions */}
              <div className="flex items-center justify-center gap-8 w-full border-t border-white/10 pt-8">
                <button onClick={onToggleFav} className={`p-2 transition-colors active:scale-90 ${isFav ? 'text-primary' : 'text-secondary hover:text-primary'}`}>
                  <FiHeart size={24} className={isFav ? 'fill-current' : ''} />
                </button>
                <button onClick={() => onAddToPlaylist(currentVideo)} className="p-2 text-secondary hover:text-primary transition-colors active:scale-90">
                  <FiPlus size={24} />
                </button>
                <button onClick={() => setActiveTab(t => t === 'queue' ? 'none' : 'queue')} className={`p-2 transition-colors active:scale-90 xl:hidden ${activeTab === 'queue' ? 'text-primary' : 'text-secondary hover:text-primary'}`}>
                  <FiList size={24} />
                </button>
                <div className="hidden md:flex items-center gap-4 flex-1 max-w-[200px] ml-auto">
                  <button onClick={onToggleMute} className="text-secondary hover:text-primary transition-colors">
                    {isMuted || volume === 0 ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                  </button>
                  <div
                    ref={fullVolumeRef}
                    className="flex-1 h-1 bg-white/20 cursor-pointer relative group transition-all hover:h-2"
                    onMouseDown={(e) => onVolStart(e, fullVolumeRef)}
                    onTouchStart={(e) => onVolStart(e, fullVolumeRef)}
                  >
                    <div className="absolute top-0 left-0 h-full bg-primary group-hover:bg-accent transition-colors flex items-center justify-end" style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}>
                      <div className="w-3 h-3 bg-white rounded-full shadow-md translate-x-1/2 scale-100 group-hover:scale-125 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Permanent Queue (Desktop Only) */}
          <div className="hidden xl:flex w-full xl:w-1/2 flex-col h-full bg-black/40 backdrop-blur-3xl rounded-[2rem] p-8 overflow-y-auto scrollbar-hide border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.5)] relative">
            {renderQueueList()}
          </div>
        </div>

        {/* Up Next / Queue Overlay (Mobile Only) */}
        <AnimatePresence>
          {activeTab === 'queue' && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="xl:hidden w-full max-w-[1200px] mx-auto border-t border-border/20 pt-16 mt-8 bg-black/80 backdrop-blur-2xl rounded-t-[2rem] px-6"
            >
              {renderQueueList()}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default FullScreenPlayer;
