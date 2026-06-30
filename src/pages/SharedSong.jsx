import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi';
import { usePlayerStore } from '../store/usePlayerStore';
import { sanitizeSongList } from '../utils/library';
import useDocumentTitle from '../hooks/useDocumentTitle';

const SharedSong = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setCurrentVideo = usePlayerStore(state => state.setCurrentVideo);
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
        const response = await fetch(`${import.meta.env.VITE_SAAVN_API_URL || 'https://jio-saavn-api-sigma.vercel.app'}/songs?id=${id}`);
        const data = await response.json();
        
        if (isMounted) {
          if (data?.data?.[0]) {
            const song = data.data[0];
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
      } catch {
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
