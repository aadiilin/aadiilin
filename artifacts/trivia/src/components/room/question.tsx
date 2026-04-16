import React, { useEffect, useState } from "react";
import { useWs } from "@/lib/ws-context";
import { sfx } from "@/lib/sfx";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const COLORS = [
  "bg-[hsl(330,100%,60%)] border-[hsl(330,100%,50%)] text-white shadow-[0_0_15px_rgba(255,0,128,0.5)]", // Pink
  "bg-[hsl(180,100%,50%)] border-[hsl(180,100%,40%)] text-[hsl(270,50%,8%)] shadow-[0_0_15px_rgba(0,255,255,0.5)]", // Cyan
  "bg-[hsl(60,100%,50%)] border-[hsl(60,100%,40%)] text-[hsl(270,50%,8%)] shadow-[0_0_15px_rgba(255,255,0,0.5)]", // Yellow
  "bg-[hsl(270,100%,65%)] border-[hsl(270,100%,55%)] text-white shadow-[0_0_15px_rgba(170,0,255,0.5)]" // Purple
];

export default function Question() {
  const { state, submitAnswer, nextQuestion } = useWs();
  const q = state.question;
  const isHost = state.role === "host";
  
  const [timeLeft, setTimeLeft] = useState(q?.seconds || 20);
  const [hasTicked, setHasTicked] = useState(new Set<number>());

  useEffect(() => {
    sfx.playQuestionAppear();
  }, [q?.index]);

  useEffect(() => {
    if (!q) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - q.questionStartedAt;
      const remaining = Math.max(0, q.seconds - elapsedMs / 1000);
      setTimeLeft(remaining);

      // Tick sounds in last 5 seconds
      const ceilRemain = Math.ceil(remaining);
      if (ceilRemain <= 5 && ceilRemain > 0 && !hasTicked.has(ceilRemain)) {
        sfx.playTick();
        setHasTicked(prev => new Set(prev).add(ceilRemain));
      }

      if (remaining === 0) {
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [q, hasTicked]);

  if (!q) return null;

  const progress = (timeLeft / q.seconds) * 100;
  const isUrgent = timeLeft <= 5;
  const answered = state.answerAck !== null;

  return (
    <div className="flex flex-col min-h-[100dvh] w-full">
      {/* Timer Bar */}
      <div className="h-3 w-full bg-muted/50 w-full fixed top-0 left-0 z-50">
        <motion.div 
          className={`h-full ${isUrgent ? 'bg-destructive' : 'bg-primary'}`}
          style={{ width: `${progress}%` }}
          layout
        />
      </div>

      <div className="flex flex-col items-center justify-center flex-grow p-6 pt-12 max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <span className="font-mono text-muted-foreground uppercase tracking-widest text-sm font-bold">
            Question {q.index + 1} of {q.total}
          </span>
          <motion.h2 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-black mt-4 leading-tight"
          >
            {q.text}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-auto mb-8">
          {q.choices.map((choice, idx) => (
            <motion.button
              key={idx}
              whileHover={!answered ? { scale: 1.02 } : {}}
              whileTap={!answered ? { scale: 0.95 } : {}}
              onClick={() => {
                if (!answered) submitAnswer(idx);
              }}
              disabled={answered}
              className={`
                relative w-full h-32 md:h-40 rounded-3xl border-b-8 text-2xl md:text-3xl font-bold font-display px-6 transition-all flex items-center justify-center text-center
                ${COLORS[idx]}
                ${answered && state.answerAck !== idx ? 'opacity-30 grayscale saturate-50' : ''}
                ${answered && state.answerAck === idx ? 'ring-4 ring-white ring-offset-4 ring-offset-background' : ''}
              `}
            >
              {choice}
            </motion.button>
          ))}
        </div>

        {answered && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-black text-center uppercase tracking-widest text-muted-foreground mt-4 mb-8"
          >
            Answer Locked In
          </motion.div>
        )}

        {isHost && (
          <div className="fixed bottom-6 right-6">
            <Button variant="outline" onClick={nextQuestion} className="font-mono bg-background/80 backdrop-blur border-2 border-border shadow-lg">
              Force Skip
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
