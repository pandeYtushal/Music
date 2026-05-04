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
    <div className="p-4 sm:p-6 md:p-8 pb-40 md:pb-32">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary">Your Library</h1>
          <p className="text-textSecondary">Manage and share your favorite collections.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-primary text-black font-bold px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          <FiPlus />
          Create Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-6">
            <FiMusic size={40} className="text-textSecondary" />
          </div>
          <h3 className="text-xl font-bold text-textPrimary mb-2">No playlists yet</h3>
          <p className="text-textSecondary mb-8">Create your first playlist to start organizing your music.</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="text-primary font-bold hover:underline"
          >
            Create Playlist Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {playlists.map((playlist) => (
            <div 
              key={playlist.id}
              onClick={() => navigate(`/playlist/${playlist.id}`)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square rounded-2xl bg-surface overflow-hidden mb-4 shadow-lg group-hover:shadow-primary/10 transition-all border border-white/5">
                {playlist.songs.length > 0 ? (
                  <img 
                    src={playlist.songs[0].image?.[2]?.link || playlist.songs[0].image?.[1]?.link} 
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiMusic size={48} className="text-textSecondary opacity-20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black shadow-xl">
                    <FiMusic size={24} />
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-textPrimary truncate">{playlist.name}</h3>
              <p className="text-xs text-textSecondary">{playlist.songs.length} songs</p>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-6">New Playlist</h2>
            <form onSubmit={handleCreate}>
              <div className="space-y-2 mb-8">
                <label className="text-sm font-medium text-textSecondary">Playlist Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="My awesome playlist"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-textPrimary focus:border-primary/50 outline-none transition-all"
                />
              </div>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold bg-primary text-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
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
