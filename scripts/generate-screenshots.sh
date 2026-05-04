#!/bin/bash
# Render the 4 store screenshots (1280x800) using headless Chrome.
set -e

cd "$(dirname "$0")/.."

if [ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
  CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
elif [ -x "/Applications/Google Chrome 2.app/Contents/MacOS/Google Chrome" ]; then
  CHROME="/Applications/Google Chrome 2.app/Contents/MacOS/Google Chrome"
elif command -v google-chrome >/dev/null 2>&1; then
  CHROME="$(command -v google-chrome)"
elif command -v chromium >/dev/null 2>&1; then
  CHROME="$(command -v chromium)"
else
  echo "Error: Chrome / Chromium not found." >&2
  exit 1
fi

SCENES=(01-hero-calculator 02-target-mode 03-saved-products 04-couriers)
OUT_DIR="store-assets/screenshots"

for scene in "${SCENES[@]}"; do
  src="file://$(pwd)/${OUT_DIR}/${scene}.html"
  dst="${OUT_DIR}/${scene}.png"
  echo "Rendering $scene …"
  "$CHROME" --headless \
    --disable-gpu \
    --hide-scrollbars \
    --window-size=1280,800 \
    --virtual-time-budget=3000 \
    --default-background-color=00000000 \
    --screenshot="$dst" \
    "$src" 2>/dev/null
  echo "  → $dst ($(du -h "$dst" | cut -f1))"
done

echo
echo "Done. Upload these to the Chrome Web Store listing:"
ls -1 "${OUT_DIR}"/*.png
