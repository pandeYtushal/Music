import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiCompass, FiHeart, FiSettings } from 'react-icons/fi';

const Sidebar = () => {
  const navItems = [
    { name: 'Home', path: '/', icon: <FiHome size={24} /> },
    { name: 'Explore', path: '/explore', icon: <FiCompass size={24} /> },
    { name: 'Favorites', path: '/favorites', icon: <FiHeart size={24} /> },
    { name: 'Settings', path: '/settings', icon: <FiSettings size={24} /> },
  ];

  return (
    <aside className="w-64 h-screen bg-surface/50 backdrop-blur-lg border-r border-white/5 flex flex-col p-6 hidden md:flex">
      <div className="flex items-center gap-3 mb-10 text-primary cursor-pointer hover:scale-105 transition-transform duration-300">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
          <FiCompass className="text-white" size={20} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-textPrimary">Melody</h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        <div className="text-xs uppercase tracking-wider text-textSecondary font-semibold mb-4 px-2">Menu</div>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(34,197,94,0.05)]' 
                  : 'text-textSecondary hover:bg-white/5 hover:text-textPrimary hover:translate-x-1'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="bg-gradient-to-br from-surface to-surface/50 border border-white/10 p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-primary/30 transition-colors duration-500"></div>
          <h3 className="font-bold text-textPrimary mb-1 relative z-10">Go Premium</h3>
          <p className="text-xs text-textSecondary mb-4 relative z-10">High quality audio & ad-free listening.</p>
          <button className="bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold py-2.5 px-4 rounded-xl w-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:scale-[1.02] active:scale-[0.98] relative z-10">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
