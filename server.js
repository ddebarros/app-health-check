const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Global variable to control health status
let isHealthy = true;

// Health check endpoint
app.get("/health", (req, res) => {
  if (isHealthy) {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      message: "Service is running normally",
    });
  } else {
    res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      message: "Service is experiencing issues",
    });
  }
});

// API endpoint to toggle health status
app.post("/api/toggle-health", (req, res) => {
  isHealthy = !isHealthy;
  res.json({
    status: isHealthy ? "healthy" : "unhealthy",
    message: `Health status changed to ${isHealthy ? "healthy" : "unhealthy"}`,
  });
});

// API endpoint to get current health status
app.get("/api/health-status", (req, res) => {
  res.json({
    status: isHealthy ? "healthy" : "unhealthy",
    isHealthy: isHealthy,
  });
});

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Health check app running on http://localhost:${PORT}`);
  console.log(`Health endpoint: http://localhost:${PORT}/health`);
});
