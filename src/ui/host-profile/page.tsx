"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import BubbleGroup, { BubbleOption } from "./BubbleGroup";
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
      description
    });
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6 space-y-6" dir="rtl">
      <h2 className="text-xl font-bold">{t("hostProfile.title")}</h2>

      {/* שם */}
      <div>
        <label className="block text-sm font-medium mb-1">{t("hostProfile.name")}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-md p-2"
        />
      </div>

      {/* מיקום */}
      <div>
        <label className="block text-sm font-medium mb-1">{t("hostProfile.location")}</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border rounded-md p-2"
        />
      </div>

      {/* העלאת תמונה */}
      <div>
        <label className="block text-sm font-medium mb-1">{t("hostProfile.image")}</label>
        <div className="w-full h-32 border-2 border-dashed rounded-md flex items-center justify-center text-gray-500">
          {t("hostProfile.uploadPlaceholder")}
        </div>
      </div>

      {/* בועות – רמת דתיות */}
      <div>
        <h3 className="font-semibold mb-2">{t("publish.religion.title")}</h3>
        <BubbleGroup
          mode="single"
          value={religion}
          onChange={setReligion}
          options={[
            { id: "haredi", label: t("publish.religion.haredi") },
            { id: "dati", label: t("publish.religion.dati") },
            { id: "chiloni", label: t("publish.religion.chiloni") }
          ]}
        />
      </div>

      {/* בועות – סגנון אירוח */}
      <div>
        <h3 className="font-semibold mb-2">{t("publish.style.title")}</h3>
        <BubbleGroup
          mode="multi"
          value={style}
          onChange={setStyle}
          options={[
            { id: "family", label: t("publish.style.family") },
            { id: "young", label: t("publish.style.young") },
            { id: "couple", label: t("publish.style.couple") }
          ]}
        />
      </div>

      {/* תיאור הארוחה */}
      <div>
        <label className="block text-sm font-medium mb-1">{t("hostProfile.description")}</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border rounded-md p-2"
        />
      </div>

      {/* כפתור שליחה */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          {t("common.submit")}
        </button>
      </div>
    </div>
  );
}
