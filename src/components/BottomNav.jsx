import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiSearch, FiMusic, FiHeart } from 'react-icons/fi';

const navItems = [
  { name: 'Home',      path: '/',          icon: FiHome,  end: true },
  { name: 'Search',    path: '/search',    icon: FiSearch            },
  { name: 'Library',   path: '/playlists', icon: FiMusic             },
  { name: 'Favorites', path: '/favorites', icon: FiHeart             },
];

const BottomNav = () => {
  return (
    <nav className="md:hidden fixed left-0 right-0 bottom-0 z-[90] pb-[env(safe-area-inset-bottom)]">
      <div
        className="mx-auto max-w-[460px] flex items-center justify-between px-3 pt-2 pb-3 gap-1"
        style={{
          background: 'linear-gradient(180deg, rgba(12,12,12,0.82), rgba(8,8,8,0.98))',
          backdropFilter: 'blur(34px)',
          WebkitBackdropFilter: 'blur(34px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -18px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.035)',
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.end}
            className="flex-1 flex items-center justify-center transition-all duration-200 relative"
          >
            {({ isActive }) => (
              <div
                className={`w-full min-h-[50px] flex flex-col items-center justify-center gap-1 transition-all duration-200 rounded-xl ${isActive ? 'bg-white/[0.075]' : 'active:bg-white/[0.04]'}`}
              >
                <span className={`absolute top-1.5 h-[3px] rounded-full transition-all duration-200 ${isActive ? 'w-5 bg-white' : 'w-0 bg-transparent'}`} />
                <item.icon
                  size={19}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  color={isActive ? '#ffffff' : 'rgba(255,255,255,0.38)'}
                />
                <span
                  className={`font-semibold whitespace-nowrap transition-colors ${isActive ? 'text-white' : 'text-white/35'}`}
                  style={{ fontSize: 10.5, letterSpacing: 0 }}
                >
                  {item.name}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
