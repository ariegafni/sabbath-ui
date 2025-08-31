import { createApiUrl } from "../shared/lib/config";
import { AuthService } from "./auth";

export interface Host {
  id: string;
  name: string;
  photo_url?: string;
  country_place_id: string;
  city_place_id: string;
  city?: string;
  area?: string;
  max_guests: number;
  hosting_type: string[];
  kashrut_level?: string;
  languages: string[];
  bio?: string;
  total_hostings: number;
  is_always_available: boolean;
  rating?: number;
}

export interface CreateHostRequest {
  country_place_id: string;
  city_place_id: string;
  area?: string;
  address?: string;
  description?: string;
  bio?: string;
  max_guests: number;
  hosting_type: string[];
  kashrut_level?: string;
  languages: string[];
  total_hostings?: number;
  is_always_available?: boolean;
  available?: boolean;
  photo_url?: string;
}

export interface UpdateHostRequest extends Partial<CreateHostRequest> {
  id: string;
}

export class HostService {
  private static baseUrl = createApiUrl("/api/hosts");

  static async getHostsByCountry(country: string): Promise<Host[]> {
    const res = await fetch(`${this.baseUrl}/country/${encodeURIComponent(country)}`);
    if (!res.ok) throw new Error("Failed to fetch hosts by country");
    return (await res.json()) as Host[];
  }

  static async getAllHosts(): Promise<Host[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) throw new Error("Failed to fetch hosts");
    return (await res.json()) as Host[];
  }

  static async getHostById(id: string): Promise<Host> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (!res.ok) throw new Error("Failed to fetch host");
    return (await res.json()) as Host;
  }

  static async createHost(hostData: CreateHostRequest): Promise<Host> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeaders(),
      },
      body: JSON.stringify(hostData),
    });
    if (!res.ok) throw new Error("Failed to create host");
    return (await res.json()) as Host;
  }

  static async updateHost(hostData: UpdateHostRequest): Promise<Host> {
    const res = await fetch(`${this.baseUrl}/${hostData.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeaders(),
      },
      body: JSON.stringify(hostData),
    });
    if (!res.ok) throw new Error("Failed to update host");
    return (await res.json()) as Host;
  }

  static async deleteHost(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: {
        ...AuthService.getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error("Failed to delete host");
  }

  static async getCurrentUserHostProfile(): Promise<Host | null> {
    try {
      const res = await fetch(`${this.baseUrl}/me`, {
        headers: { ...AuthService.getAuthHeaders() },
      });
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch current user host profile");
      }
      return (await res.json()) as Host;
    } catch (e) {
      console.error("Error fetching host profile:", e);
      return null;
    }
  }

  static async uploadPhoto(file: File): Promise<{ photo_url: string }> {
    const formData = new FormData();
    formData.append("photo", file);
    const res = await fetch(`${this.baseUrl}/upload-photo`, {
      method: "POST",
      headers: { ...AuthService.getAuthHeaders() },
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload host photo");
    return (await res.json()) as { photo_url: string };
  }
}
