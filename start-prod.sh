#!/bin/bash
# start-prod.sh — Production startup script for HEM Portal
# Builds Next.js frontend and runs production server
# Usage: ./start-prod.sh

set -e

DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=========================================================="
echo "  H.E.M Portal — Production Environment Startup"
echo "=========================================================="

# 1. Build & Start Next.js Frontend
echo ""
echo "→ Building Next.js Frontend for Production..."
cd "$DIR/hem_portal"
npm run check:env
npm run release:check

echo ""
echo "→ Starting Next.js Production Server on port 3000..."
PORT="${PORT:-3000}" npm run start &
NEXT_PID=$!
echo "  Frontend PID: $NEXT_PID"

echo ""
echo "=========================================================="
echo "  ✓ Production Environment Active"
echo "  • Next.js Portal        : http://localhost:3000"
echo "  Press Ctrl+C to stop server gracefully"
echo "=========================================================="

cleanup() {
  echo ""
  echo "Shutting down production server..."
  kill $NEXT_PID 2>/dev/null
  exit 0
}
trap cleanup INT TERM

wait
