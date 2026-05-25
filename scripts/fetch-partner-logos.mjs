/**
 * Try to fetch real brand logos for the partner-wall marquee via Clearbit's
 * free Logo API. Saves PNGs into `public/partners-grid/`.
 *
 * Clearbit returns 404 for many small chains. Anything we can't fetch we
 * leave for the styled text-mark fallback rendered in page.tsx.
 *
 * Run:
 *   HTTPS_PROXY=http://127.0.0.1:7890 node scripts/fetch-partner-logos.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { ProxyAgent, setGlobalDispatcher } from 'undici';

const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
if (proxy) {
  setGlobalDispatcher(new ProxyAgent(proxy));
  console.log(`(proxy ${proxy})`);
}

const OUT = path.resolve('public/partners-grid');
await fs.mkdir(OUT, { recursive: true });

// slug + domain to try via Clearbit Logo API. Slug names match the IDs we
// use in page.tsx so the file path stays predictable.
const TARGETS = [
  // Big bubble tea / dessert chains
  { slug: 'kung-fu-tea', domains: ['kungfutea.com'] },
  { slug: 'tsaocaa', domains: ['tsaocaa.com'] },
  { slug: 'moge-tea', domains: ['mogetee.com', 'mogetea.com'] },
  { slug: 'lelecha', domains: ['lelecha.com'] },
  { slug: 'yomies', domains: ['yomiesriceyogurt.com', 'yomies.com'] },
  { slug: 'sweetberry', domains: ['sweetberrybowls.com'] },
  { slug: 'matcha-cafe-maiko', domains: ['matchacafemaiko.com'] },
  { slug: 'harmony-tea-bar', domains: ['harmonyteabar.com'] },

  // Korean BBQ / Japanese BBQ / hot pot
  { slug: 'kpot', domains: ['kpotusa.com', 'kpot.com'] },
  { slug: 'gyu-kaku', domains: ['gyu-kaku.com'] },
  { slug: 'volcano-bbq', domains: ['volcanobbqhotpot.com'] },
  { slug: 'de-zhuang', domains: ['dezhuangusa.com'] },

  // Ramen / Japanese
  { slug: 'kyuramen', domains: ['kyuramen.com'] },
  { slug: 'honoo-ramen', domains: ['honooramen.com'] },
  { slug: 'takara-sushi', domains: ['takarasushi.com'] },

  // Cajun seafood
  { slug: 'juicy-crab', domains: ['thejuicycrab.com'] },
  { slug: 'hook-reel', domains: ['hookreel.com'] },
  { slug: 'red-crab', domains: ['redcrab.com', 'redcrabseafood.com'] },
  { slug: 'fiery-crab', domains: ['fierycrab.com'] },

  // Restaurants
  { slug: 'friendship-bbq', domains: ['friendshipbbq.com'] },
  { slug: 'shaxian-snacks', domains: ['shaxiansnacks.com'] },
  { slug: 'mr-dimsum', domains: ['mrdimsum.com'] },
  { slug: 'ni-hao', domains: ['nihaorestaurant.com', 'nihao-restaurant.com'] },

  // Nail / Spa
  { slug: 'toudaotang', domains: ['toudaotang.com', 'newblissbeauty.com'] },
  { slug: 'crystal-nail', domains: ['crystalnailbar.com'] },
];

async function tryDomain(domain) {
  // Clearbit Logo API — free, no auth required.
  const url = `https://logo.clearbit.com/${domain}`;
  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') ?? '';
    if (!ct.startsWith('image/')) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 200) return null; // too small, probably a 1x1 placeholder
    return buf;
  } catch {
    return null;
  }
}

let okCount = 0;
let missCount = 0;
for (const target of TARGETS) {
  const dest = path.join(OUT, `${target.slug}.png`);
  try {
    await fs.access(dest);
    console.log(`• ${target.slug} — exists, skip`);
    okCount++;
    continue;
  } catch {}

  let buf = null;
  let from = '';
  for (const d of target.domains) {
    buf = await tryDomain(d);
    if (buf) {
      from = d;
      break;
    }
  }
  if (buf) {
    await fs.writeFile(dest, buf);
    console.log(`✓ ${target.slug} ← ${from} (${Math.round(buf.length / 1024)}KB)`);
    okCount++;
  } else {
    console.log(`✗ ${target.slug} — no logo found (will use text mark)`);
    missCount++;
  }
}

console.log(`\nDone. ${okCount} found, ${missCount} missing.`);
