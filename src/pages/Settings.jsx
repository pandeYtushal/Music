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
    <div className="p-4 sm:p-6 md:p-8 pb-32 max-w-4xl">
      <h1 className="text-3xl font-bold text-textPrimary mb-8">Settings</h1>

      <div className="space-y-8">
        {/* Profile Section */}
        <section className="bg-surface/30 border border-white/5 rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <FiUser size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-textPrimary">Profile Settings</h2>
              <p className="text-sm text-textSecondary">Manage your public profile information.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-textSecondary">Display Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-textPrimary focus:border-primary/50 outline-none transition-all"
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-2 opacity-50">
                <label className="text-sm font-medium text-textSecondary">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-textPrimary cursor-not-allowed"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="flex items-center gap-2 bg-primary text-black font-bold px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              <FiSave />
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </form>
        </section>

        {/* Playback Settings */}
        <section className="bg-surface/30 border border-white/5 rounded-3xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-textPrimary mb-6">Playback</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Audio Quality</p>
                <p className="text-xs text-textSecondary">Higher quality uses more data.</p>
              </div>
              <select 
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="bg-background border border-white/10 rounded-lg px-3 py-1.5 text-sm text-textPrimary outline-none focus:border-primary/50"
              >
                <option value="12kbps">Low (12kbps)</option>
                <option value="48kbps">Normal (48kbps)</option>
                <option value="96kbps">High (96kbps)</option>
                <option value="160kbps">Very High (160kbps)</option>
                <option value="320kbps">Extreme (320kbps)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Autoplay</p>
                <p className="text-xs text-textSecondary">Keep the music playing when a song ends.</p>
              </div>
              <div 
                onClick={toggleAutoplay}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${autoplay ? 'bg-primary' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${autoplay ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Content Language</p>
                <p className="text-xs text-textSecondary">Choose your preferred music languages.</p>
              </div>
              <button className="text-sm text-primary font-bold hover:underline">Manage</button>
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="bg-surface/30 border border-white/5 rounded-3xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-textPrimary mb-6">General Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <div className="flex items-center gap-4">
                <FiMoon className="text-textSecondary" />
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-xs text-textSecondary">Toggle the application theme.</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <div className="flex items-center gap-4">
                <FiBell className="text-textSecondary" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-xs text-textSecondary">Get notified about new releases.</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white/50 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Version Info */}
        <div className="pt-8 text-center opacity-30">
          <p className="text-[10px] text-textSecondary uppercase tracking-[0.2em]">Melody v1.2.4</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
