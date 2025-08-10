"use client";

import i18n from "@/shared/i18n/config";

export default function LanguageSwitcher() {
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="p-2 flex gap-2">
      <button
        className="px-3 py-1 bg-purple-600 text-white rounded"
        onClick={() => changeLanguage("he")}
      >
        עברית
      </button>
      <button
        className="px-3 py-1 bg-gray-300 rounded"
        onClick={() => changeLanguage("en")}
      >
        English
      </button>
    </div>
  );
}
