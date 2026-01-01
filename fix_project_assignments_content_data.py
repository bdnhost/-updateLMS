# -*- coding: utf-8 -*-
"""
📊 עדכון מטלות פרויקט עם content_data
מוסיף milestones ומבנה לפרויקטים
"""

import requests
import json
import time
from datetime import datetime, timedelta

API_KEY = 'c0ce546b5661436dacb7a2060b10c9a5'
APP_ID = '693824c5c1ad33c1f114ebd2'

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

def generate_milestones_for_project(assignment_title, assignment_desc=''):
    """יצר milestones אוטומטיים לפי כותרת ותיאור"""

    # מספר שלבים לפי סוג הפרויקט
    if 'גמר' in assignment_title or 'סופי' in assignment_title or 'final' in assignment_title.lower():
        # פרויקט גמר - 5 שלבים
        return [
            {
                "id": "milestone-1",
                "title": "שלב 1: בחירת נושא ומחקר ראשוני",
                "description": "בחרו נושא רלוונטי לקורס\nבצעו מחקר ראשוני ואיסוף מקורות\nהגישו הצעת נושא לאישור",
                "percentage": 10,
                "dueDate": (datetime.now() + timedelta(weeks=2)).strftime('%Y-%m-%d')
            },
            {
                "id": "milestone-2",
                "title": "שלב 2: תכנון ועיצוב מפורט",
                "description": "הכינו תוכנית עבודה מפורטת\nעצבו ארכיטקטורה / תרשימים\nהגדירו דרישות והיקף",
                "percentage": 20,
                "dueDate": (datetime.now() + timedelta(weeks=4)).strftime('%Y-%m-%d')
            },
            {
                "id": "milestone-3",
                "title": "שלב 3: פיתוח ויישום",
                "description": "בנו אב-טיפוס / מוצר ראשוני\nבצעו בדיקות וולידציה\nתעדו את התהליך",
                "percentage": 40,
                "dueDate": (datetime.now() + timedelta(weeks=8)).strftime('%Y-%m-%d')
            },
            {
                "id": "milestone-4",
                "title": "שלב 4: שיפורים ומסקנות",
                "description": "שפרו את המוצר לפי משוב\nנתחו תוצאות\nהסיקו מסקנות",
                "percentage": 20,
                "dueDate": (datetime.now() + timedelta(weeks=11)).strftime('%Y-%m-%d')
            },
            {
                "id": "milestone-5",
                "title": "שלב 5: הגשה והצגה",
                "description": "הכינו מצגת מקצועית\nתעדו את הפרויקט\nהציגו בפני הכיתה",
                "percentage": 10,
                "dueDate": (datetime.now() + timedelta(weeks=13)).strftime('%Y-%m-%d')
            }
        ]

    elif 'ביניים' in assignment_title or 'midterm' in assignment_title.lower():
        # פרויקט ביניים - 3 שלבים
        return [
            {
                "id": "milestone-1",
                "title": "שלב 1: מחקר ותכנון",
                "description": "חקרו את הנושא\nתכננו את המוצר/פתרון\nהגישו תוכנית עבודה",
                "percentage": 30,
                "dueDate": (datetime.now() + timedelta(weeks=1)).strftime('%Y-%m-%d')
            },
            {
                "id": "milestone-2",
                "title": "שלב 2: ביצוע ופיתוח",
                "description": "בנו את הפתרון\nבצעו בדיקות\nתעדו את העבודה",
                "percentage": 50,
                "dueDate": (datetime.now() + timedelta(weeks=3)).strftime('%Y-%m-%d')
            },
            {
                "id": "milestone-3",
                "title": "שלב 3: סיכום והגשה",
                "description": "סכמו ממצאים\nהכינו דוח\nהגישו חומר מסכם",
                "percentage": 20,
                "dueDate": (datetime.now() + timedelta(weeks=4)).strftime('%Y-%m-%d')
            }
        ]

    else:
        # פרויקט רגיל - 4 שלבים
        return [
            {
                "id": "milestone-1",
                "title": "שלב 1: הגדרה ותכנון",
                "description": "הגדירו את המטרות\nתכננו את הפתרון\nצרו תוכנית עבודה",
                "percentage": 25,
                "dueDate": (datetime.now() + timedelta(weeks=1)).strftime('%Y-%m-%d')
            },
            {
                "id": "milestone-2",
                "title": "שלב 2: פיתוח ראשוני",
                "description": "בנו גרסה ראשונית\nבצעו בדיקות בסיסיות\nקבלו משוב",
                "percentage": 35,
                "dueDate": (datetime.now() + timedelta(weeks=2)).strftime('%Y-%m-%d')
            },
            {
                "id": "milestone-3",
                "title": "שלב 3: שיפור ופיתוח מתקדם",
                "description": "שפרו לפי משוב\nהוסיפו פיצ'רים\nבדקו ותיקנו באגים",
                "percentage": 30,
                "dueDate": (datetime.now() + timedelta(weeks=3)).strftime('%Y-%m-%d')
            },
            {
                "id": "milestone-4",
                "title": "שלב 4: סיום והגשה",
                "description": "השלימו את הפרויקט\nתעדו\nהציגו",
                "percentage": 10,
                "dueDate": (datetime.now() + timedelta(weeks=4)).strftime('%Y-%m-%d')
            }
        ]

