# -*- coding: utf-8 -*-
"""
סקריפט למילוי content_data למבחנים ובוחנים
ממלא 5-10 שאלות לכל מבחן/בוחן בהתאם לסוג
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
import requests
import json

load_dotenv()

BASE44_PROJECT_ID = os.getenv('BASE44_PROJECT_ID')
BASE44_API_KEY = os.getenv('BASE44_API_KEY')
BASE_URL = 'https://api.base44.com/api/v1'

headers = {
    'Authorization': f'Bearer {BASE44_API_KEY}',
    'Content-Type': 'application/json'
}

def generate_questions_for_exam(exam_title, exam_type, num_questions):
    """
    יוצר שאלות לדוגמה בהתאם לסוג המבחן
    """
    questions = []

    is_final = 'מבחן סיום' in exam_title or 'מבחן גמר' in exam_title or 'final' in exam_title.lower()
    is_midterm = 'מבחן אמצע' in exam_title or 'midterm' in exam_title.lower() or 'בוחן' in exam_title

    # טיפוסי שאלות בהתאם לנושא
    question_templates = {
        'multiple_choice': [
            {
                'question_text': 'מהו המושג המרכזי בנושא שנלמד?',
                'question_type': 'multiple_choice',
                'points': 10,
                'options': [
                    'הגדרה א',
                    'הגדרה ב',
                    'הגדרה ג',
                    'הגדרה ד'
                ]
            },
            {
                'question_text': 'באיזו שיטה משתמשים לפתרון הבעיה?',
                'question_type': 'multiple_choice',
                'points': 10,
                'options': [
                    'שיטה ראשונה',
                    'שיטה שנייה',
                    'שיטה שלישית',
                    'שיטה רביעית'
                ]
            }
        ],
        'open': [
            {
                'question_text': 'הסבר בהרחבה את המושג המרכזי שנלמד בקורס',
                'question_type': 'open_ended',
                'points': 20
            },
            {
                'question_text': 'תאר את התהליך המלא לפתרון הבעיה',
                'question_type': 'open_ended',
                'points': 20
            }
        ],
        'practical': [
            {
                'question_text': 'כתוב קוד המממש את הפונקציונליות הנדרשת',
                'question_type': 'code',
                'points': 25
            },
            {
                'question_text': 'פתור את הבעיה המעשית הבאה',
                'question_type': 'practical',
                'points': 25
            }
        ]
    }

    # קביעת חלוקת סוגי שאלות
    if exam_type == 'quiz':
        # בוחן - בעיקר רב ברירה
        mc_count = int(num_questions * 0.8)
        open_count = num_questions - mc_count
        practical_count = 0
    elif is_final:
        # מבחן סיום - שילוב של הכל
        mc_count = int(num_questions * 0.4)
        open_count = int(num_questions * 0.3)
        practical_count = num_questions - mc_count - open_count
    elif is_midterm:
        # מבחן אמצע
        mc_count = int(num_questions * 0.5)
        open_count = int(num_questions * 0.3)
        practical_count = num_questions - mc_count - open_count
    else:
        # מבחן רגיל
        mc_count = int(num_questions * 0.5)
        open_count = int(num_questions * 0.4)
        practical_count = num_questions - mc_count - open_count

    # הוספת שאלות רב ברירה
    for i in range(mc_count):
        template = question_templates['multiple_choice'][i % len(question_templates['multiple_choice'])]
        questions.append({
            **template,
            'question_text': f"שאלה {i+1}: {template['question_text']}"
        })

    # הוספת שאלות פתוחות
    for i in range(open_count):
        template = question_templates['open'][i % len(question_templates['open'])]
        questions.append({
            **template,
            'question_text': f"שאלה {mc_count + i + 1}: {template['question_text']}"
        })

    # הוספת שאלות מעשיות
    for i in range(practical_count):
        template = question_templates['practical'][i % len(question_templates['practical'])]
        questions.append({
            **template,
            'question_text': f"שאלה {mc_count + open_count + i + 1}: {template['question_text']}"
        })

    return questions

def main():
    print("מחפש מבחנים ובוחנים ללא content_data...")
    print("=" * 80)

    # קבלת כל המטלות
    response = requests.get(
        f'{BASE_URL}/data/{BASE44_PROJECT_ID}/Assignment',
        headers=headers
    )

    if response.status_code != 200:
        print(f"שגיאה בקבלת מטלות: {response.status_code}")
        return

    assignments = response.json()

    # סינון מבחנים ובוחנים
    exams = [a for a in assignments if a.get('type') in ['exam', 'quiz']]

    print(f"נמצאו {len(exams)} מבחנים/בוחנים")

    # מציאת מבחנים ללא content_data או ללא questions
    needs_update = []
    for exam in exams:
        if not exam.get('content_data') or not exam.get('content_data', {}).get('questions'):
            needs_update.append(exam)

    print(f"מתוכם {len(needs_update)} דורשים עדכון\n")

    if len(needs_update) == 0:
        print("כל המבחנים והבוחנים כבר מעודכנים!")
        return

    # עדכון כל מבחן
    updated_count = 0

    for exam in needs_update:
        exam_id = exam['id']
        exam_title = exam.get('title', 'ללא כותרת')
        exam_type = exam.get('type', 'exam')

        # קביעת מספר שאלות
        if exam_type == 'quiz':
            num_questions = 5  # בוחן - 5 שאלות
        else:
            num_questions = 10  # מבחן - 10 שאלות

        # יצירת שאלות
        questions = generate_questions_for_exam(exam_title, exam_type, num_questions)

        # בניית content_data
        content_data = {
            'questions': questions,
            'total_points': sum(q.get('points', 10) for q in questions),
            'time_limit_minutes': 90 if exam_type == 'exam' else 45,
            'instructions': f'מבחן זה כולל {num_questions} שאלות. קרא כל שאלה בעיון ענה בצורה מפורטת ומדויקת.'
        }

        # עדכון במערכת
        update_data = {
            'content_data': content_data
        }

        response = requests.patch(
            f'{BASE_URL}/data/{BASE44_PROJECT_ID}/Assignment/{exam_id}',
            headers=headers,
            json=update_data
        )

        if response.status_code == 200:
            print(f"✅ עודכן: {exam_title}")
            print(f"   סוג: {exam_type}, שאלות: {num_questions}, נקודות: {content_data['total_points']}")
            updated_count += 1
        else:
            print(f"❌ שגיאה בעדכון {exam_title}: {response.status_code}")
            print(f"   {response.text}")

    print("\n" + "=" * 80)
    print(f"סיום: עודכנו {updated_count} מבחנים/בוחנים")

if __name__ == '__main__':
    main()
