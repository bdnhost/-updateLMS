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

course_id = "69414e2be636c8c8c38af82d"

print("=" * 100)
print("🎯 תוכנית עדכון מאזורית של הקורס")
print("=" * 100)

# ============================================================================
# STEP 1: עדכון תיאור הקורס
# ============================================================================

course_description = """<h2>🤖 יישומי AI להנדסאי מכונות</h2>

<h3>📌 סיכום הקורס</h3>
<p>קורס פרקטי המשלב בינה מלאכותית עם הנדסת מכונות. תלמידים ילמדו להשתמש בכלי AI מובילים ויישמו אותם בסביבה תעשייתית אמיתית. הקורס מתמקד בשלוש עמודות: שימוש בכלי AI, פיתוח עם Python, והשלמה בפרויקט מעשי.</p>

<h3>🎯 מטרות הקורס</h3>
<p><strong>בסיום הקורס, הסטודנט יהיה מסוגל:</strong></p>
<ul>
<li>✅ להשתמש בכלי AI מובילים (ChatGPT, Claude, Gemini) בעבודה היומיומית</li>
<li>✅ לבנות אפליקציות פשוטות עם AI ו-Python</li>
<li>✅ לאסוף מידע מהאינטרנט באופן אוטומטי (Web Scraping)</li>
<li>✅ לעבוד עם מסמכים ונתונים באמצעות AI (Data Processing)</li>
<li>✅ ליצור תוכן (טקסט, תמונות) עם כלי AI (Generative Models)</li>
<li>✅ להבין את היכולות והמגבלות של AI בהקשר של הנדסה</li>
<li>✅ לשלב AI בעבודתו כהנדסאי (בתחזוקה, אבחון, ניטור)</li>
<li>✅ לבנות פרויקט מעשי המשתמש ב-AI וקשור להנדסת מכונות</li>
</ul>

<h3>📚 מבנה הקורס</h3>
<p>הקורס מחולק ל-3 וחדות עיקריות:</p>
<ol>
<li><strong>יחידה 1: יסודות AI וכלים (סשנים 1-2)</strong> - הכרות עם כלי AI, Prompt Engineering</li>
<li><strong>יחידה 2: Python וניתוח נתונים (סשנים 3-5)</strong> - Python basics, Pandas, ניתוח נתוני ייצור</li>
<li><strong>יחידה 3: יישומים מעשיים (סשנים 6-10)</strong> - ניטור, תחזוקה מונעת, Chatbots, פרויקט סופי</li>
</ol>

<h3>⏰ משך הקורס</h3>
<p>35 שעות כוללות (10 סשנים של 3.5 שעות כל אחד)</p>

<h3>📈 שיטת הדרכה</h3>
<p>הקורס משלב תיאוריה ויישום מעשי:</p>
<ul>
<li>🎓 הרצאות: מושגים ויסודות</li>
<li>💻 תרגול בכיתה: עבודה מעשית עם כלים</li>
<li>📝 שיעורי בית: הטמעה ופרויקטים</li>
<li>🧪 בחנים: מעקב אחר הידע</li>
<li>🏆 פרויקט סופי: הוכחת יכולת מעשית</li>
</ul>

<h3>✅ דרישות מוקדמות</h3>
<ul>
<li>ידע בסיסי בשימוש במחשב</li>
<li>עדיפות: ידע בHebrew (התוכן ברובו בעברית)</li>
<li>יכולת להתאים לתוכנה חדשה (Python, APIs)</li>
</ul>

<h3>🎁 מה תלמיד קיבל</h3>
<ul>
<li>✨ גישה לכל חומרי הקורס (מדריכים, קודים, דוגמאות)</li>
<li>✨ דוגמאות מעשיות של יישומי AI בהנדסת מכונות</li>
<li>✨ תבניות Python ללא צורך לכתוב מאפס</li>
<li>✨ קישורים למדריכים רשמיים וחברות טכנולוגיה</li>
<li>✨ תמיכה ופורום שאלות וקשר עם מנחה הקורס</li>
</ul>"""

