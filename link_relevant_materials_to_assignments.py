"""
🔗 קישור חומרים רלוונטיים למטלות - קורס AI להנדסאי רכב
Course ID: 6942ae4afed1bf7040557a50

סקריפט זה:
1. קורא את רשימת החומרים הרלוונטיים מ-automotive_relevant_materials.json
2. מקבל את כל המטלות מהקורס
3. משייך חומרים למטלות בצורה חכמה על סמך נושאים ומילות מפתח
4. מעדכן את המטלות במערכת עם החומרים המקושרים
"""

import requests
import json
import time
from collections import defaultdict

API_KEY = 'c0ce546b5661436dacb7a2060b10c9a5'
APP_ID = '693824c5c1ad33c1f114ebd2'
AUTOMOTIVE_COURSE_ID = '6942ae4afed1bf7040557a50'

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

def score_material_for_assignment(material, assignment_title):
    """חשב ציון התאמה בין חומר למטלה"""
    score = 0

    assignment_lower = assignment_title.lower()
    material_title = (material.get('title', '') or '').lower()
    material_topic = (material.get('topic', '') or '').lower()

    # מיפוי מילות מפתח למטלות
    keyword_mapping = {
        'ai_intro': ['היכרות', 'מבוא', 'ai', 'בינה', 'כלי'],
        'prompt': ['פרומפט', 'prompt', 'בנק', 'שאילת'],
        'autonomous': ['אוטונומי', 'autonomous', 'רכב עצמאי', 'adas'],
        'obd': ['obd', 'אבחון', 'diagnostic', 'תקלה', 'חיבור'],
        'python': ['python', 'קוד', 'תכנות', 'סקריפט', 'pandas', 'חיישנים'],
        'vision': ['vision', 'ראייה', 'תמונה', 'camera', 'זיהוי'],
        'chatbot': ['chatbot', 'bot', 'שיחה', 'נפוצות'],
        'iot': ['iot', 'מחובר', 'connected'],
        'ethics': ['אתיקה', 'ethics', 'פרטיות'],
        'project': ['פרויקט', 'project', 'הצגה', 'גמר', 'ביניים']
    }

    # מצא קטגוריות רלוונטיות למטלה
    relevant_categories = []
    for category, keywords in keyword_mapping.items():
        if any(keyword in assignment_lower for keyword in keywords):
            relevant_categories.append(category)

    # חשב ציון
    for category in relevant_categories:
        category_keywords = keyword_mapping[category]
        for keyword in category_keywords:
            if keyword in material_title:
                score += 15
            if keyword in material_topic:
                score += 10

    # בונוס לחומרים בעלי ציון גבוה מהניתוח הראשוני
    if material.get('score', 0) > 50:
        score += 5

    return score

def smart_match_materials_to_assignments(relevant_materials, assignments, max_materials_per_assignment=5):
    """שייך חומרים למטלות בצורה חכמה"""
    assignment_materials_map = {}

    for assignment in assignments:
        assignment_id = assignment.get('id')
        assignment_title = assignment.get('title', '')

        # חשב ציון לכל חומר
        scored_materials = []
        for material in relevant_materials:
            score = score_material_for_assignment(material, assignment_title)
            if score > 0:
                scored_materials.append({
                    'material': material,
                    'score': score
                })

        # מיין לפי ציון וקח את הטובים ביותר
        scored_materials.sort(key=lambda x: x['score'], reverse=True)
        top_materials = scored_materials[:max_materials_per_assignment]

        assignment_materials_map[assignment_id] = {
            'title': assignment_title,
            'materials': [item['material'] for item in top_materials],
            'scores': [item['score'] for item in top_materials]
        }

    return assignment_materials_map

print("=" * 100)
print("🔗 קישור חומרים רלוונטיים למטלות - קורס AI להנדסאי רכב")
print("=" * 100)

# ============================================================================
# שלב 1: טען את רשימת החומרים הרלוונטיים
# ============================================================================

print("\n📚 שלב 1: טעינת חומרים רלוונטיים...")

