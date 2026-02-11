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
                        This Privacy Policy describes how your personal information is collected, used, and shared when you visit this website to claim coupons or discounts. This website is operated by <span className="text-white font-bold underline decoration-white/20 underline-offset-4">OPEN MEDIA INC</span> (the "Agent") on behalf of <span className="text-white font-bold">{merchantName}</span> (the "Merchant").
                    </p>

                    <section>
                        <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">1</span>
                            Information We Collect
                        </h2>
                        <p className="text-sm mb-4 text-white/70">
                            When you claim a coupon or sign up for promotions on this site, we collect:
                        </p>
                        <ul className="space-y-3 text-sm">
                            <li className="flex gap-2">
                                <span className="text-white/40">•</span>
                                <p><span className="text-white font-bold text-white/100">Identification Data:</span> Name, email address, and phone number.</p>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-white/40">•</span>
                                <p><span className="text-white font-bold text-white/100">Device Information:</span> IP address, browser type, and cookies to ensure the coupon system works correctly.</p>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">2</span>
                            How We Use Your Information
                        </h2>
                        <p className="text-sm mb-4 text-white/70">
                            We use the collected information to:
                        </p>
                        <ul className="space-y-3 text-sm">
                            <li className="flex gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <span className="text-white/100 text-lg">🎟️</span>
                                <p>Generate and send your digital coupons.</p>
                            </li>
                            <li className="flex gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <span className="text-white/100 text-lg">🛡️</span>
                                <p>Allow <span className="text-white font-bold">{merchantName}</span> to verify your identity when you redeem the discount.</p>
                            </li>
                            <li className="flex gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <span className="text-white/100 text-lg">📢</span>
                                <p>Send you marketing updates if you have opted-in to receive them.</p>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">3</span>
                            Data Sharing
                        </h2>
                        <p className="text-sm text-white/70 mb-4">
                            Your data is shared between:
                        </p>
                        <ul className="space-y-4">
                            <li className="border-l-2 border-white/10 pl-4 py-1">
                                <p className="text-sm"><span className="text-white font-bold">The Merchant ({merchantName}):</span> So they can provide the service and honor the discount.</p>
                            </li>
                            <li className="border-l-2 border-white/10 pl-4 py-1">
                                <p className="text-sm"><span className="text-white font-bold">The Agent (OPEN MEDIA INC):</span> To manage the platform, provide support, and analyze campaign performance.</p>
                            </li>
                            <li className="border-l-2 border-white/10 pl-4 py-1">
                                <p className="text-sm"><span className="text-white font-bold">Service Providers:</span> Third-party tools used for email delivery or hosting.</p>
                            </li>
                        </ul>
                    </section>

                    <section className="bg-white/5 rounded-[2rem] p-6 border border-white/10 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <span className="text-6xl text-white">🏢</span>
                        </div>
                        <h2 className="text-xl font-black mb-8 text-white uppercase tracking-wider">4. Merchant & Agent Information</h2>

                        <div className="space-y-8">
                            <div>
                                <p className="text-white/40 uppercase text-[10px] font-bold tracking-[0.2em] mb-4">The Merchant (Restaurant)</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <p className="text-xs text-white/40 font-bold mb-1 uppercase">Name</p>
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
                                </div>
                            </div>

                            <div>
                                <p className="text-white/40 uppercase text-[10px] font-bold tracking-[0.2em] mb-4">The Agent (Platform Operator)</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <p className="text-xs text-white/40 font-bold mb-1 uppercase">Company</p>
                                        <p className="text-white font-bold text-white/100">OPEN MEDIA INC</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <p className="text-xs text-white/40 font-bold mb-1 uppercase">Email</p>
                                        <p className="text-white underline decoration-white/10">info@openmediaus.com</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 md:col-span-2">
                                        <p className="text-xs text-white/40 font-bold mb-1 uppercase">Address</p>
                                        <p className="text-white">EnterpriseWorks 60, Hazelwood Dr, Champaign, IL 61820</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">5</span>
                            Your Rights
                        </h2>
                        <p className="text-sm text-white/70">
                            You have the right to request access to the personal information we hold about you and to ask that your personal information be corrected, updated, or deleted.
                        </p>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-white/10 text-center">
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">© {new Date().getFullYear()} • Powered by UpDeal</p>
                </div>
            </div>
        </div>
    );
}
