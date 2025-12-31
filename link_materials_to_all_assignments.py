"""
🔗 שיוך חומרים למטלות - עדכון מקיף לכל המערכת
משייך חומרים רלוונטיים לכל המטלות בכל הקורסים
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

    # קטגוריות ספציפיות למטלות
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

    # מיפוי סוגי חומרים מועדפים לפי קטגוריות מטלות
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

    # חלץ מילות מפתח
    assignment_keywords = extract_assignment_keywords(assignment_title, assignment_desc, assignment_category)

    if not assignment_keywords:
        # אם לא נמצאו מילות מפתח, קח חומרים מאותו קורס
        course_materials = [m for m in all_materials if m.get('course_id') == course_id]
        return course_materials[:3] if course_materials else []

    # חשב ציון לכל חומר
    scored_materials = []
    for material in all_materials:
        score = calculate_assignment_material_score(material, assignment_keywords, course_id, assignment_category)
        if score > 0:
            scored_materials.append((material, score))

    # מיין לפי ציון והחזר את הטובים ביותר
    scored_materials.sort(key=lambda x: x[1], reverse=True)

    # קח 3-5 חומרים עם ציון טוב
    top_materials = []
    for material, score in scored_materials[:max_materials + 2]:  # בדוק כמה נוספים
        if score >= 25 and len(top_materials) < max_materials:  # מינימום ציון 25
            top_materials.append((material, score))

    # אם לא נמצאו מספיק, קח לפחות 3
    if len(top_materials) < 3 and scored_materials:
        top_materials = scored_materials[:3]

    return [m[0] for m in top_materials]

print("=" * 100)
print("🔗 שיוך חומרים למטלות - עדכון מקיף לכל המערכת")
print("=" * 100)

# ============================================================================
# שלב 1: טעינת נתונים
# ============================================================================

print("\n📂 שלב 1: טעינת נתונים...\n")

# קרא חומרים מ-CSV
materials = []
with open('Material_export.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        materials.append(row)
print(f"✅ נטענו {len(materials)} חומרים")

# קרא AssignmentMaterials קיימים מ-CSV
existing_assignment_materials = defaultdict(list)
with open('AssignmentMaterial_export.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        assignment_id = row.get('assignment_id', '')
        material_id = row.get('material_id', '')
        if assignment_id and material_id:
            existing_assignment_materials[assignment_id].append(material_id)
print(f"✅ נטענו {len(existing_assignment_materials)} קישורי חומרים קיימים למטלות")

# קבל את כל המטלות מכל הקורסים דרך API
print("\n📥 קורא את כל המטלות מכל הקורסים דרך API...")

try:
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

            time.sleep(0.5)  # המתנה קצרה בין בקשות

        except Exception as e:
            print(f"      ⚠️  שגיאה: {str(e)[:50]}")

    print(f"\n✅ סה\"כ נטענו {len(all_assignments)} מטלות מכל הקורסים")

except Exception as e:
    print(f"❌ שגיאה בטעינת מטלות: {e}")
    all_assignments = []

# ============================================================================
# שלב 2: זיהוי מטלות שזקוקות לחומרים
# ============================================================================

print("\n" + "=" * 100)
print("🔍 שלב 2: זיהוי מטלות שזקוקות לחומרים")
print("=" * 100)

# מטלות ללא חומרים כלל
assignments_without_materials = []
for assignment in all_assignments:
    assignment_id = assignment.get('id', '')
    if assignment_id and assignment_id not in existing_assignment_materials:
        assignments_without_materials.append(assignment)

# מטלות עם מעט חומרים (פחות מ-3)
assignments_with_few_materials = []
for assignment in all_assignments:
    assignment_id = assignment.get('id', '')
    if assignment_id and assignment_id in existing_assignment_materials:
        num_materials = len(existing_assignment_materials[assignment_id])
        if num_materials < 3:
            assignments_with_few_materials.append(assignment)

print(f"\n📊 סטטיסטיקה:")
print(f"   • סה\"כ מטלות: {len(all_assignments)}")
print(f"   • מטלות ללא חומרים כלל: {len(assignments_without_materials)}")
print(f"   • מטלות עם פחות מ-3 חומרים: {len(assignments_with_few_materials)}")
print(f"   • מטלות שיעודכנו: {len(assignments_without_materials) + len(assignments_with_few_materials)}")

# נעבוד על שתי הקבוצות
assignments_to_update = assignments_without_materials + assignments_with_few_materials

# ============================================================================
# שלב 3: מיפוי חומרים למטלות
# ============================================================================

print("\n" + "=" * 100)
print("🧠 שלב 3: מיפוי חכם - חומרים למטלות")
print("=" * 100)

assignment_materials_mapping = {}

if assignments_to_update and materials:
    print(f"\n📋 מנתח {len(assignments_to_update)} מטלות ומוצא חומרים רלוונטיים...\n")

    for i, assignment in enumerate(assignments_to_update, 1):
        assignment_id = assignment.get('id', '')
        assignment_title = assignment.get('title', 'ללא כותרת')
        assignment_category = assignment.get('category', '')
        course_id = assignment.get('course_id', '')

        # קבל חומרים קיימים (אם יש)
        existing_materials = existing_assignment_materials.get(assignment_id, [])

        # מצא חומרים רלוונטיים נוספים
        relevant_materials = find_materials_for_assignment(assignment, materials, max_materials=5)

        # סנן חומרים שכבר קיימים
        new_materials = [m for m in relevant_materials if m.get('id') not in existing_materials]

        # שמור את המיפוי
        assignment_materials_mapping[assignment_id] = {
            'course_id': course_id,
            'title': assignment_title,
            'category': assignment_category,
            'existing_material_ids': existing_materials,
            'new_material_ids': [m.get('id') for m in new_materials],
            'new_material_titles': [m.get('title', 'ללא כותרת') for m in new_materials]
        }

        print(f"{i}. {assignment_title[:70]}")
        print(f"   קורס: {course_id}")
        print(f"   קטגוריה: {assignment_category}")
        print(f"   📦 חומרים קיימים: {len(existing_materials)}")
        print(f"   💡 חומרים חדשים רלוונטיים: {len(new_materials)}")
        for j, material in enumerate(new_materials, 1):
            print(f"      {j}. {material.get('title', 'ללא כותרת')[:55]}")
        print()

    # שמור את המיפוי לקובץ JSON
    with open('assignment_materials_comprehensive_mapping.json', 'w', encoding='utf-8') as f:
        json.dump(assignment_materials_mapping, f, ensure_ascii=False, indent=2)

    print(f"✅ מיפוי נשמר ל-assignment_materials_comprehensive_mapping.json")

else:
    print("⚠️  לא נמצאו מטלות או חומרים")

# ============================================================================
# שלב 4: עדכון במערכת (מוערם)
# ============================================================================

print("\n" + "=" * 100)
print("🔄 שלב 4: עדכון AssignmentMaterial במערכת")
print("=" * 100)

print("\n💡 כדי לעדכן את המערכת, הסר את ה-comment מהקוד למטה:\n")

# הסר את ה-""" כדי להפעיל את העדכון
"""
if assignment_materials_mapping:
    print("\n🚀 מתחיל עדכון AssignmentMaterials...\n")

    created_count = 0
    failed_count = 0

    for assignment_id, mapping in assignment_materials_mapping.items():
        new_material_ids = mapping['new_material_ids']

        for material_id in new_material_ids:
            try:
                # יצירת AssignmentMaterial חדש
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

                time.sleep(0.2)  # המתנה קצרה בין יצירות

            except Exception as e:
                failed_count += 1
                error_msg = str(e)[:80]
                print(f"❌ שגיאה: {error_msg}")

    print(f"\n" + "=" * 100)
    print("✨ סיום עדכון!")
    print("=" * 100)
    print(f"✅ נוצרו: {created_count} קישורי AssignmentMaterial")
    print(f"❌ כשלונות: {failed_count}")
"""