try:
    with open('automotive_relevant_materials.json', 'r', encoding='utf-8') as f:
        relevant_materials = json.load(f)

    print(f"✅ נטענו {len(relevant_materials)} חומרים רלוונטיים מהקובץ\n")

    # הצג את 10 החומרים הראשונים
    print("🏆 דוגמאות לחומרים רלוונטיים:")
    for i, material in enumerate(relevant_materials[:10], 1):
        print(f"   {i}. {material.get('title', 'ללא כותרת')[:60]} (ציון: {material.get('score', 0)})")

    if len(relevant_materials) > 10:
        print(f"   ... ועוד {len(relevant_materials) - 10} חומרים")

except FileNotFoundError:
    print("❌ לא נמצא קובץ automotive_relevant_materials.json")
    print("💡 הרץ קודם: python analyze_and_link_materials_automotive.py")
    exit(1)
except Exception as e:
    print(f"❌ שגיאה בטעינת הקובץ: {e}")
    exit(1)

# ============================================================================
# שלב 2: קבל את כל המטלות מהקורס
# ============================================================================

print("\n" + "=" * 100)
print("📋 שלב 2: קריאת מטלות הקורס...")
print("=" * 100)

try:
    assignments_response = make_api_request(
        f'apps/{APP_ID}/entities/Assignment',
        data={'course_id': AUTOMOTIVE_COURSE_ID}
    )

    if isinstance(assignments_response, list):
        assignments = assignments_response
    else:
        assignments = assignments_response.get('data', [])

    print(f"\n✅ נמצאו {len(assignments)} מטלות בקורס\n")

    print("📝 רשימת המטלות:")
    for i, assignment in enumerate(assignments, 1):
        print(f"   {i}. {assignment.get('title', 'ללא כותרת')}")

except Exception as e:
    print(f"❌ שגיאה בקריאת המטלות: {e}")
    assignments = []

# ============================================================================
# שלב 3: שיוך חכם - חומרים למטלות
# ============================================================================

print("\n" + "=" * 100)
print("🧠 שלב 3: שיוך חכם - חומרים למטלות")
print("=" * 100)

if assignments and relevant_materials:
    assignment_materials_mapping = smart_match_materials_to_assignments(
        relevant_materials,
        assignments,
        max_materials_per_assignment=5
    )

    print(f"\n✅ השיוך הושלם! {len(assignment_materials_mapping)} מטלות עם חומרים\n")

    # הצג את השיוך
    print("📊 פירוט השיוך:")
    print("=" * 100)

    for i, (assignment_id, mapping) in enumerate(assignment_materials_mapping.items(), 1):
        materials = mapping['materials']
        scores = mapping['scores']

        print(f"\n{i}. {mapping['title'][:70]}")
        print(f"   💡 {len(materials)} חומרים מקושרים:")

        for j, (material, score) in enumerate(zip(materials, scores), 1):
            material_title = material.get('title', 'ללא כותרת')
            print(f"      {j}. [{score} נקודות] {material_title[:55]}")

    # שמור את המיפוי לקובץ
    mapping_output = {}
    for assignment_id, mapping in assignment_materials_mapping.items():
        mapping_output[assignment_id] = {
            'title': mapping['title'],
            'material_ids': [m.get('id') for m in mapping['materials']],
            'material_titles': [m.get('title', 'ללא כותרת') for m in mapping['materials']],
            'scores': mapping['scores']
        }

    with open('assignment_materials_final_mapping.json', 'w', encoding='utf-8') as f:
        json.dump(mapping_output, f, ensure_ascii=False, indent=2)

    print(f"\n✅ המיפוי נשמר ל-assignment_materials_final_mapping.json")

else:
    print("⚠️  לא ניתן לבצע שיוך - חסרים מטלות או חומרים")
    assignment_materials_mapping = {}

# ============================================================================
# שלב 4: עדכון מטלות במערכת (מוערם - הסר comment להרצה)
# ============================================================================

print("\n" + "=" * 100)
print("🔄 שלב 4: עדכון מטלות במערכת")
print("=" * 100)

