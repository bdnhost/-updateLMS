import requests
import json
import time

API_KEY = 'c0ce546b5661436dacb7a2060b10c9a5'
APP_ID = '693824c5c1ad33c1f114ebd2'
COURSE_ID = '6942ae4afed1bf7040557a50'

def make_api_request(api_path, method='GET', data=None, retries=3):
    url = f'https://app.base44.com/api/{api_path}'
    headers = {
        'api_key': API_KEY,
        'Content-Type': 'application/json'
    }

    for attempt in range(retries):
        try:
            if method.upper() == 'GET':
                response = requests.request(method, url, headers=headers, params=data, timeout=30)
            else:
                response = requests.request(method, url, headers=headers, json=data, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            if attempt < retries - 1:
                wait_time = 2 ** attempt
                print(f"⚠️ ניסיון {attempt + 1} נכשל, מחכה {wait_time} שניות...")
                time.sleep(wait_time)
            else:
                raise e

print("=" * 100)
print("📚 ניתוח קורס: AI להנדסאי רכב שנה א'")
print("=" * 100)

# 1. קבל את פרטי הקורס
print("\n🔍 שלב 1: קריאת פרטי הקורס...")
course = make_api_request(f'apps/{APP_ID}/entities/Course/{COURSE_ID}')

print(f"\n✨ שם הקורס: {course.get('name', 'N/A')}")
print(f"   קוד קורס: {course.get('code', 'N/A')}")
print(f"   סמסטר: {course.get('semester', 'N/A')}")
print(f"   שעות שבועיות: {course.get('weekly_hours', 'N/A')}")
print(f"   סך סשנים: {course.get('total_sessions', 'N/A')}")
print(f"   סטטוס: {course.get('status', 'N/A')}")

description = course.get('description', '')
print(f"\n📄 אורך תיאור הקורס: {len(description)} תווים")
if description:
    print("\n" + "=" * 100)
    print("תיאור הקורס הנוכחי:")
    print("=" * 100)
    print(description)
    print("=" * 100)

# שמור לקובץ
with open('/home/user/-updateLMS/course_6942ae4a_full.json', 'w', encoding='utf-8') as f:
    json.dump(course, f, ensure_ascii=False, indent=2)

# 2. קבל את כל הסשנים
print("\n🔍 שלב 2: קריאת סשנים...")
time.sleep(1)
sessions = make_api_request(f'apps/{APP_ID}/entities/CourseSession', data={'course_id': COURSE_ID})

if isinstance(sessions, list):
    sessions_list = sessions
else:
    sessions_list = sessions.get('data', [])

print(f"\n📊 נמצאו {len(sessions_list)} סשנים:")
for i, session in enumerate(sessions_list, 1):
    print(f"\n{i}. {session.get('title', 'ללא כותרת')}")
    print(f"   ID: {session.get('id')}")
    print(f"   מספר: {session.get('session_number', 'N/A')}")
    print(f"   Objectives: {session.get('objectives', 'אין')[:80] if session.get('objectives') else '❌ אין'}")

with open('/home/user/-updateLMS/sessions_6942ae4a.json', 'w', encoding='utf-8') as f:
    json.dump(sessions_list, f, ensure_ascii=False, indent=2)

# 3. קבל את כל המטלות
print("\n🔍 שלב 3: קריאת מטלות...")
time.sleep(1)
assignments = make_api_request(f'apps/{APP_ID}/entities/Assignment', data={'course_id': COURSE_ID})

if isinstance(assignments, list):
    assignments_list = assignments
else:
    assignments_list = assignments.get('data', [])

print(f"\n📊 נמצאו {len(assignments_list)} מטלות:")
for i, assignment in enumerate(assignments_list, 1):
    print(f"\n{i}. {assignment.get('title', 'ללא כותרת')}")
    print(f"   ID: {assignment.get('id')}")
    print(f"   משקל: {assignment.get('weight', 'N/A')}")
    print(f"   ציון מקסימלי: {assignment.get('max_score', 'N/A')}")

with open('/home/user/-updateLMS/assignments_6942ae4a.json', 'w', encoding='utf-8') as f:
    json.dump(assignments_list, f, ensure_ascii=False, indent=2)

# 4. קבל את כל החומרים
print("\n🔍 שלב 4: קריאת חומרים...")
time.sleep(1)
materials = make_api_request(f'apps/{APP_ID}/entities/Material', data={'course_id': COURSE_ID})

if isinstance(materials, list):
    materials_list = materials
else:
    materials_list = materials.get('data', [])

print(f"\n📊 נמצאו {len(materials_list)} חומרים:")
for i, material in enumerate(materials_list[:10], 1):  # הצג רק 10 ראשונים
    print(f"\n{i}. {material.get('title', 'ללא כותרת')}")
    print(f"   ID: {material.get('id')}")
    print(f"   סוג: {material.get('type', 'N/A')}")

with open('/home/user/-updateLMS/materials_6942ae4a.json', 'w', encoding='utf-8') as f:
    json.dump(materials_list, f, ensure_ascii=False, indent=2)

print("\n" + "=" * 100)
print("✅ ניתוח הושלם!")
print("=" * 100)
print(f"\n📁 קבצים שנוצרו:")
print("   • course_6942ae4a_full.json - פרטי הקורס המלאים")
print(f"   • sessions_6942ae4a.json - {len(sessions_list)} סשנים")
print(f"   • assignments_6942ae4a.json - {len(assignments_list)} מטלות")
print(f"   • materials_6942ae4a.json - {len(materials_list)} חומרים")
