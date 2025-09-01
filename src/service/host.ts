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
  photo?: File;
}


export interface UpdateHostRequest extends Partial<CreateHostRequest> {
  id: string;
}

export class HostService {
  private static baseUrl = createApiUrl("/api/hosts");
  // יצירת מארח חדש
static async createHost(hostData: CreateHostRequest): Promise<Host> {
  const formData = new FormData();
  Object.entries(hostData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append("photo", value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => formData.append(`${key}[]`, v));
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  const res = await fetch(this.baseUrl, {
    method: "POST",
    headers: { ...AuthService.getAuthHeaders() },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to create host");
  return (await res.json()) as Host;
}

//קבלת מארחים לפי מדינה - מחזיר רשימה של מארחים במדינה ספציפית
  static async getHostsByCountry(country: string): Promise<Host[]> {
    const res = await fetch(`${this.baseUrl}/country/${encodeURIComponent(country)}`);
    if (!res.ok) throw new Error("Failed to fetch hosts by country");
    return (await res.json()) as Host[];
  }
// קבלת כל המארחים - כרגע אין לזה באמת צורך
  static async getAllHosts(): Promise<Host[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) throw new Error("Failed to fetch hosts");
    return (await res.json()) as Host[];
  }
// קבלת מארח לפי מזהה
  static async getHostById(id: string): Promise<Host> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (!res.ok) throw new Error("Failed to fetch host");
    return (await res.json()) as Host;
  }

// עדכון מארח קיים
static async updateHost(hostData: UpdateHostRequest): Promise<Host> {
  const formData = new FormData();
  Object.entries(hostData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append("photo", value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => formData.append(`${key}[]`, v));
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  const res = await fetch(`${this.baseUrl}/${hostData.id}`, {
    method: "PUT",
    headers: { ...AuthService.getAuthHeaders() }, 
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to update host");
  return (await res.json()) as Host;
}

// מחיקת מארח
  static async deleteHost(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: {
        ...AuthService.getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error("Failed to delete host");
  }
// קבלת פרופיל המארח של המשתמש הנוכחי
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

}
