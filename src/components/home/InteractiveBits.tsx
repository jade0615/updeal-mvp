'use client';

/**
 * Client-side interactive bits used by the v10 home page (src/app/page.tsx).
 *
 * Two pieces of state kept in one file so page.tsx can stay a server
 * component (and keep its static `metadata` export, which client
 * components can't host).
 *
 *   - RoiSliders   — three sliders (orders / AOV / commission) feeding a
 *                    live "annual upside" estimate against a fixed
 *                    direct-order lift assumption and a flat platform fee
 *   - FaqAccordion — single-open expand/collapse FAQ
 *
 * Visual is intentionally v10 native — neutral whites + dp-* tokens +
 * dp-red accents. Italic Playfair is used only for the big upside number
 * (matches the rest of the v10 page where serif italic is reserved for a
 * single emphasis word per section).
 */

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FaqItem {
  q: string;
  a: string;
}

// ─── RoiSliders ──────────────────────────────────────────────────────────────

const PLATFORM_FEE_USD = 299;
const DIRECT_LIFT_PCT = 0.21;
const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

export function RoiSliders() {
  const [orders, setOrders] = useState(800);
  const [aov, setAov] = useState(32);
  const [commissionPct, setCommissionPct] = useState(25);

  const monthlyVolume = orders * aov;
  const commissionSaved = Math.round((monthlyVolume * commissionPct) / 100);
  const directRevenueLift = Math.round(monthlyVolume * DIRECT_LIFT_PCT);
  const netMonthlyUpside = commissionSaved + directRevenueLift - PLATFORM_FEE_USD;
  const annualUpsideK = Math.max(0, Math.round((netMonthlyUpside * 12) / 1000));

  return (
    <>
      {/* Slider thumb styling — scoped to .roi-slider so it can't collide. */}
      <style>{`
        .roi-slider {
          -webkit-appearance: none;
          appearance: none;
          background: #E5E5E5;
          height: 4px;
          border-radius: 9999px;
          outline: none;
          width: 100%;
          cursor: pointer;
        }
        .roi-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #FF503C;
          box-shadow: 0 0 0 3px #FFFFFF, 0 1px 4px rgba(0,0,0,0.18);
          border: 0;
          cursor: pointer;
        }
        .roi-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #FF503C;
          box-shadow: 0 0 0 3px #FFFFFF, 0 1px 4px rgba(0,0,0,0.18);
          border: 0;
          cursor: pointer;
        }
      `}</style>

      <div className="rounded-3xl p-6 sm:p-10 lg:p-12 bg-dp-bg ring-1 ring-dp-divider">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: sliders */}
          <div>
            <div className="space-y-7">
              <RoiSliderRow
                label="Online orders per month"
                displayValue={orders.toString()}
                value={orders}
                onChange={setOrders}
                min={100}
                max={2000}
                step={50}
              />
              <RoiSliderRow
                label="Average order value"
                displayValue={`$${aov}`}
                value={aov}
                onChange={setAov}
                min={15}
                max={80}
                step={1}
              />
              <RoiSliderRow
                label="Current marketplace commission"
                displayValue={`${commissionPct}%`}
                value={commissionPct}
                onChange={setCommissionPct}
                min={10}
                max={35}
                step={1}
              />
            </div>
            <p className="mt-8 text-[12.5px] leading-relaxed text-dp-muted">
              Assumptions: 21 % lift in direct orders from going direct,
              ${PLATFORM_FEE_USD}/mo Hiraccoon platform fee. Your numbers
              will vary — these are illustrative.
            </p>
          </div>

          {/* Right: result card — matches v10 FinalCTA dark walnut */}
          <div
            className="rounded-2xl p-6 sm:p-8 lg:p-10 text-white"
            style={{ background: '#0f1011' }}
          >
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/60">
              Estimated annual upside
            </p>
            <p
              className="font-bold leading-none mt-2 tabular-nums text-dp-red tracking-tight"
              style={{ fontSize: 'clamp(48px, 7.5vw, 80px)' }}
            >
              ${annualUpsideK}k
            </p>
            <p className="mt-2 text-[13.5px] sm:text-[14px] leading-relaxed text-white/70">
              Net of platform cost — money that stays with your restaurant,
              not the apps.
            </p>
            <div className="mt-6 pt-6 border-t border-white/10 space-y-3 text-[13.5px] sm:text-[14px]">
              <RoiCalcRow
                label="Commission saved / mo"
                value={`+${usd(commissionSaved)}`}
                positive
              />
              <RoiCalcRow
                label="New direct revenue / mo"
                value={`+${usd(directRevenueLift)}`}
                positive
              />
              <RoiCalcRow
                label="Hiraccoon platform / mo"
                value={`−${usd(PLATFORM_FEE_USD)}`}
                negative
              />
              <div className="pt-3 mt-3 flex items-center justify-between text-[14.5px] sm:text-[15px] font-semibold border-t border-white/10">
                <span>Net monthly upside</span>
                <span className="tabular-nums text-dp-red">
                  +{usd(Math.max(0, netMonthlyUpside))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function RoiSliderRow({
  label,
  displayValue,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  displayValue: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[14.5px] sm:text-[15px] font-medium text-dp-ink">
          {label}
        </span>
        <span className="text-[18px] sm:text-[20px] font-bold tabular-nums tracking-tight text-dp-red">
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        className="roi-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
      />
    </div>
  );
}

function RoiCalcRow({
  label,
  value,
  positive,
  negative,
}: {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}) {
  let cls = 'text-white';
  if (positive) cls = 'text-dp-red';
  if (negative) cls = 'text-white/55';
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/70">{label}</span>
      <span className={`${cls} tabular-nums`}>{value}</span>
    </div>
  );
}

// ─── FaqAccordion ────────────────────────────────────────────────────────────

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div>
      {items.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <div
            key={item.q}
            className="py-6"
            style={{ borderTop: i === 0 ? 'none' : '1px solid var(--color-dp-divider)' }}
          >
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full flex items-start justify-between gap-6 text-left"
            >
              <span className="text-[17px] sm:text-[18px] font-semibold leading-snug text-dp-ink">
                {item.q}
              </span>
              <span
                aria-hidden
                className={`shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full transition ${
                  isOpen ? 'bg-dp-red text-white' : 'bg-dp-bg text-dp-ink-soft'
                }`}
              >
                {isOpen ? <Minus className="h-4 w-4" strokeWidth={2.5} /> : <Plus className="h-4 w-4" strokeWidth={2.5} />}
              </span>
            </button>
            {isOpen && (
              <p className="mt-4 max-w-[760px] text-[15px] sm:text-[15.5px] leading-[1.65] text-dp-ink-soft">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
