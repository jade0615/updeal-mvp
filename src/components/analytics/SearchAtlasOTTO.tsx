'use client';

/**
 * SearchAtlas OTTO — Dynamic Optimization pixel.
 *
 * Source-code mirror of the Custom HTML tag we (will) also wire through
 * GTM-MLF6LPW2 → Tag → SearchAtlas OTTO (Ya, 2026-05-26). Code copy is
 * here as a temporary belt-and-suspenders so the pixel ships today
 * regardless of whether the GTM-side configuration has been published
 * yet.
 *
 * ⚠ When the GTM tag is verified Fired (GTM Preview, or DevTools search
 * for "sa-dynamic-optimization" in head), delete this file and the
 * <SearchAtlasOTTO /> mount in src/app/layout.tsx so the pixel is
 * sourced from GTM only (single source of truth).
 *
 * Script body is a 1:1 copy of the snippet SearchAtlas dashboard hands
 * out (UUID 3353c721-...-b554909171b5). The `nowprocket` / `nitro-exclude`
 * attributes are no-ops for us (they're WP-Rocket / NitroPack opt-outs)
 * but kept verbatim so we don't drift from the dashboard-supplied tag.
 */

import Script from 'next/script';

export default function SearchAtlasOTTO() {
    return (
        <Script
            id="sa-dynamic-optimization-loader"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
                __html: `var script = document.createElement("script");
script.setAttribute("nowprocket", "");
script.setAttribute("nitro-exclude", "");
script.src = "https://dashboard.searchatlas.com/scripts/dynamic_optimization.js";
script.dataset.uuid = "3353c721-0284-4cb4-bbb6-b554909171b5";
script.id = "sa-dynamic-optimization";
document.head.appendChild(script);`,
            }}
        />
    );
}
