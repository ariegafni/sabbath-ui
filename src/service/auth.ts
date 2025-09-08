import { createApiUrl } from "../shared/lib/config";
import { UserStatusReason } from "../shared/types/userStatus";

export interface AuthUser {
  id: string; 
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  country?: string;
  city?: string;
  profile_image?: string;
  is_verified: boolean;
  is_approved: boolean;
  status_reason?: UserStatusReason;
  status_reason_description?: string;
  created_at: string;
  updated_at: string;
}


export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  country?: string;
  city?: string;
  profile_image?: string; // חדש
}

export interface AuthResponse {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export class AuthService {
  private static baseUrl = createApiUrl("/api/auth");

  // התחברות
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log(
        "NEXT_PUBLIC_API_BASE_URL:",
        process.env.NEXT_PUBLIC_API_BASE_URL
      );
      console.log("Logging in with URL:", `${this.baseUrl}/login`);

      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Login failed:", response.status, errorText);
        
        // Try to parse error message
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            if (errorData.error.includes("Invalid credentials")) {
              throw new Error("אימייל או סיסמה שגויים");
            } else {
              throw new Error(errorData.error);
            }
          }
        } catch (parseError) {
          // If we can't parse the error, use the raw text
          throw new Error(`Login failed: ${response.status} ${response.statusText}`);
        }
        
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        throw new Error("Network error - please check your connection");
      }
      throw error;
    }
  }

  // הרשמה
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log("Registering user with URL:", `${this.baseUrl}/register`);
      console.log("User data:", userData);
      
      // Add flag to indicate this is from multi-step registration
      const registrationData = {
        ...userData,
        is_multi_step: true, // This tells the backend to mark user as profile_incomplete if phone/image missing
      };
      
      const requestBody = JSON.stringify(registrationData);
      console.log("Request body:", requestBody);
      
      const response = await fetch(`${this.baseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Registration failed:", response.status, errorText);
        
        // Try to parse error message
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            if (errorData.error.includes("Email already exists")) {
              throw new Error("האימייל כבר קיים במערכת");
            } else if (errorData.error.includes("validation error")) {
              throw new Error("נתונים לא תקינים - אנא בדוק את הפרטים");
            } else {
              throw new Error(errorData.error);
            }
          }
        } catch (parseError) {
          // If we can't parse the error, use the raw text
          throw new Error(`Registration failed: ${response.status} ${response.statusText}`);
        }
        
        throw new Error(`Registration failed: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        throw new Error("Network error - please check your connection");
      }
      throw error;
    }
  }

  // התנתקות
  static async logout(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
      });
      if (!response.ok) {
        console.warn("Logout request failed, but clearing local tokens");
      }
    } catch (error) {
      console.warn("Logout request failed, but clearing local tokens:", error);
    } finally {
      this.clearTokens();
    }
  }

  // רענון טוקן
  static async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${this.baseUrl}/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!response.ok) {
      throw new Error("Token refresh failed");
    }
    const authResponse = await response.json();
    this.setTokens(authResponse.access_token, authResponse.refresh_token);
    return authResponse;
  }

  // אימות אימייל
  static async verifyEmail(token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) {
      throw new Error("Email verification failed");
    }
  }

  // שליחת קוד אימות מייל חוזר
  static async resendEmailVerification(email: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/resend-email-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      throw new Error("Failed to resend verification email");
    }
  }

  // עדכון פרופיל משתמש
  static async updateProfile(profileData: {
    phone?: string;
    profile_image?: string;
  }): Promise<AuthUser> {
    const response = await fetch(`${this.baseUrl}/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) {
      throw new Error("Profile update failed");
    }
    return response.json();
  }

  // העלאת תמונת פרופיל
  static async uploadProfileImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("profile_image", file);

    const response = await fetch(`${this.baseUrl}/upload-profile-image`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Profile image upload failed");
    }
    return response.json();
  }

  // שכחתי סיסמה
  static async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      throw new Error("Forgot password request failed");
    }
  }

  // איפוס סיסמה
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    if (!response.ok) {
      throw new Error("Password reset failed");
    }
  }

  // התחברות עם Google
  static async loginWithGoogle(code: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });
    if (!response.ok) {
      throw new Error("Google login failed");
    }
    return response.json();
  }

  // שמירת טוקנים
  private static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  }

  // קבלת access token
  private static getAccessToken(): string | null {
    return localStorage.getItem("access_token");
  }

  // קבלת refresh token
  private static getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token");
  }

  // ניקוי טוקנים
  private static clearTokens(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    // Clear cookie as well
    document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }

  // בדיקה אם המשתמש מחובר
  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // קבלת headers עם authorization
  static getAuthHeaders(): HeadersInit {
    const token = this.getAccessToken();
    return token ? { 
      Authorization: `Bearer ${token}`,
      'x-auth-token': token // For middleware compatibility
    } : {};
  }

  // קבלת טוקן (public method for socket connection)
  static getToken(): string | null {
    return this.getAccessToken();
  }
}
