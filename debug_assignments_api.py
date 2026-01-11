#!/usr/bin/env python3
"""
בדיקה מדוע המטלות לא מתקבלות מה-API
"""

import requests
import json
import os

# טען את משתני הסביבה
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

print("="*80)
print("🔍 בדיקה מפורטת של Assignment API")
print("="*80)
print()

# נסה מספר endpoints ושיטות שונות
tests = [
    {
        "name": "API entities endpoint",
        "url": f"https://app.base44.com/api/apps/{BASE44_APP_ID}/entities/Assignment",
        "headers": {"api_key": BASE44_API_KEY, "Content-Type": "application/json"}
    },
    {
        "name": "API data endpoint",
        "url": f"https://app.base44.com/api/apps/{BASE44_APP_ID}/data/Assignment",
        "headers": {"Authorization": f"Bearer {BASE44_API_KEY}", "Content-Type": "application/json"}
    },
    {
        "name": "API entities with limit=1000",
        "url": f"https://app.base44.com/api/apps/{BASE44_APP_ID}/entities/Assignment?limit=1000",
        "headers": {"api_key": BASE44_API_KEY, "Content-Type": "application/json"}
    },
]

all_assignments = []

for test in tests:
    print(f"🧪 בדיקה: {test['name']}")
    print(f"   URL: {test['url']}")

    try:
        response = requests.get(test['url'], headers=test['headers'])
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()

            # Handle different response formats
            if isinstance(data, list):
                records = data
            elif isinstance(data, dict):
                records = data.get('data', [])
            else:
                records = []

            print(f"   תוצאה: {len(records)} רשומות")

            if len(records) > len(all_assignments):
                all_assignments = records
                print(f"   ✓ זו התוצאה הטובה ביותר עד כה!")

            if records:
                # הצג דוגמה לרשומה
                sample = records[0]
                print(f"\n   📋 דוגמה לרשומה:")
                print(f"      ID: {sample.get('id', 'N/A')}")
                print(f"      Title: {sample.get('title', 'N/A')}")
                print(f"      Organization ID: {sample.get('organization_id', 'N/A')}")
                print(f"      Course ID: {sample.get('course_id', 'N/A')}")
                print(f"      Status: {sample.get('status', 'N/A')}")
                print(f"      Type: {sample.get('type', 'N/A')}")

                # בדוק שדות שיכולים לסנן
                if 'deleted' in sample:
                    print(f"      Deleted: {sample.get('deleted')}")
                if 'archived' in sample:
                    print(f"      Archived: {sample.get('archived')}")
                if 'is_active' in sample:
                    print(f"      Is Active: {sample.get('is_active')}")
        else:
            print(f"   ❌ Error: {response.text[:200]}")

    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")

    print()

# נסה לגשת למטלה ספציפית שאנחנו יודעים שקיימת
print("="*80)
print("🎯 ניסיון גישה למטלה ספציפית")
print("="*80)

known_assignment_ids = [
    "695a0c6869ed88403e229969",  # AI Agent עם Function Calling
    "695a0c6869ed88403e22996a"   # מערכת RAG
]

for assignment_id in known_assignment_ids:
    print(f"\n🔍 מנסה לקבל Assignment ID: {assignment_id}")

    url = f"https://app.base44.com/api/apps/{BASE44_APP_ID}/entities/Assignment/{assignment_id}"
    headers = {"api_key": BASE44_API_KEY, "Content-Type": "application/json"}

    try:
        response = requests.get(url, headers=headers)
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            assignment = response.json()
            print(f"   ✓ הצלחה! המטלה קיימת:")
            print(f"      Title: {assignment.get('title', 'N/A')}")
            print(f"      Organization ID: {assignment.get('organization_id', 'N/A')}")
            print(f"      Course ID: {assignment.get('course_id', 'N/A')}")
            print(f"      Status: {assignment.get('status', 'N/A')}")

            # הצג את כל השדות
            print(f"\n      כל השדות:")
            for key in sorted(assignment.keys()):
                value = assignment[key]
                if isinstance(value, str) and len(value) > 50:
                    value = value[:50] + "..."
                print(f"         {key}: {value}")
        else:
            print(f"   ❌ Error: {response.text[:200]}")

    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")

# סיכום
print("\n" + "="*80)
print("📊 סיכום")
print("="*80)

if all_assignments:
    print(f"✓ סה\"כ נמצאו {len(all_assignments)} מטלות דרך ה-API")

    # ניתוח
    org_counts = {}
    status_counts = {}

    for assignment in all_assignments:
        org_id = assignment.get('organization_id', 'N/A')
        org_counts[org_id] = org_counts.get(org_id, 0) + 1

        status = assignment.get('status', 'N/A')
        status_counts[status] = status_counts.get(status, 0) + 1

    print(f"\nפילוג לפי ארגון:")
    for org_id, count in sorted(org_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"   {org_id[:20]}...: {count}")

    print(f"\nפילוג לפי סטטוס:")
    for status, count in sorted(status_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"   {status}: {count}")
else:
    print("❌ לא נמצאו מטלות בשום שיטה!")
    print("\nסיבות אפשריות:")
    print("   1. ה-API Key לא מורשה לגשת למטלות")
    print("   2. יש בעיה בהגדרות Entity ב-Base44")
    print("   3. שם ה-Entity שונה (לא 'Assignment')")
    print("\nהמלצה:")
    print("   • היכנס ל-https://app.base44.com")
    print("   • בדוק את שם ה-Entity המדויק")
    print("   • בדוק את ההרשאות של ה-API Key")
