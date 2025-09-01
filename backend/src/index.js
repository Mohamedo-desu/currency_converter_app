require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const feedbackRoutes = require("./routes/feedback");
const versionRoutes = require("./routes/version");
const pushTokenRoutes = require("./routes/pushTokens");
const notificationRoutes = require("./routes/notifications");
const PushToken = require("./models/PushToken");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

// Routes
app.use("/api/feedback", feedbackRoutes);
app.use("/api/version", versionRoutes);
app.use("/api/push-tokens", pushTokenRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Function to ping the health endpoint
const pingHealthEndpoint = async () => {
  try {
    const response = await fetch(
      `http://localhost:${process.env.PORT || 3000}/health`
    );
    const data = await response.json();
    console.log("Health check ping successful:", data);
  } catch (error) {
    console.error("Health check ping failed:", error);
  }
};

// Schedule cron job to run every 14 minutes
cron.schedule("*/14 * * * *", () => {
  console.log("Running scheduled health check ping...");
  pingHealthEndpoint();
});

// Schedule daily cleanup of old push tokens (runs at 2 AM every day)
cron.schedule("0 2 * * *", async () => {
  console.log("Running scheduled push token cleanup...");
  try {
    await PushToken.cleanupOldTokens();
  } catch (error) {
    console.error("Error during scheduled push token cleanup:", error);
  }
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      // Initial health check ping
      pingHealthEndpoint();
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
