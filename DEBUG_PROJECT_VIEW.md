# 🔍 מדריך ניפוי שגיאות - תצוגת פרויקט בדף הציבורי

## ✅ מה כבר עובד:
הנתונים במערכת **מושלמים**:
- ✅ `type: "project"`
- ✅ `content_data.milestones` - 5 אבני דרך
- ✅ `content_data.guidelines` - הנחיות מלאות
- ⚠️ `category: null` - צריך תיקון

---

## 📋 רשימת בדיקות

### שלב 1: וודא שהכרטיס מתהפך ✋

**הבעיה השכיחה ביותר:** התלמיד לא לחץ על "כניסה למטלה"!

**צעדים:**
1. פתח: https://edu-manage.org/PublicView?type=assignment&id=6942ae578b6cc5827f6df40d
2. **שים לב** - בצד הקדמי אתה רואה רק:
   - כותרת: "פרויקט גמר - הגשה סופית + הצגה"
   - תאריך הגשה
   - ציון מקסימלי
   - כפתור גדול: **"כניסה למטלה"**
3. **לחץ** על הכפתור "כניסה למטלה"
4. הכרטיס אמור להתהפך עם אנימציה
5. **גלול למטה** בצד האחורי
6. חפש קטע בשם: **"אבני דרך לפרויקט"**

**מה אמור להופיע:**
```
🎯 אבני דרך לפרויקט

📍 שלב 1: בחירת נושא ומחקר ראשוני
   10% מהציון
   תאריך יעד: [תאריך]

📍 שלב 2: תכנון ועיצוב מפורט
   20% מהציון
   תאריך יעד: [תאריך]

📍 שלב 3: פיתוח ויישום
   40% מהציון
   תאריך יעד: [תאריך]

📍 שלב 4: שיפורים ומסקנות
   20% מהציון
   תאריך יעד: [תאריך]

📍 שלב 5: הגשה והצגה
   10% מהציון
   תאריך יעד: [תאריך]
```

---

### שלב 2: בדוק שגיאות JavaScript 🐛

אם לחצת על "כניסה למטלה" ועדיין לא רואה כלום:

**פתח קונסול דפדפן:**
1. לחץ `F12` (או `Ctrl+Shift+I` / `Cmd+Option+I` ב-Mac)
2. עבור לטאב **Console**
3. רענן את הדף (`F5`)
4. חפש שגיאות אדומות

**שגיאות שכיחות:**
- `Cannot read property 'milestones' of undefined` → הנתונים לא הגיעו
- `contentData is not defined` → בעיה בהעברת props
- `ProjectSummaryView is not defined` → הקומפוננטה לא נטענה

**צלם מסך של השגיאות ושלח לי!**

---

### שלב 3: בדוק את הנתונים בדפדפן 🔬

**בקונסול, הדבק את הקוד הזה:**
```javascript
// בדוק את הנתונים שהגיעו
const assignment = window.__ASSIGNMENT_DATA__;
console.log('Assignment:', assignment);
console.log('Type:', assignment?.type);
console.log('Content Data:', assignment?.content_data);
console.log('Milestones:', assignment?.content_data?.milestones);
```

**מה אמור להופיע:**
```
Type: "project"
Milestones: Array(5)
  0: {id: "milestone-1", title: "שלב 1: בחירת נושא ומחקר ראשוני", ...}
  1: {id: "milestone-2", ...}
  ...
```

---

### שלב 4: תקן את שדה category 🔧

הקוד עשוי לבדוק גם את `category === 'פרויקט'`.

**הרץ:**
```bash
python fix_category_retry.py
```

**אמור להדפיס:**
```
✅ הקטגוריה עודכנה ל-'פרויקט'
   category: פרויקט
   type: project
```

**אחרי זה:** רענן את הדף הציבורי ונסה שוב.

---

### שלב 5: בדוק את הקוד ב-React DevTools 🛠️

**התקן React DevTools:**
- Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/

**בדוק:**
1. פתח React DevTools (`F12` → טאב `Components`)
2. חפש את `InteractiveAssignmentView`
3. בדוק ב-props:
   - `resource.type` = "project" ✅
   - `resource.content_data` קיים ✅
   - `resource.content_data.milestones` = Array(5) ✅
4. חפש את `ProjectSummaryView`
   - האם הקומפוננטה מוצגת?
   - מה ה-props שהיא מקבלת?

---

## 🚨 בעיות נפוצות ופתרונות

### "אני לחצתי על כניסה למטלה אבל לא קורה כלום"
- **בדוק:** האם יש שגיאות בקונסול?
- **נסה:** רענן את הדף (`Ctrl+F5` - hard refresh)
- **נסה:** דפדפן אחר (Chrome/Firefox)
- **נסה:** מצב incognito (למקרה של cache ישן)

### "הכרטיס מתהפך אבל אין אבני דרך"
- **בדוק:** גלול עד הסוף למטה
- **בדוק:** האם יש חומרים/סרטונים שדוחקים את זה למטה?
- **בדוק:** הקונסול לשגיאות JavaScript

### "יש רק כפתור 'הגש עבודה' אבל לא רואה אבני דרך"
- **זה תקין!** אבני הדרך אמורות להופיע **מעל** כפתור ההגשה
- **גלול למעלה** בתוך הצד האחורי של הכרטיס

---

## 📞 מה לעשות אם כלום לא עובד?

1. **שלח לי:**
   - צילום מסך של הדף (גם צד קדמי וגם אחורי)
   - צילום מסך של הקונסול עם שגיאות
   - פלט של `python debug_assignment.py`

2. **נבדוק:**
   - האם הקוד ב-`InteractiveAssignmentView.jsx` תקין
   - האם יש בעיה ב-`ProjectSummaryView.jsx`
   - האם צריך לעדכן משהו בקומפוננטות

---

## ✨ אם הכל עובד

אתה אמור לראות מסך יפה עם:
- 🎯 כותרת "אבני דרך לפרויקט"
- 📍 5 שלבים עם אחוזי ציון ותאריכים
- 📋 הנחיות מפורטות
- 🎨 עיצוב נקי וקריא

**בהצלחה! 🚀**
