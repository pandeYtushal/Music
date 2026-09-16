import { useState, } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { usePlayerStore } from '../store/usePlayerStore';
import { FiPlay, FiEdit2, FiTrash2, FiCheck, FiPlus, FiSkipForward, FiArrowLeft, FiX, } from 'react-icons/fi';
import { cleanText } from '../utils/text';
import { pickImageUrl } from '../utils/media';
import { formatDuration, formatTotalDuration } from '../utils/format';
import useDocumentTitle from '../hooks/useDocumentTitle';

function TrackRow({ song, playlist, onRemove }) {
  const setCurrentVideo = usePlayerStore((s) => s.setCurrentVideo);
  const playNextInQueue = usePlayerStore((s) => s.playNextInQueue);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const currentVideo = usePlayerStore((s) => s.currentVideo);
  const isCurrent = currentVideo?.id === song.id;
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div 
      className={`group flex items-baseline gap-4 py-4 md:py-6 border-b border-border/30 cursor-pointer transition-colors relative ${isCurrent ? 'bg-surface/30' : 'hover:bg-surface/10'}`}
      onClick={() => setCurrentVideo(song, playlist)}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.3)] hidden sm:block self-center">
         <img src={pickImageUrl(song.image, '150x150')} alt={song.name} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
      </div>
      <div className="min-w-0 flex-1 flex flex-col md:flex-row md:items-baseline md:gap-6 sm:ml-4">
        <span className={`font-display font-bold text-3xl md:text-5xl group-hover:text-primary transition-colors truncate ${isCurrent ? 'text-primary' : 'text-secondary'}`}>
          {cleanText(song.name)}
        </span>
        <span className="text-xs md:text-sm font-bold tracking-[0.2em] text-secondary truncate uppercase">
          {cleanText(song.primaryArtists, 'Unknown Artist')}
        </span>
      </div>
      <div className="text-xs font-bold tracking-[0.2em] text-secondary tabular-nums ml-4 shrink-0 self-center">
        {formatDuration(song.duration)}
      </div>

      <div 
        className={`absolute right-0 top-0 bottom-0 flex items-center gap-2 md:gap-4 bg-background pl-8 pr-4 transition-opacity duration-300 ${showOptions ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'linear-gradient(90deg, transparent 0%, var(--background-color) 20%)' }}
      >
        <button
          onClick={() => playNextInQueue(song)}
          className="p-3 text-secondary hover:text-primary transition-colors"
          title="Play Next"
        >
          <FiSkipForward size={24} />
        </button>
        <button
          onClick={() => addToQueue(song)}
          className="p-3 text-secondary hover:text-primary transition-colors"
          title="Add to Queue"
        >
          <FiPlus size={24} />
        </button>
        <button
          onClick={() => onRemove(song.id)}
          className="p-3 text-secondary hover:text-accent transition-colors"
          title="Remove from Playlist"
        >
          <FiTrash2 size={24} />
        </button>
      </div>
    </div>
  );
}

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const playlists = usePlayerStore((state) => state.playlists);
  const renamePlaylist = usePlayerStore((state) => state.renamePlaylist);
  const deletePlaylist = usePlayerStore((state) => state.deletePlaylist);
  const removeFromPlaylist = usePlayerStore((state) => state.removeFromPlaylist);
  const setCurrentVideo = usePlayerStore((state) => state.setCurrentVideo);

  const playlist = playlists.find((p) => p.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(playlist?.name || '');

  useDocumentTitle(playlist ? `${playlist.name} — MELDMUSIC` : 'Playlist — MELDMUSIC');

  const totalDurationStr = (() => {
    if (!playlist?.songs) return '';
    return formatTotalDuration(playlist.songs);
  })();

  if (!playlist) {
    return (
      <div className="w-full pt-48 pb-32 px-6 md:px-12 text-center text-primary">
        <h2 className="font-display font-bold text-6xl mb-8 uppercase">Playlist not found</h2>
        <button
          onClick={() => navigate('/playlists')}
          className="inline-flex items-center gap-3 px-8 py-4 border border-primary text-primary text-sm font-bold tracking-[0.2em] uppercase hover:bg-primary hover:text-background transition-colors active:scale-95"
        >
          <FiArrowLeft size={20} />
          RETURN TO LIBRARY
        </button>
      </div>
    );
  }

  const handleRename = () => {
    if (newName.trim()) {
      renamePlaylist(id, newName.trim());
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`DELETE "${playlist.name.toUpperCase()}"?`)) {
      deletePlaylist(id);
      navigate('/playlists');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full pt-24 pb-32 px-6 md:px-12"
    >
      <button
        onClick={() => navigate('/playlists')}
        className="inline-flex items-center gap-3 mb-12 text-xs font-bold tracking-[0.2em] text-secondary uppercase hover:text-primary transition-colors cursor-pointer"
      >
        <FiArrowLeft size={20} />
        <span>LIBRARY</span>
      </button>

      <div className="flex flex-col mb-24 md:mb-32">
        <div className="flex justify-between items-start mb-6">
          <p className="text-[10px] font-bold tracking-[0.4em] text-secondary uppercase">Playlist</p>
          <div className="flex gap-4">
            <button onClick={() => setIsEditing(!isEditing)} className="p-3 text-secondary hover:text-primary transition-colors">
              {isEditing ? <FiX size={24} /> : <FiEdit2 size={24} />}
            </button>
            <button onClick={handleDelete} className="p-3 text-secondary hover:text-accent transition-colors">
              <FiTrash2 size={24} />
            </button>
          </div>
        </div>
        
        {isEditing ? (
          <div className="flex items-center gap-6 mb-8 border-b-2 border-primary pb-2">
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-transparent font-display font-bold text-6xl md:text-8xl lg:text-[8rem] text-primary outline-none uppercase tracking-tight"
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
            <button onClick={handleRename} className="p-4 text-primary hover:text-accent transition-colors">
              <FiCheck size={48} />
            </button>
          </div>
        ) : (
          <h1 className="font-display font-bold text-6xl md:text-8xl lg:text-[8rem] leading-[0.85] text-primary mb-8 uppercase break-words tracking-tighter">
            {playlist.name}
          </h1>
        )}

        <div className="flex flex-wrap items-center gap-4 text-xs font-bold tracking-[0.2em] text-secondary uppercase mb-12">
          <span>{playlist.songs.length} {playlist.songs.length === 1 ? 'TRACK' : 'TRACKS'}</span>
          {totalDurationStr && <span>• {totalDurationStr} RUNTIME</span>}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {playlist.songs.length > 0 && (
            <button 
              onClick={() => setCurrentVideo(playlist.songs[0], playlist.songs)}
              className="flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-sm font-bold px-8 py-4 bg-primary text-background hover:bg-accent transition-colors active:scale-95"
            >
              <FiPlay size={20} className="fill-current" />
              PLAY ALL
            </button>
          )}
          <button 
            onClick={() => navigate('/search')}
            className="flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-sm font-bold px-8 py-4 border border-primary text-primary hover:bg-primary hover:text-background transition-colors active:scale-95"
          >
            <FiPlus size={20} />
            ADD TRACKS
          </button>
        </div>
      </div>

      <section className="mb-24">
        <div className="flex items-center justify-between border-b border-border/30 pb-6 mb-12">
          <h2 className="font-display font-bold text-4xl text-primary uppercase">Tracklist</h2>
        </div>
        
        {playlist.songs.length > 0 ? (
          <div className="flex flex-col">
            {playlist.songs.map((song, i) => (
              <TrackRow 
                key={`${song.id}-${i}`} 
                song={song} 
                index={i} 
                playlist={playlist.songs}
                onRemove={(songId) => removeFromPlaylist(id, songId)}
              />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center border-t border-b border-border/30">
            <p className="font-display font-bold text-4xl md:text-6xl text-primary mb-6 uppercase">No tracks yet</p>
            <button
              onClick={() => navigate('/search')}
              className="inline-flex items-center gap-3 px-8 py-4 border border-primary text-primary text-sm font-bold tracking-[0.2em] uppercase hover:bg-primary hover:text-background transition-colors active:scale-95 mt-8"
            >
              <FiPlus size={20} />
              SEARCH & ADD SONGS
            </button>
          </div>
        )}
      </section>
    </motion.div>
  );
}
