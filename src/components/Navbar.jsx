import React, { useEffect, useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useAuthStore } from '../store/useAuthStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { renderAvatar } from '../utils/avatar';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (location.pathname === '/search' && q) {
      setSearchQuery(q);
    } else if (location.pathname !== '/search') {
      setSearchQuery('');
    }
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    navigate('/search');
  };

  return (
    <header
      className="sticky top-0 z-40 px-4 md:px-10 py-3 md:py-0 md:h-16 flex items-center justify-between gap-3 md:gap-6"
      style={{
        background: 'linear-gradient(180deg, rgba(5,5,5,0.88), rgba(5,5,5,0.68))',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderBottom: '1px solid rgba(255,255,255,0.045)',
      }}
    >
      <div className="flex-1 flex justify-center min-w-0">
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-3 w-full max-w-xl rounded-xl md:rounded-full px-4 md:px-5 py-2.5 transition-all duration-300 group"
          style={{
            background: isFocused ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.055)',
            border: `1px solid ${isFocused ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          <FiSearch size={16} className={`transition-colors ${isFocused ? 'text-white' : 'text-white/30'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search songs, artists, albums"
            className="bg-transparent border-none outline-none text-white w-full text-[14px] font-medium placeholder:text-white/20"
          />
          {searchQuery && (
            <button type="button" onClick={clearSearch} className="text-white/20 hover:text-white/60 transition-colors">
              <FiX size={14} />
            </button>
          )}
        </form>
      </div>

      <div className="flex items-center gap-3 md:min-w-[64px] justify-end shrink-0">
        {user && (
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(value => !value)}
              className="w-10 h-10 md:w-11 md:h-11 rounded-xl overflow-hidden border border-white/12 hover:border-white/30 transition-all shadow-xl flex items-center justify-center shrink-0"
            >
              {renderAvatar(user?.photoURL, user?.displayName, user?.email, "w-full h-full")}
            </button>

            <div
              className={`absolute top-full right-0 mt-3 w-56 rounded-xl py-2 z-[60] transition-all duration-300 origin-top-right ${isProfileOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
              style={{
                background: '#121212',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 32px 64px rgba(0,0,0,0.8)',
              }}
            >
              <div className="px-5 py-4 border-b border-white/5 mb-2">
                <p className="text-[14px] font-bold text-white truncate">
                  {(() => {
                    const name = user.displayName || (user.email ? user.email.split('@')[0] : 'Listener');
                    return name.charAt(0).toUpperCase() + name.slice(1);
                  })()}
                </p>
                <p className="text-[11px] text-white/40 truncate mt-0.5">{user.email || ''}</p>
              </div>
              <button onClick={() => { navigate('/settings'); setIsProfileOpen(false); }} className="w-full text-left px-5 py-3 text-[13px] font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all">Settings</button>
              <div className="h-[1px] bg-white/5 my-2 mx-5" />
              <button onClick={handleLogout} className="w-full text-left px-5 py-3 text-[13px] font-semibold text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all">Sign Out</button>
            </div>
          </div>
        )}
      </div>

      {isProfileOpen && <div className="fixed inset-0 z-[55]" onClick={() => setIsProfileOpen(false)} />}
    </header>
  );
};

export default Navbar;
