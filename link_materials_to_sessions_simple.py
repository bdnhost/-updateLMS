"""
🔗 שיוך חומרים לסשנים - עדכון מקיף (גרסה פשוטה)
עובד עם הקבצים הקיימים + API
"""

import requests
import json
import time
import csv
from collections import defaultdict

API_KEY = 'c0ce546b5661436dacb7a2060b10c9a5'
APP_ID = '693824c5c1ad33c1f114ebd2'
ORG_ID = '69391901350762829f9a50b1'

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

def extract_keywords(text):
    """חלץ מילות מפתח מטקסט"""
    if not text:
        return []

    text_lower = text.lower()
    keywords = []

    keyword_categories = {
        'plc': ['plc', 'ladder', 'modbus', 'hmi', 'industrial', 'automation', 'אוטומציה', 'תעשייתי'],
        'ai': ['ai', 'בינה', 'מלאכותית', 'chatgpt', 'prompt', 'claude', 'gemini'],
        'python': ['python', 'פייתון', 'קוד', 'תכנות', 'programming', 'code'],
        'data': ['data', 'נתונים', 'analytics', 'excel', 'dashboard', 'ניתוח'],
        'automotive': ['רכב', 'automotive', 'car', 'obd', 'adas', 'vehicle'],
        'iot': ['iot', 'sensor', 'connected', 'מחובר', 'חיישן', 'ענן'],
        'business': ['roi', 'strategy', 'אסטרטגיה', 'תוכנית', 'עסקי', 'business'],
        'presentation': ['הצגה', 'presentation', 'portfolio', 'project', 'פרויקט'],
        'timers': ['timer', 'counter', 'טיימר', 'ספירה'],
        'communication': ['modbus', 'תקשורת', 'communication', 'protocol'],
        'control': ['pid', 'control', 'בקרה', 'regulation'],
        'design': ['design', 'עיצוב', 'planning', 'תכנון']
    }

    for category, words in keyword_categories.items():
        if any(word in text_lower for word in words):
            keywords.append(category)

    return keywords

def calculate_relevance_score(material, session_keywords, course_id):
    """חשב ציון רלוונטיות"""
    score = 0

    material_title = (material.get('title', '') or '').lower()
    material_topic = (material.get('topic', '') or '').lower()
    material_desc = (material.get('description', '') or '').lower()
    material_course_id = material.get('course_id', '')

    if material_course_id == course_id:
        score += 20

    material_keywords = extract_keywords(material_title + ' ' + material_topic + ' ' + material_desc)
    matching_keywords = set(session_keywords) & set(material_keywords)
    score += len(matching_keywords) * 10

    for keyword in session_keywords:
        if keyword in material_title:
            score += 15
        if keyword in material_topic:
            score += 10
        if keyword in material_desc:
            score += 3

    return score

def find_materials_for_session(session, all_materials):
    """מצא חומרים רלוונטיים לסשן"""
    session_title = session.get('title', '')
    session_desc = session.get('description', '')
    session_objectives = session.get('objectives', '')
    course_id = session.get('course_id', '')

    combined_text = f"{session_title} {session_desc} {session_objectives}"
    session_keywords = extract_keywords(combined_text)

    if not session_keywords:
        course_materials = [m for m in all_materials if m.get('course_id') == course_id]
        return course_materials[:3] if course_materials else []

    scored_materials = []
    for material in all_materials:
        score = calculate_relevance_score(material, session_keywords, course_id)
        if score > 0:
            scored_materials.append((material, score))

    scored_materials.sort(key=lambda x: x[1], reverse=True)

    top_materials = []
    for material, score in scored_materials[:6]:
        if score >= 20 and len(top_materials) < 4:
            top_materials.append(material)

    if len(top_materials) < 2 and scored_materials:
        top_materials = [m[0] for m in scored_materials[:2]]

    return top_materials

print("=" * 100)
print("🔗 שיוך חומרים לסשנים - עדכון מקיף")
print("=" * 100)

# ============================================================================
# שלב 1: טעינת נתונים
# ============================================================================

print("\n📂 שלב 1: טעינת נתונים...\n")

