"use client";

import React, { useState } from "react";
import { toast } from "sonner";

interface AppleWalletButtonProps {
    couponCode: string;
    className?: string;
}

export const AppleWalletButton: React.FC<AppleWalletButtonProps> = ({
    couponCode,
    className = "",
}) => {
    const [loading, setLoading] = useState(false);

    const handleAddToWallet = async () => {
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
                throw new Error("Failed to generate pass");
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
        } catch (error) {
            console.error("Wallet Error:", error);
            toast.error("Failed to add to Apple Wallet. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleAddToWallet}
            disabled={loading}
            className={`relative inline-flex items-center justify-center transition-all active:scale-95 ${className}`}
            aria-label="Add to Apple Wallet"
        >
            {loading ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                </div>
            ) : (
                <img
                    src="/passes/assets/add-to-apple-wallet.svg"
                    alt="Add to Apple Wallet"
                    className="h-10 hover:opacity-90 active:opacity-80 transition-opacity"
                    onError={(e) => {
                        // Fallback if the official SVG asset isn't there yet
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.classList.add('bg-black', 'text-white', 'px-4', 'py-2', 'rounded-lg', 'font-semibold');
                        (e.target as HTMLImageElement).parentElement!.innerHTML = 'Add to Apple Wallet';
                    }}
                />
            )}
        </button>
    );
};
