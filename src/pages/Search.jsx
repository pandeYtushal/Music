import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import VideoGrid from '../components/VideoGrid';
import axios from 'axios';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;
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
    <div className="p-8 pb-32">
      <h1 className="text-3xl font-bold text-textPrimary mb-2">Search Results</h1>
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
    </div>
  );
};

export default Search;
