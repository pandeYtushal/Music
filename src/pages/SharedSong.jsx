import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiDisc, FiAlertCircle } from 'react-icons/fi';
import { usePlayerStore } from '../store/usePlayerStore';
import { getSongById } from '../api/saavn';
import useDocumentTitle from '../hooks/useDocumentTitle';

const SharedSong = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setCurrentVideo = usePlayerStore((state) => state.setCurrentVideo);
  const [error, setError] = useState(null);

  useDocumentTitle('Loading Track — MELDMUSIC');

  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) {
      navigate('/');
      return;
    }

    let isMounted = true;

    const fetchSong = async () => {
      try {
        const song = await getSongById(id);

        if (isMounted) {
          if (song) {
            setCurrentVideo(song, []);
            navigate('/');
            return;
          }
          setError('Track not found or unavailable.');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch {
        if (isMounted) {
          setError('Failed to fetch audio stream.');
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
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      {error ? (
        <div className="max-w-xl p-12 border border-primary/30 bg-surface/10 backdrop-blur-sm">
          <FiAlertCircle className="mx-auto text-primary mb-8" size={64} />
          <p className="text-primary font-display font-bold text-4xl md:text-5xl uppercase tracking-tight mb-4">{error}</p>
          <p className="text-secondary font-bold text-xs uppercase tracking-[0.2em]">Returning to home...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-12">
          <div className="w-32 h-32 md:w-48 md:h-48 border-4 border-primary flex items-center justify-center text-primary bg-surface/10 shadow-[0_0_60px_rgba(255,255,255,0.05)] rounded-full">
            <FiDisc className="animate-spin text-primary" size={64} />
          </div>
          <div>
            <h2 className="text-5xl md:text-7xl font-display font-bold text-primary uppercase tracking-tighter mb-4">Resolving Stream</h2>
            <p className="text-secondary font-bold text-xs uppercase tracking-[0.4em]">
              Preparing High-Fidelity Audio
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedSong;
