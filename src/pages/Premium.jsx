import React from 'react';
import { FiCheck, FiMusic, FiHeadphones } from 'react-icons/fi';

const Premium = () => {
  return (
    <div className="min-h-screen bg-background text-textPrimary pb-40 md:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Listen without limits.</h1>
          <p className="text-lg text-textSecondary">Try Melody Premium free for 1 month. Cancel anytime.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="bg-surface/30 border border-white/5 rounded-3xl p-8 hover:border-white/20 transition-all duration-300">
            <div className="mb-8">
              <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider mb-4">Free</span>
              <h2 className="text-3xl font-bold mb-2">Melody Free</h2>
              <p className="text-textSecondary">₹0.00 / month</p>
            </div>
            
            <ul className="space-y-4 mb-10">
              <li className="flex items-start gap-3">
                <FiCheck className="text-textSecondary mt-1 flex-shrink-0" size={18} />
                <span className="text-textSecondary">Access to millions of songs</span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheck className="text-textSecondary mt-1 flex-shrink-0" size={18} />
                <span className="text-textSecondary">Standard audio quality (128kbps)</span>
              </li>
              <li className="flex items-start gap-3 opacity-50">
                <FiCheck className="text-transparent mt-1 flex-shrink-0" size={18} />
                <span className="text-textSecondary line-through">Ad-free music listening</span>
              </li>
              <li className="flex items-start gap-3 opacity-50">
                <FiCheck className="text-transparent mt-1 flex-shrink-0" size={18} />
                <span className="text-textSecondary line-through">Highest audio quality (320kbps)</span>
              </li>
            </ul>

            <button className="w-full py-4 rounded-xl font-bold border border-white/20 hover:bg-white/5 transition-colors">
              Current Plan
            </button>
          </div>

          {/* Premium Tier */}
          <div className="bg-gradient-to-br from-surface to-surface/80 border border-primary/30 rounded-3xl p-8 relative overflow-hidden group hover:shadow-[0_0_50px_rgba(16,185,129,0.15)] transition-all duration-500">
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/30 transition-colors duration-500"></div>
            
            <div className="mb-8 relative z-10">
              <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-4 border border-primary/30">Premium</span>
              <h2 className="text-3xl font-bold mb-2">Melody Premium</h2>
              <p className="text-primary font-medium">₹99.00 / month</p>
            </div>
            
            <ul className="space-y-4 mb-10 relative z-10">
              <li className="flex items-start gap-3">
                <FiCheck className="text-primary mt-1 flex-shrink-0" size={18} />
                <span>Access to millions of songs</span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheck className="text-primary mt-1 flex-shrink-0" size={18} />
                <span><strong className="text-white">Ad-free</strong> music listening</span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheck className="text-primary mt-1 flex-shrink-0" size={18} />
                <span><strong className="text-white">Highest audio quality</strong> (320kbps)</span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheck className="text-primary mt-1 flex-shrink-0" size={18} />
                <span>Play songs in any order, with unlimited skips</span>
              </li>
            </ul>

            <button className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-primary to-secondary text-white hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_20px_rgba(16,185,129,0.4)] relative z-10">
              Get Premium
            </button>
            <p className="text-xs text-textSecondary text-center mt-4 relative z-10">Terms and conditions apply. 1 month free not available for users who have already tried Premium.</p>
          </div>
        </div>

        {/* Features grid */}
        <div className="mt-32">
          <h2 className="text-2xl font-bold text-center mb-12">Why upgrade to Premium?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-surface rounded-full flex items-center justify-center mb-6 shadow-lg shadow-black/20">
                <FiMusic size={40} className="text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Ad-free listening.</h3>
              <p className="text-textSecondary">Enjoy uninterrupted music.</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-surface rounded-full flex items-center justify-center mb-6 shadow-lg shadow-black/20">
                <FiHeadphones size={40} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">High quality audio.</h3>
              <p className="text-textSecondary">Experience 320kbps streams.</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-surface rounded-full flex items-center justify-center mb-6 shadow-lg shadow-black/20">
                <FiCheck size={40} className="text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Play any song.</h3>
              <p className="text-textSecondary">Even on mobile.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Premium;
