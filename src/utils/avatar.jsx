import React from 'react';
import { FiMusic, FiHeadphones, FiSliders, FiZap, FiVolume2 } from 'react-icons/fi';

/**
 * Renders a premium high-fidelity avatar component supporting custom gradients, Google URLs, and beautiful fallback initials.
 */
export const renderAvatar = (photoURL, displayName, email, sizeClass = "w-10 h-10") => {
  const name = displayName || email || 'User';
  
  // Custom premium gradients matching musical styles
  if (photoURL === 'avatar-sunset') {
    return (
      <div className={`${sizeClass} rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-md`} style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e, #eab308)' }}>
        <FiMusic className="text-white" size={16} />
      </div>
    );
  }
  if (photoURL === 'avatar-cyber') {
    return (
      <div className={`${sizeClass} rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-md`} style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
        <FiHeadphones className="text-white" size={16} />
      </div>
    );
  }
  if (photoURL === 'avatar-ambient') {
    return (
      <div className={`${sizeClass} rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-md`} style={{ background: 'linear-gradient(135deg, #8b5cf6, #4c1d95)' }}>
        <FiSliders className="text-white" size={16} />
      </div>
    );
  }
  if (photoURL === 'avatar-golden') {
    return (
      <div className={`${sizeClass} rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-md`} style={{ background: 'linear-gradient(135deg, #fcd34d, #f97316, #d97706)' }}>
        <FiZap className="text-white" size={16} />
      </div>
    );
  }
  if (photoURL === 'avatar-neon') {
    return (
      <div className={`${sizeClass} rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-md`} style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}>
        <FiVolume2 className="text-white" size={16} />
      </div>
    );
  }

  // Google OAuth URL or other valid image URL
  if (photoURL && photoURL.startsWith('http')) {
    return (
      <img src={photoURL} alt="" className={`${sizeClass} rounded-xl object-cover border border-white/10`} />
    );
  }

  // Fallback: A beautiful premium dark gradient with bold initials
  const initials = name.substring(0, 2).toUpperCase();
  return (
    <div className={`${sizeClass} rounded-xl flex items-center justify-center shrink-0 border border-white/10 font-bold text-xs text-white tracking-wider`} style={{ background: 'linear-gradient(135deg, #1f1c2c, #0b0a10)' }}>
      {initials}
    </div>
  );
};
