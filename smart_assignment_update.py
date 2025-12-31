import requests
import json
import time

API_KEY = 'c0ce546b5661436dacb7a2060b10c9a5'
APP_ID = '693824c5c1ad33c1f114ebd2'
course_id = '69414e2be636c8c8c38af82d'

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

print("=" * 100)
print("📋 עדכון מטלות (Assignments) עם יישור למטרות")
print("=" * 100)

# Assignment updates - organized by category
updates_by_category = {
    "intro_ai": {
        "assignments": [
            {
                "id": "69414e2c8702d6c582aa5422",  # תרגול בכיתה: היכרות עם ChatGPT
                "title": "תרגול בכיתה: היכרות עם ChatGPT וכלי AI",
                "description": "<h3>מטרה: הכרות עם ChatGPT וכלי AI מובילים</h3><p><strong>מטרת קורס:</strong> שימוש בכלי AI מובילים</p><p><strong>משימות:</strong></p><ol><li>הרשמה/כניסה ל-ChatGPT</li><li>כתיבת שלוש שאלות שונות</li><li>השוואת תוצאות מ-ChatGPT ל-Claude</li><li>תאור התהליך והתוצאות</li></ol>",
                "weight": 5,
                "max_score": 10
            },
            {
                "id": "69414e2dca46bee8e4a7041b",  # בוחן מפגש 2: Prompt Engineering
                "title": "בוחן: Prompt Engineering בסיסי",
                "description": "<h3>בוחן על Prompt Engineering וכתיבת הנחיות יעילות</h3><p><strong>מטרת קורס:</strong> שימוש בכלי AI מובילים</p><p><strong>תוכן בוחן:</strong></p><ol><li>הגדרת Prompt Engineering</li><li>כתיבת הנחיה יעילה לבעיה הנדסית</li><li>שיפור תוצאות דרך עידון הנחיות</li></ol>",
                "weight": 5,
                "max_score": 10
            },
            {
                "id": "69414e2dbf32c5df194d2b9e",  # שיעורי בית: בנק פרומפטים אישי
                "title": "שיעורי בית: בנק פרומפטים אישי",
                "description": "<h3>יצירת בנק פרומפטים עבור בעיות הנדסיות</h3><p><strong>מטרת קורס:</strong> שימוש בכלי AI מובילים</p><p><strong>משימות:</strong></p><ol><li>בחירת 5 בעיות הנדסיות</li><li>כתיבת פרומפט יעיל לכל בעיה</li><li>בדיקה וטיוב כל פרומפט</li><li>שמירה בקובץ עם דוקומנטציה</li></ol>",
                "weight": 10,
                "max_score": 20
            }
        ]
    },
    
    "python_basics": {
        "assignments": [
            {
                "id": "69414e2d5954bae78fd16299",  # בוחן מפגש 3: יסודות Python
                "title": "בוחן: יסודות Python",
                "description": "<h3>בוחן על עקרונות Python בסיסיים</h3><p><strong>מטרת קורס:</strong> בנייה אפליקציות עם Python</p><p><strong>תוכן בוחן:</strong></p><ol><li>משתנים ודוגמאות</li><li>לולאות (for, while)</li><li>טעויות נפוצות בלולאות</li><li>פונקציות בסיסיות</li></ol>",
                "weight": 5,
                "max_score": 10
            },
            {
                "id": "69414e2d5481295f3723d0cb",  # תרגול בכיתה: מחשבון הנדסי
                "title": "תרגול בכיתה: מחשבון הנדסי עם Python",
                "description": "<h3>כתיבת מחשבון הנדסי בעזרת Python</h3><p><strong>מטרת קורס:</strong> בנייה אפליקציות עם Python</p><p><strong>משימות:</strong></p><ol><li>כתיבת פונקציות לחישובים הנדסיים</li><li>חישובי מומנט, כוח ועבודה</li><li>בדיקות בסיסיות לקוד</li><li>הצגה של הקוד בכיתה</li></ol>",
                "weight": 5,
                "max_score": 15
            },
            {
                "id": "69414e2d6d64028218b1d452",  # שיעורי בית: מחשבון OEE
                "title": "שיעורי בית: מחשבון OEE בעזרת Python",
                "description": "<h3>יצירת מחשבון OEE (יעילות ציוד כוללת)</h3><p><strong>מטרת קורס:</strong> בנייה אפליקציות עם Python + עבודה עם נתונים</p><p><strong>משימות:</strong></p><ol><li>הבנת נוסחת OEE</li><li>כתיבת פונקציות לחישוב OEE</li><li>קבלת נתונים מקובץ CSV</li><li>פלט תוצאות עם דוח</li></ol>",
                "weight": 10,
                "max_score": 20
            }
        ]
    },
    
    "data_analysis": {
        "assignments": [
            {
                "id": "69414e2d0fb0b15ddcf12cd0",  # בוחן מפגש 4: Pandas וניתוח נתונים
                "title": "בוחן: Pandas וניתוח נתונים",
                "description": "<h3>בוחן על עבודה עם Pandas</h3><p><strong>מטרת קורס:</strong> עבודה עם מסמכים ונתונים</p><p><strong>תוכן בוחן:</strong></p><ol><li>טעינת נתונים ב-Pandas</li><li>סינון וחיפוש</li><li>חישובים סטטיסטיים</li><li>וויזואליזציה בסיסית</li></ol>",
                "weight": 5,
                "max_score": 10
            },
            {
                "id": "69414e2ee86391f37fe09c01",  # תרגול בכיתה: ניתוח נתוני ייצור
                "title": "תרגול בכיתה: ניתוח נתוני ייצור",
                "description": "<h3>ניתוח נתוני ייצור בעזרת Pandas</h3><p><strong>מטרת קורס:</strong> עבודה עם מסמכים ונתונים</p><p><strong>משימות:</strong></p><ol><li>טעינת נתוני ייצור</li><li>חישוב סטטיסטיקה בסיסית</li><li>זיהוי חריגות</li><li>יצירת דוח ניתוח</li></ol>",
                "weight": 5,
                "max_score": 15
            },
            {
                "id": "69414e2e9e084e06df769232",  # שיעורי בית: דוח OEE אוטומטי
                "title": "שיעורי בית: דוח OEE אוטומטי עם Pandas",
                "description": "<h3>יצירת דוח OEE אוטומטי מנתונים בקובץ</h3><p><strong>מטרת קורס:</strong> עבודה עם מסמכים ונתונים + בנייה אפליקציות</p><p><strong>משימות:</strong></p><ol><li>טעינת נתוני ייצור</li><li>חישוב OEE עבור כל תקופה</li><li>יצירת גרפים של OEE</li><li>יצוא דוח ל-CSV או PDF</li></ol>",
                "weight": 10,
                "max_score": 20
            }
        ]
    },
    
    "api_integration": {
        "assignments": [
            {
                "id": "69414e2e11647469b8858d9a",  # בוחן מפגש 5: OpenAI API
                "title": "בוחן: OpenAI API וקישור ל-AI",
                "description": "<h3>בוחן על שימוש ב-OpenAI API</h3><p><strong>מטרת קורס:</strong> בנייה אפליקציות עם AI</p><p><strong>תוכן בוחן:</strong></p><ol><li>הרשמה ל-OpenAI וקבלת API Key</li><li>קריאה ראשונה ל-API</li><li>עיצוב בקשות ל-GPT</li><li>טיפול בתשובות</li></ol>",
                "weight": 5,
                "max_score": 10
            },
            {
                "id": "69414e2e4e55179b0c0a147a",  # תרגול בכיתה: שליחת בקשות ל-API
                "title": "תרגול בכיתה: שליחת בקשות ל-OpenAI API",
                "description": "<h3>עבודה מעשית עם OpenAI API</h3><p><strong>מטרת קורס:</strong> בנייה אפליקציות עם AI</p><p><strong>משימות:</strong></p><ol><li>התחברות ל-OpenAI API</li><li>שליחת בקשות שונות</li><li>עיבוד תשובות</li><li>שמירת נתונים</li></ol>",
                "weight": 5,
                "max_score": 15
            }
        ]
    },
    
    "monitoring_systems": {
        "assignments": [
            {
                "id": "69414e2eac7de303344f223e",  # בוחן מפגש 6: מערכות ניטור
                "title": "בוחן: מערכות ניטור חכמה",
                "description": "<h3>בוחן על עקרונות מערכות ניטור</h3><p><strong>מטרת קורס:</strong> שילוב AI בעבודה הנדסית</p><p><strong>תוכן בוחן:</strong></p><ol><li>ארכיטקטורה של מערכת ניטור</li><li>אוסף נתונים (Sensors)</li><li>עיבוד והתראות</li><li>שילוב עם AI</li></ol>",
                "weight": 5,
                "max_score": 10
            },
            {
                "id": "69414e2f3b729f24f11b1489",  # תרגול בכיתה: סימולטור חיישנים
                "title": "תרגול בכיתה: סימולטור חיישנים",
                "description": "<h3>בנייה סימולטור לנתונים של חיישנים</h3><p><strong>מטרת קורס:</strong> בנייה אפליקציות עם Python</p><p><strong>משימות:</strong></p><ol><li>כתיבת סימולטור נתונים</li><li>יצירת נתונים דומים לנתוני ייצור</li><li>שמירה בקובץ CSV</li><li>בדיקת הנתונים</li></ol>",
                "weight": 5,
                "max_score": 15
            },
            {
                "id": "69414e2f892480c1aa2002c8",  # שיעורי בית: זיהוי חריגות
                "title": "שיעורי בית: זיהוי חריגות (Anomaly Detection)",
                "description": "<h3>בנייה אלגוריתם לזיהוי חריגות בנתונים</h3><p><strong>מטרת קורס:</strong> עבודה עם נתונים + בנייה אפליקציות</p><p><strong>משימות:</strong></p><ol><li>הבנה של חריגות בנתוני ייצור</li><li>כתיבת אלגוריתם לזיהוי</li><li>בדיקה על נתונים שונים</li><li>הצעת דיווח על חריגות</li></ol>",
                "weight": 10,
                "max_score": 20
            }
        ]
    },
    
    "predictive_maintenance": {
        "assignments": [
            {
                "id": "69414e2fba2b03400a97cc88",  # בוחן מפגש 8: תחזוקה מונעת
                "title": "בוחן: תחזוקה מונעת מבוססת AI",
                "description": "<h3>בוחן על תחזוקה מונעת ודוגמאות</h3><p><strong>מטרת קורס:</strong> שילוב AI בעבודה הנדסית</p><p><strong>תוכן בוחן:</strong></p><ol><li>הגדרת תחזוקה מונעת</li><li>מודלים של חיזוי תקלות</li><li>יישום בעולם בעיות הנדסיות</li><li>יתרונות וחסרונות</li></ol>",
                "weight": 5,
                "max_score": 10
            },
            {
                "id": "69414e2f3ee762a6a5f26703",  # תרגול בכיתה: טרמינל+ הכרות עם Python
                "title": "תרגול בכיתה: Terminal וביצוע סקריפטים Python",
                "description": "<h3>עבודה עם Terminal וביצוע Python scripts</h3><p><strong>מטרת קורס:</strong> בנייה אפליקציות עם Python</p><p><strong>משימות:</strong></p><ol><li>שימוש בTerminal/PowerShell</li><li>ניווט בתיקיות</li><li>הרצת Python scripts</li><li>טיוב שגיאות</li></ol>",
                "weight": 5,
                "max_score": 15
            },
            {
                "id": "69414e2f86e3de310ffdacc0",  # תרגול בכיתה: מודל חיזוי תקלות
                "title": "תרגול בכיתה: מודל חיזוי תקלות",
                "description": "<h3>בנייה מודל פשוט לחיזוי תקלות</h3><p><strong>מטרת קורס:</strong> בנייה אפליקציות + עבודה עם נתונים</p><p><strong>משימות:</strong></p><ol><li>טעינת נתונים היסטוריים</li><li>בחירת features</li><li>בנייה מודל פשוט</li><li>בדיקת דיוק החיזוי</li></ol>",
                "weight": 5,
                "max_score": 15
            },
            {
                "id": "69414e2f5ddaa8bd7f7157f0",  # שיעורי בית: מערכת התראות
                "title": "שיעורי בית: מערכת התראות אוטומטית",
                "description": "<h3>בנייה מערכת התראות לתקלות צפויות</h3><p><strong>מטרת קורס:</strong> בנייה אפליקציות + שילוב AI</p><p><strong>משימות:</strong></p><ol><li>בנייה מודל חיזוי</li><li>יצירת התראות לפי סף</li><li>דוח התראות</li><li>בדיקה של המערכת</li></ol>",
                "weight": 10,
                "max_score": 20
            }
        ]
    },
    
    "dashboard_chatbot": {
        "assignments": [
            {
                "id": "69414e30c50be93f69425301",  # בוחן מפגש 9: Chatbots
                "title": "בוחן: Chatbots וAI תמיכה",
                "description": "<h3>בוחן על Chatbots ותמיכה אוטומטית</h3><p><strong>מטרת קורס:</strong> בנייה אפליקציות עם AI</p><p><strong>תוכן בוחן:</strong></p><ol><li>עקרונות Chatbot</li><li>שימוש ב-OpenAI API</li><li>עיצוב שיחה</li><li>שליחה לאינטרנט</li></ol>",
                "weight": 5,
                "max_score": 10
            },
            {
                "id": "69414e308026cf3066af95b1",  # תרגול בכיתה: Chatbot בסיסי
                "title": "תרגול בכיתה: Chatbot בסיסי עם Python",
                "description": "<h3>בנייה chatbot פשוט בעזרת Python ו-OpenAI</h3><p><strong>מטרת קורס:</strong> בנייה אפליקציות עם AI</p><p><strong>משימות:</strong></p><ol><li>חיבור ל-OpenAI API</li><li>בנייה לולאת שיחה</li><li>טיוב ותשובות טובות יותר</li><li>בדיקה עם משתמשים</li></ol>",
                "weight": 5,
                "max_score": 15
            },
            {
                "id": "69414e2f5ddaa8bd7f7157f0",  # שיעורי בית: מערכת התראות (כבר עדכן למעלה)
                "title": "שיעורי בית: חיזוי תקלות עם Dashboard",
                "description": "<h3>בנייה dashboard לניטור מערכה</h3><p><strong>מטרת קורס:</strong> בנייה אפליקציות עם UI</p><p><strong>משימות:</strong></p><ol><li>בחירת ספריית dashboard (Flask/Streamlit)</li><li>הצגה נתונים בזמן אמת</li><li>גרפים ודוחות</li><li>התראות ודיווחים</li></ol>",
                "weight": 10,
                "max_score": 20
            }
        ]
    },
    
    "final_project": {
        "assignments": [
            {
                "id": "69414e2f5ddaa8bd7f7157f0",  # שיעורי בית: מערכת התראות (חוזר שוב)
                "title": "שיעורי בית: לוח זמנים תחזוקה",
                "description": "<h3>בנייה לוח זמנים תחזוקה ממכונה</h3><p><strong>מטרת קורס:</strong> בנייה אפליקציות + שילוב AI</p><p><strong>משימות:</strong></p><ol><li>בנייה מודל חיזוי</li><li>קביעת לוח זמנים תחזוקה</li><li>אופטימיזציה כדי למנוע תקלות</li><li>דוח לניהול</li></ol>",
                "weight": 10,
                "max_score": 20
            },
            {
                "id": "69414e2e350ab7953b7d3068",  # שיעורי בית: מערכת אבחון אוטומטית
                "title": "שיעורי בית: מערכת אבחון אוטומטית",
                "description": "<h3>בנייה מערכת אבחון אוטומטית לתקלות</h3><p><strong>מטרת קורס:</strong> בנייה אפליקציות עם AI + עבודה עם נתונים</p><p><strong>משימות:</strong></p><ol><li>איסוף נתוני תקלות</li><li>בנייה מודל לזיהוי סוג תקלה</li><li>יצירה דוח אבחון</li><li>בדיקה דיוק</li></ol>",
                "weight": 10,
                "max_score": 20
            },
            {
                "id": "69414e3011647469b8858d9b",  # תרגול בכיתה: הצגת פרויקט
                "title": "תרגול בכיתה: הצגת פרויקט",
                "description": "<h3>הצגה של פרויקט הטרם בכיתה</h3><p><strong>מטרת קורס:</strong> בנייה פרויקט מעשי</p><p><strong>משימות:</strong></p><ol><li>הכנת הצגה (slides)</li><li>דגמון של הפרויקט</li><li>הסבר כיצד זה עובד</li><li>מענה לשאלות מטולים</li></ol>",
                "weight": 10,
                "max_score": 20
            },
            {
                "id": "69414e31eb6133042ca18c9d",  # שיעורי בית: תיעוד סופי
                "title": "שיעורי בית: תיעוד סופי של פרויקט",
                "description": "<h3>כתיבה תיעוד מלא של הפרויקט</h3><p><strong>מטרת קורס:</strong> בנייה פרויקט מעשי</p><p><strong>משימות:</strong></p><ol><li>תיאור הבעיה</li><li>תיאור הפתרון</li><li>קוד ותיעוד של כל מודול</li><li>תוצאות ומסקנות</li></ol>",
                "weight": 10,
                "max_score": 20
            },
            {
                "id": "69414e317ef4032d7adc306e",  # פרויקט גמר: מערכת ניטור ותחזוקה חכמה
                "title": "פרויקט גמר: מערכת ניטור ותחזוקה חכמה",
                "description": "<h3>פרויקט גמר: בנייה מערכת ניטור וניבוי תחזוקה מעשית</h3><p><strong>מטרות קורס:</strong> כל 8 המטרות - בנייה פרויקט מעשי שלם</p><p><strong>דרישות הפרויקט:</strong></p><ol><li>מערכת ניטור בזמן אמת של ציוד</li><li>מודל לניבוי תקלות עתידיות</li><li>Chatbot לתמיכה בתחזוקה</li><li>דוח נתונים וניתוח</li><li>ממשק משתמש (Dashboard)</li><li>דוקומנטציה מלאה</li></ol>",
                "weight": 20,
                "max_score": 30
            },
            {
                "id": "69414e30a30ebe20d4d72548",  # בוחן סיכום: כל הקורס
                "title": "בוחן סיכום: כל הקורס",
                "description": "<h3>בוחן סיכום על כל התוכן של הקורס</h3><p><strong>מטרות קורס:</strong> כל 8 המטרות</p><p><strong>תוכן בוחן:</strong></p><ol><li>שאלות על AI ויכולות</li><li>שאלות על Python ו-Data</li><li>שאלות על יישום בהנדסה</li><li>שאלות על פרויקט וממשקים</li><li>שאלות חקירה על עתיד</li></ol>",
                "weight": 5,
                "max_score": 20
            }
        ]
    }
}

