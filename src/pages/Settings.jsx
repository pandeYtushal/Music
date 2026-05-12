import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiShield, FiBell, FiMoon, FiSave } from 'react-icons/fi';

const Settings = () => {
  const { user, setUser, logout } = useAuthStore();
  const { autoplay, toggleAutoplay, quality, setQuality } = usePlayerStore();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setUser({ ...user, displayName });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-40 md:pb-32 max-w-4xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-3xl md:text-5xl font-bold text-textPrimary tracking-tight mb-8 md:mb-12">Settings</h1>

      <div className="space-y-6 md:space-y-8">
        {/* Profile Section */}
        <section className="glass rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary shadow-inner border border-primary/20">
              <FiUser size={32} className="md:w-10 md:h-10" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-textPrimary mb-1">Profile</h2>
              <p className="text-sm text-textSecondary font-medium">Manage your public information.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Display Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3.5 text-textPrimary focus:border-primary/50 focus:bg-surface/80 outline-none transition-all placeholder:text-textSecondary/50"
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-3 opacity-50">
                <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled
                  className="w-full bg-surface/30 border border-white/5 rounded-xl px-4 py-3.5 text-textPrimary cursor-not-allowed"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold px-8 py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-4"
            >
              <FiSave size={20} />
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </form>
        </section>

        {/* Playback Settings */}
        <section className="glass rounded-3xl p-6 md:p-8 shadow-xl">
          <h2 className="text-xl md:text-2xl font-bold text-textPrimary mb-8">Playback</h2>
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-textPrimary mb-1">Audio Quality</p>
                <p className="text-sm text-textSecondary font-medium">Higher quality uses more data.</p>
              </div>
              <select 
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="bg-surface/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-textPrimary outline-none focus:border-primary/50 appearance-none min-w-[150px] shadow-sm hover:bg-white/5 transition-colors cursor-pointer"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
              >
                <option value="12kbps">Low (12kbps)</option>
                <option value="48kbps">Normal (48kbps)</option>
                <option value="96kbps">High (96kbps)</option>
                <option value="160kbps">Very High (160kbps)</option>
                <option value="320kbps">Extreme (320kbps)</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-textPrimary mb-1">Autoplay</p>
                <p className="text-sm text-textSecondary font-medium">Keep the music playing when a song ends.</p>
              </div>
              <div 
                onClick={toggleAutoplay}
                className={`w-14 h-8 rounded-full relative cursor-pointer transition-colors duration-300 shadow-inner shrink-0 ${autoplay ? 'bg-primary' : 'bg-surface border border-white/10'}`}
              >
                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${autoplay ? 'translate-x-6 scale-100' : 'translate-x-0 scale-90 opacity-70'}`}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="glass rounded-3xl p-6 md:p-8 shadow-xl">
          <h2 className="text-xl md:text-2xl font-bold text-textPrimary mb-8">Preferences</h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl gap-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-white/5">
                  <FiMoon className="text-textSecondary" />
                </div>
                <div>
                  <p className="font-bold text-textPrimary mb-0.5">Dark Mode</p>
                  <p className="text-xs md:text-sm text-textSecondary font-medium">Toggle the application theme.</p>
                </div>
              </div>
              <div className="w-14 h-8 bg-primary rounded-full relative cursor-pointer shrink-0 shadow-inner sm:ml-0 ml-14">
                <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 translate-x-6"></div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl gap-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-white/5">
                  <FiBell className="text-textSecondary" />
                </div>
                <div>
                  <p className="font-bold text-textPrimary mb-0.5">Push Notifications</p>
                  <p className="text-xs md:text-sm text-textSecondary font-medium">Get notified about new releases.</p>
                </div>
              </div>
              <div className="w-14 h-8 bg-surface border border-white/10 rounded-full relative cursor-pointer shrink-0 shadow-inner sm:ml-0 ml-14">
                <div className="absolute top-1 left-1 w-6 h-6 bg-white/50 rounded-full scale-90 transition-transform duration-300 translate-x-0"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Version Info */}
        <div className="pt-8 text-center opacity-40 hover:opacity-100 transition-opacity">
          <p className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.3em]">Melody v1.2.4</p>
          <p className="text-[10px] text-textSecondary mt-2 tracking-widest">Designed for Music Lovers</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
