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

BASE44_PROJECT_ID = os.getenv('BASE44_PROJECT_ID')
BASE44_API_KEY = os.getenv('BASE44_API_KEY')
BASE_URL = 'https://api.base44.com/api/v1'

print("=" * 80)
print("בודק חיבור ל-Base44 API")
print("=" * 80)

# בדיקה שיש ערכים
if not BASE44_PROJECT_ID:
    print("❌ חסר BASE44_PROJECT_ID בקובץ .env")
    sys.exit(1)

if not BASE44_API_KEY:
    print("❌ חסר BASE44_API_KEY בקובץ .env")
    sys.exit(1)

print(f"✅ PROJECT_ID: {BASE44_PROJECT_ID[:8]}... (מוצג חלקית)")
print(f"✅ API_KEY: {BASE44_API_KEY[:8]}... (מוצג חלקית)")
print()

headers = {
    'Authorization': f'Bearer {BASE44_API_KEY}',
    'Content-Type': 'application/json'
}

# ניסיון 1: קבלת רשימת Collections
print("ניסיון 1: קבלת רשימת Collections בפרויקט")
print(f"URL: {BASE_URL}/data/{BASE44_PROJECT_ID}")
print()

try:
    response = requests.get(
        f'{BASE_URL}/data/{BASE44_PROJECT_ID}',
        headers=headers
    )

    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        print("✅ חיבור תקין!")
        data = response.json()
        print(f"\nמספר Collections בפרויקט: {len(data)}")
        print("\nCollections זמינים:")
        for collection in data:
            print(f"  - {collection}")

        # בדיקה אם Assignment קיים
        if 'Assignment' in data:
            print("\n✅ Collection 'Assignment' קיים")
        else:
            print("\n⚠️  Collection 'Assignment' לא נמצא!")
            print("Collections זמינים:", data)

    elif response.status_code == 401:
        print("❌ שגיאת הרשאה - API Key לא תקף")
        print(f"תשובה: {response.text}")

    elif response.status_code == 404:
        print("❌ Project ID לא נמצא")
        print(f"תשובה: {response.text}")

    else:
        print(f"❌ שגיאה: {response.status_code}")
        print(f"תשובה: {response.text}")

except Exception as e:
    print(f"❌ שגיאה בחיבור: {str(e)}")

print("\n" + "=" * 80)

# ניסיון 2: קבלת Assignment אם קיים
if response.status_code == 200:
    data = response.json()
    if 'Assignment' in data or isinstance(data, list):
        print("\nניסיון 2: קבלת Assignments")
        print(f"URL: {BASE_URL}/data/{BASE44_PROJECT_ID}/Assignment")
        print()

        try:
            response = requests.get(
                f'{BASE_URL}/data/{BASE44_PROJECT_ID}/Assignment',
                headers=headers
            )

            print(f"Status Code: {response.status_code}")

            if response.status_code == 200:
                assignments = response.json()
                print(f"✅ נמצאו {len(assignments)} מטלות")

                # ספירת סוגים
                types = {}
                for a in assignments:
                    t = a.get('type', 'unknown')
                    types[t] = types.get(t, 0) + 1

                print("\nפילוח לפי סוג:")
                for t, count in types.items():
                    print(f"  {t}: {count}")

            else:
                print(f"❌ שגיאה: {response.status_code}")
                print(f"תשובה: {response.text}")

        except Exception as e:
            print(f"❌ שגיאה: {str(e)}")

        print("=" * 80)
