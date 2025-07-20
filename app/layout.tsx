import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Article Reading List",
  description: "Track and manage your article reading progress",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
