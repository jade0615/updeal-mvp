
import React from 'react';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white text-zinc-900 py-12 px-6 font-sans">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold border-b pb-4">Privacy Policy</h1>
                <p className="text-zinc-500 text-sm">Last Updated: {new Date().toLocaleDateString()}</p>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold">1. Introduction</h2>
                    <p>Welcome to UpDeal ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and in using our services.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold">2. Information We Collect</h2>
                    <p>We collect information you provide directly to us, such as when you create an account, claim an offer, or communicate with us. This may include your name, phone number, and transaction details.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold">3. How We Use Information</h2>
                    <p>We use the information we collect to facilitate offer redemption, verify your identity (via SMS), and improve our services.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold">4. SMS Communications</h2>
                    <p>By providing your phone number, you consent to receive SMS messages from us regarding your claimed offers and account status. Standard message and data rates may apply.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold">5. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us.</p>
                </section>
            </div>
        </div>
    );
}
