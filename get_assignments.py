import requests

API_KEY = 'c0ce546b5661436dacb7a2060b10c9a5'
APP_ID = '693824c5c1ad33c1f114ebd2'
course_id = '69414e2be636c8c8c38af82d'

headers = {'api_key': API_KEY}
r = requests.get(f'https://app.base44.com/api/apps/{APP_ID}/entities/Assignment', headers=headers)
data = r.json()
assignments = data if isinstance(data, list) else data.get('result', [])

course_assignments = [a for a in assignments if a.get('course_id') == course_id]
print(f'מטלות בקורס: {len(course_assignments)}\n')

for i, a in enumerate(course_assignments, 1):
    assignment_id = a.get('id') or a.get('_id') or 'UNKNOWN'
    print(f'{i}. ID: {assignment_id}')
    print(f'   Title: {a.get("title", "N/A")[:60]}')
    print(f'   Type: {a.get("type", "N/A")}')
    print()
