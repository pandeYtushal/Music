import { useAuthStore } from '../store/useAuthStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { renderAvatar } from '../utils/avatar';
import { FiWifi, FiCheck, FiHeadphones, FiCommand, FiShield, FiSliders } from 'react-icons/fi';
import useDocumentTitle from '../hooks/useDocumentTitle';

const qualityOptions = [
  { value: '48kbps', label: 'Data Saver (48k)', helper: 'Low bandwidth & mobile data' },
  { value: '96kbps', label: 'Standard (96k)', helper: 'Balanced fidelity & efficiency' },
  { value: '160kbps', label: 'High Quality (160k)', helper: 'Crisp acoustic dynamic range' },
  { value: '320kbps', label: 'Master Studio (320k)', helper: 'Maximum uncompressed streaming' },
];

const SettingRow = ({ icon: Icon, label, description, children }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 md:py-8 border-b border-border/30 hover:bg-surface/10 transition-colors px-4 -mx-4 group">
    <div className="flex items-start md:items-center gap-6">
      {Icon && (
        <div className="w-12 h-12 flex items-center justify-center shrink-0">
          <Icon size={32} className="text-secondary group-hover:text-primary transition-colors" />
        </div>
      )}
      <div>
        <p className="text-primary font-display font-bold text-xl md:text-2xl uppercase tracking-tight">{label}</p>
        {description && <p className="text-secondary text-xs font-bold tracking-[0.2em] mt-2 uppercase">{description}</p>}
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
    className={`relative w-20 h-10 transition-all duration-300 border-2 ${
      active ? 'bg-primary border-primary' : 'bg-transparent border-border hover:border-primary'
    }`}
  >
    <div
      className={`absolute top-1 left-1 w-7 h-7 transition-all duration-300 ${
        active ? 'translate-x-10 bg-background' : 'translate-x-0 bg-secondary'
      }`}
    />
  </button>
);

