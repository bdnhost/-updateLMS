# 🤖 שירותי AI/LLM במערכת LMS

## 📋 סיכום מהיר

**ספק:** Base44 Platform
**שירות:** `base44.integrations.Core.InvokeLLM`
**ניהול API Keys:** ב-Base44 Platform (לא במקומי)
**צריך הגדרה מקומית:** ❌ לא!

---

## 🏗️ איך זה עובד?

המערכת משתמשת ב-**Base44 SDK** שמספק גישה לשירותי AI מרכזיים:

```javascript
import { base44 } from '@/api/base44Client';

// שימוש ב-LLM
const response = await base44.integrations.Core.InvokeLLM({
    prompt: "שאלה או משימה...",
    response_json_schema: { /* סכמת JSON */ }
});
```

### ארכיטקטורה:

```
[האפליקציה שלך]
       ↓
   Base44 SDK
       ↓
  Base44 Platform  ←→  [OpenAI / Anthropic / ספקים אחרים]
       ↓
   התשובה חזרה
```

**Base44 מנהלים:**
- ✅ API Keys של ספקי ה-LLM
- ✅ Billing וניהול עלויות
- ✅ Rate limiting
- ✅ Caching (אם רלוונטי)

---

## 🎯 איפה משתמשים ב-AI באפליקציה?

### 1. ניתוח חומרי למידה
**קובץ:** `LMS/src/pages/Materials.jsx` (שורה 350)

```javascript
const res = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: schema
});
```

**שימוש:** ניתוח אוטומטי של חומרי לימוד, חילוץ מושגי מפתח

---

### 2. יצירת סילבוס
**קובץ:** `LMS/src/components/courses/SyllabusManager.jsx` (שורה 231)

```javascript
const res = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
        type: "object",
        // סכמה לסילבוס...
    }
});
```

**שימוש:** יצירה אוטומטית של סילבוס קורס בעברית

---

### 3. דוח פערי תוכן
**קובץ:** `LMS/src/components/courses/ContentGapsReport.jsx` (שורה 20)

```javascript
const response = await base44.integrations.Core.InvokeLLM({
    prompt: `אתה מומחה פדגוגי ומעריך איכות תכנים לימודיים...`
});
```

**שימוש:** ניתוח פדגוגי וזיהוי חוסרים בתכנים

---

## 🔐 ניהול API Keys

### איפה ה-API Keys?

**התשובה:** ב-**Base44 Platform Dashboard**

אתה לא צריך להגדיר API keys ב:
- ❌ קבצי `.env`
- ❌ קוד מקומי
- ❌ הגדרות אפליקציה

### איך Base44 מתחברים ל-LLM?

Base44 מנהלים את כל ה-API keys בצד שלהם:

1. **אתה:** רושם לחשבון Base44
2. **Base44:** מגדירים API keys של OpenAI/Anthropic/אחרים
3. **האפליקציה שלך:** פשוט קוראת ל-`InvokeLLM`
4. **Base44:** מעבירים את הבקשה לספק המתאים

---

## 💰 Billing ועלויות

### איך זה עובד?

**Base44 מטפלים בחיוב** - יש להם כנראה:

1. **תוכניות מנוי:**
   - Free Plan: מוגבל / ללא AI
   - Basic Plan: AI standard
   - Premium Plan: AI premium

2. **הגדרות בקוד:**
```javascript
// מתוך planPermissions.jsx
const PLAN_FEATURES = {
  FREE: {
    ai_tools: 'none',
  },
  BASIC: {
    ai_tools: 'standard',
  },
  PREMIUM: {
    ai_tools: 'premium',
  }
};
```

### איך לבדוק את התוכנית שלך?

1. היכנס ל-**Base44 Dashboard:** https://app.base44.com
2. עבור ל-**Settings** → **Billing** או **Plan**
3. תראה את התוכנית הנוכחית והגבלות AI

---

## 🛠️ הגדרה מקומית - אין צורך!

כשאתה רץ מקומית עם `npm run dev`:

### מה שעובד מיידית:
- ✅ InvokeLLM
- ✅ GenerateImage
- ✅ SendEmail
- ✅ UploadFile

**הסיבה:** Base44 SDK מתחבר ל-Platform שלהם עם ה-`appId`:

```javascript
// src/api/base44Client.js
export const base44 = createClient({
  appId: "693824c5c1ad33c1f114ebd2",
  requiresAuth: true
});
```