# ============================================================================
# שלב 5: סטטיסטיקה וסיכום
# ============================================================================

print("\n" + "=" * 100)
print("📊 סטטיסטיקה וסיכום")
print("=" * 100)

if assignment_materials_mapping:
    total_new_links = sum(len(m['new_material_ids']) for m in assignment_materials_mapping.values())
    total_existing_links = sum(len(m['existing_material_ids']) for m in assignment_materials_mapping.values())

    assignments_updated = len(assignment_materials_mapping)
    avg_new_links = total_new_links / assignments_updated if assignments_updated else 0

    print(f"\n📈 סטטיסטיקה:")
    print(f"   • סה\"כ מטלות שעודכנו: {assignments_updated}")
    print(f"   • סה\"כ קישורי חומרים קיימים: {total_existing_links}")
    print(f"   • סה\"כ קישורי חומרים חדשים: {total_new_links}")
    print(f"   • ממוצע חומרים חדשים למטלה: {avg_new_links:.1f}")

    # חלוקה לפי מספר חומרים חדשים
    distribution = Counter(len(m['new_material_ids']) for m in assignment_materials_mapping.values())

    print(f"\n📊 חלוקה לפי מספר חומרים חדשים:")
    for num in sorted(distribution.keys()):
        count = distribution[num]
        print(f"   • {num} חומרים חדשים: {count} מטלות")

    # חלוקה לפי קורס
    by_course = Counter(m['course_id'] for m in assignment_materials_mapping.values())

    print(f"\n🎓 חלוקה לפי קורס (10 הקורסים עם הכי הרבה מטלות):")
    for course_id, count in by_course.most_common(10):
        print(f"   • {course_id}: {count} מטלות עודכנו")

    # חלוקה לפי קטגוריה
    by_category = Counter(m.get('category', 'ללא קטגוריה') for m in assignment_materials_mapping.values())

    print(f"\n📝 חלוקה לפי קטגוריית מטלה:")
    for category, count in by_category.most_common():
        if category:
            print(f"   • {category}: {count} מטלות")

print("\n" + "=" * 100)
print("✨ המיפוי החכם הושלם!")
print("=" * 100)
print("""
💡 השלבים הבאים:
   1. בדוק את assignment_materials_comprehensive_mapping.json
   2. אם המיפוי נראה טוב, הסר את ה-comment בשלב 4
   3. הרץ שוב את הסקריפט לעדכון המערכת

📁 המיפוי נשמר ב: assignment_materials_comprehensive_mapping.json
🎯 אחרי העדכון, כל המטלות יהיו עם 3-5 חומרים רלוונטיים!
""")
