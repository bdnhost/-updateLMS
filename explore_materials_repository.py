"""
🔍 בדיקת מאגר החומרים המלא
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

    session = requests.Session()
    session.trust_env = False

    if method.upper() == 'GET':
        response = session.request(method, url, headers=headers, params=data, timeout=30)
    else:
        response = session.request(method, url, headers=headers, json=data, timeout=30)

    response.raise_for_status()
    return response.json()

print("=" * 100)
print("🔍 בדיקת מאגר החומרים המלא")
print("=" * 100)

# קבל את כל החומרים (ללא סינון לפי קורס)
print("\n📚 שלב 1: קריאת כל החומרים במערכת...")

try:
    all_materials = make_api_request(f'apps/{APP_ID}/entities/Material')

    if isinstance(all_materials, list):
        materials_list = all_materials
    else:
        materials_list = all_materials.get('data', [])

    print(f"✅ נמצאו {len(materials_list)} חומרי לימוד במערכת!\n")

    # סטטיסטיקה
    by_type = {}
    by_topic = {}
    by_course = {}

    print("=" * 100)
    print("📊 דוגמאות חומרים (20 ראשונים):")
    print("=" * 100)

    for i, material in enumerate(materials_list[:20], 1):
        title = material.get('title', 'ללא כותרת')
        mat_type = material.get('type', 'לא מוגדר')
        topic = material.get('topic', 'לא מוגדר')
        course_id = material.get('course_id', 'אין')

        print(f"\n{i}. {title}")
        print(f"   ID: {material.get('id')}")
        print(f"   סוג: {mat_type} | נושא: {topic}")
        print(f"   קורס: {course_id}")

        # אסוף סטטיסטיקה
        by_type[mat_type] = by_type.get(mat_type, 0) + 1
        by_topic[topic] = by_topic.get(topic, 0) + 1
        by_course[course_id if course_id else 'ללא קורס'] = by_course.get(course_id if course_id else 'ללא קורס', 0) + 1

    if len(materials_list) > 20:
        print(f"\n... ועוד {len(materials_list) - 20} חומרים")

    # הצג סטטיסטיקה מלאה
    print("\n" + "=" * 100)
    print("📊 סטטיסטיקה כללית")
    print("=" * 100)

    print(f"\n📈 חלוקה לפי סוג חומר:")
    for mat_type, count in sorted(by_type.items(), key=lambda x: x[1], reverse=True):
        print(f"   • {mat_type}: {count} חומרים")

    print(f"\n📚 חלוקה לפי נושא (10 הנושאים הנפוצים ביותר):")
    for topic, count in sorted(by_topic.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"   • {topic}: {count} חומרים")

    print(f"\n🎓 חלוקה לפי קורס (10 הקורסים עם הכי הרבה חומרים):")
    for course, count in sorted(by_course.items(), key=lambda x: x[1], reverse=True)[:10]:
        course_display = course if course != 'ללא קורס' else 'ללא קורס (חומרים גלובליים)'
        print(f"   • {course_display}: {count} חומרים")

    # שמור לקובץ
    output_file = 'all_materials_repository.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(materials_list, f, ensure_ascii=False, indent=2)

    print(f"\n✅ כל החומרים נשמרו ל-{output_file}")

    # חומרים ללא קורס
    no_course = [m for m in materials_list if not m.get('course_id')]
    print(f"\n💡 יש {len(no_course)} חומרים שלא משויכים לקורס ספציפי")
    print("   (אלה יכולים לשמש כמאגר גלובלי לכל הקורסים)")

except Exception as e:
    print(f"❌ שגיאה: {e}")

print("\n" + "=" * 100)
print("✨ סיום בדיקה")
print("=" * 100)
