import { useState } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { FiX, FiMusic, FiPlus } from 'react-icons/fi';
import { cleanText } from '../utils/text';
import { pickImageUrl } from '../utils/media';

const AddToPlaylistModal = () => {
  const playlists = usePlayerStore((state) => state.playlists);
  const isAddToPlaylistModalOpen = usePlayerStore((state) => state.isAddToPlaylistModalOpen);
  const closeAddToPlaylistModal = usePlayerStore((state) => state.closeAddToPlaylistModal);
  const pendingSong = usePlayerStore((state) => state.pendingSong);
  const addToPlaylist = usePlayerStore((state) => state.addToPlaylist);
  const createPlaylist = usePlayerStore((state) => state.createPlaylist);
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
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-950 border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-[0_24px_70px_rgba(0,0,0,0.85)] animate-scale-in">
        <div className="flex items-center justify-between mb-5 border-b border-white/[0.08] pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-semibold">
              LIBRARY PLAYLISTS
            </span>
            <h2 className="text-xl font-display font-semibold text-white">Add to Playlist</h2>
          </div>
          <button
            onClick={closeAddToPlaylistModal}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Selected Song Preview */}
        <div className="flex items-center gap-3.5 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl mb-5">
          <img
            src={pickImageUrl(pendingSong.image)}
            className="w-11 h-11 rounded-lg object-cover border border-white/10 shadow"
            alt={cleanText(pendingSong.name, 'Song cover')}
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-xs text-white truncate">{cleanText(pendingSong.name, 'Unknown Song')}</p>
            <p className="text-[11px] text-neutral-400 font-normal truncate mt-0.5">{cleanText(pendingSong.primaryArtists, 'Unknown Artist')}</p>
          </div>
        </div>

        {/* Create New Playlist Form */}
        <form onSubmit={handleCreateAndAdd} className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={newPlaylistName}
            onChange={(event) => setNewPlaylistName(event.target.value)}
            maxLength={60}
            placeholder="New playlist name..."
            className="min-w-0 flex-1 rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 placeholder:text-neutral-500"
          />
          <button
            type="submit"
            disabled={!newPlaylistName.trim()}
            className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-500 transition-all shrink-0 font-bold"
            aria-label="Create playlist"
          >
            <FiPlus size={18} />
          </button>
        </form>

        {/* Existing Playlists list */}
        <div className="max-h-[220px] overflow-y-auto space-y-1.5 mb-5 pr-1">
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => handleAddToPlaylist(playlist.id)}
              className="w-full flex items-center gap-3 p-2.5 hover:bg-white/[0.06] bg-white/[0.02] border border-white/[0.04] rounded-xl transition-all text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                {playlist.songs.length > 0 ? (
                  <img src={pickImageUrl(playlist.songs[0].image)} className="w-full h-full object-cover" alt="" />
                ) : (
                  <FiMusic className="text-neutral-500" size={14} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs text-white group-hover:text-indigo-400 truncate transition-colors">
                  {playlist.name}
                </p>
                <p className="text-[10.5px] font-mono text-neutral-400">
                  {playlist.songs.length} tracks
                </p>
              </div>
            </button>
          ))}
          {playlists.length === 0 && (
            <p className="text-center py-6 text-xs font-mono text-neutral-400">
              No playlists created yet. Create one above!
            </p>
          )}
        </div>

        <button
          onClick={closeAddToPlaylistModal}
          className="w-full py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
