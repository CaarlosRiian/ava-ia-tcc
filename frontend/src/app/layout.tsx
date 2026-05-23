import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "AVA-IA",
  description: "...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
      className={`${inter.variable} h-full antialiased light`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-[#161B1D]">
        {children}
      </body>
    </html>
  );
}