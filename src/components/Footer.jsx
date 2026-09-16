import { Link } from 'react-router-dom';
import { FiArrowUp, FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi';

const LINKS = [
  { label: 'HOME',      to: '/home' },
  { label: 'DISCOVER',  to: '/discover' },
  { label: 'LIBRARY',   to: '/playlists' },
  { label: 'SETTINGS',  to: '/settings' },
];

export default function Footer() {
  return (
    <footer className="w-full mt-32 border-t border-white/10 pt-20 pb-32 md:pb-48 bg-background relative overflow-hidden">
      
      <div className="w-full px-6 md:px-12 max-w-[1600px] mx-auto flex flex-col items-center">
        
        {/* Massive Brand Name */}
        <div className="w-full text-center mb-16 md:mb-24">
          <h1 className="font-display font-bold text-[12vw] sm:text-7xl lg:text-[10rem] text-primary leading-none tracking-tighter opacity-90">
            MELDMUSIC
          </h1>
          <p className="text-secondary font-bold text-xs md:text-sm tracking-[0.4em] uppercase mt-6 md:mt-8">
            Cinematic Digital Music Environment
          </p>
        </div>

        {/* Links & Socials Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 border-t border-white/10 pt-16">
          
          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 justify-center lg:justify-start items-center lg:items-start">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="font-display font-bold text-2xl md:text-3xl text-secondary hover:text-primary transition-colors tracking-tight"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Socials / Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-12">
            <div className="flex items-center gap-8">
              <a href="#" className="text-secondary hover:text-primary transition-colors active:scale-90">
                <FiTwitter size={24} />
              </a>
              <a href="#" className="text-secondary hover:text-primary transition-colors active:scale-90">
                <FiInstagram size={24} />
              </a>
              <a href="#" className="text-secondary hover:text-primary transition-colors active:scale-90">
                <FiGithub size={24} />
              </a>
            </div>
            
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 px-6 py-4 border-2 border-white/10 hover:border-primary text-secondary hover:text-primary transition-all rounded-none uppercase font-bold text-xs tracking-[0.2em] active:scale-95"
            >
              <FiArrowUp size={16} />
              BACK TO TOP
            </button>
          </div>
        </div>

        {/* Legal / Copyright */}
        <div className="w-full mt-24 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold tracking-[0.2em] text-secondary/60 uppercase">
          <p>© {new Date().getFullYear()} MELDMUSIC. ALL RIGHTS RESERVED.</p>
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-6 md:gap-10">
            <a href="#" className="hover:text-primary transition-colors">PRIVACY</a>
            <a href="#" className="hover:text-primary transition-colors">TERMS</a>
            <span className="flex items-center gap-3 text-primary/80">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-pulse" />
              SYSTEM ONLINE
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
