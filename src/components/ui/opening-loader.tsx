'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function OpeningLoader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsExiting(true), 500);
          return 100;
        }
        return prev + 1;
      });
    }, 25);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            y: "-100%",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Subtle atmospheric background for loader */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="mb-12 overflow-hidden"
            >
              <h1 className="font-title font-extrabold text-5xl md:text-8xl tracking-tighter text-foreground flex items-baseline gap-2">
                ADIL<span className="text-primary italic">.S</span>
              </h1>
            </motion.div>

            <div className="w-64 md:w-80 h-[2px] bg-white/5 relative overflow-hidden rounded-full mb-4">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear" }}
              />
            </div>
            
            <div className="flex justify-between w-64 md:w-80 font-title font-bold text-[10px] tracking-[0.3em] uppercase text-muted-foreground/60">
              <span>Initializing</span>
              <span className="text-primary">{progress}%</span>
            </div>
          </div>

          {/* Intense flash on finish */}
          {progress === 100 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-white/5 pointer-events-none"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
