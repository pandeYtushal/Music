import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';
import { FiPlus, FiHeart, FiClock, FiTrendingUp, FiX, FiRadio, FiPlay } from 'react-icons/fi';
import { pickImageUrl } from '../utils/media';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Playlists = () => {
  const navigate = useNavigate();
  const playlists = usePlayerStore((state) => state.playlists);
  const favorites = usePlayerStore((state) => state.favorites);
  const recentlyPlayed = usePlayerStore((state) => state.recentlyPlayed);
  const createPlaylist = usePlayerStore((state) => state.createPlaylist);
  const setCurrentVideo = usePlayerStore((state) => state.setCurrentVideo);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  useDocumentTitle('Library & Playlists — MELDMUSIC');

  const handleCreate = (e) => {
    e.preventDefault();
    if (name.trim()) {
      const newId = createPlaylist(name.trim());
      setName('');
      setShowModal(false);
      navigate(`/playlists/${newId}`);
    }
  };

  return (
    <div className="w-full pt-32 pb-32 px-6 md:px-12 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24 md:mb-32">
        <div>
          <p className="text-[10px] font-bold tracking-[0.4em] text-secondary uppercase mb-8">Personal Library</p>
          <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-primary leading-none uppercase tracking-tight">
            Library
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-3 px-8 py-4 bg-primary text-background text-sm font-bold tracking-[0.2em] uppercase hover:bg-accent transition-colors self-start md:self-auto active:scale-95"
        >
          <FiPlus size={20} />
          NEW PLAYLIST
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-0 border-y border-border/30 mb-32 md:mb-48 divide-y md:divide-y-0 md:divide-x divide-border/30">
        <div
          onClick={() => navigate('/favorites')}
          className="group py-8 md:py-12 px-6 md:px-12 hover:bg-surface/10 transition-colors cursor-pointer flex flex-col items-start justify-between min-h-[240px]"
        >
          <FiHeart size={32} className="text-secondary group-hover:text-primary transition-colors mb-auto" />
          <div className="mt-8">
            <h3 className="font-display font-bold text-2xl md:text-3xl text-primary group-hover:text-accent transition-colors mb-4">Liked Songs</h3>
            <p className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">
              {favorites.length} {favorites.length === 1 ? 'Track' : 'Tracks'}
            </p>
          </div>
        </div>

        <div
          onClick={() => navigate('/recently-played')}
          className="group py-8 md:py-12 px-6 md:px-12 hover:bg-surface/10 transition-colors cursor-pointer flex flex-col items-start justify-between min-h-[240px]"
        >
          <FiClock size={32} className="text-secondary group-hover:text-primary transition-colors mb-auto" />
          <div className="mt-8">
            <h3 className="font-display font-bold text-2xl md:text-3xl text-primary group-hover:text-accent transition-colors mb-4">History</h3>
            <p className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">
              {recentlyPlayed.length} Recent Tracks
            </p>
          </div>
        </div>

        <div
          onClick={() => navigate('/stats')}
          className="group py-8 md:py-12 px-6 md:px-12 hover:bg-surface/10 transition-colors cursor-pointer flex flex-col items-start justify-between min-h-[240px]"
        >
          <FiTrendingUp size={32} className="text-secondary group-hover:text-primary transition-colors mb-auto" />
          <div className="mt-8">
            <h3 className="font-display font-bold text-2xl md:text-3xl text-primary group-hover:text-accent transition-colors mb-4">Stats</h3>
            <p className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">
              Playback Dossier
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border/30 pb-6 mb-12 gap-4">
          <h2 className="font-display font-bold text-4xl text-primary uppercase">Your Playlists</h2>
          <span className="text-xs font-bold tracking-[0.2em] text-secondary uppercase">
            {playlists.length} {playlists.length === 1 ? 'Playlist' : 'Playlists'}
          </span>
        </div>

        {playlists.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-display font-bold text-3xl md:text-5xl text-primary mb-6">No playlists yet</p>
            <p className="text-xs font-bold tracking-[0.2em] text-secondary uppercase mb-12">Create playlists to organize your favorite music.</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-3 px-8 py-4 border border-primary text-primary text-sm font-bold tracking-[0.2em] uppercase hover:bg-primary hover:text-background transition-colors active:scale-95"
            >
              <FiPlus size={20} />
              CREATE FIRST PLAYLIST
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {playlists.map((playlist) => (
              <div 
                key={playlist.id}
                className="group flex items-center gap-6 md:gap-8 py-6 md:py-10 border-b border-border/20 cursor-pointer hover:bg-surface/10 transition-colors"
                onClick={() => navigate(`/playlists/${playlist.id}`)}
              >
                <div className="w-20 h-20 md:w-32 md:h-32 bg-surface shrink-0 overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                  {playlist.songs.length > 0 ? (
                    <img 
                      src={pickImageUrl(playlist.songs[0].image, '150x150')} 
                      alt={playlist.name}
                      className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 ease-out group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface/30">
                      <FiRadio size={32} className="text-secondary opacity-50" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-bold text-2xl md:text-4xl lg:text-5xl text-secondary group-hover:text-primary transition-colors truncate tracking-tighter">
                    {playlist.name}
                  </p>
                  <p className="text-xs md:text-sm font-bold tracking-[0.2em] text-secondary truncate uppercase mt-2">
                    {playlist.songs.length} {playlist.songs.length === 1 ? 'TRACK' : 'TRACKS'}
                  </p>
                </div>
                {playlist.songs.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentVideo(playlist.songs[0], playlist.songs);
                    }}
                    className="hidden md:flex w-16 h-16 rounded-full border border-primary items-center justify-center text-primary hover:bg-primary hover:text-background transition-all duration-300 mr-4 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                  >
                    <FiPlay size={24} className="fill-current ml-1" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {showModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-lg p-8 md:p-12 border border-border/30 bg-background shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8 border-b border-border/30 pb-6">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary uppercase">New Playlist</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-secondary hover:text-primary transition-colors"
              >
                <FiX size={32} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="mb-12">
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-4">
                  Playlist Title
                </label>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. LATE NIGHT DRIVES"
                  className="w-full bg-transparent border-b-2 border-border/30 py-4 text-2xl md:text-3xl font-display font-bold text-primary placeholder:text-border/50 focus:outline-none focus:border-primary transition-colors uppercase tracking-tight"
                />
              </div>
              <div className="flex gap-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 border border-primary/50 text-primary text-sm font-bold tracking-[0.2em] uppercase hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="flex-1 py-4 bg-primary text-background text-sm font-bold tracking-[0.2em] uppercase hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
