const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const rooms = {};

function getRoom(roomId) {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      users: {},
      canvasElements: [],
      code: { content: "// Start coding together...\n", language: "javascript" },
      messages: [],
    };
  }
  return rooms[roomId];
}

io.on("connection", (socket) => {
  let currentRoom = null;
  let currentUser = null;

  socket.on("join-room", ({ roomId, user }) => {
    currentRoom = roomId;
    currentUser = { ...user, socketId: socket.id };
    socket.join(roomId);

    const room = getRoom(roomId);
    room.users[socket.id] = currentUser;

    socket.emit("room-state", {
      canvasElements: room.canvasElements,
      code: room.code,
      messages: room.messages,
      users: Object.values(room.users),
    });

    socket.to(roomId).emit("user-joined", currentUser);
    io.to(roomId).emit("room-users", Object.values(room.users));
    console.log(`[${roomId}] ${user.name} joined`);
  });

  socket.on("canvas-elements", (elements) => {
    if (!currentRoom) return;
    rooms[currentRoom].canvasElements = elements;
    socket.to(currentRoom).emit("canvas-elements", elements);
  });

  socket.on("canvas-clear", () => {
    if (!currentRoom) return;
    rooms[currentRoom].canvasElements = [];
    io.to(currentRoom).emit("canvas-clear");
  });

  socket.on("code-change", ({ content, language }) => {
    if (!currentRoom) return;
    rooms[currentRoom].code = { content, language };
    socket.to(currentRoom).emit("code-update", { content, language });
  });

  socket.on("cursor-move", ({ x, y }) => {
    if (!currentRoom || !currentUser) return;
    socket.to(currentRoom).emit("cursor-update", {
      socketId: socket.id,
      name: currentUser.name,
      color: currentUser.color,
      x,
      y,
    });
  });

  socket.on("send-message", (msg) => {
    if (!currentRoom) return;
    const fullMsg = { ...msg, id: Date.now().toString() };
    rooms[currentRoom].messages.push(fullMsg);
    if (rooms[currentRoom].messages.length > 200) {
      rooms[currentRoom].messages = rooms[currentRoom].messages.slice(-200);
    }
    io.to(currentRoom).emit("receive-message", fullMsg);
  });

  socket.on("disconnect", () => {
    if (!currentRoom) return;
    const room = rooms[currentRoom];
    if (!room) return;
    delete room.users[socket.id];
    io.to(currentRoom).emit("user-left", socket.id);
    io.to(currentRoom).emit("room-users", Object.values(room.users));
    if (Object.keys(room.users).length === 0) {
      setTimeout(() => {
        if (rooms[currentRoom] && Object.keys(rooms[currentRoom].users).length === 0) {
          delete rooms[currentRoom];
          console.log(`[${currentRoom}] Room closed (empty)`);
        }
      }, 300000);
    }
    console.log(`[${currentRoom}] ${currentUser?.name || socket.id} left`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Canvas2Code server running on :${PORT}`));
