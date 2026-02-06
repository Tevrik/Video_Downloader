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

# Cleanup any existing processes on port 8000
echo "Cleaning up port 8000..."
fuser -k 8000/tcp 2>/dev/null || true

# Ensure 'python' command exists (some node libs expect it)
mkdir -p .local_bin
if [ ! -L ".local_bin/python" ]; then
    PYTHON_PATH=$(which python3 || which python)
    if [ ! -z "$PYTHON_PATH" ]; then
        ln -sf "$PYTHON_PATH" .local_bin/python
    fi
fi
export PATH="$(pwd)/.local_bin:$PATH"

# Start backend in background from its own directory
echo "Starting Node.js Backend on port 8000..."
cd backend
npm run start > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready (up to 30 seconds)
echo "Waiting for backend to be ready..."
COUNT=0
while ! curl -s http://localhost:8000/api/health > /dev/null; do
    sleep 1
    COUNT=$((COUNT+1))
    if [ $COUNT -ge 30 ]; then
        echo "Error: Backend failed to start. See backend.log for details."
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    # Check if process is still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "Error: Backend crashed immediately. See backend.log"
        exit 1
    fi
done
echo "Backend is ready!"

echo "Starting Vite Frontend..."
if [ -d "frontend" ]; then
    cd frontend && npm run dev
else
    echo "Error: frontend directory not found!"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

wait $BACKEND_PID
