import { createApiUrl } from "../shared/lib/config";
import { AuthService } from "./auth";
import { UserStatusReason } from "../shared/types/userStatus";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  country?: string;
  city?: string;
  profile_image?: string;
  bio?: string;
  social_links?: Array<{ platform: string; url: string }>;
  is_verified: boolean;
  is_approved: boolean;
  status_reason?: UserStatusReason;
  status_reason_description?: string;
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
  private static baseUrl = createApiUrl("/api/users");

  // קבלת פרופיל המשתמש הנוכחי
  static async getCurrentUser(): Promise<User> {
    try {

      
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          ...AuthService.getAuthHeaders(),
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized - please login again");
        }
        throw new Error(`Failed to fetch current user: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching current user:", error);
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        throw new Error("Network error - please check your connection");
      }
      throw error;
    }
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

}
