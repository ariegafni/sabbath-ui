"use client";

import { useEffect } from "react";
import i18n from "@/shared/i18n/config";
import BottomNavigation from "@/ui/BottomNavigation";
import { usePathname } from "next/navigation";

export default function AppLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const update = (lng: string) => {
      document.documentElement.lang = lng;
      document.documentElement.dir = lng === "he" ? "rtl" : "ltr";
    };
    update(i18n.language || "he");
    i18n.on("languageChanged", update);
    return () => i18n.off("languageChanged", update);
  }, []);

  return (
    <>
      <main className="min-h-screen">{children}</main>
      {usePathname() !== "/login" && <BottomNavigation />}
    </>
  );
}
