import React from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

type Props = {
    searchParams: Promise<{ slug?: string }>;
};

export default async function TermsOfServicePage({ searchParams }: Props) {
    const { slug } = await searchParams;

    let merchantName = "King's Super Buffet";
    let merchantAddress = "7101 W Oakland Park Blvd, Lauderhill, FL 33313";
    let merchantPhone = "(954) 747-6668";
    let merchantEmail = "info@kingssuperbuffet.com";
    let merchantState = "Florida";

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

            // Extract address
            if (content.address) {
                merchantAddress = content.address.fullAddress ||
                    (content.address.street + ", " + content.address.area) ||
                    merchantAddress;

                // Extract state from address
                const stateMatch = merchantAddress.match(/,\s*([A-Z]{2}|[A-Za-z\s]+)\s+\d{5}$/) ||
                    merchantAddress.match(/,\s*([A-Za-z\s]+)$/);
                if (stateMatch) {
                    merchantState = stateMatch[1];
                }
            }

            merchantPhone = content.phone || merchantPhone;
            merchantEmail = content.email || merchantEmail;
        }
    }

    return (
        <div className="min-h-screen bg-[#630000] text-white py-12 px-6">
            <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-[32px] p-8 md:p-12 border border-white/20 shadow-2xl">
                <Link href="/" className="inline-block mb-8 text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm">
                    ← Back to Home
                </Link>

                <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Terms of Service</h1>
                <p className="text-white/40 text-xs mb-10 uppercase tracking-widest font-bold">Effective Date: February 11, 2026</p>

                <div className="space-y-8 text-white/90 leading-relaxed font-medium">
                    <p className="text-sm">
                        Welcome to <span className="text-white font-bold">{merchantName}</span>. By accessing our website (hosted on hiraccoon.com) and using our services, you agree to comply with and be bound by the following terms and conditions.
                    </p>

                    <section>
                        <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">1</span>
                            Acceptance of Terms
                        </h2>
                        <p className="text-sm text-white/70">
                            By using this website, you represent that you are at least 18 years of age or possess legal parental or guardian consent. If you do not agree with any part of these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">2</span>
                            Services Provided
                        </h2>
                        <p className="text-sm text-white/70">
                            <span className="text-white font-bold">{merchantName}</span> provides an online platform for users to view menus, check business hours, and place food orders or reservations. We reserve the right to modify or discontinue services at any time without notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">3</span>
                            User Obligations
                        </h2>
                        <p className="text-sm mb-4 text-white/70">
                            You agree to use this website only for lawful purposes. You are prohibited from:
                        </p>
                        <ul className="space-y-3 text-sm">
                            <li className="flex gap-2">
                                <span className="text-white/40">•</span>
                                <p>Providing false contact information (Name, Phone, Email).</p>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-white/40">•</span>
                                <p>Attempting to interfere with the website's security or functionality.</p>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">4</span>
                            Pricing and Payments
                        </h2>
                        <p className="text-sm text-white/70">
                            All prices listed on the website are in USD and are subject to change without notice. Payments for orders are processed through secure third-party payment gateways.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">5</span>
                            Limitation of Liability
                        </h2>
                        <p className="text-sm text-white/70">
                            <span className="text-white font-bold">{merchantName}</span> and its partner HiRaccoon shall not be liable for any indirect, incidental, or consequential damages arising from your use of the website or any food quality issues, to the extent permitted by law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">6</span>
                            Governing Law
                        </h2>
                        <p className="text-sm text-white/70">
                            These terms are governed by the laws of the State of <span className="text-white font-bold">{merchantState}</span>, United States.
                        </p>
                    </section>

                    <section className="bg-white/5 rounded-[2rem] p-6 border border-white/10 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <span className="text-6xl text-white">⚖️</span>
                        </div>
                        <h2 className="text-xl font-black mb-8 text-white uppercase tracking-wider">7. Contact Information</h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <p className="text-xs text-white/40 font-bold mb-1 uppercase">Business Name</p>
                                    <p className="text-white font-bold">{merchantName}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <p className="text-xs text-white/40 font-bold mb-1 uppercase">Phone</p>
                                    <p className="text-white">{merchantPhone}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 md:col-span-2">
                                    <p className="text-xs text-white/40 font-bold mb-1 uppercase">Address</p>
                                    <p className="text-white">{merchantAddress}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 md:col-span-2">
                                    <p className="text-xs text-white/40 font-bold mb-1 uppercase">Email</p>
                                    <p className="text-white underline decoration-white/10">{merchantEmail}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-white/10 text-center">
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">© {new Date().getFullYear()} • Powered by UpDeal</p>
                </div>
            </div>
        </div>
    );
}
