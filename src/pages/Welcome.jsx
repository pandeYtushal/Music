import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMusic, FiDownload, FiArrowRight } from 'react-icons/fi';
import { useAuthStore } from '../store/useAuthStore';

const Welcome = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // If already logged in, navigate to home
    if (user) {
      navigate('/');
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [user, navigate]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('Install prompt is not available right now. You can also install the app via your browser menu (e.g., "Add to Home Screen").');
    }
  };

  const handleContinue = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black p-6">
      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
        {/* App Logo */}
        <div className="w-24 h-24 bg-[#1c1c1e] border border-white/10 rounded-[24px] mx-auto mb-8 flex items-center justify-center shadow-sm">
          <FiMusic size={48} className="text-white" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
          Melody
        </h1>
        <p className="text-white/60 text-[17px] mb-12 max-w-[280px] mx-auto leading-relaxed font-medium">
          Your premium music streaming experience. Listen to high quality audio anywhere.
        </p>

        <div className="w-full flex flex-col gap-3">
          <button 
            onClick={handleInstall}
            className="w-full bg-white text-black font-semibold py-4 px-6 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-[17px]"
          >
            <FiDownload size={20} /> Install App
          </button>

          <button 
            onClick={handleContinue}
            className="w-full bg-transparent text-white/60 font-semibold py-4 px-6 rounded-full hover:bg-white/5 active:bg-white/10 transition-all flex items-center justify-center gap-2 text-[17px]"
          >
            Continue in Browser <FiArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
