#!/usr/bin/env python3
"""
Generates the Open Graph / Twitter share image for lkwbr.github.io.

Output: res/images/og.png (1200×630)

Run from repo root:
    python3 build/og.py
"""
from PIL import Image, ImageDraw, ImageFont
import random
from pathlib import Path

W, H = 1200, 630
BG = (10, 10, 10)
FG = (237, 237, 237)
MUTED = (140, 140, 140)
ACCENT = (196, 166, 232)  # pastel purple #c4a6e8

REPO = Path(__file__).resolve().parents[1]
OUT = REPO / "res" / "images" / "og.png"


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    paths = [
        ("/System/Library/Fonts/Menlo.ttc", 1 if bold else 0),
        ("/System/Library/Fonts/Monaco.ttf", 0),
        ("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf" if bold
         else "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 0),
    ]
    for path, idx in paths:
        try:
            return ImageFont.truetype(path, size, index=idx)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def text_size(draw: ImageDraw.ImageDraw, text: str, font) -> tuple[int, int]:
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def main() -> None:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # faint conway-pattern texture in background
    random.seed(42)
    cell = 14
    SHADES = [
        (18, 18, 18),  # ░-ish
        (26, 26, 26),  # ▒-ish
        (40, 40, 40),  # ▓-ish
        (60, 60, 60),  # █-ish
    ]
    for y in range(0, H, cell):
        for x in range(0, W, cell):
            r = random.random()
            if r < 0.04:
                draw.rectangle([x, y, x + cell - 2, y + cell - 2], fill=SHADES[3])
            elif r < 0.10:
                draw.rectangle([x, y, x + cell - 2, y + cell - 2], fill=SHADES[2])
            elif r < 0.18:
                draw.rectangle([x, y, x + cell - 2, y + cell - 2], fill=SHADES[1])
            elif r < 0.28:
                draw.rectangle([x, y, x + cell - 2, y + cell - 2], fill=SHADES[0])

    # text content — perfectly centered via the "mm" anchor (handles
    # ascender/descender bearings correctly so the visual glyphs are centered).
    title = "LUKE WEBER"
    font_title = load_font(180, bold=True)
    draw.text((W // 2, H // 2), title, font=font_title, fill=FG, anchor="mm")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT.relative_to(REPO)} ({OUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
