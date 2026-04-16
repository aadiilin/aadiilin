import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "node:http";
import { customAlphabet } from "nanoid";
import { logger } from "./lib/logger";
import { generateQuestions, type TriviaQuestion } from "./questions";

const makeCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 4);
const makeId = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  16,
);

type Phase = "lobby" | "generating" | "question" | "reveal" | "final";

interface Player {
  id: string;
  name: string;
  avatarId: number;
  score: number;
  socket: WebSocket | null;
}

interface RoundResult {
  playerId: string;
  answerIndex: number | null;
  correct: boolean;
  pointsAwarded: number;
  answerMs: number | null;
}

interface Room {
  code: string;
  hostId: string;
  topic: string;
  rounds: number;
  seconds: number;
  players: Map<string, Player>;
  phase: Phase;
  questions: TriviaQuestion[];
  currentIndex: number;
  questionStartedAt: number;
  answers: Map<string, { index: number; answerMs: number }>;
  lastResults: RoundResult[];
  advanceTimer: NodeJS.Timeout | null;
  createdAt: number;
}

const rooms = new Map<string, Room>();

function publicPlayers(room: Room) {
  return [...room.players.values()].map((p) => ({
    id: p.id,
    name: p.name,
    avatarId: p.avatarId,
    score: p.score,
  }));
}

function leaderboard(room: Room) {
  return publicPlayers(room).sort((a, b) => b.score - a.score);
}

function send(socket: WebSocket | null, msg: unknown) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  try {
    socket.send(JSON.stringify(msg));
  } catch (err) {
    logger.warn({ err }, "send failed");
  }
}

function broadcast(room: Room, msg: unknown) {
  for (const p of room.players.values()) send(p.socket, msg);
}

function sendLobby(room: Room) {
  broadcast(room, {
    type: "lobby",
    code: room.code,
    topic: room.topic,
    rounds: room.rounds,
    seconds: room.seconds,
    hostId: room.hostId,
    phase: room.phase,
    players: publicPlayers(room),
  });
}

function sendError(socket: WebSocket, message: string) {
  send(socket, { type: "error", message });
}

function clearAdvance(room: Room) {
  if (room.advanceTimer) {
    clearTimeout(room.advanceTimer);
    room.advanceTimer = null;
  }
}

function startQuestion(room: Room) {
  clearAdvance(room);
  const q = room.questions[room.currentIndex];
  if (!q) {
    finishGame(room);
    return;
  }
  room.phase = "question";
  room.answers = new Map();
  room.questionStartedAt = Date.now();
  broadcast(room, {
    type: "question",
    index: room.currentIndex,
    total: room.questions.length,
    text: q.text,
    choices: q.choices,
    seconds: room.seconds,
    questionStartedAt: room.questionStartedAt,
  });

  // Auto-reveal when time runs out
  room.advanceTimer = setTimeout(
    () => revealQuestion(room),
    room.seconds * 1000 + 500,
  );
}

function revealQuestion(room: Room) {
  clearAdvance(room);
  if (room.phase !== "question") return;
  const q = room.questions[room.currentIndex];
  if (!q) return;
  room.phase = "reveal";

  const results: RoundResult[] = [];
  for (const p of room.players.values()) {
    const a = room.answers.get(p.id);
    if (!a) {
      results.push({
        playerId: p.id,
        answerIndex: null,
        correct: false,
        pointsAwarded: 0,
        answerMs: null,
      });
      continue;
    }
    const correct = a.index === q.correctIndex;
    let pts = 0;
    if (correct) {
      // Speed bonus: 500 base + up to 500 depending on how fast.
      const frac = Math.max(
        0,
        Math.min(1, 1 - a.answerMs / (room.seconds * 1000)),
      );
      pts = 500 + Math.round(500 * frac);
      p.score += pts;
    }
    results.push({
      playerId: p.id,
      answerIndex: a.index,
      correct,
      pointsAwarded: pts,
      answerMs: a.answerMs,
    });
  }
  room.lastResults = results;

  broadcast(room, {
    type: "reveal",
    index: room.currentIndex,
    correctIndex: q.correctIndex,
    results,
    leaderboard: leaderboard(room),
  });
}

function nextQuestion(room: Room) {
  if (room.phase !== "reveal") return;
  room.currentIndex += 1;
  if (room.currentIndex >= room.questions.length) {
    finishGame(room);
    return;
  }
  startQuestion(room);
}

function finishGame(room: Room) {
  clearAdvance(room);
  room.phase = "final";
  broadcast(room, {
    type: "final",
    leaderboard: leaderboard(room),
  });
}

