# Health Check App

A simple web application that exposes a `/health` endpoint which returns either 200 (healthy) or 500 (unhealthy) status based on a toggle button in the browser interface.

## Features

- **Health Endpoint**: `GET /health` returns 200 or 500 status
- **Web Interface**: Modern, responsive UI with toggle controls
- **Real-time Status**: Visual indicators showing current health status
- **Test Functionality**: Built-in endpoint testing with response display
- **Auto-refresh**: Status automatically updates every 5 seconds

## Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

#### Development Mode (with auto-reload)

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

The application will start on `http://localhost:3000`

## Usage

### Web Interface

1. Open your browser and navigate to `http://localhost:3000`
2. You'll see the current health status displayed with a colored indicator
3. Click the "Toggle Status" button to switch between healthy (200) and unhealthy (500)
4. Use the "Test Endpoint" button to see the actual response from the `/health` endpoint

### API Endpoints

#### Health Check

- **URL**: `GET /health`
- **Response (Healthy - 200)**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "message": "Service is running normally"
  }
  ```
- **Response (Unhealthy - 500)**:
  ```json
  {
    "status": "unhealthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "message": "Service is experiencing issues"
  }
  ```

#### Toggle Health Status

- **URL**: `POST /api/toggle-health`
- **Response**:
  ```json
  {
    "status": "healthy",
    "message": "Health status changed to healthy"
  }
  ```

#### Get Current Status

- **URL**: `GET /api/health-status`
- **Response**:
  ```json
  {
    "status": "healthy",
    "isHealthy": true
  }
  ```

## Testing

You can test the health endpoint using curl:

```bash
# Test the health endpoint
curl http://localhost:3000/health

# Toggle the health status
curl -X POST http://localhost:3000/api/toggle-health

# Get current status
curl http://localhost:3000/api/health-status
```

## Project Structure

```
app-health-check/
├── server.js          # Express server with API endpoints
├── package.json       # Dependencies and scripts
├── README.md         # This file
└── public/           # Static files served by Express
    ├── index.html    # Main web interface
    ├── styles.css    # CSS styles
    └── script.js     # Frontend JavaScript
```

## Customization

### Changing the Port

You can change the port by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

### Modifying Health Logic

The health status is controlled by the `isHealthy` variable in `server.js`. You can extend this to include more complex health checks like:

- Database connectivity
- External service availability
- System resource monitoring
- Custom business logic

## License

MIT License - feel free to use this project for your own needs.
