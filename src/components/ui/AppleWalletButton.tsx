import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Wallet, CheckCircle2, X } from "lucide-react";

interface AppleWalletButtonProps {
    couponCode: string;
    className?: string;
    autoTrigger?: boolean;
    autoTriggerOnAppleOnly?: boolean;
    autoTriggerDelayMs?: number;
}

export const AppleWalletButton: React.FC<AppleWalletButtonProps> = ({
    couponCode,
    className = "",
    autoTrigger = false,
    autoTriggerOnAppleOnly = true,
    autoTriggerDelayMs = 0,
}) => {
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const hasAutoTriggered = useRef(false);

    const isAppleDevice = () => {
        if (typeof navigator === "undefined") return false;
        const ua = navigator.userAgent || "";
        const isIOS = /iPhone|iPad|iPod/i.test(ua);
        const isMacWithTouch = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
        return isIOS || isMacWithTouch;
    };

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

    useEffect(() => {
        if (!autoTrigger || hasAutoTriggered.current) return;
        if (!couponCode) return;
        if (autoTriggerOnAppleOnly && !isAppleDevice()) return;

        hasAutoTriggered.current = true;
        const timer = window.setTimeout(() => {
            handleAddToWallet();
        }, autoTriggerDelayMs);

        return () => window.clearTimeout(timer);
    }, [autoTrigger, autoTriggerDelayMs, autoTriggerOnAppleOnly, couponCode]);

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

            {/* Success Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-6 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300 relative border border-zinc-100">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-600 transition-colors rounded-full hover:bg-zinc-100"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6 flex justify-center">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-zinc-900 leading-tight mb-4">
                            Successfully Added!
                        </h3>

                        <p className="text-zinc-500 font-bold text-sm leading-relaxed mb-8 px-2">
                            The coupon has been added to your Apple Wallet. You can find it anytime in your Wallet app.
                        </p>

                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full bg-[rgb(99,0,0)] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[rgb(80,0,0)] transition-all shadow-lg active:scale-[0.98]"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
