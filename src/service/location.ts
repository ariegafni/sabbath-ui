import { createApiUrl } from "../shared/lib/config";

export interface Country {
  place_id: string;
  name: string;
}

export interface City {
  place_id: string;
  name: string;
  country_place_id: string;
}

export interface LocationSearchParams {
  query?: string;
  country_place_id?: string;
  city_place_id?: string;
  limit?: number;
}

export interface AutocompleteItem {
  place_id: string;
  description: string;
}

export class LocationService {
  private static baseUrl = createApiUrl("/api/locations");

  static async getCountries(): Promise<Country[]> {
    const r = await fetch(`${this.baseUrl}/countries`);
    if (!r.ok) throw new Error("Failed to fetch countries");
    return r.json();
  }

  static async getCitiesByCountry(country_place_id: string): Promise<City[]> {
    const r = await fetch(`${this.baseUrl}/cities/country/${country_place_id}`);
    if (!r.ok) throw new Error("Failed to fetch cities by country");
    return r.json();
  }

  static async searchLocations(
    params: LocationSearchParams
  ): Promise<{ countries: Country[]; cities: City[] }> {
    const sp = new URLSearchParams();
    if (params.query) sp.append("query", params.query);
    if (params.country_place_id)
      sp.append("country_place_id", params.country_place_id);
    if (params.city_place_id) sp.append("city_place_id", params.city_place_id);
    if (params.limit) sp.append("limit", String(params.limit));
    const r = await fetch(`${this.baseUrl}/search?${sp.toString()}`);
    if (!r.ok) throw new Error("Failed to search locations");
    return r.json();
  }

  static async getLocationByCoordinates(
    lat: number,
    lng: number
  ): Promise<{
    country_place_id: string | null;
    city_place_id: string | null;
    address: string;
  }> {
    const r = await fetch(
      `${this.baseUrl}/reverse-geocode?lat=${lat}&lng=${lng}`
    );
    if (!r.ok) throw new Error("Failed to get location by coordinates");
    return r.json();
  }

  static async getNearbyLocations(
    lat: number,
    lng: number,
    radius = 10
  ): Promise<{ countries: Country[]; cities: City[] }> {
    const r = await fetch(
      `${this.baseUrl}/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    );
    if (!r.ok) throw new Error("Failed to get nearby locations");
    return r.json();
  }

  static async getPopularLocations(): Promise<{
    countries: Country[];
    cities: City[];
  }> {
    const r = await fetch(`${this.baseUrl}/popular`);
    if (!r.ok) throw new Error("Failed to get popular locations");
    return r.json();
  }

  static async getLocationAutocomplete(
    query: string
  ): Promise<AutocompleteItem[]> {
    const r = await fetch(
      `${this.baseUrl}/autocomplete?query=${encodeURIComponent(query)}`
    );
    if (!r.ok) throw new Error("Failed to get location autocomplete");
    return r.json();
  }
}
