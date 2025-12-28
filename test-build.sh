#!/bin/bash

echo "==================================="
echo "BUILD DIAGNOSTIC SCRIPT"
echo "==================================="
echo ""

echo "1. Node.js Version:"
node --version
echo ""

echo "2. npm Version:"
npm --version
echo ""

echo "3. Current Directory:"
pwd
echo ""

echo "4. Directory Contents:"
ls -la
echo ""

echo "5. Checking TypeScript..."
if command -v tsc &> /dev/null; then
    echo "TypeScript found:"
    npx tsc --version
else
    echo "TypeScript NOT found!"
fi
echo ""

echo "6. Checking tsconfig.json..."
if [ -f "tsconfig.json" ]; then
    echo "tsconfig.json exists"
    cat tsconfig.json
else
    echo "tsconfig.json NOT found!"
fi
echo ""

echo "7. Checking package.json..."
if [ -f "package.json" ]; then
    echo "package.json exists"
    cat package.json
else
    echo "package.json NOT found!"
fi
echo ""

echo "8. Checking node_modules..."
if [ -d "node_modules" ]; then
    echo "node_modules exists"
    echo "Size: $(du -sh node_modules)"
else
    echo "node_modules NOT found!"
fi
echo ""

echo "9. Testing TypeScript compilation..."
npx tsc --noEmit
TSC_EXIT=$?
if [ $TSC_EXIT -eq 0 ]; then
    echo "✓ TypeScript compilation check passed"
else
    echo "✗ TypeScript compilation check failed with exit code: $TSC_EXIT"
fi
echo ""

echo "10. Checking JSON files..."
if [ -d "json" ]; then
    echo "JSON directory exists:"
    ls -lh json/
else
    echo "JSON directory NOT found!"
fi
echo ""

echo "==================================="
echo "DIAGNOSTIC COMPLETE"
echo "==================================="
