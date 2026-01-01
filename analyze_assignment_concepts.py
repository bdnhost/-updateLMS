# -*- coding: utf-8 -*-
"""
ניתוח מטלות עם מושגים חסרים או חלקיים
"""

import requests
import json
from collections import defaultdict

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
print("🔍 ניתוח מושגים במטלות")
print("="*100)

# שליפת כל המטלות
assignments = make_api_request(f'apps/{APP_ID}/entities/Assignment')

if not assignments:
    print("\n❌ לא הצלחתי לשלוף מטלות")
    exit(1)

print(f"\n📊 נמצאו {len(assignments)} מטלות כוללות")

# קטגוריות
no_concepts = []           # ללא מושגים בכלל
partial_concepts = []      # 1-2 מושגים בלבד
good_concepts = []         # 3+ מושגים
empty_description = []     # ללא תיאור כלל

for assignment in assignments:
    aid = assignment.get('_id')
    title = assignment.get('title', 'ללא כותרת')
    description = assignment.get('description', '')
    key_concepts = assignment.get('key_concepts', [])
    assignment_type = assignment.get('type', 'regular')

    # ספירת מושגים
    concept_count = len(key_concepts) if key_concepts else 0

    # קטגוריזציה
    if concept_count == 0:
        no_concepts.append({
            'id': aid,
            'title': title,
            'type': assignment_type,
            'has_description': bool(description and description.strip())
        })
    elif concept_count <= 2:
        partial_concepts.append({
            'id': aid,
            'title': title,
            'type': assignment_type,
            'concept_count': concept_count,
            'concepts': key_concepts
        })
    else:
        good_concepts.append({
            'id': aid,
            'title': title,
            'concept_count': concept_count
        })

    # בדיקת תיאור
    if not description or not description.strip():
        empty_description.append({
            'id': aid,
            'title': title,
            'type': assignment_type
        })

print("\n" + "="*100)
print("📈 סטטיסטיקה")
print("="*100)

print(f"\n✅ מטלות עם 3+ מושגים: {len(good_concepts)} ({len(good_concepts)/len(assignments)*100:.1f}%)")
print(f"⚠️  מטלות עם 1-2 מושגים: {len(partial_concepts)} ({len(partial_concepts)/len(assignments)*100:.1f}%)")
print(f"❌ מטלות ללא מושגים: {len(no_concepts)} ({len(no_concepts)/len(assignments)*100:.1f}%)")
print(f"📝 מטלות ללא תיאור: {len(empty_description)} ({len(empty_description)/len(assignments)*100:.1f}%)")

# דוח מפורט - מטלות ללא מושגים
if no_concepts:
    print("\n" + "="*100)
    print("❌ מטלות ללא מושגים בכלל")
    print("="*100)

    for i, assignment in enumerate(no_concepts[:20], 1):  # הצג עד 20 ראשונות
        has_desc = "✅ יש תיאור" if assignment['has_description'] else "❌ אין תיאור"
        print(f"\n{i}. {assignment['title']}")
        print(f"   ID: {assignment['id']}")
        print(f"   סוג: {assignment['type']}")
        print(f"   {has_desc}")
        print(f"   URL: https://edu-manage.org/PublicView?type=assignment&id={assignment['id']}")

    if len(no_concepts) > 20:
        print(f"\n... ועוד {len(no_concepts) - 20} מטלות")

# דוח מפורט - מטלות עם מושגים חלקיים
if partial_concepts:
    print("\n" + "="*100)
    print("⚠️  מטלות עם מושגים חלקיים (1-2 בלבד)")
    print("="*100)

    for i, assignment in enumerate(partial_concepts[:20], 1):
        print(f"\n{i}. {assignment['title']}")
        print(f"   ID: {assignment['id']}")
        print(f"   מושגים קיימים ({assignment['concept_count']}):")
        for concept in assignment['concepts']:
            if isinstance(concept, dict):
                print(f"     • {concept.get('term', concept)}")
            else:
                print(f"     • {concept}")
        print(f"   URL: https://edu-manage.org/PublicView?type=assignment&id={assignment['id']}")

    if len(partial_concepts) > 20:
        print(f"\n... ועוד {len(partial_concepts) - 20} מטלות")

# ניתוח לפי סוג מטלה
print("\n" + "="*100)
print("📊 פילוח לפי סוג מטלה")
print("="*100)

type_stats = defaultdict(lambda: {'total': 0, 'no_concepts': 0, 'partial': 0, 'good': 0})

for a in assignments:
    atype = a.get('type', 'regular')
    concepts = a.get('key_concepts', [])
    count = len(concepts) if concepts else 0

    type_stats[atype]['total'] += 1
    if count == 0:
        type_stats[atype]['no_concepts'] += 1
    elif count <= 2:
        type_stats[atype]['partial'] += 1
    else:
        type_stats[atype]['good'] += 1

for atype, stats in sorted(type_stats.items()):
    print(f"\n{atype}:")
    print(f"  כולל: {stats['total']}")
    print(f"  ללא מושגים: {stats['no_concepts']}")
    print(f"  חלקי (1-2): {stats['partial']}")
    print(f"  טוב (3+): {stats['good']}")

# שמירת דוח JSON
report = {
    'summary': {
        'total_assignments': len(assignments),
        'no_concepts': len(no_concepts),
        'partial_concepts': len(partial_concepts),
        'good_concepts': len(good_concepts),
        'empty_description': len(empty_description)
    },
    'assignments_needing_concepts': [
        {
            'id': a['id'],
            'title': a['title'],
            'type': a['type'],
            'url': f"https://edu-manage.org/PublicView?type=assignment&id={a['id']}"
        }
        for a in no_concepts
    ],
    'assignments_partial_concepts': [
        {
            'id': a['id'],
            'title': a['title'],
            'type': a['type'],
            'current_concepts': a['concepts'],
            'url': f"https://edu-manage.org/PublicView?type=assignment&id={a['id']}"
        }
        for a in partial_concepts
    ]
}

with open('assignments_concepts_report.json', 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print("\n" + "="*100)
print("💡 המלצות")
print("="*100)

print(f"""
✅ מה לעשות הלאה:

1. מטלות ללא מושגים ({len(no_concepts)}):
   - הרץ סקריפט אוטומטי להוספת מושגים
   - או הוסף ידנית עבור המטלות החשובות

2. מטלות עם מושגים חלקיים ({len(partial_concepts)}):
   - השלם ל-3-5 מושגים לכל מטלה
   - בדוק שהמושגים רלוונטיים

3. מטלות ללא תיאור ({len(empty_description)}):
   - הוסף תיאור בסיסי
   - התיאור עוזר לתלמידים להבין את המטלה

💾 הדוח נשמר ל-assignments_concepts_report.json
""")

print("="*100)
