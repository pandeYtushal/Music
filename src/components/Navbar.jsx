import { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useAuthStore } from '../store/useAuthStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { renderAvatar } from '../utils/avatar';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const routeQuery = location.pathname === '/search'
    ? new URLSearchParams(location.search).get('q') || ''
    : '';
  const [queryState, setQueryState] = useState({ routeQuery, value: routeQuery });
  const query = queryState.routeQuery === routeQuery ? queryState.value : routeQuery;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Debounced search effect
  useEffect(() => {
    // Don't navigate if the typed query perfectly matches the URL query
    if (query === routeQuery) return;

    const handler = setTimeout(() => {
      if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      } else if (location.pathname === '/search') {
        // If they cleared the search while on the search page
        navigate('/search');
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(handler);
  }, [query, routeQuery, navigate, location.pathname]);

  const clearSearch = () => {
    setQueryState({ routeQuery, value: '' });
    navigate('/search');
  };

  return (
    <header
      className="sticky top-0 z-40 px-4 md:px-10 py-3 md:py-0 md:h-16 flex items-center justify-between gap-3 md:gap-6"
      style={{
        background: 'rgba(12,12,14,0.4)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex-1 flex justify-center min-w-0">
        <div
          className="flex items-center gap-3 w-full max-w-xl rounded-xl md:rounded-full px-4 md:px-5 py-2 transition-all duration-300 group"
          style={{
            background: isFocused ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.035)',
            border: `1px solid ${isFocused ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.06)'}`,
          }}
        >
          <FiSearch size={15} className={`transition-colors ${isFocused ? 'text-white' : 'text-white/30'}`} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQueryState({ routeQuery, value: e.target.value })}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search songs, artists, albums"
            className="bg-transparent border-none outline-none text-white w-full text-[13px] font-medium placeholder:text-white/20"
          />
          {query && (
            <button type="button" onClick={clearSearch} className="text-white/20 hover:text-white/60 transition-colors">
              <FiX size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 md:min-w-[64px] justify-end shrink-0">
        {user && (
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(value => !value)}
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl overflow-hidden border border-white/10 hover:border-white/25 transition-all shadow-md flex items-center justify-center shrink-0"
            >
              {renderAvatar(user?.photoURL, user?.displayName, user?.email, "w-full h-full")}
            </button>

            <div
              className={`absolute top-full right-0 mt-3 w-56 rounded-2xl py-2 z-[60] transition-all duration-300 origin-top-right ${isProfileOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 pointer-events-none -translate-y-2'}`}
              style={{
                background: 'rgba(22,22,25,0.85)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.65)',
              }}
            >
              <div className="px-5 py-4 border-b border-white/[0.05] mb-1.5">
                <p className="text-[13.5px] font-extrabold text-white truncate">
                  {(() => {
                    const name = user.displayName || (user.email ? user.email.split('@')[0] : 'Listener');
                    return name.charAt(0).toUpperCase() + name.slice(1);
                  })()}
                </p>
                <p className="text-[10.5px] text-white/35 truncate mt-0.5 font-medium">{user.email || ''}</p>
              </div>
              <button onClick={() => { navigate('/settings'); setIsProfileOpen(false); }} className="w-full text-left px-5 py-2.5 text-[12.5px] font-bold text-white/50 hover:text-white hover:bg-white/[0.04] transition-all">Settings</button>
              <div className="h-[1px] bg-white/[0.05] my-1.5 mx-5" />
              <button onClick={handleLogout} className="w-full text-left px-5 py-2.5 text-[12.5px] font-bold text-red-400/50 hover:text-red-400 hover:bg-red-400/5 transition-all">Sign Out</button>
            </div>
          </div>
        )}
      </div>

      {isProfileOpen && <div className="fixed inset-0 z-[55]" onClick={() => setIsProfileOpen(false)} />}
    </header>
  );
};

export default Navbar;
