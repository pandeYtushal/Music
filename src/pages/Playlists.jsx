import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';
import { FiPlus, FiMusic, FiMoreVertical, FiTrash2, FiEdit2 } from 'react-icons/fi';

const Playlists = () => {
  const navigate = useNavigate();
  const { playlists, createPlaylist, deletePlaylist, renamePlaylist } = usePlayerStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreateModal(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-40 md:pb-32 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 md:mb-12">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-textPrimary tracking-tight mb-2">Your Library</h1>
          <p className="text-sm md:text-base text-textSecondary font-medium">Manage and share your favorite collections.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold px-6 py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] whitespace-nowrap"
        >
          <FiPlus size={20} />
          Create Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in slide-in-from-bottom-4 duration-700">
          <div className="w-24 h-24 rounded-full glass flex items-center justify-center mb-6 shadow-2xl">
            <FiMusic size={40} className="text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-textPrimary mb-3">No playlists yet</h3>
          <p className="text-textSecondary mb-8 max-w-sm">Create your first playlist to start organizing your music into custom collections.</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="text-primary font-bold hover:text-white transition-colors"
          >
            Create Playlist Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
          {playlists.map((playlist, index) => (
            <div 
              key={playlist.id}
              onClick={() => navigate(`/playlist/${playlist.id}`)}
              className="group cursor-pointer animate-in fade-in zoom-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative aspect-square rounded-2xl glass overflow-hidden mb-4 shadow-lg group-hover:-translate-y-2 group-hover:shadow-[0_10px_30px_rgba(16,185,129,0.2)] transition-all duration-500 border border-white/5">
                {playlist.songs.length > 0 ? (
                  <img 
                    src={playlist.songs[0].image?.[2]?.link || playlist.songs[0].image?.[1]?.link} 
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface/30">
                    <FiMusic size={48} className="text-textSecondary opacity-20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-black shadow-[0_0_20px_rgba(16,185,129,0.5)] transform scale-50 group-hover:scale-100 transition-transform duration-300">
                    <FiMusic size={24} className="ml-1" />
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-textPrimary truncate group-hover:text-primary transition-colors">{playlist.name}</h3>
              <p className="text-xs text-textSecondary mt-1">{playlist.songs.length} songs</p>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
            <h2 className="text-2xl font-bold mb-6 relative z-10">New Playlist</h2>
            <form onSubmit={handleCreate} className="relative z-10">
              <div className="space-y-3 mb-8">
                <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Playlist Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="My awesome playlist"
                  className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-4 text-textPrimary focus:border-primary/50 focus:bg-surface/80 outline-none transition-all placeholder:text-textSecondary/50"
                />
              </div>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold bg-surface border border-white/10 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl font-bold bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlists;
