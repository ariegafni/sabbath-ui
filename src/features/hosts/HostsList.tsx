"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Users, Star, MessageCircle } from "lucide-react";
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
      id: h.id || (h as any)._id, // 🔑 מבטיח שתמיד יהיה id
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
      setError(err instanceof Error ? err.message : "Failed to fetch hosts");
      setHosts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredHosts = hosts.filter((host) => {
    // פילטר עיר - חיפוש חלקי עם תמיכה בעברית
    if (filters.city && filters.city.trim()) {
      const cityFilter = filters.city.trim().toLowerCase();
      const hostCity = (host.city || "").toLowerCase();
      if (!hostCity.includes(cityFilter)) {
        return false;
      }
    }

    // פילטר סוג אירוח
    if (
      filters.hosting_type.length > 0 &&
      !filters.hosting_type.some((type) => host.hosting_type.includes(type))
    ) {
      return false;
    }

    // פילטר רמת כשרות
    if (filters.kashrut_level && host.kashrut_level !== filters.kashrut_level) {
      return false;
    }

    // פילטר מספר אורחים מקסימלי
    if (filters.max_guests > 0 && host.max_guests < filters.max_guests) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div
        className="flex justify-center items-center py-12"
        dir="rtl"
        lang="he"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12" dir="rtl" lang="he">
        <div className="text-red-500 mb-4">
          <Users className="h-16 w-16 mx-auto" />
        </div>
        <p className="text-red-600 text-lg font-sans">שגיאה בטעינת מארחים</p>
        <p className="text-red-500 text-sm mt-2 font-sans">{error}</p>
        <button
          onClick={fetchHosts}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-sans"
          style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
        >
          נסה שוב
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl" lang="he">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-2 font-sans"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            ← חזרה למדינות
          </button>
          <h2 className="text-2xl font-bold text-gray-900 font-sans">
            מארחים ב{country.display_name}
          </h2>

          <p className="text-gray-600 font-sans">
            {filteredHosts.length} מארחים זמינים
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="חיפוש עיר..."
            value={filters.city}
            onChange={(e) => {
              const value = e.target.value;
              setFilters((prev) => ({ ...prev, city: value }));
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right font-sans"
            dir="rtl"
            lang="he"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          />

          <select
            value={filters.kashrut_level}
            onChange={(e) => {
              const value = e.target.value;
              setFilters((prev) => ({ ...prev, kashrut_level: value }));
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right font-sans"
            dir="rtl"
            lang="he"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            <option value="">כל הכשרויות</option>
            <option value="כשר">כשר</option>
            <option value="כשר למהדרין">כשר למהדרין</option>
          </select>

          <select
            value={filters.max_guests}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              setFilters((prev) => ({
                ...prev,
                max_guests: value,
              }));
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right font-sans"
            dir="rtl"
            lang="he"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            <option value="0">כל מספר אורחים</option>
            <option value="1">1+ אורחים</option>
            <option value="2">2+ אורחים</option>
            <option value="4">4+ אורחים</option>
            <option value="6">6+ אורחים</option>
          </select>
        </div>
      </div>

      {filteredHosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHosts.map((host) => (
            <div
              key={host.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 cursor-pointer group"
              onClick={() => onHostSelect?.(host)}
            >
              <div className="w-full h-48 relative overflow-hidden">
                <Image
                  src={
                    host.photo_url ||
                    "https://picsum.photos/400/200?random=" + host.id
                  }
                  alt={host.name ?? "Host image"}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                  {host.max_guests} מקומות
                </div>
                {host.rating && (
                  <div className="absolute top-3 right-3 bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    {host.rating}
                  </div>
                )}
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                    {host.name}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="line-clamp-1">
                      {host.city}
                      {host.area && `, ${host.area}`}
                    </span>
                  </div>
                </div>

                {host.bio && (
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {host.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {host.hosting_type.map((type, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-lg border border-blue-200 text-xs bg-blue-50 text-blue-700 font-medium"
                    >
                      {type}
                    </span>
                  ))}
                  {host.kashrut_level && (
                    <span className="px-2 py-1 rounded-lg border border-green-200 text-xs bg-green-50 text-green-700 font-medium">
                      {host.kashrut_level}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {host.languages.slice(0, 3).map((lang, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-lg border border-gray-200 text-xs bg-gray-50 text-gray-700"
                    >
                      {lang}
                    </span>
                  ))}
                  {host.languages.length > 3 && (
                    <span className="px-2 py-1 rounded-lg border border-gray-200 text-xs bg-gray-50 text-gray-700">
                      +{host.languages.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHost(host);
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transform group-hover:-translate-y-0.5 transition-all duration-200 text-sm font-sans"
                    style={{
                      fontFamily: "system-ui, -apple-system, sans-serif",
                    }}
                  >
                    בקש אירוח
                  </button>
                  <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-sans">
                    <MessageCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="h-16 w-16 mx-auto" />
          </div>
          <p className="text-gray-500 text-lg font-sans">לא נמצאו מארחים</p>
          <p className="text-gray-400 text-sm mt-2 font-sans">
            נסו לשנות את הפילטרים שלכם
          </p>
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
            // כאן אפשר להוסיף הודעת הצלחה או עדכון המסך
          }}
        />
      )}
    </div>
  );
}