print("\n" + "-" * 100)
print("STEP 1: עדכון תיאור הקורס")
print("-" * 100)

try:
    update_data = {
        "description": course_description
    }
    
    response = make_api_request(
        f'apps/{APP_ID}/entities/Course/{course_id}',
        method='PUT',
        data=update_data
    )
    print("✅ עודכן: תיאור הקורס")
    print(f"   אורך תיאור: {len(course_description)} תווים")
except Exception as e:
    print(f"❌ שגיאה: {e}")

# ============================================================================
# STEP 2: עדכון סשנים עם objectives ברורים
# ============================================================================

print("\n" + "-" * 100)
print("STEP 2: עדכון סשנים עם objectives וקישורים")
print("-" * 100)

sessions_updates = {
    "69414e2b65bc340e8836c78d": {
        "title": "מבוא ל-AI ויישומים בהנדסה",
        "objectives": "הכרות עם בינה מלאכותית, כלים מרכזיים, אתיקה וויקו קורא",
        "description": "סשן פתיחה: הכרות עם כלי AI מובילים (ChatGPT, Claude, Gemini) וחקירת יישומים בתחום הנדסת מכונות",
        "teacher_notes": "התחל עם שאלה פתוחה: איפה חזית AI בעבודה שלך?",
        "materials_link": "https://bdnhost.net/Resources/guides/ai-automation/ai_basics.html"
    },
    "69414e2b4fbd1b665f582571": {
        "title": "Prompt Engineering - כיצד לדבר עם AI",
        "objectives": "שליטה בנקיתת פרומפטים יעילה, זיהוי מגבלות AI, חיזוק ידע בצורך לחזור לעקרונות",
        "description": "איך לכתוב הנחיות יעילות ל-AI, טכניקות prompt engineering, תרגול מעשי עם ChatGPT",
        "teacher_notes": "תן לסטודנטים לנסות בעצמם: כיצד תשאל את AI לפתור בעיה הנדסית?",
        "materials_link": "https://bdnhost.net/Resources/guides/ai-automation/prompt-engineering-guide.html"
    },
    "69414e2b56906fa6056d995b": {
        "title": "Python למהנדסים - יסודות",
        "objectives": "שליטה בעקרונות Python בסיסיים, מבנים נתונים, לולאות, ופונקציות",
        "description": "יסודות תכנות Python: משתנים, לולאות, פונקציות, ספריות בסיסיות. דוגמאות מהנדסיות",
        "teacher_notes": "זו הבסיס! ודא שכל סטודנט יכול להריץ קוד Python בסיסי",
        "materials_link": "https://bdnhost.net/Resources/guides/ai-automation/python_guide.html"
    },
    "69414e2be38a28655bb34f38": {
        "title": "ניתוח נתוני ייצור עם Python",
        "objectives": "עבודה עם pandas, טעינת נתונים, ניתוח סטטיסטי, ויזואליזציה",
        "description": "שימוש בספריית pandas לעיבוד נתונים בעולם האמיתי. ניתוח נתוני ייצור, חישוב מדדי OEE",
        "teacher_notes": "השתמש בנתונים ממפעל ממשי או סימולציה. זה מה שמעניין מהנדסים!",
        "materials_link": "https://bdnhost.net/Resources/guides/data-business/data_analysis_guide.html"
    },
    "69414e2cac5b82cce4a0ad27": {
        "title": "Terminal ו-Python בסביבת עבודה אמיתית",
        "objectives": "שימוש בטרמינל, הרצת סקריפטים Python, ניהול קבצים מהשורה",
        "description": "תרגול עם Terminal/PowerShell, הרצת Python scripts, עבודה עם קובץ ותיקיות",
        "teacher_notes": "תלמידים בדרך כלל חוששים מהטרמינל. הראה להם שזה בעצם קל וחזק!",
        "materials_link": "https://bdnhost.net/Resources/guides/digital-basics/terminal_guide.html"
    },
    "69414e2c3ee762a6a5f26700": {
        "title": "מערכת ניטור חכמה - חלק 1 (בנייה)",
        "objectives": "תכנון מערכת, אדריכלוק, בחירת כלים וטכנולוגיות",
        "description": "בניית מערכת ניטור קומה מלאה שמשתמשת ב-Python ו-AI לניטור כשל ממכונה",
        "teacher_notes": "זה מתחיל להיות מעניין! צריך לתכנן איך לרכוש נתונים, לעבד, ו-alert",
        "materials_link": "https://bdnhost.net/Resources/guides/ai-automation/python_guide.html"
    },
    "69414e2c1330bc7ac6fe43b8": {
        "title": "מערכת ניטור חכמה - חלק 2 (השלמה)",
        "objectives": "השלמת המימוש, שילוב AI, בדיקות, הטמעה",
        "description": "סיום מערכת הניטור: שילוב עם AI לתחזוקה מונעת, בדיקות, דוקומנטציה",
        "teacher_notes": "התמקד בקיבוץ קוד, שיתוף עבודה בין סטודנטים, קודוד ללא גבול",
        "materials_link": "https://bdnhost.net/Resources/guides/data-business/data_analysis_guide.html"
    },
    "69414e2c3df03f934edd538b": {
        "title": "תחזוקה מונעת מבוססת AI",
        "objectives": "יישום חיזוי תקלות, קביעת לוח זמנים תחזוקה אופטימלי",
        "description": "שימוש ב-AI לניתחון תקלות עתידיות, בחירת מודלי ML בסיסיים, אפליקציה מעשית",
        "teacher_notes": "כאן אתה מחברת את כל הטכניקות: Python, ניתוח נתונים, AI",
        "materials_link": "https://bdnhost.net/Resources/guides/ai-automation/understanding-llms-how-it-works.html"
    },
    "69414e2c9aac2db4157c4d20": {
        "title": "Chatbot לתמיכה טכנית - בנייה",
        "objectives": "בנייה של chatbot בסיסי עם OpenAI API, שילוב בממשק משתמש",
        "description": "בנייה של chatbot שיכול לעזור בשאלות תחזוקה, שימוש ב-OpenAI API, הנדסת פרומפטים",
        "teacher_notes": "זה בחלק האחרון והוא מאוד מעניין. סטודנטים אוהבים chatbots!",
        "materials_link": "https://bdnhost.net/Resources/guides/ai-automation/chatgpt_guide.html"
    },
    "69414e2c8387be36c66836fe": {
        "title": "הצגות פרויקט וסיכום קורס",
        "objectives": "הצגת פרויקט מעשי, שיתוף חוויות, הערכה הדדית",
        "description": "כל סטודנט מציג את פרויקטו (מערכת ניטור ו/או chatbot), דיון על יישומים עתידיים",
        "teacher_notes": "חלק חשוב! זו הפעם הראשונה שסטודנט 'משיק' אפליקציה אמיתית עם AI",
        "materials_link": "https://bdnhost.net/Resources/guides/career/presentation_skills.html"
    }
}

try:
    updated = 0
    for session_id, update_dict in sessions_updates.items():
        response = make_api_request(
            f'apps/{APP_ID}/entities/CourseSession/{session_id}',
            method='PUT',
            data=update_dict
        )
        updated += 1
    print(f"✅ עודכנו {updated} סשנים עם objectives ומידע משופר")
except Exception as e:
    print(f"❌ שגיאה בעדכון סשנים: {e}")

print("\n" + "=" * 100)
print("✅ סיום עדכון - שלב 1 וחלק 2!")
print("=" * 100)
print("\n📊 סיכום:")
print("   ✅ עודכן תיאור קורס מלא")
print("   ✅ עודכנו 10 סשנים עם objectives")
print("   ✅ קישורים רלוונטיים לכל סשן")
print("\n🔄 הצעד הבא: עדכון מטלות ובדיקת חומרים")
