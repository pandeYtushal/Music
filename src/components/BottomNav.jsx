import { NavLink } from 'react-router-dom';
import { FiHome, FiSearch, FiMusic, FiHeart, FiClock } from 'react-icons/fi';

const navItems = [
  { name: 'Home',      path: '/',          icon: FiHome,  end: true },
  { name: 'Search',    path: '/search',    icon: FiSearch            },
  { name: 'Library',   path: '/playlists', icon: FiMusic             },
  { name: 'Favorites', path: '/favorites', icon: FiHeart             },
  { name: 'Recent',    path: '/recently-played', icon: FiClock       },
];

const BottomNav = () => {
  return (
    <nav className="md:hidden fixed left-4 right-4 bottom-5 z-[90] pb-[env(safe-area-inset-bottom)]">
      <div
        className="mx-auto max-w-[420px] flex items-center justify-between px-2.5 py-2 gap-1 rounded-2.5xl border border-white/[0.07]"
        style={{
          background: 'rgba(18,18,22,0.7)',
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
