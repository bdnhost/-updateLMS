#!/usr/bin/env python3
"""
בדיקת organization_id - למה ה-API מסנן רשומות
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

print("="*80)
print("🔍 בדיקת Organization ID")
print("="*80)

# בדוק קורסים
print("\n📚 Courses שמתקבלים:")
response = requests.get(f"{BASE_URL}/Course", headers=HEADERS)
courses = response.json()
if isinstance(courses, list):
    for course in courses:
        org_id = course.get('organization_id', 'N/A')
        print(f"  - {course.get('name', 'N/A')} | organization_id: {org_id}")

# בדוק חומרים
print("\n📄 Materials שמתקבלים (10 ראשונים):")
response = requests.get(f"{BASE_URL}/Material?limit=10", headers=HEADERS)
materials = response.json()
if isinstance(materials, list):
    for material in materials[:10]:
        org_id = material.get('organization_id', 'N/A')
        print(f"  - {material.get('title', 'N/A')} | organization_id: {org_id}")

# נסה לבדוק את כל הארגונים
print("\n🏢 נסיון לקבל את כל הארגונים:")
try:
    response = requests.get(f"{BASE_URL}/Organization", headers=HEADERS)
    if response.status_code == 200:
        orgs = response.json()
        if isinstance(orgs, list):
            print(f"  נמצאו {len(orgs)} ארגונים:")
            for org in orgs:
                org_id = org.get('id', org.get('_id', 'N/A'))
                org_name = org.get('name', 'N/A')
                print(f"    - {org_name} | ID: {org_id}")
        else:
            print(f"  תגובה: {orgs}")
    else:
        print(f"  שגיאה {response.status_code}: {response.text}")
except Exception as e:
    print(f"  שגיאה: {e}")

print("\n" + "="*80)
print("💡 פתרון אפשרי:")
print("="*80)
print("""
אם ה-API מסנן לפי organization_id, יש מספר אפשרויות:

1. **שנה את ה-API Key** - קבל API key שיש לו גישה לכל הארגונים
   (אולי Admin API key)

2. **שנה את הארגון** - העבר את כל הרשומות לארגון אחד

3. **שנה את ההגדרות** - בדוק ב-Base44 אם יש הגדרה של "Global Access"

4. **בקש תמיכה מ-Base44** - זו ייתכן והגבלה של הפלטפורמה
""")
