"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Users, Star, MessageCircle, ArrowRight, Filter, X } from "lucide-react";
import Image from "next/image";
import { Host, HostService } from "../../service";
import HostingRequestForm from "../host/HostingRequestForm";

type HostsListProps = {
  country: { place_id: string; display_name: string };
  onHostSelect?: (host: Host) => void;
  onBack?: () => void;
};

export default function HostsList({
  country,
  onHostSelect,
  onBack,
}: HostsListProps) {
  const { t } = useTranslation();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    city: "",
    hosting_type: [] as string[],
    kashrut_level: "",
    max_guests: 0,
  });

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

  const resolveCityNames = async (items: Host[]) => {
    await loadGoogle();
    const service = new (window as any).google.maps.places.PlacesService(
      document.createElement("div")
    );

    const uniqueIds = Array.from(
      new Set(items.map((i) => i.city_place_id).filter(Boolean))
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
            const city =
              comps.find((c: any) => c.types.includes("locality")) ||
              comps.find((c: any) => c.types.includes("postal_town"));
            res(city?.long_name || p.formatted_address || place_id);
          }
        );
      });

    const namesArr = await Promise.all(uniqueIds.map(getName));
    const map = new Map<string, string>(
      uniqueIds.map((id, i) => [id, namesArr[i]])
    );

    return items.map<Host>((h) => ({
      ...h,
      id: h.id || (h as any)._id,
      city: map.get(h.city_place_id) || h.city_place_id,
    }));
  };

  useEffect(() => {
    fetchHosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  const fetchHosts = async () => {
    try {
      setLoading(true);
      
      const data = await HostService.getHostsByCountry(country.place_id);      
      const enriched = await resolveCityNames(data);     
      setHosts(enriched);
    } catch (err) {
      console.error('❌ שגיאה בטעינת מארחים:', err);
      setError(err instanceof Error ? err.message : t("hosts.errorLoading"));
      setHosts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredHosts = hosts.filter((host) => {
    if (filters.city && filters.city.trim()) {
      const cityFilter = filters.city.trim().toLowerCase();
      const hostCity = (host.city || "").toLowerCase();
      if (!hostCity.includes(cityFilter)) {
        return false;
      }
    }

    if (
      filters.hosting_type.length > 0 &&
      !filters.hosting_type.some((type) => host.hosting_type.includes(type))
    ) {
      return false;
    }

    if (filters.kashrut_level && host.kashrut_level !== filters.kashrut_level) {
      return false;
    }

    if (filters.max_guests > 0 && host.max_guests < filters.max_guests) {
      return false;
    }

    return true;
  });

  const clearFilters = () => {
    setFilters({
      city: "",
      hosting_type: [],
      kashrut_level: "",
      max_guests: 0,
    });
  };

  const hasActiveFilters = filters.city || filters.kashrut_level || filters.max_guests > 0 || filters.hosting_type.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-pink-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" dir="rtl">
        <div className="text-center max-w-md">
          <div className="text-pink-500 mb-6">
            <Users className="h-20 w-20 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            שגיאה בטעינת מארחים
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchHosts}
            className="px-6 py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 transition-colors"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 group"
            >
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              <span className="font-medium">{t("hosts.backToCountries")}</span>
            </button>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  מארחים ב{country.display_name}
                </h1>
                <p className="text-gray-600 mt-1">
                  {filteredHosts.length} מארחים זמינים
                </p>
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:border-gray-400 transition-colors bg-white"
              >
                <Filter className="h-4 w-4" />
                <span className="font-medium">פילטרים</span>
                {hasActiveFilters && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border-t border-gray-200 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">עיר</label>
                  <input
                    type="text"
                    placeholder="חפש עיר..."
                    value={filters.city}
                    onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">כשרות</label>
                  <select
                    value={filters.kashrut_level}
                    onChange={(e) => setFilters(prev => ({ ...prev, kashrut_level: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                  >
                    <option value="">כל הרמות</option>
                    <option value="כשר">כשר</option>
                    <option value="כשר למהדרין">כשר למהדרין</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">מספר אורחים</label>
                  <select
                    value={filters.max_guests}
                    onChange={(e) => setFilters(prev => ({ ...prev, max_guests: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                  >
                    <option value="0">כל המספרים</option>
                    <option value="1">לפחות 1</option>
                    <option value="2">לפחות 2</option>
                    <option value="4">לפחות 4</option>
                    <option value="6">לפחות 6</option>
                  </select>
                </div>

                <div className="flex items-end">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-3 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      נקה פילטרים
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredHosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredHosts.map((host) => (
              <div
                key={host.id}
                className="bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100"
                onClick={() => onHostSelect?.(host)}
              >
                {/* Host Image */}
                <div className="relative w-full h-64 sm:h-72 overflow-hidden">
                  <Image
                    src={
                      host.photo_url ||
                      `https://picsum.photos/400/300?random=${host.id}`
                    }
                    alt={host.name ?? "Host image"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  
                  {/* Rating Badge */}
                  {host.rating && (
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-900">{host.rating}</span>
                    </div>
                  )}

                  {/* Guests Count */}
                  <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                    {host.max_guests} אורחים
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Host Info */}
                <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col">
                  <div>
                    <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-1 line-clamp-1">
                      {host.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm line-clamp-1">
                        {host.city}
                        {host.area && `, ${host.area}`}
                      </span>
                    </div>
                  </div>

                  {host.bio && (
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {host.bio}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="space-y-3 flex-1">
                    {/* Hosting Types */}
                    <div className="flex flex-wrap gap-2">
                      {host.hosting_type.slice(0, 2).map((type, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                        >
                          {type}
                        </span>
                      ))}
                      {host.hosting_type.length > 2 && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                          +{host.hosting_type.length - 2}
                        </span>
                      )}
                    </div>

                    {/* Kashrut */}
                    {host.kashrut_level && (
                      <div className="flex">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          {host.kashrut_level}
                        </span>
                      </div>
                    )}

                    {/* Languages */}
                    <div className="flex flex-wrap gap-1">
                      {host.languages.slice(0, 3).map((lang, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-lg text-xs bg-gray-100 text-gray-600"
                        >
                          {lang}
                        </span>
                      ))}
                      {host.languages.length > 3 && (
                        <span className="px-2 py-1 rounded-lg text-xs bg-gray-100 text-gray-600">
                          +{host.languages.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHost(host);
                      }}
                      className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
                    >
                      בקש אירוח
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="text-gray-300 mb-6">
                <Users className="h-24 w-24 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {hasActiveFilters ? "לא נמצאו מארחים" : "אין מארחים זמינים"}
              </h3>
              <p className="text-gray-600 mb-8">
                {hasActiveFilters 
                  ? "נסה לשנות את הפילטרים כדי למצוא מארחים"
                  : "בקרוב יהיו מארחים זמינים באזור זה"
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-8 py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 transition-colors"
                >
                  נקה פילטרים
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Filters Overlay */}
      {showFilters && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">פילטרים</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">עיר</label>
                <input
                  type="text"
                  placeholder="חפש עיר..."
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-right"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">כשרות</label>
                <select
                  value={filters.kashrut_level}
                  onChange={(e) => setFilters(prev => ({ ...prev, kashrut_level: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-right"
                >
                  <option value="">כל הרמות</option>
                  <option value="כשר">כשר</option>
                  <option value="כשר למהדרין">כשר למהדרין</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">מספר אורחים</label>
                <select
                  value={filters.max_guests}
                  onChange={(e) => setFilters(prev => ({ ...prev, max_guests: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-right"
                >
                  <option value="0">כל המספרים</option>
                  <option value="1">לפחות 1</option>
                  <option value="2">לפחות 2</option>
                  <option value="4">לפחות 4</option>
                  <option value="6">לפחות 6</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  נקה הכל
                </button>
              )}
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 py-3 px-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
              >
                הצג {filteredHosts.length} מארחים
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hosting Request Modal */}
      {selectedHost && (
        <HostingRequestForm
          hostId={selectedHost.id?.toString() || ""}
          hostName={selectedHost.name || ""}
          hostProfileImage={selectedHost.photo_url}
          onClose={() => setSelectedHost(null)}
          onSuccess={() => {
            setSelectedHost(null);
          }}
        />
      )}
    </div>
  );
}