async function startGame(room: Room) {
  if (room.phase !== "lobby") return;
  room.phase = "generating";
  broadcast(room, { type: "generating" });
  try {
    const qs = await generateQuestions(room.topic, room.rounds);
    if (qs.length === 0) throw new Error("no questions");
    room.questions = qs;
    room.currentIndex = 0;
    for (const p of room.players.values()) p.score = 0;
    startQuestion(room);
  } catch (err) {
    logger.error({ err, code: room.code }, "Question generation failed");
    room.phase = "lobby";
    broadcast(room, {
      type: "error",
      message:
        "Could not generate questions for that topic. Try a different topic and start again.",
    });
    sendLobby(room);
  }
}

function playAgain(room: Room) {
  clearAdvance(room);
  room.phase = "lobby";
  room.questions = [];
  room.currentIndex = 0;
  room.answers = new Map();
  room.lastResults = [];
  for (const p of room.players.values()) p.score = 0;
  sendLobby(room);
}

function cleanupRoom(room: Room) {
  clearAdvance(room);
  rooms.delete(room.code);
}

// Periodic cleanup of stale rooms (no connections for 30 min)
setInterval(
  () => {
    const now = Date.now();
    for (const room of rooms.values()) {
      const hasLive = [...room.players.values()].some(
        (p) => p.socket && p.socket.readyState === WebSocket.OPEN,
      );
      if (!hasLive && now - room.createdAt > 30 * 60 * 1000) {
        cleanupRoom(room);
      }
    }
  },
  5 * 60 * 1000,
);

interface SocketState {
  roomCode: string | null;
  playerId: string | null;
}

export function attachWebsocket(server: import("node:http").Server): void {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req: IncomingMessage, socket, head) => {
    const url = req.url ?? "";
    if (!url.startsWith("/ws")) {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (ws: WebSocket) => {
    const state: SocketState = { roomCode: null, playerId: null };

    ws.on("message", (raw) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        sendError(ws, "Invalid JSON");
        return;
      }
      const type = msg["type"];
      try {
        handleMessage(ws, state, type, msg);
      } catch (err) {
        logger.error({ err }, "Error handling message");
        sendError(ws, "Server error");
      }
    });

    ws.on("close", () => {
      if (!state.roomCode || !state.playerId) return;
      const room = rooms.get(state.roomCode);
      if (!room) return;
      const player = room.players.get(state.playerId);
      if (!player) return;
      player.socket = null;
      // If host disconnects during lobby and no one else is there, clean up.
      if (
        room.phase === "lobby" &&
        [...room.players.values()].every(
          (p) => !p.socket || p.socket.readyState !== WebSocket.OPEN,
        )
      ) {
        // Keep for short reconnect window; cleanup interval handles old rooms.
      }
      sendLobby(room);
    });
  });
}

