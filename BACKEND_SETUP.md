# הגדרת Backend Flask

## שינוי Base URL

כדי שה-frontend יפנה ל-backend Flask ב-`http://localhost:3002`, יש לבצע את הפעולות הבאות:

### 1. יצירת קובץ Environment Variables

צור קובץ `.env.local` בתיקיית `sabbath-ui` עם התוכן הבא:

```bash
# Base URL של ה-backend Flask
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002

# JWT Secret (במקום אמיתי זה יהיה secret חזק)
JWT_SECRET=your-super-secret-jwt-key-here

# Google OAuth (אופציונלי)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth (אופציונלי)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### 2. הפעלת ה-Backend

ודא שה-backend Flask רץ על פורט 5000:

```bash
cd ShabbesGuest
python app.py
```

### 3. הפעלת ה-Frontend

בטרמינל נפרד, הפעל את ה-frontend:

```bash
cd sabbath-ui
npm run dev
```

### 4. בדיקה

ה-frontend אמור לרוץ על `http://localhost:3000` ולהתחבר ל-backend על `http://localhost:3002`.

## מבנה ה-API

ה-backend מספק את ה-endpoints הבאים:

### אימות (Auth)

- `POST /register` - רישום משתמש חדש
- `POST /login` - התחברות משתמש
- `POST /logout` - התנתקות
- `POST /refresh` - רענון JWT token
- `POST /verify-email` - אימות כתובת מייל
- `POST /forgot-password` - איפוס סיסמה
- `POST /reset-password` - איפוס סיסמה עם קוד
- `POST /google` - אימות עם Google
- `POST /facebook` - אימות עם Facebook

### משתמשים (Users)

- `GET /user/profile` - קבלת פרופיל משתמש
- `PUT /user/update` - עדכון פרופיל משתמש
- `DELETE /user/delete` - מחיקת משתמש

### מיקומים (Locations)

- `GET /countries` - רשימת מדינות
- `GET /countries/{id}/cities` - רשימת ערים לפי מדינה
- `GET /search?q={query}` - חיפוש מיקומים
- `GET /geocode?address={address}` - קבלת קואורדינטות לפי כתובת
- `GET /reverse-geocode?lat={lat}&lng={lng}` - קבלת כתובת לפי קואורדינטות
- `GET /nearby?lat={lat}&lng={lng}&radius={radius}` - מיקומים קרובים
- `GET /popular?limit={limit}` - מיקומים פופולריים
- `GET /autocomplete?q={query}` - השלמה אוטומטית

### פרשות (Parsha)

- `GET /parsha/current` - הפרשה הנוכחית
- `GET /parsha/by-date?date={date}` - פרשה לפי תאריך
- `GET /parsha/by-year/{year}` - פרשות לפי שנה
- `GET /parsha/next` - הפרשה הבאה
- `GET /parsha/previous` - הפרשה הקודמת
- `GET /parsha/range?start_date={start}&end_date={end}` - פרשות בטווח תאריכים
- `GET /parsha/holidays?year={year}` - חגים לפי שנה
- `GET /parsha/search?q={query}` - חיפוש פרשות

## פתרון בעיות

### CORS Errors

אם אתה מקבל שגיאות CORS, ודא שה-backend מאפשר בקשות מ-`http://localhost:3000`.

### Connection Refused

אם אתה מקבל "Connection refused", ודא שה-backend Flask רץ על פורט 3002.

### Environment Variables לא נטענות

אחרי יצירת קובץ `.env.local`, הפעל מחדש את ה-frontend עם `npm run dev`.
