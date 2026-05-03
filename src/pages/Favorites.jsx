import React from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import VideoGrid from '../components/VideoGrid';
import { FiHeart } from 'react-icons/fi';

const Favorites = () => {
  const { favorites } = usePlayerStore();

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-32">
      <div className="flex flex-col sm:flex-row items-center sm:items-end text-center sm:text-left gap-6 mb-8 mt-6 sm:mt-10">
        <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          <FiHeart size={64} className="text-white fill-current" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-textSecondary mb-2">Playlist</p>
          <h1 className="text-4xl md:text-6xl font-bold text-textPrimary mb-4">Liked Songs</h1>
          <p className="text-textSecondary text-sm">
            <strong className="text-white">You</strong> • {favorites.length} songs
          </p>
        </div>
      </div>

      <div className="w-full h-px bg-white/10 mb-8"></div>

      {favorites.length > 0 ? (
        <VideoGrid videos={favorites} />
      ) : (
        <div className="text-center py-20 bg-surface/30 rounded-2xl border border-white/5">
          <FiHeart size={48} className="mx-auto text-textSecondary mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-textPrimary mb-2">Songs you like will appear here</h2>
          <p className="text-textSecondary">Save songs by tapping the heart icon.</p>
        </div>
      )}
    </div>
  );
};

export default Favorites;
