import { config, createApiUrl } from "../lib/config";

export interface Host {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  country?: string;
  city: string;
  area?: string;
  address?: string;
  description?: string;
  bio?: string;
  max_guests: number;
  rating?: number;
  hosting_type: string[];
  kashrut_level?: string;
  languages: string[];
  total_hostings: number;
  is_always_available: boolean;
  available?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateHostRequest {
  name: string;
  email: string;
  phone?: string;
  country: string;
  city: string;
  address: string;
  description?: string;
  max_guests: number;
}

export interface UpdateHostRequest extends Partial<CreateHostRequest> {
  id: number;
}

export class HostService {
  private static baseUrl = createApiUrl("/api/hosts");

  // קבלת כל המארחים
  static async getAllHosts(): Promise<Host[]> {
    const response = await fetch(`${this.baseUrl}/hosts`);
    if (!response.ok) {
      throw new Error("Failed to fetch hosts");
    }
    return response.json();
  }

  // קבלת מארחים לפי מדינה
  static async getHostsByCountry(country: string): Promise<Host[]> {
    const response = await fetch(`${this.baseUrl}/hosts/country/${country}`);
    if (!response.ok) {
      throw new Error("Failed to fetch hosts by country");
    }
    return response.json();
  }

  // קבלת מארח ספציפי
  static async getHostById(id: number): Promise<Host> {
    const response = await fetch(`${this.baseUrl}/hosts/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch host");
    }
    return response.json();
  }

  // יצירת מארח חדש
  static async createHost(hostData: CreateHostRequest): Promise<Host> {
    const response = await fetch(`${this.baseUrl}/hosts`, {
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

  // עדכון מארח קיים
  static async updateHost(hostData: UpdateHostRequest): Promise<Host> {
    const response = await fetch(`${this.baseUrl}/hosts/${hostData.id}`, {
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

  // מחיקת מארח
  static async deleteHost(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/hosts/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete host");
    }
  }
}
