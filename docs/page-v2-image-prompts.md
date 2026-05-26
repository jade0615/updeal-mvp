# Page v2 — Image Prompts

The redesigned home (`src/app/page.tsx` v9, 2026-05-27) references 8 editorial
images at known filenames. Generate each one, drop it under
`public/ai/v2/<filename>.jpg`, and the page will pick it up without any code
change.

## General guidance

- **Tone**: warm, editorial, documentary — feels like a small-business profile
  piece in a food magazine, not a stock-photo SaaS marketing site.
- **Subject demographics**: vary across the 8 images. The brand serves
  independent restaurants (mostly Chinese, Japanese, Korean, SE-Asian,
  Latin) across NYC / Orlando / Bay Area, so subjects should reflect that
  mix and not default to a single ethnicity.
- **Avoid**:
  - Any readable text on screens, signage, menus or aprons (Midjourney
    text rendering is unreliable and we don't want fabricated brand names).
  - The Apple Wallet logo or any Apple-branded UI. We'll show the generic
    *idea* of a pass on a phone — never a literal Apple Wallet screenshot.
  - Stock-photo composite vibes (perfect smile, white background, business
    suit).
  - AI artifacts: extra fingers, melted faces, distorted hands.
  - Brand logos in background (DoorDash, UberEats, Coca-Cola, etc.) — let
    backgrounds stay generic.
- **Color palette**: warm wood, warm tungsten, off-white walls, slight
  green from indoor plants. No bright blue / cyan / purple gradients —
  those scream "AI image". dp-red (`#FF503C`) only appears in CTAs in the
  code, not in photographs.
- **Aspect ratios** are listed per image — match exactly so the layout
  doesn't shift.

If your image generator supports negative prompts, append:
`--no text, logos, brand names, watermarks, distorted hands, extra fingers, cartoon, illustration, 3d render, low quality`

---

## 1. `public/ai/v2/hero-counter.jpg` — Hero image

- **Used in**: top-of-page Hero, right column
- **Aspect ratio**: 4:5 (portrait)
- **Display size**: ~520×650 px on desktop, full-width on mobile
- **Subject**: A neighbourhood restaurant counter at the moment of a
  pickup hand-off. An owner (any ethnicity, 35-55) is sliding a paper
  takeout bag across the counter toward a customer (20s-30s) who is
  holding their iPhone tilted up slightly — the screen is facing the
  owner. The customer's expression is mid-smile, the owner is making eye
  contact.

### Midjourney v6 prompt

```
editorial documentary photograph of an independent neighbourhood restaurant
counter at golden hour, a smiling restaurant owner in their forties handing a
white paper takeout bag across a warm wooden counter to a young customer who
is holding up an iPhone with the screen tilted toward the owner, soft late
afternoon sunlight filtering through a front window, warm wood tones, a
chalkboard menu partially visible behind the counter but text not readable,
fresh herbs and a small potted plant on the counter, candid moment of human
connection, Fujifilm GFX 100 with 80mm lens at f/2, shallow depth of field
on the customer's hands, warm cinematic color grade, natural skin tones,
no readable text anywhere, no brand logos --ar 4:5 --style raw --v 6
```

### DALL-E 3 alternative phrasing

> Editorial documentary photograph of a small restaurant counter at golden
> hour. A restaurant owner in their forties hands a paper takeout bag across
> the counter to a young customer who holds up an iPhone tilted toward the
> owner. Soft late-afternoon light through a front window, warm wood
> counter, blurred chalkboard menu behind. Shallow depth of field, candid
> warm tone. No readable text or visible brand logos. Portrait 4:5.

---

## 2. `public/ai/v2/section-wallet.jpg` — Wallet product section

- **Used in**: first product section (#wallet), right column
- **Aspect ratio**: 5:4 (landscape)
- **Display size**: ~560×450 px on desktop
- **Subject**: Close-up of a customer's hands holding an iPhone at chest
  height, the phone screen lit and showing the *shape* of a digital pass
  (rounded card with a colored top band, a barcode-like region at the
  bottom) — but no readable text. Restaurant interior softly out of focus
  in the background, warm evening tungsten lighting on the customer's
  hands.

### Midjourney v6 prompt

```
editorial close-up photograph of a young person's hands holding an iPhone at
chest height, the iPhone screen brightly lit showing the silhouette of a
generic rounded loyalty pass with a warm-colored top band and a faint
barcode region at the bottom, no readable text, slightly out-of-focus warm
restaurant interior behind, evening tungsten lighting, soft reflections on
the phone glass, Sony A7R IV with 85mm lens at f/1.8, shallow depth of field
focused on the phone screen, warm color grade, no Apple Wallet logo visible,
no brand markings on the pass, no readable typography --ar 5:4 --style raw --v 6
```

### DALL-E 3 alternative phrasing

> Editorial close-up of a young customer's hands holding an iPhone at chest
> height. The phone screen shows the rounded shape of a generic loyalty
> pass with a warm-colored top band and a barcode-region at the bottom —
> no readable text. Background is a softly-blurred warm restaurant
> interior with evening tungsten lighting. Shallow depth of field. No
> Apple branding, no readable text. Landscape 5:4.

---

## 3. `public/ai/v2/section-storefront.jpg` — Storefront product section

- **Used in**: second product section (#storefront), left column (flipped)
- **Aspect ratio**: 5:4 (landscape)
- **Display size**: ~560×450 px on desktop
- **Subject**: A young customer sitting at a small wooden cafe table,
  looking down at their smartphone. The phone screen shows the *shape* of
  a clean restaurant menu webpage — food photos in a 2-column grid, but
  no readable text. Warm interior with potted plants behind, side window
  daylight.

### Midjourney v6 prompt

```
editorial lifestyle photograph of a young casual customer in their late
twenties sitting at a small round wooden table in a warm independent cafe,
looking down at a smartphone in their hands, the phone screen shows a clean
restaurant menu webpage with two columns of food photographs but no
readable text on screen, soft natural daylight from a side window, a small
potted plant and a mug on the table, warm neutral color palette of cream
walls and wood, Canon EOS R5 with 35mm lens at f/2.5, candid documentary
feel, no readable text on the phone screen, no brand logos visible
--ar 5:4 --style raw --v 6
```

### DALL-E 3 alternative phrasing

> Editorial lifestyle photograph of a young customer in their late twenties
> at a small wooden cafe table, looking down at a smartphone showing the
> shape of a clean restaurant menu webpage (two columns of food photos, no
> readable text). Warm interior with potted plants and side-window daylight.
> Candid documentary mood, warm neutral tones. No brand logos. Landscape
> 5:4.

---

## 4. `public/ai/v2/section-dashboard.jpg` — Dashboard product section

- **Used in**: third product section (#dashboard), right column
- **Aspect ratio**: 5:4 (landscape)
- **Display size**: ~560×450 px on desktop
- **Subject**: A restaurant owner (mid-30s to mid-40s) sitting at a back-of-
  house counter at the end of service, reviewing a laptop screen. The
  laptop screen shows the *shape* of an analytics dashboard — abstract
  bar charts, a number-grid, a sparkline — but no readable text or brand
  UI. Slight smile of satisfaction.

### Midjourney v6 prompt

```
editorial photograph of an independent restaurant owner in their late
thirties sitting at a back-of-house counter at end of service, reviewing
analytics on a laptop, the laptop screen shows the abstract shape of a
dashboard interface with bar charts and a sparkline but no readable text,
quiet satisfied half-smile, stainless steel kitchen equipment slightly out
of focus behind, warm evening lighting, a half-finished mug of coffee on
the counter, Sony A7R IV with 50mm lens at f/2, candid documentary feel,
no readable text on screen, no software brand visible, no logos
--ar 5:4 --style raw --v 6
```

### DALL-E 3 alternative phrasing

> Editorial photograph of a restaurant owner in their late thirties at a
> back-of-house counter at end of service, reviewing analytics on a
> laptop. Screen shows the abstract shape of a dashboard interface (bar
> charts, sparkline) — no readable text or brand UI. Soft satisfied smile,
> blurred kitchen equipment behind, warm evening light, half-finished mug
> of coffee. Documentary candid feel. Landscape 5:4.

---

## 5–8. Portraits — `public/ai/v2/portrait-1.jpg` … `portrait-4.jpg`

- **Used in**: Testimonials section, 2×2 grid
- **Aspect ratio**: 1:1 (square)
- **Display size**: rendered at 48×48 px (small avatar) but should be
  generated at higher res so it stays sharp. **1024×1024 minimum.**

All four follow the same recipe — vary subject demographics and background
so the wall doesn't look like one person in 4 outfits.

### Shared Midjourney v6 base prompt

```
editorial documentary headshot photograph of {SUBJECT}, head and shoulders
framing, candid friendly natural expression, restaurant interior background
softly out of focus, warm natural light, photographed on Fujifilm X-T5 with
56mm lens at f/2, natural skin tones, smart casual wear with no visible
brand logos, no jewelry with readable text, no readable signage in
background --ar 1:1 --style raw --v 6
```

### Per-portrait `{SUBJECT}` slot

| File | Quoted as | `{SUBJECT}` |
|---|---|---|
| `portrait-1.jpg` | Marcus T., General Manager | a middle-aged East Asian or Asian-American man in his forties, kind warm expression, plain button-down shirt without logos |
| `portrait-2.jpg` | Lisa K., Owner | a middle-aged Caucasian or East Asian woman in her late thirties, calm confident expression, clean apron visible at lower edge with no brand markings |
| `portrait-3.jpg` | Daniel R., Operator | a middle-aged Latino man in his early forties, thoughtful gentle smile, simple polo shirt with no logos |
| `portrait-4.jpg` | Priya S., Owner | a middle-aged South Asian woman in her late thirties or early forties, warm relaxed smile, simple cardigan or blouse with no brand logos |

### DALL-E 3 alternative phrasing

> Editorial documentary headshot photograph of {SUBJECT}, head and
> shoulders framing, candid friendly expression, restaurant interior
> background softly blurred, warm natural light, natural skin tones, smart
> casual wear without visible brand logos, no readable signage behind
> subject. Square 1:1.

---

## After generating

1. Save each image as a `.jpg` (let your tool export at the listed aspect
   ratio — don't re-crop manually).
2. Drop into `D:\workspace\code\0513\updeal-mvp\public\ai\v2\` with the
   exact filename in the H2 header above (case-sensitive, lowercase).
3. Restart / refresh the dev server (Next.js Turbopack will hot-reload
   the page).
4. If something is off (face too distorted, wrong vibe), regenerate with
   tweaks — the prompts are starting points, iterate from there.

## When all 8 are in place

Tell the team and we'll commit + push. Vercel will deploy automatically.
Until the images land, the page will render with light grey placeholder
boxes where each image goes — that is expected and not a bug.
