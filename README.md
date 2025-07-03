# TODO-App

A simple, responsive TODO application built with HTML, CSS, and JavaScript, containerized with Docker.

## Features

- Add, complete, and delete TODO items
- Filter TODOs by status (All, Active, Completed)
- Persistent storage using localStorage
- Responsive design
- Docker containerization with nginx

## Getting Started

### Prerequisites

- Docker
- Docker Compose (or `docker compose`)

### Running the Application

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd TODO-App
   ```

2. Start the application:
   ```bash
   ./start.sh
   ```

   This will:
   - Generate a random port between 8000-9000
   - Build the Docker image
   - Start the container in detached mode
   - Display the URL to access the app

3. Open your browser and navigate to the displayed URL (e.g., `http://localhost:8363`)

### Manual Docker Commands

You can also run the application manually:

```bash
# Build the image
docker build -t todo-app .

# Run with docker-compose (using default port 8080)
docker compose up -d

# Run with custom port
PORT=3000 docker compose up -d

# Stop the application
docker compose down
```

### Environment Variables

- `PORT`: The port to expose the application on (default: 8080)

## Files

- `index.html` - Main application HTML
- `style.css` - Application styling
- `script.js` - Application logic
- `Dockerfile` - Docker image configuration
- `docker-compose.yml` - Docker Compose configuration
- `start.sh` - Startup script with automatic port assignment
