"use client";

import { useEffect, useRef } from "react";

type LocationPickerProps = {
  country: string;
  city: string;
  area: string;
  onChange: (field: "country" | "city" | "area", value: string) => void;
};

export default function LocationPicker({ country, city, area, onChange }: LocationPickerProps) {
  const countryRef = useRef<HTMLInputElement | null>(null);
  const cityRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // טוען את Google Places API
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=he`;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (!window.google) return;

      
const countryAC = new window.google.maps.places.Autocomplete(countryRef.current!, {
        types: ["(regions)"],
        fields: ["address_components"]
      });

      const cityAC = new window.google.maps.places.Autocomplete(cityRef.current!, {
        types: ["(cities)"],
        fields: ["address_components"]
      });

      const extract = (components: google.maps.GeocoderAddressComponent[] | undefined, type: string, useShort = false) =>
        components?.find((c) => c.types.includes(type))?.[useShort ? "short_name" : "long_name"] || "";

      countryAC.addListener("place_changed", () => {
        const place = countryAC.getPlace();
        const code = extract(place.address_components, "country", true);
        onChange("country", code);
        onChange("city", ""); // איפוס עיר
      });

      cityAC.addListener("place_changed", () => {
        const place = cityAC.getPlace();
        const cityName =
          extract(place.address_components, "locality") ||
          extract(place.address_components, "postal_town");
        onChange("city", cityName);
      });
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [onChange]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">מיקום</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* מדינה */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">מדינה *</label>
          <input
            ref={countryRef}
            type="text"
            defaultValue={country}
            placeholder="הקלד מדינה"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* עיר */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">עיר *</label>
          <input
            ref={cityRef}
            type="text"
            defaultValue={city}
            placeholder="הקלד עיר"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* אזור */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">אזור (לא חובה)</label>
          <input
            type="text"
            value={area}
            onChange={(e) => onChange("area", e.target.value)}
            placeholder="שם האזור"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
