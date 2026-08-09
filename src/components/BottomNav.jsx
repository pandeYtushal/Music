import { NavLink } from 'react-router-dom';
import { FiHome, FiSearch, FiMusic, FiHeart, FiClock } from 'react-icons/fi';

const navItems = [
  { name: 'Home',      path: '/home',         icon: FiHome,  end: true },
  { name: 'Search',    path: '/search',    icon: FiSearch            },
  { name: 'Library',   path: '/playlists', icon: FiMusic             },
  { name: 'Favorites', path: '/favorites', icon: FiHeart             },
  { name: 'Recent',    path: '/recently-played', icon: FiClock       },
];

const BottomNav = () => {
  return (
    <nav className="md:hidden fixed left-4 right-4 bottom-5 z-[90] pb-[env(safe-area-inset-bottom)]">
      <div
        className="mx-auto max-w-[420px] flex items-center justify-between px-2.5 py-2 gap-1 rounded-full border border-[#f4f1e8]/15"
        style={{
          background: 'rgba(23,23,20,0.94)',
          backdropFilter: 'blur(36px)',
          WebkitBackdropFilter: 'blur(36px)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.65)',
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
                className={`w-full min-h-[50px] flex flex-col items-center justify-center gap-1 transition-all duration-200 rounded-full ${isActive ? 'bg-[#d6ff42]' : 'active:bg-white/[0.04]'}`}
              >
                <item.icon
                  size={19}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  color={isActive ? '#10100e' : 'rgba(244,241,232,0.38)'}
                />
                <span
                  className={`font-semibold whitespace-nowrap transition-colors ${isActive ? 'text-[#10100e]' : 'text-[#f4f1e8]/35'}`}
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
