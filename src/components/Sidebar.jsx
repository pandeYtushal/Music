import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiSearch, FiCompass, FiHeart, FiSettings, FiStar, FiMusic } from 'react-icons/fi';
import AdSense from './AdSense';

const Sidebar = () => {
  const navigate = useNavigate();
  
  const navLinks = [
    { name: 'Home', icon: FiHome, path: '/' },
    { name: 'Search', icon: FiSearch, path: '/search' },
    { name: 'Favorites', icon: FiHeart, path: '/favorites' },
    { name: 'Playlists', icon: FiMusic, path: '/playlists' },
    { name: 'Premium', icon: FiStar, path: '/premium' },
    { name: 'Settings', icon: FiSettings, path: '/settings' },
  ];

  return (
    <aside className="w-64 h-screen bg-surface/50 backdrop-blur-lg border-r border-white/5 flex flex-col p-6 hidden md:flex">
      <div className="flex items-center gap-3 mb-10 cursor-pointer hover:scale-105 transition-transform duration-300">
        <div className="w-10 h-10 rounded-[10px] bg-[#1c1c1e] border border-white/10 flex items-center justify-center">
          <FiCompass className="text-white" size={20} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Melody</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <link.icon size={20} />
            <span className="font-medium">{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-6 pt-6">
        {/* AdSense Sidebar Unit */}
        <AdSense adSlot="7792854986" adFormat="rectangle" className="opacity-80 grayscale hover:grayscale-0 transition-all" />

        <div className="bg-[#1c1c1e] rounded-2xl p-5 border border-white/5">
          <h3 className="font-semibold text-white mb-1">Go Premium</h3>
          <p className="text-xs text-white/50 mb-4">High quality audio & ad-free listening.</p>
          <button 
            onClick={() => navigate('/premium')}
            className="bg-white text-black text-sm font-semibold py-2.5 px-4 rounded-full w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
