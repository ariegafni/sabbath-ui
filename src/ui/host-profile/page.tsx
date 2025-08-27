"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import BubbleGroup from "./BubbleGroup";
import {
  User,
  MapPin,
  Image as ImageIcon,
  FileText,
  Upload,
} from "lucide-react";

export default function HostProfileForm() {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [religion, setReligion] = useState<string[]>([]);
  const [style, setStyle] = useState<string[]>([]);

  const handleSubmit = () => {
    console.log({
      name,
      location,
      religion,
      style,
      description,
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="p-6 space-y-6"
    >
      {/* שם */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
          <User className="h-4 w-4" />
          {t("hostProfile.name")}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
          placeholder={t("auth.fullNamePlaceholder")}
          required
        />
      </div>

      {/* מיקום */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {t("hostProfile.location")}
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
          placeholder={t("search.location")}
          required
        />
      </div>

      {/* תמונה */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          {t("hostProfile.image")}
        </label>
        <div className="w-full h-32 sm:h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group">
          <Upload className="h-8 w-8 mb-2 group-hover:text-blue-500 transition-colors duration-200" />
          <span className="text-sm text-center px-4">
            {t("hostProfile.uploadPlaceholder")}
          </span>
        </div>
      </div>

      {/* דת */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {t("publish.religion.title")}
        </h3>
        <BubbleGroup
          mode="single"
          value={religion}
          onChange={setReligion}
          options={[
            { id: "haredi", label: t("publish.religion.haredi") },
            { id: "dati", label: t("publish.religion.dati") },
            { id: "chiloni", label: t("publish.religion.chiloni") },
          ]}
        />
      </div>

      {/* סגנון */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {t("publish.style.title")}
        </h3>
        <BubbleGroup
          mode="multi"
          value={style}
          onChange={setStyle}
          options={[
            { id: "family", label: t("publish.style.family") },
            { id: "young", label: t("publish.style.young") },
            { id: "couple", label: t("publish.style.couple") },
          ]}
        />
      </div>

      {/* תיאור */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {t("hostProfile.description")}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base resize-none"
          placeholder={t("hostProfile.description")}
          required
        />
      </div>

      {/* כפתור שליחה */}
      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-3 font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base"
        >
          {t("common.submit")}
        </button>
      </div>
    </form>
  );
}
