import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat"
});

export const metadata: Metadata = {
  title: {
    default: "PaDC - Pennsylvania Driver Cooperative",
    template: "%s | PaDC"
  },
  description:
    "PaDC is building Philadelphia's driver-owned rideshare cooperative, creating ownership, voice, and local wealth for drivers.",
  metadataBase: new URL("https://www.padc.coop")
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={montserrat.variable}>{children}</body>
    </html>
  );
}
