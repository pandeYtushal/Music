import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { usePlayerStore } from '../store/usePlayerStore';
import { searchSongs } from '../api/saavn';
import { cleanText } from '../utils/text';
import { pickImageUrl } from '../utils/media';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { FiPlay, FiPlus } from 'react-icons/fi';
import HorizontalGallery from '../components/motion/HorizontalGallery';

function AlbumArtwork({ song, playlist }) {
  const setCurrentVideo = usePlayerStore((s) => s.setCurrentVideo);
  if (!song) return null;

  return (
    <div 
      className="w-40 md:w-56 lg:w-72 flex flex-col gap-3 cursor-pointer group"
      onClick={() => setCurrentVideo(song, playlist)}
    >
      <div className="w-full aspect-square overflow-hidden relative shadow-[0_15px_30px_rgba(0,0,0,0.4)]">
        <motion.img 
          layoutId={`home-track-artwork-${song.id}`}
          src={pickImageUrl(song.image, '500x500')} 
          alt={song.name}
          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-background shadow-lg hover:scale-105 active:scale-95 transition-transform">
            <FiPlay size={20} className="fill-current ml-1" />
          </button>
        </div>
      </div>
      <div>
        <p className="font-display font-bold text-lg md:text-xl text-primary truncate leading-tight group-hover:text-accent transition-colors">{cleanText(song.name)}</p>
        <p className="text-xs font-bold tracking-[0.2em] text-secondary uppercase truncate mt-1">{cleanText(song.primaryArtists)}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState({ newReleases: [], trending: [], charts: [] });
  const [loading, setLoading] = useState(true);
  
  const setCurrentVideo = usePlayerStore((s) => s.setCurrentVideo);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const recentlyPlayed = usePlayerStore((s) => s.recentlyPlayed || []);
  
  useDocumentTitle('MELDMUSIC');

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const [nr, tr, ch] = await Promise.all([
          searchSongs('new releases', { limit: 12, signal: ctrl.signal }),
          searchSongs('trending hits', { limit: 12, signal: ctrl.signal }),
          searchSongs('global top 50', { limit: 12, signal: ctrl.signal }),
        ]);
        setData({ newReleases: nr || [], trending: tr || [], charts: ch || [] });
      } catch (e) {
        if (e.name !== 'CanceledError' && e.code !== 'ERR_CANCELED') console.warn(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const featured = data.trending[0] || data.newReleases[0];

  if (loading || !featured) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <div className="text-xs font-bold tracking-[0.2em] text-secondary uppercase animate-pulse">Loading...</div>
      </div>
    );
  }

  const imgUrl = pickImageUrl(featured.image, '500x500');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className="w-full flex-1 flex flex-col pt-16 pb-24"
    >
      {/* HERO SECTION */}
      <section className="relative w-full h-[60vh] min-h-[400px] mb-20 md:mb-32">
        <div className="absolute inset-0 z-0">
          <img 
            src={imgUrl} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-30 blur-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />
        </div>

        <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-center md:items-end justify-center md:justify-start px-6 md:px-12 pb-12 gap-8">
          <div className="w-48 md:w-64 aspect-square shrink-0 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <img 
              src={imgUrl} 
              alt={featured.name} 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-2xl">
            <p className="text-[10px] font-bold tracking-[0.3em] text-accent uppercase mb-4 shadow-sm">
              Featured Trending Track
            </p>
            <h2 className="font-display font-bold text-4xl sm:text-5xl md:text-7xl leading-[1.1] text-primary mb-2 tracking-tight">
              {cleanText(featured.name)}
            </h2>
            <p className="text-sm md:text-lg font-bold tracking-[0.2em] text-secondary uppercase mb-8">
              {cleanText(featured.primaryArtists)}
            </p>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setCurrentVideo(featured, data.trending)}
                className="flex items-center gap-3 px-8 py-3 bg-primary text-background font-bold tracking-[0.2em] uppercase text-sm hover:scale-105 active:scale-95 transition-transform shadow-lg"
              >
                <FiPlay size={20} className="fill-current" />
                Play
              </button>
              <button 
                onClick={() => addToQueue(featured)}
                className="flex items-center gap-3 px-8 py-3 border border-border/50 text-primary font-bold tracking-[0.2em] uppercase text-sm hover:bg-surface transition-colors active:scale-95"
              >
                <FiPlus size={20} />
                Queue
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT ROWS */}
      <div className="flex flex-col gap-16 md:gap-24 px-6 md:px-12">
        {recentlyPlayed.length > 0 && (
          <section>
            <h3 className="font-display font-bold text-2xl md:text-3xl text-primary mb-6 uppercase tracking-tight">
              Jump Back In
            </h3>
            <HorizontalGallery 
              items={recentlyPlayed.slice(0, 10)}
              renderItem={(song) => <AlbumArtwork song={song} playlist={recentlyPlayed} />}
            />
          </section>
        )}

        <section>
          <h3 className="font-display font-bold text-2xl md:text-3xl text-primary mb-6 uppercase tracking-tight">
            Trending Now
          </h3>
          <HorizontalGallery 
            items={data.trending.slice(1)} // Skip the first one since it's featured
            renderItem={(song) => <AlbumArtwork song={song} playlist={data.trending} />}
          />
        </section>

        <section>
          <h3 className="font-display font-bold text-2xl md:text-3xl text-primary mb-6 uppercase tracking-tight">
            New Releases
          </h3>
          <HorizontalGallery 
            items={data.newReleases}
            renderItem={(song) => <AlbumArtwork song={song} playlist={data.newReleases} />}
          />
        </section>

        <section>
          <h3 className="font-display font-bold text-2xl md:text-3xl text-primary mb-6 uppercase tracking-tight">
            Global Top 50
          </h3>
          <HorizontalGallery 
            items={data.charts}
            renderItem={(song) => <AlbumArtwork song={song} playlist={data.charts} />}
          />
        </section>
      </div>
    </motion.div>
  );
}
