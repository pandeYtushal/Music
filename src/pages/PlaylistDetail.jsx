import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';
import { FiPlay, FiEdit2, FiTrash2, FiCheck, FiMusic, FiHeart, FiShuffle, FiSkipBack, FiSkipForward, FiRepeat, FiPlus } from 'react-icons/fi';
import { cleanText } from '../utils/text';
import { pickImageUrl } from '../utils/media';

const formatDuration = (seconds) => {
  if (!seconds || Number.isNaN(Number(seconds))) return '--:--';
  const total = Math.max(0, Number(seconds));
  const minutes = Math.floor(total / 60);
  const remaining = Math.floor(total % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`;
};

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playlists, renamePlaylist, deletePlaylist, removeFromPlaylist, setCurrentVideo, addToQueue, playNextInQueue } = usePlayerStore();
  
  const playlist = playlists.find(p => p.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(playlist?.name || '');

  if (!playlist) {
    return (
      <div className="p-12 text-center py-40">
        <h2 className="text-3xl font-bold text-white mb-6">Playlist not found</h2>
        <button onClick={() => navigate('/playlists')} className="text-[#8e8e93] font-bold uppercase tracking-widest text-xs hover:text-white transition-colors">Return to Library</button>
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
    if (window.confirm('Dissolve this playlist into the nebula?')) {
      deletePlaylist(id);
      navigate('/playlists');
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white p-6 md:p-12 pb-40">
      <div className="max-w-[1400px] mx-auto flex flex-col xl:flex-row gap-12 items-start">
        
        {/* Left Column — Fixed Album Art */}
        <div className="w-full xl:w-[400px] xl:sticky xl:top-24 flex flex-col items-center xl:items-start gap-8">
          <div className="relative group w-full max-w-[400px] aspect-square rounded-[40px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8)] border border-white/5 bg-[#121212]">
            {playlist.songs.length > 0 ? (
              <img 
                src={pickImageUrl(playlist.songs[0].image)} 
                className="w-full h-full object-cover"
                alt={playlist.name} 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiMusic size={120} className="text-white/5" />
              </div>
            )}
            
            {/* Heart on top right of art like in image */}
            <div className="absolute top-6 right-6">
              <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
                <FiHeart size={20} />
              </button>
            </div>
            
            {/* Play bar inside the art card (floating bottom like reference) */}
            <div className="absolute bottom-6 left-6 right-6 h-16 bg-white/10 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center justify-between px-6">
              <button className="text-white/40 hover:text-white transition-all"><FiShuffle size={18} /></button>
              <button className="text-white/40 hover:text-white transition-all"><FiSkipBack size={20} /></button>
              <button 
                onClick={() => playlist.songs.length > 0 && setCurrentVideo(playlist.songs[0], playlist.songs)}
                className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <FiPlay size={20} className="fill-current ml-1" />
              </button>
              <button className="text-white/40 hover:text-white transition-all"><FiSkipForward size={20} /></button>
              <button className="text-white/40 hover:text-white transition-all"><FiRepeat size={18} /></button>
            </div>
          </div>
        </div>

        {/* Right Column — Info + Tracklist */}
        <div className="flex-1 w-full flex flex-col gap-8">
          <header className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
               {isEditing ? (
                <div className="flex items-center gap-4 w-full">
                  <input 
                    autoFocus
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-transparent border-b border-white/20 focus:border-white text-4xl md:text-6xl font-bold outline-none w-full py-2 text-white placeholder:text-white/10 transition-all tracking-tight"
                  />
                  <button onClick={handleRename} className="p-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-all shadow-xl shrink-0"><FiCheck size={24} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-4 group">
                  <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">{playlist.name}</h1>
                  <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-white/5 rounded-lg text-white/30"><FiEdit2 size={20} /></button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-white/40 text-sm font-medium">
              <span>by Selection</span>
              <span>•</span>
              <span>2024</span>
              <span>•</span>
              <span className="text-white">{playlist.songs.length} Tracks</span>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button 
                onClick={() => playlist.songs.length > 0 && setCurrentVideo(playlist.songs[0], playlist.songs)}
                className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-white/90 active:scale-95 transition-all flex items-center gap-2"
              >
                <FiPlay size={16} className="fill-current" />
                Play All
              </button>
              <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all">
                <FiHeart size={20} />
              </button>
              <button onClick={handleDelete} className="ml-auto text-white/20 hover:text-red-400 transition-all">
                <FiTrash2 size={20} />
              </button>
            </div>
          </header>

          {/* Tracklist table style like reference */}
          <div className="mt-8">
            <div className="space-y-1">
              {playlist.songs.map((song, index) => (
                <div 
                  key={song.id}
                  onClick={() => setCurrentVideo(song, playlist.songs)}
                  className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-white/[0.04] transition-all cursor-pointer relative"
                >
                  <span className="w-6 text-white/20 font-bold text-[13px] tabular-nums">{index + 1}</span>
                  
                  <div className="flex-1 flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0">
                      <img src={pickImageUrl(song.image)} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-[15px] truncate">{cleanText(song.name, 'Unknown Song')}</p>
                      <p className="text-[12px] font-medium text-white/30 truncate mt-0.5">{cleanText(song.primaryArtists, 'Unknown Artist')}</p>
                    </div>
                  </div>

                  <div className="hidden md:block text-white/25 text-[13px] font-medium tabular-nums mr-10">
                    {cleanText(song.album?.name, 'Single')}
                  </div>

                  <div className="text-white/25 text-[13px] font-bold tabular-nums">
                    {formatDuration(song.duration)}
                  </div>

                  {/* Actions (visible on hover) */}
                  <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity ml-4">
                    <button
                      title="Play next"
                      onClick={(e) => { e.stopPropagation(); playNextInQueue(song); }}
                      className="p-2 text-white/30 hover:text-white rounded-lg transition-all"
                    >
                      <FiSkipForward size={16} />
                    </button>
                    <button
                      title="Add to queue"
                      onClick={(e) => { e.stopPropagation(); addToQueue(song); }}
                      className="p-2 text-white/30 hover:text-white rounded-lg transition-all"
                    >
                      <FiPlus size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFromPlaylist(id, song.id); }}
                      className="p-2 text-white/30 hover:text-red-400 rounded-lg transition-all"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              {playlist.songs.length === 0 && (
                <div className="py-20 text-center border border-dashed border-white/10 rounded-[32px]">
                  <FiMusic size={40} className="mx-auto text-white/10 mb-4" />
                  <p className="text-white/40 font-medium">No tracks yet</p>
                  <button 
                    onClick={() => navigate('/search')}
                    className="mt-4 text-white font-bold hover:underline"
                  >
                    Find Music
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>

  );
};

export default PlaylistDetail;
