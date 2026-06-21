const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/ProjectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const chatRoutes = require("./routes/chatRoutes"); // ✅ ADD CHAT ROUTES
const userRoutes = require("./routes/userRoutes"); // ✅ ADD USER ROUTES

const app = express();
const server = http.createServer(app); // ✅ wrap Express app in HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins for development
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.use("/api/organizations", organizationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/chat", chatRoutes); // ✅ ADD CHAT ENDPOINTS
app.use("/api/users", userRoutes); // ✅ ADD USER ENDPOINTS

app.get("/", (req, res) => {
    res.send("Server running");
});

// ✅ WEBSOCKET AUTHENTICATION MIDDLEWARE
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication error: Token missing"));
  }
  try {
    const decoded = jwt.verify(token, "SECRET_KEY");
    socket.user = {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      role: decoded.role
    };
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
});

// ✅ WEBSOCKET CONNECTION AND EVENT HANDLING
io.on("connection", (socket) => {
  const { tenantId, userId } = socket.user;
  const tenantRoom = tenantId.toString();

  // Join the tenant room
  socket.join(tenantRoom);
  console.log(`📡 WebSocket: User ${userId} joined tenant room ${tenantRoom}`);

  // Listen for message events from this client
  socket.on("send_message", async (data) => {
    try {
      const { content } = data;
      if (!content || !content.trim()) return;

      const Message = require("./models/Message");
      const message = new Message({
        content: content.trim(),
        senderId: userId,
        tenantId: tenantId
      });

      await message.save();
      await message.populate("senderId", "name"); // Populate sender name

      // Broadcast message to everyone in the same tenant room
      io.to(tenantRoom).emit("receive_message", message);
      console.log(`✉️ WebSocket: Broadcasted message in room ${tenantRoom}`);
    } catch (err) {
      console.error("❌ WebSocket send_message error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔌 WebSocket: User ${userId} disconnected from room ${tenantRoom}`);
  });
});

// ✅ Start the HTTP + WebSocket server
server.listen(5000, () => console.log("Server running on port 5000"));