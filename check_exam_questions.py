# -*- coding: utf-8 -*-
"""
סקריפט לבדיקת content_data של מבחנים ובוחנים
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
import requests
import json

load_dotenv()

BASE44_APP_ID = os.getenv('BASE44_APP_ID')
BASE44_API_KEY = os.getenv('BASE44_API_KEY')
BASE_URL = 'https://app.base44.com/api/apps'

# בדיקה שיש ערכים
if not BASE44_APP_ID:
    print("❌ חסר BASE44_APP_ID בקובץ .env")
    sys.exit(1)

if not BASE44_API_KEY:
    print("❌ חסר BASE44_API_KEY בקובץ .env")
    sys.exit(1)

headers = {
    'api_key': BASE44_API_KEY,
    'Content-Type': 'application/json'
}

def main():
    print("בודק מבחנים ובוחנים במערכת...")
    print("=" * 80)

    # קבלת כל המטלות
    response = requests.get(
        f'{BASE_URL}/{BASE44_APP_ID}/entities/Assignment',
        headers=headers
    )

    if response.status_code != 200:
        print(f"שגיאה בקבלת מטלות: {response.status_code}")
        return

    assignments = response.json()

    # סינון מבחנים ובוחנים
    exams = [a for a in assignments if a.get('type') in ['exam', 'quiz']]

    print(f"נמצאו {len(exams)} מבחנים/בוחנים\n")

    # קטגוריזציה
    with_questions = []
    without_content_data = []
    with_content_no_questions = []

    for exam in exams:
        if not exam.get('content_data'):
            without_content_data.append(exam)
        elif not exam.get('content_data', {}).get('questions'):
            with_content_no_questions.append(exam)
        else:
            with_questions.append(exam)

    print(f"✅ עם שאלות: {len(with_questions)}")
    print(f"⚠️  עם content_data אבל ללא questions: {len(with_content_no_questions)}")
    print(f"❌ ללא content_data בכלל: {len(without_content_data)}")
    print("\n" + "=" * 80)

    # פירוט מבחנים עם שאלות
    if with_questions:
        print("\n📝 מבחנים/בוחנים עם שאלות:")
        print("-" * 80)
        for exam in with_questions:
            questions = exam['content_data'].get('questions', [])
            print(f"  {exam.get('title', 'ללא כותרת')}")
            print(f"    - סוג: {exam.get('type', 'לא ידוע')}")
            print(f"    - מספר שאלות: {len(questions)}")
            if questions:
                print(f"    - דוגמה לשאלה: {questions[0].get('question_text', '')[:60]}...")
            print()

    # פירוט מבחנים ללא שאלות
    if without_content_data or with_content_no_questions:
        print("\n⚠️  מבחנים/בוחנים ללא שאלות:")
        print("-" * 80)
        for exam in without_content_data + with_content_no_questions:
            print(f"  ❌ {exam.get('title', 'ללא כותרת')}")
            print(f"     ID: {exam['id']}")
            print(f"     סוג: {exam.get('type', 'לא ידוע')}")
            print()

    print("=" * 80)
    if without_content_data or with_content_no_questions:
        print("💡 להרצת תיקון: python fix_exam_content_data.py")

if __name__ == '__main__':
    main()
