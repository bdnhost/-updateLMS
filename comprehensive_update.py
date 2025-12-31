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

# עדכון יותר עמוק ופדגוגי
update_data = {
    "title": "מטלה 2: שליטה בטרמינל - Terminal Mastery Lab",
    
    "description": "<h2><strong>🎯 מטרות הלמידה</strong></h2><p>בסיום המטלה הזו תהיו בעלי יכולת:</p><ul><li>🔧 <strong>ניווט מומחה</strong>: תנווטו בקלות במערכת הקבצים שלכם דרך Terminal</li><li>📁 <strong>ניהול קבצים</strong>: ליצור, להעתיק, להעביר ולמחוק קבצים בשורת הפקודה</li><li>🌐 <strong>בדיקות רשת</strong>: לאבחן וללחוש לחיבורי הרשת שלכם</li><li>⚙️ <strong>אוטומציה בסיסית</strong>: לכתוב סקריפטים פשוטים לביצוע משימות חוזרות</li><li>🔐 <strong>ניהול הרשאות</strong>: להבין ולשלוט בהרשאות הקבצים</li></ul><h2><strong>📚 תיאור המטלה המפורט</strong></h2><h3><strong>שלב 1: הכנה והתכנות</strong> (5 דקות)</h3><p><strong>מה תעשו:</strong></p><ol><li>פתחו את Terminal (PowerShell או CMD)</li><li>נווטו לשולחן העבודה: cd Desktop</li><li>בדקו את המיקום הנוכחי: pwd (PowerShell) או cd (CMD)</li><li>הציגו את קבצי הספרייה: ls -la (PowerShell) או dir (CMD)</li></ol><p><strong>למה זה חשוב:</strong> אתם מכירים את הסביבה שלכם ויודעים איפה אתם עובדים.</p><h3><strong>שלב 2: יצירת מבנה פרויקט מקצועי</strong> (10 דקות)</h3><p><strong>מבנה הפרויקט שתיצרו:</strong></p><p>MechanicalAI/ - src/ (scripts, data, models) - docs/ (guides, reports) - tests/ - backup/ - README.md - config.txt</p><p><strong>פקודות לביצוע:</strong></p><p>mkdir MechanicalAI &amp;&amp; cd MechanicalAI &amp;&amp; mkdir src src\\scripts src\\data src\\models docs docs\\guides docs\\reports tests backup</p><h3><strong>שלב 3: עבודה עם קבצים ותיקיות</strong> (15 דקות)</h3><p>יצירת קובץ טקסט עם מידע student_info.txt, העתקה לגיבוי, וניהול קבצים בסיסי.</p><h3><strong>שלב 4: בדיקות רשת</strong> (10 דקות)</h3><p>ipconfig /all לפרטי רשת, ping 8.8.8.8 לבדיקת קישוריות, tracert google.com לעקיבה נתיב.</p><h3><strong>שלב 5: הרשאות ובטיחות</strong> (10 דקות)</h3><p>icacls src\\student_info.txt לצפייה בהרשאות, שינוי וריסט הרשאות.</p><h3><strong>שלב 6: אוטומציה בסיסית</strong> (15 דקות)</h3><p>יצירת סקריפט Batch backup_script.bat להריצה אוטומטית של פקודות.</p><h3><strong>שלב 7: תיעוד וביצוע סקירה</strong> (5 דקות)</h3><p>יצירת דוח מקיף בקובץ final_report.txt עם כל ההוצאות והביצועים.</p><h2><strong>🎓 מושגים חשובים לשליטה</strong></h2><h3><strong>מונחים בטרמינל:</strong></h3><ul><li><strong>Working Directory</strong>: הספרייה הנוכחית</li><li><strong>Path</strong>: כתובת מלאה של קובץ או תיקייה</li><li><strong>Command Syntax</strong>: מבנה הוראה עם פרמטרים וFlags</li><li><strong>Redirection</strong>: הפניה של פלט לקובץ או פקודה אחרת</li><li><strong>Pipes</strong>: העברת תוצאות בין פקודות</li></ul><h2><strong>⚡ טיפים למומחים</strong></h2><ol><li><strong>Tab Completion</strong>: השלמה אוטומטית של שמות</li><li><strong>Command History</strong>: חצי חץ למעלה/מטה לחזרה לפקודות קודמות</li><li><strong>Clear Screen</strong>: cls או clear לניקוי המסך</li><li><strong>Help System</strong>: command /? לעזרה</li><li><strong>Wildcards</strong>: * לכל קבצים ו? לתו בודד</li></ol><h2><strong>🔍 קריטריונים להערכה</strong></h2><p>מבנה פרויקט (15) | עבודה עם קבצים (20) | בדיקות רשת (25) | סקריפט אוטומציה (20) | תיעוד ודוח (20)</p><h2><strong>❓ שאלות לבדיקה עצמית</strong></h2><ol><li>מה ההבדל בין cd .. ל-cd .?</li><li>מה הפקודה להצגת כל קבצים כולל נסתרים?</li><li>איך יוצרים תיקייה עם שם המכיל רווחים?</li><li>מה ההבדל בין &gt; ו-&gt;&gt;?</li><li>למה ipconfig חשוב להנדסאי מכונות?</li><li>מה היתרון של סקריפט על פני פקודות ידניות?</li></ol><h2><strong>📞 עזרה וטרובלשוטינג</strong></h2><p><strong>בעיה: command not found</strong> → הפקודה לא בנתיב System</p><p><strong>בעיה: Access Denied</strong> → אתם לא בעלי הרשאות, פתחו as Administrator</p><p><strong>בעיה: File is locked</strong> → קובץ בשימוש בתוכנה אחרת, סגרו אותה</p>",
    
    "key_concepts": [
        {
            "term": "Terminal / Command Line Interface (CLI)",
            "definition": "ממשק טקסטואלי לתקשורת ישירה עם מערכת ההפעלה. בווינדוס: PowerShell או CMD. בלינוקס/Mac: Bash/Zsh. מאפשר ביצוע פעולות מהירות וחזקות שלא אפשר דרך GUI."
        },
        {
            "term": "Directory Structure / File System Hierarchy",
            "definition": "ארגון היררכי של תיקיות וקבצים במחשב. כל קובץ יושב בנתיב מסוים (path). הבנת המבנה חיונית לניווט יעיל. דוגמה: C:\\Users\\YourName\\Desktop\\MyProject\\src\\main.py"
        },
        {
            "term": "Command Syntax & Parameters (Flags)",
            "definition": "כל פקודה מורכבת מ: [Command] [Parameter] [Options/Flags]. למשל: 'ipconfig /all' - Command='ipconfig', Flag='/all'. להבנת Syntax נעזרים ב'Help': command /?  או man command"
        },
        {
            "term": "Network Diagnostics (ipconfig, ping, tracert, nslookup)",
            "definition": "כלים להבנת מצב הרשת: ipconfig = מידע על כתובת IP, ping = בדיקת קישוריות, tracert = עקיבה אחר נתיבי רשת, nslookup = תרגום שמות דומיינים. קריטיים להנדסאים לטיפול בבעיות רשת."
        },
        {
            "term": "File Operations & I/O Redirection",
            "definition": "יצירה, העתקה, מחיקה של קבצים דרך Terminal. Redirection: '>' ליצירת קובץ חדש, '>>' להוספה לקובץ קיים, '|' (pipe) להעברת פלט בין פקודות. חיוני לעיבוד נתונים."
        },
        {
            "term": "Scripting & Batch Automation",
            "definition": "כתיבת סדרת פקודות בקובץ .bat (Windows) או .sh (Unix) להריצה כמסה אחת. חוסך זמן בביצוע משימות חוזרות. דוגמה: backup_script.bat שמעתיק קבצים בחצי שניה."
        },
        {
            "term": "Permissions & Security (icacls, chmod)",
            "definition": "ניהול הרשאות גישה לקבצים. בווינדוס: icacls, בלינוקס: chmod. יש 3 רמות: Read (קריאה), Write (כתיבה), Execute (הרצה). חיוני לבטיחות נתונים."
        },
        {
            "term": "System Environment & PATH Variable",
            "definition": "משתנה מערכת המכיל רשימת תיקיות בהן המערכת מחפשת פקודות. כשמקלידים 'python', מערכת מחפשת אותו בכל התיקיות ב-PATH. הבנה זו חיונית לעבודה עם כלים חיצוניים."
        }
    ],
    
    "related_competencies": [
        {
            "name": "CLI Proficiency",
            "description": "שליטה מלאה בשורת הפקודה ללא תלות בעכבר",
            "level": "intermediate"
        },
        {
            "name": "System Administration Basics",
            "description": "ניהול קבצים, תיקיות, הרשאות והגדרות מערכת",
            "level": "intermediate"
        },
        {
            "name": "Network Troubleshooting",
            "description": "אבחון בעיות רשת והבנת אדריכלות תקשורת",
            "level": "beginner"
        },
        {
            "name": "Script Writing & Automation",
            "description": "כתיבת סקריפטים לאוטומציה של משימות",
            "level": "beginner"
        },
        {
            "name": "Technical Documentation",
            "description": "תיעוד מקצועי של תהליכים וביצועים",
            "level": "intermediate"
        }
    ],
    
    "resource_links": [
        {
            "title": "Windows Command Line Reference",
            "url": "https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/windows-commands-glossary",
            "description": "מדריך רשמי מייקרוסופט לכל פקודות Windows"
        },
        {
            "title": "PowerShell Official Documentation",
            "url": "https://docs.microsoft.com/en-us/powershell/",
            "description": "תיעוד מלא ל-PowerShell - מחוונת Windows המודרנית"
        },
        {
            "title": "Network Commands Deep Dive",
            "url": "https://www.cisco.com/c/en/us/support/docs/ip/ip-addressing-services/17016-ip-addr-10.html",
            "description": "הסבר מעמיק על ipconfig ובדיקות רשת"
        },
        {
            "title": "Batch Script Tutorial",
            "url": "https://www.tutorialspoint.com/batch_script/",
            "description": "תרגול כתיבת סקריפטים Batch ל-Windows"
        },
        {
            "title": "Linux vs Windows Commands Cheat Sheet",
            "url": "https://cheatography.com/davechild/cheat-sheets/linux-command-line/",
            "description": "השוואה בין פקודות ב-Windows ו-Linux"
        }
    ],
    
    "due_date": "2026-02-02",
    "weight": 15.0,
    "max_score": 100.0,
    "status": "open",
    "submission_type": "online",
    "type": "assignment"
}

print("=" * 80)
print("🎨 עדכון פדגוגי עמוק - PEDAGOGICAL UPDATE")
print("=" * 80)

try:
    response = make_api_request(
        f'apps/{APP_ID}/entities/Assignment/{assignment_id}',
        method='PUT',
        data=update_data
    )
    print("\n✅ ההעדכון בוצע בהצלחה!")
    print("\n📊 סטטוס המטלה המעודכנת:")
    print(f"   כותרת: {response.get('title')}")
    print(f"   משקל: {response.get('weight')} נקודות")
    print(f"   ניקוד מקסימלי: {response.get('max_score')}")
    print(f"   מושגים: {len(response.get('key_concepts', []))} מושגים עמוקים")
    print(f"   יכולות קשורות: {len(response.get('related_competencies', []))} יכולות")
    print(f"   מקורות: {len(response.get('resource_links', []))} קישורים חינוכיים")
    print(f"   עדכון אחרון: {response.get('updated_date')}")
    
except Exception as e:
    print(f"\n❌ שגיאה בעדכון: {e}")

print("\n" + "=" * 80)
print("✨ המטלה הוחזקה בתכנים פדגוגיים איכותיים!")
print("=" * 80)
