interface LandingFooterProps {
    hideBranding?: boolean;
}

export default function LandingFooter({ hideBranding }: LandingFooterProps) {
    if (hideBranding) return null;

    return (
        <footer className="mt-12 py-8 text-center text-xs text-gray-400">
            <p>© {new Date().getFullYear()} UpDeal. All rights reserved.</p>
            <div className="mt-2 flex justify-center gap-4">
                <a href="#" className="hover:text-gray-600">Privacy Policy</a>
                <span>•</span>
                <a href="#" className="hover:text-gray-600">Terms of Service</a>
            </div>
        </footer>
    );
}
