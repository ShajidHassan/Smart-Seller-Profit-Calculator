#!/usr/bin/env python3
"""Generate PNG icons (16/32/48/128) for the Chrome extension.

Design: rounded-square gradient background with three ascending white bars
and an upward arrow — reads as "profit / growth / calculator" at any size.
"""

import os
from PIL import Image, ImageDraw

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "icons")
SIZES = [16, 32, 48, 128]

GRAD_TOP = (79, 70, 229)      # #4f46e5
GRAD_BOT = (124, 108, 255)    # #7c6cff
WHITE = (255, 255, 255, 255)


def gradient_rounded_square(size, radius_ratio=0.22):
    bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)
    for y in range(size):
        t = y / max(1, size - 1)
        r = int(GRAD_TOP[0] * (1 - t) + GRAD_BOT[0] * t)
        g = int(GRAD_TOP[1] * (1 - t) + GRAD_BOT[1] * t)
        b = int(GRAD_TOP[2] * (1 - t) + GRAD_BOT[2] * t)
        bg_draw.line([(0, y), (size, y)], fill=(r, g, b, 255))

    radius = max(2, int(size * radius_ratio))
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size, size), radius=radius, fill=255)

    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    img.paste(bg, (0, 0), mask)
    return img


def draw_chart(img, size):
    """Three ascending white bars + an upward arrow above them."""
    draw = ImageDraw.Draw(img)
    # Tighter padding at small sizes so the chart actually reads.
    pad_ratio = 0.14 if size < 32 else 0.20
    pad = max(1, int(size * pad_ratio))
    inner = size - 2 * pad
    # Wider bars relative to inner area at small sizes.
    bar_ratio = 0.24 if size < 32 else 0.18
    gap_ratio = 0.06 if size < 32 else 0.10
    bar_w = max(1, int(inner * bar_ratio))
    gap = max(1, int(inner * gap_ratio))

    total_bars_w = 3 * bar_w + 2 * gap
    start_x = (size - total_bars_w) // 2
    base_y = size - pad

    heights = [int(inner * 0.30), int(inner * 0.50), int(inner * 0.72)]
    radius = max(1, bar_w // 4)

    for i, h in enumerate(heights):
        x0 = start_x + i * (bar_w + gap)
        x1 = x0 + bar_w
        y0 = base_y - h
        y1 = base_y
        if size >= 32:
            draw.rounded_rectangle((x0, y0, x1, y1), radius=radius, fill=WHITE)
        else:
            draw.rectangle((x0, y0, x1, y1), fill=WHITE)

    # Upward arrow above the tallest bar (only for icons big enough to read it)
    if size >= 32:
        arrow_size = max(3, int(inner * 0.22))
        ax = start_x + 2 * (bar_w + gap) + bar_w // 2
        ay = base_y - heights[2] - max(2, int(size * 0.08)) - arrow_size
        # Arrow as upward-pointing triangle
        triangle = [
            (ax, ay),
            (ax - arrow_size // 2, ay + arrow_size),
            (ax + arrow_size // 2, ay + arrow_size),
        ]
        draw.polygon(triangle, fill=WHITE)


def make_icon(size):
    img = gradient_rounded_square(size)
    draw_chart(img, size)
    return img


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for s in SIZES:
        icon = make_icon(s)
        path = os.path.join(OUT_DIR, f"icon{s}.png")
        icon.save(path, "PNG", optimize=True)
        print(f"Wrote {path}")


if __name__ == "__main__":
    main()
