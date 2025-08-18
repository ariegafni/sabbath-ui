"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Upload, Camera } from "lucide-react";
import Button from "@/ui/Button";
import LocationPicker from "./LocationPicker";
import BubbleGroup from "./BubbleGroup";

type Country = {
  id: number;
  name: string;
  name_hebrew: string;
  code: string;
};

type City = {
  id: number;
  name: string;
  name_hebrew: string;
};

type BecomeHostFormProps = {
  onSubmit: (data: HostFormData) => void;
  loading?: boolean;
};

export type HostFormData = {
  host_photo_url?: string;
  kashrut_level: string;
  hosting_type: string[];
  languages: string[];
  country: string;
  city: string;
  area: string;
  max_guests: number;
  bio: string;
  photos: File[];
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
    country: "",
    city: "",
    area: "",
    max_guests: 2,
    bio: "",
    photos: [],
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...files],
    }));
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateFormData = (field: keyof HostFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: keyof HostFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? (prev[field] as string[]).filter((v) => v !== value)
        : [...(prev[field] as string[]), value],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      {/* העדפות וסגנון אירוח */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          העדפות וסגנון אירוח
        </h3>

        {/* כשרות */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">רמת כשרות</label>
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

        {/* סוג אירוח */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">סוג אירוח</label>
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

        {/* שפות */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            שפות (לא חובה)
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

      {/* מיקום (Google Places Component) */}
      <div className="space-y-4">
        <LocationPicker
          country={formData.country}
          city={formData.city}
          area={formData.area}
          onChange={(field, value) => updateFormData(field, value)}
        />
      </div>

      {/* פרטי אירוח */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">פרטי אירוח</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              מספר אורחים מקסימלי
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

        {/* תיאור */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            תיאור קצר עליך ועל האירוח שלך
          </label>
          <textarea
            rows={4}
            value={formData.bio}
            onChange={(e) => updateFormData("bio", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ספר על עצמך, על הבית שלך, ועל מה שאתה מציע לאורחים..."
          />
        </div>
      </div>

      {/* תמונות */}
      <div className="space-y-3">
        <label className="text-lg font-medium text-gray-900">
          תמונות מהבית
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {formData.photos.map((photo, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(photo)}
                alt={`תמונה ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}

          {formData.photos.length < 8 && (
            <label className="col-span-full w-full h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div className="text-center">
                <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">הוסף תמונה</p>
              </div>
            </label>
          )}
        </div>
        <p className="text-sm text-gray-500">ניתן להעלות עד 8 תמונות</p>
      </div>

      {/* כפתור שליחה */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
        ) : (
          "פרסם אירוח"
        )}
      </Button>
    </form>
  );
}