# קרא סשנים מ-CSV
sessions = []
with open('CourseSession_export.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        sessions.append(row)
print(f"✅ נטענו {len(sessions)} סשנים")

# קרא SessionMaterials קיימים מ-CSV
existing_session_materials = defaultdict(list)
with open('SessionMaterial_export.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        session_id = row.get('session_id', '')
        material_id = row.get('material_id', '')
        if session_id and material_id:
            existing_session_materials[session_id].append(material_id)
print(f"✅ נטענו {len(existing_session_materials)} קישורי חומרים קיימים")

# קבל חומרים מ-API (במקום CSV)
print("📥 קורא חומרים מה-API...")
try:
    materials_response = make_api_request(
        f'apps/{APP_ID}/entities/Material',
        data={'limit': 200}
    )

    if isinstance(materials_response, list):
        materials = materials_response
    else:
        materials = materials_response.get('data', [])

    print(f"✅ נטענו {len(materials)} חומרים מה-API")
except Exception as e:
    print(f"❌ שגיאה בקריאת חומרים: {e}")
    materials = []

# ============================================================================
# שלב 2: זיהוי סשנים ללא חומרים
# ============================================================================

print("\n" + "=" * 100)
print("🔍 שלב 2: זיהוי סשנים ללא חומרים")
print("=" * 100)

sessions_without_materials = []
for session in sessions:
    session_id = session.get('id', '')
    if session_id and session_id not in existing_session_materials:
        sessions_without_materials.append(session)

print(f"\n📊 נמצאו {len(sessions_without_materials)} סשנים ללא חומרים מתוך {len(sessions)}\n")

sessions_by_course = defaultdict(list)
for session in sessions_without_materials:
    course_id = session.get('course_id', '')
    sessions_by_course[course_id].append(session)

print("פירוט לפי קורס:")
for course_id, course_sessions in sorted(sessions_by_course.items(), key=lambda x: len(x[1]), reverse=True):
    print(f"   • {course_id}: {len(course_sessions)} סשנים")

# ============================================================================
# שלב 3: מיפוי חומרים לסשנים
# ============================================================================

print("\n" + "=" * 100)
print("🧠 שלב 3: מיפוי חכם - חומרים לסשנים")
print("=" * 100)

session_materials_mapping = {}

if sessions_without_materials and materials:
    print(f"\n📋 מנתח {len(sessions_without_materials)} סשנים ומוצא חומרים רלוונטיים...\n")

    for i, session in enumerate(sessions_without_materials, 1):
        session_id = session.get('id', '')
        session_title = session.get('title', 'ללא כותרת')
        course_id = session.get('course_id', '')

        relevant_materials = find_materials_for_session(session, materials)

        session_materials_mapping[session_id] = {
            'course_id': course_id,
            'title': session_title,
            'material_ids': [m.get('id') for m in relevant_materials],
            'material_titles': [m.get('title', 'ללא כותרת') for m in relevant_materials]
        }

        print(f"{i}. {session_title[:70]}")
        print(f"   קורס: {course_id}")
        print(f"   💡 {len(relevant_materials)} חומרים רלוונטיים:")
        for j, material in enumerate(relevant_materials, 1):
            print(f"      {j}. {material.get('title', 'ללא כותרת')[:55]}")
        print()

    with open('session_materials_mapping.json', 'w', encoding='utf-8') as f:
        json.dump(session_materials_mapping, f, ensure_ascii=False, indent=2)

    print(f"✅ מיפוי נשמר ל-session_materials_mapping.json")
else:
    print("⚠️  לא נמצאו סשנים או חומרים")

# ============================================================================
# שלב 4: עדכון במערכת (מוערם)
# ============================================================================

print("\n" + "=" * 100)
print("🔄 שלב 4: עדכון SessionMaterial במערכת")
print("=" * 100)

print("\n💡 כדי לעדכן את המערכת, הסר את ה-comment מהקוד למטה:\n")

# הסר את ה-""" כדי להפעיל את העדכון
"""
if session_materials_mapping:
    print("\n🚀 מתחיל עדכון SessionMaterials...\n")

    created_count = 0
    failed_count = 0

    for session_id, mapping in session_materials_mapping.items():
        course_id = mapping['course_id']
        material_ids = mapping['material_ids']

        for order_idx, material_id in enumerate(material_ids):
            try:
                create_data = {
                    'organization_id': ORG_ID,
                    'course_id': course_id,
                    'session_id': session_id,
                    'material_id': material_id,
                    'order': order_idx,
                    'is_mandatory': False
                }

                response = make_api_request(
                    f'apps/{APP_ID}/entities/SessionMaterial',
                    method='POST',
                    data=create_data
                )

                created_count += 1
                print(f"✅ סשן {session_id[:12]}... → חומר {material_id[:12]}...")

                time.sleep(0.2)

            except Exception as e:
                failed_count += 1
                error_msg = str(e)[:80]
                print(f"❌ שגיאה: {error_msg}")

    print(f"\n" + "=" * 100)
    print("✨ סיום עדכון!")
    print("=" * 100)
    print(f"✅ נוצרו: {created_count} קישורי SessionMaterial")
    print(f"❌ כשלונות: {failed_count}")
"""

# ============================================================================
# שלב 5: סטטיסטיקה
# ============================================================================

print("\n" + "=" * 100)
print("📊 סטטיסטיקה וסיכום")
print("=" * 100)

if session_materials_mapping:
    total_links = sum(len(m['material_ids']) for m in session_materials_mapping.values())
    avg_links = total_links / len(session_materials_mapping) if session_materials_mapping else 0

    print(f"\n📈 סטטיסטיקה:")
    print(f"   • סה\"כ סשנים שעודכנו: {len(session_materials_mapping)}")
    print(f"   • סה\"כ קישורי חומרים חדשים: {total_links}")
    print(f"   • ממוצע חומרים לסשן: {avg_links:.1f}")

    distribution = defaultdict(int)
    for mapping in session_materials_mapping.values():
        num_materials = len(mapping['material_ids'])
        distribution[num_materials] += 1

    print(f"\n📊 חלוקה לפי מספר חומרים:")
    for num in sorted(distribution.keys()):
        count = distribution[num]
        print(f"   • {num} חומרים: {count} סשנים")

    by_course = defaultdict(int)
    for mapping in session_materials_mapping.values():
        course_id = mapping['course_id']
        by_course[course_id] += 1

    print(f"\n🎓 חלוקה לפי קורס:")
    for course_id, count in sorted(by_course.items(), key=lambda x: x[1], reverse=True):
        print(f"   • {course_id}: {count} סשנים עודכנו")

print("\n" + "=" * 100)
print("✨ המיפוי החכם הושלם!")
print("=" * 100)
print("""
💡 השלבים הבאים:
   1. בדוק את session_materials_mapping.json
   2. אם המיפוי נראה טוב, הסר את ה-comment בשלב 4
   3. הרץ שוב את הסקריפט לעדכון המערכת

📁 המיפוי נשמר ב: session_materials_mapping.json
🎯 אחרי העדכון, כל הסשנים יהיו עם חומרים!
""")
