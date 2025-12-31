import requests
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
print("🌍 תרגום כל המושגים לעברית ועדכון כל המטלות")
print("=" * 100)

# Hebrew translation of all concepts
hebrew_concepts = {
    "69414e2c8702d6c582aa5422": [  # תרגול בכיתה: היכרות עם ChatGPT
        {"term": "ChatGPT", "definition": "ממשק שיחה לדגמים בסדרי גודל גדולים של שפה"},
        {"term": "יסודות פרומפט", "definition": "כתיבת הנחיות יעילות לבינה מלאכותית"},
        {"term": "השוואת כלי AI", "definition": "הבנת ההבדלים בין ChatGPT לClaude לGemini"},
        {"term": "עיבוד שפה טבעית", "definition": "איך בינה מלאכותית מבינה שפה אנושית"}
    ],
    
    "69414e2dca46bee8e4a7041b": [  # בוחן: Prompt Engineering
        {"term": "הנדסת פרומפט", "definition": "יצירת פרומפטים יעילים לתוצאות טובות יותר"},
        {"term": "חלון הקשר", "definition": "כמה מידע AI יכול להסתמך עליו"},
        {"term": "טמפרטורה ופרמטרים", "definition": "בקרה על עתירות וקריאטיביות התשובות"},
        {"term": "למידה מדוגמאות", "definition": "הוראת AI על ידי מתן דוגמאות"},
        {"term": "רשת מחשבה", "definition": "פירוק בעיות מורכבות לשלבים עבור AI"}
    ],
    
    "69414e2dbf32c5df194d2b9e": [  # שיעורי בית: בנק פרומפטים
        {"term": "מאגר פרומפטים", "definition": "בנייה אוסף של פרומפטים השימוש חוזרים"},
        {"term": "פרומפטים ספציפיים לתחום", "definition": "יישומים בהנדסה ויישומים מכניים"},
        {"term": "ניסוח פרומפטים", "definition": "מעקב אחר שיפורים וריאציות"},
        {"term": "בדיקת פרומפטים", "definition": "הערכת יעילות הפרומפט"},
        {"term": "תיעוד פרומפטים", "definition": "רישום הקשר שימוש של פרומפטים"}
    ],
    
    "69414e2d5954bae78fd16299": [  # בוחן: יסודות Python
        {"term": "משתנים וסוגי נתונים", "definition": "int, float, string, boolean - סוגי נתונים בסיסיים"},
        {"term": "אופרטורים", "definition": "פעולות חשבוניות, השוואה ולוגיות"},
        {"term": "לולאות ותנאים", "definition": "זרימת בקרה בPython (for, while, if)"},
        {"term": "פונקציות", "definition": "כתיבת בלוקים של קוד הניתן לשימוש חוזר"},
        {"term": "הערות ונוהלים טובים", "definition": "כתיבת קוד נקי וקריא"}
    ],
    
    "69414e2d5481295f3723d0cb": [  # תרגול בכיתה: מחשבון הנדסי
        {"term": "נוסחאות הנדסיות", "definition": "חישובי מומנט, כוח ועבודה"},
        {"term": "עיצוב פונקציות", "definition": "ארגון חישובים בצורה יעילה"},
        {"term": "אימות קלט", "definition": "טיפול בשגיאות משתמש בגרייסיוזיות"},
        {"term": "עיצוב פלט", "definition": "הצגת תוצאות בצורה ברורה"},
        {"term": "בדיקה וטיוב", "definition": "אימות נכונות הקוד"}
    ],
    
    "69414e2d6d64028218b1d452": [  # שיעורי בית: מחשבון OEE
        {"term": "נוסחת OEE", "definition": "זמינות × ביצוע × איכות"},
        {"term": "שיטות קלט נתונים", "definition": "קריאה מקבצים וקלט משתמש"},
        {"term": "לוגיקת חישוב", "definition": "יישום נוסחת OEE בPython"},
        {"term": "עיצוב תוצאות", "definition": "הצגת דוחות OEE בצורה ברורה"},
        {"term": "אימות נתונים", "definition": "הבטחת דיוק חישוב"}
    ],
    
    "69414e2d0fb0b15ddcf12cd0": [  # בוחן: Pandas וניתוח
        {"term": "DataFrames בPandas", "definition": "מבנה נתונים ליבתי לניתוח נתונים"},
        {"term": "טעינת נתונים", "definition": "קריאה מCSV, Excel וחוקיות אחרות"},
        {"term": "עיבוד נתונים", "definition": "סינון, מיון וטרנספורמציה של נתונים"},
        {"term": "פונקציות צבירה", "definition": "sum(), mean(), count(), groupby()"},
        {"term": "ויזואליזציה נתונים", "definition": "יצירת גרפים עם matplotlib וseaborn"}
    ],
    
    "69414e2ee86391f37fe09c01": [  # תרגול בכיתה: ניתוח ייצור
        {"term": "נתוני ייצור", "definition": "יומני הייצור וקריאות חיישנים"},
        {"term": "ניתוח נתונים חקירתי", "definition": "הבנת דפוסים בנתונים"},
        {"term": "זיהוי חריגות", "definition": "מציאת חריגויות בייצור"},
        {"term": "ניתוח סטטיסטי", "definition": "ממוצע, סטיית תקן, רביעיות של נתונים"},
        {"term": "יצירת דוח", "definition": "סיכום ממצאים לבעלי עניין"}
    ],
    
    "69414e2e9e084e06df769232": [  # שיעורי בית: דוח OEE אוטומטי
        {"term": "אוטומציית OEE", "definition": "חישוב OEE מנתונים גולמיים באופן אוטומטי"},
        {"term": "ניתוח סדרות זמן", "definition": "מעקב OEE לאורך זמן"},
        {"term": "דשבורדי ויזואליזציה", "definition": "יצירת גרפים וציורים"},
        {"term": "פורמטי ייצוא", "definition": "שמירת דוחות בCSV, PDF, Excel"},
        {"term": "תזמון", "definition": "אוטומציה של יצירת דוחות קבועים"}
    ],
    
    "69414e2e11647469b8858d9a": [  # בוחן: OpenAI API
        {"term": "אימות API של OpenAI", "definition": "הגדרת מפתחות API והיחסים"},
        {"term": "בקשות HTTP", "definition": "ביצוע קריאות API בעיצוב נכון"},
        {"term": "בחירת מודל", "definition": "בחירת GPT-3.5, GPT-4 לעבודות שונות"},
        {"term": "עיצוב פרומפט לAPI", "definition": "עיצוב פרומפטים לצריכת API"},
        {"term": "טיפול בתשובות", "definition": "ניתוח וטיפול בתשובות API"}
    ],
    
    "69414e2e4e55179b0c0a147a": [  # תרגול בכיתה: שליחת בקשות
        {"term": "מבנה בקשה", "definition": "הרכבת בקשות API נכונות"},
        {"term": "פרמטרים של מודל", "definition": "הגדרות temperature, max_tokens, top_p"},
        {"term": "טיפול בשגיאות", "definition": "לכידה וניהול שגיאות API"},
        {"term": "ניתוח תשובות", "definition": "הוצאת נתונים שימושיים מתשובות"},
        {"term": "אופטימיזציית עלות", "definition": "ניהול שימוש בAPI וטוקנים"}
    ],
    
    "69414e2eac7de303344f223e": [  # בוחן: מערכות ניטור
        {"term": "ארכיטקטורת מערכת", "definition": "רכיבי מערכות ניטור"},
        {"term": "אוסף נתונים", "definition": "חיישנים וקניית נתונים"},
        {"term": "עיבוד בזמן אמת", "definition": "טיפול בזרימות נתונים רציפות"},
        {"term": "מנגנונים של התראה", "definition": "הוקנות התראות לאירועים"},
        {"term": "שילוב AI", "definition": "שימוש בML לזיהוי חריגות"}
    ],
    
    "69414e2f3b729f24f11b1489": [  # תרגול בכיתה: סימולטור
        {"term": "סימולציית חיישנים", "definition": "יצירת נתוני חיישנים ריאליסטיים"},
        {"term": "נתוני סדרות זמן", "definition": "יצירת סדרות זמניות"},
        {"term": "שונויות אקראיות", "definition": "הוספת רעש וריאציות ריאליסטיות"},
        {"term": "פלט קובץ", "definition": "שמירת נתונים סימולטיביים בCSV"},
        {"term": "בדיקת נתונים", "definition": "אימות שהסימולטור מייצר נתונים נכונים"}
    ],
    
    "69414e2f892480c1aa2002c8": [  # שיעורי בית: זיהוי חריגות
        {"term": "הגדרת חריגה", "definition": "מה נחשב להתנהגות חריגה"},
        {"term": "שיטות סטטיסטיות", "definition": "שימוש בסטיית תקן לזיהוי"},
        {"term": "הגדרת סף", "definition": "בחירת ערכי סף התראה מתאימים"},
        {"term": "יישום אלגוריתם", "definition": "קידוד לוגיקת זיהוי"},
        {"term": "מדדי ביצוע", "definition": "הערכת חיוביים כוזביים לעומת שליליים כוזביים"}
    ],
    
    "69414e2fba2b03400a97cc88": [  # בוחן: תחזוקה מונעת
        {"term": "תחזוקה מונעת", "definition": "מניעת כשלים לפני שהם מתרחשים"},
        {"term": "דפוסי כשל", "definition": "דפוסי נתונים היסטוריים המעידים על בעיות"},
        {"term": "תזמון תחזוקה", "definition": "אופטימיזציה מתי לבצע תחזוקה"},
        {"term": "ניתוח עלות-תועלת", "definition": "שקילה מניעה לעומת עלויות תיקון"},
        {"term": "אתגרי יישום", "definition": "בעיות פריסה בעולם האמיתי"}
    ],
    
    "69414e2f3ee762a6a5f26703": [  # תרגול בכיתה: Terminal
        {"term": "יסודות Terminal/Shell", "definition": "ניווט בפקודות ופעולות"},
        {"term": "ניהול קבצים", "definition": "יצירה, הדפסה, מחיקת קבצים ותיקיות"},
        {"term": "הרצת Python", "definition": "הרצת סקריפטים Python משורת הפקודה"},
        {"term": "משתנים סביבה", "definition": "הבנת PATH וPYTHONPATH"},
        {"term": "הודעות שגיאה", "definition": "פירוש ותיקון שגיאות שורת פקודה"}
    ],
    
    "69414e2f86e3de310ffdacc0": [  # תרגול בכיתה: מודל חיזוי
        {"term": "יסודות Machine Learning", "definition": "הכשרה ובדיקת מודלים"},
        {"term": "בחירת תכונות", "definition": "בחירת נתונים רלוונטיים לחיזוי"},
        {"term": "הכשרת מודל", "definition": "התאמה מודל לנתונים היסטוריים"},
        {"term": "בדיקת חיזוי", "definition": "הערכת דיוק המודל"},
        {"term": "פריסה", "definition": "שימוש במודלים מאומנים לחיזויים"}
    ],
    
    "69414e2f5ddaa8bd7f7157f0": [  # שיעורי בית: מערכת התראות
        {"term": "עיצוב מערכת התראה", "definition": "ארכיטקטורה להתראות אוטומטיות"},
        {"term": "לוגיקת סף", "definition": "הגדרת תנאי התראה"},
        {"term": "שיטות התראה", "definition": "דוא״ל, SMS, התראות דשבורד"},
        {"term": "עדיפות התראה", "definition": "רמות קריטיות לעומת אזהרה לעומת מידע"},
        {"term": "בדיקת התראות", "definition": "אימות שמערכת ההתראות עובדת"}
    ],
    
    "69414e30c50be93f69425301": [  # בוחן: Chatbots
        {"term": "ארכיטקטורת Chatbot", "definition": "רכיבים ודפוסי עיצוב"},
        {"term": "זרימה שיחה", "definition": "ניהול שיחות מולטי-תור"},
        {"term": "זיהוי כוונה", "definition": "הבנת מטרות משתמש"},
        {"term": "יצירת תשובה", "definition": "יצירת תשובות רלוונטיות להקשר"},
        {"term": "שילוב פלטפורמה", "definition": "פריסת chatbots לערוצים שונים"}
    ],
    
    "69414e308026cf3066af95b1": [  # תרגול בכיתה: Chatbot בסיסי
        {"term": "OpenAI Chat API", "definition": "שימוש בGPT לAI שיחה"},
        {"term": "היסטוריית הודעה", "definition": "ניהול הקשר שיחה"},
        {"term": "פרומפטים מערכת", "definition": "הגדרת אישיות וכללי chatbot"},
        {"term": "טיפול קלט משתמש", "definition": "עיבוד ואימות הודעות משתמש"},
        {"term": "אופטימיזציית תשובה", "definition": "יצירת תשובות עזרה טכנית"}
    ],
    
    "69414e3011647469b8858d9b": [  # תרגול בכיתה: הצגת פרויקט
        {"term": "מבנה הצגה", "definition": "ארגון תוכן בצורה לוגית"},
        {"term": "הדגמות טכניות", "definition": "הדגמות חיות של מערכות עובדות"},
        {"term": "תקשורת בעל עניין", "definition": "הסבר לקהלים שונים"},
        {"term": "הכנה Q&A", "definition": "צפייה בשאלות נפוצות"},
        {"term": "עזרים חזותיים", "definition": "שימוש בשקופיות ודיאגרמות בצורה יעילה"}
    ],
    
    "69414e31eb6133042ca18c9d": [  # שיעורי בית: תיעוד
        {"term": "תיעוד פרויקט", "definition": "כתיבה טכנית מקיפה"},
        {"term": "הצהרת בעיה", "definition": "הגדרה ברורה של האתגר"},
        {"term": "ארכיטקטורת פתרון", "definition": "תיאור ההגישה"},
        {"term": "תיעוד קוד", "definition": "תיעוד פונקציות ומודולים"},
        {"term": "תוצאות ומסקנות", "definition": "סיכום ממצאים ולמידה"}
    ],
    
    "69414e317ef4032d7adc306e": [  # פרויקט גמר
        {"term": "פיתוח Full-Stack", "definition": "Frontend, backend, וDatabase"},
        {"term": "עיצוב מערכת", "definition": "ארכיטקטורה של מערכת ניטור שלמה"},
        {"term": "צינור נתונים", "definition": "אוסף, עיבוד, אחסון"},
        {"term": "שילוב Machine Learning", "definition": "בנייה מודלים ניבוי"},
        {"term": "פריסה ובדיקה", "definition": "הפיכת מערכת לפרודקשן"},
        {"term": "ממשק משתמש", "definition": "יצירת דשבורדים ודוחות"},
        {"term": "אופטימיזציית ביצוע", "definition": "הבטחת יעילות מערכת"}
    ],
    
    "69414e30a30ebe20d4d72548": [  # בוחן סיכום
        {"term": "בינה מלאכותית וMachine Learning", "definition": "הבנת יכולות AI"},
        {"term": "תכנות Python", "definition": "ידע קידוד מעשי"},
        {"term": "ניתוח נתונים", "definition": "עבודה עם נתונים בעולם האמיתי"},
        {"term": "יישומי ייצור", "definition": "מקרי שימוש תעשייתיים מעשיים"},
        {"term": "AI אתית", "definition": "הבנת מגבלות ושימוש אחראי"},
        {"term": "שילוב מערכת", "definition": "הבאת רכיבים ביחד"}
    ]
}

