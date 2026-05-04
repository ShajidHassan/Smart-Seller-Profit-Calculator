#!/usr/bin/env python3
"""Generate the 440x280 small promotional tile for the Chrome Web Store."""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICON_MASTER = os.path.join(ROOT, "icons", "icon-master.png")
OUT = os.path.join(ROOT, "store-assets", "promo-tile-440x280.png")

WIDTH, HEIGHT = 440, 280
GRAD_TOP = (52, 211, 153)     # #34d399
GRAD_BOT = (5, 150, 105)      # #059669
WHITE = (255, 255, 255, 255)


def find_font(paths, size):
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                continue
    return ImageFont.load_default()


def gradient_bg(w, h):
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / (h - 1)
        r = int(GRAD_TOP[0] * (1 - t) + GRAD_BOT[0] * t)
        g = int(GRAD_TOP[1] * (1 - t) + GRAD_BOT[1] * t)
        b = int(GRAD_TOP[2] * (1 - t) + GRAD_BOT[2] * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b, 255))
    return img


def add_glow(img, w, h):
    """Subtle radial highlights for depth."""
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((-100, -120, 280, 200), fill=(255, 255, 255, 40))
    gd.ellipse((280, 120, 600, 400), fill=(0, 0, 0, 40))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=60))
    img.alpha_composite(glow)


def main():
    bg = gradient_bg(WIDTH, HEIGHT)
    add_glow(bg, WIDTH, HEIGHT)

    # Place the icon on the left
    icon = Image.open(ICON_MASTER).convert("RGBA")
    icon_size = 168
    icon = icon.resize((icon_size, icon_size), Image.LANCZOS)

    # Drop shadow under icon
    shadow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    icon_x = 36
    icon_y = (HEIGHT - icon_size) // 2
    sd.rounded_rectangle(
        (icon_x + 4, icon_y + 8, icon_x + icon_size + 4, icon_y + icon_size + 8),
        radius=int(icon_size * 0.22),
        fill=(0, 0, 0, 90),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=10))
    bg.alpha_composite(shadow)
    bg.alpha_composite(icon, (icon_x, icon_y))

    # Text on the right
    text_x = icon_x + icon_size + 28
    title_font = find_font([
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ], 30)
    sub_font = find_font([
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ], 16)
    tag_font = find_font([
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ], 12)

    draw = ImageDraw.Draw(bg)

    # Title (two lines), vertically centered alongside the icon
    title_y = 80
    draw.text((text_x, title_y), "Smart Seller", font=title_font, fill=WHITE)
    draw.text((text_x, title_y + 38), "Profit Calculator", font=title_font, fill=WHITE)

    # Tagline below
    sub_y = title_y + 92
    draw.text((text_x, sub_y), "Profit, margin & break-even", font=sub_font, fill=(255, 255, 255, 235))
    draw.text((text_x, sub_y + 22), "in seconds.", font=sub_font, fill=(255, 255, 255, 235))

    bg.save(OUT, "PNG", optimize=True)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
