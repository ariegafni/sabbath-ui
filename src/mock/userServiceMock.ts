import {
  getUserData,
  getBasicUserInfo,
  getHostProfile,
  getGuestProfile,
  getRecentActivity,
  getAchievements,
  getStats,
  getUserPreferences,
  getPaymentMethods,
  getVerificationStatus,
} from "./index";

// המרת הנתונים מהפורמט שלנו לפורמט שהאפליקציה מצפה לו
const transformMockData = () => {
  const userData = getUserData();

  return {
    id: parseInt(userData.id.replace("user_", "")),
    first_name: userData.firstName,
    last_name: userData.lastName,
    email: userData.email,
    password: "********", // סיסמה פיקטיבית
    phone: userData.phone,
    profile_image: userData.profileImage,
    bio: userData.hostProfile.bio,
    social_links: [
      { platform: "instagram", url: "https://instagram.com/davidcohen" },
      { platform: "facebook", url: "https://facebook.com/davidcohen" },
    ],
    created_at: userData.createdAt,
    updated_at: userData.updatedAt,
    // מידע נוסף מהמבנה החדש
    location: userData.location,
    preferences: userData.preferences,
    hostProfile: userData.hostProfile,
    guestProfile: userData.guestProfile,
    verification: userData.verification,
    stats: userData.stats,
    recentActivity: userData.recentActivity,
    achievements: userData.achievements,
    paymentMethods: userData.paymentMethods,
  };
};

export class UserServiceMock {
  private static baseUrl = "/mock-api/users";

  // קבלת פרופיל המשתמש הנוכחי
  static async getCurrentUser(): Promise<any> {
    // הדמיה של עיכוב רשת
    await new Promise((resolve) => setTimeout(resolve, 300));

    // החזרת הנתונים הפיקטיביים
    return transformMockData();
  }

  // עדכון פרופיל המשתמש
  static async updateProfile(userData: any): Promise<any> {
    // הדמיה של עיכוב רשת
    await new Promise((resolve) => setTimeout(resolve, 500));

    // החזרת הנתונים המעודכנים (במציאות זה היה מעדכן את השרת)
    return {
      ...transformMockData(),
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      phone: userData.phone,
      bio: userData.bio,
      updated_at: new Date().toISOString(),
    };
  }

  // שינוי סיסמה
  static async changePassword(passwordData: any): Promise<void> {
    // הדמיה של עיכוב רשת
    await new Promise((resolve) => setTimeout(resolve, 400));

    // הדמיה של הצלחה
    console.log("Password changed successfully (mock)");
  }

  // מחיקת חשבון
  static async deleteAccount(): Promise<void> {
    // הדמיה של עיכוב רשת
    await new Promise((resolve) => setTimeout(resolve, 600));

    // הדמיה של הצלחה
    console.log("Account deleted successfully (mock)");
  }

  // העלאת תמונת פרופיל
  static async uploadProfileImage(
    file: File
  ): Promise<{ profile_image: string }> {
    // הדמיה של עיכוב רשת
    await new Promise((resolve) => setTimeout(resolve, 800));

    // הדמיה של URL חדש לתמונה
    return {
      profile_image: `/api/placeholder/150/150?t=${Date.now()}`,
    };
  }

  // קבלת היסטוריית פעילות
  static async getActivityHistory(): Promise<{
    logins: Array<{ timestamp: string; ip: string; location: string }>;
    profile_updates: Array<{ timestamp: string; field: string }>;
    hosting_activities: Array<{
      timestamp: string;
      action: string;
      details: string;
    }>;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      logins: [
        {
          timestamp: "2024-01-15T14:25:00Z",
          ip: "192.168.1.100",
          location: "תל אביב, ישראל",
        },
        {
          timestamp: "2024-01-14T09:15:00Z",
          ip: "192.168.1.100",
          location: "תל אביב, ישראל",
        },
        {
          timestamp: "2024-01-13T18:30:00Z",
          ip: "192.168.1.100",
          location: "תל אביב, ישראל",
        },
      ],
      profile_updates: [
        { timestamp: "2024-01-10T16:45:00Z", field: "bio" },
        { timestamp: "2024-01-05T11:20:00Z", field: "profile_image" },
        { timestamp: "2024-01-01T14:10:00Z", field: "phone" },
      ],
      hosting_activities: [
        {
          timestamp: "2024-01-15T19:00:00Z",
          action: "hosted_meal",
          details: "ארוחת ערב ל-4 אורחים",
        },
        {
          timestamp: "2024-01-14T18:30:00Z",
          action: "updated_availability",
          details: "עדכון זמני אירוח",
        },
        {
          timestamp: "2024-01-13T20:15:00Z",
          action: "received_review",
          details: "ביקורת חדשה מ-5 כוכבים",
        },
      ],
    };
  }

  // קבלת הגדרות משתמש
  static async getUserSettings(): Promise<{
    email_notifications: boolean;
    push_notifications: boolean;
    language: string;
    timezone: string;
    privacy_level: "public" | "friends" | "private";
  }> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const preferences = getUserPreferences();

    return {
      email_notifications: preferences.notifications.email,
      push_notifications: preferences.notifications.push,
      language: preferences.language,
      timezone: preferences.timezone,
      privacy_level: "public",
    };
  }

  // עדכון הגדרות משתמש
  static async updateUserSettings(settings: {
    email_notifications?: boolean;
    push_notifications?: boolean;
    language?: string;
    timezone?: string;
    privacy_level?: "public" | "friends" | "private";
  }): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    console.log("User settings updated successfully (mock):", settings);
  }

  // קבלת סטטיסטיקות משתמש
  static async getUserStats(): Promise<{
    total_hostings: number;
    total_guests: number;
    average_rating: number;
    response_rate: number;
    response_time_hours: number;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const stats = getStats();
    const hostProfile = getHostProfile();

    return {
      total_hostings: stats.totalHostings,
      total_guests: stats.totalBookings,
      average_rating: hostProfile.rating,
      response_rate: 98, // אחוז תגובה פיקטיבי
      response_time_hours: 2.5, // זמן תגובה ממוצע בשעות
    };
  }
}

// ייצוא השירות Mock כברירת מחדל
export default UserServiceMock;

