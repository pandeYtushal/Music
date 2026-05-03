import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiSearch, FiCompass, FiHeart, FiSettings, FiStar, FiMusic } from 'react-icons/fi';

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
      <div className="flex items-center gap-3 mb-10 text-primary cursor-pointer hover:scale-105 transition-transform duration-300">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <FiCompass className="text-white" size={20} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-textPrimary">Melody</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                  : 'text-textSecondary hover:bg-white/5 hover:text-textPrimary hover:translate-x-1'
              }`
            }
          >
            <link.icon size={20} />
            <span className="font-medium">{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/5 rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-primary/30 transition-colors duration-500"></div>
          <h3 className="font-bold text-textPrimary mb-1 relative z-10">Go Premium</h3>
          <p className="text-xs text-textSecondary mb-4 relative z-10">High quality audio & ad-free listening.</p>
          <button 
            onClick={() => navigate('/premium')}
            className="bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold py-2.5 px-4 rounded-xl w-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-[0.98] relative z-10"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
