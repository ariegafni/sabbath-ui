import { createApiUrl } from "../shared/lib/config";
import { AuthService } from "./auth";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  profile_image?: string;
  bio?: string;
  social_links?: Array<{ platform: string; url: string }>;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  profile_image?: string;
  bio?: string;
  social_links?: Array<{ platform: string; url: string }>;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export class UserService {
  private static baseUrl = createApiUrl("/users");

  // קבלת פרופיל המשתמש הנוכחי
  static async getCurrentUser(): Promise<User> {
    const response = await fetch(`${this.baseUrl}/me`, {
      headers: {
        ...AuthService.getAuthHeaders(),
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch current user");
    }
    return response.json();
  }

  // עדכון פרופיל המשתמש
  static async updateProfile(userData: UpdateUserRequest): Promise<User> {
    const response = await fetch(`${this.baseUrl}/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeaders(),
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error("Failed to update profile");
    }
    return response.json();
  }

  // שינוי סיסמה
  static async changePassword(
    passwordData: ChangePasswordRequest
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeaders(),
      },
      body: JSON.stringify(passwordData),
    });
    if (!response.ok) {
      throw new Error("Failed to change password");
    }
  }

  // מחיקת חשבון
  static async deleteAccount(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/me`, {
      method: "DELETE",
      headers: {
        ...AuthService.getAuthHeaders(),
      },
    });
    if (!response.ok) {
      throw new Error("Failed to delete account");
    }
  }

  // העלאת תמונת פרופיל
  static async uploadProfileImage(
    file: File
  ): Promise<{ profile_image: string }> {
    const formData = new FormData();
    formData.append("profile_image", file);

    const response = await fetch(`${this.baseUrl}/upload-profile-image`, {
      method: "POST",
      headers: {
        ...AuthService.getAuthHeaders(),
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Failed to upload profile image");
    }
    return response.json();
  }

  // קבלת היסטוריית פעילות
  // static async getActivityHistory(): Promise<{
  //   logins: Array<{ timestamp: string; ip: string; location: string }>;
  //   profile_updates: Array<{ timestamp: string; field: string }>;
  //   hosting_activities: Array<{
  //     timestamp: string;
  //     action: string;
  //     details: string;
  //   }>;
  // }> {
  //   const response = await fetch(`${this.baseUrl}/activity-history`, {
  //     headers: {
  //       ...AuthService.getAuthHeaders(),
  //     },
  //   });
  //   if (!response.ok) {
  //     throw new Error("Failed to fetch activity history");
  //   }
  //   return response.json();
  // }

  // קבלת הגדרות משתמש
  // static async getUserSettings(): Promise<{
  //   email_notifications: boolean;
  //   push_notifications: boolean;
  //   language: string;
  //   timezone: string;
  //   privacy_level: "public" | "friends" | "private";
  // }> {
  //   const response = await fetch(`${this.baseUrl}/settings`, {
  //     headers: {
  //       ...AuthService.getAuthHeaders(),
  //     },
  //   });
  //   if (!response.ok) {
  //     throw new Error("Failed to fetch user settings");
  //   }
  //   return response.json();
  // }

  // עדכון הגדרות משתמש
  // static async updateUserSettings(settings: {
  //   email_notifications?: boolean;
  //   push_notifications?: boolean;
  //   language?: string;
  //   timezone?: string;
  //   privacy_level?: "public" | "friends" | "private";
  // }): Promise<void> {
  //   const response = await fetch(`${this.baseUrl}/settings`, {
  //     method: "PUT",
  //     headers: {
  //       "Content-Type": "application/json",
  //       ...AuthService.getAuthHeaders(),
  //     },
  //     body: JSON.stringify(settings),
  //   });
  //   if (!response.ok) {
  //     throw new Error("Failed to update user settings");
  //   }
  // }

  // קבלת סטטיסטיקות משתמש
  // static async getUserStats(): Promise<{
  //   total_hostings: number;
  //   total_guests: number;
  //   average_rating: number;
  //   response_rate: number;
  //   response_time_hours: number;
  // }> {
  //   const response = await fetch(`${this.baseUrl}/stats`, {
  //     headers: {
  //       ...AuthService.getAuthHeaders(),
  //     },
  //   });
  //   if (!response.ok) {
  //     throw new Error("Failed to fetch user stats");
  //   }
  //   return response.json();
  // }
}
