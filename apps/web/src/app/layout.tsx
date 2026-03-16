import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EventGrid",
  description:
    "EventGrid is a browser-based event layout, tent planning, venue mapping, and sales operations platform for event teams.",
  keywords: [
    "event layout software",
    "tent planning software",
    "venue layout planning",
    "event sales operations",
    "floor plan editor",
    "event quoting workflow",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
