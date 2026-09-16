import { useRef } from 'react';
import { motion, } from 'motion/react';

export default function HorizontalGallery({ items, renderItem }) {
  const containerRef = useRef(null);
  
  return (
    <div 
      ref={containerRef}
      className="flex gap-4 md:gap-8 overflow-x-auto pb-12 pt-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:-mx-12 md:px-12"
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
  );
}
