"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Upload, MapPin, Users, Star, Camera } from "lucide-react";
import { LocationService } from "../../shared/service";
import Button from "@/ui/Button";

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
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [formData, setFormData] = useState<HostFormData>({
    kashrut_level: "",
    hosting_type: [],
    languages: [],
    country: "",
    city: "",
    area: "",
    max_guests: 2,
    bio: "אני אוהב לארח אנשים ולשתף את התרבות והמסורת שלי. הבית שלי פתוח לכל מי שרוצה לחוות אירוח חם ואותנטי.",
    photos: [],
  });

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchCities(selectedCountry);
    }
  }, [selectedCountry]);

  const fetchCountries = async () => {
    try {
      const data = await LocationService.getCountries();
      setCountries(data);
    } catch (error) {
      console.error("Failed to fetch countries:", error);
      // Fallback data
      setCountries([
        { id: 1, name: "Israel", name_hebrew: "ישראל", code: "IL" },
        {
          id: 2,
          name: "United States",
          name_hebrew: "ארצות הברית",
          code: "US",
        },
        { id: 3, name: "United Kingdom", name_hebrew: "בריטניה", code: "GB" },
      ]);
    }
  };

  const fetchCities = async (countryCode: string) => {
    try {
      const country = countries.find((c) => c.code === countryCode);
      if (country) {
        const data = await LocationService.getCitiesByCountry(country.id);
        setCities(data);
      }
    } catch (error) {
      console.error("Failed to fetch cities:", error);
      // Fallback data
      setCities([
        { id: 1, name: "Tel Aviv", name_hebrew: "תל אביב" },
        { id: 2, name: "Jerusalem", name_hebrew: "ירושלים" },
        { id: 3, name: "Haifa", name_hebrew: "חיפה" },
      ]);
    }
  };

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
      {/* תמונת מארח */}
      <div className="space-y-3">
        <label className="text-lg font-medium text-gray-900">תמונת מארח</label>
        <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer relative">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                updateFormData("host_photo_url", url);
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {formData.host_photo_url ? (
            <img
              src={formData.host_photo_url}
              alt="תמונת מארח"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-center">
              <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">העלה תמונה</p>
            </div>
          )}
        </div>
      </div>

      {/* העדפות וסגנון אירוח */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          העדפות וסגנון אירוח
        </h3>

        {/* כשרות */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">רמת כשרות</label>
          <div className="flex gap-3">
            {["כשר", "כשר למהדרין"].map((level) => (
              <label key={level} className="flex items-center">
                <input
                  type="radio"
                  name="kashrut_level"
                  value={level}
                  checked={formData.kashrut_level === level}
                  onChange={(e) =>
                    updateFormData("kashrut_level", e.target.value)
                  }
                  className="mr-2"
                />
                <span className="text-sm">{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* סוג אירוח */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">סוג אירוח</label>
          <div className="flex flex-wrap gap-3">
            {["סעודות", "לינה"].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hosting_type.includes(type)}
                  onChange={() => toggleArrayValue("hosting_type", type)}
                  className="mr-2"
                />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* שפות */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            שפות (לא חובה)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {["עברית", "אנגלית", "ספרדית", "צרפתית", "יידיש"].map((lang) => (
              <label key={lang} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.languages.includes(lang)}
                  onChange={() => toggleArrayValue("languages", lang)}
                  className="mr-2"
                />
                <span className="text-sm">{lang}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* מיקום */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">מיקום</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* מדינה */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">מדינה *</label>
            <select
              required
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                updateFormData("country", e.target.value);
                updateFormData("city", "");
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">בחר מדינה</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name_hebrew}
                </option>
              ))}
            </select>
          </div>

          {/* עיר */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">עיר *</label>
            <select
              required
              value={formData.city}
              onChange={(e) => updateFormData("city", e.target.value)}
              disabled={!selectedCountry}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">בחר עיר</option>
              {cities.map((city) => (
                <option key={city.id} value={city.name}>
                  {city.name_hebrew}
                </option>
              ))}
            </select>
          </div>

          {/* אזור */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              אזור (לא חובה)
            </label>
            <input
              type="text"
              value={formData.area}
              onChange={(e) => updateFormData("area", e.target.value)}
              placeholder="שם האזור"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* פרטי אירוח */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">פרטי אירוח</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* מספר אורחים */}
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
            <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer flex items-center justify-center">
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
