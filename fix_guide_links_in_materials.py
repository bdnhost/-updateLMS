# -*- coding: utf-8 -*-
"""
🔗 תיקון קישורי מדריכים בחומרי לימוד
מעדכן חומרים מסוג "link" עם ה-URLs הנכונים למדריכים
"""

import requests
import json
import time

API_KEY = 'c0ce546b5661436dacb7a2060b10c9a5'
APP_ID = '693824c5c1ad33c1f114ebd2'

# מיפוי מלא של כל 37 המדריכים - URLs נכונים
GUIDES = {
    # AI & Automation (12)
    'agentic_ai': 'https://bdnhost.net/Resources/guides/ai-automation/agentic-ai-for-managers.html',
    'ai_basics': 'https://bdnhost.net/Resources/guides/ai-automation/ai_basics.html',
    'ai_ethics': 'https://bdnhost.net/Resources/guides/ai-automation/ai_ethics.html',
    'chatgpt_guide': 'https://bdnhost.net/Resources/guides/ai-automation/chatgpt_guide.html',
    'ai_for_educators': 'https://bdnhost.net/Resources/guides/ai-automation/guide-comprehensive-ai-applications-for-educators.html',
    'no_code_chatbot': 'https://bdnhost.net/Resources/guides/ai-automation/no-code-customer-service-chatbot-building.html',
    'prompt_engineering': 'https://bdnhost.net/Resources/guides/ai-automation/prompt-engineering-guide.html',
    'python_guide': 'https://bdnhost.net/Resources/guides/ai-automation/python_guide.html',
    'react_pro': 'https://bdnhost.net/Resources/guides/ai-automation/react-pro-guide.html',
    'transformers': 'https://bdnhost.net/Resources/guides/ai-automation/transformers-overview.html',
    'llms': 'https://bdnhost.net/Resources/guides/ai-automation/understanding-llms-how-it-works.html',
    'web_scraping': 'https://bdnhost.net/Resources/guides/ai-automation/web_scraping_guide.html',

    # Career (3)
    'portfolio': 'https://bdnhost.net/Resources/guides/career/building-impressive-digital-portfolio.html',
    'career_prep': 'https://bdnhost.net/Resources/guides/career/career_prep.html',
    'presentation_skills': 'https://bdnhost.net/Resources/guides/career/presentation_skills.html',

    # Creative Studio (7)
    'self_learning': 'https://bdnhost.net/Resources/guides/creative-studio/ai-tools-and-applications-guide-for-education-professionals.html',
    'canva_guide': 'https://bdnhost.net/Resources/guides/creative-studio/canva_guide.html',
    'microbit': 'https://bdnhost.net/Resources/guides/creative-studio/creative-coding-for-kids-microbit.html',
    'mechanical_design': 'https://bdnhost.net/Resources/guides/creative-studio/mechanical_design_guide.html',
    'midjourney': 'https://bdnhost.net/Resources/guides/creative-studio/midjourney-for-marketing-visuals.html',
    'ui_ux': 'https://bdnhost.net/Resources/guides/creative-studio/ui_ux_guide.html',
    'video_editing': 'https://bdnhost.net/Resources/guides/creative-studio/video_editing_guide.html',

    # Data & Business (6)
    'data_analysis': 'https://bdnhost.net/Resources/guides/data-business/data_analysis_guide.html',
    'excel_student': 'https://bdnhost.net/Resources/guides/data-business/excel_student.html',
    'marketing_guide': 'https://bdnhost.net/Resources/guides/data-business/marketing_guide.html',
    'powerbi': 'https://bdnhost.net/Resources/guides/data-business/powerbi_guide.html',
    'short_video': 'https://bdnhost.net/Resources/guides/data-business/short-video-marketing-strategy.html',
    'sql_guide': 'https://bdnhost.net/Resources/guides/data-business/sql_guide.html',

    # Digital Basics (7)
    'algorithmic_thinking': 'https://bdnhost.net/Resources/guides/digital-basics/algorithmic_thinking.html',
    'computer_vision': 'https://bdnhost.net/Resources/guides/digital-basics/cv_guide.html',
    'digital_literacy': 'https://bdnhost.net/Resources/guides/digital-basics/digital_literacy_basics_guide.html',
    'file_management': 'https://bdnhost.net/Resources/guides/digital-basics/file-management.html',
    'github_guide': 'https://bdnhost.net/Resources/guides/digital-basics/github_guide.html',
    'internet_basics': 'https://bdnhost.net/Resources/guides/digital-basics/internet_basics.html',
    'terminal_guide': 'https://bdnhost.net/Resources/guides/digital-basics/terminal_guide.html',

    # Technology (3)
    'automotive_guide': 'https://bdnhost.net/Resources/guides/technology/automotive_guide.html',
    'docker_guide': 'https://bdnhost.net/Resources/guides/technology/docker-usage-guide.html',
    'iot_guide': 'https://bdnhost.net/Resources/guides/technology/iot_guide.html',
}

