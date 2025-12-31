"""
🎯 טמפלט להתחברות וערעור של כל הישויות במערכת LMS

יכול להשתמש בסקריפט הזה כ-blueprint לעדכון כל ישות אחרת
בתחום (Courses, Materials, CourseSession, Students וכו')
"""

import requests
import json

API_KEY = 'c0ce546b5661436dacb7a2060b10c9a5'
APP_ID = '693824c5c1ad33c1f114ebd2'

def make_api_request(api_path, method='GET', data=None):
    url = f'https://app.base44.com/api/{api_path}'
    headers = {
        'api_key': API_KEY,
        'Content-Type': 'application/json'
    }
    if method.upper() == 'GET':
        response = requests.request(method, url, headers=headers, params=data)
    else:
        response = requests.request(method, url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()

# רשימת המדריכים מ-מדריכים.md
GUIDES = {
    "terminal_guide": "https://bdnhost.net/Resources/guides/digital-basics/terminal_guide.html",
    "github_guide": "https://bdnhost.net/Resources/guides/digital-basics/github_guide.html",
    "python_guide": "https://bdnhost.net/Resources/guides/ai-automation/python_guide.html",
    "cv_guide": "https://bdnhost.net/Resources/guides/digital-basics/cv_guide.html",
    "data_analysis_guide": "https://bdnhost.net/Resources/guides/data-business/data_analysis_guide.html",
    "sql_guide": "https://bdnhost.net/Resources/guides/data-business/sql_guide.html",
    "docker_guide": "https://bdnhost.net/Resources/guides/technology/docker-usage-guide.html",
    "iot_guide": "https://bdnhost.net/Resources/guides/technology/iot_guide.html",
    "react_guide": "https://bdnhost.net/Resources/guides/ai-automation/react-pro-guide.html",
    "prompt_engineering": "https://bdnhost.net/Resources/guides/ai-automation/prompt-engineering-guide.html",
    "llm_guide": "https://bdnhost.net/Resources/guides/ai-automation/understanding-llms-how-it-works.html",
    "ai_ethics": "https://bdnhost.net/Resources/guides/ai-automation/ai_ethics.html",
    "algorithmic_thinking": "https://bdnhost.net/Resources/guides/digital-basics/algorithmic_thinking.html",
    "mechanical_design": "https://bdnhost.net/Resources/guides/creative-studio/mechanical_design_guide.html",
    "automotive_guide": "https://bdnhost.net/Resources/guides/technology/automotive_guide.html",
}

print("=" * 100)
print("🎯 טמפלט UNIVERSAL לעדכון כל ישות במערכת LMS")
print("=" * 100)

# ============================================================================
# דוגמה 1: עדכון Material (חומר לימוד)
# ============================================================================
print("\n" + "=" * 100)
print("📚 דוגמה 1: עדכון חומר (MATERIAL)")
print("=" * 100)

print("\n📋 צעדים:")
print("1. קבל את כל החומרים וזהה את זה שאתה רוצה לעדכן")
print("2. הכן את הנתונים החדשים עם תוכן פדגוגי איכותי")
print("3. בצע PUT request עם הנתונים החדשים")

try:
    materials = make_api_request(f'apps/{APP_ID}/entities/Material')
    if isinstance(materials, list) and len(materials) > 0:
        material_sample = materials[0]
        material_id = material_sample.get('id')
        
        print(f"\n✨ דוגמה: חומר קיים")
        print(f"   ID: {material_id}")
        print(f"   שם: {material_sample.get('title')}")
        print(f"   סוג: {material_sample.get('type')}")
        print(f"   נושא: {material_sample.get('topic', 'ללא נושא')}")
        
        # דוגמה לעדכון
        material_update = {
            "title": f"🆙 {material_sample.get('title')} - עודכן",
            "description": "חומר זה עודכן עם תוכן פדגוגי ישופר וקישורים חינוכיים",
            "topic": material_sample.get('topic') or "טכנולוגיה",
            "week_number": material_sample.get('week_number') or 1,
            "type": material_sample.get('type') or "document"
        }
        
        print(f"\n📝 נתונים להעדכון:")
        print(json.dumps(material_update, indent=2, ensure_ascii=False))
        
except Exception as e:
    print(f"❌ שגיאה: {e}")

# ============================================================================
# דוגמה 2: עדכון CourseSession
# ============================================================================
print("\n" + "=" * 100)
print("📅 דוגמה 2: עדכון סשן קורס (COURSE SESSION)")
print("=" * 100)

try:
    sessions = make_api_request(f'apps/{APP_ID}/entities/CourseSession')
    if isinstance(sessions, list) and len(sessions) > 0:
        session_sample = sessions[0]
        session_id = session_sample.get('id')
        
        print(f"\n✨ דוגמה: סשן קיים")
        print(f"   ID: {session_id}")
        print(f"   שם: {session_sample.get('title')}")
        print(f"   תאריך: {session_sample.get('date')}")
        print(f"   משך: {session_sample.get('duration_hours')} שעות")
        print(f"   סטטוס: {session_sample.get('status')}")
        
        # דוגמה לעדכון
        session_update = {
            "title": session_sample.get('title'),
            "description": "סשן משודרג עם מטרות לימוד ברורות וחומרים מקצועיים",
            "objectives": "שליטה בתחום, הבנה עמוקה, יישום מעשי",
            "status": "published",
            "teacher_notes": "סשן זה דורש הכנה מקדימה - קרא את המדריכים המצורפים",
            "materials_link": GUIDES.get("python_guide", "")
        }
        
        print(f"\n📝 נתונים להעדכון:")
        print(json.dumps(session_update, indent=2, ensure_ascii=False))
        
except Exception as e:
    print(f"❌ שגיאה: {e}")

# ============================================================================
# דוגמה 3: עדכון Course
# ============================================================================
print("\n" + "=" * 100)
print("🎓 דוגמה 3: עדכון קורס (COURSE)")
print("=" * 100)

try:
    courses = make_api_request(f'apps/{APP_ID}/entities/Course')
    if isinstance(courses, list) and len(courses) > 0:
        course_sample = courses[0]
        course_id = course_sample.get('id')
        
        print(f"\n✨ דוגמה: קורס קיים")
        print(f"   ID: {course_id}")
        print(f"   שם: {course_sample.get('name')}")
        print(f"   קוד: {course_sample.get('code')}")
        print(f"   סמסטר: {course_sample.get('semester')}")
        print(f"   תאריך התחלה: {course_sample.get('start_date')}")
        
        # דוגמה לעדכון
        course_update = {
            "description": """<h2>📚 קורס משופר בתוכן פדגוגי</h2>
            <p>קורס זה משלב בתיאוריה ויישום מעשי בתחום ההנדסה והטכנולוגיה.</p>
            <h3>🎯 מטרות הקורס:</h3>
            <ul>
            <li>הבנה עמוקה של עקרונות היסוד</li>
            <li>יישום מעשי בפרויקטים אמיתיים</li>
            <li>פיתוח מיומנויות שיתוף פעולה</li>
            <li>הכנה לשוק העבודה</li>
            </ul>""",
            "attendance_threshold": 80.0,
            "allow_self_registration": True,
            "status": "active"
        }
        
        print(f"\n📝 נתונים להעדכון:")
        print(json.dumps(course_update, indent=2, ensure_ascii=False)[:500] + "...")
        
except Exception as e:
    print(f"❌ שגיאה: {e}")

# ============================================================================
# טמפלט ממוצע לכל פעם שרוצים לעדכן
# ============================================================================
print("\n" + "=" * 100)
print("🔧 טמפלט UNIVERSAL לשימוש חוזר")
print("=" * 100)

template = """
def update_entity_pedagogical(entity_type, entity_id, custom_data=None):
    '''
    פונקציה ממוצעת לעדכון כל ישות עם תוכן פדגוגי
    
    Parameters:
    -----------
    entity_type: str
        סוג הישות: 'Course', 'Material', 'CourseSession', 'Assignment', 'Student'
    entity_id: str
        ID של הישות
    custom_data: dict
        נתונים מותאמים למאפייניה של הישות
    
    Returns:
    --------
    dict: התגובה של ה-API עם הישות המעודכנת
    
    Example:
    --------
    update_entity_pedagogical('Material', 'material_id_123', {
        'title': 'חומר משופר',
        'description': 'תיאור פדגוגי עמוק',
        'resource_links': ['https://link1.com', 'https://link2.com']
    })
    '''
    
    # ערך ברירת המחדל לכל ישות
    default_update = {
        'Course': {
            'status': 'active',
            'allow_self_registration': True,
            'attendance_threshold': 80.0
        },
        'Material': {
            'type': 'document',
            'week_number': 1
        },
        'CourseSession': {
            'status': 'published',
            'duration_hours': 2.0
        },
        'Assignment': {
            'status': 'open',
            'max_score': 100.0,
            'submission_type': 'online'
        },
        'Student': {
            'status': 'active'
        }
    }
    
    # מיזוג נתונים
    update_data = {**default_update.get(entity_type, {}), **(custom_data or {})}
    
    # בצע את ההעדכון
    response = make_api_request(
        f'apps/{APP_ID}/entities/{entity_type}/{entity_id}',
        method='PUT',
        data=update_data
    )
    
    return response
"""

print("\n📄 קוד טמפלט לשימוש חוזר:")
print(template)

print("\n" + "=" * 100)
print("✨ סוף הטמפלט - עכשיו אתה יכול לעדכן כל ישות!")
print("=" * 100)
