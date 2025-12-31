import requests
import json

API_KEY = 'c0ce546b5661436dacb7a2060b10c9a5'
APP_ID = '693824c5c1ad33c1f114ebd2'

headers = {'api_key': API_KEY}
url = f'https://app.base44.com/api/apps/{APP_ID}/entities/Assignment/69414e30eb899ca912353c2b'

response = requests.get(url, headers=headers)
assignment = response.json()

print(json.dumps(assignment, indent=2, ensure_ascii=False))