# Flatten all assignments
all_assignments = []
for category, data in updates_by_category.items():
    all_assignments.extend(data['assignments'])

print(f"\n📋 עדכון {len(all_assignments)} מטלות...")
print("-" * 100)

updated = 0
failed = 0
errors = []

for assignment in all_assignments:
    try:
        assignment_id = assignment['id']
        title = assignment.get('title', '')
        
        response = make_api_request(
            f'apps/{APP_ID}/entities/Assignment/{assignment_id}',
            method='PUT',
            data={k: v for k, v in assignment.items() if k != 'id'}
        )
        updated += 1
        print(f"✅ {title[:50]}...")
        time.sleep(0.1)
    except Exception as e:
        failed += 1
        error_msg = str(e)[:80]
        errors.append(f"{title[:40]}: {error_msg}")
        print(f"❌ {title[:50]}: {error_msg}")

print("\n" + "=" * 100)
print(f"✅ סיום עדכון מטלות!")
print("=" * 100)
print(f"\n📊 תוצאות:")
print(f"   ✅ עודכנו בהצלחה: {updated} מטלות")
print(f"   ❌ נכשלו: {failed} מטלות")
print(f"   📋 סה״כ: {len(all_assignments)} מטלות")

if errors:
    print(f"\n⚠️ שגיאות:")
    for error in errors[:5]:
        print(f"   - {error}")
    if len(errors) > 5:
        print(f"   ... ו{len(errors)-5} עוד")

print(f"\n🎯 כל מטלה קשורה כעת לאחת מה-8 מטרות הקורס:")
print("   1. שימוש בכלי AI מובילים")
print("   2. בנייה אפליקציות עם AI")
print("   3. אוטומציה איסוף מידע")
print("   4. עבודה עם מסמכים ונתונים")
print("   5. יצירת תוכן עם AI")
print("   6. הבנת יכולות והגבלות AI")
print("   7. שילוב AI בעבודה הנדסית")
print("   8. בנייה פרויקט מעשי")
