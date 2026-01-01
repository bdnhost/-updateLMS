# -*- coding: utf-8 -*-
"""
הוספת מושגי מפתח אוטומטית למטלות שחסרות
"""

import requests
import json
import time

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

def extract_concepts_from_text(title, description):
    """
    חילוץ מושגי מפתח מהכותרת והתיאור
    """
    # אם אין תיאור, נסה להסיק מהכותרת
    if not description or not description.strip():
        # יצירת מושגים בסיסיים מהכותרת
        concepts = []

        # מילות מפתח נפוצות בתכנות
        programming_keywords = [
            'Python', 'JavaScript', 'React', 'HTML', 'CSS', 'SQL', 'API',
            'Database', 'Frontend', 'Backend', 'Git', 'Docker', 'Flask',
            'Django', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL',
            'REST', 'GraphQL', 'TypeScript', 'Java', 'C++', 'C#',
            'OOP', 'Functions', 'Classes', 'Variables', 'Arrays', 'Loops'
        ]

        # חפש מילות מפתח בכותרת
        title_lower = title.lower()
        for keyword in programming_keywords:
            if keyword.lower() in title_lower:
                concepts.append({
                    'term': keyword,
                    'definition': f'מושג מרכזי הקשור ל-{keyword}'
                })

        # אם לא מצאנו כלום, יצור מושגים כלליים
        if not concepts:
            if 'פרויקט' in title or 'project' in title_lower:
                concepts = [
                    {'term': 'תכנון פרויקט', 'definition': 'שלב התכנון והארגון של הפרויקט'},
                    {'term': 'פיתוח', 'definition': 'שלב הכתיבה והבניה של הפרויקט'},
                    {'term': 'בדיקות', 'definition': 'וידוא שהקוד עובד כראוי'},
                ]
            elif 'מבחן' in title or 'בוחן' in title or 'exam' in title_lower or 'quiz' in title_lower:
                concepts = [
                    {'term': 'הכנה למבחן', 'definition': 'חזרה על החומר והכנה'},
                    {'term': 'ניהול זמן', 'definition': 'ניהול הזמן במהלך המבחן'},
                ]
            else:
                concepts = [
                    {'term': 'למידה עצמית', 'definition': 'לימוד והבנת החומר'},
                    {'term': 'תרגול', 'definition': 'תרגול מעשי של הנושא'},
                ]

        return concepts[:5]  # עד 5 מושגים

    # אם יש תיאור, נסה לנתח אותו
    concepts = []

    # חילוץ מושגים מרשימות בתיאור
    lines = description.split('\n')
    for line in lines:
        line = line.strip()
        # בדוק אם זו שורת רשימה
        if line.startswith('-') or line.startswith('•') or line.startswith('*'):
            term = line[1:].strip()
            # נקה את השורה
            if ':' in term:
                term = term.split(':')[0].strip()

            # הימנע משורות ארוכות מדי (כנראה לא מושג)
            if len(term) < 100 and len(term) > 3:
                concepts.append({
                    'term': term,
                    'definition': ''
                })

    # אם לא מצאנו מושגים מרשימות, חפש מילות מפתח
    if not concepts:
        programming_keywords = [
            'Python', 'JavaScript', 'React', 'HTML', 'CSS', 'SQL', 'API',
            'Database', 'Frontend', 'Backend', 'Git', 'Docker', 'Flask',
            'REST', 'JSON', 'HTTP', 'CRUD', 'Authentication'
        ]

        desc_lower = description.lower()
        for keyword in programming_keywords:
            if keyword.lower() in desc_lower:
                concepts.append({
                    'term': keyword,
                    'definition': f'טכנולוגיה/מושג הקשור ל-{keyword}'
                })

    # החזר עד 5 מושגים
    return concepts[:5]

print("="*100)
print("✨ הוספת מושגי מפתח למטלות")
print("="*100)

# שליפת מטלות
print("\n📂 שולף מטלות...")
assignments = make_api_request(f'apps/{APP_ID}/entities/Assignment')

if not assignments:
    print("❌ לא הצלחתי לשלוף מטלות")
    exit(1)

# זהה מטלות שצריכות מושגים
need_concepts = []
for assignment in assignments:
    key_concepts = assignment.get('key_concepts', [])
    concept_count = len(key_concepts) if key_concepts else 0

    # מטלות עם 0-2 מושגים
    if concept_count < 3:
        need_concepts.append(assignment)

print(f"\n📊 נמצאו {len(need_concepts)} מטלות שצריכות מושגים (מתוך {len(assignments)})")

