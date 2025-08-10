"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Globe, Mail, Trash2 } from "lucide-react";
import LanguageSelectorModal from "./LanguageSelectorModal";

interface Props {
  open: boolean;
  onClose: () => void;
}

function SettingsItem({
  icon: Icon,
  label,
  onClick,
  color = "text-gray-800"
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-100 transition-colors ${color}`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}

export default function SettingsSidebar({ open, onClose }: Props) {
  const { t } = useTranslation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-lg flex flex-col transition-transform duration-300 z-50 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        dir="rtl"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">{t("settings.title")}</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-1 p-2">
          <SettingsItem
            icon={Globe}
            label={t("settings.language")}
            onClick={() => setShowLanguageModal(true)}
          />
          <SettingsItem
            icon={Mail}
            label={t("settings.contact")}
            onClick={() => alert("Contact form will open here")}
          />
          <SettingsItem
            icon={Trash2}
            label={t("settings.deleteAccount")}
            color="text-red-600"
            onClick={() => alert("Account deletion flow")}
          />
        </div>
      </div>

      {/* Language Selector Modal */}
      {showLanguageModal && (
        <LanguageSelectorModal onClose={() => setShowLanguageModal(false)} />
      )}
    </>
  );
}
