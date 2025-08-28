import { createApiUrl } from "../shared/lib/config";
import { AuthService } from "./auth";

export interface Host {
  id: string;
  country_place_id: string;
  city_place_id: string;
  city?: string;
  area?: string;
  address?: string;
  description?: string;
  bio?: string;
  max_guests: number;
  hosting_type: string[];
  kashrut_level?: string;
  languages: string[];
  total_hostings: number;
  is_always_available: boolean;
  available?: boolean;
  photo_url?: string;
  created_at?: string;
  updated_at?: string;
  rating?: number;
  user?: {
    _id: string;
    first_name: string;
    last_name: string;
    profile_image?: string;
  };
  name?: string;
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

  private static normalize(host: any): Host {
    return {
      ...host,
      id: host._id,
      name: host.user
        ? `${host.user.first_name ?? ""} ${host.user.last_name ?? ""}`.trim()
        : "",
      photo_url: host.user?.profile_image || host.photo_url,
    };
  }


  static async getAllHosts(): Promise<Host[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) throw new Error("Failed to fetch hosts");
    const data = await response.json();
    return data.map(this.normalize);
  }

  static async getHostsByCountry(country: string): Promise<Host[]> {
    const response = await fetch(
      `${this.baseUrl}/country/${encodeURIComponent(country)}`
    );
    if (!response.ok) throw new Error("Failed to fetch hosts by country");
    const data = await response.json();
    return data.map(this.normalize);
  }

  static async getHostById(id: string): Promise<Host> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) throw new Error("Failed to fetch host");
    const data = await response.json();
    return this.normalize(data);
  }

  static async createHost(hostData: CreateHostRequest): Promise<Host> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeaders(),
      },
      body: JSON.stringify(hostData),
    });
    if (!response.ok) throw new Error("Failed to create host");
    const data = await response.json();
    return this.normalize(data);
  }

  static async updateHost(hostData: UpdateHostRequest): Promise<Host> {
    const response = await fetch(`${this.baseUrl}/${hostData.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeaders(),
      },
      body: JSON.stringify(hostData),
    });
    if (!response.ok) throw new Error("Failed to update host");
    const data = await response.json();
    return this.normalize(data);
  }

  static async deleteHost(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: {
        ...AuthService.getAuthHeaders(),
      },
    });
    if (!response.ok) throw new Error("Failed to delete host");
  }

  static async getCurrentUserHostProfile(): Promise<Host | null> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: { ...AuthService.getAuthHeaders() },
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch current user host profile");
      }
      const data = await response.json();
      return this.normalize(data);
    } catch (error) {
      console.error("Error fetching host profile:", error);
      return null;
    }
  }

  static async uploadPhoto(file: File): Promise<{ photo_url: string }> {
    const formData = new FormData();
    formData.append("photo", file);

    const response = await fetch(`${this.baseUrl}/upload-photo`, {
      method: "POST",
      headers: { ...AuthService.getAuthHeaders() },
      body: formData,
    });
    if (!response.ok) throw new Error("Failed to upload host photo");
    return response.json();
  }
}