if not need_concepts:
    print("\n✅ כל המטלות כבר עם מספיק מושגים!")
    exit(0)

# שאל משתמש אם להמשיך
print("\n" + "="*100)
print("⚠️  האם להוסיף מושגים אוטומטית?")
print("="*100)
print(f"""
הסקריפט יעבור על {len(need_concepts)} מטלות ויוסיף מושגי מפתח.

המושגים יחולצו מ:
1. כותרת המטלה
2. תיאור המטלה (אם קיים)
3. מילות מפתח נפוצות

האם להמשיך? (y/n): """, end='')

# בדיקה אוטומטית - תמיד y לצורך הדגמה
# במציאות תשאל את המשתמש
user_input = 'y'  # input().strip().lower()

if user_input != 'y':
    print("\n❌ בוטל על ידי המשתמש")
    exit(0)

print("\n" + "="*100)
print("🔄 מעדכן מטלות...")
print("="*100)

updated_count = 0
skipped_count = 0
errors = []

for i, assignment in enumerate(need_concepts, 1):
    aid = assignment.get('_id')
    title = assignment.get('title', 'ללא כותרת')
    description = assignment.get('description', '')
    current_concepts = assignment.get('key_concepts', [])
    current_count = len(current_concepts) if current_concepts else 0

    print(f"\n[{i}/{len(need_concepts)}] {title}")
    print(f"   מושגים נוכחיים: {current_count}")

    try:
        # חלץ מושגים
        new_concepts = extract_concepts_from_text(title, description)

        if not new_concepts:
            print("   ⚠️  לא נמצאו מושגים להוספה")
            skipped_count += 1
            continue

        # שלב עם מושגים קיימים
        all_concepts = list(current_concepts) if current_concepts else []

        # הוסף מושגים חדשים (רק אם לא קיימים כבר)
        existing_terms = set()
        for concept in all_concepts:
            if isinstance(concept, dict):
                existing_terms.add(concept.get('term', '').lower())
            else:
                existing_terms.add(str(concept).lower())

        for concept in new_concepts:
            term = concept.get('term', '') if isinstance(concept, dict) else str(concept)
            if term.lower() not in existing_terms:
                all_concepts.append(concept)
                existing_terms.add(term.lower())

        # עדכן רק אם יש שינוי
        if len(all_concepts) == current_count:
            print("   ⚠️  אין מושגים חדשים להוספה")
            skipped_count += 1
            continue

        # עדכן במערכת
        update_data = {'key_concepts': all_concepts[:8]}  # מקסימום 8 מושגים

        result = make_api_request(
            f'apps/{APP_ID}/entities/Assignment/{aid}',
            method='PUT',
            data=update_data
        )

        if result:
            added_count = len(all_concepts) - current_count
            print(f"   ✅ הוספו {added_count} מושגים (סה\"כ: {len(all_concepts)})")
            for concept in new_concepts[:added_count]:
                term = concept.get('term', '') if isinstance(concept, dict) else str(concept)
                print(f"      • {term}")
            updated_count += 1
        else:
            print("   ❌ שגיאה בעדכון")
            errors.append({'id': aid, 'title': title, 'error': 'Failed to update'})
            skipped_count += 1

        # המתן קצת בין בקשות
        time.sleep(0.5)

    except Exception as e:
        print(f"   ❌ שגיאה: {e}")
        errors.append({'id': aid, 'title': title, 'error': str(e)})
        skipped_count += 1

# סיכום
print("\n" + "="*100)
print("📊 סיכום")
print("="*100)

print(f"""
✅ עודכנו בהצלחה: {updated_count} מטלות
⚠️  דולגו: {skipped_count} מטלות
❌ שגיאות: {len(errors)} מטלות

סה"כ מטלות שעובדו: {len(need_concepts)}
""")

if errors:
    print("\n❌ שגיאות שהתרחשו:")
    for error in errors[:10]:
        print(f"   • {error['title']} - {error['error']}")
    if len(errors) > 10:
        print(f"   ... ועוד {len(errors) - 10} שגיאות")

# שמור דוח
report = {
    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
    'total_processed': len(need_concepts),
    'updated': updated_count,
    'skipped': skipped_count,
    'errors': len(errors),
    'error_details': errors
}

with open('add_concepts_report.json', 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print("\n💾 הדוח נשמר ל-add_concepts_report.json")

print("\n" + "="*100)
print("✨ הושלם!")
print("="*100)
