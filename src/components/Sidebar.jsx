import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiSearch, FiHeart, FiSettings, FiMusic, FiZap } from 'react-icons/fi';
import AdSense from './AdSense';
import logo from '../assets/logo.png';

const navSections = [
  {
    label: 'Discover',
    links: [
      { name: 'Home',      icon: FiHome,   path: '/' },
      { name: 'Search',    icon: FiSearch, path: '/search' },
      { name: 'Favorites', icon: FiHeart,  path: '/favorites' },
    ]
  },
  {
    label: 'Library',
    links: [
      { name: 'Playlists', icon: FiMusic, path: '/playlists' },
    ]
  },
  {
    label: 'Account',
    links: [
      { name: 'Settings', icon: FiSettings, path: '/settings' },
    ]
  }
];

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <aside
      className="fixed left-0 top-0 w-64 h-screen hidden md:flex flex-col z-50 overflow-y-auto scrollbar-hide"
      style={{
        background: '#050505',
        borderRight: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* Logo */}
      <div
        onClick={() => navigate('/')}
        className="flex items-center gap-3 px-6 py-7 cursor-pointer group shrink-0"
      >
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-white shadow-white transition-shadow group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          <img src={logo} alt="Melody" className="w-5 h-5 object-contain" style={{ filter: 'invert(1)' }} />
        </div>
        <span className="text-[17px] font-bold tracking-tight text-white">Melody</span>
      </div>

      <div className="divider mx-4 mb-6" />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-7">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="section-overline px-3">{section.label}</p>
            <div className="space-y-0.5 mt-2">
              {section.links.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-semibold ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <link.icon size={16} className={isActive ? 'text-white' : 'text-white/40'} />
                      <span>{link.name}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex-1" />

      {/* AdSense */}
      <div className="px-4 pb-6">
        <AdSense
          adSlot="7792854986"
          adFormat="rectangle"
          className="opacity-30 hover:opacity-60 transition-opacity rounded-xl overflow-hidden"
        />
      </div>
    </aside>
  );
};

export default Sidebar;
