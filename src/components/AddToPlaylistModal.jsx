import React from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { FiX, FiMusic, FiPlus } from 'react-icons/fi';

const AddToPlaylistModal = () => {
  const { 
    playlists, 
    isAddToPlaylistModalOpen, 
    closeAddToPlaylistModal, 
    pendingSong, 
    addToPlaylist,
    createPlaylist 
  } = usePlayerStore();

  if (!isAddToPlaylistModalOpen || !pendingSong) return null;

  const handleAddToPlaylist = (playlistId) => {
    addToPlaylist(playlistId, pendingSong);
    closeAddToPlaylistModal();
  };

  const handleCreateAndAdd = () => {
    const name = window.prompt('Enter playlist name:');
    if (name) {
      const id = createPlaylist(name);
      addToPlaylist(id, pendingSong);
      closeAddToPlaylistModal();
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Add to Playlist</h2>
          <button onClick={closeAddToPlaylistModal} className="text-textSecondary hover:text-textPrimary"><FiX size={24} /></button>
        </div>

        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl mb-6">
          <img src={pendingSong.image?.[0]?.link} className="w-12 h-12 rounded shadow-md" alt={pendingSong.name} />
          <div className="overflow-hidden">
            <p className="font-semibold text-textPrimary truncate" dangerouslySetInnerHTML={{ __html: pendingSong.name }}></p>
            <p className="text-xs text-textSecondary truncate" dangerouslySetInnerHTML={{ __html: pendingSong.primaryArtists }}></p>
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto scrollbar-hide space-y-2 mb-6">
          <button 
            onClick={handleCreateAndAdd}
            className="w-full flex items-center gap-4 p-4 hover:bg-primary/10 rounded-2xl transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
              <FiPlus size={20} />
            </div>
            <span className="font-bold text-primary">New Playlist</span>
          </button>

          {playlists.map(playlist => (
            <button 
              key={playlist.id}
              onClick={() => handleAddToPlaylist(playlist.id)}
              className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-surface border border-white/5 overflow-hidden flex items-center justify-center">
                {playlist.songs.length > 0 ? (
                  <img src={playlist.songs[0].image?.[0]?.link} className="w-full h-full object-cover" alt="" />
                ) : (
                  <FiMusic className="text-textSecondary/20" />
                )}
              </div>
              <div className="text-left">
                <p className="font-bold text-textPrimary">{playlist.name}</p>
                <p className="text-xs text-textSecondary">{playlist.songs.length} songs</p>
              </div>
            </button>
          ))}
        </div>

        <button 
          onClick={closeAddToPlaylistModal}
          className="w-full py-4 rounded-xl font-bold bg-white/5 hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
