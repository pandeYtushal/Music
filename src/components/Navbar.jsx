import React, { useState } from 'react';
import { FiSearch, FiBell } from 'react-icons/fi';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
      <form onSubmit={handleSearch} className="flex items-center bg-surface/50 border border-white/10 rounded-full px-4 py-2 w-1/3 min-w-[250px] focus-within:border-primary/50 focus-within:shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all duration-300">
        <button type="submit" className="text-textSecondary hover:text-primary transition-colors">
          <FiSearch className="mr-3" size={20} />
        </button>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for songs, artists, podcasts..." 
          className="bg-transparent border-none outline-none text-textPrimary w-full text-sm placeholder-textSecondary"
        />
      </form>

      <div className="flex items-center gap-6">
        <button className="text-textSecondary hover:text-textPrimary transition-colors relative">
          <FiBell size={24} />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background"></span>
        </button>
        
        {user ? (
          <div className="flex items-center gap-4 cursor-pointer group relative">
            <img 
              src={user.photoURL || "https://ui-avatars.com/api/?name=" + (user.displayName || "User") + "&background=8B5CF6&color=fff"} 
              alt="User" 
              className="w-10 h-10 rounded-full border-2 border-primary/20 object-cover transition-transform group-hover:scale-105"
            />
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-textPrimary">{user.displayName || "User"}</p>
              <p className="text-xs text-textSecondary">Premium Member</p>
            </div>
            
            <div className="absolute top-full right-0 mt-2 w-48 bg-surface border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden py-2">
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => navigate('/login')}
            className="bg-primary/10 text-primary font-semibold px-6 py-2 rounded-full border border-primary/20 hover:bg-primary hover:text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all duration-300"
          >
            Log in
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
