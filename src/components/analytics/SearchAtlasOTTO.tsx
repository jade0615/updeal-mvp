'use client';

/**
 * SearchAtlas OTTO — Dynamic Optimization pixel.
 *
 * Asked by Ya (2026-05-26). Ya's recommended install path was via
 * GTM-MLF6LPW2 → Custom HTML tag, but the GTM container that's hard-
 * coded into <GoogleTagManager /> isn't accessible from any Google
 * account we currently hold (jade's account has the bestbuffet Google
 * tag G-975727PZRZ / GT-M6XF2Q4X but no GTM container, see
 * 2026-05-27 Tag Manager Accounts page = empty). The container's owner
 * is unknown / lost.
 *
 * Decision (2026-05-27): keep the pixel sourced from this file
 * indefinitely — it's the single source of truth for SearchAtlas OTTO
 * on hiraccoon.com. Don't delete this file expecting GTM to take over;
 * GTM won't.
 *
 * Script body is a 1:1 copy of the snippet SearchAtlas dashboard hands
 * out (UUID 3353c721-...-b554909171b5). The `nowprocket` / `nitro-exclude`
 * attributes are no-ops for us (they're WP-Rocket / NitroPack opt-outs)
 * but kept verbatim so we don't drift from the dashboard-supplied tag.
 *
 * Verification: load any page on hiraccoon.com → DevTools → Console →
 *   document.getElementById('sa-dynamic-optimization')
 * should return the injected <script> element.
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
