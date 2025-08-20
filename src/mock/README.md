# מערכת Mock לאפליקציה

תקייה זו מכילה נתונים פיקטיביים ושירותים Mock עבור פיתוח ובדיקות.

## קבצים זמינים

### 📄 `userData.json`

קובץ JSON עם מידע מלא על משתמש פיקטיבי בשם **דוד כהן**:

- מידע אישי מלא
- פרופיל מארח עם דירוג 4.8
- פרופיל אורח עם היסטוריית ארוחות
- העדפות דיאטה (צמחוני, כשר)
- הישגים וסטטיסטיקות
- שיטות תשלום

### 🔧 `userServiceMock.ts`

שירות Mock שמחליף את השירות המקורי ומחזיר נתונים פיקטיביים:

- `getCurrentUser()` - קבלת פרופיל המשתמש
- `updateProfile()` - עדכון פרופיל
- `changePassword()` - שינוי סיסמה
- `uploadProfileImage()` - העלאת תמונת פרופיל
- `getActivityHistory()` - היסטוריית פעילות
- `getUserSettings()` - הגדרות משתמש
- `getUserStats()` - סטטיסטיקות

### 📋 `index.js`

קובץ ייצוא מרכזי עם פונקציות עזר:

- `getUserData()` - כל המידע
- `getBasicUserInfo()` - מידע בסיסי
- `getHostProfile()` - פרופיל מארח
- `getGuestProfile()` - פרופיל אורח
- ועוד...

## איך להשתמש

### 1. שימוש ישיר בנתונים

```javascript
import { getUserData, getBasicUserInfo } from "@/mock";

const user = getUserData();
const basicInfo = getBasicUserInfo();
```

### 2. שימוש בשירות Mock

```javascript
import { UserServiceMock } from "@/mock";

// קבלת פרופיל המשתמש
const profile = await UserServiceMock.getCurrentUser();

// עדכון פרופיל
const updatedProfile = await UserServiceMock.updateProfile({
  first_name: "דוד",
  last_name: "כהן",
  email: "david.cohen@example.com",
});
```

### 3. החלפת השירות המקורי

```javascript
// במקום:
// import { UserService } from '@/shared/service/user';

// השתמש ב:
import { UserServiceMock as UserService } from "@/mock";
```

## יתרונות השימוש ב-Mock

✅ **פיתוח מהיר** - אין צורך בשרת פעיל  
✅ **בדיקות קלות** - נתונים עקביים וצפויים  
✅ **פיתוח אופליין** - עבודה ללא אינטרנט  
✅ **בדיקת UI** - הצגת כל המצבים האפשריים  
✅ **פיתוח במקביל** - צוותי Frontend ו-Backend יכולים לעבוד בנפרד

## הערות חשובות

- הנתונים הם פיקטיביים לחלוטין
- השירותים מדמים עיכובי רשת אמיתיים
- כל הפונקציות מחזירות Promise (async/await)
- הנתונים נשמרים בזיכרון בלבד (לא נשמרים לשום מקום)

## דוגמאות שימוש נוספות

### הצגת הישגים

```javascript
import { getAchievements } from "@/mock";

const achievements = getAchievements();
// מחזיר: [{ id: "super_host", name: "מארח מעולה", ... }]
```

### הצגת פעילות אחרונה

```javascript
import { getRecentActivity } from "@/mock";

const activity = getRecentActivity();
// מחזיר: [{ type: "booking", date: "2024-01-15", ... }]
```

### הצגת סטטיסטיקות

```javascript
import { getStats } from "@/mock";

const stats = getStats();
// מחזיר: { totalBookings: 34, totalHostings: 47, ... }
```

