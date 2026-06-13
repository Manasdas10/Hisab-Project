require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const cors = require("cors");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");

// Correct middleware
const authMiddleware = require("./middleware/auth");

// Routes
let authRouter = null;
try {
  authRouter = require("./routes/auth"); // Auth routes
} catch {
  console.log("⚠️ auth router not found, using demo login route.");
}

const transactionsRouter = require("./routes/transactions");
const aiRouter = require("./routes/ai");
const categoriesRouter = require("./routes/categories");
const goalsRouter = require("./routes/goals");

const app = express();

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// Allow both Vite ports
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://hisab-finance.onrender.com"
    ],
    credentials: true
  })
);

//Health Checks
app.get("/api", (req, res) => res.json({ status: "API running" }));

//Auth Routes
if (authRouter) {
  app.use("/api/auth", authRouter);
} else {
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body || {};

    if (username === "demo" && password === "demo") {
      const token = jwt.sign(
        { id: "demoUser", username: "demo" },
        process.env.JWT_SECRET || "change_this_secret",
        { expiresIn: "1h" }
      );
      return res.json({ token });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  });
}

//Protected Transaction Routes 
app.use("/api/transactions", authMiddleware, transactionsRouter);
app.use("/api/ai", authMiddleware, aiRouter);
app.use("/api/categories", authMiddleware, categoriesRouter);
app.use("/api/goals", authMiddleware, goalsRouter);

//Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

//Database and Server Start
const PORT = parseInt(process.env.PORT || "3000", 10);
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hisab_db";

connectDB()
  .then(() => {
    console.log("✅ Connected to MongoDB");

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    const shutdown = (signal) => {
      console.log(`\nReceived ${signal}. Closing server and DB...`);

      server.close(() => {
        mongoose.connection.close(false).then(() => {
          console.log("MongoDB connection closed.");
          process.exit(0);
        });
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  })
  .catch((err) => {
    console.error("❌ Mongo connection error:", err);
    process.exit(1);
  });