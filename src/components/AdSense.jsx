import React, { useEffect, useRef } from 'react';

const AdSense = ({ adSlot, adFormat = 'auto', fullWidthResponsive = true, className = "" }) => {
  const adRef = useRef(null);
  const adPushed = useRef(false);

  useEffect(() => {
    if (!adRef.current || adPushed.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && entry.boundingClientRect.width > 0 && !adPushed.current) {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            adPushed.current = true;
            observer.disconnect();
          } catch (e) {
            console.error("AdSense error:", e);
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(adRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      className={`adsense-container w-full min-h-[90px] overflow-hidden my-4 flex items-center justify-center ${className}`} 
      ref={adRef}
    >
      <ins
        className="adsbygoogle w-full"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8724734366896266"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
};

export default AdSense;
