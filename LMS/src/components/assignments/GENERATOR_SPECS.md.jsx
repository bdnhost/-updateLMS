# מפרט טכני: גנרטור למטלות חיצוניות (EduManage External Assignment Protocol)

מסמך זה מגדיר את הדרישות הטכניות לפיתוח גנרטור או מערכת חיצונית המייצרת מטלות (HTML/Interactive) המסוגלות להסתנכרן באופן מלא עם מערכת EduManage.

## 1. עקרונות המערכת
המטרה היא לאפשר לתלמיד לבצע מטלה במערכת חיצונית (דף HTML, לומדה, משחק) כאשר:
1. המערכת החיצונית יודעת מי התלמיד ומה המטלה (קבלת פרמטרים).
2. המערכת החיצונית מדווחת בחזרה ל-EduManage על סיום המטלה, הציון והתוצרים (Webhook).
3. חווית המשתמש רציפה (Redirect חזרה).

---

## 2. קבלת נתונים (Input)
כאשר גנרטור מייצר מטלה, עליו להכין את הקוד כך שידע לקרוא את הפרמטרים הבאים משורת הכתובת (Query Parameters) בעת טעינת המטלה:

| פרמטר | תיאור | חובה/רשות |
|-------|-------|-----------|
| `base44StudentId` | מזהה ייחודי של התלמיד במערכת (UUID) | **חובה** |
| `base44AssignmentId` | מזהה ייחודי של המטלה במערכת (UUID) | **חובה** |

### דוגמת קוד (JavaScript) לקריאת הפרמטרים:
```javascript
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        studentId: params.get('base44StudentId'),
        assignmentId: params.get('base44AssignmentId')
    };
}
// יש לשמור ערכים אלו לשימוש בשלב ההגשה
```

---

## 3. דיווח והגשה (Output / Webhook)
בסיום המטלה, המערכת החיצונית צריכה לשלוח טופס (POST Request) לכתובת ה-Webhook של המערכת.

**כתובת ה-Webhook:**
`https://[APP_URL]/functions/externalAssignmentWebhook`
*(יש להחליף את `[APP_URL]` בכתובת המערכת בפועל, למשל `current-app-domain.base44.app`)*

### אופן השליחה
מומלץ להשתמש בטופס HTML רגיל (`<form>`) שמוגש (Submit) לדפדפן, כדי שהתלמיד יראה את דף האישור של המערכת, או לבצע `fetch` ואז לבצע הפניה (Redirect) ידנית.

### פרמטרים ב-Body (multipart/form-data או x-www-form-urlencoded):

| שדה | סוג | תיאור | חובה? |
|-----|-----|-------|-------|
| `base44StudentId` | String | המזהה שהתקבל בכניסה | **כן** |
| `base44AssignmentId` | String | המזהה שהתקבל בכניסה | **כן** |
| `submission_content` | JSON String | ראה פירוט מבנה JSON למטה | מומלץ |
| `file_url` | String | קישור לקובץ תוצר (אם יש) | לא |

### מבנה JSON עבור `submission_content`:
```json
{
  "meta": {
    "score": 95,            // ציון סופי (0-100)
    "timeSpent": 180,       // זמן ביצוע בשניות (אופציונלי)
    "completionDate": "..." // תאריך סיום (אופציונלי)
  },
  "answers": {              // פירוט תשובות (אופציונלי)
    "q1": "Answer A",
    "q2": true,
    "freeText": "הסבר מפורט..."
  }
}
```

---

## 4. דוגמת מימוש מלאה (HTML Template)
להלן תבנית HTML בסיסית שגנרטור צריך לייצר:

```html
<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>מטלה חיצונית</title>
    <script>
        // 1. שמירת הפרמטרים בעת הטעינה
        window.onload = function() {
            const params = new URLSearchParams(window.location.search);
            document.getElementById('studentIdInput').value = params.get('base44StudentId') || '';
            document.getElementById('assignmentIdInput').value = params.get('base44AssignmentId') || '';
            
            if(!params.get('base44StudentId')) {
                alert('שגיאה: לא התקבל מזהה תלמיד. המטלה לא תסונכרן.');
            }
        };

        // 2. פונקציית סיום (למשל בלחיצת כפתור)
        function finishAssignment(score, answers) {
            const content = {
                meta: { score: score },
                answers: answers
            };
            
            document.getElementById('contentInput').value = JSON.stringify(content);
            
            // שליחת הטופס
            document.getElementById('submissionForm').submit();
        }
    </script>
</head>
<body>
    <h1>המטלה שלי</h1>
    <!-- תוכן המטלה כאן -->
    <button onclick="finishAssignment(100, {q1: 'test'})">סיים והגש</button>

    <!-- טופס נסתר להגשה -->
    <form id="submissionForm" action="https://YOUR-APP-URL/functions/externalAssignmentWebhook" method="POST" style="display:none;">
        <input type="hidden" name="base44StudentId" id="studentIdInput">
        <input type="hidden" name="base44AssignmentId" id="assignmentIdInput">
        <input type="hidden" name="submission_content" id="contentInput">
        <!-- אופציונלי: <input type="hidden" name="file_url" value="..."> -->
    </form>
</body>
</html>
```

## 5. סיכום והמלצות לגנרטור
1. **Dynamic URL**: ודא שהגנרטור יודע להזריק את כתובת ה-Webhook הנכונה של הסביבה (`origin`) לתוך ה-`action` של הטופס, או להשתמש בכתובת יחסית אם המטלה מתארחת באותו דומיין (פחות סביר).
2. **Validation**: בדוק שיש `studentId` לפני שאתה מאפשר לתלמיד להתחיל, כדי למנוע מצב של ביצוע מטלה ללא יכולת הגשה.
3. **Feedback**: בסיום ההגשה, ה-Webhook יחזיר דף HTML המאשר את הקליטה.