# Smart Seller Profit Calculator

A Chrome extension that helps online sellers (especially in Bangladesh) calculate per-order profit, margin, and break-even price in seconds — without spreadsheets.

Built as a Manifest V3 extension with no build step, no frameworks, and no network calls. All data stays in the user's browser.

## Features

**Core calculator**
- Inputs: product cost, delivery cost, ad cost, discount, selling price
- Outputs: profit, profit margin %, break-even price
- Color-coded result (green = profit, red = loss)

**Target Profit Mode**
- Enter a desired profit margin (e.g. 30%) and the extension reverse-calculates the selling price you need.

**Saved products**
- Save any calculation with a name
- Sort by newest, highest profit, highest margin, or name
- Load a saved product back into the calculator, duplicate it, or delete

**Currency toggle**
- BDT (৳) ↔ USD ($)
- Configurable USD exchange rate
- All values stored canonically in BDT, so toggling never loses precision

**Bangladesh courier presets**
- 12 built-in presets: Pathao, Steadfast, RedX, Sundarban, Paperfly, eCourier — each with Inside/Outside Dhaka
- Add, edit, or remove your own
- Reset to defaults at any time

## Install

### Load unpacked (development)

1. Clone or download this repo
2. Open `chrome://extensions` in Chrome
3. Toggle **Developer mode** on (top right)
4. Click **Load unpacked** and select the project folder
5. Pin the extension to the toolbar from the puzzle-piece menu

### From the Chrome Web Store

_Coming soon._

## Project layout

```
.
├── manifest.json           # MV3 manifest
├── popup.html              # Popup UI structure
├── popup.css               # Styles
├── popup.js                # All logic (calculation, storage, UI)
├── icons/                  # 16/32/48/128 px PNGs (generated)
└── scripts/
    ├── generate-icons.py   # Regenerate icons (Python + Pillow)
    └── build.sh            # Package the extension into a zip
```

## Development

The extension has no build step. Edit the files directly, then click the reload icon for the extension on `chrome://extensions` to see changes.

### Regenerate icons

Requires Python 3 with [Pillow](https://pillow.readthedocs.io/):

```bash
pip3 install Pillow      # if not already installed
python3 scripts/generate-icons.py
```

### Build for the Chrome Web Store

```bash
bash scripts/build.sh
```

This produces `smart-seller-profit-calculator.zip` in the project root, ready to upload at the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/).

## Privacy

This extension stores all data (saved products, settings, courier presets) locally in your browser using `chrome.storage.local`. Nothing is transmitted anywhere. The extension requests only the `storage` permission.

## License

MIT
