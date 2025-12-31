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

assignment_id = "69414e30eb899ca912353c2b"

# בדיקה: מה המערכת מקבלת
print("=" * 80)
print("🧪 בדיקה של עדכון פדגוגי")
print("=" * 80)

# עדכון בשלבים - תחילה עם שדות בטוחים
update_data = {
    "title": "מטלה 2: שליטה בטרמינל - Terminal Mastery Lab 🚀",
    "weight": 20.0,
    "max_score": 100.0,
    "status": "open",
    "due_date": "2026-02-02",
    "submission_type": "online",
    "type": "assignment"
}

print("\n📝 ניסיון 1: עדכון שדות בסיסיים...")
try:
    response = make_api_request(
        f'apps/{APP_ID}/entities/Assignment/{assignment_id}',
        method='PUT',
        data=update_data
    )
    print("✅ עדכון שדות בסיסיים בוצע בהצלחה!")
    assignment_id_verify = response.get('id')
except Exception as e:
    print(f"❌ שגיאה: {e}")
    exit(1)

# שלב 2: עדכון תיאור
description_text = "<h2>🎯 מטרות הלמידה</h2><p>בסיום המטלה תהיו בעלי יכולת:</p><ul><li>ניווט מומחה במערכת הקבצים דרך Terminal</li><li>ניהול קבצים וקיצורים בשורת הפקודה</li><li>בדיקות רשת ואבחון בעיות</li><li>אוטומציה בסיסית עם סקריפטים</li><li>ניהול הרשאות ובטיחות</li></ul><h2>📚 תיאור המטלה המפורט</h2><h3>שלב 1: הכנה (5 דק')</h3><p>פתיחת Terminal, ניווט לשולחן העבודה, בדיקת המיקום הנוכחי.</p><h3>שלב 2: יצירת מבנה פרויקט (10 דק')</h3><p>יצירת מבנה מערכת קבצים מקצועי עם תיקיות src, docs, tests, backup.</p><h3>שלב 3: עבודה עם קבצים (15 דק')</h3><p>יצירה, העתקה, הצגת תוכן וניהול קבצים דרך Terminal.</p><h3>שלב 4: בדיקות רשת (10 דק')</h3><p>ipconfig, ping, tracert ו-nslookup לבדיקת קישוריות והרשת.</p><h3>שלב 5: הרשאות ובטיחות (10 דק')</h3><p>icacls לצפייה וניהול הרשאות קבצים.</p><h3>שלב 6: אוטומציה (15 דק')</h3><p>יצירת סקריפט Batch להריצה אוטומטית של משימות.</p><h3>שלב 7: תיעוד (5 דק')</h3><p>יצירת דוח סופי עם כל ההוצאות והביצועים.</p>"

update_description = {"description": description_text}

print("\n📝 ניסיון 2: עדכון התיאור...")
try:
    response = make_api_request(
        f'apps/{APP_ID}/entities/Assignment/{assignment_id}',
        method='PUT',
        data=update_description
    )
    print("✅ עדכון התיאור בוצע בהצלחה!")
except Exception as e:
    print(f"❌ שגיאה בעדכון התיאור: {e}")

# שלב 3: עדכון מושגים (key_concepts)
key_concepts = [
    {
        "term": "Terminal / Command Line Interface (CLI)",
        "definition": "ממשק טקסטואלי לתקשורת ישירה עם מערכת ההפעלה. בווינדוס: PowerShell או CMD. מאפשר ביצוע פעולות מהירות וחזקות."
    },
    {
        "term": "Directory Structure / File System",
        "definition": "ארגון היררכי של תיקיות וקבצים. כל קובץ יושב בנתיב מסוים. הבנת המבנה חיונית לניווט יעיל."
    },
    {
        "term": "Command Syntax & Parameters",
        "definition": "כל פקודה מורכבת מ: [Command] [Parameter] [Options]. למשל: ipconfig /all - Command=ipconfig, Flag=/all."
    },
    {
        "term": "Network Diagnostics Tools",
        "definition": "כלים: ipconfig (מידע IP), ping (קישוריות), tracert (נתיב), nslookup (דומיינים). קריטיים לאבחון רשת."
    },
    {
        "term": "File Operations & I/O Redirection",
        "definition": "> ליצירת קובץ, >> להוספה לקובץ קיים, | (pipe) להעברת פלט בין פקודות. חיוני לעיבוד נתונים."
    },
    {
        "term": "Scripting & Batch Automation",
        "definition": "כתיבת סדרת פקודות בקובץ .bat להריצה כמסה אחת. חוסך זמן בביצוע משימות חוזרות."
    },
    {
        "term": "Permissions & Security",
        "definition": "icacls לניהול הרשאות בווינדוס. 3 רמות: Read (קריאה), Write (כתיבה), Execute (הרצה). חיוני לבטיחות."
    },
    {
        "term": "System Environment & PATH",
        "definition": "משתנה מערכת המכיל רשימת תיקיות בהן מחפשים פקודות. הבנה זו חיונית לעבודה עם כלים חיצוניים."
    }
]

