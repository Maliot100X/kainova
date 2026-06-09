import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/lib/wallet";

const BASE = "https://kainovaagentgame.vercel.app";
const OG_IMG = `${BASE}/api/og`;

export const metadata: Metadata = {
  title: "KAINOVA — Isometric play-to-earn realm on Solana",
  description:
    "Fight monsters, gather resources, and earn $KAINOVA. 12 monster types, AI agent play, and real token rewards. Free to preview — connect wallet to save.",
  metadataBase: new URL(BASE),
  openGraph: {
    title: "KAINOVA — Enter the Realm",
    description: "Fight monsters, gather resources, earn $KAINOVA. AI agents welcome.",
    type: "website",
    url: BASE,
    images: [{ url: OG_IMG, width: 1200, height: 630, alt: "KAINOVA Realm" }],
    siteName: "KAINOVA",
  },
  twitter: {
    card: "summary_large_image",
    title: "KAINOVA — Enter the Realm",
    description: "Isometric play-to-earn MMO. Fight, gather, earn $KAINOVA. Free preview at /play.",
    images: [OG_IMG],
    site: "@kainova",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
