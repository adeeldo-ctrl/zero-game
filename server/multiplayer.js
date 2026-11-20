import { WebSocketServer, WebSocket } from "ws";

const PORT = Number(process.env.PORT || 3001);
const wss = new WebSocketServer({ host: "0.0.0.0", port: PORT });
const rooms = new Map();

function send(socket, payload) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
}
function broadcast(room, payload, except) {
  for (const peer of room.players) if (peer !== except) send(peer, payload);
}

wss.on("connection", socket => {
  socket.roomCode = null;
  socket.playerId = Math.random().toString(36).slice(2, 9);
  socket.on("message", raw => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    if (msg.type === "join") {
      const code = String(msg.room || "DASTAAN").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
      let room = rooms.get(code);
      if (!room) { room = { players: [] }; rooms.set(code, room); }
      if (room.players.length >= 2) { send(socket, { type: "room-full" }); return; }
      socket.roomCode = code;
      room.players.push(socket);
      socket.playerId = room.players.length;
      send(socket, { type: "joined", playerId: socket.playerId, room: code, players: room.players.length });
      broadcast(room, { type: "peer-joined", players: room.players.length, playerId: socket.playerId }, socket);
      return;
    }
    const room = rooms.get(socket.roomCode);
    if (!room || !["state", "shot", "super", "hero", "ready", "stage"].includes(msg.type)) return;
    broadcast(room, { ...msg, from: socket.playerId }, socket);
  });
  socket.on("close", () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;
    room.players = room.players.filter(peer => peer !== socket);
    broadcast(room, { type: "peer-left", players: room.players.length });
    if (!room.players.length) rooms.delete(socket.roomCode);
  });
});
wss.on("listening", () => console.log(`Dastaan Heroes Wi-Fi room server listening on 0.0.0.0:${PORT}`));
