import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiSearch, FiHeart, FiStar, FiMusic } from 'react-icons/fi';

const BottomNav = () => {
  const navItems = [
    { name: 'Home', path: '/', icon: <FiHome size={22} /> },
    { name: 'Search', path: '/search', icon: <FiSearch size={22} /> },
    { name: 'Playlists', path: '/playlists', icon: <FiMusic size={22} /> },
    { name: 'Favorites', path: '/favorites', icon: <FiHeart size={22} /> },
    { name: 'Premium', path: '/premium', icon: <FiStar size={22} /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/95 backdrop-blur-xl border-t border-white/5 z-[90] flex items-center justify-around px-2 pb-safe">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-primary' : 'text-textSecondary hover:text-textPrimary'
            }`
          }
        >
          {item.icon}
          <span className="text-[10px] font-medium">{item.name}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default BottomNav;
