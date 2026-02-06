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
    // FORCE FALLBACK TO TRUE FOR DEBUGGING
    const [imageError, setImageError] = useState(true);

    // Remove hydration check to force render
    // const [mounted, setMounted] = useState(false);
    // useEffect(() => { setMounted(true); }, []);
    // if (!mounted) return null;

    const handleAddToWallet = async () => {
        if (!couponCode) {
            console.error("Missing coupon code");
            toast.error("Error: Missing coupon code");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch("/api/wallet/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    couponCode,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Wallet API Error:", errorData);
                throw new Error(errorData.error || "Failed to generate pass");
            }

            // Create a blob from the response and trigger download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `coupon-${couponCode}.pkpass`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("Pass generated! Check your downloads.");
        } catch (error: any) {
            console.error("Wallet Error:", error);
            toast.error(error.message || "Failed to add to Apple Wallet.");
        } finally {
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
                <div className="bg-black text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 text-sm w-full justify-center shadow-lg hover:bg-gray-900 transition-colors border-2 border-green-500">
                    <Wallet className="w-5 h-5" />
                    <span>Add to Apple Wallet (DEBUG MODE)</span>
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
