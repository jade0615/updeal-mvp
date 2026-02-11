
import React from 'react';

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-white text-zinc-900 py-12 px-6 font-sans">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold border-b pb-4">Terms of Service</h1>
                <p className="text-zinc-500 text-sm">Last Updated: {new Date().toLocaleDateString()}</p>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold">1. Acceptance of Terms</h2>
                    <p>By accessing or using our services, you agree to be bound by these Terms of Service.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold">2. Use of Services</h2>
                    <p>You agree to use our services only for lawful purposes and in accordance with these Terms. You are responsible for maintaining the confidentiality of your account information.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold">3. Offer Redemption</h2>
                    <p>Offers claimed through our platform are subject to the specific terms set by the participating merchant. We are not responsible for the merchant&apos;s failure to honor an offer.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold">4. Limitation of Liability</h2>
                    <p>To the fullest extent permitted by law, UpDeal shall not be liable for any indirect, incidental, distinctive, consequential, or punitive damages.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold">5. Changes to Terms</h2>
                    <p>We verify the right to modify these terms at any time. Your continued use of the service constitutes acceptance of such modifications.</p>
                </section>
            </div>
        </div>
    );
}
