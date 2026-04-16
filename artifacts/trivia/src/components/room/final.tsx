import React, { useEffect, useRef } from "react";
import { useWs } from "@/lib/ws-context";
import { getAvatar } from "@/lib/avatars";
import { Button } from "@/components/ui/button";
import { sfx } from "@/lib/sfx";
import { motion } from "framer-motion";
import { Trophy, Crown, Play } from "lucide-react";

export default function Final() {
  const { state, playAgain } = useWs();
  const isHost = state.role === "host";
  const winner = state.leaderboard[0];
  const me = state.leaderboard.find((p) => p.id === state.playerId);
  const myRank = state.leaderboard.findIndex((p) => p.id === state.playerId) + 1;

  useEffect(() => {
    sfx.playFanfare();
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh] w-full p-6 max-w-4xl mx-auto overflow-hidden relative">
      {/* Decorative background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-secondary/20 blur-[100px] rounded-full" />
      </div>

      <div className="flex-grow flex flex-col items-center justify-center z-10 py-12">
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.6, duration: 1 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-4 bg-accent/20 text-accent rounded-full mb-6 ring-4 ring-accent/50 shadow-[0_0_50px_rgba(255,255,0,0.4)]">
            <Crown className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-mono text-muted-foreground uppercase tracking-[0.3em] mb-2">
            The Champion
          </h2>
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-primary drop-shadow-xl mb-6">
            {winner?.name}
          </h1>
          
          {winner && (
            <div className="w-48 h-48 mx-auto drop-shadow-2xl animate-bounce" style={{ animationDuration: '3s' }}>
              {getAvatar(winner.avatarId).render({ className: "w-full h-full" })}
            </div>
          )}
          
          <div className="text-4xl font-mono font-bold text-accent mt-6">
            {winner?.score} <span className="text-xl text-muted-foreground">PTS</span>
          </div>
        </motion.div>

        {/* You specific message */}
        {me && myRank > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12 text-center bg-card/80 backdrop-blur border border-border px-6 py-4 rounded-2xl"
          >
            <p className="text-lg font-bold">You finished <span className="text-secondary">#{myRank}</span> with {me.score} pts.</p>
            <p className="text-muted-foreground text-sm mt-1">Better luck next time!</p>
          </motion.div>
        )}

        <div className="w-full max-w-2xl bg-card/50 backdrop-blur border-2 border-border rounded-3xl p-6">
          <h3 className="text-lg font-mono text-muted-foreground uppercase tracking-[0.2em] mb-6 text-center">Final Leaderboard</h3>
          <div className="flex flex-col gap-2">
            {state.leaderboard.map((p, idx) => {
              if (idx === 0) return null; // Skip winner, handled above
              const isMe = p.id === state.playerId;
              const avatar = getAvatar(p.avatarId);
              
              return (
                <div key={p.id} className={`flex items-center gap-4 p-3 rounded-xl ${isMe ? 'bg-secondary/10 border border-secondary/50' : ''}`}>
                  <div className="font-mono font-bold text-muted-foreground w-6">{idx + 1}</div>
                  <div className="w-8 h-8 shrink-0">{avatar.render({ className: "w-full h-full" })}</div>
                  <div className="flex-grow font-bold truncate {isMe ? 'text-secondary' : ''}">{p.name}</div>
                  <div className="font-mono font-bold">{p.score}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isHost && (
        <div className="w-full max-w-md mx-auto mt-auto pb-8 z-10">
          <Button
            size="lg"
            onClick={playAgain}
            className="w-full text-xl h-16 font-bold bg-primary hover:bg-primary/90 text-primary-foreground neo-shadow neo-shadow-hover active:neo-shadow-active transition-all"
          >
            <Play className="w-6 h-6 mr-2" /> PLAY AGAIN
          </Button>
        </div>
      )}
    </div>
  );
}
