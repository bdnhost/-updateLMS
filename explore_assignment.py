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

# Get Course details
print("=" * 60)
print("📚 קורס - COURSE DETAILS")
print("=" * 60)
course_id = "69414e2be636c8c8c38af82d"
try:
    course = make_api_request(f'apps/{APP_ID}/entities/Course/{course_id}')
    print(json.dumps(course, indent=2, ensure_ascii=False))
except Exception as e:
    print(f"❌ שגיאה בקריאת קורס: {e}")

print("\n" + "=" * 60)
print("📝 מטלה - ASSIGNMENT DETAILS")
print("=" * 60)
assignment_id = "69414e30eb899ca912353c2b"
try:
    assignment = make_api_request(f'apps/{APP_ID}/entities/Assignment/{assignment_id}')
    print(json.dumps(assignment, indent=2, ensure_ascii=False))
except Exception as e:
    print(f"❌ שגיאה בקריאת מטלה: {e}")

print("\n" + "=" * 60)
print("🔗 חומרים הקשורים למטלה - ASSIGNMENT MATERIALS")
print("=" * 60)
try:
    # Get all assignment materials to find ones related to this assignment
    materials_response = make_api_request(f'apps/{APP_ID}/entities/AssignmentMaterial')
    # materials_response might be a list directly
    materials = materials_response if isinstance(materials_response, list) else materials_response.get('data', [])
    assignment_materials = [m for m in materials if m.get('assignment_id') == assignment_id]
    print(f"מצאתי {len(assignment_materials)} חומרים קשורים:")
    print(json.dumps(assignment_materials, indent=2, ensure_ascii=False))
except Exception as e:
    print(f"❌ שגיאה בקריאת חומרים: {e}")
