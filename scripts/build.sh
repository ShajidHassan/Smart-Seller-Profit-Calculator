#!/bin/bash
# Package the extension into a zip ready for Chrome Web Store upload.
set -e

cd "$(dirname "$0")/.."

OUT="smart-seller-profit-calculator.zip"
rm -f "$OUT"

zip -r "$OUT" \
  manifest.json \
  popup.html \
  popup.css \
  popup.js \
  icons \
  -x "*.DS_Store" "*/.DS_Store" "icons/icon-master.png"

echo
echo "Built $OUT ($(du -h "$OUT" | cut -f1))"
echo "Upload this file at https://chrome.google.com/webstore/devconsole/"
