"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";

export function SiteLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] bg-background flex items-center justify-center"
    >
      <div className="text-center">
        {/* Animated logo with stacked layers effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
          className="relative mb-8 flex justify-center"
        >
          {/* Stacked layers background effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-32 h-32 bg-foreground/20 rounded-full blur-2xl"
            ></motion.div>
            <motion.div
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
              className="absolute w-28 h-28 bg-foreground/30 rounded-full blur-xl"
            ></motion.div>
          </div>
          
          <div className="relative z-10">
            {mounted && (
              <motion.div
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Image
                  src={theme === "dark" 
                    ? "/crewdeck/svgs/logo-standalones/crewdeck-white-logo.svg"
                    : "/crewdeck/svgs/logo-standalones/crewdeck-black-logo.svg"
                  }
                  alt="crewdeck"
                  width={120}
                  height={120}
                  className="h-24 w-24 sm:h-28 sm:w-28"
                  priority
                />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
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
      </div>
    </motion.div>
  );
}
