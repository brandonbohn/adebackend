#!/bin/bash
# Quick diagnostic script for Render deployment issues

echo "=================================="
echo "RENDER DEPLOYMENT DIAGNOSTICS"
echo "=================================="
echo ""

# Check Node version
echo "✓ Node.js version: $(node --version)"
echo "✓ npm version: $(npm --version)"
echo ""

# Check if build artifacts exist
if [ -d "dist" ]; then
    echo "✓ dist/ directory exists"
    echo "  Files: $(find dist -type f | wc -l)"
else
    echo "✗ dist/ directory missing!"
    echo "  Run: npm run build"
    exit 1
fi

# Check if JSON files are copied
if [ -d "dist/json" ] && [ -f "dist/json/adedata.json" ]; then
    echo "✓ JSON files copied to dist/"
    echo "  Size: $(du -sh dist/json | cut -f1)"
else
    echo "✗ JSON files missing in dist/!"
    exit 1
fi

# Check if main server file exists
if [ -f "dist/server.js" ]; then
    echo "✓ Server file exists (dist/server.js)"
else
    echo "✗ Server file missing!"
    exit 1
fi

# Check package.json
if [ -f "package.json" ]; then
    echo "✓ package.json exists"
    # Check for required scripts
    if grep -q '"start"' package.json && grep -q '"build"' package.json; then
        echo "✓ Required scripts present (build, start)"
    else
        echo "✗ Missing required scripts"
        exit 1
    fi
else
    echo "✗ package.json missing!"
    exit 1
fi

echo ""
echo "=================================="
echo "✓ ALL CHECKS PASSED"
echo "=================================="
echo ""
echo "To deploy on Render:"
echo "1. Commit and push all changes"
echo "2. Render will automatically build using:"
echo "   Build: npm install && npm run build"
echo "   Start: npm start"
echo "3. Check Render logs for startup messages"
echo ""
