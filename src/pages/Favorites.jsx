import React from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import VideoGrid from '../components/VideoGrid';
import { FiHeart, FiPlay } from 'react-icons/fi';

const Favorites = () => {
  const { favorites, setCurrentVideo } = usePlayerStore();

  return (
    <div className="page-wrap animate-fade-up">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-7 mb-10 mt-4">
        <div
          className="w-40 h-40 sm:w-52 sm:h-52 shrink-0 rounded-3xl flex items-center justify-center shadow-lift"
          style={{
            background: 'linear-gradient(145deg, #1a1a1a, #111111)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <FiHeart
            size={60}
            className="text-white"
            style={{ fill: 'rgba(255,255,255,0.9)' }}
          />
        </div>

        <div className="text-center sm:text-left">
          <p className="section-overline">Collection</p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-tight mb-3">
            Liked Songs
          </h1>
          <p className="text-white/40 text-sm font-medium mb-5">
            Your Library &nbsp;·&nbsp; {favorites.length} {favorites.length === 1 ? 'song' : 'songs'}
          </p>
          {favorites.length > 0 && (
            <button
              onClick={() => setCurrentVideo(favorites[0], favorites)}
              className="btn-primary flex items-center gap-2.5 px-6 py-3 text-sm mx-auto sm:mx-0"
            >
              <FiPlay size={15} className="fill-current" />
              Play All
            </button>
          )}
        </div>
      </div>

      <div className="divider mb-8" />

      {favorites.length > 0 ? (
        <VideoGrid videos={favorites} />
      ) : (
        <div
          className="flex flex-col items-center justify-center py-36 rounded-3xl"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <FiHeart size={48} className="text-white/10 mb-5" />
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">No liked songs yet</h2>
          <p className="text-white/35 text-sm font-medium text-center max-w-xs">
            Tap the heart icon on any track to add it to your collection.
          </p>
        </div>
      )}
    </div>
  );
};

export default Favorites;
