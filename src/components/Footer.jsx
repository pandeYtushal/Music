import { useNavigate, useLocation } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram, FiHeadphones, FiGlobe, FiCpu } from 'react-icons/fi';
import logo from '../assets/logo-icon.png';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show this global footer on welcome, login, privacy, and terms pages 
  // as they either have their own or don't need it.
  const hiddenPaths = ['/login'];
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <footer className="w-full mt-auto border-t border-white/[0.05] bg-white/[0.01] backdrop-blur-md pt-12 pb-8 px-6 md:px-10 z-10 transition-all duration-300">
      <div className="max-w-[1140px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-left">
        {/* Column 1: Logo & Tagline */}
        <div className="flex flex-col gap-3 md:col-span-1">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/')}>
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.35)]"
              style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.22)' }}
            >
              <img src={logo} alt="Melody" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-[15px] font-black tracking-tight text-white">Melody</span>
          </div>
          <p className="text-white/40 text-[12px] leading-relaxed mt-2 font-medium">
            A premium, high-fidelity music streaming interface designed for audio purists and modern curators.
          </p>
        </div>

        {/* Column 2: Navigation */}
        <div className="flex flex-col gap-3">
          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">Explore</p>
          <div className="flex flex-col gap-2.5 text-[12.5px] font-semibold">
            <button onClick={() => navigate('/')} className="text-white/45 hover:text-white transition-colors text-left">Home</button>
            <button onClick={() => navigate('/search')} className="text-white/45 hover:text-white transition-colors text-left">Search</button>
            <button onClick={() => navigate('/playlists')} className="text-white/45 hover:text-white transition-colors text-left">Library</button>
            <button onClick={() => navigate('/stats')} className="text-white/45 hover:text-white transition-colors text-left">Listening Stats</button>
          </div>
        </div>

        {/* Column 3: Audio Specs */}
        <div className="flex flex-col gap-3">
          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">Audio Engine</p>
          <div className="flex flex-col gap-2.5 text-[12px] font-medium text-white/40">
            <div className="flex items-center gap-2">
              <FiHeadphones size={13} className="text-orange-500/80" />
              <span>320kbps High Fidelity</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCpu size={13} className="text-purple-400/80" />
              <span>Lossless FLAC Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <FiGlobe size={13} className="text-blue-400/80" />
              <span>Ad-Free Everywhere</span>
            </div>
          </div>
        </div>

        {/* Column 4: Support & Connect */}
        <div className="flex flex-col gap-4">
          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">Connect</p>
          <div className="flex items-center gap-3">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] hover:border-white/10 active:scale-95 transition-all">
              <FiGithub size={14} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] hover:border-white/10 active:scale-95 transition-all">
              <FiTwitter size={14} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] hover:border-white/10 active:scale-95 transition-all">
              <FiInstagram size={14} />
            </a>
          </div>
          <div className="text-[11px] text-white/30 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1140px] mx-auto border-t border-white/[0.05] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-bold text-white/30 uppercase tracking-wider">
        <span>&copy; {new Date().getFullYear()} Melody &middot; Built by Tushal Pandey</span>
        <div className="flex gap-5">
          <button onClick={() => navigate('/privacy')} className="hover:text-white hover:underline transition-all">Privacy Policy</button>
          <button onClick={() => navigate('/terms')} className="hover:text-white hover:underline transition-all">Terms of Service</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
