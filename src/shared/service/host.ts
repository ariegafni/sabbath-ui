import { createApiUrl } from "../lib/config";
import { AuthService } from "./auth";

export interface Host {
  id: string;
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
  total_hostings: number;
  is_always_available: boolean;
  available?: boolean;
  photo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateHostRequest {
  country_place_id: string; // חובה
  city_place_id: string; // חובה
  area?: string;
  address?: string;
  description?: string;
  bio?: string;
  max_guests: number;
  hosting_type: string[];
  kashrut_level?: string;
  languages: string[];
  total_hostings?: number; // לא חובה
  is_always_available?: boolean; // לא חובה
  available?: boolean;
  photo_url?: string;
}

export interface UpdateHostRequest extends Partial<CreateHostRequest> {
  id: string; // ObjectId מ-Mongo
}

export class HostService {
  private static baseUrl = createApiUrl("/api/hosts");

  static async getAllHosts(): Promise<Host[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch hosts");
    }
    return response.json();
  }

  static async getHostsByCountry(country: string): Promise<Host[]> {
    const response = await fetch(`${this.baseUrl}/country/${country}`);
    if (!response.ok) {
      throw new Error("Failed to fetch hosts by country");
    }
    return response.json();
  }

  static async getHostById(id: number): Promise<Host> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch host");
    }
    return response.json();
  }

  static async createHost(hostData: CreateHostRequest): Promise<Host> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hostData),
    });
    if (!response.ok) {
      throw new Error("Failed to create host");
    }
    return response.json();
  }

  static async updateHost(hostData: UpdateHostRequest): Promise<Host> {
    const response = await fetch(`${this.baseUrl}/${hostData.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hostData),
    });
    if (!response.ok) {
      throw new Error("Failed to update host");
    }
    return response.json();
  }

  static async deleteHost(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete host");
    }
  }

  // העלאת תמונת מארח והחזרת כתובת התמונה
  static async uploadPhoto(file: File): Promise<{ photo_url: string }> {
    const formData = new FormData();
    formData.append("photo", file);

    const response = await fetch(`${this.baseUrl}/upload-photo`, {
      method: "POST",
      headers: {
        ...AuthService.getAuthHeaders(),
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Failed to upload host photo");
    }
    return response.json();
  }
}
