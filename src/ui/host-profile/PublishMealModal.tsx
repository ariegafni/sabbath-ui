"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import BubbleGroup, { BubbleOption } from "./BubbleGroup";

type Category = {
  id: string;
  titleKey: string;
  mode: "single" | "multi";
  options: { id: string; key: string }[];
};

const data: Category[] = [
  {
    id: "religion",
    titleKey: "publish.religion.title",
    mode: "single",
    options: [
      { id: "haredi", key: "publish.religion.haredi" },
      { id: "dati", key: "publish.religion.dati" },
      { id: "chiloni", key: "publish.religion.chiloni" },
      { id: "masorti", key: "publish.religion.masorti" },
      { id: "open", key: "publish.religion.open" }
    ]
  },
  {
    id: "style",
    titleKey: "publish.style.title",
    mode: "multi",
    options: [
      { id: "family", key: "publish.style.family" },
      { id: "young", key: "publish.style.young" },
      { id: "couple", key: "publish.style.couple" },
      { id: "students", key: "publish.style.students" },
      { id: "withKids", key: "publish.style.withKids" }
    ]
  }
];

export default function PublishMealModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const initial = Object.fromEntries(data.map(c => [c.id, [] as string[]]));
  const [values, setValues] = useState<Record<string, string[]>>(initial);

  const setCat = (catId: string, next: string[]) =>
    setValues(prev => ({ ...prev, [catId]: next }));

  const handlePublish = () => {
    console.log(
      "Publish data:",
      Object.fromEntries(
        data.map(c => [c.id, values[c.id]])
      )
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <h2 className="text-xl font-bold mb-1">{t("publish.title")}</h2>
        <p className="text-sm text-gray-600 mb-6">{t("publish.subtitle")}</p>

        <div className="space-y-6">
          {data.map(cat => (
            <section key={cat.id} className="space-y-2">
              <h3 className="font-semibold">{t(cat.titleKey)}</h3>
              <BubbleGroup
                mode={cat.mode}
                value={values[cat.id]}
                onChange={(next) => setCat(cat.id, next)}
                options={cat.options.map(o => ({ id: o.id, label: t(o.key) }) as BubbleOption)}
              />
            </section>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-8">
          <button onClick={onClose} className="px-4 py-2 rounded-md border border-gray-300 bg-white">
            {t("common.cancel")}
          </button>
          <button onClick={handlePublish} className="px-4 py-2 rounded-md bg-blue-600 text-white">
            {t("publish.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
