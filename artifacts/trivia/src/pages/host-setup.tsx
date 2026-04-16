import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useWs } from "@/lib/ws-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function HostSetup() {
  const [, setLocation] = useLocation();
  const { state, createRoom } = useWs();
  const [topic, setTopic] = useState("");
  const [rounds, setRounds] = useState(10);
  const [seconds, setSeconds] = useState(20);

  useEffect(() => {
    if (state.role === "host" && state.code) {
      setLocation(`/room/${state.code}`);
    }
  }, [state.role, state.code, setLocation]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      createRoom(topic.trim(), rounds, seconds);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-grid-pattern relative">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-0"></div>
      
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-border bg-card/80 backdrop-blur border-2 shadow-[0_0_30px_rgba(255,0,128,0.2)]">
          <CardHeader>
            <CardTitle className="text-3xl font-black text-center text-primary uppercase tracking-widest">
              Setup Game
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="topic" className="text-lg font-bold font-mono">
                  Topic
                </Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. 90s Pop Culture, Space, Taylor Swift"
                  className="text-lg h-14 bg-background/50 border-2 focus-visible:ring-primary"
                  autoFocus
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label className="text-lg font-bold font-mono">Rounds</Label>
                  <span className="font-mono text-primary font-bold">{rounds}</span>
                </div>
                <Slider
                  value={[rounds]}
                  onValueChange={(v) => setRounds(v[0])}
                  min={5}
                  max={15}
                  step={1}
                  className="py-4"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label className="text-lg font-bold font-mono">Seconds per Question</Label>
                  <span className="font-mono text-secondary font-bold">{seconds}s</span>
                </div>
                <Slider
                  value={[seconds]}
                  onValueChange={(v) => setSeconds(v[0])}
                  min={10}
                  max={30}
                  step={5}
                  className="py-4"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={!topic.trim()}
                className="w-full text-xl h-16 font-bold bg-primary hover:bg-primary/90 text-primary-foreground neo-shadow neo-shadow-hover active:neo-shadow-active transition-all mt-4"
              >
                CREATE ROOM
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
