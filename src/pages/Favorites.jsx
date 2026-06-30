import { usePlayerStore } from '../store/usePlayerStore';
import VideoGrid from '../components/VideoGrid';
import { FiHeart, FiPlay } from 'react-icons/fi';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Favorites = () => {
  const favorites = usePlayerStore(state => state.favorites);
  const setCurrentVideo = usePlayerStore(state => state.setCurrentVideo);
  useDocumentTitle('Favorites');

  return (
    <div className="page-wrap animate-fade-up">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-7 mb-10 mt-4">
        <div
          className="w-40 h-40 sm:w-48 sm:h-48 shrink-0 rounded-[32px] flex items-center justify-center shadow-lg border border-white/10"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(236, 72, 153, 0.25) 100%)',
            boxShadow: '0 20px 40px rgba(236, 72, 153, 0.1)',
          }}
        >
          <FiHeart
            size={56}
            className="text-pink-500 fill-current"
          />
        </div>

        <div className="text-center sm:text-left">
          <p className="section-overline">Collection</p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-white/90 to-pink-400 bg-clip-text text-transparent tracking-tight leading-tight mb-3">
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
          className="flex flex-col items-center justify-center py-28 rounded-3xl border border-white/[0.06] bg-white/[0.015]"
        >
          <FiHeart size={44} className="text-white/10 mb-5" />
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
