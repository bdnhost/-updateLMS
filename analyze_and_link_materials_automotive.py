"""
📊 ניתוח מאגר החומרים ושיוך לקורס AI רכב
קורס ID: 6942ae4afed1bf7040557a50
"""

import csv
import json
import requests
from collections import Counter

API_KEY = 'c0ce546b5661436dacb7a2060b10c9a5'
APP_ID = '693824c5c1ad33c1f114ebd2'
AUTOMOTIVE_COURSE_ID = '6942ae4afed1bf7040557a50'

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

print("=" * 100)
print("📊 ניתוח מאגר החומרים - 597 חומרים")
print("=" * 100)

# קרא את קובץ ה-CSV
materials = []
with open('Material_export.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        materials.append(row)

print(f"\n✅ נטענו {len(materials)} חומרים מהקובץ\n")

# סטטיסטיקה בסיסית
types = Counter(m.get('type', '') for m in materials)
topics = Counter(m.get('topic', '') for m in materials)
courses = Counter(m.get('course_id', 'ללא קורס') for m in materials)

print("=" * 100)
print("📊 סטטיסטיקה כללית")
print("=" * 100)

print("\n📈 חלוקה לפי סוג:")
for mat_type, count in types.most_common(10):
    print(f"   • {mat_type or 'ללא סוג'}: {count} חומרים")

print("\n📚 חלוקה לפי נושא (15 הנפוצים ביותר):")
for topic, count in topics.most_common(15):
    print(f"   • {topic or 'ללא נושא'}: {count} חומרים")

# מצא חומרים רלוונטיים לקורס AI רכב
print("\n" + "=" * 100)
print("🔍 חיפוש חומרים רלוונטיים לקורס AI רכב")
print("=" * 100)

# מילות מפתח רלוונטיות לקורס AI רכב
automotive_keywords = {
    'ai': ['ai', 'בינה מלאכותית', 'artificial intelligence', 'machine learning', 'ml', 'deep learning'],
    'automotive': ['רכב', 'automotive', 'car', 'vehicle', 'מכונית', 'adas', 'autonomous'],
    'python': ['python', 'פייתון', 'pandas', 'numpy', 'data analysis'],
    'chatgpt': ['chatgpt', 'gpt', 'claude', 'gemini', 'llm', 'prompt'],
    'obd': ['obd', 'diagnostic', 'אבחון', 'תקלה', 'dtc'],
    'vision': ['vision', 'ראייה', 'computer vision', 'cv', 'image', 'camera'],
    'iot': ['iot', 'internet of things', 'connected', 'sensor', 'חיישן'],
    'data': ['data', 'נתונים', 'excel', 'csv', 'ניתוח'],
    'chatbot': ['chatbot', 'bot', 'conversation', 'שיחה'],
    'ethics': ['ethics', 'אתיקה', 'privacy', 'פרטיות']
}

def score_material_for_automotive(material):
    """חשב ציון רלוונטיות של חומר לקורס AI רכב"""
    score = 0
    title = (material.get('title', '') or '').lower()
    description = (material.get('description', '') or '').lower()
    topic = (material.get('topic', '') or '').lower()

    for category, keywords in automotive_keywords.items():
        for keyword in keywords:
            if keyword in title:
                score += 15
            if keyword in topic:
                score += 10
            if keyword in description:
                score += 3

    return score

# ציין וסנן חומרים
scored_materials = []
for material in materials:
    score = score_material_for_automotive(material)
    if score > 0:
        scored_materials.append({
            'material': material,
            'score': score
        })

scored_materials.sort(key=lambda x: x['score'], reverse=True)

print(f"\n✅ נמצאו {len(scored_materials)} חומרים רלוונטיים לקורס AI רכב\n")

print("🏆 50 החומרים הכי רלוונטיים:")
print("=" * 100)

relevant_materials_for_linking = []
for i, item in enumerate(scored_materials[:50], 1):
    material = item['material']
    score = item['score']

    title = material.get('title', 'ללא כותרת')
    mat_type = material.get('type', 'N/A')
    topic = material.get('topic', 'N/A')
    mat_id = material.get('id', '')

    print(f"\n{i}. [{score} נקודות] {title[:70]}")
    print(f"   ID: {mat_id}")
    print(f"   סוג: {mat_type} | נושא: {topic}")

    # שמור לרשימת שיוך
    relevant_materials_for_linking.append({
        'id': mat_id,
        'title': title,
        'type': mat_type,
        'topic': topic,
        'score': score
    })

# שמור לקובץ JSON
output_file = 'automotive_relevant_materials.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(relevant_materials_for_linking, f, ensure_ascii=False, indent=2)

print(f"\n✅ רשימת החומרים הרלוונטיים נשמרה ל-{output_file}")

# סטטיסטיקה של החומרים הרלוונטיים
relevant_types = Counter(m['type'] for m in relevant_materials_for_linking)
relevant_topics = Counter(m['topic'] for m in relevant_materials_for_linking)

print("\n" + "=" * 100)
print("📊 סטטיסטיקה של חומרים רלוונטיים")
print("=" * 100)

print("\n📈 חלוקה לפי סוג:")
for mat_type, count in relevant_types.most_common():
    print(f"   • {mat_type}: {count} חומרים")

print("\n📚 חלוקה לפי נושא:")
for topic, count in relevant_topics.most_common():
    print(f"   • {topic}: {count} חומרים")

print("\n" + "=" * 100)
print("🔗 שלב הבא: שיוך למטלות")
print("=" * 100)

print("\nכעת אפשר:")
print("1. לשייך את החומרים הרלוונטיים ביותר לקורס AI רכב")
print("2. לקשר חומרים ספציפיים למטלות על סמך התאמת נושאים")
print("\nהסקריפט הבא יעשה את זה אוטומטית!")

print("\n" + "=" * 100)
print("✨ ניתוח הושלם!")
print("=" * 100)
