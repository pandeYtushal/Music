import { useAuthStore } from '../store/useAuthStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { renderAvatar } from '../utils/avatar';
import { FiUser, FiSettings, FiWifi, FiCheck, FiHeadphones } from 'react-icons/fi';
import useDocumentTitle from '../hooks/useDocumentTitle';

const qualityOptions = [
  { value: '48kbps', label: 'Mobile', helper: 'Data saver' },
  { value: '96kbps', label: 'Standard', helper: 'Balanced' },
  { value: '160kbps', label: 'HD', helper: 'Clearer' },
  { value: '320kbps', label: 'Master', helper: 'Best quality' },
];

const SettingRow = ({ icon: Icon, label, description, children }) => (
  <div className="flex items-center justify-between gap-4 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.01] px-4 -mx-4 rounded-xl transition-colors group">
    <div className="flex items-center gap-4 min-w-0">
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] group-hover:border-white/[0.1] flex items-center justify-center shrink-0 transition-all">
          <Icon size={18} className="text-white/50 group-hover:text-white/80 transition-colors" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-white font-bold text-[15px] leading-snug">{label}</p>
        {description && <p className="text-white/40 text-[13px] font-medium mt-0.5 leading-snug">{description}</p>}
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
    className={`relative w-12 h-7 rounded-full transition-all duration-300 border ${active ? 'bg-orange-500 border-orange-500' : 'bg-white/[0.05] border-white/10 hover:border-white/20'}`}
  >
    <div className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${active ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const Settings = () => {
  const { user } = useAuthStore();
  const { autoplay, toggleAutoplay, quality, setQuality } = usePlayerStore();
  useDocumentTitle('Settings');

  const derivedName = (() => {
    const name = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Listener');
    return name.charAt(0).toUpperCase() + name.slice(1);
  })();

  const sectionClass = 'rounded-3xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden';
  const sectionStyle = { background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)' };

  return (
    <div className="w-full bg-[#050505] text-white">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-8 md:pt-14 animate-fade-up">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2 text-orange-500/80">
              <FiSettings size={16} />
              <p className="text-[10px] font-bold uppercase tracking-[0.25em]">Preferences</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Settings</h1>
          </div>
        </div>

        {/* Profile Card */}
        <div className="relative rounded-[32px] overflow-hidden border border-white/[0.08] mb-10 group p-8 md:p-10" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)' }}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="shrink-0 p-1 rounded-full bg-white/[0.05] border border-white/[0.1]">
              {renderAvatar(user?.photoURL, derivedName, user?.email, "w-28 h-28 md:w-32 md:h-32 rounded-full shadow-2xl")}
            </div>
            
            <div className="text-center md:text-left flex-1 flex flex-col justify-center h-full pt-2 md:pt-4">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">{derivedName}</h2>
              <p className="text-white/40 font-medium text-sm md:text-base flex items-center justify-center md:justify-start gap-2">
                <FiUser size={14} />
                {user?.email || 'Authenticated User'}
              </p>
            </div>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="max-w-3xl mx-auto">
          
          {/* Playback Settings */}
          <section className={sectionClass} style={sectionStyle}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <FiWifi size={20} className="text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Playback Quality</h2>
                <p className="text-sm text-white/40 font-medium mt-1">Control your streaming experience.</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {qualityOptions.map(option => {
                const active = option.value === quality;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setQuality(option.value)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${active ? 'bg-white/[0.08] border-white/20 shadow-lg' : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]'}`}
                  >
                    <div className="text-left">
                      <p className={`font-bold text-[15px] ${active ? 'text-white' : 'text-white/70'}`}>{option.label}</p>
                      <p className={`text-[12px] font-medium mt-0.5 ${active ? 'text-white/60' : 'text-white/30'}`}>{option.helper}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${active ? 'border-orange-500 bg-orange-500' : 'border-white/10'}`}>
                      {active && <FiCheck size={14} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <SettingRow icon={FiHeadphones} label="Infinite Playback" description="Auto-play similar tracks when your queue ends.">
                <Toggle active={autoplay} onToggle={toggleAutoplay} label="Infinite playback" />
              </SettingRow>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Settings;
