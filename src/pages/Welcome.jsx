import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiDownload, FiArrowRight, FiZap, FiSmartphone, FiShield,
  FiSliders, FiClock, FiX, FiShare, FiMoreVertical,
  FiPlusCircle, FiCheckCircle, FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiHeart, FiRepeat, FiShuffle
} from 'react-icons/fi';

import { useAuthStore } from '../store/useAuthStore';
import logo from '../assets/logo-icon.png';

const Welcome = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [mockPlaying, setMockPlaying] = useState(true);
  const [mockFav, setMockFav] = useState(false);

  useEffect(() => {
    if (user) navigate('/');
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [user, navigate]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      setShowInstallModal(true);
    }
  };

  const featureCards = [
    {
      icon: FiZap,
      title: 'High Quality Audio',
      desc: 'Stream crystal-clear 320kbps audio, the highest quality available.',
    },
    {
      icon: FiSmartphone,
      title: 'Universal Sync',
      desc: 'Play, pause, or resume your music seamlessly from any device.',
    },
    {
      icon: FiShield,
      title: 'No Distractions',
      desc: 'Enjoy ad-free, high-fidelity playback with zero interruptions.',
    },
    {
      icon: FiSliders,
      title: 'Clean Interface',
      desc: 'A minimalist user interface focused entirely on the listening experience.',
    },
    {
      icon: FiClock,
      title: 'Sleep Timer',
      desc: 'Set custom timers to automatically pause playback as you drift off.',
    },
    {
      icon: FiCheckCircle,
      title: 'Offline Ready',
      desc: 'Save local caches of playlists for uninterrupted listening.',
    },
  ];

  return (
    <div
      className="min-h-[100dvh] w-full bg-background text-foreground relative overflow-hidden flex flex-col font-sans"
      style={{ backgroundImage: 'linear-gradient(180deg, rgba(249,115,22,0.05), rgba(0,0,0,0) 45%)' }}
    >
      {/* Background Gradients & Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-orange-500/[0.04] blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[650px] h-[650px] rounded-full bg-purple-600/[0.03] blur-[160px]" />
        <div className="absolute inset-0 opacity-[0.015] [background-image:linear-gradient(rgba(255,255,255,.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.3)_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      {/* Header Navigation */}
      <header className="relative z-20 w-full max-w-[1140px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}
          >
            <img src={logo} alt="Melody" className="w-5 h-5 object-contain" />
          </div>
          <span className="text-[16px] font-bold tracking-tight text-white">Melody</span>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="px-5 py-2 py-2.5 rounded-full bg-white text-black text-[13px] font-bold tracking-wide hover:bg-white/90 active:scale-95 transition-all shadow-md"
        >
          Sign In
        </button>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 w-full max-w-[1140px] mx-auto px-6 pt-6 md:pt-12 pb-24 flex flex-col gap-20">
        
        {/* Hero Section: Headline + Interactive Preview Card */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline and Actions */}
          <div className="flex flex-col items-start text-left max-w-xl">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[9px] font-extrabold uppercase tracking-widest mb-6">
              The Future of Audio
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-[68px] font-black text-white tracking-tight leading-[1.05] mb-6">
              Sound <br />
              <span className="font-serif italic text-orange-500 font-medium">worth</span> <br />
              feeling.
            </h1>

            <p className="text-white/40 text-sm md:text-[15px] font-medium leading-relaxed max-w-[420px] mb-10">
              Experience high-fidelity, ad-free music streaming in its purest form.
            </p>

            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3.5">
              <button
                onClick={handleInstall}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black text-[14px] font-bold flex items-center justify-center gap-2 transition-all hover:bg-white/95 active:scale-95 hover:shadow-[0_0_24px_rgba(255,255,255,0.15)]"
              >
                <FiDownload size={16} />
                Install App
              </button>

              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/[0.03] hover:bg-white/[0.06] text-[14px] font-bold text-white/80 border border-white/[0.08] flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                Continue in Browser
                <FiArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right Column: Beautiful Interactive Player Preview Card */}
          <div className="flex items-center justify-center lg:justify-end relative">
            {/* Glowing background behind card */}
            <div className="absolute w-72 h-72 rounded-full bg-orange-500/10 blur-[60px] -z-10" />
            
            <div
              className="w-full max-w-[340px] rounded-[32px] p-5 border border-white/[0.08] shadow-[0_30px_70px_rgba(0,0,0,0.6)] transition-all duration-500 hover:scale-[1.02] hover:border-white/[0.12]"
              style={{
                background: 'rgba(20,20,24,0.65)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
              }}
            >
              {/* Mock Album Art */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-4 shadow-lg border border-white/5 group">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 via-orange-500/20 to-black/40 mix-blend-overlay" />
                <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-orange-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/15 mb-3 group-hover:scale-105 transition-transform duration-300">
                    <FiPlay className="text-white/80 w-6 h-6" />
                  </div>
                  <p className="text-white/90 text-sm font-black tracking-tight">Fluid Dreams</p>
                  <p className="text-white/40 text-[11px] font-semibold mt-0.5">Aether & Melody</p>
                </div>
                
                {/* Simulated Spec Tag */}
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-[9px] font-black text-orange-400 uppercase tracking-wider">
                  FLAC HD
                </span>
              </div>

              {/* Track Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-left">
                  <h3 className="text-white font-extrabold text-[15px] tracking-tight">Fluid Dreams</h3>
                  <p className="text-white/40 text-[12px] font-semibold mt-0.5">Aether & Melody</p>
                </div>
                <button
                  onClick={() => setMockFav(!mockFav)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all ${mockFav ? 'text-red-500' : 'text-white/30 hover:text-white'}`}
                >
                  <FiHeart size={16} className={mockFav ? 'fill-current' : ''} />
                </button>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1.5 mb-4">
                <div className="w-full h-1 bg-white/[0.08] rounded-full overflow-hidden relative">
                  <div className="h-full bg-white rounded-full" style={{ width: '42%' }} />
                </div>
                <div className="flex items-center justify-between text-[9px] font-bold text-white/25">
                  <span>1:28</span>
                  <span>3:30</span>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-between px-1">
                <button className="text-white/20 hover:text-white transition-colors"><FiShuffle size={14} /></button>
                <div className="flex items-center gap-4">
                  <button className="text-white/50 hover:text-white transition-colors"><FiSkipBack size={16} /></button>
                  <button
                    onClick={() => setMockPlaying(!mockPlaying)}
                    className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    {mockPlaying ? <FiPause size={16} className="fill-current" /> : <FiPlay size={16} className="fill-current ml-0.5" />}
                  </button>
                  <button className="text-white/50 hover:text-white transition-colors"><FiSkipForward size={16} /></button>
                </div>
                <button className="text-white/20 hover:text-white transition-colors"><FiRepeat size={14} /></button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid Section - Now full width with spacious columns */}
        <section className="border-t border-white/[0.06] pt-16 flex flex-col gap-10">
          <div className="text-center md:text-left">
            <p className="section-overline">Discover</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Built for <span className="font-serif italic text-orange-500 font-medium">real</span> listeners.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featureCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="group flex flex-col items-start p-6 rounded-2.5xl backdrop-blur-3xl bg-white/[0.015] border border-white/[0.04] shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:bg-white/[0.035] hover:border-white/10 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center mb-4 transition-colors group-hover:bg-orange-500/20">
                    <Icon size={18} className="text-orange-400" />
                  </div>
                  <h3 className="text-[16px] font-bold text-white tracking-tight mb-2 group-hover:text-orange-400 transition-colors duration-300">
                    {card.title}
                  </h3>
                  <p className="text-white/35 text-[13px] font-medium leading-relaxed text-left">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Elegant Install Instructions PWA Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#111116]/95 border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Background glowing gradients */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">Install Melody</h2>
              <button
                onClick={() => setShowInstallModal(false)}
                className="text-white/45 hover:text-white/90 p-2 hover:bg-white/5 rounded-full transition-all active:scale-90"
              >
                <FiX size={20} />
              </button>
            </div>

            <p className="text-white/50 text-[13px] md:text-sm font-medium mb-6 relative z-10 leading-relaxed">
              Experience the best of Melody as a premium standalone app on your home screen or desktop. Follow the quick guide for your device:
            </p>

            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 relative z-10 scrollbar-thin">
              {/* iOS instructions */}
              <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex gap-4 hover:bg-white/[0.04] transition-all">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <FiShare size={18} className="text-orange-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-[14px] font-bold text-white mb-1">iPhone & iPad (Safari)</h3>
                  <p className="text-white/40 text-[12px] font-medium leading-relaxed">
                    Tap the <strong className="text-white/60">Share</strong> button in Safari, scroll down, and select <strong className="text-white/60">Add to Home Screen</strong>.
                  </p>
                </div>
              </div>

              {/* Android instructions */}
              <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex gap-4 hover:bg-white/[0.04] transition-all">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <FiMoreVertical size={18} className="text-orange-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-[14px] font-bold text-white mb-1">Android (Chrome)</h3>
                  <p className="text-white/40 text-[12px] font-medium leading-relaxed">
                    Tap the <strong className="text-white/60">Menu (3 dots)</strong> in the top-right, and select <strong className="text-white/60">Install app</strong> or <strong className="text-white/60">Add to Home screen</strong>.
                  </p>
                </div>
              </div>

              {/* Desktop instructions */}
              <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex gap-4 hover:bg-white/[0.04] transition-all">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <FiPlusCircle size={18} className="text-orange-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-[14px] font-bold text-white mb-1">Desktop (Chrome, Edge, Brave)</h3>
                  <p className="text-white/40 text-[12px] font-medium leading-relaxed">
                    Look for the <strong className="text-white/60">Install icon</strong> (a circle with a plus or a download arrow) inside the browser's address bar next to the bookmark star.
                  </p>
                </div>
              </div>

              {/* Already Installed / Standalone info */}
              <div className="p-4 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <FiCheckCircle size={18} className="text-purple-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-[14px] font-bold text-purple-400 mb-1">Already Installed?</h3>
                  <p className="text-white/35 text-[12px] font-medium leading-relaxed">
                    If you already installed Melody, search your apps list or desktop for the "Melody" icon to launch it as a premium native app.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 relative z-10 flex justify-end">
              <button
                onClick={() => setShowInstallModal(false)}
                className="px-6 py-3 rounded-full bg-white text-black text-[13px] font-bold hover:bg-white/90 active:scale-95 transition-all shadow-md"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Welcome;
