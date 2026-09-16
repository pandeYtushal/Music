import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { usePlayerStore } from '../store/usePlayerStore';
import { searchSongs } from '../api/saavn';
import { cleanText } from '../utils/text';
import { pickImageUrl } from '../utils/media';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { FiPlay, FiPlus } from 'react-icons/fi';

export default function Home() {
  const [data, setData] = useState({ quickPicks: [] });
  const [loading, setLoading] = useState(true);
  const setCurrentVideo = usePlayerStore((s) => s.setCurrentVideo);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  
  useDocumentTitle('MELDMUSIC');

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await searchSongs('new hits', { limit: 16, signal: ctrl.signal });
        setData({ quickPicks: res || [] });
      } catch (e) {
        if (e.name !== 'CanceledError' && e.code !== 'ERR_CANCELED') console.warn(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const featured = data.quickPicks[0];

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
      className="w-full flex-1 flex flex-col items-center justify-center text-center px-6 pt-24 pb-24 min-h-[90vh] relative"
    >
      <p className="text-[10px] font-bold tracking-[0.3em] text-secondary uppercase mb-8 md:mb-12">
        Featured
      </p>

      <motion.div 
        className="w-full max-w-[350px] md:max-w-[450px] lg:max-w-[550px] aspect-square relative cursor-pointer group shadow-[0_30px_60px_rgba(0,0,0,0.6)] mb-10 md:mb-16"
        onClick={() => setCurrentVideo(featured, data.quickPicks)}
      >
        <img 
          src={imgUrl} 
          alt={featured.name} 
          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
      </motion.div>

      <div className="flex flex-col items-center max-w-3xl w-full">
        <h2 className="font-display font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[1.1] text-primary mb-4 tracking-tight px-4">
          {cleanText(featured.name)}
        </h2>
        <p className="text-base sm:text-lg md:text-2xl font-bold tracking-[0.2em] text-secondary uppercase mb-10 md:mb-16">
          {cleanText(featured.primaryArtists)}
        </p>
        
        <div className="flex items-center justify-center gap-10 md:gap-16">
          <button 
            onClick={() => setCurrentVideo(featured, data.quickPicks)}
            className="flex items-center gap-3 uppercase tracking-[0.2em] text-sm font-bold text-primary hover:text-accent transition-colors active:scale-95"
          >
            <FiPlay size={20} className="fill-current" />
            PLAY
          </button>
          <button 
            onClick={() => addToQueue(featured)}
            className="flex items-center gap-3 uppercase tracking-[0.2em] text-sm font-bold text-secondary hover:text-primary transition-colors active:scale-95"
          >
            <FiPlus size={20} />
            QUEUE
          </button>
        </div>
      </div>
    </motion.div>
  );
}
