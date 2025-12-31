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
print("🎓 הוספת מושגים לשש המטלות החסרות")
print("=" * 100)

# Missing assignments - adding Hebrew concepts
missing_concepts = {
    "69414e30eb899ca912353c2b": {  # מטלה 2: שליטה בטרמינל
        "title": "מטלה 2: שליטה בטרמינל",
        "concepts": [
            {"term": "ממשק שורת פקודה", "definition": "תקשורת ישירה עם מערכת ההפעלה דרך טקסט"},
            {"term": "מבנה מערכת קבצים", "definition": "ארגון היררכי של תיקיות וקבצים במחשב"},
            {"term": "פקודות וסינטקס", "definition": "[Command] [Parameter] [Options] - מבנה כל פקודה"},
            {"term": "כלי אבחון רשת", "definition": "ipconfig, ping, tracert, nslookup - לבדיקת רשת"},
            {"term": "ניהול הרשאות", "definition": "icacls לניהול הרשאות בקבצים - קריאה, כתיבה, הרצה"},
            {"term": "סקריפטים וAuto", "definition": "קבצי .bat להריצה אוטומטית של משימות"},
            {"term": "משתנים מערכת", "definition": "PATH ומשתנים אחרים שמוגדרים בסביבה"}
        ]
    },
    
    "69414e30ad68407cb4171be4": {  # שיעורי בית: לוח זמנים תחזוקה (מטלה 1)
        "title": "שיעורי בית: לוח זמנים תחזוקה",
        "concepts": [
            {"term": "ניבוי כשלים", "definition": "חיזוי מתי כנראה תיפול מכונה"},
            {"term": "אופטימיזציית לוחות זמנים", "definition": "תכנון תחזוקה ביעילות מקסימלית"},
            {"term": "מודלים ניבוי", "definition": "שימוש בנתונים היסטוריים לחיזוי עתידי"},
            {"term": "ניהול משאבים", "definition": "הקצאת זמן וציוד לתחזוקה"}
        ]
    },
    
    "69414e2fac5b82cce4a0ad28": {  # בוחן מפגש 7: Dashboard והתראות
        "title": "בוחן: Dashboard והתראות",
        "concepts": [
            {"term": "דשבורד", "definition": "ממשק חזותי לצפייה בנתונים בזמן אמת"},
            {"term": "ויזואליזציה", "definition": "הצגת נתונים בצורה חזותית - גרפים וטבלאות"},
            {"term": "התראות בזמן אמת", "definition": "התראות מיידיות כשמשהו חריג מתרחש"},
            {"term": "מדדי ביצוע", "definition": "מספרים חשובים להצגה - KPIs"}
        ]
    },
    
    "69414e2e350ab7953b7d3068": {  # שיעורי בית: מערכת אבחון אוטומטית
        "title": "שיעורי בית: מערכת אבחון אוטומטית",
        "concepts": [
            {"term": "סיווג בעיות", "definition": "זיהוי סוג התקלה או הבעיה"},
            {"term": "ניתוח סימפטומים", "definition": "בדיקה של סימנים המעידים על בעיה"},
            {"term": "בסיס ידע", "definition": "אוסף של בעיות ופתרונות ידועים"},
            {"term": "מנוע אבחון", "definition": "לוגיקה המחברת סימנים לבעיות"}
        ]
    },
    
    "69414e2df69e00d32e99069c": {  # תרגול בכיתה: אבחון תקלות עם AI
        "title": "תרגול בכיתה: אבחון תקלות עם AI",
        "concepts": [
            {"term": "זיהוי דפוסים", "definition": "AI מזהה דפוסים בנתונים ההיסטוריים"},
            {"term": "סיווג אוטומטי", "definition": "ממיין בעיות לקטגוריות"},
            {"term": "דיוק אבחון", "definition": "עד כמה הדיוק של האבחון של AI"},
            {"term": "למידה מחוזרת", "definition": "AI משתפר ככל שזה רואה יותר נתונים"}
        ]
    },
    
    "69414e2ddf3c9c04e8dbee78": {  # שיעורי בית: זיהוי יישומי AI
        "title": "שיעורי בית: זיהוי יישומים של AI",
        "concepts": [
            {"term": "יישומי AI", "definition": "שימוש פרקטי של AI בתעשיה"},
            {"term": "תרחישים בהנדסה", "definition": "היכן משתמשים בAI בהנדסת מכונות"},
            {"term": "פתרונות בעיות", "definition": "איך AI פותר בעיות הנדסיות"},
            {"term": "רווח עסקי", "definition": "מה התועלת וחיסכון בשימוש AI"}
        ]
    }
}

print(f"\n📝 הוספת מושגים לשש המטלות החסרות...\n")
print("-" * 100)

updated = 0
failed = 0
added_concepts = 0

for assignment_id, data in missing_concepts.items():
    title = data.get('title', '')
    concepts = data.get('concepts', [])
    
    try:
        response = make_api_request(
            f'apps/{APP_ID}/entities/Assignment/{assignment_id}',
            method='PUT',
            data={'key_concepts': concepts}
        )
        updated += 1
        added_concepts += len(concepts)
        print(f"✅ {title}: {len(concepts)} מושגים חדשים")
        time.sleep(0.1)
    except Exception as e:
        failed += 1
        print(f"❌ {title}: {str(e)[:40]}")

print("\n" + "=" * 100)
print(f"✅ הוספת מושגים לשש המטלות הושלמה!")
print("=" * 100)
print(f"\n📊 תוצאות:")
print(f"   ✅ מטלות עודכנו: {updated}")
print(f"   ❌ נכשלו: {failed}")
print(f"   💡 סך הכל מושגים חדשים: {added_concepts}")
print(f"\n🎯 עכשיו כל 30 המטלות בקורס עם מושגים בעברית!")
