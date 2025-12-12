# Frontend Troubleshooting Guide

## 404 Errors for Next.js Static Files

If you see errors like:
```
GET http://localhost:3000/_next/static/chunks/main-app.js 404 (Not Found)
```

### Solution 1: Clear Build Cache and Restart

```bash
cd frontend
rm -rf .next
npm run dev
```

### Solution 2: Kill All Next.js Processes

```bash
# Find and kill all Next.js processes
pkill -f "next dev"

# Wait a few seconds, then restart
cd frontend
npm run dev
```

### Solution 3: Check for Port Conflicts

```bash
# Check if port 3000 is in use
lsof -i :3000

# If something else is using it, kill it or change port
PORT=3001 npm run dev
```

### Solution 4: Reinstall Dependencies

```bash
cd frontend
rm -rf node_modules .next
npm install
npm run dev
```

## Common Issues

### Multiple Dev Servers Running

**Symptom**: 404 errors, slow performance, port conflicts

**Solution**:
```bash
# Kill all Next.js processes
pkill -f "next"

# Restart clean
cd frontend
npm run dev
```

### Build Cache Corruption

**Symptom**: Files not found, inconsistent behavior

**Solution**:
```bash
cd frontend
rm -rf .next
npm run dev
```

### Environment Variables Not Loading

**Symptom**: Authentication not working, API calls failing

**Solution**:
1. Check `.env.local` exists in `frontend/` directory
2. Restart dev server after changing `.env.local`
3. Ensure variables start with `NEXT_PUBLIC_` for client-side access

### TypeScript Errors

**Symptom**: Build fails, type errors

**Solution**:
```bash
cd frontend
npm run build  # Check for errors
# Fix any TypeScript errors
npm run dev
```

## Quick Fix Script

```bash
#!/bin/bash
# Quick fix for Next.js issues

cd frontend
pkill -f "next dev"
rm -rf .next
npm run dev
```

## Still Having Issues?

1. Check browser console for specific errors
2. Check terminal output for build errors
3. Verify Node.js version: `node --version` (should be 18+)
4. Try a clean install:
   ```bash
   cd frontend
   rm -rf node_modules .next package-lock.json
   npm install
   npm run dev
   ```

