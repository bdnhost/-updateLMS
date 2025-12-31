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

print("=" * 100)
print("📚 סקרי דוגמאות מכל הישויות במערכת LMS")
print("=" * 100)

# 1. Course Example
print("\n" + "=" * 100)
print("📖 קורס (COURSE) - דוגמה")
print("=" * 100)
try:
    courses = make_api_request(f'apps/{APP_ID}/entities/Course')
    if isinstance(courses, list) and len(courses) > 0:
        course = courses[0]
    else:
        course = courses.get('data', [{}])[0] if isinstance(courses, dict) else {}
    
    if course:
        print(f"\n✨ קורס: {course.get('name', 'N/A')}")
        print(f"   קוד קורס: {course.get('code', 'N/A')}")
        print(f"   מרצה: {course.get('teacher_id', 'N/A')}")
        print(f"   סמסטר: {course.get('semester', 'N/A')}")
        print(f"   תחנות: {course.get('total_sessions', 'N/A')}")
        print(f"   סטטוס: {course.get('status', 'N/A')}")
        print(f"   מתקבל הרשמה עצמית: {course.get('allow_self_registration', False)}")
        print(f"\n📊 שדות שניתן לעדכן:")
        print("   • name, code, semester, year")
        print("   • start_date, weekly_hours, total_sessions")
        print("   • day_of_week, start_time, end_time")
        print("   • description, status, attendance_threshold")
        print("   • color, whatsapp_group_link")
        print("   • allow_self_registration, is_public")
except Exception as e:
    print(f"❌ שגיאה בקריאת קורסים: {e}")

# 2. CourseSession Example
print("\n" + "=" * 100)
print("📅 סשן קורס (COURSE SESSION) - דוגמה")
print("=" * 100)
try:
    sessions = make_api_request(f'apps/{APP_ID}/entities/CourseSession')
    if isinstance(sessions, list) and len(sessions) > 0:
        session = sessions[0]
    else:
        session = sessions.get('data', [{}])[0] if isinstance(sessions, dict) else {}
    
    if session:
        print(f"\n✨ סשן: {session.get('title', 'N/A')}")
        print(f"   קורס: {session.get('course_id', 'N/A')}")
        print(f"   סשן מס': {session.get('session_number', 'N/A')}")
        print(f"   תאריך: {session.get('date', 'N/A')}")
        print(f"   שעות: {session.get('duration_hours', 'N/A')}")
        print(f"   Zoom Meeting: {session.get('zoom_meeting_id', 'N/A') or 'אין'}")
        print(f"   Recording: {session.get('recording_url', 'N/A') or 'אין'}")
        print(f"   סטטוס: {session.get('status', 'N/A')}")
        print(f"\n📊 שדות שניתן לעדכן:")
        print("   • title, description, objectives")
        print("   • date, start_time, end_time, duration_hours")
        print("   • location, status")
        print("   • video_conference_link, zoom_meeting_id")
        print("   • recording_url, presentation_url")
        print("   • teacher_notes, materials_link")
except Exception as e:
    print(f"❌ שגיאה בקריאת סשנים: {e}")

# 3. Material Example
print("\n" + "=" * 100)
print("📄 חומר (MATERIAL) - דוגמה")
print("=" * 100)
try:
    materials = make_api_request(f'apps/{APP_ID}/entities/Material')
    if isinstance(materials, list) and len(materials) > 0:
        material = materials[0]
    else:
        material = materials.get('data', [{}])[0] if isinstance(materials, dict) else {}
    
    if material:
        print(f"\n✨ חומר: {material.get('title', 'N/A')}")
        print(f"   תיאור: {material.get('description', 'N/A')[:80]}...")
        print(f"   קורס: {material.get('course_id', 'N/A')}")
        print(f"   סשן: {material.get('session_id', 'N/A')}")
        print(f"   סוג: {material.get('type', 'N/A')}")
        print(f"   נושא: {material.get('topic', 'N/A')}")
        print(f"   שבוע: {material.get('week_number', 'N/A')}")
        print(f"\n📊 שדות שניתן לעדכן:")
        print("   • title, description")
        print("   • type, topic, week_number")
        print("   • file_url, media_url")
        print("   • audio_url, audio_script")
        print("   • media_prompt, generated_content")
