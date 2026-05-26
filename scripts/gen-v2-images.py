#!/usr/bin/env python
"""
scripts/gen-v2-images.py — generate the 8 hero / showcase / portrait images
for the v9 home page by calling OpenAI's DALL-E 3 image generation API.

Run via:
    OPENAI_API_KEY=sk-... python scripts/gen-v2-images.py

Outputs to public/ai/v2/<name>.jpg. Skips any file that already exists, so
re-running is a no-op for previously-generated images. Delete the file you
want to regenerate before re-running.

Uses only the Python 3 standard library — no requests/httpx/openai package
needed, so this works on a fresh machine.

Cost estimate (DALL-E 3 HD, 2026 pricing):
  - 1 × 1024×1792 = $0.120
  - 3 × 1792×1024 = $0.360
  - 4 × 1024×1024 = $0.320
  Total: ~$0.80
"""

import json
import os
import sys
import time
import urllib.request
from pathlib import Path

MAX_RETRIES = 3
RETRY_BACKOFF_S = 5
API_TIMEOUT_S = 300  # gpt-image-2 high quality sometimes runs >2 min

API_URL = "https://api.openai.com/v1/images/generations"
REPO_ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = REPO_ROOT / "public" / "ai" / "v2"

# Each job: (filename_stem, DALL-E 3 size, prompt)
# Prompts are tuned for DALL-E 3 — emphasising "editorial documentary
# photograph" / specific camera + lens / "no readable text" / "no brand
# logos" to push the model away from its typical AI-stock-photo defaults.
JOBS = [
    (
        "hero-counter",
        "1024x1536",
        (
            "Editorial documentary photograph of an independent neighborhood "
            "restaurant counter at golden hour. A smiling Asian-American "
            "restaurant owner in their forties hands a white paper takeout bag "
            "across a warm wooden counter to a young female customer in her "
            "late twenties, who is holding up an iPhone with the screen tilted "
            "slightly toward the owner. Soft late-afternoon sunlight filters "
            "through a front window. Warm wood tones throughout. A chalkboard "
            "menu (text not readable) is partially visible behind the counter; "
            "a small potted plant and fresh herbs sit on the counter. Candid "
            "warm mood. Shot on Fujifilm GFX 100 with 80mm lens at f/2, "
            "shallow depth of field on the customer's hands. Cinematic color "
            "grading, natural skin tones. No readable text on any signs or "
            "screens. No visible brand logos."
        ),
    ),
    (
        # Phone close-up showing a real-looking restaurant brand-site
        # mobile view — used as the SEO + AI search section image.
        "section-wallet",
        "1536x1024",
        (
            "Editorial close-up photograph of a young customer's hands "
            "holding an iPhone at chest height in a warm independent "
            "restaurant interior. The iPhone screen displays a fully "
            "designed restaurant brand-site mobile homepage: at the top, a "
            "vivid food-photo hero banner taking up about 40 percent of the "
            "screen; below it, a row showing a small circular restaurant "
            "logo mark and a name in clean sans-serif type with a star "
            "rating beside it; below that, a row of three small square "
            "thumbnails of featured dishes with a brief caption under each; "
            "near the bottom, a prominent warm-orange rounded 'Order' call-"
            "to-action button. The UI looks polished and real but the "
            "individual letters are rendered softly and aren't fully "
            "legible. The restaurant interior is softly out of focus "
            "behind the phone, lit by warm evening tungsten lighting. Soft "
            "reflections on the phone glass. Shot on Sony A7R IV with 85mm "
            "lens at f/1.8, shallow depth of field focused on the phone "
            "screen, warm cinematic color grade. No Apple Wallet logo, no "
            "Apple logo, no Google logo, no third-party brand visible."
        ),
    ),
    (
        "section-storefront",
        "1536x1024",
        (
            "Editorial lifestyle photograph of a young casual customer in their "
            "late twenties sitting at a small round wooden table in a warm "
            "independent cafe. They are looking down at a smartphone, which "
            "shows the layout of a clean restaurant menu webpage — two columns "
            "of food photographs — but no readable text on screen. Soft natural "
            "daylight from a side window. A small potted plant and a ceramic "
            "mug sit on the table. Warm neutral palette: cream walls, wood, "
            "soft greens. Shot on Canon EOS R5 with 35mm lens at f/2.5, candid "
            "documentary feel. No readable text on the phone screen, no brand "
            "logos."
        ),
    ),
    (
        "section-dashboard",
        "1536x1024",
        (
            "Editorial photograph of an independent restaurant owner in their "
            "late thirties at a back-of-house counter at the end of dinner "
            "service. They review analytics on an open laptop with a quiet "
            "satisfied half-smile. The laptop screen shows the abstract shape "
            "of a dashboard interface — bar charts and a sparkline — but no "
            "readable text or specific brand UI. Stainless-steel kitchen "
            "equipment is slightly out of focus behind them. Warm evening "
            "tungsten lighting. A half-finished mug of coffee next to the "
            "laptop. Shot on Sony A7R IV with 50mm lens at f/2, candid "
            "documentary feel. No readable text on screen, no software brand "
            "visible."
        ),
    ),
    (
        "portrait-1",
        "1024x1024",
        (
            "Editorial documentary headshot photograph of a middle-aged "
            "Asian-American man in his forties. Head and shoulders framing, "
            "kind warm natural expression, plain button-down shirt with no "
            "visible logos. Restaurant interior background softly out of "
            "focus, warm natural light. Shot on Fujifilm X-T5 with 56mm lens "
            "at f/2. Natural skin tones. No readable signage, no brand logos."
        ),
    ),
    (
        "portrait-2",
        "1024x1024",
        (
            "Editorial documentary headshot photograph of a middle-aged "
            "Caucasian woman in her late thirties. Head and shoulders framing, "
            "calm confident expression, a simple clean apron at the lower edge "
            "of frame with no brand markings. Kitchen background softly "
            "blurred, warm natural light. Shot on Fujifilm X-T5 with 56mm lens "
            "at f/2. Natural skin tones. No readable text, no brand logos."
        ),
    ),
    (
        "portrait-3",
        "1024x1024",
        (
            "Editorial documentary headshot photograph of a middle-aged Latino "
            "man in his early forties. Head and shoulders framing, thoughtful "
            "gentle smile, simple polo shirt with no logos. Restaurant dining "
            "room softly blurred behind, soft natural daylight. Shot on Sony "
            "A7R IV with 85mm lens at f/2. Natural skin tones. No visible "
            "signage."
        ),
    ),
    (
        "portrait-4",
        "1024x1024",
        (
            "Editorial documentary headshot photograph of a middle-aged South "
            "Asian woman in her late thirties or early forties. Head and "
            "shoulders framing, warm relaxed smile, simple cardigan or blouse "
            "with no brand logos. Restaurant front-of-house background "
            "blurred, warm afternoon light. Shot on Canon EOS R5 with 85mm "
            "lens at f/2. Natural skin tones. No readable text behind subject."
        ),
    ),
    (
        "portrait-5",
        "1024x1024",
        (
            "Editorial documentary headshot photograph of a middle-aged "
            "Caucasian man in his late forties with a short well-groomed "
            "beard, slight smile. Head and shoulders framing, plain knit "
            "pullover sweater with no visible logos. Cozy New-England-style "
            "neighborhood cafe interior softly out of focus behind, warm "
            "late-afternoon light. Shot on Fujifilm X-T5 with 56mm lens at "
            "f/2. Natural skin tones. No readable signage, no brand logos."
        ),
    ),
    (
        "portrait-6",
        "1024x1024",
        (
            "Editorial documentary headshot photograph of a middle-aged "
            "Latina woman in her early forties with shoulder-length dark "
            "hair. Head and shoulders framing, warm professional smile, "
            "simple cotton blouse with no visible logos. Restaurant "
            "front-of-house background softly blurred behind, warm natural "
            "daylight from a side window. Shot on Canon EOS R5 with 85mm "
            "lens at f/2. Natural skin tones. No readable text, no brand "
            "logos."
        ),
    ),
    (
        "portrait-7",
        "1024x1024",
        (
            "Editorial documentary headshot photograph of a middle-aged "
            "Caucasian man in his late forties with weather-tanned skin and "
            "a salt-and-pepper short beard. Head and shoulders framing, "
            "friendly genuine smile, plain checkered flannel shirt with no "
            "visible logos. Pacific-Northwest seafood-restaurant interior "
            "softly out of focus behind, cool natural daylight from a side "
            "window. Shot on Sony A7R IV with 85mm lens at f/2. Natural "
            "skin tones. No readable signage, no brand logos."
        ),
    ),
    (
        "portrait-8",
        "1024x1024",
        (
            "Editorial documentary headshot photograph of a middle-aged "
            "Eastern-European woman in her late thirties or early forties, "
            "hair gathered loosely back. Head and shoulders framing, warm "
            "reserved smile, simple cardigan over a plain top with no "
            "visible logos. Cozy bistro interior softly blurred behind, "
            "warm tungsten lighting. Shot on Fujifilm X-T5 with 56mm lens "
            "at f/2. Natural skin tones. No readable text, no brand logos."
        ),
    ),
    (
        # SEO + AI search section image — a diner who just found this
        # restaurant via search, standing outside its warm-lit entrance.
        "section-seo",
        "1536x1024",
        (
            "Editorial documentary photograph at early evening blue hour: a "
            "young customer in their late twenties stands on the sidewalk "
            "just outside the entrance of a small warm-lit neighborhood "
            "Asian restaurant, looking down at the iPhone in their hands. "
            "The phone screen shows an abstract restaurant-finder result "
            "card: a square food photo at the top and three blurred "
            "horizontal grey bars below representing a name, address and "
            "review snippet — no readable text on screen. The restaurant's "
            "warm interior glow is visible through the glass storefront "
            "behind the customer, with soft figures of diners inside. Cool "
            "evening blue street light contrasts with the warm interior "
            "tungsten. Shot on Sony A7R IV with 50mm lens at f/1.8, shallow "
            "depth of field on the phone screen and the customer's hand. "
            "Natural skin tones, cinematic color grade. No readable text "
            "anywhere, no Google logo, no Apple logo, no Maps icon, no "
            "visible brand logos."
        ),
    ),
]


