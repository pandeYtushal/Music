import { } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { FiArrowLeft, FiPlay, } from 'react-icons/fi';
import { searchSongs } from '../api/saavn';
import { cleanText } from '../utils/text';
import { pickImageUrl } from '../utils/media';
import { formatDuration } from '../utils/format';
import { usePlayerStore } from '../store/usePlayerStore';
import useDocumentTitle from '../hooks/useDocumentTitle';
import HorizontalGallery from '../components/motion/HorizontalGallery';

function TrackRow({ song, index, playlist }) {
  const setCurrentVideo = usePlayerStore((s) => s.setCurrentVideo);
  const currentVideo = usePlayerStore((s) => s.currentVideo);
  const isCurrent = currentVideo?.id === song.id;

  return (
    <div 
      className={`group flex items-baseline gap-4 py-4 md:py-6 border-b border-border/30 cursor-pointer transition-colors ${isCurrent ? 'bg-surface/30' : 'hover:bg-surface/10'}`}
      onClick={() => setCurrentVideo(song, playlist)}
    >
      <span className="text-xs font-mono font-bold text-secondary w-8 md:w-12 shrink-0">{String(index + 1).padStart(2, '0')}</span>
      <div className="min-w-0 flex-1 flex flex-col md:flex-row md:items-baseline md:gap-6">
        <span className={`font-display font-bold text-3xl md:text-5xl group-hover:text-primary transition-colors truncate ${isCurrent ? 'text-primary' : 'text-secondary'}`}>
          {cleanText(song.name)}
        </span>
        <span className="text-xs md:text-sm font-bold tracking-[0.2em] text-secondary truncate uppercase">
          {cleanText(song.album?.name, 'Single')}
        </span>
      </div>
      <div className="text-xs font-bold tracking-[0.2em] text-secondary tabular-nums ml-4 shrink-0">
        {formatDuration(song.duration)}
      </div>
    </div>
  );
}

function AlbumArtwork({ song, playlist }) {
  const setCurrentVideo = usePlayerStore((s) => s.setCurrentVideo);
  if (!song) return null;

  return (
    <div 
      className="w-48 md:w-72 lg:w-96 flex flex-col gap-4 cursor-pointer group"
      onClick={() => setCurrentVideo(song, playlist)}
    >
      <div className="w-full aspect-square overflow-hidden relative shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
        <motion.img 
          layoutId={`track-artwork-${song.id}`}
          src={pickImageUrl(song.image, '500x500')} 
          alt={song.name}
          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
      </div>
      <div>
        <p className="font-display font-bold text-2xl md:text-3xl text-primary truncate leading-tight group-hover:text-accent transition-colors">{cleanText(song.name)}</p>
        <p className="text-xs md:text-sm font-bold tracking-[0.2em] text-secondary uppercase truncate">{cleanText(song.primaryArtists)}</p>
      </div>
    </div>
  );
}

const ArtistPage = () => {
  const { name } = useParams();
  const artistName = decodeURIComponent(name || 'Artist');
  const navigate = useNavigate();
  const setCurrentVideo = usePlayerStore((s) => s.setCurrentVideo);

  useDocumentTitle(`${artistName} — MELDMUSIC`);

  const { data: songs = [], isLoading } = useQuery({
    queryKey: ['artistDiscography', artistName],
    queryFn: async ({ signal }) => {
      return searchSongs(`${artistName} best songs`, { limit: 20, signal });
    },
  });

  const featuredTrack = songs[0];
  const popularTracks = songs.slice(0, 10);
  const moreReleases = songs.slice(10);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full pb-32 px-6 md:px-12 pt-32"
    >
      <button
        onClick={() => navigate(-1)}
        className="fixed top-24 left-6 md:left-12 z-50 inline-flex items-center gap-3 text-xs font-bold tracking-[0.3em] text-secondary uppercase hover:text-primary transition-colors cursor-pointer bg-background/50 backdrop-blur-md px-4 py-2 rounded-full"
      >
        <FiArrowLeft size={16} />
        <span>Back</span>
      </button>

      <div className="flex flex-col items-center justify-center text-center mt-8 mb-32 md:mb-48">
        {featuredTrack && (
          <motion.div 
            className="w-full max-w-[300px] md:max-w-[400px] lg:max-w-[500px] aspect-square relative shrink-0 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] mb-12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <img 
              src={pickImageUrl(featuredTrack.image, '500x500')} 
              alt={artistName} 
              className="w-full h-full object-cover grayscale opacity-90 transition-transform duration-1000 ease-out hover:scale-105"
            />
          </motion.div>
        )}

        <div className="flex flex-col items-center max-w-4xl w-full">
          <p className="text-[10px] font-bold tracking-[0.4em] text-secondary uppercase mb-8">Verified Artist</p>
          <h1 className="font-display font-bold text-6xl md:text-8xl lg:text-[8rem] leading-[0.9] text-primary mb-12 uppercase tracking-tight">
            {artistName}
          </h1>
          
          {featuredTrack && (
            <button 
              onClick={() => setCurrentVideo(featuredTrack, songs)}
              className="flex items-center gap-3 uppercase tracking-[0.2em] text-sm font-bold text-primary hover:text-accent transition-colors active:scale-95 border border-primary/50 px-8 py-4 hover:border-primary hover:bg-primary hover:text-background"
            >
              <FiPlay size={20} className="fill-current" />
              PLAY RADIO
            </button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="text-xs font-bold tracking-[0.2em] text-secondary uppercase animate-pulse text-center">Loading discography...</div>
      )}

      {!isLoading && popularTracks.length > 0 && (
        <section className="mb-32 md:mb-48">
          <div className="border-b border-border/30 pb-6 mb-12 flex justify-between items-baseline">
            <h2 className="font-display font-bold text-4xl text-primary uppercase">Essential Listening</h2>
          </div>
          <div className="flex flex-col">
            {popularTracks.map((song, i) => (
              <TrackRow key={song.id} song={song} index={i} playlist={songs} />
            ))}
          </div>
        </section>
      )}

      {!isLoading && moreReleases.length > 0 && (
        <section className="mb-32 md:mb-48">
          <div className="border-b border-border/30 pb-6 mb-12">
            <h2 className="font-display font-bold text-4xl text-primary uppercase">More Releases</h2>
          </div>
          <HorizontalGallery 
            items={moreReleases}
            renderItem={(song) => <AlbumArtwork song={song} playlist={moreReleases} />}
          />
        </section>
      )}

    </motion.div>
  );
};

export default ArtistPage;
