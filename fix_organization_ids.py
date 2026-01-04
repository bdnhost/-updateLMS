#!/usr/bin/env python3
"""
מעדכן את organization_id של כל הרשומות לארגון הנכון
"""

import requests
import json
import os

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

# ה-organization_id הנכון - ארגון BdnHosT (adnanfadelisrael@gmail.com)
CORRECT_ORG_ID = "69391901350762829f9a50b1"

print("="*80)
print("🔧 עדכון Organization ID לכל הרשומות")
print("="*80)
print(f"Organization ID היעד: {CORRECT_ORG_ID} (BdnHosT - adnanfadelisrael@gmail.com)")
print()

def get_all_records_no_filter(entity_name, page_size=100):
    """מקבל את כל הרשומות ללא פילטר"""
    all_records = []
    skip = 0

    while True:
        # שימוש ב-API ישיר בלי SDK כדי לעקוף את הפילטר
        url = f"https://app.base44.com/api/apps/{BASE44_APP_ID}/data/{entity_name}"
        headers = {
            "Authorization": f"Bearer {BASE44_API_KEY}",
            "Content-Type": "application/json"
        }

        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            print(f"❌ שגיאה: {response.status_code}")
            print(f"   URL: {url}")
            print(f"   Response: {response.text}")
            break

        data = response.json()
        records = data if isinstance(data, list) else data.get('data', [])

        if not records:
            break

        all_records.extend(records)

        if len(records) < page_size:
            break

        skip += page_size

    return all_records

def update_organization_id(entity_name, record_id, new_org_id):
    """מעדכן organization_id של רשומה"""
    url = f"{BASE_URL}/{entity_name}/{record_id}"
    data = {"organization_id": new_org_id}

    response = requests.put(url, headers=HEADERS, json=data)
    return response.status_code == 200

def fix_entity(entity_name):
    """מתקן organization_id בישות"""
    print(f"\n📊 מטפל ב-{entity_name}...")

    # קבל את כל הרשומות דרך ה-API הרגיל
    url = f"{BASE_URL}/{entity_name}?limit=1000"
    response = requests.get(url, headers=HEADERS)

    if response.status_code != 200:
        print(f"   ❌ שגיאה בקבלת רשומות: {response.status_code}")
        return

    records = response.json()
    if isinstance(records, dict):
        records = records.get('data', [])

    print(f"   נמצאו {len(records)} רשומות עם הגישה הנוכחית")

    # ספור כמה רשומות צריכות עדכון
    needs_update = []
    for record in records:
        org_id = record.get('organization_id')
        if org_id and org_id != CORRECT_ORG_ID:
            needs_update.append(record)

    if not needs_update:
        print(f"   ✓ כל הרשומות כבר עם organization_id נכון!")
        return

    print(f"   נמצאו {len(needs_update)} רשומות שצריכות עדכון")

    # שאל אישור
    response = input(f"   האם לעדכן את {len(needs_update)} הרשומות? (y/n): ")
    if response.lower() != 'y':
        print("   דולג...")
        return

    # עדכן
    success_count = 0
    for record in needs_update:
        record_id = record.get('id') or record.get('_id')
        old_org_id = record.get('organization_id', 'N/A')

        if update_organization_id(entity_name, record_id, CORRECT_ORG_ID):
            success_count += 1
            print(f"   ✓ עודכן: {record.get('name', record.get('title', record_id)[:20])}")
        else:
            print(f"   ❌ נכשל: {record_id}")

    print(f"   סיכום: {success_count}/{len(needs_update)} רשומות עודכנו בהצלחה")

# Main
print("⚠️  שים לב: הסקריפט הזה יעדכן את organization_id של כל הרשומות")
print(f"   לארגון: BdnHosT (adnanfadelisrael@gmail.com)")
print(f"   Organization ID: {CORRECT_ORG_ID}")
print()

entities_to_fix = ['Course', 'CourseSession', 'Assignment', 'Material']

for entity in entities_to_fix:
    fix_entity(entity)

print("\n" + "="*80)
print("✓ סיימנו!")
print("="*80)
print("\nכעת רענן את הדפדפן ובדוק שכל הקורסים/מטלות/חומרים מופיעים.")
