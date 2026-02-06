#!/usr/bin/env bash
# exit on error
set -o errexit

# --- Setup Python for yt-dlp-exec if needed ---
# Render usually has python3, but some libs look for 'python'
mkdir -p .local_bin
if [ ! -L ".local_bin/python" ]; then
    ln -s $(which python3) .local_bin/python
fi
export PATH="$(pwd)/.local_bin:$PATH"

# --- Frontend Build ---
echo "Building Frontend..."
cd frontend
npm install
npm run build
cd ..

# --- Backend Dependencies ---
echo "Installing Backend Dependencies..."
cd backend
npm install
cd ..

echo "Build Completed!"
