/**
 * Generate placeholder food/restaurant photography for the home page via
 * OpenAI's `gpt-image-1`. Saves PNGs into `public/ai/`.
 *
 * Run with:
 *   OPENAI_API_KEY="sk-..." node scripts/generate-ai-images.mjs
 *
 * The key is read from env — never hardcoded in this file and never logged.
 * Falls back to dall-e-3 if gpt-image-1 isn't available on the account.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { ProxyAgent, setGlobalDispatcher } from 'undici';

// Node's built-in fetch (undici) doesn't read HTTPS_PROXY by default —
// route every request through it when the env var is set.
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
if (proxy) {
  setGlobalDispatcher(new ProxyAgent(proxy));
  console.log(`(routing through proxy ${proxy})`);
}

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('Missing OPENAI_API_KEY env var');
  process.exit(1);
}

const OUT = path.resolve('public/ai');
await fs.mkdir(OUT, { recursive: true });

const NEGATIVE = 'No people, no faces, no readable text, no logos, no watermark, no signage, no menu words.';

const FEATURE_PHOTO_STYLE =
  'Real 35mm studio product photograph in the style of Apple keynote product photography or a high-end Verge/Wired review. Sharp focus on the device or object in the foreground, gentle natural drop shadow underneath, soft warm-cream seamless background, photographic grain, glossy realistic glass reflections on any screen surface. The image MUST read as a real photograph — NOT illustration, NOT 3D CGI render, NOT vector art, NOT cartoon, NOT flat graphic design. The screen content must look like a real UI screenshot photographed through real glass, not a hand-drawn or flat vector mockup. No watermark, no logos visible outside the rendered screen UI, no readable brand names.';

const PORTRAIT_STYLE =
  'Editorial documentary photograph of a small-business owner at work inside their own restaurant. Environmental portrait — the person stands or leans naturally in the foreground, restaurant scene clearly visible (but softly blurred) behind them. Warm ambient lighting from pendant lamps or a window. Sharp focus on the face, shallow depth-of-field on the background. Looking gently into the camera with a relaxed, friendly expression. Style cues: Bon Appétit / New York Times food-section photography, 50mm lens, candid editorial feel, photo-realistic, magazine quality. No text, no readable signage, no logos, no watermark, no menu boards in focus.';

const JOBS = [
  {
    file: 'hero-storefront.png',
    size: '1536x1024',
    prompt:
      'Top-down food photo of a beautifully plated independent-restaurant dish on a clean white ceramic plate. Vibrant seasonal vegetables, glossy sauce, a single sprig of herb. Warm late-afternoon natural light coming from the upper left. Subtle linen napkin and a small ceramic bowl in the corner. Cinematic and inviting, photographic, professional food photography, magazine quality, 35mm look. ' +
      NEGATIVE,
  },
  {
    file: 'mockup-storefront.png',
    size: '1536x1024',
    prompt:
      'Wide warm interior of an independent neighborhood restaurant photographed during golden hour. Counter in the foreground with a couple of pastries and a small ceramic vase with a sprig of greens. Soft bokeh background suggesting wooden shelves and a few hanging pendant lights. Cozy, inviting, photographic, no people in frame. Color palette skews warm oranges, terracotta, and cream. ' +
      NEGATIVE,
  },
  {
    file: 'menu-1.png',
    size: '1024x1024',
    prompt:
      'Square top-down product photo of a single signature main-course dish from an independent restaurant: glossy noodles or grain bowl with vibrant garnishes, on a small dark ceramic plate over a warm tabletop. Studio-soft light, professional food photography, magazine quality. ' +
      NEGATIVE,
  },
  {
    file: 'menu-2.png',
    size: '1024x1024',
    prompt:
      'Square top-down photo of a colorful appetizer plate from an independent restaurant: bite-sized pieces with a small dipping bowl, fresh herbs. White round plate, warm tabletop. Professional food photography, soft natural light. ' +
      NEGATIVE,
  },
  {
    file: 'menu-3.png',
    size: '1024x1024',
    prompt:
      'Square top-down photo of a fresh plant-based bowl from an independent restaurant: bright vegetables, grains, a drizzle of sauce, in a wooden bowl on a warm tabletop. Professional food photography, soft natural light. ' +
      NEGATIVE,
  },
  {
    file: 'menu-4.png',
    size: '1024x1024',
    prompt:
      'Square top-down photo of a hearty grain bowl from an independent restaurant: rice, roasted vegetables, protein, sesame seed garnish, in a ceramic bowl on a warm wooden table. Professional food photography, soft natural light. ' +
      NEGATIVE,
  },

  // ─── 4 environmental portraits — each subject is photographed inside the
  // type of small business their testimonial corresponds to. Background is
  // softly blurred but clearly readable as a restaurant scene.
  {
    file: 'portrait-1.png',
    size: '1024x1024',
    prompt:
      'Asian-American middle-aged man, short dark hair greying at the temples, kind eyes, simple navy button-down shirt with sleeves rolled. He stands relaxed at the wood-grained host stand of a small family-style diner — leather booths and warm pendant lights softly blurred behind him. He has one hand resting on the counter, the other casually at his side. Soft confident smile. ' +
      PORTRAIT_STYLE,
  },
  {
    file: 'portrait-2.png',
    size: '1024x1024',
    prompt:
      'Light-skinned woman in her early thirties with light brown wavy hair pulled into a loose half-up style, a few freckles, wearing a soft cream cable-knit sweater under a linen apron. She stands behind a small neighborhood coffee shop counter, an espresso machine and a small pastry case softly blurred behind her. Late-afternoon light streams in from a window on the right. Warm friendly smile. ' +
      PORTRAIT_STYLE,
  },
  {
    file: 'portrait-3.png',
    size: '1024x1024',
    prompt:
      'Latino man in his late thirties, dark short hair, neatly trimmed beard, wearing a simple grey chef-jacket-style top with the top button undone. He stands at the open pass of a small neighborhood grill — warm heat lamps and a copper hood softly out of focus behind him. Calm confident half-smile, arms crossed loosely. ' +
      PORTRAIT_STYLE,
  },
  {
    file: 'portrait-4.png',
    size: '1024x1024',
    prompt:
      'South Asian woman in her mid-thirties, long dark hair partly pulled back, small gold stud earrings, wearing a deep-mustard-tone blouse. She stands at the wooden front counter of a small family-run kitchen — shelves of glass spice jars and a warm wooden ceiling softly blurred behind her. Late-afternoon golden light. Relaxed warm smile. ' +
      PORTRAIT_STYLE,
  },

  // ─── 6 clean studio product photographs. Subject = device or object that
  // directly represents the feature. Minimal background, no elaborate scene.
  // Real-photo rendering, not illustration.
  {
    file: 'feature-wallet.png',
    size: '1024x1024',
    prompt:
      'A real modern iPhone, held lightly in a hand at a slight angle, against a soft warm cream seamless background. The iPhone screen clearly displays a single Apple Wallet pass card — vertical card with rounded corners, deep coral-orange gradient background, a large bold "20% OFF" headline near the top, a small line of text below it, and a thin horizontal barcode strip at the bottom of the card. Realistic glossy glass reflection on the screen surface. Sharp focus on the device. ' +
      FEATURE_PHOTO_STYLE,
  },
  {
    file: 'feature-storefront.png',
    size: '1024x1024',
    prompt:
      'A real modern iPhone resting on a warm wooden surface, captured at slight angle, against a soft cream seamless background. The iPhone screen clearly shows a restaurant landing page: a warm peach-toned food photo filling the upper half, a row of star-rating shapes, a short title line, two short paragraphs of muted body text, and a coral pill-shaped CTA button at the bottom — all looking like a real UI screenshot photographed through real glass. Realistic glass reflection. Sharp focus on the device. ' +
      FEATURE_PHOTO_STYLE,
  },
  {
    file: 'feature-ordering.png',
    size: '1024x1024',
    prompt:
      'A real modern iPhone held lightly in a hand at a slight angle, against a soft warm peach seamless background. The screen clearly shows a food-ordering app interface: three stacked menu-item rows (each row has a small square food photo on the left, two short text lines in the middle, a small price on the right, and a tiny "+" button), and a coral checkout bar pinned at the bottom — looking like a real UI screenshot. Realistic glass reflection. Sharp focus. ' +
      FEATURE_PHOTO_STYLE,
  },
  {
    file: 'feature-dashboard.png',
    size: '1024x1024',
    prompt:
      'A real modern slim MacBook, open and tilted at slight angle, on a warm wooden surface against a soft cream seamless background. The laptop screen clearly displays an analytics dashboard: a top row of three rectangular stat tiles each with a large bold number, a colorful bar chart with five rising warm coral-orange bars in the middle, and a thin curving trend line beneath the bars — all looking like a real UI screenshot photographed through real glass. Soft realistic screen reflection. Sharp focus. ' +
      FEATURE_PHOTO_STYLE,
  },
  {
    file: 'feature-reengagement.png',
    size: '1024x1024',
    prompt:
      'A real modern iPhone lying face-up on a soft warm-cream seamless background, captured from slightly above. The screen clearly shows a single notification banner sliding down from the top edge of the screen — a soft white rounded card containing a small gift-box icon on the left and two short text lines suggesting a message. Below the banner, the rest of the screen is a soft restaurant photo lockscreen wallpaper. Realistic glass reflection. Sharp focus. ' +
      FEATURE_PHOTO_STYLE,
  },
  {
    file: 'feature-ownership.png',
    size: '1024x1024',
    prompt:
      'A small leather-bound reservation notebook open on a warm wooden surface against a soft cream seamless background. The notebook’s right page shows neatly handwritten ink lines suggesting customer names and notes (the writing is artistic ink scribbles, not literally readable). A fountain pen rests across the page. Sharp focus on the notebook, soft warm directional light. ' +
      FEATURE_PHOTO_STYLE,
  },
];

async function gen(model, prompt, size, opts = {}) {
  const body = { model, prompt, size, n: 1 };
  // dall-e-3 also needs response_format; gpt-image-1 returns b64 by default.
  if (model === 'dall-e-3') body.response_format = 'b64_json';
  // gpt-image-1 supports transparent PNG output via `background: 'transparent'`.
  if (model === 'gpt-image-1' && opts.transparent) body.background = 'transparent';
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = data?.error?.message ?? JSON.stringify(data);
    throw new Error(`${model} ${res.status}: ${err}`);
  }
  const b64 = data.data?.[0]?.b64_json;
  const url = data.data?.[0]?.url;
  if (b64) return Buffer.from(b64, 'base64');
  if (url) return Buffer.from(await (await fetch(url)).arrayBuffer());
  throw new Error('No image bytes in response');
}

for (const job of JOBS) {
  const dest = path.join(OUT, job.file);
  try {
    await fs.access(dest);
    console.log(`• ${job.file} — already exists, skipping`);
    continue;
  } catch {}

  let buf;
  try {
    buf = await gen('gpt-image-1', job.prompt, job.size, { transparent: job.transparent });
  } catch (e) {
    console.log(`• ${job.file} — gpt-image-1 failed (${e.message}), trying dall-e-3 fallback`);
    const fallbackSize = job.size === '1536x1024' ? '1792x1024' : '1024x1024';
    buf = await gen('dall-e-3', job.prompt, fallbackSize);
  }
  await fs.writeFile(dest, buf);
  console.log(`✓ ${job.file} — ${Math.round(buf.length / 1024)}KB`);
}

console.log('\nDone.');
