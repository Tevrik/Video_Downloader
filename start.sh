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

# Ensure 'python' command exists (some node libs expect it)
mkdir -p .local_bin
if [ ! -L ".local_bin/python" ]; then
    ln -s $(which python3) .local_bin/python
fi
export PATH="$(pwd)/.local_bin:$PATH"

echo "Starting Node.js Backend on port 8000..."
node server/index.js &
BACKEND_PID=$!

echo "Starting Vite Frontend..."
npm run dev:vite

wait $BACKEND_PID
