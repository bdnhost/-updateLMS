# -*- coding: utf-8 -*-
"""
בדיקת חיבור ל-Base44 API
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
import requests

load_dotenv()

BASE44_APP_ID = os.getenv('BASE44_APP_ID')
BASE44_API_KEY = os.getenv('BASE44_API_KEY')
BASE_URL = 'https://app.base44.com/api/apps'

print("=" * 80)
print("בודק חיבור ל-Base44 API")
print("=" * 80)

# בדיקה שיש ערכים
if not BASE44_APP_ID:
    print("❌ חסר BASE44_APP_ID בקובץ .env")
    sys.exit(1)

if not BASE44_API_KEY:
    print("❌ חסר BASE44_API_KEY בקובץ .env")
    sys.exit(1)

print(f"✅ APP_ID: {BASE44_APP_ID[:8]}... (מוצג חלקית)")
print(f"✅ API_KEY: {BASE44_API_KEY[:8]}... (מוצג חלקית)")
print()

headers = {
    'api_key': BASE44_API_KEY,
    'Content-Type': 'application/json'
}

# ניסיון 1: קבלת Assignments
print("ניסיון 1: קבלת Assignments מהפרויקט")
print(f"URL: {BASE_URL}/{BASE44_APP_ID}/entities/Assignment")
print()

try:
    response = requests.get(
        f'{BASE_URL}/{BASE44_APP_ID}/entities/Assignment',
        headers=headers
    )

    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        print("✅ חיבור תקין!")
        assignments = response.json()
        print(f"\n✅ נמצאו {len(assignments)} מטלות")

        # ספירת סוגים
        types = {}
        for a in assignments:
            t = a.get('type', 'unknown')
            types[t] = types.get(t, 0) + 1

        print("\nפילוח לפי סוג:")
        for t, count in types.items():
            print(f"  {t}: {count}")

    elif response.status_code == 401:
        print("❌ שגיאת הרשאה - API Key לא תקף")
        print(f"תשובה: {response.text}")

    elif response.status_code == 404:
        print("❌ App ID לא נמצא או endpoint שגוי")
        print(f"תשובה: {response.text}")

    else:
        print(f"❌ שגיאה: {response.status_code}")
        print(f"תשובה: {response.text}")

except Exception as e:
    print(f"❌ שגיאה בחיבור: {str(e)}")

print("\n" + "=" * 80)
