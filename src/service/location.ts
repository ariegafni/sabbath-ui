import { createApiUrl } from "../shared/lib/config";
import { Host } from "./host";

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
 static normalize(host: any): Host {
  return {
    ...host,
    name: `${host.user_first_name || ""} ${host.user_last_name || ""}`.trim(),
    city: host.city_name || null,
    area: host.area,
    photo_url: host.photo_url,
  };
}


    // Returns list of countries that have hosts with up to 5 sample hosts per country
    static async getCountriesWithHosts(): Promise<
      {
        country_place_id: string;
        hosts: Host[];
      }[]
    > {
      const response = await fetch(`${this.baseUrl}/countries`);
      if (!response.ok) throw new Error("Failed to fetch countries with hosts");
      const data = await response.json();
      return (data as Array<{ country_place_id: string; hosts: any[] }>).map(
        (bucket) => ({
          country_place_id: bucket.country_place_id,
          hosts: (bucket.hosts || []).map(this.normalize),
        })
      );
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

}