def generate_guidelines(assignment_title, assignment_desc):
    """יצר הנחיות כלליות לפרויקט"""

    guidelines = f"""הנחיות כלליות ל{assignment_title}:

📌 דרישות בסיס:
• עבודה אישית או בצוות (לפי הנחיות המרצה)
• תיעוד מלא של כל שלב
• שמירה על לוח זמנים
• שיתוף פעולה והתייעצות עם המרצה

🎯 קריטריונים להצלחה:
• יצירתיות וחדשנות
• ביצוע איכותי ומקצועי
• עמידה בדרישות הטכניות
• הצגה ברורה ומסודרת

💡 טיפים:
• התחילו מוקדם ותכננו היטב
• התייעצו במרצה בכל שלב
• שמרו גיבויים של העבודה
• תעדו את התהליך באופן שוטף
"""

    return guidelines

print("=" * 100)
print("📊 עדכון מטלות פרויקט עם content_data")
print("=" * 100)

# ============================================================================
# שלב 1: מצא מטלות פרויקט
# ============================================================================

print("\n📂 שלב 1: קריאת מטלות פרויקט...\n")

try:
    # קרא את כל המטלות
    assignments_response = make_api_request(
        f'apps/{APP_ID}/entities/Assignment',
        data={'limit': 500}
    )

    if isinstance(assignments_response, list):
        all_assignments = assignments_response
    else:
        all_assignments = assignments_response.get('data', [])

    # סנן רק פרויקטים
    project_assignments = [a for a in all_assignments if a.get('category', '').lower() == 'פרויקט' or 'project' in a.get('category', '').lower() or 'פרויקט' in a.get('title', '')]

    print(f"✅ נמצאו {len(project_assignments)} מטלות פרויקט (מתוך {len(all_assignments)} מטלות כוללים)")

except Exception as e:
    print(f"❌ שגיאה בקריאת מטלות: {e}")
    exit(1)

# ============================================================================
# שלב 2: בדוק אילו זקוקות לעדכון
# ============================================================================

print("\n" + "=" * 100)
print("🔍 שלב 2: זיהוי מטלות שזקוקות ל-content_data")
print("=" * 100)

projects_to_update = {}

