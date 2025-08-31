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
        const countriesWithHosts = await LocationService.getCountriesWithHosts();
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

  const scrollHosts = (containerId: string, direction: 'left' | 'right') => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = container.offsetWidth * 0.85;
      container.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-pink-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-pink-500 mb-6">
            <MapPin className="h-20 w-20 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t("countries.errorLoading")}
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {t("countries.title")}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {t("countries.subtitle")}
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("countries.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-6 pr-12 py-4 text-lg border border-gray-200 rounded-full focus:ring-2 focus:ring-pink-500 focus:border-pink-500 shadow-sm hover:shadow-md transition-shadow text-right bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Countries Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredCountries.length === 0 && searchTerm ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-6">
              <Search className="h-20 w-20 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("countries.noResults")}
            </h3>
            <p className="text-gray-600">{t("countries.tryDifferentQuery")}</p>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredCountries.map((country) => (
              <div key={country.place_id} className="group">
                {/* Country Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        {country.display_name || country.name}
                      </h2>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-5 w-5" />
                        <span className="text-sm sm:text-base">
                          {t("countries.hostsAvailable", {
                            count: country.host_count || 0,
                          })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onCountrySelect?.(country)}
                      className="hidden sm:flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-full font-semibold hover:bg-gray-900 hover:text-white transition-colors"
                    >
                      {t("countries.viewHosts")}
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Hosts Horizontal Scroll */}
                {country.hosts && country.hosts.length > 0 ? (
                  <div className="relative">
                    <div
                      id={`hosts-container-${country.place_id}`}
                      className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-4"
                      style={{
                        scrollSnapType: 'x mandatory',
                        WebkitOverflowScrolling: 'touch'
                      }}
                    >
                      {country.hosts.map((host, index) => (
                        <div
                          key={host.id}
                          className="flex-none w-72 sm:w-80 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                          style={{ scrollSnapAlign: 'start' }}
                          onClick={() => onCountrySelect?.(country)}
                        >
                          <div className="relative w-full h-48 sm:h-56">
                            <Image
                              src={
                                host.photo_url ||
                                `https://picsum.photos/400/300?random=${host.id}`
                              }
                              alt={host.name ?? "Host"}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          </div>
                          <div className="p-4 sm:p-6">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1">
                              {host.name || t("hosts.unknown")}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              מארח מקצועי
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Navigation Arrows - Hidden on Mobile */}
                    {country.hosts.length > 1 && (
                      <>
                        <button
                          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all items-center justify-center group/btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            scrollHosts(`hosts-container-${country.place_id}`, 'left');
                          }}
                          aria-label="Previous hosts"
                        >
                          <ChevronLeft className="h-6 w-6 text-gray-700 group-hover/btn:text-gray-900" />
                        </button>

                        <button
                          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all items-center justify-center group/btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            scrollHosts(`hosts-container-${country.place_id}`, 'right');
                          }}
                          aria-label="Next hosts"
                        >
                          <ChevronRight className="h-6 w-6 text-gray-700 group-hover/btn:text-gray-900" />
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-sm">
                    <div className="text-gray-300 mb-4">
                      <Users className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      אין מארחים זמינים כרגע
                    </h3>
                    <p className="text-gray-600 mb-6">
                      בקרוב יהיו מארחים זמינים באזור זה
                    </p>
                    <button
                      onClick={() => onCountrySelect?.(country)}
                      className="px-8 py-3 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-colors"
                    >
                      עדכן אותי כשיהיו מארחים
                    </button>
                  </div>
                )}

                {/* Mobile View All Button */}
                <div className="sm:hidden mt-6">
                  <button
                    onClick={() => onCountrySelect?.(country)}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold text-lg hover:bg-gray-800 transition-colors"
                  >
                    {t("countries.viewHosts")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}