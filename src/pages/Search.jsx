import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VideoGrid from '../components/VideoGrid';
import axios from 'axios';
import { FiMic, FiMusic, FiSearch } from 'react-icons/fi';

const categories = [
  { name: 'Hindi', query: 'Hindi songs', tone: 'from-rose-500/20 to-orange-400/10' },
  { name: 'Punjabi', query: 'Punjabi songs', tone: 'from-amber-400/20 to-lime-400/10' },
  { name: 'Tamil', query: 'Tamil songs', tone: 'from-cyan-400/20 to-blue-500/10' },
  { name: 'Telugu', query: 'Telugu songs', tone: 'from-emerald-400/20 to-teal-500/10' },
  { name: 'English', query: 'English songs', tone: 'from-violet-400/20 to-fuchsia-500/10' },
  { name: 'Marathi', query: 'Marathi songs', tone: 'from-orange-400/20 to-red-500/10' },
  { name: 'Gujarati', query: 'Gujarati songs', tone: 'from-sky-400/20 to-indigo-500/10' },
  { name: 'Bengali', query: 'Bengali songs', tone: 'from-pink-400/20 to-rose-500/10' },
  { name: 'Malayalam', query: 'Malayalam songs', tone: 'from-green-400/20 to-emerald-500/10' },
  { name: 'Kannada', query: 'Kannada songs', tone: 'from-yellow-400/20 to-orange-500/10' },
  { name: 'Bhojpuri', query: 'Bhojpuri songs', tone: 'from-red-400/20 to-yellow-500/10' },
  { name: 'Haryanvi', query: 'Haryanvi songs', tone: 'from-lime-400/20 to-cyan-500/10' },
];

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) {
      setVideos([]);
      return;
    }

    setLoading(true);
    setError(null);
    axios.get('https://jio-saavn-api-sigma.vercel.app/search/songs', { params: { query, limit: 24 } })
      .then(res => setVideos(res.data?.data?.results || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to fetch results.'))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="page-wrap animate-fade-up">
      <div className="mb-8">
        <p className="section-overline">Catalog</p>
        <h1 className="section-heading">Search</h1>
      </div>

      {loading && query ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white animate-spin" />
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/30">Searching</p>
        </div>
      ) : !query ? (
        <div>
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <p className="section-overline mb-1">Browse</p>
              <h2 className="text-lg font-bold text-white">Languages and scenes</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => navigate(`/search?q=${encodeURIComponent(cat.query)}`)}
                className={`relative flex flex-col items-start p-4 rounded-xl transition-all duration-200 hover:bg-white/[0.07] hover:scale-[1.02] active:scale-[0.98] text-left group overflow-hidden bg-gradient-to-br ${cat.tone}`}
                style={{ border: '1px solid rgba(255,255,255,0.08)', aspectRatio: '1' }}
              >
                <div className="w-9 h-9 rounded-lg bg-black/20 border border-white/10 flex items-center justify-center mb-auto">
                  <FiMusic size={17} className="text-white/70" />
                </div>
                <p className="text-white font-bold text-sm mt-4 tracking-tight">{cat.name}</p>
                <FiMic size={14} className="absolute bottom-4 right-4 text-white/20 group-hover:text-white/40 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-fade-up">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl mb-8"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <FiSearch size={14} className="text-white/30 shrink-0" />
            <p className="text-white/50 text-sm font-medium">
              Results for <span className="text-white font-bold">"{query}"</span>
            </p>
          </div>

          {error ? (
            <div
              className="rounded-xl p-10 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <p className="text-red-400 font-bold mb-2">Something went wrong</p>
              <p className="text-white/40 text-sm">{error}</p>
            </div>
          ) : videos.length > 0 ? (
            <VideoGrid videos={videos} title="Top Results" />
          ) : (
            <div
              className="flex flex-col items-center justify-center py-40 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <FiSearch size={40} className="text-white/10 mb-5" />
              <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
              <p className="text-white/35 text-sm font-medium">Try a different search term.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
