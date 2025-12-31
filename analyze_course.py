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

course_id = "69414e2be636c8c8c38af82d"

print("=" * 100)
print("🔍 ניתוח הקורס - מצב נוכחי")
print("=" * 100)

# Get Course
try:
    course = make_api_request(f'apps/{APP_ID}/entities/Course/{course_id}')
    
    print(f"\n📖 קורס: {course.get('name')}")
    print(f"   קוד: {course.get('code')}")
    print(f"   תיאור קיים: {course.get('description', 'אין')[:100]}...")
    print(f"   סמסטר: {course.get('semester')}")
    print(f"   סשנים: {course.get('total_sessions')}")
    
except Exception as e:
    print(f"❌ שגיאה בקריאת קורס: {e}")

# Get all CourseSession
print("\n" + "-" * 100)
print("📅 סשנים בקורס:")
print("-" * 100)

try:
    sessions = make_api_request(f'apps/{APP_ID}/entities/CourseSession')
    
    if isinstance(sessions, list):
        sessions_list = sessions
    else:
        sessions_list = sessions.get('data', []) if isinstance(sessions, dict) else []
    
    # Filter by course
    course_sessions = [s for s in sessions_list if s.get('course_id') == course_id]
    
    print(f"\nנמצאו {len(course_sessions)} סשנים:")
    for i, session in enumerate(sorted(course_sessions, key=lambda x: x.get('session_number', 0)), 1):
        print(f"  {i}. {session.get('title')} (סשן {session.get('session_number')})")
        print(f"     ID: {session.get('id')}")
        print(f"     תאריך: {session.get('date')}")
        print(f"     משך: {session.get('duration_hours')} שעות")
        
except Exception as e:
    print(f"❌ שגיאה בקריאת סשנים: {e}")

# Get all Assignments
print("\n" + "-" * 100)
print("📝 מטלות בקורס:")
print("-" * 100)

try:
    assignments = make_api_request(f'apps/{APP_ID}/entities/Assignment')
    
    if isinstance(assignments, list):
        assignments_list = assignments
    else:
        assignments_list = assignments.get('data', []) if isinstance(assignments, dict) else []
    
    # Filter by course
    course_assignments = [a for a in assignments_list if a.get('course_id') == course_id]
    
    print(f"\nנמצאו {len(course_assignments)} מטלות:")
    for i, assignment in enumerate(course_assignments, 1):
        print(f"  {i}. {assignment.get('title')}")
        print(f"     ID: {assignment.get('id')}")
        print(f"     משקל: {assignment.get('weight')}")
        print(f"     תאריך גמר: {assignment.get('due_date')}")
        
except Exception as e:
    print(f"❌ שגיאה בקריאת מטלות: {e}")

# Get all Materials
print("\n" + "-" * 100)
print("📄 חומרי לימוד בקורס:")
print("-" * 100)

try:
    materials = make_api_request(f'apps/{APP_ID}/entities/Material')
    
    if isinstance(materials, list):
        materials_list = materials
    else:
        materials_list = materials.get('data', []) if isinstance(materials, dict) else []
    
    # Filter by course
    course_materials = [m for m in materials_list if m.get('course_id') == course_id]
    
    print(f"\nנמצאו {len(course_materials)} חומרים:")
    by_topic = {}
    for material in course_materials:
        topic = material.get('topic') or 'אין נושא'
        if topic not in by_topic:
            by_topic[topic] = []
        by_topic[topic].append(material)
    
    for topic, items in by_topic.items():
        print(f"\n  📌 {topic}: {len(items)} חומרים")
        for item in items[:2]:  # הראה שניים ראשונים
            print(f"     • {item.get('title')}")
        if len(items) > 2:
            print(f"     ... ועוד {len(items)-2}")
        
except Exception as e:
    print(f"❌ שגיאה בקריאת חומרים: {e}")

print("\n" + "=" * 100)
print("✅ סיום ניתוח - מוכנים לעדכון!") 
print("=" * 100)
