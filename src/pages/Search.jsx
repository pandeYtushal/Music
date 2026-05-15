import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VideoGrid from '../components/VideoGrid';
import axios from 'axios';
import { FiSearch, FiMic } from 'react-icons/fi';

const categories = [
  { name: 'Hindi',    emoji: '🎵' },
  { name: 'Punjabi',  emoji: '🥁' },
  { name: 'Tamil',    emoji: '🎶' },
  { name: 'Telugu',   emoji: '🎸' },
  { name: 'English',  emoji: '🎤' },
  { name: 'Marathi',  emoji: '🪘' },
  { name: 'Gujarati', emoji: '🎺' },
  { name: 'Bengali',  emoji: '🎻' },
  { name: 'Malayalam',emoji: '🎹' },
  { name: 'Kannada',  emoji: '🎙️' },
  { name: 'Bhojpuri', emoji: '🪗' },
  { name: 'Haryanvi', emoji: '🥁' },
];

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const query          = searchParams.get('q');
  const [videos, setVideos]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!query) { setVideos([]); return; }
    setLoading(true);
    setError(null);
    axios.get('https://jio-saavn-api-sigma.vercel.app/search/songs', { params: { query, limit: 24 } })
      .then(res => setVideos(res.data?.data?.results || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to fetch results.'))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="page-wrap animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <p className="section-overline">Universe</p>
        <h1 className="section-heading">Explore</h1>
      </div>

      {loading && query ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white animate-spin" />
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/30">Searching</p>
        </div>
      ) : !query ? (
        <div>
          <h2 className="text-lg font-bold text-white mb-5">Browse by Language</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => navigate(`/search?q=${encodeURIComponent(cat.name + ' songs')}`)}
                className="relative flex flex-col items-start p-4 rounded-2xl transition-all duration-200 hover:bg-white/[0.07] hover:scale-[1.02] active:scale-[0.98] text-left group"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  aspectRatio: '1',
                }}
              >
                <span className="text-2xl mb-auto">{cat.emoji}</span>
                <p className="text-white font-bold text-sm mt-4 tracking-tight">{cat.name}</p>
                <FiMic size={14} className="absolute bottom-4 right-4 text-white/20 group-hover:text-white/40 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-fade-up">
          {/* Result info bar */}
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
              className="rounded-2xl p-10 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <p className="text-red-400 font-bold mb-2">Something went wrong</p>
              <p className="text-white/40 text-sm">{error}</p>
            </div>
          ) : videos.length > 0 ? (
            <VideoGrid videos={videos} title="Top Results" />
          ) : (
            <div
              className="flex flex-col items-center justify-center py-40 rounded-3xl"
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
