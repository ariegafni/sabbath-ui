# Service Layer Refactor

## סקירה כללית

הפרויקט עבר ריפקטור כדי שכל התקשורת עם השרת תהיה מנוהלת דרך שכבת שירותים מאורגנת במקום קריאות ישירות לשרת מהקומפוננטות.

## מבנה חדש

### תיקיית Service

```
src/shared/service/
├── index.ts          # ייצוא כל השירותים
├── auth.ts           # שירותי אימות
├── host.ts           # שירותי מארחים
├── location.ts       # שירותי מיקומים
├── message.ts        # שירותי הודעות
└── user.ts           # שירותי משתמשים
```

### קובץ .env

```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3002
```

## שירותים זמינים

### AuthService

- `login(credentials)` - התחברות
- `register(userData)` - הרשמה
- `logout()` - התנתקות
- `refreshToken()` - רענון טוקן
- `verifyEmail(token)` - אימות אימייל
- `forgotPassword(email)` - שכחתי סיסמה
- `resetPassword(token, newPassword)` - איפוס סיסמה

### HostService

- `getAllHosts()` - קבלת כל המארחים
- `getHostsByCountry(country)` - קבלת מארחים לפי מדינה
- `getHostById(id)` - קבלת מארח ספציפי
- `createHost(hostData)` - יצירת מארח חדש
- `updateHost(hostData)` - עדכון מארח קיים
- `deleteHost(id)` - מחיקת מארח

### LocationService

- `getCountries()` - קבלת כל המדינות
- `getCitiesByCountry(countryId)` - קבלת ערים לפי מדינה
- `searchLocations(params)` - חיפוש מיקומים
- `getLocationByCoordinates(lat, lng)` - קבלת מיקום לפי קואורדינטות
- `getNearbyLocations(lat, lng, radius)` - קבלת מיקומים קרובים
- `getPopularLocations()` - קבלת מיקומים פופולריים
- `getLocationAutocomplete(query)` - אוטוקומפליט למיקומים

### MessageService

- `getThreads()` - קבלת כל השיחות
- `getMessagesByThread(threadId)` - קבלת הודעות בשיחה
- `sendMessage(messageData)` - שליחת הודעה
- `createThread(threadData)` - יצירת שיחה חדשה
- `markMessageAsRead(messageId)` - סימון הודעה כנקראה
- `markThreadAsRead(threadId)` - סימון שיחה כנקראה
- `deleteMessage(messageId)` - מחיקת הודעה
- `deleteThread(threadId)` - מחיקת שיחה

### UserService

- `getCurrentUser()` - קבלת המשתמש הנוכחי
- `updateProfile(userData)` - עדכון פרופיל
- `changePassword(passwordData)` - שינוי סיסמה
- `deleteAccount()` - מחיקת חשבון
- `uploadProfileImage(file)` - העלאת תמונת פרופיל
- `getActivityHistory()` - קבלת היסטוריית פעילות
- `getUserSettings()` - קבלת הגדרות משתמש
- `updateUserSettings(settings)` - עדכון הגדרות משתמש
- `getUserStats()` - קבלת סטטיסטיקות משתמש

## שימוש בקומפוננטות

### לפני הריפקטור

```typescript
const response = await fetch("http://127.0.0.1:3002/api/locations/countries");
if (!response.ok) throw new Error("Failed to fetch countries");
const data = await response.json();
```

### אחרי הריפקטור

```typescript
import { LocationService } from "../../shared/service";

const data = await LocationService.getCountries();
```

## יתרונות המבנה החדש

1. **ניהול מרכזי** - כל הקריאות לשרת מרוכזות במקום אחד
2. **טיפוסים עקביים** - interfaces אחידים לכל השירותים
3. **טיפול בשגיאות** - טיפול בשגיאות מרוכז ועקבי
4. **תחזוקה קלה** - שינויים בשרת דורשים עדכון רק בקובץ אחד
5. **בדיקות** - קל יותר לכתוב בדיקות עבור השירותים
6. **שימוש חוזר** - שירותים יכולים לשמש בקומפוננטות שונות

## הגדרת סביבה

1. צור קובץ `.env` בתיקיית השורש
2. הגדר את המשתנה `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3002`
3. הפעל מחדש את השרת

## הערות חשובות

- כל השירותים משתמשים ב-`fetch` API
- טוקני אימות נשלחים אוטומטית דרך `AuthService.getAuthHeaders()`
- שגיאות מטופלות באופן עקבי עם הודעות בעברית
- כל השירותים כוללים fallback data לפיתוח

## דוגמאות נוספות

### יצירת מארח חדש

```typescript
import { HostService } from "../../shared/service";

const newHost = await HostService.createHost({
  name: "יוסי לוי",
  email: "yossi@example.com",
  country: "ישראל",
  city: "תל אביב",
  address: "רחוב הרצל 1",
  max_guests: 4,
});
```

### התחברות משתמש

```typescript
import { AuthService } from "../../shared/service";

const authResponse = await AuthService.login({
  email: "user@example.com",
  password: "password123",
});

// הטוקנים נשמרים אוטומטית ב-localStorage
```

### קבלת הודעות שלא נקראו

```typescript
import { MessageService } from "../../shared/service";

const unreadCount = await MessageService.getUnreadCount();
console.log(`יש לך ${unreadCount.count} הודעות שלא נקראו`);
```
