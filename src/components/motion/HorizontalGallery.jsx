import { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function HorizontalGallery({ items, renderItem }) {
  const containerRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setShowLeft(scrollLeft > 0);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [items]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('scroll', handleScroll);
    return () => {
      el.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollByAmount = (amount) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/gallery -mx-4 md:-mx-12">
      {showLeft && (
        <button
          onClick={() => scrollByAmount(-400)}
          className="absolute left-6 top-1/2 -translate-y-[120%] z-10 p-3 bg-surface/80 backdrop-blur-md text-primary hover:text-accent hover:bg-surface transition-all hidden md:block opacity-0 group-hover/gallery:opacity-100 border border-border/30 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.5)] active:scale-95"
          aria-label="Scroll left"
        >
          <FiChevronLeft size={24} />
        </button>
      )}

      <div 
        ref={containerRef}
        className="flex gap-4 md:gap-8 overflow-x-auto pb-12 pt-4 snap-x snap-mandatory scrollbar-hide px-4 md:px-12"
      >
        {items.map((item, index) => (
          <motion.div 
            key={item.id || index} 
            className="snap-start shrink-0"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </div>

      {showRight && (
        <button
          onClick={() => scrollByAmount(400)}
          className="absolute right-6 top-1/2 -translate-y-[120%] z-10 p-3 bg-surface/80 backdrop-blur-md text-primary hover:text-accent hover:bg-surface transition-all hidden md:block opacity-0 group-hover/gallery:opacity-100 border border-border/30 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.5)] active:scale-95"
          aria-label="Scroll right"
        >
          <FiChevronRight size={24} />
        </button>
      )}
    </div>
  );
}
