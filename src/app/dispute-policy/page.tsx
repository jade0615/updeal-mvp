/**
 * Hiraccoon — Dispute Resolution Policy.
 *
 * New page added 2026-05-25 per the platform contract. Customers should
 * reach the Merchant or Hiraccoon support before filing a payment dispute
 * so we can resolve issues without going through Stripe chargebacks.
 */
import React from 'react';
import type { Metadata } from 'next';
import LegalPage, {
  LegalSection,
  LegalList,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_ADDRESS,
} from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Dispute Resolution Policy — Hiraccoon',
  description:
    'How Hiraccoon resolves charge and order disputes. Operated by A-MANI Holdings Management Inc.',
};

export default function DisputePolicyPage() {
  return (
    <LegalPage title="Dispute Resolution Policy" currentPath="/dispute-policy">
      <LegalSection number={1} title="Contact Us First">
        <p>
          If you have a concern about a charge or an order, please contact
          us before filing a payment dispute so we can resolve it quickly:
        </p>
        <LegalList
          items={[
            <>
              <strong className="text-dp-ink">Order or food issues</strong>{' '}
              → the Merchant (details on your storefront and order
              confirmation).
            </>,
            <>
              <strong className="text-dp-ink">
                Billing or technical issues
              </strong>{' '}
              →{' '}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-dp-red hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>{' '}
              /{' '}
              <a
                href={`tel:${SUPPORT_PHONE.replace(/[^0-9+]/g, '')}`}
                className="text-dp-red hover:underline"
              >
                {SUPPORT_PHONE}
              </a>
              .
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection number={2} title="Investigation">
        <p>
          We will review eligible disputes and respond within a reasonable
          time, typically 3–5 business days, coordinating with the
          Merchant and our payment processor (Stripe) as needed.
        </p>
      </LegalSection>

      <LegalSection number={3} title="Chargebacks">
        <p>
          Filing a chargeback before contacting us may delay resolution.
          We are committed to resolving legitimate issues fairly and
          promptly.
        </p>
      </LegalSection>

      <LegalSection number={4} title="Governing Law">
        <p>
          Disputes are governed by the laws of the State of New York,
          United States.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>A-MANI Holdings Management Inc.</p>
        <p>{SUPPORT_ADDRESS}</p>
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
