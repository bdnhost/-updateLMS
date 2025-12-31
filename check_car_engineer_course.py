import requests
import json

API_KEY = 'c0ce546b5661436dacb7a2060b10c9a5'
APP_ID = '693824c5c1ad33c1f114ebd2'
course_id = '6942ae4afed1bf7040557a50'

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

print("=" * 100)
print("🔍 בדיקה ראשונית: קורס AI להנדסאי רכב")
print("=" * 100)

# Get course data
try:
    course_data = make_api_request(f'apps/{APP_ID}/entities/Course')
    courses = course_data if isinstance(course_data, list) else []
    
    course = next((c for c in courses if c.get('id') == course_id), None)
    
    if course:
        print(f"\n📚 קורס: {course.get('title', 'N/A')}")
        print(f"   ID: {course_id}")
        print(f"   תיאור קיים: {len(course.get('description', '')) > 0}")
        print(f"   תוכן: {course.get('description', '')[:100]}...")
    else:
        print(f"❌ לא נמצא קורס עם ID: {course_id}")
        
except Exception as e:
    print(f"❌ שגיאה בטעינת קורס: {e}")

# Get sessions
try:
    sessions_data = make_api_request(f'apps/{APP_ID}/entities/CourseSession')
    all_sessions = sessions_data if isinstance(sessions_data, list) else []
    
    course_sessions = [s for s in all_sessions if s.get('course_id') == course_id]
    print(f"\n📅 סשנים (Sessions): {len(course_sessions)}")
    
    for i, session in enumerate(course_sessions[:5], 1):
        print(f"   {i}. {session.get('title', 'N/A')[:40]}")
    
    if len(course_sessions) > 5:
        print(f"   ... ו{len(course_sessions) - 5} עוד")
        
except Exception as e:
    print(f"⚠️ שגיאה בטעינת סשנים: {e}")

# Get assignments
try:
    assignments_data = make_api_request(f'apps/{APP_ID}/entities/Assignment')
    all_assignments = assignments_data if isinstance(assignments_data, list) else []
    
    course_assignments = [a for a in all_assignments if a.get('course_id') == course_id]
    print(f"\n📝 מטלות (Assignments): {len(course_assignments)}")
    
    for i, assignment in enumerate(course_assignments[:5], 1):
        concepts = len(assignment.get('key_concepts', []))
        print(f"   {i}. {assignment.get('title', 'N/A')[:40]} ({concepts} concepts)")
    
    if len(course_assignments) > 5:
        print(f"   ... ו{len(course_assignments) - 5} עוד")
        
except Exception as e:
    print(f"⚠️ שגיאה בטעינת מטלות: {e}")

# Get materials
try:
    materials_data = make_api_request(f'apps/{APP_ID}/entities/Material')
    all_materials = materials_data if isinstance(materials_data, list) else []
    
    course_materials = [m for m in all_materials if m.get('course_id') == course_id]
    print(f"\n📖 חומרים (Materials): {len(course_materials)}")
    
    for i, material in enumerate(course_materials[:5], 1):
        links = len(material.get('resource_links', []))
        print(f"   {i}. {material.get('title', 'N/A')[:40]} ({links} links)")
    
    if len(course_materials) > 5:
        print(f"   ... ו{len(course_materials) - 5} עוד")
        
except Exception as e:
    print(f"⚠️ שגיאה בטעינת חומרים: {e}")

print(f"\n" + "=" * 100)
print("📊 סיכום:")
print(f"   • קורס: בדוק")
print(f"   • סשנים: {len(course_sessions) if 'course_sessions' in locals() else '?'}")
print(f"   • מטלות: {len(course_assignments) if 'course_assignments' in locals() else '?'}")
print(f"   • חומרים: {len(course_materials) if 'course_materials' in locals() else '?'}")
print("=" * 100)
