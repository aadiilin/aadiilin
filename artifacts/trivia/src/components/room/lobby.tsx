import React from "react";
import { useWs } from "@/lib/ws-context";
import { getAvatar } from "@/lib/avatars";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Users } from "lucide-react";

export default function Lobby() {
  const { state, startGame } = useWs();
  const { toast } = useToast();

  const isHost = state.role === "host";
  const canStart = state.players.length > 0; // Requires at least 1 player (host can play too, or just players)

  const shareUrl = `${window.location.origin}${import.meta.env.BASE_URL}join/${state.code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Copied!",
      description: "Share link copied to clipboard.",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 max-w-4xl mx-auto w-full">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full bg-card/50 backdrop-blur border-2 border-border rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(255,0,128,0.15)] mb-8"
      >
        <h2 className="text-lg font-mono text-muted-foreground uppercase tracking-[0.2em] mb-2">Room Code</h2>
        <div className="text-7xl md:text-9xl font-black text-primary tracking-widest drop-shadow-[0_0_15px_rgba(255,0,128,0.5)] mb-6">
          {state.code}
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-muted-foreground font-mono">
          <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full border border-border">
            <span className="text-primary font-bold">{state.topic}</span>
          </div>
          <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full border border-border">
            <span>{state.rounds} Rounds</span>
          </div>
        </div>
      </motion.div>

      <div className="w-full flex-grow flex flex-col">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-xl font-bold font-mono flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            Players ({state.players.length})
          </h3>
          <Button variant="outline" size="sm" onClick={copyLink} className="font-mono text-xs border-dashed">
            <Copy className="w-4 h-4 mr-2" /> COPY LINK
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <AnimatePresence>
            {state.players.map((p) => {
              const avatar = getAvatar(p.avatarId);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="bg-card border-2 border-border rounded-2xl p-4 flex flex-col items-center gap-3 relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-10" style={{ backgroundColor: avatar.color }}></div>
                  <div className="w-16 h-16 drop-shadow-lg z-10">
                    {avatar.render({ className: "w-full h-full" })}
                  </div>
                  <span className="font-bold text-lg truncate w-full text-center z-10">{p.name}</span>
                  {p.id === state.hostId && (
                    <span className="absolute top-2 right-2 text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">
                      HOST
                    </span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          {state.players.length === 0 && (
            <div className="col-span-2 md:col-span-4 text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-2xl font-mono">
              Waiting for players to join...
            </div>
          )}
        </div>

        {isHost && (
          <div className="mt-auto pb-8">
            <Button
              size="lg"
              disabled={!canStart}
              onClick={startGame}
              className="w-full text-2xl h-20 font-black tracking-wider bg-accent hover:bg-accent/90 text-accent-foreground neo-shadow neo-shadow-hover active:neo-shadow-active transition-all uppercase"
            >
              START GAME
            </Button>
          </div>
        )}
        {!isHost && (
          <div className="mt-auto pb-8 text-center text-muted-foreground font-mono text-lg animate-pulse">
            Waiting for host to start...
          </div>
        )}
      </div>
    </div>
  );
}
