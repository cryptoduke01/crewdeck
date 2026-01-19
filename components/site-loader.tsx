"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function SiteLoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide loader quickly - minimum 800ms for animation, but hide as soon as page is ready
    const minDisplayTime = 800;
    const startTime = Date.now();

    const hideLoader = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);
      
      setTimeout(() => {
        setIsVisible(false);
      }, remaining);
    };

    // Hide when DOM is ready
    if (document.readyState === 'complete') {
      hideLoader();
    } else {
      window.addEventListener('load', hideLoader);
      return () => {
        window.removeEventListener('load', hideLoader);
      };
    }
  }, []);

  if (!isVisible) return null;

  const letters = "crewdeck".split("");

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] bg-background flex items-center justify-center"
    >
      <div className="text-center">
        {/* Animated crewdeck text */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 20, rotateX: -90 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                rotateX: 0,
              }}
              transition={{
                delay: index * 0.05,
                duration: 0.4,
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className="text-5xl sm:text-6xl md:text-7xl font-semibold text-foreground inline-block"
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </div>

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 rounded-full bg-foreground/60"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Subtle loading bar */}
        <motion.div
          className="mt-8 w-48 h-0.5 bg-foreground/10 mx-auto overflow-hidden rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full bg-foreground/40"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
