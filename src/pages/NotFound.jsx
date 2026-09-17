import { useNavigate } from 'react-router-dom';
import { FiHome, FiCompass } from 'react-icons/fi';
import useDocumentTitle from '../hooks/useDocumentTitle';

const NotFound = () => {
  const navigate = useNavigate();
  useDocumentTitle('404 — Signal Lost');

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-fade-in relative">
      <div className="text-[8rem] md:text-[10rem] font-display font-bold leading-none text-primary/10 select-none pointer-events-none mb-8">
        404
      </div>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <h1 className="text-3xl md:text-5xl font-display font-bold text-primary mb-4 uppercase tracking-tighter">
          Dead End
        </h1>
        <p className="text-secondary text-sm md:text-base font-bold tracking-[0.2em] uppercase mb-12 max-w-md pointer-events-auto">
          The frequency you are looking for has been disconnected or does not exist.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 pointer-events-auto">
          <button
            onClick={() => navigate('/home')}
            className="px-8 py-4 bg-primary text-background font-bold text-sm tracking-[0.2em] uppercase hover:bg-accent transition-colors flex items-center justify-center gap-3 active:scale-95"
          >
            <FiHome size={18} />
            RETURN HOME
          </button>
          
          <button
            onClick={() => navigate('/discover')}
            className="px-8 py-4 border-2 border-border/50 text-primary font-bold text-sm tracking-[0.2em] uppercase hover:border-primary transition-colors flex items-center justify-center gap-3 active:scale-95"
          >
            <FiCompass size={18} />
            DISCOVER NEW
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
