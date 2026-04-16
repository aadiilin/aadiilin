import React, { useEffect } from "react";
import { useWs } from "@/lib/ws-context";
import { getAvatar } from "@/lib/avatars";
import { Button } from "@/components/ui/button";
import { sfx } from "@/lib/sfx";
import { motion } from "framer-motion";
import { Trophy, X } from "lucide-react";

export default function Reveal() {
  const { state, nextQuestion } = useWs();
  const q = state.question;
  const isHost = state.role === "host";

  useEffect(() => {
    if (q?.results) {
      const myResult = q.results.find(r => r.playerId === state.playerId);
      if (myResult) {
        if (myResult.correct) sfx.playCorrect();
        else sfx.playWrong();
      }
    }
  }, [q, state.playerId]);

  if (!q || q.correctIndex === undefined || !q.results) return null;

  const isLastQuestion = q.index === q.total - 1;

  // Map choices to UI
  return (
    <div className="flex flex-col min-h-[100dvh] w-full p-6 max-w-5xl mx-auto overflow-x-hidden">
      
      <div className="text-center mb-8 pt-4">
        <h2 className="text-2xl md:text-3xl font-black mb-4 opacity-80">{q.text}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-12">
        {q.choices.map((choice, idx) => {
          const isCorrect = idx === q.correctIndex;
          const isMyAnswer = state.answerAck === idx;
          
          return (
            <motion.div
              key={idx}
              layout
              className={`
                relative w-full p-6 rounded-3xl border-4 text-xl md:text-2xl font-bold font-display flex items-center justify-between
                ${isCorrect ? 'bg-primary/20 border-primary text-primary shadow-[0_0_30px_rgba(255,0,128,0.3)]' : 'bg-muted/30 border-muted text-muted-foreground opacity-50'}
                ${isMyAnswer && !isCorrect ? 'border-destructive/50 !opacity-100 bg-destructive/10' : ''}
              `}
            >
              <span>{choice}</span>
              {isCorrect && <Trophy className="w-8 h-8 text-primary" />}
              {isMyAnswer && !isCorrect && <X className="w-8 h-8 text-destructive" />}
            </motion.div>
          );
        })}
      </div>

      <div className="w-full max-w-2xl mx-auto flex-grow flex flex-col">
        <h3 className="text-lg font-mono text-muted-foreground uppercase tracking-[0.2em] mb-4 text-center">Standings</h3>
        
        <div className="flex flex-col gap-3">
          {state.leaderboard.map((p, idx) => {
            const avatar = getAvatar(p.avatarId);
            const result = q.results?.find(r => r.playerId === p.id);
            const pointsGained = result?.pointsAwarded || 0;
            const isMe = p.id === state.playerId;

            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 30 }}
                className={`
                  flex items-center gap-4 p-4 rounded-2xl border-2 
                  ${isMe ? 'bg-card border-secondary/50 shadow-md' : 'bg-card/50 border-border'}
                `}
              >
                <div className="font-mono text-xl font-bold w-6 text-muted-foreground">{idx + 1}</div>
                <div className="w-12 h-12 shrink-0 drop-shadow-md">
                  {avatar.render({ className: "w-full h-full" })}
                </div>
                <div className="flex-grow font-bold text-xl truncate">{p.name}</div>
                
                <div className="flex flex-col items-end">
                  <div className="font-mono text-2xl font-black">{p.score}</div>
                  {pointsGained > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-primary font-bold text-sm"
                    >
                      +{pointsGained}
                    </motion.div>
                  )}
                  {result && !result.correct && result.answerIndex !== null && (
                    <div className="text-destructive font-bold text-sm">Wrong</div>
                  )}
                  {result && result.answerIndex === null && (
                    <div className="text-muted-foreground font-bold text-sm">Too slow</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {isHost && (
        <div className="fixed bottom-0 left-0 w-full p-6 bg-background/80 backdrop-blur border-t border-border flex justify-center z-50">
          <Button 
            size="lg" 
            onClick={nextQuestion}
            className="w-full max-w-md text-xl h-16 font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground neo-shadow neo-shadow-hover active:neo-shadow-active transition-all uppercase tracking-wider"
          >
            {isLastQuestion ? "See Final Results" : "Next Question"}
          </Button>
        </div>
      )}
      {!isHost && (
        <div className="fixed bottom-0 left-0 w-full p-6 bg-background/80 backdrop-blur border-t border-border flex justify-center z-50">
           <div className="text-muted-foreground font-mono uppercase tracking-widest animate-pulse">
             Waiting for host...
           </div>
        </div>
      )}
      <div className="h-24 w-full shrink-0" /> {/* Spacer for fixed footer */}
    </div>
  );
}
