#!/usr/bin/env python3
"""
מעדכן organization_id לכל הרשומות - גרסה עם גישה ישירה לכל הנתונים
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

# ה-organization_id היעד - BdnHosT (adnanfadelisrael@gmail.com)
TARGET_ORG_ID = "69391901350762829f9a50b1"

print("="*80)
print("🔧 עדכון Organization ID - גרסה מתקדמת")
print("="*80)
print(f"ארגון יעד: BdnHosT (adnanfadelisrael@gmail.com)")
print(f"Organization ID: {TARGET_ORG_ID}")
print()

def update_all_records_to_org(entity_name):
    """מעדכן את כל הרשומות של entity לארגון היעד"""
    print(f"\n{'='*80}")
    print(f"📊 מטפל ב-{entity_name}")
    print(f"{'='*80}")

    # נסה מספר endpoints שונים
    endpoints = [
        f"https://app.base44.com/api/apps/{BASE44_APP_ID}/entities/{entity_name}",
        f"https://app.base44.com/api/apps/{BASE44_APP_ID}/data/{entity_name}",
    ]

    headers_variants = [
        {
            "api_key": BASE44_API_KEY,
            "Content-Type": "application/json"
        },
        {
            "Authorization": f"Bearer {BASE44_API_KEY}",
            "Content-Type": "application/json"
        }
    ]

    all_records = []

    # נסה כל צירוף של endpoint ו-headers
    for endpoint in endpoints:
        for headers in headers_variants:
            try:
                print(f"   🔍 מנסה: {endpoint.split('/')[-2]}/{endpoint.split('/')[-1]}...")
                response = requests.get(f"{endpoint}?limit=1000", headers=headers)

                if response.status_code == 200:
                    data = response.json()
                    records = data if isinstance(data, list) else data.get('data', [])

                    if len(records) > len(all_records):
                        all_records = records
                        print(f"   ✓ נמצאו {len(records)} רשומות!")
                        break

            except Exception as e:
                continue

        if all_records:
            break

    if not all_records:
        print(f"   ⚠️  לא נמצאו רשומות (אולי אין כאלה)")
        return 0

    print(f"\n   סה\"כ רשומות שנמצאו: {len(all_records)}")

    # ספור כמה צריכות עדכון
    needs_update = []
    already_correct = []

    for record in all_records:
        org_id = record.get('organization_id')
        if org_id != TARGET_ORG_ID:
            needs_update.append(record)
        else:
            already_correct.append(record)

    print(f"   • כבר נכונות: {len(already_correct)}")
    print(f"   • צריכות עדכון: {len(needs_update)}")

    if not needs_update:
        print(f"   ✓ כל הרשומות כבר עם organization_id נכון!")
        return 0

    # הצג דוגמאות
    print(f"\n   דוגמאות לרשומות שיעודכנו:")
    for record in needs_update[:5]:
        name = record.get('name') or record.get('title', 'N/A')
        old_org = record.get('organization_id', 'N/A')
        print(f"      - {name[:50]}")
        print(f"        organization_id: {old_org[:20]}... → {TARGET_ORG_ID[:20]}...")

    if len(needs_update) > 5:
        print(f"      ... ועוד {len(needs_update) - 5} רשומות")

    # שאל אישור
    print()
    response = input(f"   ❓ האם לעדכן את {len(needs_update)} הרשומות? (yes/no): ")
    if response.lower() not in ['yes', 'y', 'כן']:
        print("   ⏭️  דולג...")
        return 0

    # עדכן
    print(f"\n   🔄 מעדכן...")
    success_count = 0
    fail_count = 0

    update_url = f"https://app.base44.com/api/apps/{BASE44_APP_ID}/entities/{entity_name}"
    update_headers = {
        "api_key": BASE44_API_KEY,
        "Content-Type": "application/json"
    }

    for i, record in enumerate(needs_update, 1):
        record_id = record.get('id') or record.get('_id')
        name = record.get('name') or record.get('title', record_id[:8])

        try:
            url = f"{update_url}/{record_id}"
            data = {"organization_id": TARGET_ORG_ID}

            resp = requests.put(url, headers=update_headers, json=data)

            if resp.status_code in [200, 204]:
                success_count += 1
                if i % 10 == 0:
                    print(f"      ✓ {i}/{len(needs_update)} - {name[:40]}")
            else:
                fail_count += 1
                print(f"      ❌ שגיאה ({resp.status_code}): {name[:40]}")

        except Exception as e:
            fail_count += 1
            print(f"      ❌ Exception: {name[:40]} - {str(e)[:50]}")

    print(f"\n   {'='*60}")
    print(f"   ✅ סיכום עבור {entity_name}:")
    print(f"      • הצלחות: {success_count}")
    print(f"      • כשלונות: {fail_count}")
    print(f"      • סה\"כ: {success_count + fail_count}")
    print(f"   {'='*60}")

    return success_count

# Main
print("⚠️  שים לב:")
print("   הסקריפט הזה ינסה למצוא ולעדכן את כל הרשומות")
print("   בכל הארגונים ולהעביר אותן לארגון BdnHosT")
print()

entities_to_fix = ['Course', 'CourseSession', 'Assignment', 'Material']

total_updated = {}

for entity in entities_to_fix:
    updated = update_all_records_to_org(entity)
    total_updated[entity] = updated

# סיכום סופי
print("\n" + "="*80)
print("🎉 סיכום סופי")
print("="*80)

for entity, count in total_updated.items():
    print(f"   {entity:<20} {count} רשומות עודכנו")

print()
print("✓ סיימנו!")
print()
print("כעת:")
print("   1. התחבר למערכת עם adnanfadelisrael@gmail.com")
print("   2. רענן את הדפדפן")
print("   3. בדוק שכל הקורסים/מטלות/מפגשים/חומרים מופיעים")
print()