except Exception as e:
    print(f"❌ שגיאה בקריאת חומרים: {e}")

# 4. Student Example
print("\n" + "=" * 100)
print("👨‍🎓 תלמיד (STUDENT) - דוגמה")
print("=" * 100)
try:
    students = make_api_request(f'apps/{APP_ID}/entities/Student')
    if isinstance(students, list) and len(students) > 0:
        student = students[0]
    else:
        student = students.get('data', [{}])[0] if isinstance(students, dict) else {}
    
    if student:
        print(f"\n✨ תלמיד: {student.get('full_name', 'N/A')}")
        print(f"   מזהה: {student.get('student_identity_id', 'N/A')}")
        print(f"   מספר תעודה: {student.get('id_number', 'N/A')}")
        print(f"   אימייל: {student.get('email', 'N/A')}")
        print(f"   טלפון: {student.get('phone', 'N/A')}")
        print(f"   מחלקה: {student.get('department', 'N/A')}")
        print(f"   קורסים: {student.get('course_ids', [])}")
        print(f"   התקדמות: {student.get('progress', 'N/A')}%")
        print(f"   ניקוד התקדמות: {student.get('avg_engagement_score', 'N/A')}")
        print(f"   סטטוס: {student.get('status', 'N/A')}")
        print(f"\n📊 שדות שניתן לעדכן:")
        print("   • full_name, id_number, email, phone")
        print("   • department, notes, status")
        print("   • course_id, course_ids")
        print("   • whatsapp_chat_id, zoom_user_id")
        print("   • competencies (מערך)")
except Exception as e:
    print(f"❌ שגיאה בקריאת תלמידים: {e}")

# 5. Summary of all entities
print("\n" + "=" * 100)
print("📊 סיכום מבנה הנתונים")
print("=" * 100)

entities_info = {
    "Course": {
        "description": "מידע על קורסים",
        "key_fields": ["name", "code", "semester", "start_date", "description", "status"],
        "example_use": "עדכון קורסים, שיוך סטודנטים, הגדרת טיטולים"
    },
    "CourseSession": {
        "description": "מפגשי הוראה בתוך קורס",
        "key_fields": ["title", "date", "start_time", "duration_hours", "zoom_meeting_id", "objectives"],
        "example_use": "ניהול מפגשים, הוספת הקלטות, הערות מדריך"
    },
    "Material": {
        "description": "חומרי לימוד וחומרי עזר",
        "key_fields": ["title", "description", "type", "topic", "week_number", "file_url"],
        "example_use": "הוספת מדריכים, וידאו, מצגות, קבצים"
    },
    "Assignment": {
        "description": "מטלות לתלמידים",
        "key_fields": ["title", "description", "due_date", "max_score", "key_concepts", "resource_links"],
        "example_use": "יצירת מטלות, הערכה, קישור לחומרים"
    },
    "Student": {
        "description": "מידע על תלמידים",
        "key_fields": ["full_name", "email", "course_ids", "progress", "status", "competencies"],
        "example_use": "עדכון פרטי תלמיד, ניהול קורסים, בדיקת התקדמות"
    }
}

for entity_name, info in entities_info.items():
    print(f"\n📌 {entity_name}")
    print(f"   {info['description']}")
    print(f"   🔑 שדות עיקריים: {', '.join(info['key_fields'][:3])}")
    print(f"   💡 שימושים: {info['example_use']}")

print("\n" + "=" * 100)
print("✨ סיום סקר הישויות")
print("=" * 100)
