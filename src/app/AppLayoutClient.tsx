"use client";

import { useEffect } from "react";
import i18n from "@/shared/i18n/config";
import Header from "@/ui/Header";

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
      <Header />
      <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
    </>
  );
}
