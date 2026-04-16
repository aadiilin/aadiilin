import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [code, setCode] = useState("");

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      setLocation(`/join/${code.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
        className="z-10"
      >
        <h1 className="text-6xl md:text-8xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-br from-primary via-secondary to-accent filter drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
          TRIVIA
          <br />
          BLITZ
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-mono mb-12 uppercase tracking-widest">
          High-voltage knowledge
        </p>

        <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
          <Button
            size="lg"
            className="w-full text-xl h-16 font-bold bg-primary hover:bg-primary/90 text-primary-foreground neo-shadow neo-shadow-hover active:neo-shadow-active transition-all"
            onClick={() => setLocation("/host/new")}
          >
            HOST A GAME
          </Button>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-muted"></div>
            <span className="flex-shrink-0 mx-4 text-muted-foreground font-mono text-sm">OR</span>
            <div className="flex-grow border-t border-muted"></div>
          </div>

          <Card className="border-border bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <form onSubmit={handleJoin} className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roomCode" className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                    Room Code
                  </Label>
                  <Input
                    id="roomCode"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ABCD"
                    className="text-center text-3xl h-16 font-mono font-bold tracking-[0.2em] bg-background/50 border-2 focus-visible:ring-accent"
                    maxLength={4}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={!code.trim()}
                  className="w-full text-lg h-14 font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground neo-shadow neo-shadow-hover active:neo-shadow-active transition-all"
                >
                  JOIN GAME
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
