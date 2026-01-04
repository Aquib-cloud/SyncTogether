console.log("SERVER FILE EXECUTED");

import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// serve frontend build
app.use(express.static(path.join(__dirname, "../client/dist")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

const rooms = {};

io.on("connection", (socket) => {
  socket.on("action", ({ roomId, device, type, time }) => {
    let msg = `${device} ${type}`;
    if (type === "seeked") {
      msg += ` to ${time}s`;
    }
    io.to(roomId).emit("action", msg);
  });
  socket.on("join", ({ roomId, device }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.device = device;

    if (!rooms[roomId]) {
      rooms[roomId] = {
        state: { playing: false, time: 0 },
        users: []
      };
    }

    rooms[roomId].users.push(device);

    io.to(roomId).emit("users", rooms[roomId].users);
    socket.emit("state", rooms[roomId].state);
  });

  socket.on("disconnect", () => {
    const { roomId, device } = socket;
    if (!roomId || !rooms[roomId]) return;

    rooms[roomId].users =
      rooms[roomId].users.filter(u => u !== device);

    io.to(roomId).emit("users", rooms[roomId].users);
  });

  socket.on("play", ({ roomId, time }) => {
    rooms[roomId].state = { playing: true, time };
    socket.to(roomId).emit("play", time);
  });

  socket.on("pause", ({ roomId, time }) => {
    rooms[roomId].state = { playing: false, time };
    socket.to(roomId).emit("pause", time);
  });

  socket.on("seek", ({ roomId, time }) => {
    rooms[roomId].state.time = time;
    socket.to(roomId).emit("seek", time);
  });
});
const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Sync-Watch server running on port ${PORT}`);
});