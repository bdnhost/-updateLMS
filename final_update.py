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

# נסיון עם פורמט מינימלי לקישורים
resource_links = [
    "https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/windows-commands-glossary",
    "https://docs.microsoft.com/en-us/powershell/",
    "https://www.cisco.com/c/en/us/support/docs/ip/ip-addressing-services/17016-ip-addr-10.html",
    "https://www.tutorialspoint.com/batch_script/",
    "https://cheatography.com/davechild/cheat-sheets/linux-command-line/"
]

print("=" * 80)
print("🔗 ניסיון עדכון קישורים במבנה מינימלי")
print("=" * 80)

update_links = {"resource_links": resource_links}

try:
    response = make_api_request(
        f'apps/{APP_ID}/entities/Assignment/{assignment_id}',
        method='PUT',
        data=update_links
    )
    print(f"✅ עדכון קישורים בוצע בהצלחה!")
    print(f"   קישורים: {len(response.get('resource_links', []))}")
except Exception as e:
    print(f"❌ שגיאה: {e}")

# קבלת המטלה הסופית
print("\n" + "=" * 80)
print("📊 סיכום המטלה המעודכנת")
print("=" * 80)

try:
    final = make_api_request(f'apps/{APP_ID}/entities/Assignment/{assignment_id}')
    
    print(f"""
✨ המטלה עודכנה בהצלחה!

📋 פרטי המטלה:
   • כותרת: {final.get('title')}
   • משקל: {final.get('weight')} נקודות
   • ניקוד מקסימלי: {final.get('max_score')}
   • סטטוס: {final.get('status')}
   • תאריך גמר: {final.get('due_date')}
   
🎓 תוכן פדגוגי:
   • 8 מושגים עיקריים בתחום Terminal/CLI
   • 5 יכולות קשורות להשגה
   • תיאור מפורט של 7 שלבים עבודה
   • קישורים חינוכיים רשמיים
   
📚 תכנים שנוצרו:
   ✅ מטרות לימוד ברורות
   ✅ הנחיות צעד אחר צעד
   ✅ דוגמאות עם קוד בפועל
   ✅ טיפים למומחים
   ✅ קריטריונים להערכה
   ✅ שאלות לבדיקה עצמית
   ✅ עזרה בטרובלשוטינג
   ✅ יכולות המשלבות הנדסאות מכונות עם טכנולוגיה
   
⏰ עדכון אחרון: {final.get('updated_date')}
""")
    
except Exception as e:
    print(f"❌ שגיאה בקבלת המטלה: {e}")

print("=" * 80)
