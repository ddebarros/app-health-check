const express = require("express");
const path = require("path");
const pino = require("pino");

// Create Pino logger
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
});

const app = express();
const PORT = process.env.PORT || 3000;

// Request logging middleware using Pino
app.use((req, res, next) => {
  const start = Date.now();

  // Log request details
  logger.info(
    {
      type: "request",
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get("User-Agent") || "Unknown",
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      body:
        req.method === "POST" || req.method === "PUT" ? req.body : undefined,
    },
    "Incoming request"
  );

  // Override res.end to log response details
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = Date.now() - start;

    // Parse response body for API endpoints
    let responseBody;
    if (req.url.startsWith("/api/") || req.url === "/health") {
      try {
        responseBody = chunk ? JSON.parse(chunk.toString()) : {};
      } catch (e) {
        responseBody = chunk ? chunk.toString() : "";
      }
    }

    logger.info(
      {
        type: "response",
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage || "",
        duration: `${duration}ms`,
        responseBody: responseBody,
      },
      "Request completed"
    );

    originalEnd.call(this, chunk, encoding);
  };

  next();
});

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Global variable to control health status
let isHealthy = true;

// Health check endpoint
app.get("/health", (req, res) => {
  logger.info(
    {
      type: "health_check",
      status: isHealthy ? "healthy" : "unhealthy",
    },
    "Health check requested"
  );

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
  const previousStatus = isHealthy;
  isHealthy = !isHealthy;

  logger.info(
    {
      type: "health_toggle",
      previousStatus: previousStatus ? "healthy" : "unhealthy",
      newStatus: isHealthy ? "healthy" : "unhealthy",
    },
    "Health status toggled"
  );

  res.json({
    status: isHealthy ? "healthy" : "unhealthy",
    message: `Health status changed to ${isHealthy ? "healthy" : "unhealthy"}`,
  });
});

// API endpoint to get current health status
app.get("/api/health-status", (req, res) => {
  logger.info(
    {
      type: "health_status",
      status: isHealthy ? "healthy" : "unhealthy",
    },
    "Health status API requested"
  );

  res.json({
    status: isHealthy ? "healthy" : "unhealthy",
    isHealthy: isHealthy,
  });
});

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 404 handler for unmatched routes
app.use((req, res) => {
  logger.warn(
    {
      type: "not_found",
      method: req.method,
      url: req.url,
    },
    "Route not found"
  );

  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  logger.info(
    {
      type: "server_start",
      port: PORT,
      healthEndpoint: `http://localhost:${PORT}/health`,
    },
    "Health check app started"
  );
});
