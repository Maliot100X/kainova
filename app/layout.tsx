import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/lib/wallet";

export const metadata: Metadata = {
  title: "KAINOVA — An isometric realm for $KAINOVA holders",
  description:
    "An isometric play-to-earn realm. Hold 10,000 $KAINOVA to enter Verdant Glade and the Stormveil Wilds.",
  openGraph: {
    title: "KAINOVA",
    description: "Hold $KAINOVA. Enter the realm.",
    type: "website",
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
