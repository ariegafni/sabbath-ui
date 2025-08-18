"use client";

import { useEffect, useRef } from "react";

type LocationPickerProps = {
  country_place_id: string;
  city_place_id: string;
  area: string;
  onChange: (
    field: "country_place_id" | "city_place_id" | "area",
    value: string
  ) => void;
};

export default function LocationPicker({
  country_place_id,
  city_place_id,
  area,
  onChange,
}: LocationPickerProps) {
  const countryRef = useRef<HTMLInputElement | null>(null);
  const cityRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=he`;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (!window.google) return;

      const countryAC = new window.google.maps.places.Autocomplete(
        countryRef.current!,
        {
          types: ["(regions)"],
          fields: ["place_id", "formatted_address"],
        }
      );

      const cityAC = new window.google.maps.places.Autocomplete(
        cityRef.current!,
        {
          types: ["(cities)"],
          fields: ["place_id", "formatted_address"],
        }
      );

      countryAC.addListener("place_changed", () => {
        const place = countryAC.getPlace();
        if (!place.place_id) return;
        if (countryRef.current) {
          countryRef.current.value = place.formatted_address || "";
        }
        onChange("country_place_id", place.place_id);
        onChange("city_place_id", "");
      });

      cityAC.addListener("place_changed", () => {
        const place = cityAC.getPlace();
        if (!place.place_id) return;
        if (cityRef.current) {
          cityRef.current.value = place.formatted_address || "";
        }
        onChange("city_place_id", place.place_id);
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
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">מדינה *</label>
          <input
            ref={countryRef}
            type="text"
            placeholder="הקלד מדינה"
            required
            defaultValue={country_place_id}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">עיר *</label>
          <input
            ref={cityRef}
            type="text"
            placeholder="הקלד עיר"
            required
            defaultValue={city_place_id}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
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
