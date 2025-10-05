# מדריך ניקוי משתמשים ב-Supabase

## אופציה 1: דרך Supabase Dashboard (מומלץ)

1. כנס ל: https://app.supabase.com
2. בחר את הפרויקט שלך
3. לחץ על **Authentication** בתפריט השמאלי
4. לחץ על **Users**
5. תראה רשימת משתמשים - לחץ על ה-... ליד המשתמש
6. לחץ **Delete User**

---

## אופציה 2: דרך SQL Editor (מהיר)

1. כנס ל: https://app.supabase.com
2. בחר את הפרויקט שלך
3. SQL Editor → New Query
4. העתק והדבק את הקוד הבא:

```sql
-- מחיקת כל המשתמשים (זהירות! זה ימחק הכל)
DELETE FROM auth.users;

-- או מחיקת משתמש ספציפי לפי אימייל:
DELETE FROM auth.users WHERE email = 'your-email@example.com';
```

5. לחץ RUN

---

## אופציה 3: השתמש באימייל אחר

פשוט נסה להירשם עם אימייל שונה בפעם הבאה 😊

---

## לאחר מחיקת המשתמשים

1. רענן את הדף: http://localhost:3000
2. לחץ "הרשמה"
3. הזן את הפרטים (אימייל חדש או את זה שמחקת)
4. אמור לעבוד!
