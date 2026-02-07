import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Wallet } from "lucide-react";

interface AppleWalletButtonProps {
    couponCode: string;
    className?: string;
}

export const AppleWalletButton: React.FC<AppleWalletButtonProps> = ({
    couponCode,
    className = "",
}) => {
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleAddToWallet = async () => {
        if (!couponCode) {
            console.error("Missing coupon code");
            toast.error("Error: Missing coupon code");
            return;
        }

        try {
            setLoading(true);

            // Direct navigation is required for iOS Safari to handle .pkpass files correctly
            // Fetch/Blob method often fails to trigger the Wallet preview
            window.location.href = `/api/wallet/generate?code=${couponCode}`;

            // We can't easily know when the download starts/finishes with this method,
            // but we can reset the loading state after a delay.
            setTimeout(() => {
                setLoading(false);
                toast.success("Pass generated! Check your downloads or Wallet app.");
            }, 3000);

        } catch (error: any) {
            console.error("Wallet Error:", error);
            toast.error(error.message || "Failed to add to Apple Wallet.");
            setLoading(false);
        }
    };

    return (
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
    );
};
