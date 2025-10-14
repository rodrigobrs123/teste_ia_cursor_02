#!/bin/bash

echo "Starting E-commerce Application..."

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "Error: docker-compose.yml not found. Please run this script from the project root directory."
    exit 1
fi

# Start the application with Docker Compose
echo "Starting services with Docker Compose..."
docker-compose up -d

# Wait a bit for services to start
echo "Waiting for services to start..."
sleep 10

# Check if services are running
echo "Checking service status..."
docker-compose ps

echo ""
echo "Application should be available at:"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo ""
echo "To stop the application, run: docker-compose down"
echo ""
echo "To view logs, run: docker-compose logs -f"