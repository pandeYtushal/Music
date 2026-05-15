import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDownload, FiArrowRight } from 'react-icons/fi';
import { useAuthStore } from '../store/useAuthStore';
import logo from '../assets/logo.png';

const Welcome = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    if (user) navigate('/');
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [user, navigate]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: '#080808' }}
    >
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.015) 0%, transparent 55%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.01) 0%, transparent 55%)',
        }}
      />

      <div className="relative z-10 w-full max-w-xs flex flex-col items-center text-center animate-fade-up">
        {/* Logo */}
        <div
          className="w-20 h-20 rounded-[22px] flex items-center justify-center mb-8 shadow-lift"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <img src={logo} alt="Melody" className="w-12 h-12 object-contain" />
        </div>

        <h1 className="text-5xl font-bold text-white tracking-tight mb-3">Melody</h1>
        <p className="text-white/35 text-base font-medium mb-12 max-w-[240px] mx-auto leading-relaxed">
          Experience sound in its purest form.
        </p>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleInstall}
            className="btn-primary w-full py-4 text-[15px] font-bold flex items-center justify-center gap-2.5"
          >
            <FiDownload size={18} />
            Install App
          </button>

          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 text-[15px] font-semibold text-white/70 hover:text-white flex items-center justify-center gap-2 transition-all hover:bg-white/[0.05] rounded-xl"
          >
            Continue in Browser <FiArrowRight size={17} />
          </button>
        </div>

        <p className="mt-14 text-[10px] font-bold uppercase tracking-[0.3em] text-white/15">
          Studio Grade Audio Quality
        </p>
      </div>
    </div>
  );
};

export default Welcome;
