# Chrome Web Store Listing — Copy & Paste

Everything you need for the dashboard form. Edit anything in **bold brackets** to suit you.

---

## Publisher (set once on dashboard)

**Display name:** Shajid Hassan
*(Or your registered business name — whatever you set in the dashboard "Account" tab is what shoppers see under "Offered by".)*

---

## Item name (45 char limit)

```
Smart Seller Profit Calculator
```

## Summary / short description (132 char limit)

```
Instantly calculate profit, margin & break-even for every order. Built-in BD courier rates (Pathao, Steadfast, RedX & more).
```

## Detailed description (paste into the long description field)

```
Smart Seller Profit Calculator helps online sellers know exactly how much they make on every order — before they ship it.

Built for sellers running Shopify, WooCommerce, Facebook, Instagram, or just messaging on WhatsApp. Especially handy for sellers in Bangladesh because all the major couriers are baked in.

━━━━━━━━━━━━━━━━━━━━
WHAT YOU CAN DO
━━━━━━━━━━━━━━━━━━━━

✓ Profit, margin %, and break-even price — instantly
   Enter product cost, delivery, ad spend, discount, and selling price.
   See profit, margin %, and the exact price you need to break even.

✓ Target Profit Mode
   Don't know what to charge? Enter the profit margin you want
   (e.g. 30%) and the calculator works backwards to give you the
   selling price.

✓ Save & compare products
   Save every calculation with a name. Sort by highest profit,
   highest margin, name, or date. Load any saved item back into
   the calculator with one tap.

✓ BDT ↔ USD currency toggle
   Switch between Bangladeshi Taka and US Dollar. Configurable
   exchange rate. Values stay accurate when toggling.

✓ Bangladesh courier presets, built in
   12 ready-to-use presets: Pathao, Steadfast, RedX, Sundarban,
   Paperfly, eCourier — each with Inside-Dhaka and Outside-Dhaka
   pricing. Add your own, edit anytime, reset to defaults.

━━━━━━━━━━━━━━━━━━━━
WHO IT'S FOR
━━━━━━━━━━━━━━━━━━━━

• Facebook & Instagram resellers
• Shopify / WooCommerce / Shopify-clone store owners
• Dropshippers
• Anyone selling cash-on-delivery in Bangladesh
• Side-hustlers tired of doing margin math on a phone calculator

━━━━━━━━━━━━━━━━━━━━
PRIVACY
━━━━━━━━━━━━━━━━━━━━

Everything stays on your device. The extension does not collect, transmit, or sell any data. Your saved products and settings live in your browser only (chrome.storage.local). The only permission requested is "storage" — used purely to remember your products and preferences across sessions.

No account. No login. No tracking. No ads.

━━━━━━━━━━━━━━━━━━━━

Free, open-source, and made for sellers — by a seller.
```

---

## Category

**Productivity**

## Language

**English** (and optionally add Bengali / বাংলা if you want to localize later)

---

## Single-purpose statement (required by Chrome Web Store)

```
Calculate per-order profit, profit margin, and break-even price for online sellers, with optional saved-product history and Bangladesh courier presets.
```

---

## Permission justifications

| Permission | Justification (paste verbatim) |
|---|---|
| `storage` | Used to save the user's product calculations, courier presets, currency preference, and exchange rate locally in the browser via chrome.storage.local. No data is transmitted off the device. |

(No `host_permissions`, no `activeTab`, no `scripting` — nothing else to justify.)

---

## Privacy practices declarations (the certification checkboxes)

Check these on the **Privacy practices** tab:

- **Single purpose:** ✓ (paste statement above)
- **Permissions justified:** ✓ (storage only)
- **Data collection / usage / sharing:** select "I do not collect or use" on every category (PII, health, financial, authentication, personal communications, location, web history, user activity, website content)
- **Sell user data to third parties:** No
- **Use or transfer data for purposes unrelated to the single purpose:** No
- **Use or transfer data to determine creditworthiness or for lending:** No
- **Remote code:** No (everything ships in the package)

---

## Privacy policy

Chrome requires a public URL to a privacy policy. Easiest path: paste the text below into a new gist or a GitHub Pages page and use that URL.

### Suggested page URL options

1. **GitHub gist** (fastest): https://gist.github.com/new — paste, save as public, copy the link
2. **GitHub Pages** on this repo: enable Pages → use `/docs/privacy.html`

### Privacy policy text

```
Privacy Policy — Smart Seller Profit Calculator

Effective date: 2026-05-04

This Chrome extension ("Smart Seller Profit Calculator") is designed to work entirely on your device. It does not collect, store on remote servers, or share any personal data.

DATA WE STORE LOCALLY
The extension stores the following information in your own browser using the chrome.storage.local API:
  • Your saved product calculations (names, costs, prices, computed profit/margin)
  • Courier presets you have added or edited
  • Your selected display currency (BDT or USD) and exchange rate

This data never leaves your device. It is not transmitted to any server, and the extension developer has no access to it.

DATA WE DO NOT COLLECT
We do not collect personally identifiable information, browsing history, location, financial information, login credentials, contact lists, or any other personal data.

THIRD PARTIES
The extension contains no analytics, no advertising SDKs, and makes no network requests.

PERMISSIONS
The extension requests the "storage" permission, which is used solely to read and write the local data described above.

DELETING YOUR DATA
You can clear all saved products from the Saved tab. You can also remove all extension data by uninstalling the extension or by clearing your browser's extension data.

CONTACT
Questions? Open an issue at:
https://github.com/ShajidHassan/Smart-Seller-Profit-Calculator/issues

CHANGES
If this policy changes, the new version will be posted at this URL with an updated effective date.
```

---

## Distribution

| Field | Value |
|---|---|
| Visibility | **Public** (or "Unlisted" if you want to test the link first) |
| Regions | All regions (or restrict to Bangladesh + India + USA if you prefer) |
| Pricing | Free |

---

## Assets to upload (already prepared in this repo)

| Asset | Path | Size |
|---|---|---|
| Extension package | `smart-seller-profit-calculator.zip` | 24 KB |
| Small promo tile | `store-assets/promo-tile-440x280.png` | 440×280 |
| Screenshot 1 (hero) | `store-assets/screenshots/01-hero-calculator.png` | 1280×800 |
| Screenshot 2 (target mode) | `store-assets/screenshots/02-target-mode.png` | 1280×800 |
| Screenshot 3 (saved products) | `store-assets/screenshots/03-saved-products.png` | 1280×800 |
| Screenshot 4 (couriers) | `store-assets/screenshots/04-couriers.png` | 1280×800 |

Marquee promo tile (1400×560) is optional — skip it for the first submission.

---

## Submission checklist

- [ ] Pay $5 developer registration fee
- [ ] Verify identity in dashboard
- [ ] Host privacy policy at a public URL (gist or GitHub Pages)
- [ ] Upload `smart-seller-profit-calculator.zip` (run `bash scripts/build.sh` first)
- [ ] Paste copy from this file into the listing form
- [ ] Upload all 4 screenshots + small promo tile
- [ ] Set publisher display name in account settings
- [ ] Submit for review (1–3 business days for first submission)
