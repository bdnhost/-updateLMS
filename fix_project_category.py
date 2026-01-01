# -*- coding: utf-8 -*-
"""
תיקון קטגוריה למטלות פרויקט
"""

import requests

API_KEY = 'c0ce546b5661436dacb7a2060b10c9a5'
APP_ID = '693824c5c1ad33c1f114ebd2'
ASSIGNMENT_ID = '6942ae578b6cc5827f6df40d'

def make_api_request(api_path, method='GET', data=None):
    url = f'https://app.base44.com/api/{api_path}'
    headers = {
        'api_key': API_KEY,
        'Content-Type': 'application/json'
    }

    session = requests.Session()
    session.trust_env = False

    if method.upper() == 'GET':
        response = session.request(method, url, headers=headers, params=data, timeout=30)
    else:
        response = session.request(method, url, headers=headers, json=data, timeout=30)

    response.raise_for_status()
    return response.json()

print("🔧 מעדכן קטגוריה למטלה...")

try:
    response = make_api_request(
        f'apps/{APP_ID}/entities/Assignment/{ASSIGNMENT_ID}',
        method='PUT',
        data={'category': 'פרויקט'}
    )
    print("✅ הקטגוריה עודכנה ל-'פרויקט'")
except Exception as e:
    print(f"❌ שגיאה: {e}")
