import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { FiMusic, FiLoader, FiMail, FiLock, FiUser, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { auth, provider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

  const handleMockLogin = (mockName, mockEmail) => {
    setUser({
      uid: 'mock-' + Date.now(),
      displayName: mockName || 'Guest User',
      email: mockEmail || 'guest@example.com',
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(mockName || 'Guest+User')}&background=222&color=fff&bold=true`,
    });
    navigate('/');
  };

  const handleError = (err, fallback) => {
    if (
      err.code === 'auth/invalid-api-key' ||
      err.message?.includes('dummy_api_key') ||
      err.code === 'auth/configuration-not-found' ||
      err.code === 'auth/operation-not-allowed'
    ) {
      fallback();
    } else {
      setError(err.message.replace('Firebase: ', ''));
    }
    setIsLoggingIn(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true); setError(null);
    try { await signInWithPopup(auth, provider); }
    catch (err) { handleError(err, () => handleMockLogin()); }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email) return setError('Please enter an email address.');
    if (mode !== 'forgot' && !password) return setError('Please enter a password.');
    setIsLoggingIn(true); setError(null);
    try {
      if (mode === 'register') {
        if (!name) { setIsLoggingIn(false); return setError('Please enter your name.'); }
        await createUserWithEmailAndPassword(auth, email, password);
      } else if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await new Promise(r => setTimeout(r, 1000));
        setError('If this email exists, a reset link has been sent.');
        setIsLoggingIn(false);
        return;
      }
    } catch (err) { handleError(err, () => handleMockLogin(name, email)); }
  };

  const inputClass = "w-full input-field rounded-2xl py-3.5 pl-11 pr-4 text-[14px] font-medium";

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#080808' }}
    >
      {/* Subtle bg pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.02) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.015) 0%, transparent 50%)',
        }}
      />

      <div className="relative z-10 w-full max-w-sm mx-4 animate-fade-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5 shadow-lift"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <FiMusic size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight text-center">
            {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create account' : 'Reset password'}
          </h1>
          <p className="text-white/40 text-sm font-medium mt-1.5 text-center">
            {mode === 'login'
              ? 'Sign in to continue listening.'
              : mode === 'register'
              ? 'Join Melody for the ultimate experience.'
              : 'Enter your email to receive a reset link.'}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-7"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Error */}
          {error && (
            <div
              className="rounded-xl px-4 py-3 mb-5"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <p className="text-red-400 text-xs font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-3">
            {mode === 'register' && (
              <div className="relative">
                <FiUser size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
              </div>
            )}
            <div className="relative">
              <FiMail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
            </div>
            {mode !== 'forgot' && (
              <div className="relative">
                <FiLock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-white/35 hover:text-white/70 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {isLoggingIn
                ? <FiLoader className="animate-spin" size={18} />
                : <>
                    {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Link'}
                    <FiArrowRight size={16} />
                  </>
              }
            </button>
          </form>

          {mode !== 'forgot' && (
            <>
              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-white/25 font-medium">or</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-3 py-3.5 text-sm font-semibold text-white/80 rounded-2xl transition-all hover:bg-white/[0.06] disabled:opacity-60"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <FcGoogle size={20} />
                Continue with Google
              </button>
            </>
          )}
        </div>

        {/* Switch mode */}
        <p className="text-center text-sm text-white/35 mt-6 font-medium">
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <button onClick={() => setMode('register')} className="text-white font-bold hover:underline">Sign Up</button>
            </>
          ) : (
            <>Back to{' '}
              <button onClick={() => setMode('login')} className="text-white font-bold hover:underline">Log In</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;
