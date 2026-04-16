import React, { createContext, useContext, useEffect, useReducer, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

type Phase = "lobby" | "generating" | "question" | "reveal" | "final" | "idle";

interface Player {
  id: string;
  name: string;
  avatarId: number;
  score: number;
}

interface Result {
  playerId: string;
  answerIndex: number | null;
  correct: boolean;
  pointsAwarded: number;
  answerMs: number | null;
}

interface QuestionState {
  index: number;
  total: number;
  text: string;
  choices: [string, string, string, string];
  seconds: number;
  questionStartedAt: number;
  correctIndex?: number;
  results?: Result[];
}

interface GameState {
  connected: boolean;
  role: "host" | "player" | null;
  code: string | null;
  playerId: string | null;
  phase: Phase;
  topic: string;
  rounds: number;
  seconds: number;
  hostId: string | null;
  players: Player[];
  question: QuestionState | null;
  leaderboard: Player[];
  error: string | null;
  answerAck: number | null; // index of submitted answer
}

const initialState: GameState = {
  connected: false,
  role: null,
  code: null,
  playerId: null,
  phase: "idle",
  topic: "",
  rounds: 10,
  seconds: 20,
  hostId: null,
  players: [],
  question: null,
  leaderboard: [],
  error: null,
  answerAck: null,
};

type Action =
  | { type: "CONNECT" }
  | { type: "DISCONNECT" }
  | { type: "ERROR"; message: string }
  | { type: "CLEAR_ERROR" }
  | { type: "ROOM_CREATED"; code: string; playerId: string }
  | { type: "JOINED"; code: string; playerId: string; isHost: boolean }
  | { type: "LOBBY"; payload: any }
  | { type: "GENERATING" }
  | { type: "QUESTION"; payload: any }
  | { type: "SUBMIT_ANSWER"; index: number }
  | { type: "REVEAL"; payload: any }
  | { type: "FINAL"; payload: any }
  | { type: "RESET" };

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "CONNECT":
      return { ...state, connected: true, error: null };
    case "DISCONNECT":
      return { ...state, connected: false };
    case "ERROR":
      return { ...state, error: action.message };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "ROOM_CREATED":
      return {
        ...state,
        role: "host",
        code: action.code,
        playerId: action.playerId,
      };
    case "JOINED":
      return {
        ...state,
        role: action.isHost ? "host" : "player",
        code: action.code,
        playerId: action.playerId,
      };
    case "LOBBY":
      return {
        ...state,
        phase: "lobby",
        code: action.payload.code,
        topic: action.payload.topic,
        rounds: action.payload.rounds,
        seconds: action.payload.seconds,
        hostId: action.payload.hostId,
        players: action.payload.players,
      };
    case "GENERATING":
      return { ...state, phase: "generating" };
    case "QUESTION":
      return {
        ...state,
        phase: "question",
        question: {
          index: action.payload.index,
          total: action.payload.total,
          text: action.payload.text,
          choices: action.payload.choices,
          seconds: action.payload.seconds,
          questionStartedAt: action.payload.questionStartedAt,
        },
        answerAck: null,
      };
    case "SUBMIT_ANSWER":
      return { ...state, answerAck: action.index };
    case "REVEAL":
      return {
        ...state,
        phase: "reveal",
        question: state.question
          ? {
              ...state.question,
              correctIndex: action.payload.correctIndex,
              results: action.payload.results,
            }
          : null,
        leaderboard: action.payload.leaderboard,
        players: action.payload.leaderboard, // Update players list with new scores
      };
    case "FINAL":
      return {
        ...state,
        phase: "final",
        leaderboard: action.payload.leaderboard,
        players: action.payload.leaderboard,
      };
    case "RESET":
      return { ...initialState, connected: state.connected };
    default:
      return state;
  }
}

interface WsContextValue {
  state: GameState;
  createRoom: (topic: string, rounds: number, seconds: number) => void;
  joinRoom: (code: string, name: string, avatarId: number) => void;
  startGame: () => void;
  submitAnswer: (index: number) => void;
  nextQuestion: () => void;
  playAgain: () => void;
  clearError: () => void;
}

const WsContext = createContext<WsContextValue | null>(null);

export function WsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    // Construct the websocket URL based on BASE_URL
    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
    const wsUrl = `${proto}//${location.host}${baseUrl}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      dispatch({ type: "CONNECT" });
      const savedCode = sessionStorage.getItem("trivia_code");
      const savedPlayerId = sessionStorage.getItem("trivia_playerId");
      if (savedCode && savedPlayerId) {
        ws.send(JSON.stringify({ type: "rejoin", code: savedCode, playerId: savedPlayerId }));
      }
    };

    ws.onclose = () => {
      dispatch({ type: "DISCONNECT" });
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log("WS RECV:", msg);
        switch (msg.type) {
          case "roomCreated":
            sessionStorage.setItem("trivia_code", msg.code);
            sessionStorage.setItem("trivia_playerId", msg.playerId);
            sessionStorage.setItem("trivia_role", "host");
            dispatch({ type: "ROOM_CREATED", code: msg.code, playerId: msg.playerId });
            break;
          case "joined":
            sessionStorage.setItem("trivia_code", msg.code);
            sessionStorage.setItem("trivia_playerId", msg.playerId);
            sessionStorage.setItem("trivia_role", msg.isHost ? "host" : "player");
            dispatch({ type: "JOINED", code: msg.code, playerId: msg.playerId, isHost: msg.isHost });
            break;
          case "lobby":
            dispatch({ type: "LOBBY", payload: msg });
            break;
          case "generating":
            dispatch({ type: "GENERATING" });
            break;
          case "question":
            dispatch({ type: "QUESTION", payload: msg });
            break;
          case "reveal":
            dispatch({ type: "REVEAL", payload: msg });
            break;
          case "final":
            dispatch({ type: "FINAL", payload: msg });
            break;
          case "error":
            dispatch({ type: "ERROR", message: msg.message });
            toast({ title: "Error", description: msg.message, variant: "destructive" });
            break;
        }
      } catch (e) {
        console.error("Failed to parse message", e);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const send = (msg: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("WS SEND:", msg);
      wsRef.current.send(JSON.stringify(msg));
    }
  };

  const createRoom = (topic: string, rounds: number, seconds: number) => {
    send({ type: "createRoom", topic, rounds, seconds });
  };

  const joinRoom = (code: string, name: string, avatarId: number) => {
    send({ type: "joinRoom", code, name, avatarId });
  };

  const startGame = () => {
    send({ type: "startGame" });
  };

  const submitAnswer = (index: number) => {
    dispatch({ type: "SUBMIT_ANSWER", index });
    send({ type: "submitAnswer", index });
  };

  const nextQuestion = () => {
    send({ type: "nextQuestion" });
  };

  const playAgain = () => {
    send({ type: "playAgain" });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  return (
    <WsContext.Provider
      value={{
        state,
        createRoom,
        joinRoom,
        startGame,
        submitAnswer,
        nextQuestion,
        playAgain,
        clearError,
      }}
    >
      {children}
    </WsContext.Provider>
  );
}

export function useWs() {
  const ctx = useContext(WsContext);
  if (!ctx) throw new Error("useWs must be used within WsProvider");
  return ctx;
}