def call_openai(key: str, size: str, prompt: str) -> dict:
    """POST to OpenAI image API, return the first `data` entry.

    Retries on transient failures (timeout, 5xx, 429) up to MAX_RETRIES.

    NOTE: `response_format` was removed from the API circa 2026. The
    endpoint now returns either `url` (temporary CDN link) or `b64_json`
    (base64-encoded bytes) depending on the model. Caller handles both.
    """
    body = json.dumps(
        {
            "model": "gpt-image-2",
            "prompt": prompt,
            "n": 1,
            "size": size,
            "quality": "high",
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    last_err: Exception | None = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            with urllib.request.urlopen(req, timeout=API_TIMEOUT_S) as r:
                resp = json.loads(r.read().decode("utf-8"))
            return resp["data"][0]
        except urllib.error.HTTPError as e:
            # 4xx (except 429) are not retryable — bubble up immediately.
            if e.code != 429 and 400 <= e.code < 500:
                raise
            last_err = e
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
            last_err = e

        if attempt < MAX_RETRIES:
            wait = RETRY_BACKOFF_S * attempt
            print(f"    retry {attempt}/{MAX_RETRIES - 1} in {wait}s ({last_err})", flush=True)
            time.sleep(wait)

    assert last_err is not None
    raise last_err


def save_image_entry(entry: dict, dest: Path) -> None:
    """Write image bytes from a `data[i]` entry to `dest`, handling both
    `url` (download) and `b64_json` (base64-decode) response shapes."""
    import base64

    if entry.get("b64_json"):
        dest.write_bytes(base64.b64decode(entry["b64_json"]))
        return
    if entry.get("url"):
        with urllib.request.urlopen(entry["url"], timeout=120) as r, dest.open("wb") as f:
            f.write(r.read())
        return
    raise RuntimeError(f"unexpected image entry shape: keys={list(entry.keys())}")


def main() -> int:
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        print("ERROR: OPENAI_API_KEY env var not set", file=sys.stderr)
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    failed: list[str] = []
    for idx, (name, size, prompt) in enumerate(JOBS, 1):
        dest = OUT_DIR / f"{name}.jpg"
        if dest.exists():
            print(f"[{idx}/{len(JOBS)}] {name}: already exists, skipping")
            continue

        print(f"[{idx}/{len(JOBS)}] {name}: generating ({size}) …", flush=True)
        try:
            entry = call_openai(key, size, prompt)
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", "replace")[:500]
            print(f"  HTTP {e.code}: {body}", file=sys.stderr)
            failed.append(name)
            continue
        except Exception as e:
            print(f"  ERROR: {e}", file=sys.stderr)
            failed.append(name)
            continue

        try:
            save_image_entry(entry, dest)
        except Exception as e:
            print(f"  save failed: {e}", file=sys.stderr)
            failed.append(name)
            continue

        print(f"  → saved {dest.relative_to(REPO_ROOT)}")

    print()
    if failed:
        print(f"Done with {len(failed)} failures: {', '.join(failed)}")
        return 1
    print(f"Done. {len(JOBS)} images in {OUT_DIR.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
