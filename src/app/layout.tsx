import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/shared/lib/providers";
import AppLayoutClient from "./AppLayoutClient";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShabbesGuest",
  description: "Sabbath hosting platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AppLayoutClient>{children}</AppLayoutClient>
        </Providers>
      </body>
    </html>
  );
}
