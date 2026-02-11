import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-[#630000] text-white py-12 px-6">
            <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-[32px] p-8 md:p-12 border border-white/20 shadow-2xl">
                <Link href="/" className="inline-block mb-8 text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm">
                    ← Back to Home
                </Link>

                <h1 className="text-3xl md:text-4xl font-black mb-8 tracking-tight">Privacy Policy</h1>

                <div className="space-y-8 text-white/90 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold mb-3 text-white">1. Information We Collect</h2>
                        <p className="text-sm">
                            To provide you with our coupon services, we collect limited personal information when you claim an offer, including:
                        </p>
                        <ul className="list-disc ml-5 mt-2 text-sm space-y-1">
                            <li>Full Name</li>
                            <li>Phone Number</li>
                            <li>Email Address</li>
                            <li>Expected Visit Date and Time</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-white">2. How We Use Your Information</h2>
                        <p className="text-sm">
                            Your information is used solely for the following purposes:
                        </p>
                        <ul className="list-disc ml-5 mt-2 text-sm space-y-1">
                            <li>Generating and delivering your personalized digital coupon/pass.</li>
                            <li>Sharing your claim details with the respective merchant to facilitate your visit.</li>
                            <li>Sending reminders or updates related to your claimed coupon.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-white">3. Information Protection</h2>
                        <p className="text-sm">
                            We implement industry-standard security measures to protect your personal data from unauthorized access, alteration, or disclosure. We do not sell your personal data to third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-white">4. Contact Information</h2>
                        <p className="text-sm">
                            If you have any questions about this Privacy Policy, please contact us at:
                        </p>
                        <div className="mt-3 p-4 bg-white/5 rounded-2xl border border-white/10 text-sm">
                            <p className="font-bold">Open Media Inc.</p>
                            <p>EnterpriseWorks 60, Hazelwood Dr</p>
                            <p>Champaign, IL 61820</p>
                        </div>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 text-center">
                    <p className="text-xs text-white/40">© {new Date().getFullYear()} UpDeal. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
