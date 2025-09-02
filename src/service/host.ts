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
  address?: string;
  description?: string;
  max_guests: number;
  hosting_type: string[];
  kashrut_level?: string;
  languages: string[];
  bio?: string;
  total_hostings: number;
  is_always_available: boolean;
  available?: boolean;
  available_dates: string[];
  rating?: number;
  user_id: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    profile_image?: string;
    bio?: string;
    city?: string;
    country?: string;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
    social_links: string[];
  };
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


export type UpdateHostRequest = {
  id: string;
  kashrut_level: string;
  hosting_type: string[];
  languages: string[];
  country_place_id: string;
  city_place_id: string;
  country_display_name: string;
  city_display_name: string;
  area: string;
  max_guests: number;
  bio: string;
  photo?: File;
};

export class HostService {
  private static baseUrl = "http://127.0.0.1:3005/api/hosts";
  // יצירת מארח חדש
static async createHost(hostData: CreateHostRequest): Promise<Host> {
  // בדיקה אם יש תמונה
  const hasPhoto = hostData.photo && hostData.photo instanceof File && hostData.photo.size > 0;
  
  if (hasPhoto) {
    // אם יש תמונה, שולח FormData
    const formData = new FormData();
    Object.entries(hostData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append("photo", value);
        } else if (Array.isArray(value)) {
          // שליחת מערכים כטקסט מופרד בפסיקים כפי שה-Backend מצפה
          formData.append(key, value.join(','));
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
  } else {
    // אם אין תמונה, שולח JSON
    const jsonData = { ...hostData };
    delete jsonData.photo; // מסיר את השדה photo מה-JSON
    
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { 
        ...AuthService.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData),
    });
    if (!res.ok) throw new Error("Failed to create host");
    return (await res.json()) as Host;
  }
}

//קבלת מארחים לפי מדינה - מחזיר רשימה של מארחים במדינה ספציפית
  static async getHostsByCountry(country: string): Promise<Host[]> {
    const url = `${this.baseUrl}/country/${encodeURIComponent(country)}`;

    
    const res = await fetch(url);
    
    if (!res.ok) {
      console.error('❌ שגיאה בקריאת API:', res.status, res.statusText);
      throw new Error("Failed to fetch hosts by country");
    }
    
    const data = await res.json();
    console.log('✅ נתונים שחוזרים מהקריאה:', data);
    
    return data as Host[];
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
  // בדיקה אם יש תמונה
  const hasPhoto = hostData.photo && hostData.photo instanceof File && hostData.photo.size > 0;
  
  if (hasPhoto) {
    // אם יש תמונה, שולח FormData
    const formData = new FormData();
    Object.entries(hostData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append("photo", value);
        } else if (Array.isArray(value)) {
          // שליחת מערכים כטקסט מופרד בפסיקים כפי שה-Backend מצפה
          formData.append(key, value.join(','));
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
  } else {
    // אם אין תמונה, שולח JSON
    const jsonData = { ...hostData };
    delete jsonData.photo; // מסיר את השדה photo מה-JSON
    
    const res = await fetch(`${this.baseUrl}/${hostData.id}`, {
      method: "PUT",
      headers: { 
        ...AuthService.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData),
    });
    if (!res.ok) throw new Error("Failed to update host");
    return (await res.json()) as Host;
  }
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
      const headers = AuthService.getAuthHeaders();
      console.log('Auth headers:', headers);
      console.log('Fetching from URL:', `${this.baseUrl}/me`);
      
      const res = await fetch(`${this.baseUrl}/me`, {
        headers: { ...headers },
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        if (res.status === 404) return null;
        const errorText = await res.text();
        console.error('API Error:', errorText);
        throw new Error("Failed to fetch current user host profile");
      }
      return (await res.json()) as Host;
    } catch (e) {
      console.error("Error fetching host profile:", e);
      return null;
    }
  }

  // עדכון זמינות מארח
  static async updateAvailability(hostId: string, availabilityData: {
    is_always_available: boolean;
    available_dates: string[];
  }): Promise<Host> {
    const res = await fetch(`${this.baseUrl}/${hostId}/availability`, {
      method: "PUT",
      headers: {
        ...AuthService.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(availabilityData),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Availability update error:', errorText);
      throw new Error("Failed to update availability");
    }
    
    return (await res.json()) as Host;
  }

}
