# מדריך ליצירת מדריכים אינטראקטיביים - EduManage

## מבוא

מערכת המדריכים של EduManage מאפשרת יצירת טפסים ושאלונים דינמיים המשתלבים עם כרטיס התלמיד.
כל הגשה נשמרת עם metadata מלא והמורה יכול לצפות בכל התשובות.

---

## סכמת JSON למדריך

```json
{
  "title": "שם המדריך",
  "chapter": "שם הפרק (אופציונלי)",
  "section": "שם המדור (אופציונלי)",
  "task": "שם המטלה (אופציונלי)",
  "introTitle": "כותרת ההקדמה (ברירת מחדל: '🎯 מטרת המדריך')",
  "introduction": "טקסט הקדמה שמסביר את מטרת המדריך",
  "fields": [
    {
      "name": "שם_השדה_באנגלית",
      "label": "תווית השדה בעברית",
      "type": "סוג_השדה",
      "description": "הסבר נוסף על השדה (אופציונלי)",
      "hint": "רמז לתשובה (אופציונלי)",
      "placeholder": "placeholder לשדה (אופציונלי)",
      "required": true/false,
      "defaultValue": "ערך ברירת מחדל (אופציונלי)",
      ...שדות נוספים לפי סוג השדה
    }
  ]
}
```

---

## סוגי שדות נתמכים

### 1. **text / short_answer** - תשובה קצרה
```json
{
  "name": "full_name",
  "label": "שם מלא",
  "type": "text",
  "placeholder": "הכנס את שמך המלא",
  "required": true
}
```

### 2. **textarea / essay / long_answer** - תשובה ארוכה
```json
{
  "name": "essay_question",
  "label": "תאר את החוזקות שלך",
  "type": "textarea",
  "placeholder": "כתוב מספר פסקאות...",
  "required": true
}
```

### 3. **number / numerical** - שדה מספרי
```json
{
  "name": "age",
  "label": "גיל",
  "type": "number",
  "min": 0,
  "max": 120,
  "step": 1,
  "required": true
}
```

### 4. **multiple_choice / radio** - בחירה אחת
```json
{
  "name": "favorite_color",
  "label": "מה הצבע האהוב עליך?",
  "type": "multiple_choice",
  "required": true,
  "options": [
    "אדום",
    "כחול",
    "ירוק",
    "צהוב"
  ]
}
```

או עם ערכים ותוויות נפרדים:
```json
{
  "name": "difficulty_level",
  "label": "רמת הקושי",
  "type": "multiple_choice",
  "options": [
    { "value": "easy", "label": "קל" },
    { "value": "medium", "label": "בינוני" },
    { "value": "hard", "label": "קשה" }
  ]
}
```

### 5. **multiple_answers / checkbox_group** - בחירה מרובה
```json
{
  "name": "interests",
  "label": "תחומי עניין (בחר מספר)",
  "type": "multiple_answers",
  "options": [
    "ספורט",
    "מוזיקה",
    "אמנות",
    "טכנולוגיה",
    "קריאה"
  ]
}
```

### 6. **true_false / boolean** - אמת/שקר
```json
{
  "name": "agree_terms",
  "label": "האם אתה מסכים לתנאי השימוש?",
  "type": "true_false",
  "required": true,
  "trueLabel": "כן, אני מסכים",
  "falseLabel": "לא, איני מסכים"
}
```

### 7. **matching** - התאמה בין עמודות
```json
{
  "name": "match_concepts",
  "label": "התאם בין המושגים להגדרות",
  "type": "matching",
  "pairs": [
    { "left": "HTML" },
    { "left": "CSS" },
    { "left": "JavaScript" }
  ],
  "rightOptions": [
    "שפת עיצוב",
    "שפת תוכן",
    "שפת תכנות"
  ]
}
```

### 8. **ordering / sorting** - סידור פריטים
```json
{
  "name": "sort_steps",
  "label": "סדר את השלבים לפי הסדר הנכון",
  "type": "ordering",
  "items": [
    "אפיית העוגה",
    "ערבוב החומרים",
    "קנייה במכולת",
    "קישוט העוגה"
  ]
}
```

### 9. **file_upload** - העלאת קובץ
```json
{
  "name": "homework_file",
  "label": "העלה את קובץ העבודה",
  "type": "file_upload",
  "accept": ".pdf,.doc,.docx",
  "required": true
}
```

### 10. **fill_blanks** - השלמת חסר
```json
{
  "name": "complete_sentences",
  "label": "השלם את החסר במשפטים",
  "type": "fill_blanks",
  "sentences": [
    { "before": "בירת ישראל היא", "after": "" },
    { "before": "היום הראשון בשבוע הוא", "after": "" }
  ]
}
```

---

## דוגמה מלאה למדריך

```json
{
  "title": "מדריך מקיף",
  "chapter": "פרק 2: למידה מעמיקה",
  "section": "מדור ב: תרגול",
  "task": "מטלה 2: שאלון מקיף",
  "introduction": "במדריך זה תתנסו בכל סוגי השדות...",
  "fields": [
    {
      "name": "student_name",
      "label": "שם מלא",
      "type": "text",
      "required": true
    },
    {
      "name": "learning_style",
      "label": "סגנון למידה",
      "type": "multiple_choice",
      "options": [
        { "value": "visual", "label": "ויזואלי" },
        { "value": "auditory", "label": "שמיעתי" }
      ]
    }
  ]
}
```

---

## איך להטמיע?

```jsx
import DynamicGuideForm from '@/components/guides/DynamicGuideForm';
import guideConfig from './config.json';

export default function MyGuide() {
    return <DynamicGuideForm guideConfig={guideConfig} />;
}
```

---

## צפייה בהגשות

המורה רואה את כל ההגשות בכרטיס התלמיד תחת **"הגשות מדריכים"** עם:
- תאריך ושעה
- נתיב היררכי (מדריך > פרק > מדור > מטלה)
- כל התשובות
- מטא-דאטה

🎓 **EduManage** - ניהול לימודים חכם