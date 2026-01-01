# -*- coding: utf-8 -*-
"""
בדיקה של מטלה ספציפית
"""

import requests
import json

API_KEY = 'c0ce546b5661436dacb7a2060b10c9a5'
APP_ID = '693824c5c1ad33c1f114ebd2'
ASSIGNMENT_ID = '6942ae578b6cc5827f6df40d'

def make_api_request(api_path, method='GET', data=None):
    url = f'https://app.base44.com/api/{api_path}'
    headers = {
        'api_key': API_KEY,
        'Content-Type': 'application/json'
    }

    session = requests.Session()
    session.trust_env = False

    if method.upper() == 'GET':
        response = session.request(method, url, headers=headers, params=data, timeout=30)
    else:
        response = session.request(method, url, headers=headers, json=data, timeout=30)

    response.raise_for_status()
    return response.json()

print("=" * 100)
print(f"🔍 בדיקת מטלה: {ASSIGNMENT_ID}")
print("=" * 100)

try:
    assignment = make_api_request(f'apps/{APP_ID}/entities/Assignment/{ASSIGNMENT_ID}')

    print("\n📋 פרטי המטלה:\n")
    print(f"כותרת: {assignment.get('title')}")
    print(f"קטגוריה: {assignment.get('category')}")
    print(f"סוג (type): {assignment.get('type')}")
    print(f"\n📊 content_data:\n")

    content_data = assignment.get('content_data')
    if content_data:
        print(json.dumps(content_data, ensure_ascii=False, indent=2))
    else:
        print("❌ אין content_data!")

    print(f"\n🔗 שדות נוספים:")
    print(f"description: {assignment.get('description')[:200] if assignment.get('description') else 'אין'}...")
    print(f"max_score: {assignment.get('max_score')}")
    print(f"weight: {assignment.get('weight')}")

    # שמור לקובץ
    with open('assignment_debug.json', 'w', encoding='utf-8') as f:
        json.dump(assignment, f, ensure_ascii=False, indent=2)

    print(f"\n✅ כל הפרטים נשמרו ל-assignment_debug.json")

except Exception as e:
    print(f"❌ שגיאה: {e}")
