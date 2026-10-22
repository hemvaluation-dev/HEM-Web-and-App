#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../HEM_Agent"
# Sign in with the existing test account before starting. Keep the installed app
# so Flutter Drive does not uninstall it and erase the session after this suite.
FLUTTER_BIN="${FLUTTER_BIN:-flutter}"
SUPABASE_URL="${SUPABASE_URL:-https://osvuyzhaucjrtdhqrmlx.supabase.co}"
: "${SUPABASE_PUBLISHABLE_KEY:?Set SUPABASE_PUBLISHABLE_KEY in the protected shell environment before running mobile QA}"
"$FLUTTER_BIN" drive -d "${QA_DEVICE:-emulator-5554}" --keep-app-running \
  --driver=test_driver/qa_driver.dart --target=integration_test/alignment_test.dart \
  --dart-define=SUPABASE_URL="$SUPABASE_URL" \
  --dart-define=SUPABASE_PUBLISHABLE_KEY="$SUPABASE_PUBLISHABLE_KEY"
