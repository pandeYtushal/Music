import { NavLink, useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';

const NAV = [
  { label: 'HOME', to: '/home' },
  { label: 'DISCOVER', to: '/discover' },
  { label: 'LIBRARY', to: '/playlists' },
  { label: 'SETTINGS', to: '/settings' },
];

export default function DesktopNav() {
  const navigate = useNavigate();

  return (
    <nav className="hidden md:flex items-center justify-between px-10 py-8 absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-background/90 via-background/40 to-transparent pointer-events-none">
      <div 
        className="font-display font-bold text-3xl tracking-tighter cursor-pointer text-primary pointer-events-auto"
        onClick={() => navigate('/home')}
      >
        MELDMUSIC
      </div>
      <div className="flex items-center gap-8 pointer-events-auto">
        {NAV.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `text-xs font-bold tracking-[0.2em] uppercase transition-all hover:text-primary ${
                isActive ? 'text-primary' : 'text-secondary'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
        <NavLink
          to="/search"
          className={({ isActive }) =>
            `flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase transition-all hover:text-primary ml-4 ${
              isActive ? 'text-primary' : 'text-secondary'
            }`
          }
        >
          <FiSearch size={16} />
          SEARCH
        </NavLink>
      </div>
    </nav>
  );
}
