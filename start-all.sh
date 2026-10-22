#!/bin/bash
# start-all.sh — Start the Next.js dev server
# Usage: ./start-all.sh

set -e

DIR="$(cd "$(dirname "$0")" && pwd)"

echo "============================================="
echo "  H.E.M Portal — Dev Start"
echo "============================================="

echo ""
echo "→ Starting Next.js dev server..."
cd "$DIR/hem_portal"
npm run dev &
NEXT_PID=$!
echo "  PID: $NEXT_PID"

echo ""
echo "============================================="
echo "  Next.js App:   http://localhost:3000"
echo "  Press Ctrl+C to stop"
echo "============================================="

# Trap Ctrl+C to kill both processes
cleanup() {
  echo ""
  echo "Shutting down..."
  kill $NEXT_PID 2>/dev/null
  exit 0
}
trap cleanup INT TERM

# Wait for either process to exit
wait
