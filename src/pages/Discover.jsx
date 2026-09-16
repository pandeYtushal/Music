import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { usePlayerStore } from '../store/usePlayerStore';
import { searchSongs } from '../api/saavn';
import { cleanText } from '../utils/text';
import { pickImageUrl } from '../utils/media';
import useDocumentTitle from '../hooks/useDocumentTitle';
import HorizontalGallery from '../components/motion/HorizontalGallery';

const MOODS = [
  { id: 'focus',    label: 'DEEP FOCUS',      query: 'instrumental acoustic lofi' },
  { id: 'drive',    label: 'NIGHT DRIVE',     query: 'late night drive electronic' },
  { id: 'indie',    label: 'SOUL & ROMANCE',  query: 'soulful romantic acoustic' },
  { id: 'energy',   label: 'HIGH ENERGY',     query: 'upbeat dance pop hits' },
  { id: 'chill',    label: 'CHILL / RELAX',   query: 'soft chill morning melodies' },
  { id: 'classics', label: 'TIMELESS CLASSICS', query: 'evergreen golden hits' },
];

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

function NumberedTrack({ song, index, playlist }) {
  const setCurrentVideo = usePlayerStore((s) => s.setCurrentVideo);
  
  return (
    <div 
      className="group flex items-baseline gap-4 py-4 md:py-6 border-b border-border/30 cursor-pointer hover:bg-surface/10 transition-colors"
      onClick={() => setCurrentVideo(song, playlist)}
    >
      <span className="text-xs font-mono font-bold text-secondary w-8 md:w-12 shrink-0">{String(index + 1).padStart(2, '0')}</span>
      <div className="min-w-0 flex-1 flex flex-col md:flex-row md:items-baseline md:gap-6">
        <span className="font-display font-bold text-3xl md:text-5xl text-primary group-hover:text-accent transition-colors truncate">
          {cleanText(song.name)}
        </span>
        <span className="text-xs md:text-sm font-bold tracking-[0.2em] text-secondary truncate uppercase">
          {cleanText(song.primaryArtists)}
        </span>
      </div>
    </div>
  );
}

export default function Discover() {
  const navigate = useNavigate();
  useDocumentTitle('Discover — MELDMUSIC');

  const [data, setData] = useState({ newReleases: [], trending: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const [nr, tr] = await Promise.all([
          searchSongs('new hits 2024', { limit: 10, signal: ctrl.signal }),
          searchSongs('trending top songs', { limit: 10, signal: ctrl.signal })
        ]);
        setData({ newReleases: nr || [], trending: tr || [] });
      } catch (e) {
        if (e.name !== 'CanceledError' && e.code !== 'ERR_CANCELED') console.warn(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full pt-32 pb-32 px-6 md:px-12"
    >
      <header className="mb-24 md:mb-32">
        <h1 className="font-display font-bold text-5xl sm:text-6xl md:text-8xl lg:text-[8rem] text-primary leading-none mb-6 tracking-tight">DISCOVER</h1>
        <p className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-secondary uppercase">Explore the Catalog</p>
      </header>

      {/* NEW RELEASES */}
      <section className="mb-32 md:mb-48">
        <div className="border-b border-border/30 pb-6 mb-12">
          <h2 className="font-display font-bold text-4xl text-primary uppercase">New Releases</h2>
        </div>
        {!loading && (
          <HorizontalGallery 
            items={data.newReleases}
            renderItem={(song) => <AlbumArtwork song={song} playlist={data.newReleases} />}
          />
        )}
      </section>

      {/* TRENDING */}
      <section className="mb-32 md:mb-48">
        <div className="border-b border-border/30 pb-6 mb-12">
          <h2 className="font-display font-bold text-4xl text-primary uppercase">Trending Now</h2>
        </div>
        <div className="flex flex-col">
          {!loading && data.trending.map((song, i) => (
            <NumberedTrack key={song.id} song={song} index={i} playlist={data.trending} />
          ))}
        </div>
      </section>

      {/* MOODS: Typographic List */}
      <section className="mb-24">
        <div className="border-b border-border/30 pb-6 mb-12">
          <h2 className="font-display font-bold text-4xl text-primary uppercase">Atmospheres</h2>
        </div>
        <div className="flex flex-col">
          {MOODS.map((m) => (
            <motion.div
              key={m.id}
              whileHover={{ x: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={() => navigate(`/search?q=${encodeURIComponent(m.query)}`)}
              className="py-6 md:py-10 border-b border-border/20 cursor-pointer group"
            >
              <h3 className="font-display font-bold text-4xl md:text-6xl lg:text-8xl text-secondary group-hover:text-primary transition-colors leading-none tracking-tighter">
                {m.label}
              </h3>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
