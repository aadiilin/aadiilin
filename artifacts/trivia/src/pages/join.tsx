import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useWs } from "@/lib/ws-context";
import { AVATARS } from "@/lib/avatars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Join() {
  const params = useParams();
  const roomCode = params.code || "";
  const [, setLocation] = useLocation();
  const { state, joinRoom } = useWs();
  
  const [name, setName] = useState("");
  const [avatarId, setAvatarId] = useState(AVATARS[0].id);

  useEffect(() => {
    if (state.role && state.code === roomCode) {
      setLocation(`/room/${state.code}`);
    }
  }, [state.role, state.code, roomCode, setLocation]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && roomCode) {
      joinRoom(roomCode, name.trim(), avatarId);
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
        <Card className="border-border bg-card/80 backdrop-blur border-2 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-center text-secondary uppercase tracking-widest">
              Join Room <span className="text-foreground">{roomCode}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-lg font-bold font-mono">
                  Your Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. TriviaMaster99"
                  className="text-lg h-14 bg-background/50 border-2 focus-visible:ring-secondary text-center font-bold"
                  maxLength={15}
                  autoFocus
                />
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-bold font-mono block text-center">Pick an Avatar</Label>
                <div className="grid grid-cols-4 gap-4">
                  {AVATARS.map((avatar) => {
                    const isSelected = avatar.id === avatarId;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setAvatarId(avatar.id)}
                        className={`relative aspect-square rounded-xl p-2 transition-all ${
                          isSelected
                            ? "bg-muted border-2 border-secondary scale-110 shadow-[0_0_15px_rgba(0,255,255,0.5)] z-10"
                            : "bg-background/50 border border-border hover:bg-muted/50"
                        }`}
                      >
                        {avatar.render({ className: "w-full h-full drop-shadow-md" })}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={!name.trim()}
                className="w-full text-xl h-16 font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground neo-shadow neo-shadow-hover active:neo-shadow-active transition-all mt-4"
              >
                LET'S GO!
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