update_concepts = {"key_concepts": key_concepts}

print("\n📝 ניסיון 3: עדכון מושגים...")
try:
    response = make_api_request(
        f'apps/{APP_ID}/entities/Assignment/{assignment_id}',
        method='PUT',
        data=update_concepts
    )
    print(f"✅ עדכון מושגים בוצע בהצלחה! ({len(key_concepts)} מושגים)")
except Exception as e:
    print(f"❌ שגיאה בעדכון מושגים: {e}")

# שלב 4: עדכון יכולות קשורות
competencies = [
    {
        "name": "CLI Proficiency",
        "description": "שליטה בשורת הפקודה ללא תלות בעכבר",
        "level": "intermediate"
    },
    {
        "name": "System Administration",
        "description": "ניהול קבצים, תיקיות, הרשאות והגדרות",
        "level": "intermediate"
    },
    {
        "name": "Network Troubleshooting",
        "description": "אבחון בעיות רשת והבנת תקשורת",
        "level": "beginner"
    },
    {
        "name": "Script Writing",
        "description": "כתיבת סקריפטים לאוטומציה",
        "level": "beginner"
    },
    {
        "name": "Technical Documentation",
        "description": "תיעוד מקצועי של תהליכים",
        "level": "intermediate"
    }
]

update_competencies = {"related_competencies": competencies}

print("\n📝 ניסיון 4: עדכון יכולות קשורות...")
try:
    response = make_api_request(
        f'apps/{APP_ID}/entities/Assignment/{assignment_id}',
        method='PUT',
        data=update_competencies
    )
    print(f"✅ עדכון יכולות בוצע בהצלחה! ({len(competencies)} יכולות)")
except Exception as e:
    print(f"❌ שגיאה בעדכון יכולות: {e}")

# שלב 5: עדכון קישורים
resource_links = [
    {
        "title": "Windows Command Line Reference",
        "url": "https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/windows-commands-glossary",
        "description": "מדריך רשמי מייקרוסופט לפקודות Windows"
    },
    {
        "title": "PowerShell Documentation",
        "url": "https://docs.microsoft.com/en-us/powershell/",
        "description": "תיעוד מלא ל-PowerShell המודרנית"
    },
    {
        "title": "Network Commands Guide",
        "url": "https://www.cisco.com/c/en/us/support/docs/ip/ip-addressing-services/17016-ip-addr-10.html",
        "description": "הסבר מעמיק על ipconfig וכלים אחרים"
    },
    {
        "title": "Batch Scripting Tutorial",
        "url": "https://www.tutorialspoint.com/batch_script/",
        "description": "תרגול כתיבת סקריפטים Batch"
    },
    {
        "title": "Commands Comparison Cheat Sheet",
        "url": "https://cheatography.com/davechild/cheat-sheets/linux-command-line/",
        "description": "השוואה בין פקודות Windows ו-Linux"
    }
]

update_links = {"resource_links": resource_links}

print("\n📝 ניסיון 5: עדכון קישורים חינוכיים...")
try:
    response = make_api_request(
        f'apps/{APP_ID}/entities/Assignment/{assignment_id}',
        method='PUT',
        data=update_links
    )
    print(f"✅ עדכון קישורים בוצע בהצלחה! ({len(resource_links)} קישורים)")
except Exception as e:
    print(f"❌ שגיאה בעדכון קישורים: {e}")

# קבלת המטלה המעודכנת
print("\n" + "=" * 80)
print("✨ המטלה המעודכנת הסופית")
print("=" * 80)

try:
    final_assignment = make_api_request(f'apps/{APP_ID}/entities/Assignment/{assignment_id}')
    print(f"\n📊 תיעוד המטלה:")
    print(f"   כותרת: {final_assignment.get('title')}")
    print(f"   משקל: {final_assignment.get('weight')} נקודות")
    print(f"   מושגים: {len(final_assignment.get('key_concepts', []))} מושגים עמוקים")
    print(f"   יכולות: {len(final_assignment.get('related_competencies', []))} יכולות")
    print(f"   קישורים: {len(final_assignment.get('resource_links', []))} מקורות חינוכיים")
    print(f"   סטטוס: {final_assignment.get('status')}")
    print(f"   תאריך גמר: {final_assignment.get('due_date')}")
    print(f"   עדכון אחרון: {final_assignment.get('updated_date')}")
    
    # טיפ: הדפסת כותרה של תיאור
    desc = final_assignment.get('description', '')
    if desc:
        print(f"\n   תיאור: {desc[:150]}...")
        
except Exception as e:
    print(f"❌ שגיאה בקבלת המטלה: {e}")

print("\n" + "=" * 80)
print("✨ עדכון המטלה הושלם בהצלחה!")
print("=" * 80)
