"use client";

import { useEffect, useState } from "react";
import i18n from "@/shared/i18n/config";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<string>(
    (typeof window !== "undefined" &&
      (localStorage.getItem("i18nextLng") || i18n.language)) ||
      "he"
  );

  useEffect(() => {
    const handleChange = (lng: string) => {
      setCurrentLang(lng);
      if (typeof window !== "undefined") {
        localStorage.setItem("i18nextLng", lng);
      }
    };
    setCurrentLang(i18n.language || "he");
    i18n.on("languageChanged", handleChange);
    return () => {
      i18n.off("languageChanged", handleChange);
    };
  }, []);

  const changeLanguage = (lng: string) => {
    if (lng === currentLang) return;
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2 p-2">
      <div className="hidden sm:flex items-center gap-2">
        <Globe className="h-4 w-4 text-gray-500" />
        <span className="text-xs text-gray-500">שפה:</span>
      </div>

      <div className="flex gap-1">
        <button
          className={`px-2 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
            currentLang.startsWith("he")
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
          }`}
          onClick={() => changeLanguage("he")}
        >
          עברית
        </button>
        <button
          className={`px-2 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
            currentLang.startsWith("en")
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
          }`}
          onClick={() => changeLanguage("en")}
        >
          EN
        </button>
      </div>
    </div>
  );
}
