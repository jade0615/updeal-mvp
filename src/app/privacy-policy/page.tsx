import React from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

type Props = {
    searchParams: Promise<{ slug?: string }>;
};

export default async function PrivacyPolicyPage({ searchParams }: Props) {
    const { slug } = await searchParams;

    let merchantName = "King's Super Buffet";
    let merchantAddress = "7101 W Oakland Park Blvd, Lauderhill, FL 33313";
    let merchantPhone = "(954) 747-6668";
    let merchantEmail = "contact@kingsuperbuffet.com";

    if (slug) {
        const supabase = createAdminClient();
        const { data: merchant } = await supabase
            .from('merchants')
            .select('name, content')
            .eq('slug', slug)
            .single();

        if (merchant) {
            const content = merchant.content as any;
            merchantName = content.businessName || merchant.name || merchantName;
            merchantAddress = content.address?.fullAddress || content.address?.street + ", " + content.address?.area || merchantAddress;
            merchantPhone = content.phone || merchantPhone;
            // Email might not be in content, so we keep the default or use a generic one if missing
            merchantEmail = content.email || `contact@${slug}.com`;
        }
    }

    return (
        <div className="min-h-screen bg-[#630000] text-white py-12 px-6">
            <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-[32px] p-8 md:p-12 border border-white/20 shadow-2xl">
                <Link href="/" className="inline-block mb-8 text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm">
                    ← Back to Home
                </Link>

                <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Privacy Policy</h1>
                <p className="text-white/40 text-xs mb-10 uppercase tracking-widest font-bold">Last Updated: February 11, 2026</p>

                <div className="space-y-8 text-white/90 leading-relaxed font-medium">
                    <p className="text-sm">
                        At <span className="text-white font-bold">{merchantName}</span> (hosted on <span className="text-white font-bold underline decoration-white/20 underline-offset-4">hiraccoon.com</span>), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website to view our menu or place orders.
                    </p>

                    <section>
                        <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">1</span>
                            Information We Collect
                        </h2>
                        <p className="text-sm mb-4 text-white/70">
                            We may collect personal information that you voluntarily provide to us, including:
                        </p>
                        <ul className="space-y-3 text-sm">
                            <li className="flex gap-2">
                                <span className="text-white/40">•</span>
                                <p><span className="text-white font-bold">Identification Data:</span> Name, phone number, and email address (collected when you make a reservation or place an order).</p>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-white/40">•</span>
                                <p><span className="text-white font-bold">Payment Information:</span> If you pay online, our third-party processors collect payment details.</p>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-white/40">•</span>
                                <p><span className="text-white font-bold">Usage Data:</span> IP address, browser type, and device information for security and optimization purposes.</p>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">2</span>
                            How We Use Your Information
                        </h2>
                        <p className="text-sm mb-4 text-white/70">
                            We use the information we collect to:
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <li className="bg-white/5 p-3 rounded-xl border border-white/10">Provide and manage your dining reservations or food orders.</li>
                            <li className="bg-white/5 p-3 rounded-xl border border-white/10">Send order confirmations and updates.</li>
                            <li className="bg-white/5 p-3 rounded-xl border border-white/10">Improve our website performance and user experience.</li>
                            <li className="bg-white/5 p-3 rounded-xl border border-white/10">Comply with legal obligations and Google Ads policies.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">3</span>
                            Data Sharing and Disclosure
                        </h2>
                        <p className="text-sm text-white/70">
                            We do not sell your personal data. We only share information with:
                        </p>
                        <ul className="mt-4 space-y-3 text-sm">
                            <li className="flex gap-2">
                                <span className="text-white/40">•</span>
                                <p><span className="text-white font-bold">Service Providers:</span> Such as HiRaccoon (our hosting platform) and payment processors to facilitate your orders.</p>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-white/40">•</span>
                                <p><span className="text-white font-bold">Legal Requirements:</span> If required by law or to protect our rights.</p>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">4</span>
                            Cookies and Tracking Technologies
                        </h2>
                        <p className="text-sm text-white/70">
                            We use cookies to enhance your browsing experience. You can choose to disable cookies through your browser settings, though some features of the site may not function properly.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">5</span>
                            Your Privacy Rights
                        </h2>
                        <p className="text-sm text-white/70">
                            Depending on your location, you may have the right to access, correct, or delete your personal data. Please contact us using the information below to exercise these rights.
                        </p>
                    </section>

                    <section className="bg-white/5 rounded-3xl p-6 border border-white/10">
                        <h2 className="text-xl font-black mb-6 text-white uppercase tracking-wider">6. Contact Us</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div>
                                <p className="text-white/40 uppercase text-[10px] font-bold tracking-widest mb-1">Business Name</p>
                                <p className="text-white font-bold text-base">{merchantName}</p>
                            </div>
                            <div>
                                <p className="text-white/40 uppercase text-[10px] font-bold tracking-widest mb-1">Address</p>
                                <p className="text-white">{merchantAddress}</p>
                            </div>
                            <div>
                                <p className="text-white/40 uppercase text-[10px] font-bold tracking-widest mb-1">Phone</p>
                                <p className="text-white">{merchantPhone}</p>
                            </div>
                            <div>
                                <p className="text-white/40 uppercase text-[10px] font-bold tracking-widest mb-1">Email</p>
                                <p className="text-white">{merchantEmail}</p>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-white/10 text-center">
                    <p className="text-xs text-white/30 font-bold uppercase tracking-widest">© {new Date().getFullYear()} UpDeal • Powering Local Experiences</p>
                </div>
            </div>
        </div>
    );
}
