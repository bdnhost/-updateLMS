# מדריך טכני: שליחת נתוני טפסים מדפי HTML חיצוניים

## מטרה
מדריך זה מיועד ליוצרי תוכן שבונים מדריכי למידה אינטראקטיביים ב-HTML ורוצים לשלוח את נתוני המשתמש למערכת EduManage.

---

## מה צריך?

### 1. טופס HTML עם השדות שלך
בנה כל טופס שתרצה - **הקוד שלנו אוסף הכל אוטומטית**.

### 2. קוד JavaScript פשוט
העתק את הקוד למטה והוא ישלח את כל הנתונים.

---

## הקוד להעתקה

**הוסף לפני `</body>`:**

```javascript
<script>
// החלף YOUR_APP_URL בכתובת שלך
const API = 'https://YOUR_APP_URL.base44.app/api/functions/submitGuideForm';

document.getElementById('yourFormId').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // איסוף אוטומטי של כל השדות
    const formData = new FormData(e.target);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        if (key === 'student_id') continue;
        
        if (data[key]) {
            if (!Array.isArray(data[key])) data[key] = [data[key]];
            data[key].push(value);
        } else {
            data[key] = value;
        }
    }

    // שליחה
    const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            student_id: formData.get('student_id'),
            guide_name: 'שם המדריך שלך',
            page_url: window.location.href,
            form_data: data
        })
    });

    const result = await res.json();
    
    if (result.success) {
        alert('✅ הטופס נשלח!');
    } else {
        alert('❌ שגיאה: ' + result.error);
    }
});
</script>
```

---

## דרישות מינימליות

1. ✅ שדה `student_id` בטופס: `<input name="student_id" required>`
2. ✅ מזהה לטופס: `<form id="yourFormId">`
3. ✅ כל שדה עם `name` attribute

**זהו!** הקוד אוסף ושולח הכל אוטומטית.

---

## מה נשלח?

```json
{
  "student_id": "abc123",
  "guide_name": "שם הדף",
  "page_url": "https://...",
  "form_data": {
    "field1": "value1",
    "field2": ["option1", "option2"]
  }
}
```

---

## טיפים

### Checkboxes (בחירה מרובה)
```html
<input type="checkbox" name="interests" value="coding">
<input type="checkbox" name="interests" value="design">
```
יתקבל: `interests: ["coding", "design"]`

### מילוי אוטומטי מה-URL
שלח: `guide.html?student_id=abc123`

```javascript
const params = new URLSearchParams(window.location.search);
const id = params.get('student_id');
if (id) document.getElementById('student_id').value = id;
```

### File Upload
1. העלה ל-`/api/integrations/Core/UploadFile`
2. קבל `file_url`
3. שלח את ה-URL בטופס

---

**זה הכל! 🎓**