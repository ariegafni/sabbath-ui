"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Globe, Mail, Trash2, Settings as SettingsIcon } from "lucide-react";
import LanguageSelectorModal from "./LazyLanguageSelectorModal";

interface Props {
  open: boolean;
  onClose: () => void;
}

function SettingsItem({
  icon: Icon,
  label,
  onClick,
  color = "text-gray-800",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 ${color} group w-full text-right`}
    >
      <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors duration-200">
        <Icon className="w-5 h-5" />
      </div>
      <span className="font-medium text-sm sm:text-base">{label}</span>
    </button>
  );
}

export default function SettingsSidebar({ open, onClose }: Props) {
  const { t } = useTranslation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 z-50 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <SettingsIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {t("settings.title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-2">
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

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-500">Sabbath UI v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Language Selector Modal */}
      {showLanguageModal && (
        <LanguageSelectorModal onClose={() => setShowLanguageModal(false)} />
      )}
    </>
  );
}
