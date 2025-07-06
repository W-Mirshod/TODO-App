#!/bin/bash

echo "Starting TODO App"

# Check if docker-compose or docker compose is available
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    echo "Error: Neither 'docker-compose' nor 'docker compose' is available"
    exit 1
fi

echo "Using $DOCKER_COMPOSE_CMD"

# Stop any existing containers
$DOCKER_COMPOSE_CMD down

# Build and run the container in detached mode
$DOCKER_COMPOSE_CMD up -d --build

echo "To stop the app, run: $DOCKER_COMPOSE_CMD down"