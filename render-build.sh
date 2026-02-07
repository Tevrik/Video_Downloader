# --- Environment Setup ---
npm run setup
export PATH="$(pwd)/.local_bin:$PATH"

# --- Install Dependencies and Build ---
echo "Installing all dependencies..."
npm install

echo "Building Frontend..."
npm run build

echo "Build Completed!"
