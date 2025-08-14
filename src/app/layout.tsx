import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/shared/lib/providers";
import BottomNavigation from "@/ui/BottomNavigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShabbesGuest - מצאו אירוח לשבת",
  description: "פלטפורמה לאירוח בשבת - מצאו מארחים או פרסמו אירוח משלכם",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={inter.className}>
        <Providers>
          {children}
          <BottomNavigation />
        </Providers>
      </body>
    </html>
  );
}
