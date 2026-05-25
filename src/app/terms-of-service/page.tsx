/**
 * Hiraccoon — Terms of Service (platform-level).
 *
 * Replaces the old King's Super Buffet–branded merchant terms page. Per the
 * 2026-05-25 business contract (5% commission charged to the Merchant only,
 * Direct Charge, Merchant = seller of record), the platform now ships ONE
 * unified set of consumer-facing terms across every merchant storefront —
 * the merchant-specific contact details live in the order confirmation, not
 * in these terms.
 *
 * The `?slug=` query param previously used to inject merchant data is now
 * ignored intentionally; merchant storefront footers still pass it but it's
 * a no-op so no link is broken.
 */
import React from 'react';
import type { Metadata } from 'next';
import LegalPage, {
  LegalSection,
  LegalIntro,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_ADDRESS,
} from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service — Hiraccoon',
  description:
    'Terms governing your use of the Hiraccoon online ordering platform, operated by A-MANI Holdings Management Inc.',
};

export default function TermsOfServicePage() {
  return (
    <LegalPage title="Terms of Service" currentPath="/terms-of-service">
      <LegalIntro>
        Welcome to Hiraccoon. Hiraccoon is an online ordering platform
        operated by A-MANI Holdings Management Inc. (&ldquo;Hiraccoon,&rdquo;
        &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By
        accessing hiraccoon.com or any storefront we host, and by placing
        an order, you agree to these Terms of Service.
      </LegalIntro>

      <LegalSection number={1} title="Who We Are">
        <p>
          Hiraccoon provides an online ordering platform that lets
          independent restaurants (&ldquo;Merchants&rdquo;) present their
          menus and accept direct orders. The Merchant — not Hiraccoon —
          is the seller of the food and is solely responsible for
          preparing and fulfilling your order. Hiraccoon provides the
          ordering technology; payments are processed through our
          third-party payment processor, Stripe.
        </p>
      </LegalSection>

      <LegalSection number={2} title="Eligibility">
        <p>
          You must be at least 18 years old, or have the consent of a
          parent or guardian, to use this platform.
        </p>
      </LegalSection>

      <LegalSection number={3} title="Orders">
        <p>
          When you place an order through a Merchant&rsquo;s storefront,
          you enter into a transaction directly with that Merchant. Menu
          items, prices, availability, and pickup times are set and
          controlled by the Merchant.
        </p>
      </LegalSection>

      <LegalSection number={4} title="Pricing and Payments">
        <p>
          All prices are listed in USD and are set by the Merchant.
          Payments are processed securely by Stripe. By submitting your
          payment information, you authorize the charge for your order.
        </p>
      </LegalSection>

      <LegalSection number={5} title="Coupons and Offers">
        <p>
          Coupons (including Apple Wallet offers) are issued by the
          Merchant, are valid only as stated, and expire on the date
          shown. Coupons have no cash value and cannot be combined unless
          stated otherwise.
        </p>
      </LegalSection>

      <LegalSection number={6} title="User Conduct">
        <p>
          You agree to use the platform lawfully and not to provide false
          information, interfere with platform security, or misuse the
          service.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Limitation of Liability">
        <p>
          To the fullest extent permitted by law, A-MANI Holdings
          Management Inc. shall not be liable for any indirect, incidental,
          or consequential damages, including matters relating to food
          quality, preparation, or fulfillment, which are the sole
          responsibility of the Merchant.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Changes">
        <p>
          We may modify these Terms at any time. Continued use of the
          platform after changes take effect constitutes acceptance.
        </p>
      </LegalSection>

      <LegalSection number={9} title="Governing Law">
        <p>
          These Terms are governed by the laws of the State of New York,
          United States, without regard to its conflict-of-law principles.
        </p>
      </LegalSection>

      <LegalSection number={10} title="Contact">
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
