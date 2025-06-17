import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Last Dance - Next.js 15",
  description: "Portfolio personal de Xabier Lameiro migrado a Next.js 15",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
