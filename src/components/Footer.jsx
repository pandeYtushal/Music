import { Link } from 'react-router-dom';
import { FiArrowUp, FiMusic, FiHeart, FiSearch, FiSliders, FiBarChart2, FiClock, FiRadio } from 'react-icons/fi';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-20 border-t border-[#f4f1e8]/15 pt-12 pb-16 text-[#f4f1e8]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-12">
        {/* Brand Column */}
        <div className="md:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#d6ff42] flex items-center justify-center text-[#10100e] font-black text-sm">
                M
              </div>
              <span className="font-['Instrument_Serif'] text-3xl tracking-tight leading-none text-[#f4f1e8]">
                MeldMusic
              </span>
            </div>
            <p className="text-[#a9a79d] text-sm leading-relaxed max-w-sm font-normal">
              A high-fidelity, seamless music streaming experience. Built for effortless discovery, rich audio quality, and pure listening pleasure.
            </p>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d6ff42]/10 border border-[#d6ff42]/20 text-[11px] font-mono text-[#d6ff42]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d6ff42] animate-pulse" />
              Audio Engine Active
            </span>
            <span className="text-[11px] font-mono text-[#a9a79d]">v2.4.0</span>
          </div>
        </div>

        {/* Navigation Quick Links */}
        <div className="md:col-span-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a9a79d] font-semibold mb-4">
            Navigation
          </p>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/home" className="text-[#f4f1e8]/70 hover:text-[#d6ff42] transition-colors flex items-center gap-2">
                <FiMusic size={14} className="text-[#a9a79d]" /> Home
              </Link>
            </li>
            <li>
              <Link to="/search" className="text-[#f4f1e8]/70 hover:text-[#d6ff42] transition-colors flex items-center gap-2">
                <FiSearch size={14} className="text-[#a9a79d]" /> Search & Discover
              </Link>
            </li>
            <li>
              <Link to="/playlists" className="text-[#f4f1e8]/70 hover:text-[#d6ff42] transition-colors flex items-center gap-2">
                <FiRadio size={14} className="text-[#a9a79d]" /> Playlists & Library
              </Link>
            </li>
            <li>
              <Link to="/favorites" className="text-[#f4f1e8]/70 hover:text-[#d6ff42] transition-colors flex items-center gap-2">
                <FiHeart size={14} className="text-[#a9a79d]" /> Favorite Songs
              </Link>
            </li>
            <li>
              <Link to="/recently-played" className="text-[#f4f1e8]/70 hover:text-[#d6ff42] transition-colors flex items-center gap-2">
                <FiClock size={14} className="text-[#a9a79d]" /> Recently Played
              </Link>
            </li>
            <li>
              <Link to="/stats" className="text-[#f4f1e8]/70 hover:text-[#d6ff42] transition-colors flex items-center gap-2">
                <FiBarChart2 size={14} className="text-[#a9a79d]" /> Listening Stats
              </Link>
            </li>
            <li>
              <Link to="/settings" className="text-[#f4f1e8]/70 hover:text-[#d6ff42] transition-colors flex items-center gap-2">
                <FiSliders size={14} className="text-[#a9a79d]" /> App Settings
              </Link>
            </li>
          </ul>
        </div>

        {/* Keyboard Shortcuts & Quick Info */}
        <div className="md:col-span-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a9a79d] font-semibold mb-4">
            Hotkeys & Controls
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded-lg border border-[#f4f1e8]/10 bg-white/[0.02] flex items-center justify-between">
              <span className="text-[#a9a79d]">Play / Pause</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[#f4f1e8] text-[10px]">Space</kbd>
            </div>
            <div className="p-2 rounded-lg border border-[#f4f1e8]/10 bg-white/[0.02] flex items-center justify-between">
              <span className="text-[#a9a79d]">Next Track</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[#f4f1e8] text-[10px]">N</kbd>
            </div>
            <div className="p-2 rounded-lg border border-[#f4f1e8]/10 bg-white/[0.02] flex items-center justify-between">
              <span className="text-[#a9a79d]">Prev Track</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[#f4f1e8] text-[10px]">P</kbd>
            </div>
            <div className="p-2 rounded-lg border border-[#f4f1e8]/10 bg-white/[0.02] flex items-center justify-between">
              <span className="text-[#a9a79d]">Fullscreen</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[#f4f1e8] text-[10px]">F</kbd>
            </div>
            <div className="p-2 rounded-lg border border-[#f4f1e8]/10 bg-white/[0.02] flex items-center justify-between">
              <span className="text-[#a9a79d]">Mute</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[#f4f1e8] text-[10px]">M</kbd>
            </div>
            <div className="p-2 rounded-lg border border-[#f4f1e8]/10 bg-white/[0.02] flex items-center justify-between">
              <span className="text-[#a9a79d]">Search Palette</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[#f4f1e8] text-[10px]">Ctrl+K</kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-8 border-t border-[#f4f1e8]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#a9a79d]">
        <p>© {new Date().getFullYear()} MeldMusic. Crafted for lovers of sound.</p>
        <button
          onClick={scrollToTop}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#f4f1e8]/15 text-[#f4f1e8]/80 hover:text-[#d6ff42] hover:border-[#d6ff42]/40 transition-all cursor-pointer"
        >
          <span>Back to top</span>
          <FiArrowUp size={13} />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
