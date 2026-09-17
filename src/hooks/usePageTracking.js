import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // In a real application, you would send this to your analytics provider here.
    // Example for Google Analytics:
    // if (window.gtag) {
    //   window.gtag('config', 'G-XXXXXXXXXX', { page_path: location.pathname + location.search });
    // }
    
    // Example for Vercel Analytics: (usually automatic if you import their script, but manual calls can be made)
    
    console.log(`[Analytics] Page viewed: ${location.pathname}${location.search}`);
  }, [location]);
};

export default usePageTracking;
