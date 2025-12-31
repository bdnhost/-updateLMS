import requests
import json
from datetime import datetime

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

# IDs
assignment_id = "69414e30eb899ca912353c2b"
course_id = "69414e2be636c8c8c38af82d"

print("=" * 70)
print("🔄 עדכון מטלה - UPDATE ASSIGNMENT")
print("=" * 70)

# Prepare update data
# You can update: title, description, due_date, weight, max_score, status, etc.
update_data = {
    # Example updates - שנה את אלה לפי הצורך שלך
    "title": "שיעורי בית: עבודה עם Terminal (עדכן)",
    "description": "<p><strong>עדכון לתאריך 31.12.2025</strong></p><p>לאחר שתכנסו למטלה ותקראו את המדריך לשורת הפקודה, יגיע הזמן לתרגל בפועל! בעבודה זו תיצרו מבנה תיקיות, תתרגלו ניווט, ותבצעו בדיקות רשת בסיסיות - כל זאת באמצעות הטרמינל בלבד, ללא שימוש בעכבר.</p>",
    "weight": 15.0,  # שינוי משקל
    "max_score": 100.0,
    "status": "open",
    "due_date": "2026-02-02"
}

print("\n📝 נתונים להעדכון:")
print(json.dumps(update_data, indent=2, ensure_ascii=False))

try:
    # Perform the update
    response = make_api_request(
        f'apps/{APP_ID}/entities/Assignment/{assignment_id}',
        method='PUT',
        data=update_data
    )
    print("\n✅ ההעדכון בוצע בהצלחה!")
    print("\n📊 תוצאה:")
    print(json.dumps(response, indent=2, ensure_ascii=False))
    
except Exception as e:
    print(f"\n❌ שגיאה בעדכון: {e}")

print("\n" + "=" * 70)
print("✨ סיום תהליך העדכון")
print("=" * 70)
