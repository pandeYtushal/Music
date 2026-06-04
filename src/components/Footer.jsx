import { useNavigate, useLocation } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show this global footer on welcome, login, privacy, and terms pages 
  // as they either have their own or don't need it.
  const hiddenPaths = ['/welcome', '/login', '/privacy', '/terms'];
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <footer className="w-full p-6 mt-auto border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-center md:justify-between text-center md:text-left text-[11px] font-bold tracking-wider text-white/30 uppercase gap-5 z-10 pb-6">
      <span>&copy; {new Date().getFullYear()} MeldMusic Audio Corp.</span>
      <div className="flex gap-4">
        <button onClick={() => navigate('/privacy')} className="text-white/60 hover:text-white hover:underline transition-all">Privacy Policy</button>
        <button onClick={() => navigate('/terms')} className="text-white/60 hover:text-white hover:underline transition-all">Terms of Service</button>
      </div>
      <span>320kbps &middot; High Fidelity &middot; Ad-Free</span>
    </footer>
  );
};

export default Footer;
