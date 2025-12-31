# -*- coding: utf-8 -*-
"""
🔗 שיוך חומרים למטלות - עדכון מקיף (גרסה פשוטה)
עובד עם הקבצים הקיימים + API
"""

import requests
import json
import time
import csv
from collections import defaultdict, Counter

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

def extract_assignment_keywords(assignment_title, assignment_desc='', assignment_category=''):
    """חלץ מילות מפתח ממטלה"""
    combined = f"{assignment_title} {assignment_desc} {assignment_category}".lower()

    keywords = []

    keyword_mapping = {
        'plc': ['plc', 'ladder', 'modbus', 'hmi', 'industrial', 'אוטומציה', 'תעשייתי'],
        'ai': ['ai', 'בינה', 'chatgpt', 'prompt', 'claude', 'gemini', 'llm'],
        'python': ['python', 'פייתון', 'קוד', 'code', 'programming', 'תכנות'],
        'data': ['data', 'נתונים', 'analytics', 'ניתוח', 'dashboard', 'excel'],
        'automotive': ['רכב', 'automotive', 'car', 'obd', 'adas', 'vehicle', 'מכונית'],
        'iot': ['iot', 'sensor', 'connected', 'חיישן', 'מחובר'],
        'presentation': ['הצגה', 'presentation', 'portfolio', 'פרויקט', 'project'],
        'chatbot': ['chatbot', 'bot', 'שיחה', 'conversation'],
        'vision': ['vision', 'ראייה', 'camera', 'image', 'תמונה'],
        'timers': ['timer', 'counter', 'טיימר', 'ספירה'],
        'control': ['pid', 'control', 'בקרה', 'regulation'],
        'communication': ['modbus', 'תקשורת', 'communication'],
        'design': ['design', 'עיצוב', 'תכנון', 'planning']
    }

    for category, words in keyword_mapping.items():
        if any(word in combined for word in words):
            keywords.append(category)

    return keywords

def calculate_assignment_material_score(material, assignment_keywords, course_id, assignment_category=''):
    """חשב ציון רלוונטיות בין חומר למטלה"""
    score = 0

    material_title = (material.get('title', '') or '').lower()
    material_topic = (material.get('topic', '') or '').lower()
    material_desc = (material.get('description', '') or '').lower()
    material_type = (material.get('type', '') or '').lower()
    material_course_id = material.get('course_id', '')

    # בונוס גדול אם מאותו קורס
    if material_course_id == course_id:
        score += 25

    # התאמת מילות מפתח
    material_keywords = extract_assignment_keywords(material_title, material_desc, material_topic)
    matching_keywords = set(assignment_keywords) & set(material_keywords)
    score += len(matching_keywords) * 12

    # בונוס לפי מילות מפתח בכותרת החומר
    for keyword in assignment_keywords:
        if keyword in material_title:
            score += 15
        if keyword in material_topic:
            score += 10
        if keyword in material_desc:
            score += 3

    # בונוס לפי סוג חומר וקטגוריית מטלה
    assignment_category_lower = assignment_category.lower()

    preferred_types = {
        'תרגול': ['guide', 'tutorial', 'document'],
        'homework': ['guide', 'tutorial', 'document'],
        'פרויקט': ['guide', 'examples', 'presentation'],
        'project': ['guide', 'examples', 'presentation'],
        'בוחן': ['document', 'guide', 'lexicon'],
        'quiz': ['document', 'guide', 'lexicon'],
        'exam': ['document', 'guide', 'lexicon'],
        'מעבדה': ['tutorial', 'code', 'examples'],
        'lab': ['tutorial', 'code', 'examples']
    }

    for category_key, types in preferred_types.items():
        if category_key in assignment_category_lower and material_type in types:
            score += 8

    return score

def find_materials_for_assignment(assignment, all_materials, max_materials=5):
    """מצא 3-5 חומרים רלוונטיים למטלה"""
    assignment_title = assignment.get('title', '')
    assignment_desc = assignment.get('description', '')
    assignment_category = assignment.get('category', '')
    course_id = assignment.get('course_id', '')

    assignment_keywords = extract_assignment_keywords(assignment_title, assignment_desc, assignment_category)

    if not assignment_keywords:
        course_materials = [m for m in all_materials if m.get('course_id') == course_id]
        return course_materials[:3] if course_materials else []

    scored_materials = []
    for material in all_materials:
        score = calculate_assignment_material_score(material, assignment_keywords, course_id, assignment_category)
        if score > 0:
            scored_materials.append((material, score))

    scored_materials.sort(key=lambda x: x[1], reverse=True)

    top_materials = []
    for material, score in scored_materials[:max_materials + 2]:
        if score >= 25 and len(top_materials) < max_materials:
            top_materials.append((material, score))

    if len(top_materials) < 3 and scored_materials:
        top_materials = scored_materials[:3]

    return [m[0] for m in top_materials]

print("=" * 100)
print("🔗 שיוך חומרים למטלות - עדכון מקיף")
print("=" * 100)

# ============================================================================
# שלב 1: טעינת נתונים
# ============================================================================

print("\n📂 שלב 1: טעינת נתונים...\n")

# קבל חומרים מ-API
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

# קבל מטלות מכל הקורסים מ-API
print("\n📥 קורא מטלות מכל הקורסים...\n")

