#!/usr/bin/env python3
"""
Generates res/images/og.png by screenshotting the live site via headless
Chromium (Playwright). Captures the top 630px of a 1200-wide viewport after
the glitch-in animations have settled.

Run from repo root:
    python3 build/og_screenshot.py
"""
from pathlib import Path
import http.server
import socketserver
import threading
import time

from playwright.sync_api import sync_playwright

REPO = Path(__file__).resolve().parents[1]
OUT = REPO / "res" / "images" / "og.png"
PORT = 8765
WAIT_MS = 5000  # glitch-in (~1.1s) + ~3 conway steps (3 × 1.8s)


class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_a, **_kw):  # silence access log
        pass


def _serve(stop_evt: threading.Event) -> None:
    import os
    os.chdir(REPO)
    with socketserver.TCPServer(("127.0.0.1", PORT), _Quiet) as srv:
        srv.timeout = 0.2
        while not stop_evt.is_set():
            srv.handle_request()


def main() -> None:
    stop_evt = threading.Event()
    th = threading.Thread(target=_serve, args=(stop_evt,), daemon=True)
    th.start()
    time.sleep(0.2)

    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            ctx = browser.new_context(
                viewport={"width": 1200, "height": 900},
                device_scale_factor=2,  # retina-crisp output
                color_scheme="dark",     # match the prefers-color-scheme dark vibe
            )
            page = ctx.new_page()
            # force dark mode even if headless chromium defaults to light
            page.emulate_media(color_scheme="dark")
            page.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="networkidle")
            # belt-and-suspenders: inline-set the CSS variables since
            # emulate_media's prefers-color-scheme isn't propagating in headless
            page.evaluate("""
              const r = document.documentElement.style;
              r.setProperty('--bg', '#0e0e0e');
              r.setProperty('--text', '#ededed');
              r.setProperty('--muted', '#a3a3a3');
              r.setProperty('--rule', '#2a2a2a');
              r.setProperty('--tip-bg', '#ededed');
              r.setProperty('--tip-fg', '#0e0e0e');
              document.body.style.background = '#0e0e0e';
              document.body.style.color = '#ededed';
            """)
            page.wait_for_timeout(WAIT_MS)
            # screenshot the top 630px region — standard og:image height
            png_bytes = page.screenshot(
                clip={"x": 0, "y": 0, "width": 1200, "height": 630},
                type="png",
                omit_background=False,
            )
            browser.close()

        OUT.parent.mkdir(parents=True, exist_ok=True)
        OUT.write_bytes(png_bytes)
        print(f"wrote {OUT.relative_to(REPO)} ({OUT.stat().st_size:,} bytes)")
    finally:
        stop_evt.set()


if __name__ == "__main__":
    main()
