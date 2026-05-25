/**
 * Hiraccoon — Refund Policy.
 *
 * New page added 2026-05-25 per the platform contract. Refund responsibility
 * is split: food-quality / missing-items issues go to the Merchant (seller
 * of record); duplicate charges / failed payments / platform errors go to
 * Hiraccoon support.
 */
import React from 'react';
import type { Metadata } from 'next';
import LegalPage, {
  LegalSection,
  LegalList,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
} from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Refund Policy — Hiraccoon',
  description:
    'How refunds are handled on the Hiraccoon platform — what the Merchant resolves vs. what Hiraccoon resolves.',
};

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund Policy" currentPath="/refund-policy">
      <LegalSection number={1} title="Who Handles Refunds">
        <p>
          Hiraccoon is an ordering platform operated by A-MANI Holdings
          Management Inc. The Merchant is the seller of record for all
          food orders. Refund responsibility is divided as follows:
        </p>
        <LegalList
          items={[
            <>
              <strong className="text-dp-ink">
                Food quality, incorrect, missing, or unsatisfactory orders
              </strong>{' '}
              → handled by the Merchant. Because the Merchant prepares and
              fulfills your order, please contact the Merchant directly
              for these issues. Their contact details appear on their
              storefront and on your order confirmation.
            </>,
            <>
              <strong className="text-dp-ink">
                Duplicate charges, failed payments, or platform/technical
                errors
              </strong>{' '}
              → handled by Hiraccoon. Email{' '}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-dp-red hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>{' '}
              with your order number and we will investigate and resolve
              eligible issues.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection number={2} title="How to Request a Refund">
        <p>
          For order or food issues, contact the Merchant as soon as
          possible, ideally within 24 hours of your order. For billing or
          technical issues, contact{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-dp-red hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>{' '}
          with your order number.
        </p>
      </LegalSection>

      <LegalSection number={3} title="Processing Time">
        <p>
          Approved refunds are issued to your original payment method via
          Stripe and typically appear within 5–10 business days, depending
          on your bank.
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