### אין צורך ב:
- ❌ `.env` עם OPENAI_API_KEY
- ❌ ANTHROPIC_API_KEY
- ❌ כל הגדרת API חיצונית

---

## 🧪 בדיקה מקומית

אם אתה רוצה לבדוק ש-AI עובד:

### 1. הרץ את האפליקציה:
```bash
cd LMS
npm run dev
```

### 2. נווט לדף חומרי לימוד:
```
http://localhost:5173/Materials
```

### 3. נסה להשתמש בפיצ'ר AI:
- יצירת סילבוס אוטומטי
- ניתוח חומר
- דוח פערי תוכן

### 4. פתח Console (F12):
אם יש שגיאה:
```
Failed to invoke LLM: quota exceeded
Failed to invoke LLM: unauthorized
```

זה אומר שיש בעיה בתוכנית ב-Base44.

---

## 🔧 פתרון בעיות

### בעיה: "AI features not available"

**סיבות אפשריות:**
1. **תוכנית חינמית** - AI לא כלול
2. **Quota נגמר** - עברת את מכסת ה-AI החודשית
3. **Base44 issue** - בעיה בצד השרת שלהם

**פתרון:**
- בדוק ב-Base44 Dashboard את התוכנית שלך
- שדרג תוכנית אם צריך
- צור קשר עם Base44 Support: app@base44.com

---

### בעיה: "InvokeLLM returns empty response"

**סיבות:**
- הבקשה גדולה מדי (חרגת מ-context window)
- הפורמט של `response_json_schema` לא תקין

**פתרון:**
```javascript
try {
    const res = await base44.integrations.Core.InvokeLLM({
        prompt: "...",
        response_json_schema: { /* ודא שהסכמה תקינה */ }
    });
    console.log("AI Response:", res);
} catch (error) {
    console.error("AI Error:", error);
}
```

---

## 📊 איזה מודל משתמשים?

**אין לך שליטה ישירה!**

Base44 בוחרים את המודל בהתאם ל:
- התוכנית שלך (Basic/Premium)
- סוג הבקשה
- העלויות והזמינות

**כנראה:**
- Standard: GPT-3.5 / Claude 3 Haiku
- Premium: GPT-4 / Claude 3.5 Sonnet

**אם רוצה שליטה:**
תצטרך לפנות ל-Base44 Support ולשאול אם יש אפשרות לבחור מודל ספציפי.

---

## 🌐 API אלטרנטיבי - אם רוצה שליטה מלאה

אם אתה רוצה להשתמש ב-API Keys שלך (במקום דרך Base44):

### אופציה 1: הוסף קוד custom

יצור קובץ חדש `src/api/customAI.js`:

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // רק לפיתוח!
});

export async function customInvokeLLM(prompt) {
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0].message.content;
}
```

יצור `.env` בשורש LMS:
```
VITE_OPENAI_API_KEY=sk-...
```

**⚠️ אזהרה:**
- לא מומלץ לשים API keys בקוד client-side
- צריך backend server שמטפל בבקשות
- עלויות ישירות על החשבון שלך

---

### אופציה 2: Base44 Functions

צור Function מותאמת ב-Base44 שמשתמשת ב-API Keys שלך:

1. ב-Base44 Dashboard → Functions
2. צור function חדשה:
```javascript
export async function myCustomLLM(params) {
    const { prompt } = params;

    // השתמש ב-API key שלך (מאוחסן בסודות)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }]
        })
    });

    return response.json();
}
```

3. קרא לה מהאפליקציה:
```javascript
const res = await base44.functions.invoke('myCustomLLM', { prompt: '...' });
```

---

## 📞 תמיכה Base44

אם צריך עזרה עם AI features:

**Email:** app@base44.com

**שאלות נפוצות לשאול:**
- מה התוכנית שלי ומה כלול בה?
- כמה בקשות AI יש לי לחודש?
- איזה מודלים נתמכים?
- האם אפשר לבחור מודל ספציפי?
- האם יש API documentation ל-InvokeLLM?

---

## ✨ סיכום

| נושא | תשובה |
|------|--------|
| **ספק AI** | Base44 (מנהל OpenAI/Anthropic) |
| **API Keys** | מנוהל ע"י Base44 Platform |
| **צריך הגדרה מקומית** | ❌ לא |
| **עלויות** | דרך תוכנית Base44 |
| **שליטה במודל** | מוגבל (תלוי בתוכנית) |
| **יצירת קשר** | app@base44.com |

**Bottom line:** פשוט תשתמש ב-`InvokeLLM` וזה עובד מיידית! 🚀
