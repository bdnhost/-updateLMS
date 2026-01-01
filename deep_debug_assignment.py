# -*- coding: utf-8 -*-
"""
בדיקה מעמיקה של מטלת פרויקט
"""

import requests
import json
from datetime import datetime

API_KEY = 'c0ce546b5661436dacb7a2060b10c9a5'
APP_ID = '693824c5c1ad33c1f114ebd2'
ASSIGNMENT_ID = '6942ae578b6cc5827f6df40d'

def make_api_request(api_path, method='GET', data=None):
    url = f'https://app.base44.com/api/{api_path}'
    headers = {
        'api_key': API_KEY,
        'Content-Type': 'application/json'
    }

    try:
        session = requests.Session()
        session.trust_env = False

        if method.upper() == 'GET':
            response = session.request(method, url, headers=headers, params=data, timeout=30)
        else:
            response = session.request(method, url, headers=headers, json=data, timeout=30)

        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ שגיאה: {e}")
        return None

print("="*100)
print("🔍 בדיקה מעמיקה של מטלת פרויקט")
print("="*100)

assignment = make_api_request(f'apps/{APP_ID}/entities/Assignment/{ASSIGNMENT_ID}')

if not assignment:
    print("\n❌ לא הצלחתי לשלוף את המטלה מהשרת")
    exit(1)

print("\n📋 פרטי המטלה הבסיסיים:")
print(f"   ID: {assignment.get('_id')}")
print(f"   כותרת: {assignment.get('title')}")
print(f"   תיאור: {assignment.get('description', 'אין')[:100]}")
print(f"   סוג (type): {assignment.get('type')}")
print(f"   קטגוריה: {assignment.get('category')}")
print(f"   סטטוס: {assignment.get('status')}")

print("\n🎯 בדיקות קריטיות:")

# בדיקה 1: האם type הוא project?
type_check = assignment.get('type') == 'project'
print(f"   ✅ type === 'project': {type_check}" if type_check else f"   ❌ type === 'project': {type_check} (סוג נוכחי: {assignment.get('type')})")

# בדיקה 2: האם content_data קיים?
content_data = assignment.get('content_data')
content_check = content_data is not None
print(f"   ✅ content_data קיים: {content_check}" if content_check else "   ❌ content_data קיים: False")

if content_data:
    # בדיקה 3: האם milestones קיים?
    milestones = content_data.get('milestones')
    milestones_check = milestones is not None
    print(f"   ✅ milestones קיים: {milestones_check}" if milestones_check else "   ❌ milestones קיים: False")

    if milestones:
        # בדיקה 4: האם milestones הוא מערך?
        is_array = isinstance(milestones, list)
        print(f"   ✅ milestones הוא מערך: {is_array}" if is_array else "   ❌ milestones הוא מערך: False")

        if is_array:
            # בדיקה 5: כמה אבני דרך יש?
            count = len(milestones)
            print(f"   ✅ מספר אבני דרך: {count}" if count > 0 else "   ❌ מספר אבני דרך: 0")

            if count > 0:
                print(f"\n📍 פירוט אבני הדרך:")
                for i, milestone in enumerate(milestones, 1):
                    print(f"\n   {i}. {milestone.get('title', 'ללא כותרת')}")
                    print(f"      ID: {milestone.get('id')}")
                    print(f"      אחוז: {milestone.get('percentage')}%")
                    print(f"      תאריך יעד: {milestone.get('dueDate')}")
                    print(f"      תיאור: {milestone.get('description', 'אין')[:80]}...")

    # בדיקה 6: האם guidelines קיים?
    guidelines = content_data.get('guidelines')
    if guidelines:
        print(f"\n📋 הנחיות (80 תווים ראשונים):")
        print(f"   {guidelines[:80]}...")

print("\n🔬 בדיקת תנאי הצגה לפי הקוד ב-React:")
print("   הקוד: resource.type === 'project' && resource.content_data")
type_ok = assignment.get('type') == 'project'
data_ok = content_data is not None
should_display = type_ok and data_ok
print(f"   {'✅ התנאי מתקיים - אבני הדרך צריכות להיות מוצגות!' if should_display else '❌ התנאי לא מתקיים - אבני הדרך לא יוצגו'}")

print("\n🌐 URL הציבורי:")
print(f"   https://edu-manage.org/PublicView?type=assignment&id={ASSIGNMENT_ID}")

print("\n" + "="*100)
print("💡 אם כל הבדיקות עברו בהצלחה, הבעיה היא בדף הציבורי עצמו:")
print("="*100)

if should_display:
    print("""
1️⃣  פתח את הדף הציבורי
2️⃣  לחץ על הכפתור הגדול "כניסה למטלה" (flip the card!)
3️⃣  גלול למטה בצד האחורי
4️⃣  חפש את הקטע "אבני דרך לפרויקט"

אם עדיין לא רואה:
🔍 פתח Console (F12)
🔍 חפש שגיאות אדומות
🔍 צלם מסך ושלח לי
""")
else:
    print("""
❌ יש בעיה בנתונים! אבני הדרך לא יכולות להיות מוצגות.
   צריך לתקן את הנתונים תחילה.
""")

# שמירת הנתונים המלאים לקובץ
output_file = 'assignment_full_debug.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(assignment, f, ensure_ascii=False, indent=2)

print(f"\n💾 הנתונים המלאים נשמרו ל-{output_file}")
