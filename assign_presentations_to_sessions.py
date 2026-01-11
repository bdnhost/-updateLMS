#!/usr/bin/env python3
"""
משבץ מצגות למפגשים בצורה חכמה
"""

import requests
import json
import os
from difflib import SequenceMatcher

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

BASE_URL = f"https://app.base44.com/api/apps/{BASE44_APP_ID}/entities"
HEADERS = {
    "api_key": BASE44_API_KEY,
    "Content-Type": "application/json"
}

# 🎯 רשימת המצגות - ערוך את זה לפי המצגות שיש לך!
PRESENTATIONS = [
    {
        "keywords": ["chatgpt", "gpt", "openai", "שיחה", "צ'אט"],
        "url": "https://bdnhost.net/voice4u/outputs/course_ai_implementation/pres_pres_chatgpt_biz_01/index.html",
        "title": "ChatGPT לעסקים"
    },
    {
        "keywords": ["ai", "בינה מלאכותית", "מבוא", "הטמעה"],
        "url": "https://bdnhost.net/voice4u/outputs/course_ai_implementation/pres_intro_ai/index.html",
        "title": "מבוא לבינה מלאכותית"
    },
    {
        "keywords": ["prompt", "פרומפט", "הנדסה"],
        "url": "https://bdnhost.net/voice4u/outputs/course_ai_implementation/pres_prompt_engineering/index.html",
        "title": "Prompt Engineering"
    },
    {
        "keywords": ["automation", "אוטומציה", "תהליכים"],
        "url": "https://bdnhost.net/voice4u/outputs/course_ai_implementation/pres_automation/index.html",
        "title": "אוטומציה עם AI"
    },
    {
        "keywords": ["marketing", "שיווק", "תוכן"],
        "url": "https://bdnhost.net/voice4u/outputs/course_marketing/pres_ai_marketing/index.html",
        "title": "AI בשיווק"
    },
    # ➕ הוסף עוד מצגות כאן!
]

def similarity(a, b):
    """מחשב דמיון בין שתי מחרוזות (0-1)"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def find_best_presentation(session_title, session_description=""):
    """מוצא את המצגת הכי מתאימה למפגש"""
    combined_text = f"{session_title} {session_description}".lower()

    best_match = None
    best_score = 0

    for pres in PRESENTATIONS:
        # בדוק התאמה למילות מפתח
        keyword_matches = sum(1 for kw in pres["keywords"] if kw.lower() in combined_text)

        # חשב ציון
        score = keyword_matches * 0.3  # משקל למילות מפתח

        # בדוק דמיון ישיר לכותרת
        title_sim = similarity(pres["title"], session_title)
        score += title_sim * 0.7  # משקל לדמיון כותרת

        if score > best_score:
            best_score = score
            best_match = pres

    # החזר רק אם יש התאמה סבירה (מעל 0.2)
    if best_score > 0.2:
        return best_match, best_score
    return None, 0

def get_all_sessions():
    """מקבל את כל המפגשים"""
    url = f"{BASE_URL}/CourseSession?limit=1000"
    response = requests.get(url, headers=HEADERS)

    if response.status_code != 200:
        print(f"❌ שגיאה בקבלת מפגשים: {response.status_code}")
        return []

    data = response.json()
    return data if isinstance(data, list) else data.get('data', [])

def update_session_presentation(session_id, presentation_url):
    """מעדכן presentation_url במפגש"""
    url = f"{BASE_URL}/CourseSession/{session_id}"
    data = {"presentation_url": presentation_url}

    response = requests.put(url, headers=HEADERS, json=data)
    return response.status_code in [200, 204]

# Main
print("="*80)
print("🎯 שיבוץ מצגות למפגשים")
print("="*80)
print()

print(f"📚 רשימת מצגות זמינות: {len(PRESENTATIONS)}")
for i, pres in enumerate(PRESENTATIONS, 1):
    print(f"   {i}. {pres['title']}")
print()

# קבל את כל המפגשים
print("🔍 טוען מפגשים...")
sessions = get_all_sessions()
print(f"✓ נמצאו {len(sessions)} מפגשים\n")

if not sessions:
    print("❌ לא נמצאו מפגשים!")
    exit(1)

# נתח ושבץ
suggestions = []

for session in sessions:
    session_id = session.get('id')
    session_title = session.get('title', session.get('name', 'ללא כותרת'))
    session_description = session.get('description', '')
    current_pres = session.get('presentation_url', '')

    # מצא מצגת מתאימה
    best_pres, score = find_best_presentation(session_title, session_description)

    if best_pres:
        suggestions.append({
            'session_id': session_id,
            'session_title': session_title,
            'current_url': current_pres,
            'suggested_url': best_pres['url'],
            'suggested_title': best_pres['title'],
            'score': score
        })

# הצג הצעות
print("="*80)
print("💡 הצעות לשיבוץ")
print("="*80)

if not suggestions:
    print("⚠️  לא נמצאו התאמות טובות!")
    print("   נא לעדכן את רשימת ה-PRESENTATIONS בסקריפט")
    exit(0)

for i, sugg in enumerate(suggestions, 1):
    print(f"\n{i}. מפגש: {sugg['session_title']}")
    print(f"   מצגת מוצעת: {sugg['suggested_title']} (ציון: {sugg['score']:.2f})")
    if sugg['current_url']:
        print(f"   מצגת נוכחית: {sugg['current_url'][:60]}...")
    print(f"   URL: {sugg['suggested_url'][:80]}...")

# שאל אישור
print("\n" + "="*80)
response = input(f"❓ האם לשבץ את כל {len(suggestions)} המצגות? (yes/no): ")

if response.lower() not in ['yes', 'y', 'כן']:
    print("⏭️  בוטל.")
    exit(0)

# עדכן
print("\n🔄 משבץ מצגות...")
success_count = 0
fail_count = 0

for sugg in suggestions:
    if update_session_presentation(sugg['session_id'], sugg['suggested_url']):
        success_count += 1
        print(f"   ✓ {sugg['session_title']}")
    else:
        fail_count += 1
        print(f"   ❌ {sugg['session_title']}")

# סיכום
print("\n" + "="*80)
print("✅ סיכום")
print("="*80)
print(f"   הצלחות: {success_count}")
print(f"   כשלונות: {fail_count}")
print(f"   סה\"כ: {success_count + fail_count}")
print()
print("✓ סיימנו!")
print("   רענן את הדפדפן ובדוק את המפגשים")