# Get all assignments
assignments_data = make_api_request(f'apps/{APP_ID}/entities/Assignment')
assignments = assignments_data if isinstance(assignments_data, list) else []
course_assignments = [a for a in assignments if a.get('course_id') == course_id]

print(f"\n📝 עדכון {len(course_assignments)} מטלות עם מושגים מתורגמים לעברית...\n")
print("-" * 100)

updated = 0
failed = 0
added_concepts = 0

for assignment in course_assignments:
    assignment_id = assignment.get('id', '')
    title = assignment.get('title', '')[:40]
    
    # Get hebrew concepts for this assignment
    if assignment_id in hebrew_concepts:
        concepts = hebrew_concepts[assignment_id]
        try:
            response = make_api_request(
                f'apps/{APP_ID}/entities/Assignment/{assignment_id}',
                method='PUT',
                data={'key_concepts': concepts}
            )
            updated += 1
            added_concepts += len(concepts)
            print(f"✅ {title}: {len(concepts)} מושגים בעברית")
            time.sleep(0.1)
        except Exception as e:
            failed += 1
            print(f"❌ {title}: {str(e)[:40]}")
    else:
        print(f"⏭️  {title}: לא זמין בתרגום")

print("\n" + "=" * 100)
print(f"✅ עדכון מושגים בעברית הושלם!")
print("=" * 100)
print(f"\n📊 תוצאות:")
print(f"   ✅ מטלות עודכנו: {updated}")
print(f"   ❌ נכשלו: {failed}")
print(f"   💡 סך הכל מושגים בעברית: {added_concepts}")
print(f"   📋 סה״כ מטלות: {len(course_assignments)}")
print(f"\n🎯 כל המושגים כעת בעברית!")
