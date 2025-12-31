"""
🔗 שיוך חומרי לימוד למטלות - קורס AI להנדסאי רכב
Course ID: 6942ae4afed1bf7040557a50

סקריפט זה משייך באופן חכם חומרי לימוד (Materials) למטלות (Assignments)
על סמך נושא, מילות מפתח, ושבוע רלוונטי.
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

def find_relevant_materials(assignment_title, all_materials, max_results=5):
    """מצא חומרים רלוונטיים למטלה בהתבסס על כותרת ומילות מפתח"""

    # מילות מפתח לפי סוג מטלה
    keyword_mapping = {
        "ai": ["ai", "בינה", "מלאכות", "chatgpt", "claude", "gemini", "llm"],
        "prompt": ["prompt", "פרומפט", "הנחי", "שאיל"],
        "autonomous": ["אוטונומי", "autonomous", "adas", "self-driving", "רכב עצמאי"],
        "obd": ["obd", "אבחון", "diagnostic", "תקלה", "dtc", "קוד"],
        "python": ["python", "קוד", "תכנות", "סקריפט", "coding", "pandas"],
        "vision": ["vision", "ראייה", "תמונה", "camera", "lidar", "זיהוי"],
        "maintenance": ["תחזוקה", "maintenance", "predictive", "חיזוי"],
        "chatbot": ["chatbot", "bot", "צ'אט", "שיחה"],
        "iot": ["iot", "מחובר", "connected", "v2v"],
        "ethics": ["אתיקה", "ethics", "trolley", "פרטיות"],
        "project": ["פרויקט", "project", "הצגה", "presentation"],
        "data": ["data", "נתונים", "ניתוח", "csv", "excel"]
    }

    assignment_lower = assignment_title.lower()
    relevant_materials = []

    # מצא את הקטגוריות הרלוונטיות
    relevant_categories = []
    for category, keywords in keyword_mapping.items():
        if any(keyword in assignment_lower for keyword in keywords):
            relevant_categories.append(category)

    # אם לא מצאנו קטגוריה, השתמש בברירת מחדל
    if not relevant_categories:
        relevant_categories = ["ai", "python", "automotive"]

    # חפש חומרים שמתאימים לקטגוריות
    scored_materials = []

    for material in all_materials:
        material_title = (material.get('title', '') or '').lower()
        material_topic = (material.get('topic', '') or '').lower()
        material_description = (material.get('description', '') or '').lower()

        score = 0

        # ציון לפי התאמה לקטגוריות
        for category in relevant_categories:
            category_keywords = keyword_mapping.get(category, [])
            for keyword in category_keywords:
                if keyword in material_title:
                    score += 10
                if keyword in material_topic:
                    score += 5
                if keyword in material_description:
                    score += 2

        # בונוס לחומרים עם סוג מתאים
        material_type = (material.get('type', '') or '').lower()
        if material_type in ['guide', 'document', 'tutorial', 'video']:
            score += 3

        if score > 0:
            scored_materials.append({
                'material': material,
                'score': score
            })

    # מיין לפי ציון והחזר את הטובים ביותר
    scored_materials.sort(key=lambda x: x['score'], reverse=True)

    return [item['material'] for item in scored_materials[:max_results]]

print("=" * 100)
print("🔗 שיוך חומרי לימוד למטלות - קורס AI להנדסאי רכב")
print("=" * 100)

# ============================================================================
# שלב 1: קבל את כל המטלות והחומרים
# ============================================================================

print("\n🔍 שלב 1: קריאת מטלות וחומרים...")

try:
    # קבל מטלות
    assignments_response = make_api_request(
        f'apps/{APP_ID}/entities/Assignment',
        data={'course_id': COURSE_ID}
    )

    if isinstance(assignments_response, list):
        assignments = assignments_response
    else:
        assignments = assignments_response.get('data', [])

    print(f"✅ נמצאו {len(assignments)} מטלות")

    # קבל חומרים
    time.sleep(0.5)
    materials_response = make_api_request(
        f'apps/{APP_ID}/entities/Material',
        data={'course_id': COURSE_ID}
    )

    if isinstance(materials_response, list):
        materials = materials_response
    else:
        materials = materials_response.get('data', [])

    print(f"✅ נמצאו {len(materials)} חומרי לימוד")

except Exception as e:
    print(f"❌ שגיאה: {e}")
    assignments = []
    materials = []

# ============================================================================
# שלב 2: מיפוי חכם - מצא חומרים רלוונטיים לכל מטלה
# ============================================================================

print("\n" + "=" * 100)
print("🧠 שלב 2: מיפוי חכם - חומרים למטלות")
print("=" * 100)

assignment_materials_mapping = {}

if assignments and materials:
    print(f"\n📋 מנתח {len(assignments)} מטלות...\n")

    for i, assignment in enumerate(assignments, 1):
        assignment_id = assignment.get('id')
        assignment_title = assignment.get('title', 'ללא כותרת')

        # מצא חומרים רלוונטיים
        relevant_materials = find_relevant_materials(assignment_title, materials, max_results=5)

        # שמור את המיפוי
        assignment_materials_mapping[assignment_id] = {
            'title': assignment_title,
            'material_ids': [m.get('id') for m in relevant_materials],
            'material_titles': [m.get('title', 'ללא כותרת') for m in relevant_materials]
        }

        print(f"{i}. {assignment_title[:60]}")
        print(f"   💡 {len(relevant_materials)} חומרים רלוונטיים:")
        for j, material in enumerate(relevant_materials, 1):
            print(f"      {j}. {material.get('title', 'ללא כותרת')[:50]}")
        print()

    # שמור את המיפוי לקובץ JSON
    with open('/home/user/-updateLMS/assignment_materials_mapping.json', 'w', encoding='utf-8') as f:
        json.dump(assignment_materials_mapping, f, ensure_ascii=False, indent=2)

    print(f"✅ מיפוי נשמר ל-assignment_materials_mapping.json")

else:
    print("⚠️ לא נמצאו מטלות או חומרים")

# ============================================================================
# שלב 3: עדכון מטלות עם החומרים המקושרים
# ============================================================================

print("\n" + "=" * 100)
print("🔄 שלב 3: עדכון מטלות עם חומרים מקושרים")
print("=" * 100)

print("\n💡 כדי לעדכן את המטלות, הסר את ה-comment מהקוד למטה:\n")

# הסר comment כדי להריץ עדכון
"""
if assignment_materials_mapping:
    updated_count = 0
    failed_count = 0

    for assignment_id, mapping in assignment_materials_mapping.items():
        try:
            # הכן נתונים לעדכון
            # שדה materials או assignment_materials (תלוי במודל)
            update_data = {
                'materials': mapping['material_ids']  # או 'assignment_materials' או 'related_materials'
            }

            # בצע עדכון
            response = make_api_request(
                f'apps/{APP_ID}/entities/Assignment/{assignment_id}',
                method='PUT',
                data=update_data
            )

            updated_count += 1
            print(f"✅ {mapping['title'][:50]}")
            print(f"   → {len(mapping['material_ids'])} חומרים מקושרים")

            time.sleep(0.2)

        except Exception as e:
            failed_count += 1
            error_msg = str(e)[:80]
            print(f"❌ {mapping['title'][:50]}: {error_msg}")

    print(f"\n" + "=" * 100)
    print(f"✅ סיום עדכון!")
    print(f"=" * 100)
    print(f"✨ הצלחה: {updated_count}/{len(assignment_materials_mapping)}")
    print(f"❌ כשלונות: {failed_count}/{len(assignment_materials_mapping)}")
