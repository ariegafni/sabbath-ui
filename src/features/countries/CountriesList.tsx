"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Users, Search } from "lucide-react";
import { LocationService, Country } from "../../service";

type CountryView = Country & {
  display_name: string;
  host_count?: number;
};

export default function CountriesList({
  onCountrySelect,
}: {
  onCountrySelect?: (country: CountryView) => void;
}) {
  const { t } = useTranslation();
  const [countries, setCountries] = useState<CountryView[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<CountryView[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGoogle = () =>
    new Promise<void>((resolve) => {
      if (typeof window !== "undefined" && (window as any).google)
        return resolve();
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=he`;
      s.async = true;
      s.onload = () => resolve();
      document.body.appendChild(s);
    });

  const resolveNames = async (items: Country[]): Promise<CountryView[]> => {
    await loadGoogle();
    const service = new (window as any).google.maps.places.PlacesService(
      document.createElement("div")
    );
    const getName = (place_id: string) =>
      new Promise<string>((res) => {
        service.getDetails(
          {
            placeId: place_id,
            fields: ["address_components", "formatted_address"],
          },
          (p: any, status: any) => {
            if (
              status !==
                (window as any).google.maps.places.PlacesServiceStatus.OK ||
              !p
            )
              return res(place_id);
            const comps = p.address_components || [];
            const country = comps.find((c: any) => c.types.includes("country"));
            res(country?.long_name || p.formatted_address || place_id);
          }
        );
      });
    const names = await Promise.all(items.map((c) => getName(c.place_id)));
    return items.map((c, i) => ({ ...c, display_name: names[i] }));
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await LocationService.getCountries();
        const enriched = await resolveNames(data);
        setCountries(enriched);
        setFilteredCountries(enriched);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("countries.errorLoading")
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter(
        (country) =>
          country.display_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          country.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [searchTerm, countries]);

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
        <p className="text-red-600 text-lg">{t("countries.errorLoading")}</p>
        <p className="text-red-500 text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t("countries.title")}
        </h2>
        <p className="text-gray-600">{t("countries.subtitle")}</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t("countries.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCountries.map((country) => (
          <div
            key={country.place_id}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 cursor-pointer group"
            onClick={() => onCountrySelect?.(country)}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900">
                  {country.display_name || country.name}
                </h3>
                {/* <span className="text-sm text-gray-500">{country.name}</span> */}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4" />
                <span className="text-sm">
                  {t("countries.hostsAvailable", {
                    count: country.host_count || 0,
                  })}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-4 gap-2 mb-4">
                {Array.from({
                  length: Math.min(8, country.host_count || 0),
                }).map((_, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center"
                  >
                    <Users className="h-5 w-5 text-gray-500" />
                  </div>
                ))}
              </div>
              <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transform group-hover:-translate-y-0.5 transition-all duration-200">
                {t("countries.viewHosts")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty search results */}
      {searchTerm && filteredCountries.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">{t("countries.noResults")}</p>
          <p className="text-gray-400 text-sm mt-2">
            {t("countries.tryDifferentQuery")}
          </p>
        </div>
      )}
    </div>
  );
}
