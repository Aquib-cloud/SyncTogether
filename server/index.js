import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const rooms = {};

io.on("connection", (socket) => {
  socket.on("join", (roomId) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = { playing: false, time: 0 };
    }
    socket.emit("state", rooms[roomId]);
  });

  socket.on("play", ({ roomId, time }) => {
    rooms[roomId] = { playing: true, time };
    socket.to(roomId).emit("play", time);
  });

  socket.on("pause", ({ roomId, time }) => {
    rooms[roomId] = { playing: false, time };
    socket.to(roomId).emit("pause", time);
  });

  socket.on("seek", ({ roomId, time }) => {
    rooms[roomId].time = time;
    socket.to(roomId).emit("seek", time);
  });
});

server.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});