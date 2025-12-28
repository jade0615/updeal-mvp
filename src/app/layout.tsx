import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Poppins, Inter } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '900'],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UpDeal",
  description: "Best local deals",
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

import { Suspense } from 'react';
import MetaPixel from "@/components/analytics/MetaPixel";
import MicrosoftClarity from "@/components/analytics/MicrosoftClarity";
import GoogleTagManager from "@/components/analytics/GoogleTagManager";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakarta.variable} ${poppins.variable} ${playfair.variable} ${inter.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <MetaPixel pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID} />
          <MicrosoftClarity />
          <GoogleTagManager />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
