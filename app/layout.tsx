import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Etsy Listing Helper",
  description: "Generate white background product images and Etsy-ready copy."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
