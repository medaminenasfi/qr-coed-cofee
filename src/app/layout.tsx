import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Sage & Stone | QR Café", description: "A smarter way to order at your table." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}