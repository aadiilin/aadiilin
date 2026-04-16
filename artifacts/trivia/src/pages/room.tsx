import React, { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useWs } from "@/lib/ws-context";

import Lobby from "@/components/room/lobby";
import Generating from "@/components/room/generating";
import Question from "@/components/room/question";
import Reveal from "@/components/room/reveal";
import Final from "@/components/room/final";
import { Button } from "@/components/ui/button";

export default function Room() {
  const params = useParams();
  const roomCode = params.code || "";
  const [, setLocation] = useLocation();
  const { state } = useWs();

  // If we are disconnected or don't have a role, we should probably be joining
  // But wait a moment for reconnect to happen via the WS provider first.
  useEffect(() => {
    // If after a small delay we have no role and aren't in idle (connecting), 
    // kick to join page. We use sessionStorage to auto-rejoin in WsProvider.
    if (!state.role && state.connected && state.phase === "idle") {
      setLocation(`/join/${roomCode}`);
    }
  }, [state.role, state.connected, state.phase, roomCode, setLocation]);

  if (!state.connected || state.phase === "idle") {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-secondary font-mono animate-pulse">CONNECTING...</div>
      </div>
    );
  }

  // Route based on phase
  switch (state.phase) {
    case "lobby":
      return <Lobby />;
    case "generating":
      return <Generating />;
    case "question":
      return <Question />;
    case "reveal":
      return <Reveal />;
    case "final":
      return <Final />;
    default:
      return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center">
          <h1 className="text-2xl text-destructive font-bold mb-4">Unknown State</h1>
          <pre className="bg-card p-4 rounded text-xs">{JSON.stringify(state, null, 2)}</pre>
          <Button onClick={() => setLocation("/")} className="mt-8">Home</Button>
        </div>
      );
  }
}
