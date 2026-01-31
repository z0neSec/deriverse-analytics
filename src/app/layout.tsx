import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar, Header, MainContent } from "@/components/layout";
import { WalletContextProvider } from "@/components/providers";
import { AnimatedBackground } from "@/components/ui";
import { Scene3DWrapper } from "@/components/ui/scene-3d-wrapper";

// Primary body font - clean, modern, highly legible
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Display font - elegant serif for headings
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
});

// Monospace font - for numbers and code
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Deriverse Analytics | Professional Trading Dashboard",
  description:
    "Comprehensive trading analytics and portfolio analysis for Deriverse - the next-gen Solana trading ecosystem",
  keywords: ["Deriverse", "Solana", "Trading", "Analytics", "DeFi", "Crypto"],
  icons: {
    icon: "/deriverse-logo.svg",
    apple: "/deriverse-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body 
        className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} antialiased bg-[#0a0f1a] text-slate-200`}
        style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
      >
        <WalletContextProvider>
          <AnimatedBackground />
          <Scene3DWrapper />
          <Sidebar />
          <Header />
          <MainContent>{children}</MainContent>
        </WalletContextProvider>
      </body>
    </html>
  );
}
