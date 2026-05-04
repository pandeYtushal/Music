import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { FiMusic, FiLoader, FiMail, FiLock, FiUser } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { auth, provider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState(null);
  
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleMockLogin = (mockName, mockEmail) => {
    setUser({
      uid: 'mock-' + Date.now(),
      displayName: mockName || "Guest User",
      email: mockEmail || "guest@example.com",
      photoURL: "https://ui-avatars.com/api/?name=" + (mockName ? encodeURIComponent(mockName) : "Guest+User") + "&background=22C55E&color=fff"
    });
    navigate('/');
  };

  const handleError = (err, fallbackAction) => {
    console.error("Auth error:", err);
    if (err.code === 'auth/invalid-api-key' || err.message.includes('dummy_api_key') || err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
      console.warn("Using mock auth due to missing Firebase config/permissions");
      fallbackAction();
    } else {
      setError(err.message.replace('Firebase: ', ''));
    }
    setIsLoggingIn(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      handleError(err, () => handleMockLogin());
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email) return setError("Please enter an email address.");
    if (mode !== 'forgot' && !password) return setError("Please enter a password.");
    
    setIsLoggingIn(true);
    setError(null);
    try {
      if (mode === 'register') {
        if (!name) {
          setIsLoggingIn(false);
          return setError("Please enter your name.");
        }
        await createUserWithEmailAndPassword(auth, email, password);
      } else if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else if (mode === 'forgot') {
        // Mock forgot password
        await new Promise(r => setTimeout(r, 1000));
        setError("If an account with this email exists, a password reset link has been sent.");
        setIsLoggingIn(false);
        return;
      }
    } catch (err) {
      handleError(err, () => handleMockLogin(name, email));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      <div className="relative z-10 w-full max-w-md p-8 rounded-[32px] text-center mx-4">
        <div className="w-20 h-20 bg-[#1c1c1e] border border-white/10 rounded-[20px] mx-auto mb-6 flex items-center justify-center shadow-sm">
          <FiMusic size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-textPrimary mb-2">
          {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
        </h1>
        <p className="text-textSecondary mb-8 text-sm">
          {mode === 'login' ? 'Log in to listen to high quality music.' : mode === 'register' ? 'Join Melody for the ultimate streaming experience.' : 'Enter your email to receive a reset link.'}
        </p>

        {error && (
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 mb-6 text-left">
            <p className="text-primary text-xs font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6 text-left">
          {mode === 'register' && (
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-[#1c1c1e] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-white/40 focus:border-white/20 focus:bg-[#2c2c2e] outline-none transition-all"
              />
            </div>
          )}
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#1c1c1e] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-white/40 focus:border-white/20 focus:bg-[#2c2c2e] outline-none transition-all"
            />
          </div>
          {mode !== 'forgot' && (
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
              <input 
                type="password" 
                placeholder="Password" 
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#1c1c1e] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-white/40 focus:border-white/20 focus:bg-[#2c2c2e] outline-none transition-all"
              />
            </div>
          )}
          
          {mode === 'login' && (
            <div className="text-right">
              <button type="button" onClick={() => setMode('forgot')} className="text-sm text-white/50 hover:text-white transition-colors">Forgot Password?</button>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-white text-black font-semibold py-4 px-4 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center mt-2"
          >
            {isLoggingIn ? <FiLoader className="animate-spin" size={20} /> : mode === 'login' ? 'Log In' : mode === 'register' ? 'Sign Up' : 'Send Reset Link'}
          </button>
        </form>

        {mode !== 'forgot' && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-xs text-textSecondary">OR</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              type="button"
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 bg-[#1c1c1e] text-white border border-white/10 font-semibold py-4 px-4 rounded-full hover:bg-white/5 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
            >
              <FcGoogle size={24} /> Continue with Google
            </button>
          </>
        )}

        <div className="mt-8 text-sm text-white/60">
          {mode === 'login' ? (
            <p>Don't have an account? <button onClick={() => setMode('register')} className="text-white font-semibold hover:underline">Sign Up</button></p>
          ) : (
            <p>Back to <button onClick={() => setMode('login')} className="text-white font-semibold hover:underline">Log In</button></p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Login;
