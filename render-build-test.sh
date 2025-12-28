#!/bin/bash
# Render Build Check Script - Simulates Render's build process

set -e  # Exit on any error

echo "================================================"
echo "RENDER BUILD SIMULATION"
echo "================================================"
echo "Time: $(date)"
echo "Node: $(node --version)"
echo "npm: $(npm --version)"
echo ""

# Step 1: Install dependencies
echo "[1/5] Installing dependencies..."
npm install --production=false
echo "✓ Dependencies installed"
echo ""

# Step 2: Verify TypeScript
echo "[2/5] Verifying TypeScript installation..."
npx tsc --version
echo "✓ TypeScript verified"
echo ""

# Step 3: Build
echo "[3/5] Building TypeScript..."
npm run build
echo "✓ Build completed"
echo ""

# Step 4: Verify build output
echo "[4/5] Verifying build output..."
if [ -d "dist" ]; then
    echo "✓ dist/ directory exists"
    echo "Contents:"
    ls -lR dist/
else
    echo "✗ dist/ directory NOT found!"
    exit 1
fi
echo ""

# Step 5: Test server start (with timeout)
echo "[5/5] Testing server start..."
timeout 5s node dist/server.js &
SERVER_PID=$!
sleep 2

# Check if server is still running
if ps -p $SERVER_PID > /dev/null; then
    echo "✓ Server started successfully (PID: $SERVER_PID)"
    kill $SERVER_PID 2>/dev/null || true
else
    echo "✗ Server failed to start or crashed"
    exit 1
fi

echo ""
echo "================================================"
echo "✓ ALL CHECKS PASSED - BUILD READY FOR RENDER"
echo "================================================"
