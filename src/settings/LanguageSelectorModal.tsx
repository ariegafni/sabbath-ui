"use client";

import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

const availableLanguages = [
  { code: "he", label: "עברית" },
  { code: "en", label: "English" },

];

export default function LanguageSelectorModal({ onClose }: Props) {
  const { t, i18n } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm" dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{t("settings.language")}</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {availableLanguages.map((lang) => (
            <label key={lang.code} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={i18n.language === lang.code}
                onChange={() => i18n.changeLanguage(lang.code)}
              />
              {lang.label}
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md"
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