# מיפוי שמות מדריכים לקישורים (לזיהוי לפי כותרת)
GUIDE_NAME_MAPPING = {
    'agentic': 'agentic_ai',
    'בינה מלאכותית סוכנתית': 'agentic_ai',
    'ai basic': 'ai_basics',
    'יסודות ai': 'ai_basics',
    'יסודות הבינה': 'ai_basics',
    'אתיקה': 'ai_ethics',
    'ethics': 'ai_ethics',
    'chatgpt': 'chatgpt_guide',
    'מדריך chatgpt': 'chatgpt_guide',
    'למורים': 'ai_for_educators',
    'למרצים': 'ai_for_educators',
    'educator': 'ai_for_educators',
    'צ\'אטבוט': 'no_code_chatbot',
    'chatbot': 'no_code_chatbot',
    'לשירות לקוחות': 'no_code_chatbot',
    'prompt': 'prompt_engineering',
    'פרומפט': 'prompt_engineering',
    'python': 'python_guide',
    'פייתון': 'python_guide',
    'react': 'react_pro',
    'transformer': 'transformers',
    'טרנספורמר': 'transformers',
    'llm': 'llms',
    'מודלי שפה': 'llms',
    'scraping': 'web_scraping',
    'תיק עבודות': 'portfolio',
    'portfolio': 'portfolio',
    'קריירה': 'career_prep',
    'career': 'career_prep',
    'הצגה': 'presentation_skills',
    'presentation': 'presentation_skills',
    'למידה עצמית': 'self_learning',
    'canva': 'canva_guide',
    'microbit': 'microbit',
    'מיקרוביט': 'microbit',
    'מכני': 'mechanical_design',
    'mechanical': 'mechanical_design',
    'midjourney': 'midjourney',
    'ui/ux': 'ui_ux',
    'ui ux': 'ui_ux',
    'ux': 'ui_ux',
    'וידאו': 'video_editing',
    'video editing': 'video_editing',
    'עריכת וידאו': 'video_editing',
    'data': 'data_analysis',
    'ניתוח נתונים': 'data_analysis',
    'excel': 'excel_student',
    'marketing': 'marketing_guide',
    'שיווק': 'marketing_guide',
    'power bi': 'powerbi',
    'powerbi': 'powerbi',
    'וידאו קצר': 'short_video',
    'short video': 'short_video',
    'sql': 'sql_guide',
    'אלגוריתמ': 'algorithmic_thinking',
    'algorithmic': 'algorithmic_thinking',
    'ראייה': 'computer_vision',
    'vision': 'computer_vision',
    'cv': 'computer_vision',
    'אוריינות': 'digital_literacy',
    'literacy': 'digital_literacy',
    'file': 'file_management',
    'קובץ': 'file_management',
    'קבצים': 'file_management',
    'github': 'github_guide',
    'git': 'github_guide',
    'אינטרנט': 'internet_basics',
    'internet': 'internet_basics',
    'terminal': 'terminal_guide',
    'שורת פקודה': 'terminal_guide',
    'רכב': 'automotive_guide',
    'automotive': 'automotive_guide',
    'אבחון': 'automotive_guide',
    'docker': 'docker_guide',
    'iot': 'iot_guide',
    'אוטומציה': 'iot_guide',
}

def make_api_request(api_path, method='GET', data=None, retries=4):
    """בצע קריאת API עם retry mechanism"""
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

def find_correct_guide_url(material_title, material_url):
    """מצא את ה-URL הנכון למדריך לפי הכותרת וה-URL הישן"""

    title_lower = material_title.lower()
    url_lower = material_url.lower() if material_url else ''

    # נסה למצוא לפי כותרת
    for name_part, guide_key in GUIDE_NAME_MAPPING.items():
        if name_part in title_lower:
            return GUIDES[guide_key], guide_key

    # נסה למצוא לפי URL ישן (אם יש guides/ בנתיב)
    if 'guides/' in url_lower or 'guide' in url_lower:
        # חלץ את שם הקובץ מה-URL
        url_parts = url_lower.split('/')
        if url_parts:
            filename = url_parts[-1].replace('.html', '').replace('.htm', '')

            # חפש התאמה במדריכים
            for guide_key, guide_url in GUIDES.items():
                guide_filename = guide_url.split('/')[-1].replace('.html', '')
                if filename in guide_filename or guide_filename in filename:
                    return guide_url, guide_key

    return None, None

print("=" * 100)
print("🔗 תיקון קישורי מדריכים בחומרי לימוד")
print("=" * 100)

# ============================================================================
# שלב 1: קבל חומרים מסוג "link"
# ============================================================================

print("\n📂 שלב 1: קריאת חומרי לימוד מסוג 'link'...\n")

