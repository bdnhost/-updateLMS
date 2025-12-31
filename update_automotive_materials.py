"""
📚 עדכון Materials - קורס AI להנדסאי רכב שנה א'
Course ID: 6942ae4afed1bf7040557a50

עדכון חומרי לימוד עם קישורים רלוונטיים ל-37 המדריכים
"""

import requests
import json
import time

API_KEY = 'c0ce546b5661436dacb7a2060b10c9a5'
APP_ID = '693824c5c1ad33c1f114ebd2'
COURSE_ID = '6942ae4afed1bf7040557a50'

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
                print(f"⚠️ ניסיון {attempt + 1}/{retries} נכשל, מחכה {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise e

# ============================================================================
# מדריכים רלוונטיים לקורס AI רכב
# ============================================================================

GUIDES = {
    # Digital Basics
    "terminal": "https://bdnhost.net/Resources/guides/digital-basics/terminal_guide.html",
    "github": "https://bdnhost.net/Resources/guides/digital-basics/github_guide.html",
    "file_management": "https://bdnhost.net/Resources/guides/digital-basics/file-management.html",
    "internet_basics": "https://bdnhost.net/Resources/guides/digital-basics/internet_basics.html",
    "algorithmic_thinking": "https://bdnhost.net/Resources/guides/digital-basics/algorithmic_thinking.html",
    "digital_literacy": "https://bdnhost.net/Resources/guides/digital-basics/digital_literacy_basics_guide.html",
    "cv_guide": "https://bdnhost.net/Resources/guides/digital-basics/cv_guide.html",

    # AI & Automation
    "python": "https://bdnhost.net/Resources/guides/ai-automation/python_guide.html",
    "chatgpt": "https://bdnhost.net/Resources/guides/ai-automation/chatgpt_guide.html",
    "prompt_engineering": "https://bdnhost.net/Resources/guides/ai-automation/prompt-engineering-guide.html",
    "llm": "https://bdnhost.net/Resources/guides/ai-automation/understanding-llms-how-it-works.html",
    "web_scraping": "https://bdnhost.net/Resources/guides/ai-automation/web_scraping_guide.html",
    "react": "https://bdnhost.net/Resources/guides/ai-automation/react-pro-guide.html",
    "agentic_ai": "https://bdnhost.net/Resources/guides/ai-automation/agentic-ai-for-managers.html",
    "ai_basics": "https://bdnhost.net/Resources/guides/ai-automation/ai_basics.html",
    "ai_ethics": "https://bdnhost.net/Resources/guides/ai-automation/ai_ethics.html",
    "ai_for_educators": "https://bdnhost.net/Resources/guides/ai-automation/guide-comprehensive-ai-applications-for-educators.html",
    "transformers": "https://bdnhost.net/Resources/guides/ai-automation/transformers-overview.html",

    # Data & Business
    "sql": "https://bdnhost.net/Resources/guides/data-business/sql_guide.html",
    "data_analysis": "https://bdnhost.net/Resources/guides/data-business/data_analysis_guide.html",
    "excel": "https://bdnhost.net/Resources/guides/data-business/excel_student.html",
    "powerbi": "https://bdnhost.net/Resources/guides/data-business/powerbi_guide.html",

    # Technology
    "docker": "https://bdnhost.net/Resources/guides/technology/docker-usage-guide.html",
    "iot": "https://bdnhost.net/Resources/guides/technology/iot_guide.html",
    "automotive": "https://bdnhost.net/Resources/guides/technology/automotive_guide.html",

    # Creative Studio
    "mechanical_design": "https://bdnhost.net/Resources/guides/creative-studio/mechanical_design_guide.html",

    # Career
    "career_prep": "https://bdnhost.net/Resources/guides/career/career_prep.html",
    "portfolio": "https://bdnhost.net/Resources/guides/career/building-impressive-digital-portfolio.html",
    "presentation": "https://bdnhost.net/Resources/guides/career/presentation_skills.html",
}

def get_relevant_guides(material_title, material_type="", material_topic=""):
    """זהה קישורים רלוונטיים בהתבסס על כותרת וסוג החומר"""
    relevant = []
    title_lower = (material_title or "").lower()
    topic_lower = (material_topic or "").lower()

    # AI כלי ומושגים
    if any(word in title_lower for word in ["ai", "בינה", "מלאכותית", "chatgpt", "claude", "gemini"]):
        relevant.extend([GUIDES["ai_basics"], GUIDES["chatgpt"], GUIDES["prompt_engineering"]])

    # Prompt Engineering
    if any(word in title_lower for word in ["prompt", "פרומפט", "הנחי", "שאיל"]):
        relevant.extend([GUIDES["prompt_engineering"], GUIDES["chatgpt"], GUIDES["llm"]])

    # רכבים אוטונומיים ו-ADAS
    if any(word in title_lower for word in ["אוטונומי", "autonomous", "adas", "self-driving", "tesla", "waymo"]):
        relevant.extend([GUIDES["automotive"], GUIDES["ai_basics"], GUIDES["cv_guide"]])

    # OBD-II ואבחון
    if any(word in title_lower for word in ["obd", "אבחון", "diagnostic", "תקלה", "dtc", "קוד"]):
        relevant.extend([GUIDES["automotive"], GUIDES["python"], GUIDES["data_analysis"]])

    # Python
    if any(word in title_lower for word in ["python", "קוד", "תכנות", "סקריפט", "coding"]):
        relevant.extend([GUIDES["python"], GUIDES["algorithmic_thinking"], GUIDES["terminal"]])

    # Pandas וניתוח נתונים
    if any(word in title_lower for word in ["pandas", "data", "נתונים", "ניתוח", "csv", "excel"]):
        relevant.extend([GUIDES["data_analysis"], GUIDES["python"], GUIDES["excel"]])

    # Computer Vision
    if any(word in title_lower for word in ["vision", "ראייה", "תמונה", "camera", "lidar", "radar", "זיהוי"]):
        relevant.extend([GUIDES["cv_guide"], GUIDES["ai_basics"], GUIDES["automotive"]])

    # ADAS מערכות
    if any(word in title_lower for word in ["acc", "lane", "brake", "parking", "blind spot", "סיוע"]):
        relevant.extend([GUIDES["automotive"], GUIDES["ai_basics"]])

    # תחזוקה מונעת
    if any(word in title_lower for word in ["תחזוקה", "maintenance", "predictive", "חיזוי", "תקלה"]):
        relevant.extend([GUIDES["automotive"], GUIDES["python"], GUIDES["data_analysis"]])

    # Chatbots
    if any(word in title_lower for word in ["chatbot", "bot", "צ'אט", "שיחה"]):
        relevant.extend([GUIDES["chatgpt"], GUIDES["python"], GUIDES["llm"]])

    # IoT ורכבים מחוברים
    if any(word in title_lower for word in ["iot", "מחובר", "connected", "v2v", "v2i", "ota"]):
        relevant.extend([GUIDES["iot"], GUIDES["automotive"], GUIDES["ai_basics"]])

    # אתיקה
    if any(word in title_lower for word in ["אתיקה", "ethics", "trolley", "פרטיות", "privacy"]):
        relevant.extend([GUIDES["ai_ethics"], GUIDES["ai_basics"]])

    # Terminal
    if any(word in title_lower for word in ["terminal", "command", "cli", "שורת פקודה"]):
        relevant.extend([GUIDES["terminal"], GUIDES["file_management"]])

    # פרויקט
    if any(word in title_lower for word in ["פרויקט", "project", "הצגה", "presentation"]):
        relevant.extend([GUIDES["presentation"], GUIDES["portfolio"], GUIDES["github"]])

    # ברירת מחדל אם לא מצאנו התאמה
    if not relevant:
        relevant.extend([GUIDES["automotive"], GUIDES["ai_basics"], GUIDES["python"]])

    # הסר כפילויות ושמור רק 3-4 ראשונים
    unique_relevant = []
    for link in relevant:
        if link not in unique_relevant:
            unique_relevant.append(link)

    return unique_relevant[:4]  # מקסימום 4 קישורים

print("=" * 100)
print("📚 עדכון Materials - קורס AI להנדסאי רכב")
print("=" * 100)

# ============================================================================
# שלב 1: קריאת חומרים קיימים
# ============================================================================

print("\n🔍 שלב 1: קריאת חומרים קיימים...")
try:
    materials_response = make_api_request(
        f'apps/{APP_ID}/entities/Material',
        data={'course_id': COURSE_ID}
    )

    if isinstance(materials_response, list):
        existing_materials = materials_response
    else:
        existing_materials = materials_response.get('data', [])

    print(f"✅ נמצאו {len(existing_materials)} חומרים קיימים\n")

    # הצג 10 חומרים ראשונים כדוגמה
    print("📄 דוגמאות חומרים קיימים:")
    for i, material in enumerate(existing_materials[:10], 1):
        print(f"\n{i}. {material.get('title', 'ללא כותרת')}")
        print(f"   ID: {material.get('id')}")
        print(f"   סוג: {material.get('type', 'N/A')} | נושא: {material.get('topic', 'N/A')}")

        # הצע קישורים רלוונטיים
        suggested_guides = get_relevant_guides(
            material.get('title', ''),
            material.get('type', ''),
            material.get('topic', '')
        )
        print(f"   💡 קישורים מוצעים: {len(suggested_guides)}")

    if len(existing_materials) > 10:
        print(f"\n... ועוד {len(existing_materials) - 10} חומרים")

except Exception as e:
    print(f"❌ שגיאה: {e}")
    existing_materials = []

# ============================================================================
# שלב 2: עדכון חומרים עם קישורים רלוונטיים
# ============================================================================

print("\n" + "=" * 100)
print("🔄 שלב 2: עדכון חומרים עם קישורים רלוונטיים")
print("=" * 100)

if len(existing_materials) > 0:
    print(f"\n📝 מעדכן {len(existing_materials)} חומרים...")
    print("⚠️ הסר את ה-comment מהקוד למטה כדי להריץ עדכון!\n")

    # הסר comment כדי להריץ עדכון
    """
    updated_count = 0
    failed_count = 0

    for i, material in enumerate(existing_materials, 1):
        material_id = material.get('id')
        title = material.get('title', 'ללא כותרת')
        material_type = material.get('type', '')
        topic = material.get('topic', '')

        try:
            # קבל קישורים רלוונטיים
            relevant_guides = get_relevant_guides(title, material_type, topic)

            # הכן נתונים לעדכון
            update_data = {
                "resource_links": relevant_guides
            }

            # בצע עדכון
            response = make_api_request(
                f'apps/{APP_ID}/entities/Material/{material_id}',
                method='PUT',
                data=update_data
            )

            updated_count += 1

            # הדפס פיד-בק כל 10 חומרים
            if i % 10 == 0:
                print(f"✅ עדכנו {i}/{len(existing_materials)} חומרים...")

            # המתנה קצרה למניעת rate limiting
            time.sleep(0.1)

        except Exception as e:
            failed_count += 1
            print(f"❌ Material {i} ({title[:40]}): {str(e)[:60]}")

    print(f"\n" + "=" * 100)
    print(f"✅ סיום עדכון חומרים!")
    print(f"=" * 100)
    print(f"✨ הצלחה: {updated_count}/{len(existing_materials)}")
    print(f"❌ כשלונות: {failed_count}/{len(existing_materials)}")
    print(f"📊 אחוז הצלחה: {(updated_count/len(existing_materials)*100):.1f}%")
    """

    print("💡 הקוד מוכן - הסר את ה-comment \"\"\" מסביב לקוד כדי להריץ!")

else:
    print("\n⚠️ לא נמצאו חומרים קיימים.")
    print("💡 אפשר ליצור חומרים חדשים דרך הממשק.")

# ============================================================================
# שלב 3: סיכום מיפוי חכם
# ============================================================================

print("\n" + "=" * 100)
print("🧠 מיפוי חכם של קישורים לפי נושאים")
print("=" * 100)

keyword_mapping = {
    "AI כללי": ["ai_basics", "chatgpt", "prompt_engineering"],
    "רכבים אוטונומיים": ["automotive", "ai_basics", "cv_guide"],
    "OBD-II ואבחון": ["automotive", "python", "data_analysis"],
    "Python ותכנות": ["python", "algorithmic_thinking", "terminal"],
    "ניתוח נתונים": ["data_analysis", "python", "excel"],
    "Computer Vision": ["cv_guide", "ai_basics", "automotive"],
    "ADAS": ["automotive", "ai_basics"],
    "תחזוקה מונעת": ["automotive", "python", "data_analysis"],
    "Chatbots": ["chatgpt", "python", "llm"],
    "IoT": ["iot", "automotive", "ai_basics"],
    "אתיקה": ["ai_ethics", "ai_basics"],
    "פרויקטים": ["presentation", "portfolio", "github"]
}

print("\n📋 מיפוי מילות מפתח לקישורים:")
for category, guide_keys in keyword_mapping.items():
    print(f"\n🔹 {category}:")
    for key in guide_keys:
        print(f"   • {GUIDES.get(key, 'N/A')}")

print("\n" + "=" * 100)
print("✨ סיכום")
print("=" * 100)
print(f"✅ הקוד מזהה אוטומטית נושאים בכותרות החומרים")
print(f"✅ מוסיף 3-4 קישורים רלוונטיים לכל חומר")
print(f"✅ משתמש ב-{len(GUIDES)} מדריכים שונים")
print("\n💡 הסר את ה-comment בקוד כדי לעדכן את כל החומרים!")
print("🎯 כל חומר יקבל קישורים מותאמים לנושא שלו! 🚗💨")
