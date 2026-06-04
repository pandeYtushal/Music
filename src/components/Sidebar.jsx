import { NavLink, useNavigate } from 'react-router-dom';
import { FiClock, FiHeart, FiHome, FiLogOut, FiMusic, FiSearch, FiSettings, FiX } from 'react-icons/fi';
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { renderAvatar } from '../utils/avatar';
import logo from '../assets/logo-icon.png';

const navLinks = [
  { name: 'Home', icon: FiHome, path: '/' },
  { name: 'Search', icon: FiSearch, path: '/search' },
  { name: 'Library', icon: FiMusic, path: '/playlists' },
  { name: 'Favorites', icon: FiHeart, path: '/favorites' },
  { name: 'Recent', icon: FiClock, path: '/recently-played' },
  { name: 'Settings', icon: FiSettings, path: '/settings' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSearch = (event) => {
    event.preventDefault();
    const nextQuery = query.trim();
    if (nextQuery) {
      navigate(`/search?q=${encodeURIComponent(nextQuery)}`);
    }
  };

  const clearSearch = () => {
    setQuery('');
    navigate('/search');
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/login');
  };

  return (
    <header
      className="fixed top-4 left-1/2 z-50 hidden w-[min(calc(100vw-2rem),1280px)] -translate-x-1/2 md:flex items-center gap-3 rounded-2xl border border-white/[0.09] px-3 py-2 shadow-[0_24px_60px_rgba(0,0,0,0.65),0_0_40px_rgba(249,115,22,0.04)] backdrop-blur-3xl"
      style={{ background: 'linear-gradient(135deg, rgba(15,15,15,0.85) 0%, rgba(8,8,8,0.9) 100%)' }}
    >
      <div
        onClick={() => navigate('/')}
        className="flex items-center gap-2.5 cursor-pointer group shrink-0 rounded-xl px-2.5 py-1.5 hover:bg-white/[0.04] transition-colors"
      >
        <div
          className="w-8 h-8 rounded-[10px] flex items-center justify-center transition-shadow group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
          style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}
        >
          <img src={logo} alt="Melody" className="w-5 h-5 object-contain" />
        </div>
        <span className="text-[15px] font-bold tracking-tight text-white">Melody</span>
      </div>

      <div className="h-8 w-px bg-white/[0.08]" />

      <nav className="flex min-w-0 items-center justify-center gap-1 overflow-x-auto scrollbar-hide">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end={link.path === '/'}
            className={({ isActive }) =>
              `flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-[13px] font-semibold transition-all duration-150 ${isActive
                ? 'bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.12)]'
                : 'text-white/44 hover:bg-white/[0.06] hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon size={15} className={isActive ? 'text-black' : 'text-white/45'} />
                <span>{link.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <form
        onSubmit={handleSearch}
        className="ml-auto flex h-10 w-[min(28vw,360px)] min-w-[220px] items-center gap-2 rounded-xl px-3 transition-all"
        style={{
          background: isFocused ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.055)',
          border: `1px solid ${isFocused ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)'}`,
        }}
      >
        <FiSearch size={15} className={isFocused ? 'text-white' : 'text-white/35'} />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search"
          className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-white outline-none placeholder:text-white/22"
        />
        {query && (
          <button type="button" onClick={clearSearch} className="text-white/25 transition-colors hover:text-white/70" aria-label="Clear search">
            <FiX size={14} />
          </button>
        )}
      </form>

      <div className="relative shrink-0">
        <button
          onClick={() => setIsProfileOpen(value => !value)}
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/12 shadow-xl transition-all hover:border-white/30"
          aria-label="Open profile menu"
        >
          {renderAvatar(user?.photoURL, user?.displayName, user?.email, 'w-full h-full')}
        </button>

        <div
          className={`absolute right-0 top-full z-[60] mt-3 w-56 origin-top-right rounded-xl py-2 transition-all duration-200 ${isProfileOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`}
          style={{
background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.8)',
          }}
        >
          <div className="mb-2 border-b border-white/5 px-5 py-4">
            <p className="truncate text-[14px] font-bold text-white">
              {user?.displayName || (user?.email ? user.email.split('@')[0] : 'Listener')}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-white/40">{user?.email || ''}</p>
          </div>
          <button onClick={() => { navigate('/settings'); setIsProfileOpen(false); }} className="flex w-full items-center gap-3 px-5 py-3 text-left text-[13px] font-semibold text-white/50 transition-all hover:bg-white/5 hover:text-white">
            <FiSettings size={14} />
            Settings
          </button>
          <div className="mx-5 my-2 h-px bg-white/5" />
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-5 py-3 text-left text-[13px] font-semibold text-red-400/60 transition-all hover:bg-red-400/5 hover:text-red-400">
            <FiLogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>

      {isProfileOpen && <div className="fixed inset-0 z-[55]" onClick={() => setIsProfileOpen(false)} />}
    </header>
  );
};

export default Sidebar;
