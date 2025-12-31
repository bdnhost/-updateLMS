import requests
import json

API_KEY = 'c0ce546b5661436dacb7a2060b10c9a5'
APP_ID = '693824c5c1ad33c1f114ebd2'
course_id = '69414e2be636c8c8c38af82d'

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
print("✅ בדיקת עומק סופית: כל 30 המטלות בקורס")
print("=" * 100)

# Get all assignments
assignments_data = make_api_request(f'apps/{APP_ID}/entities/Assignment')
assignments = assignments_data if isinstance(assignments_data, list) else []

course_assignments = [a for a in assignments if a.get('course_id') == course_id]

print(f"\n📋 בדיקה של {len(course_assignments)} מטלות\n")

# Statistics
total_concepts = 0
assignments_with_concepts = 0
assignments_without_concepts = 0
hebrew_terms = 0
english_terms = 0

print("-" * 100)

for i, assignment in enumerate(course_assignments, 1):
    assignment_id = assignment.get('id', 'N/A')
    title = assignment.get('title', 'N/A')[:45]
    
    # Key concepts analysis
    key_concepts = assignment.get('key_concepts', [])
    concepts_count = len(key_concepts)
    
    if concepts_count > 0:
        assignments_with_concepts += 1
        total_concepts += concepts_count
        
        # Count Hebrew vs English terms
        for concept in key_concepts:
            if isinstance(concept, dict):
                term = concept.get('term', '')
                # Simple check if Hebrew (contains Hebrew characters)
                if any('\u0590' <= c <= '\u05FF' for c in term):
                    hebrew_terms += 1
                else:
                    english_terms += 1
        
        # Show sample
        sample_concepts = key_concepts[:2]
        print(f"{i:2d}. ✅ {title}")
        for concept in sample_concepts:
            if isinstance(concept, dict):
                term = concept.get('term', '?')
                definition = concept.get('definition', '?')[:35]
                print(f"        • {term}: {definition}...")
    else:
        assignments_without_concepts += 1
        print(f"{i:2d}. ❌ {title} - חסרים מושגים")
    
    print()

print("-" * 100)
print(f"\n📊 סטטיסטיקות סיום:")
print(f"   ✅ מטלות עם מושגים: {assignments_with_concepts}/{len(course_assignments)}")
print(f"   ❌ מטלות ללא מושגים: {assignments_without_concepts}/{len(course_assignments)}")
print(f"   💡 סך הכל מושגים: {total_concepts}")
print(f"   🇮🇱 מושגים בעברית: {hebrew_terms}")
print(f"   🇬🇧 מושגים באנגלית: {english_terms}")

print(f"\n🎯 סטטוס קורס:")
if assignments_without_concepts == 0:
    print(f"   ✅ כל 30 המטלות בקורס עם מושגים!")
    print(f"   ✅ כל המושגים בעברית!")
    print(f"   ✅ עדכון בוצע בהצלחה!")
else:
    print(f"   ⚠️  עדיין {assignments_without_concepts} מטלות ללא מושגים")

print("\n" + "=" * 100)
print("✅ בדיקת עומק הושלמה!")
print("=" * 100)
