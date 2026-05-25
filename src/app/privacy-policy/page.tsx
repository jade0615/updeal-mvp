/**
 * Hiraccoon — Privacy Policy (platform-level).
 *
 * Replaces the old King's Super Buffet + OPEN MEDIA INC privacy page. Per
 * the 2026-05-25 business contract, A-MANI Holdings Management Inc. is the
 * platform operator and the Merchant is the seller of record. There is no
 * separate "Agent" role anymore.
 */
import React from 'react';
import type { Metadata } from 'next';
import LegalPage, {
  LegalSection,
  LegalIntro,
  LegalList,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_ADDRESS,
} from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy — Hiraccoon',
  description:
    'How Hiraccoon collects, uses, and shares your information. Operated by A-MANI Holdings Management Inc.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" currentPath="/privacy-policy">
      <LegalIntro>
        A-MANI Holdings Management Inc. (&ldquo;Hiraccoon,&rdquo;
        &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects
        your privacy. This policy explains what information we collect and
        how we use it.
      </LegalIntro>

      <LegalSection number={1} title="Information We Collect">
        <LegalList
          items={[
            <>
              <strong className="text-dp-ink">Information you provide:</strong>{' '}
              name, phone number, email, and order details when you place an
              order or claim a coupon.
            </>,
            <>
              <strong className="text-dp-ink">Payment information:</strong>{' '}
              processed securely by Stripe. We do not store full card numbers
              on our servers.
            </>,
            <>
              <strong className="text-dp-ink">
                Automatically collected information:
              </strong>{' '}
              device, browser, and usage data via cookies and analytics tools
              (e.g., Google Tag Manager, Meta Pixel).
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection number={2} title="How We Use Your Information">
        <p>
          To process and fulfill orders, deliver coupons, provide customer
          support, improve the platform, and (where permitted) send
          service-related or marketing messages.
        </p>
      </LegalSection>

      <LegalSection number={3} title="How We Share Information">
        <p>
          We share order information with the Merchant fulfilling your
          order, and with service providers such as Stripe (payment
          processing) and our hosting and analytics providers. We do not
          sell your personal information.
        </p>
      </LegalSection>

      <LegalSection number={4} title="Your Choices">
        <p>
          You may request access to, correction of, or deletion of your
          personal information by emailing{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-dp-red hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
          . You may opt out of marketing messages at any time.
        </p>
      </LegalSection>

      <LegalSection number={5} title="Data Retention and Security">
        <p>
          We retain information as long as needed to provide the service
          and meet legal obligations, and we use reasonable safeguards to
          protect it.
        </p>
      </LegalSection>

      <LegalSection number={6} title="Children">
        <p>
          The platform is not directed to children under 18, and we do not
          knowingly collect their information.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Changes">
        <p>
          We may update this policy from time to time. The effective date
          reflects the most recent version.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Contact">
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
