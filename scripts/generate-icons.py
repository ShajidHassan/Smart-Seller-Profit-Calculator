#!/usr/bin/env python3
"""Generate PNG icons (16/32/48/128) for the Chrome extension.

Strategy: render a single 1024×1024 master with high-quality anti-aliased
shapes, then downscale with Lanczos to each target size. This gives much
crisper edges at 16/32/48 than direct pixel-size rasterization.
"""

import os
from PIL import Image, ImageDraw, ImageFilter

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "icons")
SIZES = [16, 32, 48, 128]
MASTER = 1024

# Vibrant emerald → green gradient (money / profit semantics, not gloomy)
GRAD_TOP = (52, 211, 153)     # #34d399
GRAD_BOT = (5, 150, 105)      # #059669
WHITE = (255, 255, 255, 255)
WHITE_SOFT = (255, 255, 255, 235)


def gradient_rounded_square(size, radius_ratio=0.22):
    """Diagonal gradient on a rounded square."""
    bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)
    # Diagonal interpolation: t = (x + y) / (2 * size)
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * (size - 1))
            r = int(GRAD_TOP[0] * (1 - t) + GRAD_BOT[0] * t)
            g = int(GRAD_TOP[1] * (1 - t) + GRAD_BOT[1] * t)
            b = int(GRAD_TOP[2] * (1 - t) + GRAD_BOT[2] * t)
            bg.putpixel((x, y), (r, g, b, 255))

    radius = int(size * radius_ratio)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size, size), radius=radius, fill=255)

    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    img.paste(bg, (0, 0), mask)
    return img


def gradient_rounded_square_fast(size, radius_ratio=0.22):
    """Faster vertical-gradient version (per-row instead of per-pixel)."""
    bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)
    for y in range(size):
        t = y / (size - 1)
        r = int(GRAD_TOP[0] * (1 - t) + GRAD_BOT[0] * t)
        g = int(GRAD_TOP[1] * (1 - t) + GRAD_BOT[1] * t)
        b = int(GRAD_TOP[2] * (1 - t) + GRAD_BOT[2] * t)
        bg_draw.line([(0, y), (size, y)], fill=(r, g, b, 255))

    radius = int(size * radius_ratio)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size, size), radius=radius, fill=255)

    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    img.paste(bg, (0, 0), mask)
    return img


def draw_chart(img, size):
    """Three ascending rounded white bars with a bold upward arrow."""
    # Bars
    pad = int(size * 0.18)
    inner_w = size - 2 * pad
    inner_h = size - 2 * pad

    bar_w = int(inner_w * 0.20)
    gap = int(inner_w * 0.08)
    total_w = 3 * bar_w + 2 * gap
    start_x = (size - total_w) // 2

    # Reserve room above bars for the arrow (~20% of inner height)
    chart_area_h = int(inner_h * 0.85)
    base_y = size - pad
    heights = [int(chart_area_h * h) for h in (0.36, 0.55, 0.78)]
    bar_radius = int(bar_w * 0.25)

    # Drop shadow under bars
    shadow_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow_layer)
    shadow_offset = max(2, size // 80)
    for i, h in enumerate(heights):
        x0 = start_x + i * (bar_w + gap)
        x1 = x0 + bar_w
        y0 = base_y - h
        y1 = base_y
        sd.rounded_rectangle(
            (x0 + shadow_offset, y0 + shadow_offset, x1 + shadow_offset, y1 + shadow_offset),
            radius=bar_radius,
            fill=(0, 0, 0, 50),
        )
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=size // 100))
    img.alpha_composite(shadow_layer)

    # Bars
    bars_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bd = ImageDraw.Draw(bars_layer)
    for i, h in enumerate(heights):
        x0 = start_x + i * (bar_w + gap)
        x1 = x0 + bar_w
        y0 = base_y - h
        y1 = base_y
        bd.rounded_rectangle((x0, y0, x1, y1), radius=bar_radius, fill=WHITE)
    img.alpha_composite(bars_layer)

    # Upward arrow above the tallest bar
    arrow_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ad = ImageDraw.Draw(arrow_layer)

    tallest_x_center = start_x + 2 * (bar_w + gap) + bar_w // 2
    arrow_top_y = base_y - heights[2] - int(size * 0.10)
    arrow_w = int(bar_w * 1.6)
    arrow_h = int(size * 0.14)
    shaft_w = max(2, int(bar_w * 0.42))

    # Arrowhead (triangle)
    head = [
        (tallest_x_center, arrow_top_y),
        (tallest_x_center - arrow_w // 2, arrow_top_y + arrow_h),
        (tallest_x_center + arrow_w // 2, arrow_top_y + arrow_h),
    ]
    ad.polygon(head, fill=WHITE)

    # Arrow shaft (small rectangle below the head, sitting on top of the bar)
    shaft_top = arrow_top_y + arrow_h - 1
    shaft_bottom = base_y - heights[2] - 2
    if shaft_bottom > shaft_top:
        ad.rounded_rectangle(
            (
                tallest_x_center - shaft_w // 2,
                shaft_top,
                tallest_x_center + shaft_w // 2,
                shaft_bottom,
            ),
            radius=shaft_w // 3,
            fill=WHITE,
        )

    img.alpha_composite(arrow_layer)


def add_highlight(img, size):
    """Subtle top highlight for depth."""
    radius = int(size * 0.22)
    highlight = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    hd = ImageDraw.Draw(highlight)
    # Top inner highlight
    hd.rounded_rectangle(
        (int(size * 0.04), int(size * 0.04), size - int(size * 0.04), int(size * 0.45)),
        radius=int(radius * 0.85),
        fill=(255, 255, 255, 22),
    )
    highlight = highlight.filter(ImageFilter.GaussianBlur(radius=size // 60))
    img.alpha_composite(highlight)


def render_master():
    img = gradient_rounded_square_fast(MASTER)
    add_highlight(img, MASTER)
    draw_chart(img, MASTER)
    return img


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    print(f"Rendering master at {MASTER}×{MASTER}…")
    master = render_master()
    master.save(os.path.join(OUT_DIR, "icon-master.png"), "PNG", optimize=True)
    for s in SIZES:
        scaled = master.resize((s, s), Image.LANCZOS)
        path = os.path.join(OUT_DIR, f"icon{s}.png")
        scaled.save(path, "PNG", optimize=True)
        print(f"Wrote {path}")


if __name__ == "__main__":
    main()
