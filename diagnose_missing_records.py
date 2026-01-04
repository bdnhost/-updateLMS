#!/usr/bin/env python3
"""
סקריפט דיאגנוסטיקה למציאת רשומות חסרות ב-API
בודק למה יש פחות רשומות ב-API מאשר בטבלת Base44
"""

import requests
import json
from collections import defaultdict
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

if not BASE44_APP_ID or not BASE44_API_KEY:
    print("❌ חסרים BASE44_APP_ID או BASE44_API_KEY בקובץ .env")
    exit(1)

BASE_URL = f"https://app.base44.com/api/apps/{BASE44_APP_ID}/entities"
HEADERS = {
    "api_key": BASE44_API_KEY,
    "Content-Type": "application/json"
}

def get_all_records(entity_name, page_size=100):
    """מקבל את כל הרשומות מישות מסוימת"""
    all_records = []
    skip = 0

    while True:
        url = f"{BASE_URL}/{entity_name}?limit={page_size}&skip={skip}"
        response = requests.get(url, headers=HEADERS)

        if response.status_code != 200:
            print(f"❌ שגיאה בקבלת {entity_name}: {response.status_code}")
            print(f"   תגובה: {response.text}")
            break

        data = response.json()

        # Handle both list and object responses
        if isinstance(data, list):
            records = data
        elif isinstance(data, dict):
            records = data.get('data', [])
        else:
            records = []

        if not records:
            break

        all_records.extend(records)
        skip += page_size

        # אם קיבלנו פחות מהגודל המבוקש, זה הסוף
        if len(records) < page_size:
            break

    return all_records

def analyze_entity(entity_name, expected_count):
    """מנתח ישות ומחזיר דוח מפורט"""
    print(f"\n{'='*80}")
    print(f"📊 מנתח: {entity_name}")
    print(f"{'='*80}")

    records = get_all_records(entity_name)
    actual_count = len(records)

    print(f"✓ סך הכל רשומות שהתקבלו: {actual_count}")
    print(f"✓ רשומות צפויות (לפי הטבלה): {expected_count}")
    print(f"✓ הפרש: {expected_count - actual_count} רשומות חסרות")

    if actual_count == 0:
        print("⚠️  לא נמצאו רשומות כלל!")
        return

    # נתח לפי שדות נפוצים
    analysis = {
        'deleted': defaultdict(int),
        'archived': defaultdict(int),
        'status': defaultdict(int),
        'is_active': defaultdict(int),
        'organization': defaultdict(int),
    }

    sample_record = None

    for record in records:
        if sample_record is None:
            sample_record = record

        # בדוק שדות נפוצים
        if 'deleted' in record:
            analysis['deleted'][record.get('deleted')] += 1
        if 'archived' in record:
            analysis['archived'][record.get('archived')] += 1
        if 'status' in record:
            analysis['status'][record.get('status')] += 1
        if 'is_active' in record:
            analysis['is_active'][record.get('is_active')] += 1
        if 'organization' in record:
            org = record.get('organization', {})
            if isinstance(org, dict):
                org_id = org.get('_id', 'N/A')
            else:
                org_id = org
            analysis['organization'][org_id] += 1

    # הצג דוח
    print(f"\n📋 ניתוח שדות:")

    for field_name, counts in analysis.items():
        if counts:
            print(f"\n  {field_name}:")
            for value, count in sorted(counts.items(), key=lambda x: x[1], reverse=True):
                percentage = (count / actual_count) * 100
                print(f"    {value}: {count} ({percentage:.1f}%)")

    # הצג דוגמה לרשומה
    print(f"\n🔍 דוגמה לרשומה ראשונה:")
    print(f"   ID: {sample_record.get('_id', 'N/A')}")

    # הצג שדות חשובים
    important_fields = ['title', 'name', 'deleted', 'archived', 'status', 'is_active',
                       'created_at', 'updated_at', 'organization']
    for field in important_fields:
        if field in sample_record:
            value = sample_record[field]
            if isinstance(value, dict):
                value = f"{{...}} (dict)"
            print(f"   {field}: {value}")

    # הצג את כל השדות הזמינים
    print(f"\n📝 כל השדות הזמינים ברשומה:")
    print(f"   {', '.join(sorted(sample_record.keys()))}")

    return {
        'entity': entity_name,
        'expected': expected_count,
        'actual': actual_count,
        'missing': expected_count - actual_count,
        'analysis': analysis,
        'sample': sample_record
    }

def main():
    print("="*80)
    print("🔍 סקריפט דיאגנוסטיקה - בדיקת רשומות חסרות")
    print("="*80)
    print(f"App ID: {BASE44_APP_ID}")
    print(f"API URL: {BASE_URL}")

    # הגדרות לפי הטבלה שסיפקת
    entities = {
        'Course': 55,
        'CourseSession': 77,
        'Assignment': 74,
        'Material': 371,
    }

    results = {}

    for entity_name, expected_count in entities.items():
        result = analyze_entity(entity_name, expected_count)
        if result:
            results[entity_name] = result

    # סיכום כולל
    print(f"\n{'='*80}")
    print("📊 סיכום כולל")
    print(f"{'='*80}\n")

    print(f"{'ישות':<20} {'צפוי':<10} {'התקבל':<10} {'חסר':<10} {'%':<10}")
    print("-" * 60)

    for entity_name, result in results.items():
        percentage = (result['actual'] / result['expected'] * 100) if result['expected'] > 0 else 0
        print(f"{entity_name:<20} {result['expected']:<10} {result['actual']:<10} "
              f"{result['missing']:<10} {percentage:.1f}%")

    # המלצות
    print(f"\n{'='*80}")
    print("💡 המלצות לפתרון")
    print(f"{'='*80}\n")

    recommendations = []

    for entity_name, result in results.items():
        if result['missing'] > 0:
            # בדוק אם יש רשומות deleted
            if 'deleted' in result['analysis'] and True in result['analysis']['deleted']:
                deleted_count = result['analysis']['deleted'][True]
                recommendations.append(
                    f"• {entity_name}: יש {deleted_count} רשומות מסומנות כ-deleted. "
                    f"ייתכן שהקוד מסנן אותן."
                )

            # בדוק אם יש רשומות archived
            if 'archived' in result['analysis'] and True in result['analysis']['archived']:
                archived_count = result['analysis']['archived'][True]
                recommendations.append(
                    f"• {entity_name}: יש {archived_count} רשומות מסומנות כ-archived. "
                    f"ייתכן שהקוד מסנן אותן."
                )

            # בדוק אם יש מספר ארגונים
            if 'organization' in result['analysis'] and len(result['analysis']['organization']) > 1:
                orgs = result['analysis']['organization']
                recommendations.append(
                    f"• {entity_name}: יש {len(orgs)} ארגונים שונים. "
                    f"ייתכן שהקוד מסנן לפי ארגון מסוים."
                )

    if recommendations:
        for rec in recommendations:
            print(rec)
    else:
        print("• לא נמצאו סינונים ברורים. יש לבדוק את הקוד בצד הלקוח.")

    # שמור תוצאות לקובץ
    with open('diagnosis_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2, default=str)

    print(f"\n✓ התוצאות נשמרו ל-diagnosis_results.json")

if __name__ == "__main__":
    main()
