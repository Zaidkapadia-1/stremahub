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

// Validate configuration in production
if (process.env.NODE_ENV === "production" && !process.env.CLIENT_URL) {
  console.error(
    `[${new Date().toISOString()}] Configuration error: CLIENT_URL environment variable is required in production.`
  );
  process.exit(1);
}

const clientUrls = [
  process.env.CLIENT_URL
].filter(Boolean);

if (process.env.NODE_ENV !== "production") {
  clientUrls.push(
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  );
}

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

// Handle malformed JSON parsing errors gracefully
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON format." });
  }
  next(err);
});

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
    await connectRedis();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(
        `[${new Date().toISOString()}] StreamHub server is running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Startup failed:`,
      error.message
    );
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };
