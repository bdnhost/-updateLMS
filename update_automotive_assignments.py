"""
📝 עדכון Assignments - קורס AI להנדסאי רכב שנה א'
Course ID: 6942ae4afed1bf7040557a50

עדכון מטלות עם תוכן פדגוגי איכותי המותאם לסילבוס החדש
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

print("=" * 100)
print("📝 עדכון Assignments - קורס AI להנדסאי רכב")
print("=" * 100)

# קבל את כל המטלות הקיימות
print("\n🔍 שלב 1: קריאת מטלות קיימות...")
try:
    assignments_response = make_api_request(
        f'apps/{APP_ID}/entities/Assignment',
        data={'course_id': COURSE_ID}
    )

    if isinstance(assignments_response, list):
        existing_assignments = assignments_response
    else:
        existing_assignments = assignments_response.get('data', [])

    print(f"✅ נמצאו {len(existing_assignments)} מטלות קיימות\n")

    # הצג מטלות קיימות
    for i, assignment in enumerate(existing_assignments, 1):
        print(f"{i}. {assignment.get('title', 'ללא כותרת')}")
        print(f"   ID: {assignment.get('id')}")
        print(f"   משקל: {assignment.get('weight', 'N/A')} | ציון מקס: {assignment.get('max_score', 'N/A')}")

except Exception as e:
    print(f"❌ שגיאה: {e}")
    existing_assignments = []

# ============================================================================
# שלב 2: הכנת מטלות מומלצות
# ============================================================================

print("\n" + "=" * 100)
print("📚 שלב 2: מטלות מומלצות לפי הסילבוס")
print("=" * 100)

recommended_assignments = [
    {
        "category": "תרגול בכיתה",
        "title": "תרגול 1: היכרות עם כלי AI ושאילת שאלות טכניות",
        "description": """<h3>🎯 מטרה: הכרת כלי AI מובילים</h3>
<p><strong>שייך לשבוע 1-2</strong> | תרגול בכיתה</p>

<h4>📋 משימות:</h4>
<ol>
<li>הירשם ל-ChatGPT ו-Claude (חינם)</li>
<li>שאל 3 שאלות טכניות על רכבים:
   <ul>
   <li>דוגמה 1: "כיצד עובד מנוע בעירה פנימית?"</li>
   <li>דוגמה 2: "מהם הסימפטומים של סוללה חלשה ברכב?"</li>
   <li>דוגמה 3: "הסבר את עקרון ה-ABS (Anti-lock Braking System)"</li>
   </ul>
</li>
<li>השווה תשובות מ-ChatGPT ל-Claude</li>
<li>תעד במסמך: השאלות, התשובות, והמסקנות שלך</li>
</ol>

<h4>📤 הגשה:</h4>
<p>מסמך Word/PDF עם 3 השאלות + תשובות + ניתוח קצר (1-2 פסקות)</p>

<h4>🎓 קריטריונים:</h4>
<ul>
<li>איכות השאלות - 30%</li>
<li>השוואה מדויקת - 40%</li>
<li>מסקנות אישיות - 30%</li>
</ul>""",
        "weight": 5,
        "max_score": 10,
        "submission_type": "online"
    },

    {
        "category": "תרגול בית",
        "title": "תרגיל 1: בנק פרומפטים אישי לאבחון רכב",
        "description": """<h3>🎯 מטרה: שליטה ב-Prompt Engineering</h3>
<p><strong>שייך לשבוע 2-3</strong> | שיעורי בית</p>

<h4>📋 משימות:</h4>
<ol>
<li>צור בנק של <strong>5 פרומפטים</strong> לבעיות אבחון נפוצות ברכב</li>
<li>לכל פרומפט:
   <ul>
   <li>תאר את הבעיה (דוגמה: "הרכב לא מתניע")</li>
   <li>כתוב prompt יעיל ל-AI</li>
   <li>בדוק את התשובה מ-ChatGPT</li>
   <li>שפר את ה-prompt אם צריך</li>
   </ul>
</li>
<li>דוגמאות לבעיות:
   <ul>
   <li>רכב לא מתניע בבוקר קר</li>
   <li>נורת מנוע דולקת</li>
   <li>רעש מוזר בבלמים</li>
   <li>ריח עשן מהמנוע</li>
   <li>רטט בהגה בזמן נסיעה</li>
   </ul>
</li>
</ol>

<h4>📤 הגשה:</h4>
<p>קובץ Excel/Google Sheets עם 5 שורות (כל שורה = בעיה + prompt + תשובה + שיפורים)</p>

<h4>🎓 קריטריונים:</h4>
<ul>
<li>איכות ה-prompts - 50%</li>
<li>רלוונטיות התשובות - 30%</li>
<li>שיפורים ואיטרציות - 20%</li>
</ul>""",
        "weight": 10,
        "max_score": 20,
        "submission_type": "online"
    },

    {
        "category": "בוחן",
        "title": "בוחן 1: יסודות AI ורכבים אוטונומיים",
        "description": """<h3>🎯 מטרה: בדיקת הבנה של יסודות AI</h3>
<p><strong>שייך לשבוע 1-3</strong> | בוחן קצר (15 דקות)</p>

<h4>📋 נושאי הבוחן:</h4>
<ol>
<li><strong>מושגים בסיסיים:</strong>
   <ul>
   <li>הבדלים בין AI, ML, DL</li>
   <li>דוגמאות ל-AI ברכב</li>
   </ul>
</li>
<li><strong>רכבים אוטונומיים:</strong>
   <ul>
   <li>6 רמות האוטונומיה (SAE)</li>
   <li>חיישנים: Lidar, Radar, Camera</li>
   </ul>
</li>
<li><strong>Prompt Engineering:</strong>
   <ul>
   <li>מהו Prompt יעיל?</li>
   <li>כתיבת prompt לבעיה ספציפית</li>
   </ul>
</li>
</ol>

<h4>📝 פורמט:</h4>
<ul>
<li>10 שאלות אמריקאיות - 60%</li>
<li>2 שאלות פתוחות קצרות - 40%</li>
</ul>

<h4>📚 חומר לימוד:</h4>
<ul>
<li><a href="https://bdnhost.net/Resources/guides/ai-automation/ai_basics.html">AI Basics Guide</a></li>
<li><a href="https://bdnhost.net/Resources/guides/ai-automation/prompt-engineering-guide.html">Prompt Engineering Guide</a></li>
<li><a href="https://bdnhost.net/Resources/guides/technology/automotive_guide.html">Automotive Guide</a></li>
</ul>""",
        "weight": 5,
        "max_score": 10,
        "submission_type": "online"
    },

    {
        "category": "מעבדה",
        "title": "מעבדה 1: חיבור ל-OBD-II וקריאת נתונים",
        "description": """<h3>🎯 מטרה: אבחון רכב מעשי עם OBD-II</h3>
<p><strong>שייך לשבוע 4</strong> | עבודת מעבדה</p>

<h4>📋 משימות:</h4>
<ol>
<li>הכר את מתאם OBD-II (Bluetooth/WiFi)</li>
<li>התקן אפליקציה: Torque או Car Scanner</li>
<li>התחבר לרכב (אמיתי או סימולטור) וקרא:
   <ul>
   <li>קודי תקלה (DTCs) - אם יש</li>
   <li>נתוני זמן אמת: RPM, מהירות, טמפרטורת מנוע</li>
   <li>מצב חיישנים: חיישן חמצן, MAP, MAF</li>
   </ul>
</li>
<li>תעד 3 screenshots מהאפליקציה</li>
<li>השתמש ב-ChatGPT לפרש את הנתונים:
   <ul>
   <li>"מה משמעות קוד P0420?"</li>
   <li>"RPM גבוה ב-idle - מה הסיבות האפשריות?"</li>
   </ul>
</li>
</ol>

<h4>📤 הגשה:</h4>
<p>דוח PDF עם screenshots + פרשנות מ-AI + מסקנות (2-3 עמודים)</p>

<h4>🎓 קריטריונים:</h4>
<ul>
<li>חיבור מוצלח וקריאת נתונים - 40%</li>
<li>שימוש חכם ב-AI לפרשנות - 40%</li>
<li>איכות התיעוד - 20%</li>
</ul>""",
        "weight": 10,
        "max_score": 20,
        "submission_type": "online"
    },

    {
        "category": "תרגול בית",
        "title": "תרגיל 2: Python - קריאת נתוני חיישנים מ-CSV",
        "description": """<h3>🎯 מטרה: עיבוד נתוני רכב עם Python</h3>
<p><strong>שייך לשבוע 5-6</strong> | שיעורי בית</p>

<h4>📋 משימות:</h4>
<ol>
<li>הורד קובץ נתונים לדוגמה (נספק במערכת)</li>
<li>כתוב סקריפט Python שמבצע:
   <ul>
   <li>טעינת הנתונים (pandas.read_csv)</li>
   <li>הצגת 5 שורות ראשונות</li>
   <li>חישוב ממוצע טמפרטורת מנוע</li>
   <li>מציאת RPM מקסימלי</li>
   <li>זיהוי אם היה ערך חריג (מעל 100 מעלות או RPM > 7000)</li>
   </ul>
</li>
<li>הסקריפט צריך להדפיס תוצאות ברורות</li>
</ol>

<h4>📤 הגשה:</h4>
<p>קובץ .py + screenshot של הפלט</p>

<h4>🎓 קריטריונים:</h4>
<ul>
<li>קוד עובד ללא שגיאות - 50%</li>
<li>חישובים נכונים - 30%</li>
<li>קוד קריא ומסודר - 20%</li>
</ul>

<h4>📚 משאבים:</h4>
<ul>
<li><a href="https://bdnhost.net/Resources/guides/ai-automation/python_guide.html">Python Guide</a></li>
<li><a href="https://bdnhost.net/Resources/guides/data-business/data_analysis_guide.html">Data Analysis Guide</a></li>
</ul>""",
        "weight": 10,
        "max_score": 20,
        "submission_type": "online"
    },

    {
        "category": "בוחן",
        "title": "בוחן 2: Python ו-OBD-II",
        "description": """<h3>🎯 מטרה: בדיקת ידע ב-Python ואבחון</h3>
<p><strong>שייך לשבוע 4-6</strong> | בוחן (20 דקות)</p>

<h4>📋 נושאי הבוחן:</h4>
<ol>
<li><strong>Python יסודות:</strong>
   <ul>
   <li>משתנים וטיפוסים</li>
   <li>לולאות (for, while)</li>
   <li>פונקציות</li>
   </ul>
</li>
<li><strong>OBD-II:</strong>
   <ul>
   <li>מהו OBD-II?</li>
   <li>דוגמאות לקודי תקלה (DTCs)</li>
   <li>פרשנות נתונים</li>
   </ul>
</li>
<li><strong>משימה מעשית:</strong>
   <ul>
   <li>קוד Python קצר לעיבוד רשימה</li>
   </ul>
</li>
</ol>

<h4>📝 פורמט:</h4>
<ul>
<li>8 שאלות אמריקאיות - 50%</li>
<li>1 שאלת קוד - 30%</li>
<li>1 שאלה פתוחה - 20%</li>
</ul>""",
        "weight": 5,
        "max_score": 10,
        "submission_type": "online"
    },

    {
        "category": "פרויקט ביניים",
        "title": "פרויקט ביניים: מערכת אבחון חכמה פשוטה",
        "description": """<h3>🎯 מטרה: בנייה כלי אבחון מבוסס AI</h3>
<p><strong>שייך לשבוע 7-8</strong> | פרויקט בצוותים (2-3 סטודנטים)</p>

<h4>📋 דרישות הפרויקט:</h4>
<ol>
<li><strong>רעיון:</strong> בנו כלי שעוזר במוסך לאבחון תקלות נפוצות</li>
<li><strong>רכיבים:</strong>
   <ul>
   <li>ממשק פשוט (טקסט או GUI בסיסי)</li>
   <li>שאילת משתמש על סימפטומים (דוגמה: "הרכב לא מתניע")</li>
   <li>שליחת שאילתה ל-ChatGPT API או Claude API</li>
   <li>הצגת תשובה עם הסברים ופתרונות אפשריים</li>
   </ul>
</li>
<li><strong>בונוס:</strong>
   <ul>
   <li>קישור לנתוני OBD-II אמיתיים</li>
   <li>היסטוריה של שאילתות קודמות</li>
   <li>המלצות על חלקי חילוף</li>
   </ul>
</li>
</ol>

<h4>📤 הגשה:</h4>
<ul>
<li>קוד Python (.py או Jupyter Notebook)</li>
<li>דוח מסכם (3-5 עמודים): תיאור, ארכיטקטורה, screenshots, מסקנות</li>
<li>וידאו הדגמה (2-3 דקות)</li>
</ul>

<h4>🎓 קריטריונים:</h4>
<ul>
<li>פונקציונליות - 40%</li>
<li>שימוש ב-AI - 30%</li>
<li>יצירתיות - 15%</li>
<li>תיעוד והצגה - 15%</li>
</ul>

<h4>📚 משאבים:</h4>
<ul>
<li><a href="https://bdnhost.net/Resources/guides/ai-automation/chatgpt_guide.html">ChatGPT Guide</a></li>
<li><a href="https://bdnhost.net/Resources/guides/technology/automotive_guide.html">Automotive Guide</a></li>
</ul>""",
        "weight": 15,
        "max_score": 30,
        "submission_type": "online"
    },

    {
        "category": "תרגול בית",
        "title": "תרגיל 3: Chatbot פשוט לשאלות נפוצות במוסך",
        "description": """<h3>🎯 מטרה: בנייה chatbot בסיסי</h3>
<p><strong>שייך לשבוע 10</strong> | שיעורי בית</p>

<h4>📋 משימות:</h4>
<ol>
<li>השתמש ב-OpenAI API או Claude API (נספק קוד בסיסי)</li>
<li>בנה chatbot שעונה על 5 שאלות נפוצות:
   <ul>
   <li>"מתי להחליף שמן מנוע?"</li>
   <li>"מה משמעות נורת בלם ידני דולקת?"</li>
   <li>"כיצד לבדוק לחץ אוויר בצמיגים?"</li>
   <li>"מה עושים כשהסוללה התרוקנה?"</li>
   <li>"כיצד לזהות בלמים בעייתיים?"</li>
   </ul>
</li>
<li>הוסף לולאה שמאפשרת שאילתות מרובות עד שהמשתמש כותב "יציאה"</li>
</ol>

<h4>📤 הגשה:</h4>
<p>קובץ Python + screenshot של 3 שיחות לדוגמה</p>

<h4>🎓 קריטריונים:</h4>
<ul>
<li>קוד עובד - 50%</li>
<li>איכות תשובות - 30%</li>
<li>UI/UX (אפילו טקסט) - 20%</li>
</ul>""",
        "weight": 10,
        "max_score": 20,
        "submission_type": "online"
    },

    {
        "category": "בוחן",
        "title": "בוחן 3: ADAS, אתיקה ו-IoT",
        "description": """<h3>🎯 מטרה: בדיקת הבנה של נושאים מתקדמים</h3>
<p><strong>שייך לשבוע 8-12</strong> | בוחן (20 דקות)</p>

<h4>📋 נושאי הבוחן:</h4>
<ol>
<li><strong>מערכות ADAS:</strong>
   <ul>
   <li>ACC, Lane Keeping, AEB</li>
   <li>חיישנים ועקרונות פעולה</li>
   </ul>
</li>
<li><strong>אתיקה ב-AI:</strong>
   <ul>
   <li>דילמות אתיות (Trolley Problem)</li>
   <li>פרטיות נתונים</li>
   <li>אחריות לתאונות</li>
   </ul>
</li>
<li><strong>IoT ורכבים מחוברים:</strong>
   <ul>
   <li>V2V, V2I</li>
   <li>OTA Updates</li>
   <li>אבטחת סייבר</li>
   </ul>
</li>
</ol>

<h4>📝 פורמט:</h4>
<ul>
<li>10 שאלות אמריקאיות - 60%</li>
<li>2 שאלות פתוחות - 40%</li>
</ul>""",
        "weight": 5,
        "max_score": 10,
        "submission_type": "online"
    },

    {
        "category": "פרויקט גמר",
        "title": "פרויקט גמר: מערכת AI ברכב - בחירה חופשית",
        "description": """<h3>🎯 מטרה: פרויקט אינטגרטיבי משמעותי</h3>
<p><strong>שייך לשבוע 13-14</strong> | פרויקט בצוותים (2-3 סטודנטים)</p>

<h4>📋 אפשרויות לפרויקט:</h4>
<ol>
<li><strong>מערכת אבחון מתקדמת:</strong>
   <ul>
   <li>קישור OBD-II</li>
   <li>AI לפרשנות</li>
   <li>המלצות תחזוקה</li>
   </ul>
</li>
<li><strong>Chatbot תמיכה טכנית:</strong>
   <ul>
   <li>שילוב GPT-4 או Claude</li>
   <li>ממשק web או mobile</li>
   <li>היסטוריית שיחות</li>
   </ul>
</li>
<li><strong>מערכת ניטור ותחזוקה מונעת:</strong>
   <ul>
   <li>איסוף נתוני חיישנים</li>
   <li>חיזוי תקלות</li>
   <li>התראות אוטומטיות</li>
   </ul>
</li>
<li><strong>Computer Vision לזיהוי חלקים:</strong>
   <ul>
   <li>זיהוי לוחיות רישוי</li>
   <li>זיהוי פגמים בצבע</li>
   <li>זיהוי שחיקת צמיגים</li>
   </ul>
</li>
</ol>

<h4>📤 הגשה:</h4>
<ul>
<li><strong>קוד מלא</strong> (GitHub repository מומלץ)</li>
<li><strong>דוח מפורט</strong> (10-15 עמודים):
   <ul>
   <li>תקציר Executive Summary</li>
   <li>רקע ומטרה</li>
   <li>ארכיטקטורה ומימוש</li>
   <li>תוצאות ובדיקות</li>
   <li>מסקנות והמשך</li>
   </ul>
</li>
<li><strong>הצגה</strong> (10 דקות): slides + הדגמה חיה</li>
</ul>

<h4>🎓 קריטריונים:</h4>
<ul>
<li>פונקציונליות ומורכבות - 35%</li>
<li>שימוש יצירתי ב-AI - 25%</li>
<li>איכות קוד ותיעוד - 20%</li>
<li>הצגה - 10%</li>
<li>יצירתיות וחדשנות - 10%</li>
</ul>

<h4>📚 משאבים:</h4>
<ul>
<li>כל המדריכים שלמדנו בקורס</li>
<li>תמיכה אישית מהמרצה בשעות קבלה</li>
</ul>""",
        "weight": 30,
        "max_score": 50,
        "submission_type": "online"
    },

    {
        "category": "בוחן סופי",
        "title": "בוחן סופי: סיכום כל הקורס",
        "description": """<h3>🎯 מטרה: בדיקה מקיפה של כל החומר</h3>
<p><strong>שבוע 14</strong> | בוחן (45 דקות)</p>

<h4>📋 נושאי הבוחן:</h4>
<ol>
<li>יסודות AI, ML, DL (10%)</li>
<li>Prompt Engineering (10%)</li>
<li>רכבים אוטונומיים ו-ADAS (15%)</li>
<li>OBD-II ואבחון תקלות (15%)</li>
<li>Python ו-Pandas (15%)</li>
<li>Computer Vision (10%)</li>
<li>תחזוקה מונעת ו-IoT (10%)</li>
<li>אתיקה ובטיחות (10%)</li>
<li>שאלה אינטגרטיבית (5%)</li>
</ol>

<h4>📝 פורמט:</h4>
<ul>
<li>20 שאלות אמריקאיות - 60%</li>
<li>4 שאלות פתוחות קצרות - 30%</li>
<li>1 שאלה אינטגרטיבית - 10%</li>
</ul>

<h4>📚 חומר לימוד:</h4>
<p>כל המצגות, המדריכים והתרגולים שנלמדו במהלך הקורס</p>""",
        "weight": 10,
        "max_score": 20,
        "submission_type": "online"
    }
]

print(f"\n💡 יצרתי {len(recommended_assignments)} מטלות מומלצות:")
for i, assignment in enumerate(recommended_assignments, 1):
    print(f"\n{i}. [{assignment['category']}] {assignment['title']}")
    print(f"   משקל: {assignment['weight']}% | ציון מקס: {assignment['max_score']}")

# ============================================================================
# שלב 3: עדכון מטלות או יצירת חדשות
# ============================================================================

print("\n" + "=" * 100)
print("🔄 שלב 3: עדכון המטלות במערכת")
print("=" * 100)

if len(existing_assignments) > 0:
    print(f"\n📝 נמצאו {len(existing_assignments)} מטלות קיימות.")
    print("⚠️ אפשרויות:")
    print("   1. עדכן את המטלות הקיימות (מומלץ אם יש אותו מספר מטלות)")
    print("   2. צור מטלות חדשות (אם צריך להוסיף)")
    print("\n💡 הקוד מוכן - הסר את ה-comment מהשורות הבאות כדי להריץ עדכון!")

    # הסר comment כדי לעדכן מטלות קיימות
    """
    updated_count = 0
    for i, assignment in enumerate(existing_assignments):
        if i < len(recommended_assignments):
            assignment_id = assignment.get('id')
            update_data = {
                'title': recommended_assignments[i]['title'],
                'description': recommended_assignments[i]['description'],
                'weight': recommended_assignments[i]['weight'],
                'max_score': recommended_assignments[i]['max_score'],
                'submission_type': recommended_assignments[i].get('submission_type', 'online')
            }

            try:
                response = make_api_request(
                    f'apps/{APP_ID}/entities/Assignment/{assignment_id}',
                    method='PUT',
                    data=update_data
                )
                print(f"✅ {i+1}. {update_data['title'][:60]}")
                updated_count += 1
                time.sleep(0.2)
            except Exception as e:
                print(f"❌ שגיאה במטלה {i+1}: {e}")

    print(f"\n✅ עודכנו {updated_count} מטלות!")
    """
else:
    print("\n⚠️ לא נמצאו מטלות קיימות.")
    print("💡 אפשר ליצור מטלות חדשות דרך הממשק או להוסיף קוד יצירה כאן.")

print("\n" + "=" * 100)
print("✨ סיכום")
print("=" * 100)
print(f"✅ הוכנו {len(recommended_assignments)} מטלות מומלצות")
print("📝 כל מטלה כוללת:")
print("   • תיאור HTML מפורט")
print("   • משימות ברורות")
print("   • קריטריוני הערכה")
print("   • קישורים למדריכים רלוונטיים")
print("\n💡 הסר את ה-comment בקוד כדי לעדכן את המטלות הקיימות!")
print("🎯 המטלות מכסות את כל הסילבוס: תרגולים, בוחנים, ופרויקטים! 🚗💨")
