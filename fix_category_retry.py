# -*- coding: utf-8 -*-
"""
תיקון category - ניסיון חוזר עם retry
"""

import requests
import time

API_KEY = 'c0ce546b5661436dacb7a2060b10c9a5'
APP_ID = '693824c5c1ad33c1f114ebd2'
ASSIGNMENT_ID = '6942ae578b6cc5827f6df40d'

def make_api_request(api_path, method='GET', data=None, retries=4):
    url = f'https://app.base44.com/api/{api_path}'
    headers = {
        'api_key': API_KEY,
        'Content-Type': 'application/json'
    }
    
    for attempt in range(retries):
        try:
            session = requests.Session()
            session.trust_env = False
            
            if method.upper() == 'GET':
                response = session.request(method, url, headers=headers, params=data, timeout=30)
            else:
                response = session.request(method, url, headers=headers, json=data, timeout=30)
            
            response.raise_for_status()
            return response.json()
        except Exception as e:
            if attempt < retries - 1:
                wait_time = 2 ** attempt
                print(f"⚠️  ניסיון {attempt + 1}/{retries} נכשל, מחכה {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise e

print("🔧 מעדכן קטגוריה למטלה (עם retry)...\n")

try:
    response = make_api_request(
        f'apps/{APP_ID}/entities/Assignment/{ASSIGNMENT_ID}',
        method='PUT',
        data={'category': 'פרויקט'}
    )
    print("✅ הקטגוריה עודכנה ל-'פרויקט'")
    print(f"\n📋 תשובה מהשרת:")
    print(f"   title: {response.get('title')}")
    print(f"   category: {response.get('category')}")
    print(f"   type: {response.get('type')}")
except Exception as e:
    print(f"❌ שגיאה: {e}")
    print("\n💡 אם יש בעיית רשת, נסה שוב מאוחר יותר")
