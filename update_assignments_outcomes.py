import requests
import json

API_KEY = 'c0ce546b5661436dacb7a2060b10c9a5'
APP_ID = '693824c5c1ad33c1f114ebd2'

def make_api_request(api_path, method='GET', data=None):
    url = f'https://app.base44.com/api/{api_path}'
    headers = {
        'api_key': API_KEY,
        'Content-Type': 'application/json'
    }
    if method.upper() == 'GET':
        response = requests.request(method, url, headers=headers, params=data)
    else:
        response = requests.request(method, url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()

course_id = "69414e2be636c8c8c38af82d"

print("=" * 100)
print("📋 עדכון מטלות (Assignments) לפי מטרות קורס")
print("=" * 100)

# Fetch all assignments for the course
print("\nשלב 1: בדיקת מטלות קיימות...")
try:
    assignments_response = make_api_request('apps/693824c5c1ad33c1f114ebd2/entities/Assignment')
    all_assignments = assignments_response.get('result', [])
    course_assignments = [a for a in all_assignments if a.get('course_id') == course_id]
    print(f"✅ נמצאו {len(course_assignments)} מטלות בקורס")
except Exception as e:
    print(f"❌ שגיאה בטעינת מטלות: {e}")
    course_assignments = []

# Define competencies and outcome mappings
learning_outcomes = {
    "outcome_1": {
        "title": "שימוש בכלי AI מובילים",
        "description": "יכולת שימוש בכלים כמו ChatGPT, Claude, Gemini בעבודה יומיומית",
        "competencies": ["Use AI tools", "ChatGPT", "Claude", "Gemini", "Prompt Engineering"]
    },
    "outcome_2": {
        "title": "בנייה אפליקציות פשוטות עם AI",
        "description": "בנייה של פרויקטים Python עם שילוב API של AI",
        "competencies": ["Python Programming", "API Integration", "Simple Applications"]
    },
    "outcome_3": {
        "title": "אוטומציה איסוף מידע מהאינטרנט",
        "description": "Web scraping וקבלת מידע באופן אוטומטי",
        "competencies": ["Web Scraping", "Data Collection", "BeautifulSoup", "Requests"]
    },
    "outcome_4": {
        "title": "עבודה עם מסמכים ונתונים",
        "description": "עיבוד נתונים עם pandas, עבודה עם נתוני ייצור",
        "competencies": ["Data Processing", "Pandas", "Data Analysis", "CSV/Excel"]
    },
    "outcome_5": {
        "title": "יצירת תוכן עם AI",
        "description": "שימוש בכלים לייצור טקסט, תמונות ותוכן חזותי",
        "competencies": ["Generative AI", "Image Generation", "Text Generation", "DALL-E"]
    },
    "outcome_6": {
        "title": "הבנת יכולות והגבלות AI",
        "description": "הבנה ביקורתית של מה AI יכול ולא יכול לעשות",
        "competencies": ["AI Limitations", "AI Ethics", "Critical Thinking", "Risk Assessment"]
    },
    "outcome_7": {
        "title": "שילוב AI בעבודה הנדסית",
        "description": "יישום AI בתחזוקה, אבחון, ניטור וייצור",
        "competencies": ["Predictive Maintenance", "Monitoring Systems", "Process Optimization"]
    },
    "outcome_8": {
        "title": "בנייה פרויקט מעשי",
        "description": "יצירה של פרויקט שלם המשתמש ב-AI וקשור להנדסה",
        "competencies": ["Project Management", "Full Stack", "Integration", "Documentation"]
    }
}

# Outcome-to-Assignment mapping
assignment_updates = {
    # ==================== שלב 1: מבוא ו-Prompt Engineering ====================
    "69414e307ad0c6c8c9b78f51": {
        "title": "תרגיל 1: הכרות עם ChatGPT",
        "description": "<h3>מטרה: הכרות עם ChatGPT ו-Prompt Engineering בסיסי</h3><p><strong>מטרת קורס:</strong> שימוש בכלי AI מובילים</p><p><strong>משימות:</strong></p><ol><li>הרשמה ל-ChatGPT (או שימוש בחינם)</li><li>כתיבת 3 פרומפטים שונים לבעיה הנדסית</li><li>השוואת תוצאות ושיפור הפרומפט</li><li>דוכומנטציה של התהליך</li></ol>",
        "weight": 5,
        "max_score": 10,
        "related_competencies": ["Use AI tools", "ChatGPT", "Prompt Engineering"]
    },
    "69414e30eb899ca912353c2b": {
        "title": "תרגיל 2: Prompt Engineering לבעיות הנדסיות",
        "description": "<h3>מטרה: שיתוף Prompt Engineering מתקדם עם בעיות בהנדסה</h3><p><strong>מטרת קורס:</strong> שימוש בכלי AI מובילים + בנייה אפליקציות פשוטות</p><p><strong>משימות:</strong></p><ol><li>תכנון שלבי לפתרון בעיה הנדסית עם AI</li><li>כתיבת פרומפטים מתחכמים</li><li>בדיקת תשובות AI ויישומן</li><li>הצעת שיפורים</li></ol>",
        "weight": 10,
        "max_score": 20,
        "related_competencies": ["Prompt Engineering", "Use AI tools", "Python Programming", "Critical Thinking"]
    },

    # ==================== שלב 2: Python יסודות ====================
    "69414e307700d0bddc6ccfe5": {
        "title": "תרגיל 3: Python Basics - משתנים ולולאות",
        "description": "<h3>מטרה: שליטה בעקרונות Python בסיסיים</h3><p><strong>מטרת קורס:</strong> בנייה אפליקציות עם Python</p><p><strong>משימות:</strong></p><ol><li>כתיבת סקריפט Python עם משתנים ודוגמאות</li><li>שימוש בלולאות (for, while)</li><li>עבודה עם lists ודיקשונרים</li><li>הצעת דוגמה הנדסית</li></ol>",
        "weight": 5,
        "max_score": 15,
        "related_competencies": ["Python Programming", "Simple Applications"]
    },
    "69414e307be6b8b35bdcc38e": {
        "title": "תרגיל 4: Python - פונקציות וספריות",
        "description": "<h3>מטרה: כתיבת קוד Python מודולארי</h3><p><strong>מטרת קורס:</strong> בנייה אפליקציות עם Python</p><p><strong>משימות:</strong></p><ol><li>כתיבת פונקציות שמטבעות תוכן</li><li>שימוש בספריות בסיסיות (math, random, datetime)</li><li>יצירת מודול עם מספר פונקציות</li><li>בדיקה וטיוב הקוד</li></ol>",
        "weight": 5,
        "max_score": 15,
        "related_competencies": ["Python Programming", "Simple Applications"]
    },

    # ==================== שלב 3: ניתוח נתונים ====================
    "69414e30889a9acbb04d0eb8": {
        "title": "תרגיל 5: עבודה עם Pandas וקבצי CSV",
        "description": "<h3>מטרה: טעינה וניתוח נתונים בסיסי</h3><p><strong>מטרת קורס:</strong> עבודה עם מסמכים ונתונים</p><p><strong>משימות:</strong></p><ol><li>טעינת קובץ CSV בעזרת Pandas</li><li>ניתוח סטטיסטי בסיסי (mean, std, sum)</li><li>סינון וחיפוש בנתונים</li><li>יצירת גרף בסיסי</li></ol>",
        "weight": 5,
        "max_score": 15,
        "related_competencies": ["Data Processing", "Pandas", "Data Analysis"]
    },
    "69414e3088f5b34ab1f4c1c7": {
        "title": "תרגיל 6: ניתוח נתוני ייצור",
        "description": "<h3>מטרה: ניתוח נתוני תביעה בעולם הנדסי</h3><p><strong>מטרת קורס:</strong> עבודה עם נתונים + שילוב AI בעבודה הנדסית</p><p><strong>משימות:</strong></p><ol><li>טעינת נתוני ייצור תיקוניים</li><li>חישוב מדדי OEE (Overall Equipment Effectiveness)</li><li>זיהוי תקלות ותבניות</li><li>הצעת תחזוקה מונעת לפי הנתונים</li></ol>",
        "weight": 10,
        "max_score": 20,
        "related_competencies": ["Data Analysis", "Predictive Maintenance", "Process Optimization"]
    },

    # ==================== שלב 4: Web Scraping ====================
    "69414e3080af2f2cdfb8f88a": {
        "title": "תרגיל 7: Web Scraping בסיסי",
        "description": "<h3>מטרה: אוטומציה איסוף נתונים מהאינטרנט</h3><p><strong>מטרת קורס:</strong> אוטומציה איסוף מידע</p><p><strong>משימות:</strong></p><ol><li>כתיבת סקריפט עם Requests</li><li>שימוש ב-BeautifulSoup לניתוח HTML</li><li>אוטומציה איסוף נתונים מאתר</li><li>שמירה בקובץ CSV</li></ol>",
        "weight": 5,
        "max_score": 15,
        "related_competencies": ["Web Scraping", "Data Collection", "BeautifulSoup", "Requests"]
    },

    # ==================== שלב 5: יצירת תוכן ====================
    "69414e30812c289c6fe8f88e": {
        "title": "בוחן 1: יצירת תוכן עם DALL-E ו-AI",
        "description": "<h3>מטרה: שימוש בכלי יצירת תוכן (AI image generation)</h3><p><strong>מטרת קורס:</strong> יצירת תוכן עם AI</p><p><strong>משימות:</strong></p><ol><li>הרשמה ל-DALL-E או Midjourney</li><li>יצירת תמונה בעזרת טקסט תיאור</li><li>יצירת 3 תמונות בנושא הנדסה</li><li>תאור התהליך ותוצאות</li></ol>",
        "weight": 5,
        "max_score": 10,
        "related_competencies": ["Generative AI", "Image Generation", "Creative Thinking"]
    },

    # ==================== שלב 6: מערכת ניטור ====================
    "69414e30834195481e4c0e58": {
        "title": "פרויקט 1: מערכת ניטור חכמה - תכנון",
        "description": "<h3>מטרה: תכנון מערכת ניטור תעשייתית</h3><p><strong>מטרות קורס:</strong> בנייה אפליקציות + שילוב AI בעבודה הנדסית</p><p><strong>משימות:</strong></p><ol><li>הגדרת דרישות המערכת</li><li>בחירת טכנולוגיות (Python, ספריות)</li><li>עיצוב ארכיטקטורה</li><li>יצירת תוכנית מימוש</li></ol>",
        "weight": 10,
        "max_score": 25,
        "related_competencies": ["Project Management", "Full Stack", "Python Programming", "Monitoring Systems"]
    },
    "69414e308388f0d95cc7bb22": {
        "title": "פרויקט 1: מערכת ניטור חכמה - מימוש",
        "description": "<h3>מטרה: מימוש מערכת ניטור עם Python ו-AI</h3><p><strong>מטרות קורס:</strong> בנייה אפליקציות + שילוב AI בעבודה הנדסית</p><p><strong>משימות:</strong></p><ol><li>כתיבת קוד Python לאוסף נתונים</li><li>עיבוד נתונים עם Pandas</li><li>שילוב עם AI לתחזוקה מונעת</li><li>בדיקות וטיוב</li><li>דוקומנטציה</li></ol>",
        "weight": 15,
        "max_score": 30,
        "related_competencies": ["Full Stack", "Python Programming", "Data Processing", "Integration", "Documentation"]
    },

    # ==================== שלב 7: Chatbot ====================
    "69414e308447be35c4c801d1": {
        "title": "פרויקט 2: Chatbot לתמיכה טכנית",
        "description": "<h3>מטרה: בנייה chatbot עם OpenAI API</h3><p><strong>מטרות קורס:</strong> בנייה אפליקציות + שימוש בכלי AI</p><p><strong>משימות:</strong></p><ol><li>הרשמה ל-OpenAI API</li><li>כתיבת סקריפט שמשתמש ב-GPT</li><li>עיצוב פרומפט עבור chatbot</li><li>בדיקה וטיוב</li><li>הוספת features נוספות</li></ol>",
        "weight": 15,
        "max_score": 30,
        "related_competencies": ["Simple Applications", "API Integration", "Prompt Engineering", "Full Stack"]
    },

    # ==================== שלב 8: הבנת מגבלות AI ====================
    "69414e3084fbb5c85a74bca7": {
        "title": "בוחן 2: יכולות והגבלות של AI",
        "description": "<h3>מטרה: הבנה ביקורתית של AI</h3><p><strong>מטרת קורס:</strong> הבנת יכולות והגבלות AI</p><p><strong>משימות:</strong></p><ol><li>תאור 5 יכולות עיקריות של AI</li><li>תאור 5 מגבלות של AI</li><li>דיון על אתיקה וסיכונים</li><li>התייחסות לשימוש בהנדסה</li></ol>",
        "weight": 5,
        "max_score": 10,
        "related_competencies": ["AI Limitations", "AI Ethics", "Critical Thinking", "Risk Assessment"]
    },

    # ==================== שלב 9: הצגה ====================
    "69414e3085153be831e6a67b": {
        "title": "הצגת פרויקט סופי",
        "description": "<h3>מטרה: הצגה של פרויקט מעשי שלם</h3><p><strong>מטרות קורס:</strong> בנייה פרויקט מעשי + כל היתר</p><p><strong>משימות:</strong></p><ol><li>הצגת פרויקט בחזיתה</li><li>הסבר טכני מלא</li><li>הדגמה של הפרויקט בעבודה</li><li>דיון על יישומים עתידיים</li><li>מענה לשאלות</li></ol>",
        "weight": 20,
        "max_score": 30,
        "related_competencies": ["Project Management", "Full Stack", "Integration", "Documentation"]
    }
}

# Update assignments
print("\nשלב 2: עדכון מטלות...")
updated_count = 0
failed_count = 0

for assignment_id, update_data in assignment_updates.items():
    try:
        response = make_api_request(
            f'apps/{APP_ID}/entities/Assignment/{assignment_id}',
            method='PUT',
            data=update_data
        )
        updated_count += 1
        print(f"✅ {update_data['title'][:40]}...")
    except Exception as e:
        failed_count += 1
        print(f"❌ שגיאה ב-{assignment_id}: {str(e)[:50]}")

print("\n" + "=" * 100)
print(f"✅ סיום עדכון מטלות!")
print("=" * 100)
print(f"\n📊 תוצאות:")
print(f"   ✅ עודכנו: {updated_count} מטלות")
print(f"   ❌ נכשלו: {failed_count}")
print(f"   📋 סה״כ: {len(assignment_updates)} מטלות עובדות")
print(f"\n🎯 כל מטלה קשורה כעת לאחת מה-{len(learning_outcomes)} מטרות הקורס")
