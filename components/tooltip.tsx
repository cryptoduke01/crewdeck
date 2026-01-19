"use client";

import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 px-2 py-1 text-xs font-medium text-background bg-foreground rounded shadow-lg pointer-events-none whitespace-nowrap ${positionClasses[position]}`}
          >
            {content}
            <div
              className={`absolute w-2 h-2 bg-foreground rotate-45 ${
                position === "top" ? "top-full left-1/2 -translate-x-1/2 -translate-y-1/2" :
                position === "bottom" ? "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2" :
                position === "left" ? "left-full top-1/2 -translate-y-1/2 -translate-x-1/2" :
                "right-full top-1/2 -translate-y-1/2 translate-x-1/2"
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