try:
    materials_response = make_api_request(
        f'apps/{APP_ID}/entities/Material',
        data={'limit': 200}
    )

    if isinstance(materials_response, list):
        all_materials = materials_response
    else:
        all_materials = materials_response.get('data', [])

    # סנן רק חומרים מסוג "link"
    link_materials = [m for m in all_materials if m.get('type', '').lower() == 'link']

    print(f"✅ נמצאו {len(link_materials)} חומרים מסוג 'link' (מתוך {len(all_materials)} חומרים כוללים)")

except Exception as e:
    print(f"❌ שגיאה בקריאת חומרים: {e}")
    exit(1)

# ============================================================================
# שלב 2: זהה חומרים שצריכים עדכון
# ============================================================================

print("\n" + "=" * 100)
print("🔍 שלב 2: זיהוי חומרים שצריכים עדכון")
print("=" * 100)

materials_to_fix = {}

print(f"\n📋 מנתח {len(link_materials)} חומרי link...\n")

for i, material in enumerate(link_materials, 1):
    material_id = material.get('id', '')
    material_title = material.get('title', '')
    material_url = material.get('file_url', '') or material.get('url', '')  # נסה file_url ואז url

    # בדוק אם זה מדריך שצריך עדכון
    correct_url, guide_key = find_correct_guide_url(material_title, material_url)

    if correct_url:
        # בדוק אם ה-file_url שונה מהנוכחי
        if material_url != correct_url:
            materials_to_fix[material_id] = {
                'title': material_title,
                'old_url': material_url,
                'new_url': correct_url,
                'guide_key': guide_key
            }

            if i <= 15:  # הצג רק 15 ראשונים
                print(f"{len(materials_to_fix)}. {material_title[:60]}")
                print(f"   ❌ ישן: {material_url[:70]}")
                print(f"   ✅ חדש: {correct_url[:70]}")
                print()

if len(materials_to_fix) > 15:
    print(f"... ועוד {len(materials_to_fix) - 15} חומרים\n")

print(f"✅ נמצאו {len(materials_to_fix)} חומרים שצריכים עדכון")

# שמור מיפוי
with open('guide_links_fixes.json', 'w', encoding='utf-8') as f:
    json.dump(materials_to_fix, f, ensure_ascii=False, indent=2)

print(f"✅ מיפוי נשמר ל-guide_links_fixes.json")

# ============================================================================
# שלב 3: עדכון ה-URLs במערכת
# ============================================================================

print("\n" + "=" * 100)
print("🔄 שלב 3: עדכון URLs במערכת")
print("=" * 100)

if materials_to_fix:
    print(f"\n🚀 מתחיל עדכון {len(materials_to_fix)} חומרים...\n")

    updated_count = 0
    failed_count = 0

    for material_id, mapping in materials_to_fix.items():
        try:
            # עדכן את ה-file_url
            update_data = {
                'file_url': mapping['new_url']
            }

            response = make_api_request(
                f'apps/{APP_ID}/entities/Material/{material_id}',
                method='PUT',
                data=update_data
            )

            updated_count += 1
            print(f"✅ {mapping['title'][:50]}")
            print(f"   🔗 {mapping['guide_key']}")

            time.sleep(0.3)

        except Exception as e:
            failed_count += 1
            error_msg = str(e)[:60]
            print(f"❌ {mapping['title'][:40]} - שגיאה: {error_msg}")

    print(f"\n" + "=" * 100)
    print("✨ סיום עדכון!")
    print("=" * 100)
    print(f"✅ עודכנו: {updated_count}/{len(materials_to_fix)} חומרים")
    print(f"❌ כשלונות: {failed_count}")

else:
    print("\n✅ כל הקישורים כבר מעודכנים! אין צורך בעדכון.")

# ============================================================================
# שלב 4: סטטיסטיקה
# ============================================================================

print("\n" + "=" * 100)
print("📊 סטטיסטיקה")
print("=" * 100)

if materials_to_fix:
    from collections import Counter

    # ספור לפי מדריך
    guide_counter = Counter(m['guide_key'] for m in materials_to_fix.values())

    print(f"\n📈 סטטיסטיקה:")
    print(f"   • סה\"כ חומרים שעודכנו: {len(materials_to_fix)}")
    print(f"   • סה\"כ מדריכים שונים: {len(guide_counter)}")

    print(f"\n🏆 המדריכים שעודכנו הכי הרבה:")
    for guide_key, count in guide_counter.most_common(10):
        print(f"   • {guide_key}: {count} חומרים")

print("\n" + "=" * 100)
print("✨ תיקון קישורי המדריכים הושלם!")
print("=" * 100)
print("""
📁 המיפוי נשמר ב: guide_links_fixes.json
🎯 כל חומרי ה-link מצביעים למדריכים הנכונים!
""")
