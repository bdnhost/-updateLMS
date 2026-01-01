# -*- coding: utf-8 -*-
"""
מציאת כל מטלות הפרויקט ובדיקה איזה מהן חסר content_data
"""

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
print("🔍 חיפוש כל מטלות הפרויקט במערכת")
print("="*100)

# שליפת כל המטלות
assignments = make_api_request(f'apps/{APP_ID}/entities/Assignment')

if not assignments:
    print("\n❌ לא הצלחתי לשלוף מטלות מהשרת")
    exit(1)

# סינון מטלות פרויקט
project_assignments = [a for a in assignments if a.get('type') == 'project']

print(f"\n📊 נמצאו {len(project_assignments)} מטלות מסוג פרויקט\n")

# בדיקה איזה מהן צריכות content_data
needs_update = []
has_content = []

for assignment in project_assignments:
    aid = assignment.get('_id')
    title = assignment.get('title', 'ללא כותרת')
    content_data = assignment.get('content_data')

    if not content_data or not content_data.get('milestones'):
        needs_update.append(assignment)
        status = "❌ חסר content_data"
    else:
        has_content.append(assignment)
        milestone_count = len(content_data.get('milestones', []))
        status = f"✅ יש {milestone_count} אבני דרך"

    print(f"{status:30s} | {title[:60]}")
    print(f"{'':30s} | ID: {aid}")
    print(f"{'':30s} | URL: https://edu-manage.org/PublicView?type=assignment&id={aid}")
    print()

print("="*100)
print(f"\n📈 סיכום:")
print(f"   ✅ מטלות עם content_data: {len(has_content)}")
print(f"   ❌ מטלות ללא content_data: {len(needs_update)}")

if needs_update:
    print(f"\n💡 כדי לתקן את כל המטלות, הרץ:")
    print(f"   python fix_project_assignments_content_data.py")

    print(f"\n📋 רשימת מטלות שצריכות תיקון:")
    for a in needs_update:
        print(f"   - {a.get('title')}")
        print(f"     ID: {a.get('_id')}")

# שמירה לקובץ
output = {
    'total_projects': len(project_assignments),
    'has_content_data': len(has_content),
    'needs_update': len(needs_update),
    'assignments_needing_update': [
        {
            'id': a.get('_id'),
            'title': a.get('title'),
            'url': f"https://edu-manage.org/PublicView?type=assignment&id={a.get('_id')}"
        }
        for a in needs_update
    ]
}

with open('project_assignments_status.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n💾 הדוח נשמר ל-project_assignments_status.json")
