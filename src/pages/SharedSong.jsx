import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi';
import { usePlayerStore } from '../store/usePlayerStore';
import { searchSongs } from '../api/saavn';
import useDocumentTitle from '../hooks/useDocumentTitle';

const SharedSong = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setCurrentVideo } = usePlayerStore();
  const [error, setError] = useState(null);

  useDocumentTitle('Opening Song...');

  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) {
      navigate('/');
      return;
    }

    let isMounted = true;

    const fetchSong = async () => {
      try {
        // The API returns a list of results. We search for the specific ID or a close match if necessary.
        // If we only have the ID, we might need a specific endpoint, but `search/songs` works if we pass the ID as query or use an explicit ID search if the API supports it.
        // Wait, the Saavn unofficial API has a `/songs?id=` endpoint, but `searchSongs` in `api/saavn.js` only hits `/search/songs`.
        // Let's import the axios instance to fetch by ID directly since `searchSongs` is for text queries.
        
        // As a fallback, if we use searchSongs with the ID, it might not work. Let's use the API directly.
        const { default: api } = await import('../api/saavn');
        const axiosInstance = api || (await import('axios')).default; // Fallback if api is not exported directly
        
        // Let's implement the direct fetch using the baseURL
        const response = await fetch(`${import.meta.env.VITE_SAAVN_API_URL || 'https://jio-saavn-api-sigma.vercel.app'}/songs?id=${id}`);
        const data = await response.json();
        
        if (isMounted) {
          if (data?.data?.[0]) {
            const song = data.data[0];
            // We need to sanitize it to match our app's structure
            const { sanitizeSongList } = await import('../utils/library');
            const sanitized = sanitizeSongList([song], 1);
            
            if (sanitized.length > 0) {
              setCurrentVideo(sanitized[0], []);
              navigate('/');
              return;
            }
          }
          setError('Song not found or unavailable.');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load shared song.');
          setTimeout(() => navigate('/'), 3000);
        }
      }
    };

    fetchSong();

    return () => {
      isMounted = false;
    };
  }, [searchParams, navigate, setCurrentVideo]);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-black/50">
      {error ? (
        <div className="text-center">
          <p className="text-red-400 font-bold mb-2">{error}</p>
          <p className="text-white/50 text-sm">Redirecting to home...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <FiLoader className="animate-spin text-white" size={40} />
          <p className="text-white/70 font-medium">Loading shared song...</p>
        </div>
      )}
    </div>
  );
};

export default SharedSong;
