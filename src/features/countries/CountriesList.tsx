"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Users, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { LocationService, Country, Host } from "../../service";

type CountryView = Country & {
  display_name: string;
  hosts?: Host[];
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
        // Fetch countries that have hosts, with up to 5 hosts per country
        const countriesWithHosts = await LocationService.getCountriesWithHosts();
        // Resolve country names and merge hosts into the country view
        const baseCountries: Country[] = countriesWithHosts.map((c) => ({
          place_id: c.country_place_id,
          name: "",
        }));
        const named = await resolveNames(baseCountries);
        const enriched: CountryView[] = named.map((c) => {
          const bucket = countriesWithHosts.find(
            (b) => b.country_place_id === c.place_id
          );
          const hosts = bucket?.hosts || [];
          return { ...c, hosts, host_count: hosts.length };
        });
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCountries.map((country) => (
          <div
            key={country.place_id}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 cursor-pointer group"
            onClick={() => onCountrySelect?.(country)}
          >
            {/* Header Section */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900">
                  {country.display_name || country.name}
                </h3>
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

            {/* Host Cards Carousel Section */}
            <div className="p-6">
              {country.hosts && country.hosts.length > 0 ? (
                <div className="relative mb-6">
                  {/* Enhanced Host Carousel */}
                  <div
                    id={`country-hosts-${country.place_id}`}
                    className="flex gap-4 overflow-hidden scroll-smooth"
                    style={{ scrollSnapType: 'x mandatory' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {country.hosts.map((host) => (
                      <div
                        key={host.id}
                        className="relative min-w-full w-full flex-shrink-0 bg-white rounded-2xl overflow-hidden shadow-lg"
                        style={{ scrollSnapAlign: 'start' }}
                      >
                        {/* Host Image with Overlay */}
                        <div className="relative w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200">
                          <Image
                            src={
                              host.photo_url ||
                              "https://picsum.photos/400/300?random=" + host.id
                            }
                            alt={host.name ?? "Host"}
                            fill
                            className="object-cover"
                          />
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                          
                          {/* Host Info Overlay */}
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                              <div className="text-lg font-bold text-gray-900 mb-1">
                                {host.name || t("hosts.unknown")}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {host.city || host.area || "מיקום לא ידוע"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Arrows - Positioned over the images */}
                  {country.hosts.length > 1 && (
                    <>
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm border border-white/20 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 flex items-center justify-center group/btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const el = document.getElementById(
                            `country-hosts-${country.place_id}`
                          );
                          if (el) {
                            const scrollAmount = el.clientWidth;
                            el.scrollBy({ left: -scrollAmount, behavior: "smooth" });
                          }
                        }}
                        aria-label="scroll right"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-700 group-hover/btn:text-blue-600 transition-colors" />
                      </button>

                      <button
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm border border-white/20 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 flex items-center justify-center group/btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const el = document.getElementById(
                            `country-hosts-${country.place_id}`
                          );
                          if (el) {
                            const scrollAmount = el.clientWidth;
                            el.scrollBy({ left: scrollAmount, behavior: "smooth" });
                          }
                        }}
                        aria-label="scroll left"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-700 group-hover/btn:text-blue-600 transition-colors" />
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="relative mb-6">
                  <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">אין מארחים זמינים</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors duration-300 shadow-lg hover:shadow-xl">
                {t("countries.viewHosts")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty search results */}
      {searchTerm && filteredCountries.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <p className="text-gray-500 text-lg">{t("countries.noResults")}</p>
          <p className="text-gray-400 text-sm mt-2">
            {t("countries.tryDifferentQuery")}
          </p>
        </div>
      )}
    </div>
  );
}