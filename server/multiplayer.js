import { WebSocketServer, WebSocket } from "ws";

const PORT = Number(process.env.PORT || 3001);
const MAX_MESSAGE_BYTES = 2048;
const MIN_MESSAGE_INTERVAL_MS = 6;
const VALID_HEROES = new Set(["ryo", "kairo", "mei", "volt"]);
const rooms = new Map();
const wss = new WebSocketServer({
  host: "0.0.0.0",
  port: PORT,
  maxPayload: MAX_MESSAGE_BYTES,
  perMessageDeflate: false,
});

function send(socket, payload) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
}

function broadcast(room, payload, except) {
  for (const peer of room.players) {
    if (peer !== except) send(peer, payload);
  }
}

function safeStateMessage(msg, playerId) {
  if (!Number.isFinite(msg.x) || !Number.isFinite(msg.y)) return null;
  if (typeof msg.airborne !== "boolean" || !VALID_HEROES.has(msg.heroId)) return null;
  return {
    type: "state",
    x: Math.max(0, Math.min(960, msg.x)),
    y: Math.max(0, Math.min(540, msg.y)),
    facing: msg.facing < 0 ? -1 : 1,
    airborne: msg.airborne,
    moving: Boolean(msg.moving),
    heroId: msg.heroId,
    from: playerId,
  };
}

wss.on("connection", (socket) => {
  socket.roomCode = null;
  socket.playerId = null;
  socket.lastMessageAt = 0;

  socket.on("message", (raw) => {
    if (raw.length > MAX_MESSAGE_BYTES) return;

    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (!msg || typeof msg !== "object" || Array.isArray(msg)) return;

    if (msg.type === "join") {
      if (socket.roomCode) {
        send(socket, { type: "already-joined" });
        return;
      }
      const code = String(msg.room || "ZERO")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 12);
      if (code.length < 3) {
        send(socket, { type: "invalid-room" });
        return;
      }

      let room = rooms.get(code);
      if (!room) {
        room = { players: [] };
        rooms.set(code, room);
      }
      if (room.players.length >= 2) {
        send(socket, { type: "room-full" });
        return;
      }

      socket.roomCode = code;
      socket.playerId = room.players.length + 1;
      room.players.push(socket);
      send(socket, {
        type: "joined",
        playerId: socket.playerId,
        room: code,
        players: room.players.length,
      });
      broadcast(room, {
        type: "peer-joined",
        players: room.players.length,
        playerId: socket.playerId,
      }, socket);
      return;
    }

    const room = rooms.get(socket.roomCode);
    if (!room || !["state", "shot", "super", "hero", "ready", "stage"].includes(msg.type)) return;

    const now = Date.now();
    if (now - socket.lastMessageAt < MIN_MESSAGE_INTERVAL_MS) return;
    socket.lastMessageAt = now;

    if (msg.type === "state") {
      const state = safeStateMessage(msg, socket.playerId);
      if (state) broadcast(room, state, socket);
      return;
    }

    if (msg.type === "hero") {
      if (!VALID_HEROES.has(msg.heroId)) return;
      broadcast(room, { type: "hero", heroId: msg.heroId, from: socket.playerId }, socket);
      return;
    }

    // Other compact game events are forwarded only within the small payload
    // limit enforced above and by the WebSocket server.
    broadcast(room, { ...msg, from: socket.playerId }, socket);
  });

  socket.on("close", () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;
    room.players = room.players.filter((peer) => peer !== socket);
    broadcast(room, { type: "peer-left", players: room.players.length }, socket);
    if (!room.players.length) rooms.delete(socket.roomCode);
  });

  socket.on("error", () => {
    // A dropped mobile/Wi-Fi connection should not terminate the room server.
  });
});

wss.on("listening", () => {
  console.log(`ZERO GAME Wi-Fi room server listening on 0.0.0.0:${PORT}`);
});
wss.on("error", (error) => {
  console.error("ZERO GAME Wi-Fi room server error:", error.message);
});
