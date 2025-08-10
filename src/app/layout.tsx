
import "./globals.css";
import Providers from "@/shared/lib/providers";
import AppLayoutClient from "./AppLayoutClient";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <Providers>
          <AppLayoutClient>{children}</AppLayoutClient>
        </Providers>
      </body>
    </html>
  );
}
