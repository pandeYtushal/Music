import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { FiUser, FiMail, FiBell, FiMoon, FiSave, FiCheckCircle, FiInfo } from 'react-icons/fi';

const SettingRow = ({ label, description, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 border-b border-white/[0.05] last:border-0">
    <div>
      <p className="text-white font-semibold text-[15px] leading-snug">{label}</p>
      {description && <p className="text-white/40 text-sm font-medium mt-0.5">{description}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Toggle = ({ active, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative w-12 h-7 rounded-full transition-all duration-300 border ${active ? 'bg-white border-white' : 'bg-transparent border-white/15'
      }`}
  >
    <div className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-all duration-300 ${active ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white/20'
      }`} />
  </button>
);

const Settings = () => {
  const { user, setUser } = useAuthStore();
  const { autoplay, toggleAutoplay, quality, setQuality } = usePlayerStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setUser({ ...user, displayName });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sectionClass = "rounded-2xl p-6 md:p-8 mb-5";
  const sectionStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' };

  return (
    <div className="page-wrap animate-fade-up max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <p className="section-overline">Preferences</p>
        <h1 className="section-heading">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-5">
          {/* Profile */}
          <section className={sectionClass} style={sectionStyle}>
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <FiUser size={20} className="text-white/60" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Profile</h2>
                <p className="text-sm text-white/40 font-medium">Personalize your identity</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full input-field rounded-xl px-4 py-3 text-[14px] font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full input-field rounded-xl pl-10 pr-4 py-3 text-[14px] font-medium opacity-40 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
              >
                {saved ? <FiCheckCircle size={16} /> : <FiSave size={16} />}
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </form>
          </section>

          {/* Playback */}
          <section className={sectionClass} style={sectionStyle}>
            <h2 className="text-lg font-bold text-white tracking-tight mb-2">Playback</h2>
            <p className="text-sm text-white/40 font-medium mb-5">Control your listening experience</p>

            <SettingRow label="Audio Quality" description="Select preferred streaming bit-rate">
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="input-field rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1em',
                  paddingRight: '2.5rem',
                  appearance: 'none',
                }}
              >
                <option value="12kbps">Lo-Fi (12kbps)</option>
                <option value="48kbps">Mobile (48kbps)</option>
                <option value="96kbps">Standard (96kbps)</option>
                <option value="160kbps">HD Audio (160kbps)</option>
                <option value="320kbps">Master (320kbps)</option>
              </select>
            </SettingRow>

            <SettingRow label="Infinite Playback" description="Auto-play similar tracks when queue ends">
              <Toggle active={autoplay} onToggle={toggleAutoplay} />
            </SettingRow>
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-5">
          <section className={sectionClass} style={sectionStyle}>
            <h2 className="text-base font-bold text-white tracking-tight mb-5">System</h2>
            <SettingRow label="Dark Mode">
              <Toggle active={true} onToggle={() => { }} />
            </SettingRow>
            <SettingRow label="Notifications">
              <Toggle active={false} onToggle={() => { }} />
            </SettingRow>
          </section>

          {/* About */}
          <div
            className="rounded-2xl p-6 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <FiInfo size={16} className="text-white/50" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-1">Version</p>
            <p className="text-white font-bold text-sm">Melody Studio</p>
            <div className="divider my-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
