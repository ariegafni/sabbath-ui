"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Upload, MapPin, Users, FileText, Globe } from "lucide-react";
import Button from "@/ui/Button";
import { HostService, Host, UpdateHostRequest } from "@/service/host";
import { useAuth } from "@/Providers/AuthProvider";

interface EditHostProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditHostProfileModal({
  isOpen,
  onClose,
  onSuccess,
}: EditHostProfileModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hostData, setHostData] = useState<Host | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [formData, setFormData] = useState<UpdateHostRequest>({
    id: "",
    country_place_id: "",
    city_place_id: "",
    area: "",
    address: "",
    description: "",
    bio: "",
    max_guests: 1,
    hosting_type: [],
    kashrut_level: "",
    languages: [],
    is_always_available: false,
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  useEffect(() => {
    if (isOpen && user) {
      loadHostProfile();
    }
  }, [isOpen, user]);

  const loadHostProfile = async () => {
    try {
      setLoading(true);
      const profile = await HostService.getCurrentUserHostProfile();
      if (profile) {
        setHostData(profile);
        setFormData({
          id: profile.id,
          country_place_id: profile.country_place_id,
          city_place_id: profile.city_place_id,
          area: profile.area || "",
          address: "",
          description: "",
          bio: profile.bio || "",
          max_guests: profile.max_guests,
          hosting_type: profile.hosting_type,
          kashrut_level: profile.kashrut_level || "",
          languages: profile.languages,
          is_always_available: profile.is_always_available,
        });
        if (profile.photo_url) {
          setPhotoPreview(profile.photo_url);
        }
      }
    } catch (error) {
      console.error("Error loading host profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof UpdateHostRequest,
    value: string | number | boolean | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostData) return;

    try {
      setLoading(true);
      const updateData = { ...formData };
      if (photo) {
        updateData.photo = photo;
      }

      await HostService.updateHost(updateData);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error updating host profile:", error);
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-60">
          {t("manageHosting.hostProfile.updateSuccess")}
        </div>
      )}
      {/* Error Message */}
      {showErrorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-60">
          {t("manageHosting.hostProfile.updateError")}
        </div>
      )}
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("manageHosting.hostProfile.editHostingDetails")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("hostProfile.image")}
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  {t("publish.form.addPhoto")}
                </label>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                {t("common.location")}
              </label>
              <input
                type="text"
                value={formData.area || ""}
                onChange={(e) => handleInputChange("area", e.target.value)}
                placeholder={t("common.location")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="h-4 w-4 inline mr-1" />
                {t("publish.form.maxGuestsLabel")}
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.max_guests}
                onChange={(e) =>
                  handleInputChange("max_guests", parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Kashrut Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("publish.form.kashrutLabel")}
            </label>
            <select
              value={formData.kashrut_level}
              onChange={(e) => handleInputChange("kashrut_level", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t("common.select")}</option>
              <option value="kosher">{t("hosts.kashrut.kosher")}</option>
              <option value="mehadrin">{t("hosts.kashrut.mehadrin")}</option>
            </select>
          </div>

          {/* Hosting Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("publish.form.hostingTypeLabel")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["family", "young", "couple", "students"].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.hosting_type.includes(type)}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...formData.hosting_type, type]
                        : formData.hosting_type.filter((t) => t !== type);
                      handleInputChange("hosting_type", newTypes);
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    {t(`publish.style.${type}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="h-4 w-4 inline mr-1" />
              {t("publish.form.languagesLabelOptional")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["hebrew", "english", "french", "russian"].map((lang) => (
                <label key={lang} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.languages.includes(lang)}
                    onChange={(e) => {
                      const newLangs = e.target.checked
                        ? [...formData.languages, lang]
                        : formData.languages.filter((l) => l !== lang);
                      handleInputChange("languages", newLangs);
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    {t(`publish.language.${lang}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              {t("publish.form.bioLabel")}
            </label>
            <textarea
              value={formData.bio || ""}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder={t("publish.form.bioPlaceholder")}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Always Available */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_always_available}
                onChange={(e) =>
                  handleInputChange("is_always_available", e.target.checked)
                }
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                {t("manageHosting.availability.title")}
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading
                ? t("manageHosting.hostProfile.loading")
                : t("common.submit")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