function handleMessage(
  ws: WebSocket,
  state: SocketState,
  type: unknown,
  msg: Record<string, unknown>,
) {
  switch (type) {
    case "createRoom": {
      const topic = String(msg["topic"] ?? "").trim();
      const rounds = clamp(Number(msg["rounds"] ?? 8), 3, 15);
      const seconds = clamp(Number(msg["seconds"] ?? 20), 8, 45);
      const name = String(msg["name"] ?? "Host").slice(0, 24) || "Host";
      const avatarId = clamp(Number(msg["avatarId"] ?? 0), 0, 20);
      if (!topic) return sendError(ws, "Topic is required");

      let code = makeCode();
      while (rooms.has(code)) code = makeCode();
      const hostId = makeId();

      const room: Room = {
        code,
        hostId,
        topic,
        rounds,
        seconds,
        players: new Map(),
        phase: "lobby",
        questions: [],
        currentIndex: 0,
        questionStartedAt: 0,
        answers: new Map(),
        lastResults: [],
        advanceTimer: null,
        createdAt: Date.now(),
      };
      room.players.set(hostId, {
        id: hostId,
        name,
        avatarId,
        score: 0,
        socket: ws,
      });
      rooms.set(code, room);

      state.roomCode = code;
      state.playerId = hostId;

      send(ws, {
        type: "roomCreated",
        code,
        playerId: hostId,
        isHost: true,
      });
      sendLobby(room);
      return;
    }

    case "joinRoom": {
      const code = String(msg["code"] ?? "")
        .trim()
        .toUpperCase();
      const name = String(msg["name"] ?? "").trim().slice(0, 24);
      const avatarId = clamp(Number(msg["avatarId"] ?? 0), 0, 20);
      if (!name) return sendError(ws, "Name is required");

      const room = rooms.get(code);
      if (!room) return sendError(ws, "Room not found");
      if (room.players.size >= 32)
        return sendError(ws, "Room is full");
      if (room.phase !== "lobby")
        return sendError(ws, "Game already in progress");

      const playerId = makeId();
      room.players.set(playerId, {
        id: playerId,
        name,
        avatarId,
        score: 0,
        socket: ws,
      });
      state.roomCode = code;
      state.playerId = playerId;

      send(ws, {
        type: "joined",
        code,
        playerId,
        isHost: false,
      });
      sendLobby(room);
      return;
    }

    case "rejoin": {
      const code = String(msg["code"] ?? "")
        .trim()
        .toUpperCase();
      const playerId = String(msg["playerId"] ?? "");
      const room = rooms.get(code);
      if (!room) return sendError(ws, "Room not found");
      const player = room.players.get(playerId);
      if (!player) return sendError(ws, "Player not found in room");
      player.socket = ws;
      state.roomCode = code;
      state.playerId = playerId;
      send(ws, {
        type: "rejoined",
        code,
        playerId,
        isHost: playerId === room.hostId,
      });
      // Replay current state
      sendLobby(room);
      if (room.phase === "question") {
        const q = room.questions[room.currentIndex];
        if (q) {
          send(ws, {
            type: "question",
            index: room.currentIndex,
            total: room.questions.length,
            text: q.text,
            choices: q.choices,
            seconds: room.seconds,
            questionStartedAt: room.questionStartedAt,
          });
        }
      } else if (room.phase === "reveal") {
        const q = room.questions[room.currentIndex];
        if (q) {
          send(ws, {
            type: "reveal",
            index: room.currentIndex,
            correctIndex: q.correctIndex,
            results: room.lastResults,
            leaderboard: leaderboard(room),
          });
        }
      } else if (room.phase === "final") {
        send(ws, { type: "final", leaderboard: leaderboard(room) });
      } else if (room.phase === "generating") {
        send(ws, { type: "generating" });
      }
      return;
    }

    case "startGame": {
      const room = requireHostRoom(ws, state);
      if (!room) return;
      if (room.players.size < 1)
        return sendError(ws, "Need at least 1 player");
      void startGame(room);
      return;
    }

    case "submitAnswer": {
      if (!state.roomCode || !state.playerId) return;
      const room = rooms.get(state.roomCode);
      if (!room || room.phase !== "question") return;
      if (room.answers.has(state.playerId)) return; // no changes
      const index = Number(msg["index"]);
      if (!Number.isInteger(index) || index < 0 || index > 3) return;
      const answerMs = Math.max(0, Date.now() - room.questionStartedAt);
      if (answerMs > room.seconds * 1000 + 500) return;
      room.answers.set(state.playerId, { index, answerMs });

      // Tell the answerer that their answer is locked in (so UI can reflect).
      const player = room.players.get(state.playerId);
      send(player?.socket ?? null, {
        type: "answerAck",
        index,
      });

      // Notify room that someone answered (for count displays).
      broadcast(room, {
        type: "answerProgress",
        answered: room.answers.size,
        total: room.players.size,
      });

      // Auto-reveal early if everyone answered.
      if (room.answers.size >= room.players.size) {
        revealQuestion(room);
      }
      return;
    }

    case "nextQuestion": {
      const room = requireHostRoom(ws, state);
      if (!room) return;
      nextQuestion(room);
      return;
    }

    case "revealNow": {
      const room = requireHostRoom(ws, state);
      if (!room) return;
      if (room.phase === "question") revealQuestion(room);
      return;
    }

    case "playAgain": {
      const room = requireHostRoom(ws, state);
      if (!room) return;
      playAgain(room);
      return;
    }

    case "leaveRoom": {
      if (!state.roomCode || !state.playerId) return;
      const room = rooms.get(state.roomCode);
      if (!room) return;
      room.players.delete(state.playerId);
      state.roomCode = null;
      state.playerId = null;
      if (room.players.size === 0) cleanupRoom(room);
      else sendLobby(room);
      return;
    }

    default:
      sendError(ws, `Unknown message type: ${String(type)}`);
  }
}

function requireHostRoom(ws: WebSocket, state: SocketState): Room | null {
  if (!state.roomCode || !state.playerId) {
    sendError(ws, "Not in a room");
    return null;
  }
  const room = rooms.get(state.roomCode);
  if (!room) {
    sendError(ws, "Room not found");
    return null;
  }
  if (room.hostId !== state.playerId) {
    sendError(ws, "Only the host can do that");
    return null;
  }
  return room;
}

function clamp(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, Math.round(n)));
}
