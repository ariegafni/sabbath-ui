"use client";

import { useEffect, useRef } from "react";
import { loadGoogleMaps } from "@/service/loadGoogleMaps";

type LocationPickerProps = {
  country_place_id: string;
  city_place_id: string;
  country_display_name: string;
  city_display_name: string;
  area: string;
  onChange: (
    field: "country_place_id" | "city_place_id" | "country_display_name" | "city_display_name" | "area",
    value: string
  ) => void;
};

export default function LocationPicker({
  country_place_id,
  city_place_id,
  country_display_name,
  city_display_name,
  area,
  onChange,
}: LocationPickerProps) {
  const countryRef = useRef<HTMLInputElement | null>(null);
  const cityRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadGoogleMaps(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string).then(
      () => {
        if (!window.google || !window.google.maps || !window.google.maps.places)
          return;
        if (!countryRef.current || !cityRef.current) return;

        const countryAC = new window.google.maps.places.Autocomplete(
          countryRef.current,
          { types: ["(regions)"], fields: ["place_id", "formatted_address", "address_components"] }
        );

        let cityAC = new window.google.maps.places.Autocomplete(
          cityRef.current,
          { types: ["(cities)"], fields: ["place_id", "formatted_address"] }
        );

        countryAC.addListener("place_changed", () => {
          const place = countryAC.getPlace();
          if (!place.place_id) return;
          
          onChange("country_place_id", place.place_id);
          onChange("country_display_name", place.formatted_address || "");
          onChange("city_place_id", "");
          onChange("city_display_name", "");
          
          // נקה את שדה העיר
          if (cityRef.current) {
            cityRef.current.value = "";
          }
          
          // מצא את קוד המדינה
          let countryCode = "";
          if (place.address_components) {
            for (const component of place.address_components) {
              if (component.types.includes("country")) {
                countryCode = component.short_name;
                break;
              }
            }
          }
          
          // צור autocomplete חדש לעיר עם הגבלה למדינה שנבחרה
          if (countryCode && cityRef.current) {
            cityAC = new window.google.maps.places.Autocomplete(
              cityRef.current,
              { 
                types: ["(cities)"], 
                fields: ["place_id", "formatted_address"],
                componentRestrictions: { country: countryCode }
              }
            );
            
            cityAC.addListener("place_changed", () => {
              const cityPlace = cityAC.getPlace();
              if (!cityPlace.place_id) return;
              onChange("city_place_id", cityPlace.place_id);
              onChange("city_display_name", cityPlace.formatted_address || "");
            });
          }
        });

        cityAC.addListener("place_changed", () => {
          const place = cityAC.getPlace();
          if (!place.place_id) return;
          onChange("city_place_id", place.place_id);
          onChange("city_display_name", place.formatted_address || "");
        });
      }
    );
  }, [onChange]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">מיקום</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">מדינה *</label>
          <input
            ref={countryRef}
            type="text"
            placeholder="הקלד מדינה"
            required
            value={country_display_name}
            onChange={(e) => onChange("country_display_name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">עיר *</label>
          <input
            ref={cityRef}
            type="text"
            placeholder="הקלד עיר"
            required
            value={city_display_name}
            onChange={(e) => onChange("city_display_name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            אזור (לא חובה)
          </label>
          <input
            type="text"
            value={area}
            onChange={(e) => onChange("area", e.target.value)}
            placeholder="שם האזור"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
