/**
 * Hiraccoon — Cancellation Policy.
 *
 * New page added 2026-05-25 per the platform contract. Orders go to the
 * Merchant for preparation promptly, so cancellation is the Merchant's
 * call once preparation has started.
 */
import React from 'react';
import type { Metadata } from 'next';
import LegalPage, {
  LegalSection,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
} from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Cancellation Policy — Hiraccoon',
  description:
    'How and when an order can be cancelled on the Hiraccoon platform.',
};

export default function CancellationPolicyPage() {
  return (
    <LegalPage title="Cancellation Policy" currentPath="/cancellation-policy">
      <LegalSection number={1} title="Cancelling an Order">
        <p>
          Because orders are sent to the Merchant for preparation promptly,
          cancellations are only possible before the Merchant begins
          preparing your order. To cancel, contact the Merchant directly
          as soon as possible using the contact details on their
          storefront or your order confirmation.
        </p>
      </LegalSection>

      <LegalSection number={2} title="Orders Already in Preparation">
        <p>
          Once preparation has begun, an order generally cannot be
          cancelled. Whether a refund applies in these cases is at the
          Merchant&rsquo;s discretion and subject to our Refund Policy.
        </p>
      </LegalSection>

      <LegalSection number={3} title="Merchant-Initiated Cancellations">
        <p>
          A Merchant may cancel an order (for example, if an item is
          unavailable or the restaurant is closing). In that case, you
          will be refunded the full amount paid for the order.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Email:{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-dp-red hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>{' '}
          · Phone:{' '}
          <a
            href={`tel:${SUPPORT_PHONE.replace(/[^0-9+]/g, '')}`}
            className="text-dp-red hover:underline"
          >
            {SUPPORT_PHONE}
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
