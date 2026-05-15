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
    <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[90]">
      <div
        className="flex items-center px-2 py-2 gap-1"
        style={{
          background: 'rgba(18,18,18,0.96)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 999,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.end}
            className="flex items-center justify-center transition-all duration-200 relative"
            style={{ borderRadius: 999 }}
          >
            {({ isActive }) => (
              <div
                className="flex items-center gap-2 transition-all duration-200"
                style={{
                  padding: isActive ? '8px 14px' : '8px 12px',
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  borderRadius: 999,
                }}
              >
                <item.icon
                  size={18}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  color={isActive ? '#ffffff' : 'rgba(255,255,255,0.4)'}
                />
                {isActive && (
                  <span
                    className="text-white font-semibold whitespace-nowrap"
                    style={{ fontSize: 13, letterSpacing: '-0.01em' }}
                  >
                    {item.name}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
