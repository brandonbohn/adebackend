# Render Deployment Troubleshooting Guide

## Build Issues on Render

### Symptoms
- Build taking forever (hanging)
- Build not completing
- Server not starting

### Diagnostic Steps

#### 1. Run Local Build Test
```bash
./test-build.sh
```
This will check:
- Node.js and npm versions
- TypeScript installation
- tsconfig.json configuration
- Directory structure
- Build compilation

#### 2. Simulate Render Build
```bash
./render-build-test.sh
```
This simulates Render's build process locally.

#### 3. Check Render Logs
On Render dashboard:
1. Go to your service
2. Click "Logs" tab
3. Look for error messages during build

### Common Issues & Solutions

#### Issue: Build Hangs During `npm install`
**Solution:** 
- Check your Node.js version in Render settings
- Recommended: Node 20.x or 18.x
- Update `package.json` engines if needed:
```json
"engines": {
  "node": ">=18.19.0",
  "npm": ">=9.0.0"
}
```

#### Issue: TypeScript Compilation Fails
**Solution:**
- Check that `typescript` is in `dependencies` (not `devDependencies` for Render)
- Verify `tsconfig.json` is in the root directory
- Ensure all TypeScript files have correct imports

#### Issue: Server Starts But Crashes
**Solution:**
- Check environment variables in Render dashboard
- Verify `PORT` environment variable is set
- Check file paths (use `__dirname` for relative paths)

#### Issue: Missing JSON Files in Build
**Solution:**
- Verify build script copies JSON files:
```bash
npm run build
ls -la dist/json/
```
- Check postbuild script in package.json

### Render Build Configuration

#### Environment Variables (Required)
- `PORT` - Set automatically by Render
- `NODE_ENV` - Set to `production`

#### Build Command
```bash
npm install && npm run build
```

#### Start Command
```bash
npm start
```

### Health Check Endpoints

After deployment, test these endpoints:

1. **Basic Health Check**
   ```
   GET https://your-app.onrender.com/health
   ```
   Should return detailed server status

2. **Railway Test Endpoint**
   ```
   GET https://your-app.onrender.com/_railway_test
   ```
   Should return welcome message

3. **JSON File Check**
   ```
   GET https://your-app.onrender.com/api/check-json
   ```
   Verifies JSON files are accessible

### Debugging Production Issues

#### Enable Verbose Logging
The server now includes detailed startup logging:
- Node version
- Environment
- Port binding
- Route loading
- Server ready status

#### Memory Issues
If build runs out of memory:
1. Upgrade Render plan for more memory
2. Check for memory leaks in code
3. Optimize dependencies

#### Timeout Issues
If build times out:
1. Check Render's build timeout settings
2. Optimize build process
3. Remove unnecessary dependencies

### Contact Support
If issues persist:
1. Share Render logs
2. Run and share output of `./test-build.sh`
3. Check Render status page for platform issues

## Testing Locally

### Quick Test
```bash
npm run test
```

### Full Build Verification
```bash
npm run build
npm run verify
npm start
```

### Build with Verbose Output
```bash
npm run build:verbose
```
