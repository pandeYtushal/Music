import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VideoGrid from '../components/VideoGrid';
import axios from 'axios';
import { FiSearch } from 'react-icons/fi';

const regionalLanguages = [
  { name: 'Hindi', bg: 'bg-[#ff4632]' },
  { name: 'Punjabi', bg: 'bg-[#1e3264]' },
  { name: 'Tamil', bg: 'bg-[#e1118c]' },
  { name: 'Telugu', bg: 'bg-[#8d67ab]' },
  { name: 'English', bg: 'bg-[#e8115b]' },
  { name: 'Marathi', bg: 'bg-[#7358ff]' },
  { name: 'Gujarati', bg: 'bg-[#e91429]' },
  { name: 'Bengali', bg: 'bg-[#27856a]' },
  { name: 'Malayalam', bg: 'bg-[#148a08]' },
  { name: 'Kannada', bg: 'bg-[#f037a5]' },
  { name: 'Bhojpuri', bg: 'bg-[#509bf5]' },
  { name: 'Haryanvi', bg: 'bg-[#b49bc8]' },
];

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setVideos([]);
        return;
      }
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get('https://jiosaavn-api-privatecvc2.vercel.app/search/songs', {
          params: { query, limit: 24 }
        });
        
        setVideos(response.data?.data?.results || []);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError(err.response?.data?.message || "Failed to fetch results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-32">
      <h1 className="text-3xl font-bold text-textPrimary mb-6">Search</h1>

      {!query ? (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-textPrimary mb-6">Browse all</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {regionalLanguages.map((lang, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/search?q=${encodeURIComponent(lang.name + ' songs')}`)}
                className={`${lang.bg} rounded-xl p-4 aspect-square relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-black/20 group`}
              >
                <h3 className="text-white font-bold text-xl sm:text-2xl tracking-tight z-10 relative drop-shadow-md">
                  {lang.name}
                </h3>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 group-hover:scale-125 transition-all duration-500"></div>
                {/* Decorative circle to mimic Spotify's rotated images */}
                <div className="absolute bottom-[-10%] right-[-10%] w-2/3 h-2/3 bg-black/20 rounded-full rotate-[25deg] shadow-inner border border-white/5 group-hover:rotate-[15deg] transition-transform duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <p className="text-textSecondary mb-8">Showing results for: <span className="text-primary font-semibold">"{query}"</span></p>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center max-w-2xl mx-auto mt-10">
              <p className="text-red-400 font-semibold">{error}</p>
            </div>
          ) : videos.length > 0 ? (
            <VideoGrid videos={videos} title="" />
          ) : (
            <p className="text-center text-textSecondary mt-20">No results found for "{query}".</p>
          )}
        </>
      )}
    </div>
  );
};

export default Search;
