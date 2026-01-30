import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar, Header } from "@/components/layout";
import { WalletContextProvider } from "@/components/providers";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Deriverse Analytics | Professional Trading Dashboard",
  description:
    "Comprehensive trading analytics and portfolio analysis for Deriverse - the next-gen Solana trading ecosystem",
  keywords: ["Deriverse", "Solana", "Trading", "Analytics", "DeFi", "Crypto"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased bg-zinc-950 text-white`}>
        <WalletContextProvider>
          <Sidebar />
          <Header />
          <main className="ml-64 pt-16 min-h-screen">
            <div className="p-6">{children}</div>
          </main>
        </WalletContextProvider>
      </body>
    </html>
  );
}