# קרא סשנים מ-CSV לקבל רשימת קורסים
course_ids = set()
with open('CourseSession_export.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        course_id = row.get('course_id')
        if course_id:
            course_ids.add(course_id)

print(f"מצאתי {len(course_ids)} קורסים פעילים")

# קבל מטלות לכל קורס
all_assignments = []
for i, course_id in enumerate(course_ids, 1):
    try:
        print(f"   {i}. קורא מטלות מקורס {course_id}...")
        assignments_response = make_api_request(
            f'apps/{APP_ID}/entities/Assignment',
            data={'course_id': course_id}
        )

        if isinstance(assignments_response, list):
            course_assignments = assignments_response
        else:
            course_assignments = assignments_response.get('data', [])

        all_assignments.extend(course_assignments)
        print(f"      ✅ {len(course_assignments)} מטלות")

        time.sleep(0.5)

    except Exception as e:
        print(f"      ⚠️  שגיאה: {str(e)[:50]}")

print(f"\n✅ סה\"כ נטענו {len(all_assignments)} מטלות מכל הקורסים")

# ============================================================================
# שלב 2: מיפוי חומרים למטלות
# ============================================================================

print("\n" + "=" * 100)
print("🧠 שלב 2: מיפוי חכם - חומרים למטלות")
print("=" * 100)

assignment_materials_mapping = {}

if all_assignments and materials:
    print(f"\n📋 מנתח {len(all_assignments)} מטלות ומוצא חומרים רלוונטיים...\n")

    for i, assignment in enumerate(all_assignments, 1):
        assignment_id = assignment.get('id', '')
        assignment_title = assignment.get('title', 'ללא כותרת')
        assignment_category = assignment.get('category', '')
        course_id = assignment.get('course_id', '')

        relevant_materials = find_materials_for_assignment(assignment, materials, max_materials=5)

        assignment_materials_mapping[assignment_id] = {
            'course_id': course_id,
            'title': assignment_title,
            'category': assignment_category,
            'material_ids': [m.get('id') for m in relevant_materials],
            'material_titles': [m.get('title', 'ללא כותרת') for m in relevant_materials]
        }

        if i <= 10 or len(relevant_materials) > 0:  # הצג רק 10 ראשונות או אלה עם חומרים
            print(f"{i}. {assignment_title[:70]}")
            print(f"   💡 {len(relevant_materials)} חומרים רלוונטיים")
            if i <= 5:  # פרט רק ל-5 הראשונות
                for j, material in enumerate(relevant_materials, 1):
                    print(f"      {j}. {material.get('title', 'ללא כותרת')[:55]}")
            print()

    with open('assignment_materials_mapping.json', 'w', encoding='utf-8') as f:
        json.dump(assignment_materials_mapping, f, ensure_ascii=False, indent=2)

    print(f"✅ מיפוי נשמר ל-assignment_materials_mapping.json")
else:
    print("⚠️  לא נמצאו מטלות או חומרים")

# ============================================================================
# שלב 3: עדכון במערכת
# ============================================================================

print("\n" + "=" * 100)
print("🔄 שלב 3: עדכון AssignmentMaterial במערכת")
print("=" * 100)

if assignment_materials_mapping:
    print("\n🚀 מתחיל עדכון AssignmentMaterials...\n")

    created_count = 0
    failed_count = 0

    for assignment_id, mapping in assignment_materials_mapping.items():
        material_ids = mapping['material_ids']

        for material_id in material_ids:
            try:
                create_data = {
                    'organization_id': ORG_ID,
                    'assignment_id': assignment_id,
                    'material_id': material_id,
                    'is_reference': True
                }

                response = make_api_request(
                    f'apps/{APP_ID}/entities/AssignmentMaterial',
                    method='POST',
                    data=create_data
                )

                created_count += 1
                print(f"✅ מטלה {assignment_id[:12]}... → חומר {material_id[:12]}...")

                time.sleep(0.2)

            except Exception as e:
                failed_count += 1
                error_msg = str(e)[:80]
                # רק הדפס אם זו לא שגיאה של "כבר קיים"
                if 'duplicate' not in error_msg.lower() and 'already' not in error_msg.lower():
                    print(f"⚠️  שגיאה: {error_msg}")

    print(f"\n" + "=" * 100)
    print("✨ סיום עדכון!")
    print("=" * 100)
    print(f"✅ נוצרו: {created_count} קישורי AssignmentMaterial")
    if failed_count > 0:
        print(f"⚠️  דילוגים (כבר קיים או שגיאות): {failed_count}")

# ============================================================================
# שלב 4: סטטיסטיקה
# ============================================================================

print("\n" + "=" * 100)
print("📊 סטטיסטיקה וסיכום")
print("=" * 100)

if assignment_materials_mapping:
    total_links = sum(len(m['material_ids']) for m in assignment_materials_mapping.values())
    avg_links = total_links / len(assignment_materials_mapping) if assignment_materials_mapping else 0

    print(f"\n📈 סטטיסטיקה:")
    print(f"   • סה\"כ מטלות שעודכנו: {len(assignment_materials_mapping)}")
    print(f"   • סה\"כ קישורי חומרים: {total_links}")
    print(f"   • ממוצע חומרים למטלה: {avg_links:.1f}")

    distribution = Counter(len(m['material_ids']) for m in assignment_materials_mapping.values())

    print(f"\n📊 חלוקה לפי מספר חומרים:")
    for num in sorted(distribution.keys()):
        count = distribution[num]
        print(f"   • {num} חומרים: {count} מטלות")

    by_course = Counter(m['course_id'] for m in assignment_materials_mapping.values())

    print(f"\n🎓 חלוקה לפי קורס (10 הקורסים עם הכי הרבה מטלות):")
    for course_id, count in by_course.most_common(10):
        print(f"   • {course_id}: {count} מטלות עודכנו")

print("\n" + "=" * 100)
print("✨ שיוך החומרים למטלות הושלם!")
print("=" * 100)
print("""
📁 המיפוי נשמר ב: assignment_materials_mapping.json
🎯 כל המטלות עם חומרים רלוונטיים!
""")
