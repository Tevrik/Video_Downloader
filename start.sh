#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo "Checking for ffmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    echo "Error: ffmpeg is not installed. Please install it to support high-quality downloads."
    echo "sudo apt install ffmpeg"
    exit 1
fi

# Ensure we are in the script's directory
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$ROOT_DIR"

# Start backend in background from its own directory
echo "Starting Node.js Backend..."
(cd backend && node server.js) &
BACKEND_PID=$!

echo "Starting Vite Frontend..."
if [ -d "frontend" ]; then
    cd frontend && npm run dev
else
    echo "Error: frontend directory not found!"
    kill $BACKEND_PID
    exit 1
fi

wait $BACKEND_PID
