"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
import Button from "@/ui/Button";
import LocationPicker from "./LazyLocationPicker";
import BubbleGroup from "./BubbleGroup";

type BecomeHostFormProps = {
  onSubmit: (data: HostFormData) => void;
  loading?: boolean;
};

export type HostFormData = {
  photo?: File;
  kashrut_level: string;
  hosting_type: string[];
  languages: string[];
  country_place_id: string;
  city_place_id: string;
  country_display_name: string;
  city_display_name: string;
  area: string;
  max_guests: number;
  bio: string;
};

export default function BecomeHostForm({
  onSubmit,
  loading = false,
}: BecomeHostFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<HostFormData>({
    kashrut_level: "",
    hosting_type: [],
    languages: [],
    country_place_id: "",
    city_place_id: "",
    country_display_name: "",
    city_display_name: "",
    area: "",
    max_guests: 2,
    bio: "",
    photo: undefined,
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }));
    }
  };

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateFormData = (field: keyof HostFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          {t("publish.form.preferencesTitle")}
        </h3>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {t("publish.form.kashrutLabel")}
          </label>
          <BubbleGroup
            mode="single"
            value={formData.kashrut_level ? [formData.kashrut_level] : []}
            onChange={(arr) => updateFormData("kashrut_level", arr[0] ?? "")}
            options={[
              { id: "כשר", label: "כשר" },
              { id: "כשר למהדרין", label: "כשר למהדרין" },
            ]}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {t("publish.form.hostingTypeLabel")}
          </label>
          <BubbleGroup
            mode="multi"
            value={formData.hosting_type}
            onChange={(arr) => updateFormData("hosting_type", arr)}
            options={[
              { id: "סעודות", label: "סעודות" },
              { id: "לינה", label: "לינה" },
            ]}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {t("publish.form.languagesLabelOptional")}
          </label>
          <BubbleGroup
            mode="multi"
            value={formData.languages}
            onChange={(arr) => updateFormData("languages", arr)}
            options={[
              { id: "עברית", label: "עברית" },
              { id: "אנגלית", label: "אנגלית" },
              { id: "ספרדית", label: "ספרדית" },
              { id: "צרפתית", label: "צרפתית" },
              { id: "יידיש", label: "יידיש" },
            ]}
          />
        </div>
      </div>

      <div className="space-y-4">
        <LocationPicker
          country_place_id={formData.country_place_id}
          city_place_id={formData.city_place_id}
          country_display_name={formData.country_display_name}
          city_display_name={formData.city_display_name}
          area={formData.area}
          onChange={(field, value) => updateFormData(field, value)}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          {t("publish.form.detailsTitle")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("publish.form.maxGuestsLabel")}
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.max_guests}
              onChange={(e) =>
                updateFormData("max_guests", parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {t("publish.form.bioLabel")}
          </label>
          <textarea
            rows={4}
            value={formData.bio}
            onChange={(e) => updateFormData("bio", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t("publish.form.bioPlaceholder")}
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-lg font-medium text-gray-900">
          {t("publish.form.photoTitle")}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {formData.photo ? (
            <div className="relative">
              <img
                src={URL.createObjectURL(formData.photo)}
                alt={t("publish.form.photoAlt")}
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ) : (
            <label className="col-span-full w-full h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div className="text-center">
                <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">
                  {t("publish.form.addPhoto")}
                </p>
              </div>
            </label>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
        ) : (
          t("publish.submit")
        )}
      </Button>
    </form>
  );
}
