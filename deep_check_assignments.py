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
print("🔍 בדיקת עומק: כל המטלות בקורס")
print("=" * 100)

# Get all assignments
assignments_data = make_api_request(f'apps/{APP_ID}/entities/Assignment')
assignments = assignments_data if isinstance(assignments_data, list) else []

course_assignments = [a for a in assignments if a.get('course_id') == course_id]

print(f"\n📋 נמצאו {len(course_assignments)} מטלות בקורס\n")

# Analyze each assignment
for i, assignment in enumerate(course_assignments, 1):
    assignment_id = assignment.get('id', 'N/A')
    title = assignment.get('title', 'N/A')[:50]
    
    # Key concepts analysis
    key_concepts = assignment.get('key_concepts', [])
    concepts_count = len(key_concepts)
    
    # Related competencies analysis
    related_competencies = assignment.get('related_competencies', [])
    competencies_count = len(related_competencies)
    
    # Resource links
    resource_links = assignment.get('resource_links', [])
    links_count = len(resource_links)
    
    print(f"{i}. {title}")
    print(f"   ID: {assignment_id}")
    print(f"   📚 מושגים: {concepts_count} | 🎯 קומפטנסיות: {competencies_count} | 🔗 קישורים: {links_count}")
    
    # Show concepts if any
    if key_concepts:
        for concept in key_concepts[:2]:
            if isinstance(concept, dict):
                term = concept.get('term', '?')
                definition = concept.get('definition', '?')[:40]
                print(f"      • {term}: {definition}...")
    
    print()

print("=" * 100)
print(f"סיכום: {len(course_assignments)} מטלות בדוקות")
print("=" * 100)
