# -*- coding: utf-8 -*-
"""
📚 עדכון חומרי לימוד עם URLs של מדריכים
מעדכן את כל החומרים עם הכתובות הנכונות מקובץ המדריכים
"""

import requests
import json
import time

API_KEY = 'c0ce546b5661436dacb7a2060b10c9a5'
APP_ID = '693824c5c1ad33c1f114ebd2'

# מיפוי מלא של כל 37 המדריכים
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

# מיפוי מילות מפתח למדריכים
KEYWORD_TO_GUIDES = {
    'ai': ['ai_basics', 'chatgpt_guide', 'prompt_engineering', 'llms', 'ai_ethics'],
    'בינה': ['ai_basics', 'chatgpt_guide', 'prompt_engineering', 'llms'],
    'chatgpt': ['chatgpt_guide', 'prompt_engineering', 'ai_basics'],
    'prompt': ['prompt_engineering', 'chatgpt_guide'],
    'python': ['python_guide', 'data_analysis', 'web_scraping'],
    'פייתון': ['python_guide', 'data_analysis'],
    'data': ['data_analysis', 'powerbi', 'sql_guide', 'excel_student'],
    'נתונים': ['data_analysis', 'powerbi', 'excel_student'],
    'automotive': ['automotive_guide'],
    'רכב': ['automotive_guide'],
    'obd': ['automotive_guide'],
    'chatbot': ['no_code_chatbot'],
    'בוט': ['no_code_chatbot'],
    'iot': ['iot_guide'],
    'presentation': ['presentation_skills', 'portfolio'],
    'הצגה': ['presentation_skills', 'portfolio'],
    'portfolio': ['portfolio'],
    'תיק': ['portfolio'],
    'excel': ['excel_student', 'data_analysis'],
    'powerbi': ['powerbi'],
    'sql': ['sql_guide'],
    'github': ['github_guide'],
    'git': ['github_guide'],
    'terminal': ['terminal_guide'],
    'docker': ['docker_guide'],
    'react': ['react_pro'],
    'ui': ['ui_ux'],
    'ux': ['ui_ux'],
    'canva': ['canva_guide'],
    'video': ['video_editing', 'short_video'],
    'ויידאו': ['video_editing'],
    'marketing': ['marketing_guide', 'short_video'],
    'שיווק': ['marketing_guide'],
    'vision': ['computer_vision'],
    'ראייה': ['computer_vision'],
    'microbit': ['microbit'],
    'career': ['career_prep', 'portfolio', 'presentation_skills'],
    'קריירה': ['career_prep'],
    'internet': ['internet_basics'],
    'אינטרנט': ['internet_basics'],
    'file': ['file_management'],
    'קובץ': ['file_management'],
    'algorithm': ['algorithmic_thinking'],
    'אלגוריתם': ['algorithmic_thinking'],
    'literacy': ['digital_literacy'],
    'אוריינות': ['digital_literacy'],
    'mechanical': ['mechanical_design'],
    'מכני': ['mechanical_design'],
    'midjourney': ['midjourney'],
    'transformer': ['transformers'],
    'llm': ['llms'],
    'educator': ['ai_for_educators'],
    'מורה': ['ai_for_educators'],
    'learning': ['self_learning'],
    'למידה': ['self_learning'],
    'scraping': ['web_scraping'],
    'agentic': ['agentic_ai'],
    'manager': ['agentic_ai'],
    'מנהל': ['agentic_ai'],
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

def find_relevant_guides(material_title, material_description='', material_topic=''):
    """מצא מדריכים רלוונטיים לחומר"""
    combined_text = f"{material_title} {material_description} {material_topic}".lower()

    relevant_guide_keys = set()

    # חפש לפי מילות מפתח
    for keyword, guide_keys in KEYWORD_TO_GUIDES.items():
        if keyword in combined_text:
            relevant_guide_keys.update(guide_keys)

    # המר למסלולי URLs
    guide_urls = [GUIDES[key] for key in relevant_guide_keys if key in GUIDES]

    # הגבל ל-4 מדריכים מקסימום
    return guide_urls[:4]

def build_guides_html(guide_urls):
    """בנה HTML עם קישורים למדריכים"""
    if not guide_urls:
        return ""

    html = "<h4>📚 מדריכים רלוונטיים:</h4><ul>"
    for url in guide_urls:
        # חלץ את שם המדריך מה-URL
        guide_name = url.split('/')[-1].replace('.html', '').replace('-', ' ').replace('_', ' ').title()
        html += f'<li><a href="{url}" target="_blank">{guide_name}</a></li>'
    html += "</ul>"

    return html

print("=" * 100)
print("📚 עדכון חומרי לימוד עם URLs של מדריכים")
print("=" * 100)

# ============================================================================
# שלב 1: קבל את כל החומרים
# ============================================================================

print("\n📂 שלב 1: קריאת כל החומרים מה-API...\n")

try:
    materials_response = make_api_request(
        f'apps/{APP_ID}/entities/Material',
        data={'limit': 200}
    )

    if isinstance(materials_response, list):
        materials = materials_response
    else:
        materials = materials_response.get('data', [])

    print(f"✅ נטענו {len(materials)} חומרים")
except Exception as e:
    print(f"❌ שגיאה בקריאת חומרים: {e}")
    materials = []
    exit(1)

# ============================================================================
# שלב 2: מצא מדריכים רלוונטיים לכל חומר
# ============================================================================

print("\n" + "=" * 100)
print("🔍 שלב 2: מיפוי מדריכים לחומרים")
print("=" * 100)

materials_to_update = {}

print(f"\n📋 מנתח {len(materials)} חומרים...\n")

for i, material in enumerate(materials, 1):
    material_id = material.get('id', '')
    material_title = material.get('title', '')
    material_desc = material.get('description', '')
    material_topic = material.get('topic', '')

    # מצא מדריכים רלוונטיים
    relevant_guides = find_relevant_guides(material_title, material_desc, material_topic)

    if relevant_guides:
        materials_to_update[material_id] = {
            'title': material_title,
            'current_description': material_desc,
            'guides': relevant_guides,
            'guides_html': build_guides_html(relevant_guides)
        }

        if i <= 10:  # הצג רק 10 ראשונים
            print(f"{i}. {material_title[:60]}")
            print(f"   💡 {len(relevant_guides)} מדריכים רלוונטיים:")
            for guide in relevant_guides[:3]:
                guide_name = guide.split('/')[-1].replace('.html', '')
                print(f"      • {guide_name}")
            print()

print(f"✅ נמצאו {len(materials_to_update)} חומרים לעדכון")

# שמור מיפוי
with open('materials_guides_mapping.json', 'w', encoding='utf-8') as f:
    json.dump(materials_to_update, f, ensure_ascii=False, indent=2)

print(f"✅ מיפוי נשמר ל-materials_guides_mapping.json")

# ============================================================================
# שלב 3: עדכון החומרים במערכת
# ============================================================================

print("\n" + "=" * 100)
print("🔄 שלב 3: עדכון חומרים במערכת")
print("=" * 100)

if materials_to_update:
    print(f"\n🚀 מתחיל עדכון {len(materials_to_update)} חומרים...\n")

    updated_count = 0
    failed_count = 0

    for material_id, mapping in materials_to_update.items():
        try:
            current_desc = mapping['current_description'] or ''
            guides_html = mapping['guides_html']

            # הוסף את המדריכים לסוף התיאור (אם אין כבר)
            if 'מדריכים רלוונטיים' not in current_desc:
                new_description = current_desc + '\n\n' + guides_html if current_desc else guides_html
            else:
                # החלף את המדריכים הקיימים
                new_description = current_desc.split('מדריכים רלוונטיים')[0] + guides_html

            # עדכן את החומר
            update_data = {
                'description': new_description
            }

            response = make_api_request(
                f'apps/{APP_ID}/entities/Material/{material_id}',
                method='PUT',
                data=update_data
            )

            updated_count += 1
            print(f"✅ {mapping['title'][:50]} ({len(mapping['guides'])} מדריכים)")

            time.sleep(0.3)

        except Exception as e:
            failed_count += 1
            error_msg = str(e)[:60]
            print(f"❌ {mapping['title'][:40]} - שגיאה: {error_msg}")

    print(f"\n" + "=" * 100)
    print("✨ סיום עדכון!")
    print("=" * 100)
    print(f"✅ עודכנו: {updated_count}/{len(materials_to_update)} חומרים")
    print(f"❌ כשלונות: {failed_count}")

# ============================================================================
# שלב 4: סטטיסטיקה
# ============================================================================

print("\n" + "=" * 100)
print("📊 סטטיסטיקה")
print("=" * 100)

if materials_to_update:
    total_guides = sum(len(m['guides']) for m in materials_to_update.values())
    avg_guides = total_guides / len(materials_to_update)

    print(f"\n📈 סטטיסטיקה:")
    print(f"   • סה\"כ חומרים שעודכנו: {len(materials_to_update)}")
    print(f"   • סה\"כ קישורי מדריכים: {total_guides}")
    print(f"   • ממוצע מדריכים לחומר: {avg_guides:.1f}")

    # ספור מדריכים פופולריים
    from collections import Counter
    all_guides = []
    for m in materials_to_update.values():
        all_guides.extend(m['guides'])

    guide_counter = Counter(all_guides)

    print(f"\n🏆 המדריכים הכי פופולריים (10 ראשונים):")
    for guide_url, count in guide_counter.most_common(10):
        guide_name = guide_url.split('/')[-1].replace('.html', '').replace('-', ' ').replace('_', ' ')
        print(f"   • {guide_name}: {count} חומרים")

print("\n" + "=" * 100)
print("✨ עדכון חומרי הלימוד הושלם!")
print("=" * 100)
print("""
📁 המיפוי נשמר ב: materials_guides_mapping.json
🎯 כל החומרים עם קישורים למדריכים רלוונטיים!
""")
