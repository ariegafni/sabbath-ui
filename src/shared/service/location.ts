import { config, createApiUrl } from "../lib/config";

export interface Country {
  id: number;
  name: string;
  name_hebrew: string;
  code: string;
  host_count: number;
}

export interface City {
  id: number;
  name: string;
  name_hebrew: string;
  country_id: number;
  country_name: string;
  host_count: number;
}

export interface LocationSearchParams {
  query?: string;
  country?: string;
  city?: string;
  limit?: number;
}

export class LocationService {
  private static baseUrl = createApiUrl("/api/locations");

  // קבלת כל המדינות
  static async getCountries(): Promise<Country[]> {
    const response = await fetch(`${this.baseUrl}/countries`);
    if (!response.ok) {
      throw new Error("Failed to fetch countries");
    }
    return response.json();
  }

  // קבלת ערים לפי מדינה
  static async getCitiesByCountry(countryId: number): Promise<City[]> {
    const response = await fetch(`${this.baseUrl}/cities/country/${countryId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch cities by country");
    }
    return response.json();
  }

  // חיפוש מיקומים
  static async searchLocations(params: LocationSearchParams): Promise<{
    countries: Country[];
    cities: City[];
  }> {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.append("query", params.query);
    if (params.country) searchParams.append("country", params.country);
    if (params.city) searchParams.append("city", params.city);
    if (params.limit) searchParams.append("limit", params.limit.toString());

    const response = await fetch(
      `${this.baseUrl}/search?${searchParams.toString()}`
    );
    if (!response.ok) {
      throw new Error("Failed to search locations");
    }
    return response.json();
  }

  // קבלת מיקום לפי קואורדינטות
  static async getLocationByCoordinates(
    lat: number,
    lng: number
  ): Promise<{
    country: string;
    city: string;
    address: string;
  }> {
    const response = await fetch(
      `${this.baseUrl}/reverse-geocode?lat=${lat}&lng=${lng}`
    );
    if (!response.ok) {
      throw new Error("Failed to get location by coordinates");
    }
    return response.json();
  }

  // קבלת מיקומים קרובים
  static async getNearbyLocations(
    lat: number,
    lng: number,
    radius: number = 10
  ): Promise<{
    countries: Country[];
    cities: City[];
  }> {
    const response = await fetch(
      `${this.baseUrl}/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    );
    if (!response.ok) {
      throw new Error("Failed to get nearby locations");
    }
    return response.json();
  }

  // קבלת מיקומים פופולריים
  static async getPopularLocations(): Promise<{
    countries: Country[];
    cities: City[];
  }> {
    const response = await fetch(`${this.baseUrl}/popular`);
    if (!response.ok) {
      throw new Error("Failed to get popular locations");
    }
    return response.json();
  }

  // אוטוקומפליט למיקומים
  static async getLocationAutocomplete(query: string): Promise<{
    countries: Country[];
    cities: City[];
  }> {
    const response = await fetch(
      `${this.baseUrl}/autocomplete?query=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      throw new Error("Failed to get location autocomplete");
    }
    return response.json();
  }
}