print("\n💡 כדי לעדכן את המטלות במערכת, הסר את ה-comment מהקוד למטה:\n")

# הסר את ה-""" כדי להפעיל את העדכון
"""
if assignment_materials_mapping:
    print("\n🚀 מתחיל עדכון מטלות...\n")

    updated_count = 0
    failed_count = 0

    for assignment_id, mapping in assignment_materials_mapping.items():
        try:
            material_ids = [m.get('id') for m in mapping['materials']]

            # הכן נתונים לעדכון
            # שם השדה עשוי להיות: materials, assignment_materials, או related_materials
            update_data = {
                'materials': material_ids
            }

            # בצע עדכון
            response = make_api_request(
                f'apps/{APP_ID}/entities/Assignment/{assignment_id}',
                method='PUT',
                data=update_data
            )

            updated_count += 1
            print(f"✅ {mapping['title'][:50]}")
            print(f"   → {len(material_ids)} חומרים מקושרים")

            time.sleep(0.3)  # המתנה קצרה בין עדכונים

        except Exception as e:
            failed_count += 1
            error_msg = str(e)[:80]
            print(f"❌ {mapping['title'][:50]}")
            print(f"   שגיאה: {error_msg}")

    print(f"\n" + "=" * 100)
    print("✨ סיום עדכון!")
    print("=" * 100)
    print(f"✅ הצלחה: {updated_count}/{len(assignment_materials_mapping)}")
    print(f"❌ כשלונות: {failed_count}/{len(assignment_materials_mapping)}")
"""

# ============================================================================
# שלב 5: סטטיסטיקה וסיכום
# ============================================================================

print("\n" + "=" * 100)
print("📊 סטטיסטיקה וסיכום")
print("=" * 100)

if assignment_materials_mapping:
    total_links = sum(len(m['materials']) for m in assignment_materials_mapping.values())
    avg_links = total_links / len(assignment_materials_mapping)

    print(f"\n📈 סטטיסטיקה כללית:")
    print(f"   • סה\"כ מטלות: {len(assignment_materials_mapping)}")
    print(f"   • סה\"כ קישורי חומרים: {total_links}")
    print(f"   • ממוצע חומרים למטלה: {avg_links:.1f}")

    # חלוקה לפי מספר חומרים
    distribution = defaultdict(int)
    for mapping in assignment_materials_mapping.values():
        num_materials = len(mapping['materials'])
        distribution[num_materials] += 1

    print(f"\n📊 חלוקה לפי מספר חומרים:")
    for num in sorted(distribution.keys()):
        count = distribution[num]
        print(f"   • {num} חומרים: {count} מטלות")

    # חומרים הכי פופולריים
    material_usage = defaultdict(int)
    for mapping in assignment_materials_mapping.values():
        for material in mapping['materials']:
            material_id = material.get('id')
            if material_id:
                material_usage[material_id] += 1

    print(f"\n🌟 החומרים הפופולריים ביותר (משותפים למספר מטלות):")
    sorted_usage = sorted(material_usage.items(), key=lambda x: x[1], reverse=True)

    # מצא את כותרות החומרים
    materials_by_id = {m.get('id'): m for m in relevant_materials}

    for i, (material_id, count) in enumerate(sorted_usage[:10], 1):
        material = materials_by_id.get(material_id, {})
        title = material.get('title', 'לא ידוע')
        if count > 1:
            print(f"   {i}. {title[:60]} - משמש ב-{count} מטלות")

print("\n" + "=" * 100)
print("✨ השיוך הושלם בהצלחה!")
print("=" * 100)

print("""
📁 קבצים שנוצרו:
   • assignment_materials_final_mapping.json - מיפוי מלא של חומרים למטלות

🎯 שלבים הבאים:
   1. בדוק את הקובץ assignment_materials_final_mapping.json
   2. אם המיפוי נראה טוב, הסר את ה-comment בשלב 4
   3. הרץ שוב את הסקריפט לעדכון המטלות במערכת

💡 טיפ: אפשר לערוך את הקובץ JSON ידנית לפני העדכון אם צריך
""")
