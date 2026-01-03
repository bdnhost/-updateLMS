# מדריך פריסה ל-cPanel Shared Hosting

## כתובת האתר: https://bdnhost.net/lms

האפליקציה מוגדרת לרוץ בנתיב `/lms/` בדומיין `bdnhost.net`.

## תהליך הפריסה המלא

### שלב 1: Build מקומי

```bash
# נווט לתיקיית הפרויקט
cd /home/user/-updateLMS/LMS

# התקנת dependencies (אם עדיין לא הותקנו)
npm install

# הרצת build
npm run build
```

הפקודה `npm run build` יוצרת תיקייה חדשה בשם `dist/` עם כל הקבצים המקומפלים.

**שים לב:** האפליקציה מוגדרת עם `base: '/lms/'` ב-vite.config.js.

---

### שלב 2: העלאה לשרת cPanel

**תיקיית היעד:** `public_html/lms/`

יש לך **שתי אפשרויות** להעלאה:

#### אפשרות 1: דרך File Manager ב-cPanel (מומלץ)

1. היכנס ל-cPanel של `bdnhost.net`
2. פתח את **File Manager**
3. נווט לתיקייה `public_html/`
4. צור תיקייה בשם `lms` (אם היא לא קיימת)
5. היכנס לתיקייה `public_html/lms/`
6. **מחק** את כל הקבצים הקיימים בתיקייה (אם יש)
7. **העלה** את כל התוכן מתוך התיקייה `dist/`:
   - לחץ על "Upload"
   - בחר את כל הקבצים והתיקיות מתוך `LMS/dist/`
   - **חשוב:** העלה את התוכן של dist/, ולא את התיקייה dist/ עצמה
8. ודא שהקובץ `.htaccess` הועלה (הוא מוסתר, ייתכן שתצטרך להציג קבצים מוסתרים)

#### אפשרות 2: דרך FTP

1. התחבר לשרת דרך FTP client (FileZilla, WinSCP, וכו')
2. השתמש בפרטי ההתחברות מ-cPanel
3. נווט ל-`public_html/lms/`
4. מחק את כל הקבצים הקיימים
5. העלה את כל התוכן מתוך `LMS/dist/`

---

### שלב 3: בדיקה

1. גלוש ל-**https://bdnhost.net/lms**
2. בדוק שהעמוד הראשי נטען
3. בדוק ניווט בין עמודים (React Router)
4. פתח את ה-Console ב-DevTools ובדוק שאין שגיאות
5. בדוק שכל התכנים מוצגים כמו שצריך (מבחנים, פרויקטים, חומרי לימוד)

---

## פתרון בעיות נפוצות

### בעיה: "Page not found" / 404 כשמנווטים לעמוד ספציפי

**פתרון:** בדוק שהקובץ `.htaccess` קיים ועובד:
- ודא שהקובץ הועלה לתיקייה הנכונה
- בדוק שהשרת תומך ב-mod_rewrite (רוב שרתי cPanel כן)
- נסה להפעיל rewrite engine דרך cPanel → MultiPHP INI Editor

### בעיה: קבצי CSS/JS לא נטענים

**פתרון:** בדוק את ה-base path:
- אם האתר בתת-תיקייה, עדכן את `base` ב-vite.config.js
- הרץ build מחדש

### בעיה: "Mixed Content" warnings

**פתרון:** ודא ש:
- האתר מוגש דרך HTTPS
- כל הקישורים החיצוניים (API, תמונות) גם ב-HTTPS

### בעיה: שינויים לא מופיעים

**פתרון:**
- נקה cache של הדפדפן (Ctrl+Shift+Delete)
- הרץ build מחדש
- העלה שוב את הקבצים

---

## עדכונים עתידיים

כשאתה עושה שינויים בקוד:

1. ערוך את הקבצים בתיקיית `LMS/src/`
2. הרץ `npm run build`
3. העלה את התוכן המעודכן של `dist/` לשרת
4. נקה cache בדפדפן לראות את השינויים

---

## מידע טכני

### מבנה התיקייה אחרי Build:

```
dist/
├── index.html          # קובץ ה-HTML הראשי
├── .htaccess          # Rewrite rules
├── assets/            # קבצי JS, CSS, תמונות
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── [אחרים...]
```

### דרישות שרת מינימליות:

- Apache 2.x
- mod_rewrite מופעל
- PHP לא נדרש (זה SPA סטטי)
- Node.js לא נדרש על השרת (רק לבניה מקומית)

---

## סיכום התהליך בקצרה:

1. `cd /home/user/-updateLMS/LMS && npm run build`
2. העלה את תוכן `dist/` ל-`public_html/lms/` ב-cPanel
3. ודא ש`.htaccess` קיים בתיקייה
4. גלוש ל-https://bdnhost.net/lms ובדוק שהכל עובד

**זהו! האפליקציה אמורה לרוץ מ-https://bdnhost.net/lms**
