#!/bin/bash
# ============================================
# Inventory Management System - Setup Script
# ============================================
# This script installs MongoDB, sets up the
# backend and frontend, and starts the app.
# ============================================

set -e

echo "=========================================="
echo " Inventory Management System Setup"
echo "=========================================="

# --- Detect OS ---
OS=""
if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS=$ID
fi

# --- Install MongoDB ---
install_mongodb_ubuntu() {
  echo ""
  echo "[1/5] Installing MongoDB on Ubuntu/Debian..."
  sudo apt-get update -qq
  sudo apt-get install -y -qq gnupg curl
  curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg 2>/dev/null || true
  echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list > /dev/null
  sudo apt-get update -qq
  sudo apt-get install -y -qq mongodb-org
  sudo systemctl start mongod 2>/dev/null || sudo mongod --dbpath /data/db --fork --logpath /var/log/mongod.log 2>/dev/null || true
  sudo systemctl enable mongod 2>/dev/null || true
  echo "   MongoDB installed and started."
}

install_mongodb_mac() {
  echo ""
  echo "[1/5] Installing MongoDB on macOS..."
  if ! command -v brew &> /dev/null; then
    echo "   Homebrew not found. Please install Homebrew first:"
    echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
  fi
  brew tap mongodb/brew 2>/dev/null || true
  brew install mongodb-community@7.0 2>/dev/null || true
  brew services start mongodb-community@7.0
  echo "   MongoDB installed and started."
}

install_mongodb_windows() {
  echo ""
  echo "[1/5] MongoDB on Windows"
  echo "   Please download and install MongoDB Community Server from:"
  echo "   https://www.mongodb.com/try/download/community"
  echo "   After installing, make sure mongod is running before proceeding."
  echo ""
  read -p "   Press Enter once MongoDB is installed and running..."
}

# Check if MongoDB is already installed
if command -v mongod &> /dev/null; then
  echo ""
  echo "[1/5] MongoDB is already installed."
  # Try to start it if not running
  mongod --version | head -1
  sudo systemctl start mongod 2>/dev/null || sudo mongod --dbpath /data/db --fork --logpath /var/log/mongod.log 2>/dev/null || true
else
  case "$OS" in
    ubuntu|debian)
      install_mongodb_ubuntu
      ;;
    *)
      if [[ "$OSTYPE" == "darwin"* ]]; then
        install_mongodb_mac
      elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        install_mongodb_windows
      else
        echo ""
        echo "[1/5] Could not detect OS. Please install MongoDB manually:"
        echo "   https://www.mongodb.com/docs/manual/installation/"
        exit 1
      fi
      ;;
  esac
fi

# --- Check Node.js ---
echo ""
if ! command -v node &> /dev/null; then
  echo "[ERROR] Node.js is not installed. Please install Node.js >= 18:"
  echo "   https://nodejs.org/"
  exit 1
fi
echo "[2/5] Node.js $(node --version) detected."

# --- Setup Backend ---
echo ""
echo "[3/5] Setting up backend..."
cd server
if [ ! -f .env ]; then
  cp .env.example .env
  # Generate a random JWT secret
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/your_jwt_secret_key_here/$JWT_SECRET/" .env
  else
    sed -i "s/your_jwt_secret_key_here/$JWT_SECRET/" .env
  fi
  echo "   Created .env with generated JWT secret."
else
  echo "   .env already exists, skipping."
fi
npm install
echo "   Backend dependencies installed."
cd ..

# --- Setup Frontend ---
echo ""
echo "[4/5] Setting up frontend..."
cd client
npm install
echo "   Frontend dependencies installed."
cd ..

# --- Run Tests ---
echo ""
echo "[5/5] Running backend tests..."
cd server
npm test
cd ..

echo ""
echo "=========================================="
echo " Setup Complete!"
echo "=========================================="
echo ""
echo " To start the application:"
echo ""
echo "   Backend:  cd server && npm run dev"
echo "   Frontend: cd client && npm run dev"
echo ""
echo "   Backend runs at:  http://localhost:5000"
echo "   Frontend runs at: http://localhost:5173"
echo "   API docs at:      http://localhost:5000/api/docs"
echo ""
echo " The first user to sign up becomes Admin."
echo "=========================================="
