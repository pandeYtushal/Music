import React, { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiX, FiSettings } from 'react-icons/fi';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';

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
      className="sticky top-0 z-40 h-16 px-6 md:px-10 flex items-center justify-between gap-6"
      style={{
        background: 'rgba(5,5,5,0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Search — Centered and clean */}
      <div className="flex-1 flex justify-center">
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-3 w-full max-w-lg rounded-full px-5 py-2.5 transition-all duration-300 group"
          style={{
            background: isFocused ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <FiSearch size={16} className={`transition-colors ${isFocused ? 'text-white' : 'text-white/30'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search for songs, artists etc..."
            className="bg-transparent border-none outline-none text-white w-full text-[14px] font-medium placeholder:text-white/20"
          />
          {searchQuery && (
            <button type="button" onClick={clearSearch} className="text-white/20 hover:text-white/60 transition-colors">
              <FiX size={14} />
            </button>
          )}
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-5">
        {user && (
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/10 hover:border-white/30 transition-all shadow-xl"
            >
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=222&color=fff&bold=true`}
                alt="User"
                className="w-full h-full object-cover"
              />
            </button>

            {/* Profile Dropdown */}
            <div
              className={`absolute top-full right-0 mt-3 w-56 rounded-[24px] py-2 z-[60] transition-all duration-300 origin-top-right ${isProfileOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}
              style={{
                background: '#121212',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 32px 64px rgba(0,0,0,0.8)',
              }}
            >
              <div className="px-5 py-4 border-b border-white/5 mb-2">
                <p className="text-[14px] font-bold text-white truncate">{user.displayName || 'User'}</p>
                <p className="text-[11px] text-white/40 truncate mt-0.5">{user.email || ''}</p>
              </div>
              <button onClick={() => { navigate('/settings'); setIsProfileOpen(false); }} className="w-full text-left px-5 py-3 text-[13px] font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all">Settings</button>
              <div className="h-[1px] bg-white/5 my-2 mx-5" />
              <button onClick={handleLogout} className="w-full text-left px-5 py-3 text-[13px] font-semibold text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all">Sign Out</button>
            </div>

            {isProfileOpen && <div className="fixed inset-0 z-[55]" onClick={() => setIsProfileOpen(false)} />}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
