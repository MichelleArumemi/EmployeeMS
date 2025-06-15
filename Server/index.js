// server.js or index.js
import express from "express";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { ObjectId } from "mongodb";

// Routes
import { adminRouter } from "./Routes/AdminRoute.js";
import { employeeRouter } from "./Routes/EmployeeRoute.js";
import { projectRouter } from "./Routes/ProjectRoute.js";
import { taskRouter } from "./Routes/TaskRoute.js";
import { clientsRouter } from "./Routes/ClientsRoute.js";
import { taskStatusRouter } from "./Routes/TaskStatusRoute.js";
import { notificationRouter } from "./Routes/NotificationRoute.js";
import { attendanceRouter } from "./Routes/AttendanceRoute.js";
import { leaveRouter } from "./Routes/LeaveRouter.js";

// DB Utils
import { connectDB, getDB } from './utils/db.js';

// Load env vars
dotenv.config();

// App setup
const app = express();
const server = http.createServer(app);

// Socket.IO setup
export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  socket.on("join", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`ℹ️ Socket ${socket.id} joined room user_${userId}`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });

  socket.on("error", (err) => {
    console.error("⚠️ Socket Error:", err);
  });
});

// Connect DB first
await connectDB();
console.log("✅ MongoDB connected");

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("Public"));

// JWT Auth Middleware
const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ Status: false, Error: "Not Authenticated", success: false });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = getDB();
    const user = await db.collection("employees").findOne(
      { _id: new ObjectId(decoded.id) },
      { projection: { password: 0 } }
    );

    if (!user) return res.status(404).json({ Status: false, Error: "User not found", success: false });

    req.user = user;
    req.role = decoded.role || user.role;
    req.id = decoded.id;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(403).json({ Status: false, Error: "Invalid Token", success: false });
  }
};

// Routes
app.use("/api/auth", adminRouter); // No verification
app.use("/api/employee", verifyUser, employeeRouter);
app.use("/api/projects", verifyUser, projectRouter);
app.use("/api/tasks", verifyUser, taskRouter);
app.use("/api/clients", verifyUser, clientsRouter);
app.use("/api/taskstatus", verifyUser, taskStatusRouter);
app.use("/api/notification", verifyUser, notificationRouter);
app.use("/api/attendance", verifyUser, attendanceRouter);
app.use("/api/leave", verifyUser, leaveRouter);

// Auth Verification Endpoint
app.get('/api/verify', (req, res) => {
  const token = req.cookies.jwt;
  if (!token) return res.json({ Status: false, message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.json({ Status: false, message: 'Invalid token' });
    return res.json({
      Status: true,
      message: 'Authenticated',
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
      },
      role: decoded.role,
    });
  });
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: "connected"
  });
});

// Cookie Debug
app.get('/api/debug/cookies', (req, res) => {
  res.json({
    cookies: req.cookies,
    headers: req.headers
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    Status: false,
    Error: 'Internal Server Error'
  });
});

// Start Server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`🌐 CORS configured for: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});
