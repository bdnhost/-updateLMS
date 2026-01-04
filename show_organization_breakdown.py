#!/usr/bin/env python3
"""
מציג פירוט של רשומות לפי ארגון
"""

import requests
import json
import os
from collections import defaultdict

# טען את משתני הסביבה מקובץ .env
def load_env_file():
    env_vars = {}
    env_file = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
    return env_vars

env_vars = load_env_file()
BASE44_APP_ID = env_vars.get('BASE44_APP_ID')
BASE44_API_KEY = env_vars.get('BASE44_API_KEY')

BASE_URL = f"https://app.base44.com/api/apps/{BASE44_APP_ID}/entities"
HEADERS = {
    "api_key": BASE44_API_KEY,
    "Content-Type": "application/json"
}

print("="*80)
print("📊 פירוט רשומות לפי ארגון")
print("="*80)
print()

# קבל את כל הארגונים
print("🔍 טוען רשימת ארגונים...")
response = requests.get(f"{BASE_URL}/Organization", headers=HEADERS)
organizations = response.json()
if isinstance(organizations, dict):
    organizations = organizations.get('data', [])

print(f"✓ נמצאו {len(organizations)} ארגונים\n")

# מיפוי של organization_id לשם
org_map = {}
for org in organizations:
    org_id = org.get('id') or org.get('_id')
    org_name = org.get('name', 'Unknown')
    org_map[org_id] = org_name

# קבל את כל הרשומות של כל טיפוס
entities = ['Course', 'CourseSession', 'Assignment', 'Material']
entity_data = {}

for entity_name in entities:
    print(f"🔍 טוען {entity_name}...")
    response = requests.get(f"{BASE_URL}/{entity_name}?limit=1000", headers=HEADERS)
    records = response.json()
    if isinstance(records, dict):
        records = records.get('data', [])
    entity_data[entity_name] = records
    print(f"   ✓ נמצאו {len(records)} רשומות\n")

# חשב סטטיסטיקות לפי ארגון
stats_by_org = defaultdict(lambda: defaultdict(list))

for entity_name, records in entity_data.items():
    for record in records:
        org_id = record.get('organization_id', 'NO_ORG')
        org_name = org_map.get(org_id, f'Unknown ({org_id[:8]}...)')

        # שמור את הרשומה
        item_name = record.get('name') or record.get('title', f"ID: {record.get('id', 'N/A')[:8]}")
        stats_by_org[org_name][entity_name].append({
            'id': record.get('id'),
            'name': item_name,
            'org_id': org_id
        })

# הצג את התוצאות
print("\n" + "="*80)
print("📊 סיכום לפי ארגון")
print("="*80)

for org_name in sorted(stats_by_org.keys()):
    print(f"\n🏢 {org_name}")
    print("-" * 80)

    org_stats = stats_by_org[org_name]

    # סיכום מספרי
    print(f"   סה\"כ:")
    for entity_name in entities:
        count = len(org_stats.get(entity_name, []))
        if count > 0:
            print(f"   • {entity_name}: {count}")

    # פירוט קורסים
    if 'Course' in org_stats and org_stats['Course']:
        print(f"\n   📚 קורסים ({len(org_stats['Course'])}):")
        for course in org_stats['Course']:
            print(f"      - {course['name']}")

    # פירוט מטלות
    if 'Assignment' in org_stats and org_stats['Assignment']:
        print(f"\n   📝 מטלות ({len(org_stats['Assignment'])}):")
        for assignment in sorted(org_stats['Assignment'], key=lambda x: x['name'])[:10]:
            print(f"      - {assignment['name']}")
        if len(org_stats['Assignment']) > 10:
            print(f"      ... ועוד {len(org_stats['Assignment']) - 10}")

# סיכום כללי
print("\n" + "="*80)
print("📈 סיכום כללי")
print("="*80)

total_counts = defaultdict(int)
for org_name, org_stats in stats_by_org.items():
    for entity_name in entities:
        total_counts[entity_name] += len(org_stats.get(entity_name, []))

print(f"\n{'ארגון':<30} {'Courses':<12} {'Sessions':<12} {'Assignments':<15} {'Materials':<12}")
print("-" * 80)

for org_name in sorted(stats_by_org.keys()):
    org_stats = stats_by_org[org_name]
    courses = len(org_stats.get('Course', []))
    sessions = len(org_stats.get('CourseSession', []))
    assignments = len(org_stats.get('Assignment', []))
    materials = len(org_stats.get('Material', []))

    print(f"{org_name:<30} {courses:<12} {sessions:<12} {assignments:<15} {materials:<12}")

print("-" * 80)
print(f"{'סה\"כ':<30} {total_counts['Course']:<12} {total_counts['CourseSession']:<12} "
      f"{total_counts['Assignment']:<15} {total_counts['Material']:<12}")

# שמור תוצאות
output = {
    'organizations': org_map,
    'breakdown': {org: dict(stats) for org, stats in stats_by_org.items()},
    'totals': dict(total_counts)
}

with open('organization_breakdown.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n✓ התוצאות נשמרו ל-organization_breakdown.json")
