import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';
import { FiPlay, FiShare2, FiEdit2, FiTrash2, FiX, FiCheck, FiCopy, FiMusic } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playlists, renamePlaylist, deletePlaylist, removeFromPlaylist, setCurrentVideo } = usePlayerStore();
  
  const playlist = playlists.find(p => p.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(playlist?.name || '');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!playlist) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Playlist not found</h2>
        <button onClick={() => navigate('/playlists')} className="text-primary mt-4">Go back</button>
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
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      deletePlaylist(id);
      navigate('/playlists');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = window.location.href;

  return (
    <div className="pb-40 md:pb-32 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative min-h-[400px] md:h-[450px] flex items-center md:items-end p-6 md:p-10 overflow-hidden pt-24 md:pt-12">
        <div className="absolute inset-0 z-0">
          {playlist.songs.length > 0 ? (
            <img 
              src={playlist.songs[0].image?.[2]?.link} 
              className="w-full h-full object-cover blur-[80px] opacity-40 scale-110"
              alt=""
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-surface to-background blur-3xl opacity-50"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 w-full max-w-7xl mx-auto">
          <div className="w-48 h-48 md:w-64 md:h-64 shrink-0 rounded-2xl glass overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group">
            {playlist.songs.length > 0 ? (
              <img src={playlist.songs[0].image?.[2]?.link} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={playlist.name} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface/30">
                <FiMusic size={64} className="text-textSecondary/20" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <p className="text-xs md:text-sm font-bold text-primary uppercase tracking-[0.2em] mb-2 md:mb-3 opacity-80">Playlist</p>
            {isEditing ? (
              <div className="flex items-center gap-4 justify-center md:justify-start mb-2">
                <input 
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-transparent border-b-2 border-primary/50 focus:border-primary text-3xl md:text-6xl font-bold outline-none w-full max-w-xl py-2 text-textPrimary placeholder:text-textSecondary/30 transition-colors"
                />
                <button onClick={handleRename} className="w-12 h-12 flex items-center justify-center bg-primary text-black rounded-full hover:scale-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0"><FiCheck size={24} /></button>
                <button onClick={() => setIsEditing(false)} className="w-12 h-12 flex items-center justify-center bg-surface border border-white/10 rounded-full hover:bg-white/5 transition-colors shrink-0"><FiX size={24} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-3 group justify-center md:justify-start mb-2">
                <h1 className="text-4xl md:text-7xl font-bold text-textPrimary leading-tight line-clamp-2 md:line-clamp-1 tracking-tight">{playlist.name}</h1>
                <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 transition-all p-3 hover:text-primary hover:bg-primary/10 rounded-full bg-surface/50 backdrop-blur-md border border-white/5"><FiEdit2 size={20} /></button>
              </div>
            )}
            <div className="mt-4 flex items-center gap-2 text-textSecondary justify-center md:justify-start text-sm md:text-base font-medium">
              <span className="text-textPrimary">{playlist.songs.length} songs</span>
              <span className="opacity-50">•</span>
              <span>Created for you</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Actions */}
        <div className="px-6 md:px-10 py-8 flex items-center gap-4 sm:gap-6">
          <button 
            onClick={() => playlist.songs.length > 0 && setCurrentVideo(playlist.songs[0], playlist.songs)}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center hover:scale-[1.05] active:scale-[0.95] transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)]"
          >
            <FiPlay size={32} className="fill-current ml-1.5" />
          </button>
          <button onClick={() => setShowShareModal(true)} className="w-12 h-12 flex items-center justify-center rounded-full border border-white/10 text-textSecondary hover:text-textPrimary hover:bg-white/5 transition-all">
            <FiShare2 size={20} />
          </button>
          <button onClick={handleDelete} className="w-12 h-12 flex items-center justify-center rounded-full border border-white/10 text-textSecondary hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/10 transition-all ml-auto">
            <FiTrash2 size={20} />
          </button>
        </div>

        {/* Songs List */}
        <div className="px-4 md:px-10">
          <div className="glass rounded-3xl overflow-hidden shadow-xl">
            {/* Header Row (Desktop Only) */}
            <div className="hidden md:flex items-center px-6 py-4 text-textSecondary text-xs uppercase tracking-widest border-b border-white/5 font-semibold bg-surface/30 backdrop-blur-md">
              <div className="w-12 text-center">#</div>
              <div className="flex-1 px-4">Title</div>
              <div className="flex-1 px-4">Album</div>
              <div className="w-20 text-right pr-4">Actions</div>
            </div>

            <div className="divide-y divide-white/5">
              {playlist.songs.map((song, index) => (
                <div 
                  key={song.id}
                  onClick={() => setCurrentVideo(song, playlist.songs)}
                  className="group flex items-center p-3 md:px-6 md:py-4 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  {/* Index (Desktop Only) */}
                  <div className="hidden md:block w-12 text-center text-textSecondary font-medium group-hover:text-primary transition-colors">
                    {index + 1}
                  </div>

                  {/* Title & Artist */}
                  <div className="flex-1 flex items-center gap-4 px-2 md:px-4 overflow-hidden">
                    <div className="relative w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-lg overflow-hidden shadow-md bg-surface">
                      <img src={song.image?.[0]?.link} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                        <FiPlay size={18} className="text-white fill-current shadow-lg" />
                      </div>
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-textPrimary text-sm md:text-base truncate group-hover:text-primary transition-colors duration-300" dangerouslySetInnerHTML={{ __html: song.name }}></p>
                      <p className="text-xs md:text-sm text-textSecondary truncate mt-0.5 opacity-80" dangerouslySetInnerHTML={{ __html: song.primaryArtists }}></p>
                    </div>
                  </div>

                  {/* Album (Desktop Only) */}
                  <div className="hidden md:block flex-1 px-4 text-textSecondary text-sm truncate opacity-80 group-hover:opacity-100 transition-opacity" dangerouslySetInnerHTML={{ __html: song.album?.name || 'Single' }}></div>

                  {/* Actions */}
                  <div className="w-12 md:w-20 flex justify-end">
                     <button 
                      onClick={(e) => { e.stopPropagation(); removeFromPlaylist(id, song.id); }}
                      className="p-2.5 text-textSecondary hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              
              {playlist.songs.length === 0 && (
                <div className="py-32 text-center flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full glass flex items-center justify-center mb-6">
                    <FiMusic size={40} className="text-primary/50" />
                  </div>
                  <h3 className="text-xl font-bold text-textPrimary mb-2">It's a bit quiet here...</h3>
                  <p className="text-textSecondary font-medium mb-6">Let's find some tracks for your playlist.</p>
                  <button 
                    onClick={() => navigate('/search')}
                    className="px-6 py-3 rounded-full bg-surface border border-white/10 font-bold hover:bg-white/5 transition-colors shadow-lg"
                  >
                    Explore Music
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-2xl font-bold tracking-tight">Share Playlist</h2>
              <button onClick={() => setShowShareModal(false)} className="p-2 rounded-full hover:bg-white/10 text-textSecondary hover:text-white transition-colors"><FiX size={24} /></button>
            </div>
            
            <div className="flex flex-col items-center mb-8 relative z-10">
              <div className="p-6 glass bg-white/5 border border-white/10 rounded-3xl mb-6 shadow-2xl">
                <div className="bg-white p-2 rounded-xl">
                  <QRCodeSVG value={shareUrl} size={160} fgColor="#000" bgColor="#fff" />
                </div>
              </div>
              <p className="text-sm font-medium text-textSecondary uppercase tracking-widest">Scan to Listen</p>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-3 p-2 bg-surface/50 border border-white/10 rounded-2xl">
                <input 
                  type="text" 
                  readOnly 
                  value={shareUrl}
                  className="flex-1 bg-transparent text-sm text-textSecondary outline-none truncate px-3"
                />
                <button 
                  onClick={copyToClipboard}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-4 py-2 rounded-xl shrink-0 flex items-center gap-2 transition-colors"
                >
                  {copied ? <><FiCheck className="text-primary" /> Copied</> : <><FiCopy /> Copy</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistDetail;
