const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // Log request details
  console.log(
    `[${timestamp}] ${req.method} ${req.url} - ${req.ip} - User-Agent: ${
      req.get("User-Agent") || "Unknown"
    }`
  );

  // Log request body for POST/PUT requests
  if (req.method === "POST" || req.method === "PUT") {
    console.log(
      `[${timestamp}] Request Body:`,
      JSON.stringify(req.body, null, 2)
    );
  }

  // Log query parameters
  if (Object.keys(req.query).length > 0) {
    console.log(
      `[${timestamp}] Query Parameters:`,
      JSON.stringify(req.query, null, 2)
    );
  }

  // Override res.end to log response details
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusText = res.statusMessage || "";

    console.log(
      `[${timestamp}] ${req.method} ${req.url} - ${statusCode} ${statusText} - ${duration}ms`
    );

    // Log response body for API endpoints
    if (req.url.startsWith("/api/") || req.url === "/health") {
      try {
        const responseBody = chunk ? JSON.parse(chunk.toString()) : {};
        console.log(
          `[${timestamp}] Response Body:`,
          JSON.stringify(responseBody, null, 2)
        );
      } catch (e) {
        // If response is not JSON, log as string
        console.log(
          `[${timestamp}] Response Body:`,
          chunk ? chunk.toString() : ""
        );
      }
    }

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
  console.log(
    `[${new Date().toISOString()}] Health check requested - Current status: ${
      isHealthy ? "healthy" : "unhealthy"
    }`
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

  console.log(
    `[${new Date().toISOString()}] Health status toggled from ${
      previousStatus ? "healthy" : "unhealthy"
    } to ${isHealthy ? "healthy" : "unhealthy"}`
  );

  res.json({
    status: isHealthy ? "healthy" : "unhealthy",
    message: `Health status changed to ${isHealthy ? "healthy" : "unhealthy"}`,
  });
});

// API endpoint to get current health status
app.get("/api/health-status", (req, res) => {
  console.log(
    `[${new Date().toISOString()}] Health status API requested - Current status: ${
      isHealthy ? "healthy" : "unhealthy"
    }`
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
  console.log(
    `[${new Date().toISOString()}] 404 - Route not found: ${req.method} ${
      req.url
    }`
  );
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(
    `[${new Date().toISOString()}] Health check app running on http://localhost:${PORT}`
  );
  console.log(
    `[${new Date().toISOString()}] Health endpoint: http://localhost:${PORT}/health`
  );
  console.log(
    `[${new Date().toISOString()}] Request logging enabled - all requests will be logged`
  );
});
