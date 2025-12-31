"""
📊 ניתוח מקיף של המערכת המלאה
מנתח את כל הקורסים, מטלות, סשנים וחומרים במערכת
"""

import csv
import json
from collections import defaultdict, Counter

print("=" * 100)
print("📊 ניתוח מקיף של מערכת LMS")
print("=" * 100)

# ============================================================================
# שלב 1: טעינת כל הקבצים
# ============================================================================

print("\n📂 שלב 1: טעינת קבצי נתונים...\n")

# קרא Materials
materials = []
with open('Material_export.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        materials.append(row)
print(f"✅ Materials: {len(materials)} חומרים")

# קרא CourseSessions
course_sessions = []
with open('CourseSession_export.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        course_sessions.append(row)
print(f"✅ CourseSessions: {len(course_sessions)} סשנים")

# קרא SessionMaterials
session_materials = []
with open('SessionMaterial_export.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        session_materials.append(row)
print(f"✅ SessionMaterials: {len(session_materials)} קישורי חומרים לסשנים")

# קרא AssignmentMaterials
assignment_materials = []
with open('AssignmentMaterial_export.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        assignment_materials.append(row)
print(f"✅ AssignmentMaterials: {len(assignment_materials)} קישורי חומרים למטלות")

# ============================================================================
# שלב 2: ניתוח קורסים וסשנים
# ============================================================================

print("\n" + "=" * 100)
print("🎓 שלב 2: ניתוח קורסים וסשנים")
print("=" * 100)

# קבץ סשנים לפי קורס
sessions_by_course = defaultdict(list)
for session in course_sessions:
    course_id = session.get('course_id', '')
    if course_id:
        sessions_by_course[course_id].append(session)

num_courses_with_sessions = len(sessions_by_course)
print(f"\n📚 סה\"כ קורסים עם סשנים: {num_courses_with_sessions}")

# הצג את הקורסים עם מספר הסשנים
print(f"\n📋 חלוקת סשנים לפי קורס:")
for course_id, sessions in sorted(sessions_by_course.items(), key=lambda x: len(x[1]), reverse=True):
    num_sessions = len(sessions)
    first_session_title = sessions[0].get('title', 'ללא כותרת')[:50] if sessions else ''
    print(f"   • {course_id}: {num_sessions} סשנים - {first_session_title}...")

# ============================================================================
# שלב 3: ניתוח SessionMaterials - קישורי חומרים לסשנים
# ============================================================================

print("\n" + "=" * 100)
print("🔗 שלב 3: ניתוח קישורי חומרים לסשנים")
print("=" * 100)

# קבץ חומרים לפי קורס (דרך SessionMaterials)
materials_per_course_session = defaultdict(set)
materials_per_session = defaultdict(list)

for sm in session_materials:
    course_id = sm.get('course_id', '')
    session_id = sm.get('session_id', '')
    material_id = sm.get('material_id', '')

    if course_id and material_id:
        materials_per_course_session[course_id].add(material_id)
    if session_id and material_id:
        materials_per_session[session_id].append(material_id)

print(f"\n📊 חומרים מקושרים לסשנים:")
print(f"   • סה\"כ קורסים עם חומרים מקושרים לסשנים: {len(materials_per_course_session)}")
print(f"   • סה\"כ קישורי חומרים לסשנים: {len(session_materials)}")

# הצג את הקורסים עם הכי הרבה חומרים בסשנים
print(f"\n🏆 קורסים עם הכי הרבה חומרים בסשנים:")
sorted_courses = sorted(materials_per_course_session.items(), key=lambda x: len(x[1]), reverse=True)
for course_id, material_ids in sorted_courses[:10]:
    num_unique_materials = len(material_ids)
    total_links = sum(1 for sm in session_materials if sm.get('course_id') == course_id)
    print(f"   • {course_id}: {num_unique_materials} חומרים ייחודיים, {total_links} קישורים כוללים")

# ============================================================================
# שלב 4: ניתוח AssignmentMaterials - קישורי חומרים למטלות
# ============================================================================

print("\n" + "=" * 100)
print("📝 שלב 4: ניתוח קישורי חומרים למטלות")
print("=" * 100)

# קבץ חומרים לפי מטלה
materials_per_assignment = defaultdict(list)
assignments_with_materials = set()

for am in assignment_materials:
    assignment_id = am.get('assignment_id', '')
    material_id = am.get('material_id', '')

    if assignment_id and material_id:
        materials_per_assignment[assignment_id].append(material_id)
        assignments_with_materials.add(assignment_id)

print(f"\n📊 חומרים מקושרים למטלות:")
print(f"   • סה\"כ מטלות עם חומרים: {len(assignments_with_materials)}")
print(f"   • סה\"כ קישורי חומרים למטלות: {len(assignment_materials)}")

if assignments_with_materials:
    print(f"\n📋 פירוט מטלות עם חומרים:")
    for assignment_id, material_ids in materials_per_assignment.items():
        print(f"   • {assignment_id}: {len(material_ids)} חומרים")

# ============================================================================
# שלב 5: ניתוח Materials - חומרי הלימוד
# ============================================================================

print("\n" + "=" * 100)
print("📚 שלב 5: ניתוח חומרי הלימוד")
print("=" * 100)

# חלוקה לפי סוג
materials_by_type = Counter(m.get('type', 'לא מוגדר') for m in materials)
materials_by_topic = Counter(m.get('topic', 'לא מוגדר') for m in materials)
materials_by_course = Counter(m.get('course_id', 'ללא קורס') for m in materials)

print(f"\n📈 חלוקה לפי סוג (10 הנפוצים ביותר):")
for mat_type, count in materials_by_type.most_common(10):
    print(f"   • {mat_type}: {count} חומרים")

print(f"\n📚 חלוקה לפי נושא (15 הנפוצים ביותר):")
for topic, count in materials_by_topic.most_common(15):
    print(f"   • {topic}: {count} חומרים")

print(f"\n🎓 חלוקה לפי קורס (10 הקורסים עם הכי הרבה חומרים):")
for course_id, count in materials_by_course.most_common(10):
    course_display = course_id if course_id != 'ללא קורס' else 'ללא קורס (גלובלי)'
    print(f"   • {course_display}: {count} חומרים")

# חומרים ללא קורס (גלובליים)
global_materials = [m for m in materials if not m.get('course_id')]
print(f"\n💡 חומרים גלובליים (ללא קורס ספציפי): {len(global_materials)}")

# ============================================================================
# שלב 6: זיהוי פערים - קורסים/מטלות ללא חומרים
# ============================================================================

print("\n" + "=" * 100)
print("⚠️  שלב 6: זיהוי פערים וצרכים")
print("=" * 100)

# קורסים עם סשנים אבל ללא חומרים בסשנים
courses_with_sessions = set(sessions_by_course.keys())
courses_with_session_materials = set(sm.get('course_id') for sm in session_materials if sm.get('course_id'))
courses_missing_session_materials = courses_with_sessions - courses_with_session_materials

print(f"\n🔴 קורסים עם סשנים אבל ללא חומרים מקושרים:")
if courses_missing_session_materials:
    for course_id in sorted(courses_missing_session_materials):
        num_sessions = len(sessions_by_course[course_id])
        print(f"   • {course_id}: {num_sessions} סשנים ללא חומרים")
else:
    print("   ✅ כל הקורסים עם סשנים כבר קישרו חומרים!")

# זיהוי האם כל סשן יש לפחות חומר אחד
sessions_without_materials = set()
for session in course_sessions:
    session_id = session.get('id')
    if session_id and session_id not in materials_per_session:
        sessions_without_materials.add(session_id)

print(f"\n🔴 סשנים ללא חומרים מקושרים:")
print(f"   • סה\"כ: {len(sessions_without_materials)} סשנים מתוך {len(course_sessions)}")

# חלק מהסשנים ללא חומרים לפי קורס
sessions_without_materials_by_course = defaultdict(int)
for session in course_sessions:
    session_id = session.get('id')
    course_id = session.get('course_id')
    if session_id in sessions_without_materials:
        sessions_without_materials_by_course[course_id] += 1

if sessions_without_materials_by_course:
    print(f"\n   פירוט לפי קורס:")
    for course_id, count in sorted(sessions_without_materials_by_course.items(), key=lambda x: x[1], reverse=True)[:10]:
        total_sessions = len(sessions_by_course.get(course_id, []))
        print(f"   • {course_id}: {count}/{total_sessions} סשנים ללא חומרים")

# ============================================================================
# שלב 7: המלצות לעדכון
# ============================================================================

print("\n" + "=" * 100)
print("💡 שלב 7: המלצות ותוכנית עבודה")
print("=" * 100)

print(f"\n🎯 עדיפויות לעדכון:")

# 1. קורסים עם סשנים אבל ללא חומרים בכלל
if courses_missing_session_materials:
    print(f"\n1️⃣ עדיפות ראשונה - קורסים ללא חומרים כלל ({len(courses_missing_session_materials)} קורסים):")
    for course_id in sorted(courses_missing_session_materials):
        print(f"   • {course_id}")

# 2. קורסים עם סשנים חלקיים עם חומרים
courses_with_partial_materials = []
for course_id in courses_with_sessions:
    if course_id in courses_with_session_materials:
        sessions = sessions_by_course[course_id]
        sessions_with_materials = sum(1 for s in sessions if s.get('id') in materials_per_session)
        if sessions_with_materials < len(sessions):
            coverage = (sessions_with_materials / len(sessions)) * 100
            courses_with_partial_materials.append((course_id, coverage, sessions_with_materials, len(sessions)))

if courses_with_partial_materials:
    print(f"\n2️⃣ עדיפות שנייה - קורסים עם כיסוי חלקי של חומרים ({len(courses_with_partial_materials)} קורסים):")
    for course_id, coverage, with_mat, total in sorted(courses_with_partial_materials, key=lambda x: x[1])[:10]:
        print(f"   • {course_id}: {coverage:.1f}% כיסוי ({with_mat}/{total} סשנים)")

# 3. שיוך חומרים למטלות
print(f"\n3️⃣ עדיפות שלישית - שיוך חומרים למטלות:")
print(f"   • יש רק {len(assignment_materials)} קישורי חומרים למטלות")
print(f"   • מומלץ לשייך חומרים רלוונטיים לכל המטלות בכל הקורסים")

# ============================================================================
# שלב 8: שמירת דוח לקובץ JSON
# ============================================================================

print("\n" + "=" * 100)
print("💾 שלב 8: שמירת דוח מפורט")
print("=" * 100)

report = {
    "summary": {
        "total_materials": len(materials),
        "total_sessions": len(course_sessions),
        "total_courses_with_sessions": num_courses_with_sessions,
        "total_session_material_links": len(session_materials),
        "total_assignment_material_links": len(assignment_materials),
        "courses_missing_session_materials": len(courses_missing_session_materials),
        "sessions_without_materials": len(sessions_without_materials),
        "global_materials": len(global_materials)
    },
    "courses": {
        "with_sessions": list(courses_with_sessions),
        "missing_session_materials": list(courses_missing_session_materials),
        "partial_coverage": [
            {
                "course_id": c[0],
                "coverage_percent": c[1],
                "sessions_with_materials": c[2],
                "total_sessions": c[3]
            }
            for c in courses_with_partial_materials
        ]
    },
    "materials_distribution": {
        "by_type": dict(materials_by_type.most_common(20)),
        "by_topic": dict(materials_by_topic.most_common(20)),
        "by_course": dict(materials_by_course.most_common(20))
    },
    "sessions_needing_materials": list(sessions_without_materials)[:100]  # רק 100 הראשונים
}

with open('system_analysis_report.json', 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print(f"\n✅ דוח מפורט נשמר ל-system_analysis_report.json")

# ============================================================================
# סיכום
# ============================================================================

print("\n" + "=" * 100)
print("✨ סיכום הניתוח")
print("=" * 100)

print(f"""
📊 מצב המערכת הנוכחי:
   • {len(materials)} חומרי לימוד
   • {num_courses_with_sessions} קורסים פעילים
   • {len(course_sessions)} סשנים סה"כ
   • {len(session_materials)} קישורי חומרים לסשנים
   • {len(assignment_materials)} קישורי חומרים למטלות

🔴 פערים:
   • {len(courses_missing_session_materials)} קורסים ללא חומרים בסשנים
   • {len(sessions_without_materials)} סשנים ללא חומרים ({len(sessions_without_materials)/len(course_sessions)*100:.1f}%)
   • רק {len(assignment_materials)} קישורי חומרים למטלות (מעט מאוד!)

💡 המלצה:
   1. התחל עם הקורסים ללא חומרים כלל
   2. השלם חומרים לסשנים קיימים
   3. שייך חומרים למטלות בכל הקורסים
""")

print("=" * 100)
print("🎯 הניתוח הושלם!")
print("=" * 100)
