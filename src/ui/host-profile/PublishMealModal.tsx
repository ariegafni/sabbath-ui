"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import BubbleGroup, { BubbleOption } from "./BubbleGroup";
import { X, Calendar, Users, ArrowRight } from "lucide-react";

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
      { id: "open", key: "publish.religion.open" },
    ],
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
      { id: "withKids", key: "publish.style.withKids" },
    ],
  },
];

export default function PublishMealModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const initial = Object.fromEntries(data.map((c) => [c.id, [] as string[]]));
  const [values, setValues] = useState<Record<string, string[]>>(initial);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  const setCat = (catId: string, next: string[]) =>
    setValues((prev) => ({ ...prev, [catId]: next }));

  const handlePublish = () => {
    console.log(
      "Publish data:",
      Object.fromEntries(data.map((c) => [c.id, values[c.id]]))
    );
    onClose();
  };

  return (
    <div
      className="modal-overlay flex justify-center items-center p-4"
      dir="rtl"
    >
      <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {t("publish.title")}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {t("publish.subtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="modal-scrollable p-6 space-y-8">
          {data.map((cat) => (
            <section key={cat.id} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {t(cat.titleKey)}
                </h3>
              </div>
              <BubbleGroup
                mode={cat.mode}
                value={values[cat.id]}
                onChange={(next) => setCat(cat.id, next)}
                options={cat.options.map(
                  (o) => ({ id: o.id, label: t(o.key) } as BubbleOption)
                )}
              />
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium text-sm sm:text-base"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handlePublish}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold hover:from-green-700 hover:to-blue-700 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {t("publish.submit")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
