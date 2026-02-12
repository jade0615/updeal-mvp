import React, { useState } from "react";
import { toast } from "sonner";
import { Loader2, Wallet, CheckCircle2, HelpCircle, X } from "lucide-react";
import { recordWalletDownload } from "@/actions/wallet-downloads";

interface AppleWalletButtonProps {
    couponCode: string;
    className?: string;
    merchantSlug?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
}

export const AppleWalletButton: React.FC<AppleWalletButtonProps> = ({
    couponCode,
    className = "",
    merchantSlug = "unknown",
    customerName = "Customer",
    customerPhone = "",
    customerEmail = ""
}) => {
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [recording, setRecording] = useState(false);

    const handleAddToWallet = async () => {
        if (!couponCode) {
            console.error("Missing coupon code");
            toast.error("Error: Missing coupon code");
            return;
        }

        try {
            setLoading(true);

            // Direct navigation is required for iOS Safari to handle .pkpass files correctly
            window.location.href = `/api/wallet/generate?code=${couponCode}`;

            // Reset loading and show success modal after a delay
            setTimeout(() => {
                setLoading(false);
                setShowModal(true);
            }, 2000);

        } catch (error: any) {
            console.error("Wallet Error:", error);
            toast.error(error.message || "Failed to add to Apple Wallet.");
            setLoading(false);
        }
    };

    const handleConfirm = async (added: boolean) => {
        try {
            setRecording(true);
            await recordWalletDownload({
                merchant_slug: merchantSlug,
                customer_name: customerName,
                customer_phone: customerPhone || null,
                customer_email: customerEmail || null,
                coupon_code: couponCode,
                added_to_wallet: added
            });
            setShowModal(false);
            if (added) {
                toast.success("Great! Recorded successfully.");
            } else {
                toast.info("Thank you for your feedback.");
            }
        } catch (error) {
            console.error("Failed to record:", error);
        } finally {
            setRecording(false);
        }
    };

    return (
        <>
            <button
                onClick={handleAddToWallet}
                disabled={loading}
                className={`relative inline-flex items-center justify-center transition-all active:scale-95 group ${className}`}
                aria-label="Add to Apple Wallet"
            >
                {loading ? (
                    <div className="bg-black text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 text-sm w-full justify-center shadow-lg">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Adding...</span>
                    </div>
                ) : imageError ? (
                    // Fallback UI if SVG fails to load
                    <div className="bg-black text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 text-sm w-full justify-center shadow-lg hover:bg-gray-900 transition-colors">
                        <Wallet className="w-5 h-5" />
                        <span>Add to Apple Wallet</span>
                    </div>
                ) : (
                    <img
                        src="/passes/assets/add-to-apple-wallet.svg"
                        alt="Add to Apple Wallet"
                        className="h-11 w-auto object-contain hover:opacity-90 active:opacity-80 transition-opacity drop-shadow-md"
                        onError={(e) => {
                            console.warn("Apple Wallet badge failed to load, switching to fallback.");
                            setImageError(true);
                        }}
                    />
                )}
            </button>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-6 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300 relative border border-zinc-100">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-600 transition-colors rounded-full hover:bg-zinc-100"
                            disabled={recording}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6 flex justify-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                                <HelpCircle className="w-10 h-10 text-blue-500" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-zinc-900 leading-tight mb-4">
                            One more thing!
                        </h3>

                        <p className="text-zinc-500 font-bold text-sm leading-relaxed mb-8 px-2">
                            Did you successfully add the coupon to your Apple Wallet?
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => handleConfirm(true)}
                                disabled={recording}
                                className="w-full bg-[rgb(99,0,0)] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[rgb(80,0,0)] transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {recording ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, I added it"}
                            </button>
                            <button
                                onClick={() => handleConfirm(false)}
                                disabled={recording}
                                className="w-full bg-zinc-100 text-zinc-600 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-zinc-200 transition-all active:scale-[0.98]"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
