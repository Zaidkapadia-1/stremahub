require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const groupRoutes = require("./routes/group");
const authRoutes = require("./routes/auth");
const setupSlotHandlers = require("./sockets/slotHandlers");

const app = express();
const server = http.createServer(app);

const clientUrls = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

const corsOptions = {
  origin(origin, callback) {
    // Allow direct local testing as well as non-browser clients without an Origin header.
    if (!origin || clientUrls.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by StreamHub."));
  },
  credentials: true
};

// Express CORS
app.use(cors(corsOptions));

// Express JSON parsing
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Auth routes
app.use("/auth", authRoutes);

// Group routes
app.use("/group", groupRoutes);

// Socket.io initialization
const io = new Server(server, {
  cors: corsOptions
});

// Attach socket handlers
setupSlotHandlers(io);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Non-fatal MongoDB startup error:`, error.message);
  }

  try {
    await connectRedis();
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Non-fatal Redis startup error:`, error.message);
  }

  server.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] StreamHub server is running on port ${PORT}`);
  });
};

startServer();

module.exports = { app, server, io };
