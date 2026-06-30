import { useState } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { FiX, FiMusic, FiPlus } from 'react-icons/fi';
import { cleanText } from '../utils/text';
import { pickImageUrl } from '../utils/media';

const AddToPlaylistModal = () => {
  const playlists = usePlayerStore(state => state.playlists);
  const isAddToPlaylistModalOpen = usePlayerStore(state => state.isAddToPlaylistModalOpen);
  const closeAddToPlaylistModal = usePlayerStore(state => state.closeAddToPlaylistModal);
  const pendingSong = usePlayerStore(state => state.pendingSong);
  const addToPlaylist = usePlayerStore(state => state.addToPlaylist);
  const createPlaylist = usePlayerStore(state => state.createPlaylist);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  if (!isAddToPlaylistModalOpen || !pendingSong) return null;

  const handleAddToPlaylist = (playlistId) => {
    addToPlaylist(playlistId, pendingSong);
    closeAddToPlaylistModal();
  };

  const handleCreateAndAdd = (event) => {
    event.preventDefault();
    if (!newPlaylistName.trim()) return;

    const id = createPlaylist(newPlaylistName);
    addToPlaylist(id, pendingSong);
    setNewPlaylistName('');
    closeAddToPlaylistModal();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Add to Playlist</h2>
          <button onClick={closeAddToPlaylistModal} className="text-textSecondary hover:text-textPrimary"><FiX size={24} /></button>
        </div>

        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl mb-6">
          <img src={pickImageUrl(pendingSong.image)} className="w-12 h-12 rounded shadow-md" alt={cleanText(pendingSong.name, 'Song cover')} />
          <div className="overflow-hidden">
            <p className="font-semibold text-textPrimary truncate">{cleanText(pendingSong.name, 'Unknown Song')}</p>
            <p className="text-xs text-textSecondary truncate">{cleanText(pendingSong.primaryArtists, 'Unknown Artist')}</p>
          </div>
        </div>

        <form onSubmit={handleCreateAndAdd} className="flex items-center gap-2 mb-5">
          <input
            type="text"
            value={newPlaylistName}
            onChange={(event) => setNewPlaylistName(event.target.value)}
            maxLength={60}
            placeholder="New playlist name"
            className="input-field min-w-0 flex-1 rounded-xl px-4 py-3 text-sm font-medium"
          />
          <button
            type="submit"
            disabled={!newPlaylistName.trim()}
            className="w-12 h-12 rounded-xl bg-primary text-black flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="Create playlist"
          >
            <FiPlus size={20} />
          </button>
        </form>

        <div className="max-h-[300px] overflow-y-auto scrollbar-hide space-y-2 mb-6">
          {playlists.map(playlist => (
            <button 
              key={playlist.id}
              onClick={() => handleAddToPlaylist(playlist.id)}
              className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-surface border border-white/5 overflow-hidden flex items-center justify-center">
                {playlist.songs.length > 0 ? (
                  <img src={pickImageUrl(playlist.songs[0].image)} className="w-full h-full object-cover" alt="" />
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