const Settings = () => {
  const { user, setDisplayName } = useAuthStore();
  const autoplay = usePlayerStore((state) => state.autoplay);
  const toggleAutoplay = usePlayerStore((state) => state.toggleAutoplay);
  const quality = usePlayerStore((state) => state.quality);
  const setQuality = usePlayerStore((state) => state.setQuality);
  const crossfade = usePlayerStore((state) => state.crossfade);
  const toggleCrossfade = usePlayerStore((state) => state.toggleCrossfade);
  const crossfadeDuration = usePlayerStore((state) => state.crossfadeDuration);
  const setCrossfadeDuration = usePlayerStore((state) => state.setCrossfadeDuration);
  const eqPreset = usePlayerStore((state) => state.eqPreset);
  const setEqPreset = usePlayerStore((state) => state.setEqPreset);
  useDocumentTitle('Settings — MELDMUSIC');

  const derivedName = (() => {
    const name = user?.displayName || 'Music Listener';
    return name.charAt(0).toUpperCase() + name.slice(1);
  })();

  return (
    <div className="w-full pt-32 pb-32 px-6 md:px-12 animate-fade-in">
      <header className="mb-24 md:mb-32">
        <p className="text-[10px] font-bold tracking-[0.4em] text-secondary uppercase mb-8">Preferences</p>
        <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-primary leading-none uppercase tracking-tight mb-8">
          Settings
        </h1>
        <p className="text-xs font-bold tracking-[0.2em] text-secondary uppercase">
          Audio customization and global preferences.
        </p>
      </header>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-12 mb-32 pb-32 border-b border-border/30">
        <div className="shrink-0 p-4 bg-surface shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
          {renderAvatar(null, derivedName, null, "w-48 h-48 md:w-64 md:h-64 rounded-none grayscale opacity-80 hover:opacity-100 hover:grayscale-0 transition-all duration-500")}
        </div>

        <div className="text-center md:text-left flex-1 flex flex-col justify-center">
          <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-secondary mb-4 block">
            Listener Profile
          </label>
          <input
            type="text"
            defaultValue={derivedName}
            maxLength={40}
            onBlur={(e) => setDisplayName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            className="bg-transparent border-b-4 border-transparent focus:border-primary outline-none text-3xl md:text-5xl font-display font-bold text-primary tracking-tighter mb-8 pb-4 w-full md:max-w-2xl text-center md:text-left transition-all uppercase placeholder:text-border"
          />
          <p className="text-secondary font-bold text-xs flex items-center justify-center md:justify-start gap-3 uppercase tracking-[0.2em]">
            <FiShield size={18} />
            Local Device Storage Only
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-32">
        <section>
          <div className="flex items-center gap-6 mb-12 border-b border-border/30 pb-6">
            <FiWifi size={40} className="text-primary" />
            <h2 className="font-display font-bold text-3xl md:text-4xl text-primary uppercase">Streaming Bitrate</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {qualityOptions.map((option) => {
              const active = option.value === quality;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setQuality(option.value)}
                  className={`group flex items-start justify-between p-8 border-2 transition-all duration-300 ${
                    active
                      ? 'bg-primary border-primary text-background'
                      : 'bg-transparent border-border/30 text-primary hover:border-primary hover:bg-surface/10'
                  }`}
                >
                  <div className="text-left">
                    <p className={`font-display font-bold text-2xl tracking-tight uppercase mb-4 ${active ? 'text-background' : 'text-primary'}`}>
                      {option.label}
                    </p>
                    <p className={`text-xs font-bold uppercase tracking-[0.2em] ${active ? 'text-background/80' : 'text-secondary'}`}>
                      {option.helper}
                    </p>
                  </div>
                  <div
                    className={`w-8 h-8 flex items-center justify-center shrink-0 border-2 transition-colors duration-300 ${
                      active ? 'border-background bg-background text-primary' : 'border-border/50 group-hover:border-primary'
                    }`}
                  >
                    {active && <FiCheck size={20} className="stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-6 mb-12 border-b border-border/30 pb-6">
            <FiSliders size={40} className="text-primary" />
            <h2 className="font-display font-bold text-3xl md:text-4xl text-primary uppercase">Audio Control</h2>
          </div>
          
          <div className="flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 md:py-8 border-b border-border/30 hover:bg-surface/10 transition-colors px-4 -mx-4 group">
              <div className="flex flex-col gap-2">
                <p className="text-primary font-display font-bold text-xl md:text-2xl uppercase tracking-tight">Equalizer Profile</p>
                <p className="text-secondary text-xs font-bold tracking-[0.2em] mt-2 uppercase">Shape your sound</p>
              </div>
              <select
                value={eqPreset}
                onChange={(e) => setEqPreset(e.target.value)}
                className="bg-transparent border-2 border-border/50 hover:border-primary px-6 py-4 text-sm font-bold text-primary outline-none focus:border-primary cursor-pointer w-full md:w-auto min-w-[200px] uppercase tracking-[0.2em] transition-colors appearance-none"
              >
                <option value="flat">Studio Flat</option>
                <option value="bassBoost">Bass Boost</option>
                <option value="electronic">Electronic</option>
                <option value="vocal">Vocal Focus</option>
                <option value="pop">Pop</option>
                <option value="classical">Classical</option>
              </select>
            </div>

            <SettingRow
              icon={FiHeadphones}
              label="Autoplay"
              description="Continue playing similar tracks"
            >
              <Toggle active={autoplay} onToggle={toggleAutoplay} label="Autoplay" />
            </SettingRow>
            
            <SettingRow
              icon={FiSliders}
              label="Crossfade"
              description="Blend finishing tracks"
            >
              <Toggle active={crossfade} onToggle={toggleCrossfade} label="Crossfade" />
            </SettingRow>

            {crossfade && (
              <div className="py-6 md:py-8 px-4 -mx-4 border-b border-border/30 bg-surface/5 transition-colors">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] mb-8">
                  <span className="text-secondary">Crossfade Duration</span>
                  <span className="text-primary text-xl md:text-2xl font-display">{crossfadeDuration}s</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={crossfadeDuration}
                  onChange={(e) => setCrossfadeDuration(Number(e.target.value))}
                  className="w-full h-2 bg-border/30 appearance-none cursor-pointer accent-primary outline-none hover:bg-border/50 transition-colors"
                />
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-6 mb-12 border-b border-border/30 pb-6">
            <FiCommand size={40} className="text-primary" />
            <h2 className="font-display font-bold text-3xl md:text-4xl text-primary uppercase">Shortcuts</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
            {[
              { keys: ['Space'], action: 'Play / Pause' },
              { keys: ['⌘', 'K'], action: 'Command Palette' },
              { keys: ['←', '→'], action: 'Seek Track' },
              { keys: ['↑', '↓'], action: 'Volume' },
              { keys: ['M'], action: 'Mute' },
              { keys: ['N'], action: 'Next Track' },
              { keys: ['P'], action: 'Previous Track' },
              { keys: ['S'], action: 'Shuffle' },
              { keys: ['R'], action: 'Repeat Mode' },
              { keys: ['F'], action: 'Full-Screen' },
              { keys: ['Esc'], action: 'Close Modal' },
            ].map((shortcut, idx) => (
              <div key={idx} className="flex items-center justify-between py-6 border-b border-border/30 group hover:bg-surface/10 transition-colors px-4 -mx-4">
                <span className="text-sm font-bold tracking-[0.2em] uppercase text-secondary group-hover:text-primary transition-colors">{shortcut.action}</span>
                <div className="flex items-center gap-3">
                  {shortcut.keys.map((k, kIdx) => (
                    <kbd
                      key={kIdx}
                      className="px-4 py-2 text-sm font-bold bg-transparent border-2 border-border/50 text-primary uppercase min-w-[40px] text-center shadow-[4px_4px_0_rgba(255,255,255,0.1)]"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
