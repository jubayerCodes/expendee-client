import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthObserver } from "@/utils/authObserver";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Expendee — Smart Expense Management",
  description:
    "Track, manage, and analyze your team expenses with Expendee. A modern expense management platform built for fast-moving teams.",
  keywords: ["expense management", "team expenses", "budget tracker"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, "dark")}>
      <body>
        <AuthObserver />
        {children}
      </body>
    </html>
  );
}
