import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/sfx";

export default function Generating() {
  useEffect(() => {
    // Play a little loading sound
    const interval = setInterval(() => {
      sfx.playTick();
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        animate={{ 
          rotate: [0, 5, -5, 0],
          scale: [1, 1.05, 0.95, 1] 
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2,
          ease: "easeInOut" 
        }}
        className="text-8xl mb-8 filter drop-shadow-[0_0_20px_rgba(0,255,255,0.6)]"
      >
        <svg viewBox="0 0 100 100" className="w-32 h-32 text-secondary fill-current inline-block">
           <path d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z" />
        </svg>
      </motion.div>
      <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4 uppercase tracking-wider">
        Cooking up questions...
      </h2>
      <p className="text-xl text-muted-foreground font-mono">
        AI is generating the ultimate trivia pack.
      </p>
    </div>
  );
}
