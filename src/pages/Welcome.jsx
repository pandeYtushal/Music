import { useNavigate } from 'react-router-dom';
import { FiRadio, FiCompass, FiArrowRight } from 'react-icons/fi';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Welcome = () => {
  const navigate = useNavigate();
  useDocumentTitle('Welcome — MELDMUSIC');

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center p-6 md:p-12 animate-fade-in relative overflow-hidden">
      
      {/* Subtle atmospheric background for welcome */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-br from-primary/10 via-background to-accent/10" />

      <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-primary flex items-center justify-center text-primary mb-12 shadow-[0_0_60px_rgba(255,255,255,0.1)]">
          <FiRadio size={64} className="md:w-24 md:h-24" />
        </div>

        <span className="px-6 py-3 border border-border/50 text-secondary text-sm font-bold tracking-[0.4em] uppercase mb-12 backdrop-blur-sm">
          A Cinematic Audio Experience
        </span>

        <h1 className="text-6xl md:text-9xl lg:text-[10rem] font-display font-bold text-primary leading-[0.85] uppercase mb-12 tracking-tighter text-balance">
          Sound <br /> As Space
        </h1>

        <p className="text-sm md:text-base font-bold text-secondary max-w-2xl mb-16 uppercase tracking-[0.2em] leading-relaxed">
          MELDMUSIC is a digital music environment. No sidebars. No algorithmic feed. Just you, the artwork, and the music.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-xl">
          <button
            onClick={() => navigate('/home')}
            className="w-full py-6 bg-primary text-background text-sm font-bold tracking-[0.2em] uppercase hover:bg-accent transition-colors flex items-center justify-center gap-4 active:scale-95 duration-200"
          >
            <span>ENTER</span>
            <FiArrowRight size={20} />
          </button>

          <button
            onClick={() => navigate('/discover')}
            className="w-full py-6 border-2 border-border/50 text-primary text-sm font-bold tracking-[0.2em] uppercase hover:border-primary transition-colors flex items-center justify-center gap-4 active:scale-95 duration-200"
          >
            <FiCompass size={20} />
            <span>DISCOVER</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
