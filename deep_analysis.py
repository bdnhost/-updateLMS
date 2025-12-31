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

# IDs
assignment_id = "69414e30eb899ca912353c2b"
course_id = "69414e2be636c8c8c38af82d"

print("=" * 80)
print("🔬 חקירה עמוקה של המטלה - DEEP ANALYSIS")
print("=" * 80)

# Get current assignment
try:
    assignment = make_api_request(f'apps/{APP_ID}/entities/Assignment/{assignment_id}')
    print("\n📋 שדות קיימים במטלה:")
    for key, value in assignment.items():
        if not isinstance(value, (dict, list)):
            print(f"  • {key}: {value}")
    
    print("\n🔗 שדות מורכבים:")
    print(f"  • key_concepts: {len(assignment.get('key_concepts', []))} מושגים")
    print(f"  • related_competencies: {assignment.get('related_competencies', [])}")
    print(f"  • resource_links: {assignment.get('resource_links', [])}")
    print(f"  • related_material_ids: {assignment.get('related_material_ids', [])}")
    
except Exception as e:
    print(f"❌ שגיאה: {e}")

print("\n" + "=" * 80)
print("📚 קבלת חומרים קשורים")
print("=" * 80)

# Get related materials
try:
    material_ids = assignment.get('related_material_ids', [])
    for mat_id in material_ids:
        material = make_api_request(f'apps/{APP_ID}/entities/Material/{mat_id}')
        print(f"\n📄 חומר: {material.get('title', 'Unknown')}")
        print(f"   תיאור: {material.get('description', '')[:100]}...")
except Exception as e:
    print(f"❌ שגיאה בקריאת חומרים: {e}")
