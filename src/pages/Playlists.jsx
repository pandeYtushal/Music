import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';
import { FiPlus, FiMusic, FiFolder, FiPlay, FiX } from 'react-icons/fi';

const Playlists = () => {
  const navigate = useNavigate();
  const { playlists, createPlaylist } = usePlayerStore();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (name.trim()) {
      createPlaylist(name.trim());
      setName('');
      setShowModal(false);
    }
  };

  return (
    <div className="page-wrap animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
        <div>
          <p className="section-overline">Your Vault</p>
          <h1 className="section-heading">Library</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm self-start sm:self-auto"
        >
          <FiPlus size={16} />
          New Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-36 rounded-3xl text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <FiFolder size={28} className="text-white/30" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Library is empty</h3>
          <p className="text-white/35 text-sm font-medium mb-8 max-w-xs">
            Organize your music by creating curated playlists.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            <FiPlus size={14} /> Create your first playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => navigate(`/playlist/${playlist.id}`)}
              className="group cursor-pointer"
            >
              <div
                className="relative aspect-square rounded-2xl overflow-hidden mb-3 transition-all duration-200 group-hover:shadow-lift"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {playlist.songs.length > 0 ? (
                  <img
                    src={playlist.songs[0].image?.[2]?.link || playlist.songs[0].image?.[1]?.link}
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiMusic size={32} className="text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <div
                    className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lift scale-90 group-hover:scale-100 transition-transform duration-200"
                  >
                    <FiPlay size={18} className="fill-current ml-0.5" />
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-white text-sm truncate group-hover:text-white/70 transition-colors">{playlist.name}</h3>
              <p className="text-white/35 text-xs font-medium mt-0.5">{playlist.songs.length} tracks</p>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-8 animate-scale-in"
            style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">New Playlist</h2>
              <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white transition-colors">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="space-y-2 mb-7">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Playlist Name</label>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Morning Vibes"
                  className="w-full input-field rounded-xl px-4 py-3 text-sm font-medium"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-ghost flex-1 py-3 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 py-3 text-sm"
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
