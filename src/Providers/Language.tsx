"use client";
import { useEffect } from "react";
import i18n from "@/shared/i18n/config";

export function LanguageDirectionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const update = (lng: string) => {
      document.documentElement.lang = lng;
      document.documentElement.dir = lng === "he" ? "rtl" : "ltr";
    };
    update(i18n.language || "he");
    i18n.on("languageChanged", update);
    return () => i18n.off("languageChanged", update);
  }, []);

  return <>{children}</>;
}
