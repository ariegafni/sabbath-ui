"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Users, Star } from "lucide-react";
import Image from "next/image";

type Country = {
  id: number;
  name: string;
  name_hebrew: string;
  code: string;
  flag_url?: string;
  host_count: number;
};

type Host = {
  id: number;
  name: string;
  photo_url?: string;
  city: string;
  area?: string;
  max_guests: number;
  rating?: number;
  hosting_type: string[];
  kashrut_level?: string;
  languages: string[];
};

type CountriesListProps = {
  onCountrySelect?: (country: Country) => void;
};

export default function CountriesList({ onCountrySelect }: CountriesListProps) {
  const { t } = useTranslation();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch("http://127.0.0.1:3002/api/locations/countries");
      if (!response.ok) throw new Error("Failed to fetch countries");

      const data = await response.json();
      setCountries(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch countries"
      );
      // Fallback data for development
      setCountries([
        {
          id: 1,
          name: "Israel",
          name_hebrew: "ישראל",
          code: "IL",
          host_count: 45,
        },
        {
          id: 2,
          name: "United States",
          name_hebrew: "ארצות הברית",
          code: "US",
          host_count: 32,
        },
        {
          id: 3,
          name: "United Kingdom",
          name_hebrew: "בריטניה",
          code: "GB",
          host_count: 28,
        },
        {
          id: 4,
          name: "Canada",
          name_hebrew: "קנדה",
          code: "CA",
          host_count: 19,
        },
        {
          id: 5,
          name: "Australia",
          name_hebrew: "אוסטרליה",
          code: "AU",
          host_count: 15,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <MapPin className="h-16 w-16 mx-auto" />
        </div>
        <p className="text-red-600 text-lg">שגיאה בטעינת מדינות</p>
        <p className="text-red-500 text-sm mt-2">{error}</p>
        <button
          onClick={fetchCountries}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          נסה שוב
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          מצאו אירוח ברחבי העולם
        </h2>
        <p className="text-gray-600">בחרו מדינה וחפשו מארחים זמינים</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries.map((country) => (
          <div
            key={country.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 cursor-pointer group"
            onClick={() => onCountrySelect?.(country)}
          >
            {/* כותרת המדינה */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900">
                  {country.name_hebrew}
                </h3>
                <span className="text-sm text-gray-500">{country.name}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4" />
                <span className="text-sm">
                  {country.host_count} מארחים זמינים
                </span>
              </div>
            </div>

            {/* תצוגה מקדימה של מארחים */}
            <div className="p-6">
              <div className="grid grid-cols-4 gap-2 mb-4">
                {Array.from({ length: Math.min(8, country.host_count) }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center"
                    >
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                  )
                )}
              </div>

              <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transform group-hover:-translate-y-0.5 transition-all duration-200">
                צפה במארחים
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
