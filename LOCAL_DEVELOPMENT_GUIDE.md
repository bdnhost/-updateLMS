# 🖥️ הרצת LMS מקומית - מדריך מלא

## ✅ אין צורך במסד נתונים מקומי!

המערכת היא **Base44 App** שמתחברת ישירות ל-Cloud של Base44.

כל הנתונים (קורסים, תלמידים, מטלות) נמצאים ב:
- **API:** https://app.base44.com/api/
- **APP_ID:** 693824c5c1ad33c1f114ebd2
- **Entities:** Assignment, Material, Student, CourseSession וכו'

---

## 📋 דרישות מקדימות

### התקן Node.js

אם עדיין לא מותקן:
1. הורד מ-https://nodejs.org/ (גרסה LTS מומלצת - 20.x)
2. התקן עם ברירות המחדל
3. אמת התקנה:
```bash
node --version
npm --version
```

אמור להדפיס:
```
v20.x.x
10.x.x
```

---

## 🚀 הרצה מקומית - צעד אחר צעד

### שלב 1: נווט לתיקיית LMS

```bash
cd C:\Users\User\Desktop\updateLMS\LMS
```

### שלב 2: התקן תלויות

```bash
npm install
```

זה יוריד ויתקין:
- React 18
- Base44 SDK
- Vite (build tool)
- Tailwind CSS
- Framer Motion
- כל שאר החבילות

**זמן משוער:** 2-5 דקות (בפעם הראשונה)

### שלב 3: הרץ שרת פיתוח

```bash
npm run dev
```

אמור להדפיס משהו כמו:
```
  VITE v6.1.0  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
  ➜  press h + enter to show help
```

### שלב 4: פתח בדפדפן

פתח:
```
http://localhost:5173/
```

🎉 **זהו! האפליקציה רצה מקומית!**

---

## 🔐 Authentication ונתונים

### איך זה עובד?

1. **הקוד מקומי** - רץ ב-http://localhost:5173/
2. **הנתונים בענן** - ה-SDK מתחבר ל-https://app.base44.com/api/
3. **Authentication** - Base44 SDK מטפל בכל ההתחברות

### האם אני עובד על נתוני PRODUCTION?

**כן!** כשאתה רץ מקומית, אתה מתחבר ל-**אותו מסד נתונים** כמו האתר הציבורי.

**⚠️ חשוב:**
- שינויים שתעשה ישפיעו על הנתונים האמיתיים
- תלמידים, מטלות, ציונים - הכל אמיתי
- היזהר עם פעולות מחיקה או עדכון המוני

---

## 🧪 דף הבדיקה - מטלת פרויקט

אחרי שהשרת רץ, פתח:

```
http://localhost:5173/PublicView?type=assignment&id=6942ae578b6cc5827f6df40d
```

לחץ על **"כניסה למטלה"** → גלול למטה → אמור לראות **"אבני דרך לפרויקט"**

---

## 🛠️ פקודות שימושיות

### הרצה רגילה
```bash
npm run dev
```

### Build לפרודקשן
```bash
npm run build
```
יוצר תיקיית `dist/` עם קבצים מאוגדים

### בדיקת lint
```bash
npm run lint
```

### עצור את השרת
לחץ `Ctrl+C` ב-terminal

---

## 📁 מבנה הפרויקט

```
LMS/
├── src/
│   ├── api/
│   │   └── base44Client.js          ← חיבור ל-Base44 SDK
│   ├── components/
│   │   ├── public/
│   │   │   ├── InteractiveAssignmentView.jsx
│   │   │   └── views/
│   │   │       ├── ProjectSummaryView.jsx    ★
│   │   │       └── ProjectView.jsx           ★
│   │   ├── assignments/
│   │   ├── students/
│   │   └── ui/
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── PublicView.jsx
│   │   └── ...
│   └── main.jsx                     ← נקודת כניסה
├── package.json
├── vite.config.js                   ← הגדרות Vite
└── tailwind.config.js               ← הגדרות Tailwind
```

---

## 🔍 בדיקת שינויים בזמן אמת

כששרת הפיתוח רץ:

1. ערוך קובץ, למשל:
```
LMS/src/components/public/views/ProjectSummaryView.jsx
```

2. שמור את הקובץ (`Ctrl+S`)

3. **הדפדפן יתרענן אוטומטית!** (Hot Module Replacement)

4. תראה את השינויים מיד בלי לרענן ידנית

---

## 🐛 פתרון בעיות נפוצות

### בעיה: Port 5173 תפוס

**שגיאה:**
```
Port 5173 is in use, trying another one...
```

**פתרון:**
- זה תקין - Vite ישתמש ב-port אחר (5174, 5175 וכו')
- או סגור תהליכים אחרים שתופסים את הפורט

### בעיה: Module not found

**שגיאה:**
```
Cannot find module '@/components/...'
```

**פתרון:**
```bash
# נקה node_modules
rmdir /s /q node_modules
rmdir /s /q dist

# התקן מחדש
npm install
```

### בעיה: שגיאות ESLint

**שגיאה:**
```
[eslint] warning: ...
```

**זה לא מונע הרצה** - הקוד ירוץ בכל מקרה.

לתיקון:
```bash
npm run lint
```

### בעיה: חיבור ל-API נכשל

**שגיאה בקונסול:**
```
Failed to fetch from Base44 API
```

**פתרון:**
1. בדוק חיבור אינטרנט
2. בדוק שה-API_KEY תקין (אמור להיות בקוד)
3. בדוק שה-APP_ID נכון: `693824c5c1ad33c1f114ebd2`

---

## 💡 טיפים מומלצים

### 1. השתמש ב-React DevTools

התקן תוסף Chrome:
https://chrome.google.com/webstore/detail/react-developer-tools/

זה יעזור לנפות שגיאות ולבדוק state של קומפוננטות.

### 2. פתח Console תמיד

לחץ `F12` → טאב `Console`

תראה:
- שגיאות JavaScript
- הודעות debug
- בקשות API

### 3. עבוד עם Git Branches

```bash
# צור ענף לפיתוח
git checkout -b feature/my-new-feature

# עבוד על השינויים...

# commit ו-push
git add .
git commit -m "הוספתי תכונה חדשה"
git push origin feature/my-new-feature
```

### 4. Hot Reload מהיר יותר

כששומר קובץ, Vite יעדכן רק את הקומפוננטה שהשתנתה (לא את כל האפליקציה).

---

## 📊 סביבות

| סביבה | URL | Deployment |
|-------|-----|------------|
| **Local Dev** | http://localhost:5173/ | `npm run dev` |
| **Production** | https://edu-manage.org/ | FTP upload של `dist/` |

**שתיהן מתחברות לאותו Base44 API!**

---

## 🎯 מה הלאה?

עכשיו שהמערכת רצה מקומית, אתה יכול:

✅ לערוך קומפוננטות ולראות שינויים בזמן אמת
✅ לבדוק תצוגת פרויקטים לפני deployment
✅ לפתח תכונות חדשות
✅ לנפות בעיות בקלות

**כשתסיים לפתח:**
```bash
npm run build
```

ואז העלה את `dist/` לשרת דרך FTP (כמו שדיברנו קודם).

---

## 📞 צריך עזרה?

אם משהו לא עובד:
1. בדוק Console (F12)
2. בדוק Terminal בו רץ `npm run dev`
3. צלם מסך של השגיאות
4. שלח לי

**בהצלחה! 🚀**
