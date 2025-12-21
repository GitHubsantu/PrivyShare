// server/server.js
// Created by DevOps
// GitHub: https://github.com/githubsantu

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "P2P Signaling Server",
    activeRooms: rooms.size,
    timestamp: new Date().toISOString()
  });
});

// Get room info (for debugging)
app.get("/rooms", (req, res) => {
  const roomInfo = Array.from(rooms.entries()).map(([roomId, users]) => ({
    roomId,
    userCount: users.length,
    users: users
  }));
  res.json({ rooms: roomInfo });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Store room connections and metadata
const rooms = new Map();

// Helper function to clean up a room
function cleanupRoom(roomId) {
  const room = rooms.get(roomId);
  if (room && room.length === 0) {
    rooms.delete(roomId);
    console.log(`🧹 Cleaned up empty room: ${roomId}`);
    return true;
  }
  return false;
}

// Helper function to remove user from room
function removeUserFromRoom(socketId, roomId) {
  const room = rooms.get(roomId);
  if (room) {
    const index = room.indexOf(socketId);
    if (index > -1) {
      room.splice(index, 1);
      console.log(`👤 Removed ${socketId} from room ${roomId}`);
      cleanupRoom(roomId);
      return true;
    }
  }
  return false;
}

io.on("connection", (socket) => {
  console.log(`🟢 Connected: ${socket.id}`);

  // Join room event
  socket.on("join-room", (roomId) => {
    if (!roomId) {
      console.error("❌ No roomId provided");
      socket.emit("error", { message: "Room ID is required" });
      return;
    }

    try {
      socket.join(roomId);
      
      // Initialize room if not exists
      if (!rooms.has(roomId)) {
        rooms.set(roomId, []);
        console.log(`🆕 Created new room: ${roomId}`);
      }
      
      const roomUsers = rooms.get(roomId);
      
      // Add user if not already in room
      if (!roomUsers.includes(socket.id)) {
        roomUsers.push(socket.id);
        console.log(`📦 ${socket.id} joined room: ${roomId} (${roomUsers.length} users)`);
      } else {
        console.log(`⚠️  ${socket.id} already in room: ${roomId}`);
      }

      // Notify the joining user
      socket.emit("joined-room", { roomId, users: roomUsers.length });
      
      // Notify others in the room
      socket.to(roomId).emit("user-joined", { 
        userId: socket.id, 
        totalUsers: roomUsers.length 
      });
      
    } catch (err) {
      console.error("❌ Error joining room:", err);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  // Receiver ready event
  socket.on("receiver-ready", (roomId) => {
    console.log(`✅ Receiver ready in room ${roomId}`);
    socket.to(roomId).emit("receiver-ready");
  });

  // WebRTC Offer
  socket.on("offer", ({ roomId, offer }) => {
    if (!roomId || !offer) {
      console.error("❌ Invalid offer data");
      return;
    }
    
    console.log(`📤 Offer forwarded to room ${roomId}`);
    socket.to(roomId).emit("offer", offer);
  });

  // WebRTC Answer
  socket.on("answer", ({ roomId, answer }) => {
    if (!roomId || !answer) {
      console.error("❌ Invalid answer data");
      return;
    }
    
    console.log(`📥 Answer forwarded to room ${roomId}`);
    socket.to(roomId).emit("answer", answer);
  });

  // ICE Candidate
  socket.on("ice-candidate", ({ roomId, candidate }) => {
    if (!roomId || !candidate) {
      console.error("❌ Invalid ICE candidate data");
      return;
    }
    
    console.log(`❄️  ICE candidate forwarded to room ${roomId}`);
    socket.to(roomId).emit("ice-candidate", candidate);
  });

  // Leave room event
  socket.on("leave-room", (roomId) => {
    if (!roomId) return;
    
    socket.leave(roomId);
    removeUserFromRoom(socket.id, roomId);
    
    const room = rooms.get(roomId);
    const remainingUsers = room ? room.length : 0;
    
    socket.to(roomId).emit("user-left", { 
      userId: socket.id,
      totalUsers: remainingUsers
    });
    
    console.log(`👋 ${socket.id} left room ${roomId} (${remainingUsers} remaining)`);
  });

  // Disconnect event
  socket.on("disconnect", (reason) => {
    console.log(`🔴 Disconnected: ${socket.id} - Reason: ${reason}`);
    
    // Remove from all rooms
    let roomsCleaned = 0;
    for (const [roomId, users] of rooms.entries()) {
      if (removeUserFromRoom(socket.id, roomId)) {
        const remainingUsers = rooms.get(roomId)?.length || 0;
        socket.to(roomId).emit("user-left", { 
          userId: socket.id,
          totalUsers: remainingUsers
        });
        roomsCleaned++;
      }
    }
    
    if (roomsCleaned > 0) {
      console.log(`🧹 Cleaned ${socket.id} from ${roomsCleaned} room(s)`);
    }
  });

  // Error handling
  socket.on("error", (error) => {
    console.error(`⚠️  Socket error for ${socket.id}:`, error);
  });
});

// Global error handlers
io.engine.on("connection_error", (err) => {
  console.error("❌ Connection error:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  // In production, you might want to restart the process
});

// Periodic cleanup of empty rooms
setInterval(() => {
  let cleaned = 0;
  for (const [roomId, users] of rooms.entries()) {
    if (users.length === 0) {
      rooms.delete(roomId);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`🧹 Periodic cleanup: Removed ${cleaned} empty room(s)`);
  }
}, 300000); // Every 5 minutes

// Server startup
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";

server.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║  🚀 P2P Signaling Server Started                       ║
╠════════════════════════════════════════════════════════╣
║  📡 HTTP Server:  http://localhost:${PORT}              ║
║  🔌 WebSocket:    ws://localhost:${PORT}                ║
║  ✅ Health Check: http://localhost:${PORT}/health       ║
║  📊 Room Info:    http://localhost:${PORT}/rooms        ║
╠════════════════════════════════════════════════════════╣
║  Environment: ${process.env.NODE_ENV || 'development'} ║
║  Node Version: ${process.version}                      ║
╚════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("✅ HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\n👋 SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("✅ HTTP server closed");
    process.exit(0);
  });
});