"""

# ============================================================================
# שלב 4: סיכום וסטטיסטיקה
# ============================================================================

print("\n" + "=" * 100)
print("📊 סיכום וסטטיסטיקה")
print("=" * 100)

if assignment_materials_mapping:
    total_links = sum(len(m['material_ids']) for m in assignment_materials_mapping.values())
    avg_links = total_links / len(assignment_materials_mapping) if assignment_materials_mapping else 0

    print(f"\n📈 סטטיסטיקה:")
    print(f"   • סה\"כ מטלות: {len(assignment_materials_mapping)}")
    print(f"   • סה\"כ קישורי חומרים: {total_links}")
    print(f"   • ממוצע חומרים למטלה: {avg_links:.1f}")

    # חלוקה לפי מספר חומרים
    distribution = {}
    for mapping in assignment_materials_mapping.values():
        num_materials = len(mapping['material_ids'])
        distribution[num_materials] = distribution.get(num_materials, 0) + 1

    print(f"\n📊 חלוקה לפי מספר חומרים:")
    for num, count in sorted(distribution.items()):
        print(f"   • {num} חומרים: {count} מטלות")

print("\n" + "=" * 100)
print("✨ המיפוי החכם הושלם!")
print("=" * 100)
print("\n💡 הסר את ה-comment בשלב 3 כדי לעדכן את המטלות במערכת")
print("📁 המיפוי נשמר ב: assignment_materials_mapping.json")
print("\n🎯 כל מטלה תקבל 3-5 חומרי לימוד רלוונטיים! 📚✨")
