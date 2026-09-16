import { NavLink } from 'react-router-dom';
import { FiHome, FiCompass, FiSearch, FiList } from 'react-icons/fi';

import { FiSettings } from 'react-icons/fi';

const NAV = [
  { label: 'HOME', to: '/home', icon: FiHome },
  { label: 'DISCOVER', to: '/discover', icon: FiCompass },
  { label: 'SEARCH', to: '/search', icon: FiSearch },
  { label: 'LIBRARY', to: '/playlists', icon: FiList },
  { label: 'SETTINGS', to: '/settings', icon: FiSettings },
];

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[90] bg-background border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-secondary'
              }`
            }
          >
            <Icon size={20} strokeWidth={2} />
            <span className="text-[9px] font-bold tracking-widest uppercase">
              {label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
