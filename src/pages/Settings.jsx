import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { usePlayerStore } from '../store/usePlayerStore';
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiHeadphones,
  FiHeart,
  FiMail,
  FiMoon,
  FiSave,
  FiUser,
  FiWifi,
} from 'react-icons/fi';

const qualityOptions = [
  { value: '48kbps', label: 'Mobile', helper: 'Data saver' },
  { value: '96kbps', label: 'Standard', helper: 'Balanced' },
  { value: '160kbps', label: 'HD', helper: 'Clearer' },
  { value: '320kbps', label: 'Master', helper: 'Best quality' },
];

const SettingRow = ({ icon: Icon, label, description, children }) => (
  <div className="flex items-center justify-between gap-4 py-4 border-b border-white/[0.05] last:border-0">
    <div className="flex items-center gap-3 min-w-0">
      {Icon && (
        <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
          <Icon size={16} className="text-white/45" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-white font-semibold text-[14px] leading-snug">{label}</p>
        {description && <p className="text-white/36 text-xs font-medium mt-0.5 leading-snug">{description}</p>}
      </div>
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Toggle = ({ active, onToggle, label }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onToggle}
    className={`relative w-12 h-7 rounded-full transition-all duration-300 border ${active ? 'bg-white border-white' : 'bg-white/[0.03] border-white/15'}`}
  >
    <div className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-all duration-300 ${active ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white/25'}`} />
  </button>
);

const Stat = ({ label, value, icon: Icon }) => (
  <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
    <Icon size={16} className="text-white/35 mb-3" />
    <p className="text-xl font-bold text-white tabular-nums">{value}</p>
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/28 mt-1">{label}</p>
  </div>
);

const Settings = () => {
  const { user, setUser } = useAuthStore();
  const { autoplay, toggleAutoplay, quality, setQuality, favorites, recentlyPlayed, playlists } = usePlayerStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setUser({ ...user, displayName });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sectionClass = 'rounded-xl p-5 md:p-6';
  const sectionStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' };
  const avatar = user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || user?.email || 'User')}&background=222&color=fff&bold=true`;

  return (
    <div className="page-wrap animate-fade-up max-w-5xl">
      <div className="mb-7">
        <p className="section-overline">Account</p>
        <h1 className="section-heading">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 space-y-5">
          <section className={sectionClass} style={sectionStyle}>
            <div className="flex items-center gap-4">
              <img src={avatar} alt="" className="w-16 h-16 rounded-xl object-cover border border-white/10" />
              <div className="min-w-0">
                <p className="text-white font-bold truncate">{displayName || 'Listener'}</p>
                <p className="text-white/35 text-sm truncate mt-0.5">{user?.email || 'Signed in'}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-5">
              <Stat label="Liked" value={favorites.length} icon={FiHeart} />
              <Stat label="Played" value={recentlyPlayed.length} icon={FiHeadphones} />
              <Stat label="Lists" value={playlists.length} icon={FiUser} />
            </div>
          </section>

          <section className={sectionClass} style={sectionStyle}>
            <h2 className="text-base font-bold text-white tracking-tight mb-1">System</h2>
            <p className="text-sm text-white/38 font-medium mb-3">Keep the app calm and predictable.</p>

            <SettingRow icon={FiMoon} label="Dark Mode" description="Melody is tuned for low light.">
              <Toggle active={true} onToggle={() => {}} label="Dark mode" />
            </SettingRow>
            <SettingRow icon={FiBell} label="Notifications" description="Release and playlist updates.">
              <Toggle active={notifications} onToggle={() => setNotifications(value => !value)} label="Notifications" />
            </SettingRow>
          </section>
        </div>

        <div className="lg:col-span-8 space-y-5">
          <section className={sectionClass} style={sectionStyle}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <FiUser size={18} className="text-white/55" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Profile</h2>
                <p className="text-sm text-white/38 font-medium">This name appears across your library.</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className="w-full input-field rounded-xl pl-10 pr-4 py-3 text-[14px] font-medium opacity-45 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 text-sm">
                {saved ? <FiCheckCircle size={16} /> : <FiSave size={16} />}
                {saved ? 'Saved' : 'Save Changes'}
              </button>
            </form>
          </section>

          <section className={sectionClass} style={sectionStyle}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <FiWifi size={18} className="text-white/55" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Playback</h2>
                <p className="text-sm text-white/38 font-medium">Control quality and queue behavior.</p>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 mb-3">Audio Quality</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {qualityOptions.map(option => {
                  const active = option.value === quality;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setQuality(option.value)}
                      className={`relative rounded-xl border p-3 text-left transition-all ${active ? 'bg-white text-black border-white' : 'bg-white/[0.025] text-white border-white/[0.06] hover:bg-white/[0.05]'}`}
                    >
                      <p className="font-bold text-sm">{option.label}</p>
                      <p className={`text-[11px] font-medium mt-1 ${active ? 'text-black/55' : 'text-white/35'}`}>{option.helper}</p>
                      {active && <FiCheck size={15} className="absolute top-3 right-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <SettingRow icon={FiHeadphones} label="Infinite Playback" description="Auto-play similar tracks when the queue ends.">
              <Toggle active={autoplay} onToggle={toggleAutoplay} label="Infinite playback" />
            </SettingRow>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
