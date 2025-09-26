import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vendora",
  description: "Digitizing Indian Street Food Commerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
