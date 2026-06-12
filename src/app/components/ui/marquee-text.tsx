import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface MarqueeTextProps {
  text: string;
  className?: string;
  speed?: number; // pixels per second
}

export function MarqueeText({ text, className = '', speed = 40 }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const isOver = textRef.current.scrollWidth > containerRef.current.clientWidth;
        setIsOverflowing(isOver);
        if (isOver) {
          setContentWidth(textRef.current.scrollWidth);
        }
      }
    };
    
    // Check immediately and after a short delay for font loading
    checkOverflow();
    const timeoutId = setTimeout(checkOverflow, 200);
    window.addEventListener('resize', checkOverflow);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkOverflow);
    }
  }, [text]);

  if (!isOverflowing) {
    return (
      <div ref={containerRef} className={`w-full overflow-hidden whitespace-nowrap text-ellipsis ${className}`}>
        <span ref={textRef} className="inline-block">
          {text}
        </span>
      </div>
    );
  }

  // Calculate the width of one segment + the padding (pr-8 is 2rem = 32px)
  const segmentWidth = contentWidth + 32;
  const duration = segmentWidth / speed;

  return (
    <div 
      ref={containerRef} 
      className={`w-full overflow-hidden whitespace-nowrap relative flex ${className}`}
      style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}
    >
      <motion.div
        className="flex shrink-0"
        animate={{ x: [0, -segmentWidth] }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: duration,
          ease: "linear",
        }}
      >
        <span className="pr-8">{text}</span>
        <span className="pr-8">{text}</span>
      </motion.div>
    </div>
  );
}
