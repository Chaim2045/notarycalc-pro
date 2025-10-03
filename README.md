# NotaryCalc Pro 🚀

מערכת חישוב תעריפי נוטריון מקצועית לעורכי דין ונוטריונים

## 📋 הקמת הפרויקט

### שלב 1: הקמת Supabase

1. היכנס ל: https://supabase.com
2. צור פרויקט חדש (Create New Project)
3. בחר שם לפרויקט: `notarycalc-pro`
4. בחר סיסמה חזקה ל-Database
5. המתן שהפרויקט ייווצר (~2 דקות)

### שלב 2: יצירת Database

1. לחץ על SQL Editor בצד שמאל
2. העתק והדבק את כל התוכן מקובץ `supabase-schema.sql`
3. לחץ RUN
4. וודא שהכל רץ בהצלחה (ללא שגיאות אדומות)

### שלב 3: העתקת מפתחות API

1. לחץ על ⚙️ Settings → API
2. העתק את הערכים הבאים:
   - **Project URL** → זה ה-`NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → זה ה-`NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. פתח את הקובץ `.env.local` והדבק את הערכים

דוגמה:
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### שלב 4: התקנה והרצה

```bash
# התקן dependencies
npm install

# הרץ את השרת
npm run dev
```

פתח בדפדפן: http://localhost:3000

## 🗂️ מבנה הפרויקט

```
notarycalc-pro/
├── app/                      # Next.js App Router
│   ├── auth/                 # מסכי הרשמה והתחברות
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/            # Dashboard ראשי
│   ├── calculations/         # מסכי חישובים
│   ├── clients/              # ניהול לקוחות
│   ├── settings/             # הגדרות
│   ├── globals.css           # Styles גלובליים
│   ├── layout.tsx            # Layout ראשי
│   └── page.tsx              # דף הבית (Landing)
├── components/               # קומפוננטות משותפות
├── lib/                      # Utilities
│   └── supabase.ts           # Supabase client
├── public/                   # קבצים סטטיים
├── .env.local                # משתני סביבה (לא ב-Git!)
├── supabase-schema.sql       # Schema של הDB
└── package.json
```

## 🔑 משתני סביבה נדרשים

צור קובץ `.env.local` בשורש הפרויקט:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📊 Database Schema

המערכת כוללת 6 טבלאות עיקריות:

1. **profiles** - פרופילי משתמשים
2. **clients** - לקוחות
3. **calculations** - חישובי תעריפים
4. **templates** - תבניות חישוב
5. **payments** - תשלומים
6. **audit_logs** - לוגים

## 🛣️ מסלולי המערכת (Routes)

### ציבורי
- `/` - דף נחיתה
- `/auth/login` - התחברות
- `/auth/signup` - הרשמה
- `/demo` - הדגמה

### מוגן (דורש התחברות)
- `/dashboard` - Dashboard ראשי
- `/calculations` - חישובים
- `/calculations/new` - חישוב חדש
- `/clients` - ניהול לקוחות
- `/settings` - הגדרות
- `/history` - היסטוריה

## 🚀 שלבי פיתוח

### ✅ שלב 1 - תשתית (הושלם)
- [x] הקמת Next.js
- [x] הגדרת Supabase
- [x] Database Schema
- [x] Types
- [x] דף Landing

### 🔄 שלב 2 - Authentication (בעבודה)
- [ ] מסך התחברות
- [ ] מסך הרשמה
- [ ] שחזור סיסמה
- [ ] Middleware להגנה על מסלולים

### 📝 שלב 3 - Core Features
- [ ] Dashboard
- [ ] מסך חישוב (העברה מה-HTML הישן)
- [ ] שמירת חישובים
- [ ] היסטוריה

### 👥 שלב 4 - Clients
- [ ] ניהול לקוחות
- [ ] חיפוש וסינון
- [ ] חיבור חישובים ללקוחות

### 💳 שלב 5 - Payments
- [ ] אינטגרציה עם Stripe
- [ ] ניהול מנויים
- [ ] חשבוניות

### 🎨 שלב 6 - Polish
- [ ] ייצוא PDF מעוצב
- [ ] תבניות
- [ ] דוחות
- [ ] אופטימיזציה

## 🔐 אבטחה

המערכת משתמשת ב-Row Level Security (RLS) של Supabase:
- כל משתמש רואה רק את הנתונים שלו
- אין אפשרות לגשת לנתונים של משתמשים אחרים
- Authentication מאובטח דרך Supabase Auth

## 📦 טכנולוגיות

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Payments**: Stripe (בעתיד)
- **Deployment**: Vercel (מומלץ)

## 🐛 Debugging

אם יש בעיות:

1. **Database Errors**: בדוק שה-SQL רץ ללא שגיאות
2. **Auth Errors**: וודא שהמפתחות ב-`.env.local` נכונים
3. **Connection Errors**: בדוק שה-Supabase Project פעיל

## 📞 תמיכה

אם יש שאלות או בעיות, פנה לקלוד 😊

---

**© 2025 כל הזכויות שמורות לחיים פרץ • משרד עו״ד גיא הרשקוביץ**