for i, project in enumerate(project_assignments, 1):
    project_id = project.get('id', '')
    project_title = project.get('title', '')
    project_desc = project.get('description', '')
    content_data = project.get('content_data')

    # בדוק אם חסר content_data או milestones
    needs_update = False

    if not content_data:
        needs_update = True
    elif isinstance(content_data, dict):
        if not content_data.get('milestones') or len(content_data.get('milestones', [])) == 0:
            needs_update = True

    if needs_update:
        milestones = generate_milestones_for_project(project_title, project_desc)
        guidelines = generate_guidelines(project_title, project_desc)

        projects_to_update[project_id] = {
            'title': project_title,
            'content_data': {
                'milestones': milestones,
                'guidelines': guidelines
            }
        }

        if i <= 10:
            print(f"{len(projects_to_update)}. {project_title[:60]}")
            print(f"   💡 {len(milestones)} אבני דרך")
            print()

if len(projects_to_update) > 10:
    print(f"... ועוד {len(projects_to_update) - 10} פרויקטים\n")

print(f"✅ נמצאו {len(projects_to_update)} פרויקטים שזקוקים לעדכון")

# שמור מיפוי
with open('projects_content_data_mapping.json', 'w', encoding='utf-8') as f:
    json.dump(projects_to_update, f, ensure_ascii=False, indent=2)

print(f"✅ מיפוי נשמר ל-projects_content_data_mapping.json")

# ============================================================================
# שלב 3: עדכון במערכת
# ============================================================================

print("\n" + "=" * 100)
print("🔄 שלב 3: עדכון פרויקטים במערכת")
print("=" * 100)

if projects_to_update:
    print(f"\n🚀 מתחיל עדכון {len(projects_to_update)} פרויקטים...\n")

    updated_count = 0
    failed_count = 0

    for project_id, mapping in projects_to_update.items():
        try:
            # עדכן את ה-content_data
            update_data = {
                'content_data': mapping['content_data']
            }

            response = make_api_request(
                f'apps/{APP_ID}/entities/Assignment/{project_id}',
                method='PUT',
                data=update_data
            )

            updated_count += 1
            num_milestones = len(mapping['content_data']['milestones'])
            print(f"✅ {mapping['title'][:50]} ({num_milestones} אבני דרך)")

            time.sleep(0.3)

        except Exception as e:
            failed_count += 1
            error_msg = str(e)[:60]
            print(f"❌ {mapping['title'][:40]} - שגיאה: {error_msg}")

    print(f"\n" + "=" * 100)
    print("✨ סיום עדכון!")
    print("=" * 100)
    print(f"✅ עודכנו: {updated_count}/{len(projects_to_update)} פרויקטים")
    print(f"❌ כשלונות: {failed_count}")

else:
    print("\n✅ כל הפרויקטים כבר עם content_data מעודכן!")

# ============================================================================
# שלב 4: סטטיסטיקה
# ============================================================================

print("\n" + "=" * 100)
print("📊 סטטיסטיקה")
print("=" * 100)

if projects_to_update:
    from collections import Counter

    # ספור לפי מספר אבני דרך
    milestone_counts = Counter(len(m['content_data']['milestones']) for m in projects_to_update.values())

    print(f"\n📈 סטטיסטיקה:")
    print(f"   • סה\"כ פרויקטים שעודכנו: {len(projects_to_update)}")
    print(f"   • ממוצע אבני דרך לפרויקט: {sum(len(m['content_data']['milestones']) for m in projects_to_update.values()) / len(projects_to_update):.1f}")

    print(f"\n📊 חלוקה לפי מספר אבני דרך:")
    for num, count in sorted(milestone_counts.items()):
        print(f"   • {num} אבני דרך: {count} פרויקטים")

print("\n" + "=" * 100)
print("✨ עדכון הפרויקטים הושלם!")
print("=" * 100)
print("""
📁 המיפוי נשמר ב: projects_content_data_mapping.json
🎯 כל הפרויקטים עם מבנה מלא של אבני דרך!
📱 כעת התלמידים יוכלו לראות ולהגיש לפי שלבים
""")
