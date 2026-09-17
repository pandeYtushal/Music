import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { FiSearch, FiX } from 'react-icons/fi';
import { searchSongs } from '../api/saavn';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { usePlayerStore } from '../store/usePlayerStore';
import { cleanText } from '../utils/text';
import { pickImageUrl } from '../utils/media';

const SUGGESTIONS = [
  { label: 'Arijit Singh',    query: 'arijit singh romantic hits',       tag: 'TREND' },
  { label: 'A.R. Rahman',     query: 'ar rahman evergreen soundtracks',  tag: 'LEGEND' },
  { label: 'AP Dhillon',      query: 'ap dhillon best tracks',           tag: 'PUNJABI' },
  { label: 'Diljit Dosanjh',  query: 'diljit dosanjh hits',              tag: 'POP' },
  { label: 'Prateek Kuhad',   query: 'prateek kuhad acoustic indie',     tag: 'INDIE' },
  { label: 'Anirudh',         query: 'anirudh ravichander top hits',     tag: 'SOUTH' },
];

function TrackRow({ song, playlist }) {
  const setCurrentVideo = usePlayerStore((s) => s.setCurrentVideo);
  
  return (
    <div 
      className="group flex items-center gap-6 md:gap-8 py-4 md:py-6 border-b border-border/30 cursor-pointer hover:bg-surface/10 transition-colors"
      onClick={() => setCurrentVideo(song, playlist)}
    >
      <div className="w-20 h-20 md:w-28 md:h-28 bg-surface shrink-0 overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
        <img 
          src={pickImageUrl(song.image, '150x150')} 
          alt={song.name}
          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05]"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display font-bold text-2xl md:text-3xl text-primary group-hover:text-accent transition-colors truncate">
          {cleanText(song.name)}
        </p>
        <p 
          className="text-xs md:text-sm font-bold tracking-[0.2em] text-secondary truncate uppercase mt-1"
        >
          {cleanText(song.primaryArtists)}
        </p>
      </div>
    </div>
  );
}

export default function Search() {
  const [params, setParams] = useSearchParams();
    const query = params.get('q') || '';
  const [input, setInput] = useState(query);
  const [focused, setFocused] = useState(false);

  useDocumentTitle(query ? `"${query}" — MELDMUSIC` : 'Search — MELDMUSIC');

  const { data: songs = [], isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: ({ signal }) => searchSongs(query.trim(), { limit: 24, signal }),
    enabled: !!query.trim(),
  });

  const submit = (e) => {
    e.preventDefault();
    if (input.trim()) setParams({ q: input.trim() });
  };

  const pick = (q) => {
    setInput(q);
    setParams({ q });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full pt-32 pb-32 px-6 md:px-12"
    >
      <header className="mb-24 md:mb-32">
        <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-primary leading-none mb-6 uppercase tracking-tight">
          Search
        </h1>
        <p className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-secondary uppercase">
          Find Tracks, Artists & Moods
        </p>
      </header>

      <form onSubmit={submit} className="mb-24 md:mb-32 relative">
        <div className={`flex items-center border-b-2 transition-colors duration-300 ${focused ? 'border-primary' : 'border-border/30'}`}>
          <FiSearch size={32} className="text-secondary mr-6" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="TYPE TO SEARCH..."
            className="w-full py-6 md:py-8 bg-transparent font-display font-bold text-3xl md:text-5xl text-primary outline-none placeholder:text-border/50 uppercase tracking-tight"
          />
          {input && (
            <button type="button" onClick={() => { setInput(''); setParams({}); }} className="p-4 text-secondary hover:text-primary transition-colors">
              <FiX size={32} />
            </button>
          )}
        </div>
      </form>

      {!query && (
        <section className="mb-32 md:mb-48">
          <div className="border-b border-border/30 pb-6 mb-12">
            <h2 className="font-display font-bold text-4xl text-primary uppercase">Trending Searches</h2>
          </div>
          <div className="flex flex-col">
            {SUGGESTIONS.map((s, i) => (
              <div 
                key={s.label}
                onClick={() => pick(s.query)}
                className="group flex items-baseline gap-4 py-6 md:py-10 border-b border-border/20 cursor-pointer"
              >
                <span className="text-xs font-mono font-bold text-secondary w-8 md:w-12 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-secondary group-hover:text-primary transition-colors leading-none tracking-tighter">
                  {s.label}
                </span>
                <span className="ml-auto text-[10px] md:text-xs font-bold tracking-[0.2em] md:tracking-[0.3em] text-secondary uppercase group-hover:text-accent transition-colors">
                  {s.tag}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {isLoading && query && (
        <div className="text-xs font-bold tracking-[0.2em] text-secondary uppercase animate-pulse text-center">Loading results...</div>
      )}

      {!isLoading && query && songs.length > 0 && (
        <section className="mb-32 md:mb-48">
          <div className="border-b border-border/30 pb-6 mb-12 flex justify-between items-baseline">
            <h2 className="font-display font-bold text-4xl text-primary uppercase">Results for "{query}"</h2>
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-secondary">{songs.length} Tracks</span>
          </div>
          <div className="flex flex-col">
            {songs.map((song, i) => (
              <TrackRow key={song.id} song={song} index={i} playlist={songs} />
            ))}
          </div>
        </section>
      )}

      {!isLoading && query && songs.length === 0 && (
        <div className="py-32 text-center">
          <p className="font-display font-bold text-3xl md:text-5xl text-primary mb-6">No tracks found</p>
          <p className="text-secondary uppercase tracking-[0.2em] text-xs font-bold">Try a different search term.</p>
        </div>
      )}
    </motion.div>
  );
}
