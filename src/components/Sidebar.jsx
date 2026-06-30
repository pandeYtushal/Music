import { NavLink, useNavigate } from 'react-router-dom';
import { FiClock, FiHeart, FiHome, FiLogOut, FiMusic, FiSearch, FiSettings, FiX, FiTrendingUp } from 'react-icons/fi';
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
      className="fixed top-5 left-1/2 z-50 hidden w-[min(calc(100vw-2.5rem),1140px)] -translate-x-1/2 md:flex items-center gap-4 rounded-2xl px-4 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-3xl transition-all duration-300 border border-white/[0.07] bg-white/[0.02]"
    >
      <div
        onClick={() => navigate('/')}
        className="flex items-center gap-2.5 cursor-pointer group shrink-0 rounded-xl px-2.5 py-1.5 hover:bg-white/[0.04] transition-all duration-200"
      >
        <div
          className="w-8 h-8 rounded-[10px] flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.35)]"
          style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.22)' }}
        >
          <img src={logo} alt="Melody" className="w-5 h-5 object-contain" />
        </div>
        <span className="text-[14px] font-black tracking-tight text-white">Melody</span>
      </div>

      <div className="h-6 w-px bg-white/[0.06]" />

      <nav className="flex min-w-0 items-center justify-center gap-1.5 overflow-x-auto scrollbar-hide">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end={link.path === '/'}
            className={({ isActive }) =>
              `flex h-9 shrink-0 items-center gap-2 rounded-xl px-3.5 text-[12.5px] font-bold transition-all duration-300 ${isActive
                ? 'bg-white text-black shadow-[0_8px_20px_rgba(255,255,255,0.12)] hover:scale-[1.02] active:scale-[0.98]'
                : 'text-white/50 hover:bg-white/[0.05] hover:text-white hover:scale-[1.02] active:scale-[0.98]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon size={14} className={isActive ? 'text-black' : 'text-white/40 group-hover:text-white/80 transition-colors'} />
                <span>{link.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <form
        onSubmit={handleSearch}
        className="ml-auto flex h-9 w-[min(24vw,320px)] min-w-[200px] items-center gap-2 rounded-xl px-3 transition-all duration-300"
        style={{
          background: isFocused ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${isFocused ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.06)'}`,
        }}
      >
        <FiSearch size={14} className={isFocused ? 'text-white' : 'text-white/30'} />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search"
          className="min-w-0 flex-1 bg-transparent text-[12.5px] font-medium text-white outline-none placeholder:text-white/20"
        />
        {query && (
          <button type="button" onClick={clearSearch} className="text-white/20 transition-colors hover:text-white/60" aria-label="Clear search">
            <FiX size={13} />
          </button>
        )}
      </form>

      <div className="relative shrink-0">
        <button
          onClick={() => setIsProfileOpen(value => !value)}
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-white/10 shadow-lg transition-all hover:border-white/25 active:scale-95"
          aria-label="Open profile menu"
        >
          {renderAvatar(user?.photoURL, user?.displayName, user?.email, 'w-full h-full')}
        </button>

        <div
          className={`absolute right-0 top-full z-[60] mt-3.5 w-56 origin-top-right rounded-2xl py-2 transition-all duration-300 ${isProfileOpen ? 'scale-100 opacity-100 translate-y-0' : 'pointer-events-none scale-95 opacity-0 -translate-y-2'}`}
          style={{
            background: 'rgba(22,22,25,0.85)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.65)',
          }}
        >
          <div className="mb-1.5 border-b border-white/[0.05] px-5 py-4">
            <p className="truncate text-[13.5px] font-extrabold text-white">
              {user?.displayName || (user?.email ? user.email.split('@')[0] : 'Listener')}
            </p>
            <p className="mt-0.5 truncate text-[10.5px] text-white/35 font-medium">{user?.email || ''}</p>
          </div>
          <button onClick={() => { navigate('/stats'); setIsProfileOpen(false); }} className="flex w-full items-center gap-3 px-5 py-2.5 text-left text-[12.5px] font-bold text-white/50 transition-all hover:bg-white/[0.04] hover:text-white">
            <FiTrendingUp size={13} />
            Listening Stats
          </button>
          <button onClick={() => { navigate('/settings'); setIsProfileOpen(false); }} className="flex w-full items-center gap-3 px-5 py-2.5 text-left text-[12.5px] font-bold text-white/50 transition-all hover:bg-white/[0.04] hover:text-white">
            <FiSettings size={13} />
            Settings
          </button>
          <div className="mx-5 my-1.5 h-px bg-white/[0.05]" />
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-5 py-2.5 text-left text-[12.5px] font-bold text-red-400/50 transition-all hover:bg-red-400/5 hover:text-red-400">
            <FiLogOut size={13} />
            Sign Out
          </button>
        </div>
      </div>

      {isProfileOpen && <div className="fixed inset-0 z-[55]" onClick={() => setIsProfileOpen(false)} />}
    </header>
  );
};

export default Sidebar;
