import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { renderAvatar } from '../utils/avatar';
import {
  FiBell,
  FiCheck,
  FiHeadphones,
  FiHeart,
  FiMoon,
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
  const { user } = useAuthStore();
  const { autoplay, toggleAutoplay, quality, setQuality, favorites, recentlyPlayed, playlists } = usePlayerStore();
  const [notifications, setNotifications] = useState(false);

  const derivedName = (() => {
    const name = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Listener');
    return name.charAt(0).toUpperCase() + name.slice(1);
  })();

  const sectionClass = 'rounded-xl p-5 md:p-6';
  const sectionStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' };

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
              {renderAvatar(user?.photoURL, derivedName, user?.email, "w-16 h-16")}
              <div className="min-w-0">
                <p className="text-white font-bold truncate">{derivedName}</p>
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
              <Toggle active={true} onToggle={() => { }} label="Dark mode" />
            </SettingRow>
            <SettingRow icon={FiBell} label="Notifications" description="Release and playlist updates.">
              <Toggle active={notifications} onToggle={() => setNotifications(value => !value)} label="Notifications" />
            </SettingRow>
          </section>
        </div>

        <div className="lg:col-span-8 space-y-5">
          <section className={sectionClass} style={sectionStyle}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <FiUser size={18} className="text-white/55" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Account Profile</h2>
                <p className="text-sm text-white/38 font-medium">Your verified account information.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30">Username</p>
                  <p className="text-white font-bold text-base mt-1">{derivedName}</p>
                </div>

              </div>

              <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30">Email Address</p>
                  <p className="text-white font-bold text-base mt-1">{user?.email || 'N/A'}</p>
                </div>
              </div>
            </div>
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
