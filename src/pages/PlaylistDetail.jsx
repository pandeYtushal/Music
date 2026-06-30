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
  const playlists = usePlayerStore(state => state.playlists);
  const renamePlaylist = usePlayerStore(state => state.renamePlaylist);
  const deletePlaylist = usePlayerStore(state => state.deletePlaylist);
  const removeFromPlaylist = usePlayerStore(state => state.removeFromPlaylist);
  const setCurrentVideo = usePlayerStore(state => state.setCurrentVideo);
  const addToQueue = usePlayerStore(state => state.addToQueue);
  const playNextInQueue = usePlayerStore(state => state.playNextInQueue);
  
  const playlist = playlists.find(p => p.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(playlist?.name || '');

  if (!playlist) {
    return (
      <div className="p-12 text-center py-40">
        <h2 className="text-3xl font-bold text-white mb-6">Playlist not found</h2>
        <button onClick={() => navigate('/playlists')} className="text-white/40 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors">Return to Library</button>
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
    <div className="w-full text-white p-6 md:p-12 relative">
      {/* Local reflection glow behind playlist */}
      <div className="absolute top-1/4 left-1/4 w-[360px] h-[360px] rounded-full bg-orange-500/5 blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-[1400px] mx-auto flex flex-col xl:flex-row gap-12 items-start pt-4 md:pt-8">
        
        {/* Left Column — Fixed Album Art */}
        <div className="w-full xl:w-[340px] xl:sticky xl:top-28 flex flex-col items-center xl:items-start gap-8 shrink-0">
          <div className="relative group w-full max-w-[340px] aspect-square rounded-[36px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.65)] border border-white/10 bg-white/[0.015]">
            {playlist.songs.length > 0 ? (
              <img 
                src={pickImageUrl(playlist.songs[0].image)} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt={playlist.name} 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiMusic size={80} className="text-white/5" />
              </div>
            )}
            
            {/* Heart on top right of art */}
            <div className="absolute top-5 right-5">
              <button className="w-9 h-9 rounded-full bg-black/45 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all active:scale-95">
                <FiHeart size={18} />
              </button>
            </div>
            
            {/* Play bar inside the art card */}
            <div className="absolute bottom-5 left-5 right-5 h-14 bg-white/[0.07] backdrop-blur-2xl border border-white/12 rounded-2xl flex items-center justify-between px-5 shadow-2xl">
              <button className="text-white/40 hover:text-white transition-all active:scale-90"><FiShuffle size={16} /></button>
              <button className="text-white/40 hover:text-white transition-all active:scale-90"><FiSkipBack size={18} /></button>
              <button 
                onClick={() => playlist.songs.length > 0 && setCurrentVideo(playlist.songs[0], playlist.songs)}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all hover:bg-orange-500 hover:text-white"
              >
                <FiPlay size={18} className="fill-current ml-0.5" />
              </button>
              <button className="text-white/40 hover:text-white transition-all active:scale-90"><FiSkipForward size={18} /></button>
              <button className="text-white/40 hover:text-white transition-all active:scale-90"><FiRepeat size={16} /></button>
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
                    className="bg-transparent border-b border-white/20 focus:border-white text-4xl md:text-5xl font-black outline-none w-full py-2 text-white placeholder:text-white/10 transition-all tracking-tight"
                  />
                  <button onClick={handleRename} className="p-3 bg-white text-black rounded-2xl hover:bg-gray-200 transition-all shadow-xl shrink-0"><FiCheck size={20} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-4 group">
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">{playlist.name}</h1>
                  <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-white/5 rounded-lg text-white/30"><FiEdit2 size={16} /></button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-white/40 text-xs font-semibold uppercase tracking-wider">
              <span>by Selection</span>
              <span>•</span>
              <span>Library Vault</span>
              <span>•</span>
              <span className="text-white/80">{playlist.songs.length} Tracks</span>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button 
                onClick={() => playlist.songs.length > 0 && setCurrentVideo(playlist.songs[0], playlist.songs)}
                className="bg-white text-black font-extrabold px-6 py-2.5 rounded-full hover:bg-white/90 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-xs uppercase tracking-wider border border-white"
              >
                <FiPlay size={14} className="fill-current" />
                Play All
              </button>
              <button className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-95">
                <FiHeart size={16} />
              </button>
              <button onClick={handleDelete} className="ml-auto text-white/25 hover:text-red-400 transition-all active:scale-95" title="Delete playlist">
                <FiTrash2 size={18} />
              </button>
            </div>
          </header>

          {/* Tracklist Table */}
          <div className="mt-6">
            <div className="space-y-1.5">
              {playlist.songs.map((song, index) => (
                <div 
                  key={song.id}
                  onClick={() => setCurrentVideo(song, playlist.songs)}
                  className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/[0.035] border border-transparent hover:border-white/[0.05] transition-all duration-300 cursor-pointer relative"
                >
                  <span className="w-6 text-white/20 font-bold text-[12px] tabular-nums text-center">{index + 1}</span>
                  
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-md border border-white/5 bg-white/[0.01]">
                      <img src={pickImageUrl(song.image)} className="w-full h-full object-cover" alt="" loading="lazy" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-white text-[14px] truncate leading-snug">{cleanText(song.name, 'Unknown Song')}</p>
                      <p className="text-[11px] font-semibold text-white/35 truncate mt-0.5 leading-none">{cleanText(song.primaryArtists, 'Unknown Artist')}</p>
                    </div>
                  </div>

                  <div className="hidden md:block text-white/25 text-[12px] font-semibold truncate max-w-[200px] mr-10">
                    {cleanText(song.album?.name, 'Single')}
                  </div>

                  <div className="text-white/25 text-[12px] font-bold tabular-nums">
                    {formatDuration(song.duration)}
                  </div>

                  {/* Actions (visible on hover) */}
                  <div className="flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all ml-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      title="Play next"
                      onClick={(e) => { e.stopPropagation(); playNextInQueue(song); }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white/25 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <FiSkipForward size={14} />
                    </button>
                    <button
                      title="Add to queue"
                      onClick={(e) => { e.stopPropagation(); addToQueue(song); }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white/25 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <FiPlus size={15} />
                    </button>
                    <button 
                      title="Remove from playlist"
                      onClick={(e) => { e.stopPropagation(); removeFromPlaylist(id, song.id); }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/5 transition-all"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              
              {playlist.songs.length === 0 && (
                <div className="py-20 text-center border border-dashed border-white/10 rounded-[32px] bg-white/[0.01]">
                  <FiMusic size={40} className="mx-auto text-white/10 mb-4 animate-[pulse_2s_infinite]" />
                  <p className="text-white/35 font-semibold text-sm">Nebula is empty</p>
                  <button 
                    onClick={() => navigate('/search')}
                    className="mt-4 text-xs font-bold uppercase tracking-widest text-white hover:text-orange-500 transition-colors border border-white/10 px-5 py-2.5 rounded-full bg-white/[0.02]"
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
