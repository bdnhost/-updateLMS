import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function TestGuideForm() {
    const htmlCodeAdvanced = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>טופס מתקדם - EduManage</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            margin-bottom: 40px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 20px 20px 0 0;
        }
        .content { padding: 30px; }
        .section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            border-right: 4px solid #667eea;
        }
        .section h3 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .field { margin-bottom: 15px; }
        .field label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: #333;
        }
        .required { color: #e74c3c; }
        input, textarea, select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 15px;
        }
        input:focus, textarea:focus, select:focus {
            outline: none;
            border-color: #667eea;
        }
        textarea { min-height: 100px; resize: vertical; }
        .option {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .option:hover { background: #f5f5f5; }
        small { display: block; color: #666; font-size: 12px; margin-top: 4px; }
        button {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        button:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(102,126,234,0.4); }
        button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .success {
            text-align: center;
            padding: 40px;
        }
        .success-icon {
            width: 80px;
            height: 80px;
            background: #10b981;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
        }
        small { display: block; color: #666; font-size: 12px; margin-top: 4px; }
    </style>
</head>
<body>
    <div class="container" id="container">
        <div class="header">
            <h1>🚀 טופס מתקדם לבדיקה</h1>
            <p>בדיקת קליטת נתונים מרובים</p>
        </div>
        
        <div class="content">
            <form id="advancedForm">
                
                <div class="field">
                    <label>מזהה תלמיד <span class="required">*</span></label>
                    <input type="text" name="student_id" required placeholder="הכנס מזהה תלמיד קיים">
                    <small>מזהה תלמיד קיים במערכת שלך</small>
                </div>

                <!-- מידע בסיסי -->
                <div class="section">
                    <h3>📋 מידע אישי</h3>
                    
                    <div class="field">
                        <label>שם מלא <span class="required">*</span></label>
                        <input type="text" name="full_name" required placeholder="שם מלא">
                    </div>

                    <div class="field">
                        <label>אימייל</label>
                        <input type="email" name="email" placeholder="example@mail.com">
                    </div>

                    <div class="field">
                        <label>טלפון</label>
                        <input type="tel" name="phone" placeholder="050-1234567">
                    </div>

                    <div class="field">
                        <label>גיל</label>
                        <input type="number" name="age" min="1" max="120" placeholder="גיל">
                    </div>
                </div>

                <!-- העדפות -->
                <div class="section">
                    <h3>📚 העדפות למידה</h3>
                    
                    <div class="field">
                        <label>בחר סגנון למידה</label>
                        <div>
                            <label class="option">
                                <input type="radio" name="learning_style" value="visual">
                                <span>👁️ ויזואלי</span>
                            </label>
                            <label class="option">
                                <input type="radio" name="learning_style" value="auditory">
                                <span>🔊 שמיעתי</span>
                            </label>
                            <label class="option">
                                <input type="radio" name="learning_style" value="kinesthetic">
                                <span>✋ קינסטתי</span>
                            </label>
                        </div>
                    </div>

                    <div class="field">
                        <label>מועד מועדף ללימוד</label>
                        <select name="preferred_time">
                            <option value="">בחר מועד</option>
                            <option value="morning">בוקר</option>
                            <option value="afternoon">צהריים</option>
                            <option value="evening">ערב</option>
                            <option value="night">לילה</option>
                        </select>
                    </div>
                </div>

                <!-- תחומי עניין -->
                <div class="section">
                    <h3>💡 תחומי עניין</h3>
                    
                    <div class="field">
                        <label>תחומי עניין (מרובה)</label>
                        <label class="option">
                            <input type="checkbox" name="interests" value="coding">
                            <span>💻 תכנות</span>
                        </label>
                        <label class="option">
                            <input type="checkbox" name="interests" value="design">
                            <span>🎨 עיצוב</span>
                        </label>
                        <label class="option">
                            <input type="checkbox" name="interests" value="data">
                            <span>📊 ניתוח נתונים</span>
                        </label>
                        <label class="option">
                            <input type="checkbox" name="interests" value="marketing">
                            <span>📱 שיווק</span>
                        </label>
                        <label class="option">
                            <input type="checkbox" name="interests" value="business">
                            <span>💼 עסקים</span>
                        </label>
                    </div>

                    <div class="field">
                        <label>רמת ניסיון</label>
                        <select name="experience_level">
                            <option value="">בחר רמה</option>
                            <option value="beginner">מתחיל</option>
                            <option value="intermediate">בינוני</option>
                            <option value="advanced">מתקדם</option>
                            <option value="expert">מומחה</option>
                        </select>
                    </div>
                </div>

                <!-- מטרות -->
                <div class="section">
                    <h3>🎯 מטרות וציפיות</h3>
                    
                    <div class="field">
                        <label>מה המטרה העיקרית שלך?</label>
                        <textarea name="main_goal" placeholder="תאר את המטרה שלך..."></textarea>
                    </div>

                    <div class="field">
                        <label>האם יש לך ניסיון קודם?</label>
                        <div>
                            <label class="option">
                                <input type="radio" name="has_experience" value="yes">
                                <span>כן</span>
                            </label>
                            <label class="option">
                                <input type="radio" name="has_experience" value="no">
                                <span>לא</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- הערות -->
                <div class="section">
                    <h3>📝 הערות נוספות</h3>
                    
                    <div class="field">
                        <label>הערות</label>
                        <textarea name="notes" placeholder="כתוב הערות נוספות..."></textarea>
                    </div>

                    <div class="field">
                        <label>איך שמעת עלינו?</label>
                        <select name="referral_source">
                            <option value="">בחר מקור</option>
                            <option value="google">גוגל</option>
                            <option value="facebook">פייסבוק</option>
                            <option value="friend">המלצת חבר</option>
                            <option value="ad">פרסומת</option>
                            <option value="other">אחר</option>
                        </select>
                    </div>
                </div>

                <button type="submit" id="submitBtn">✅ שלח טופס מתקדם</button>
            </form>
        </div>
    </div>

    <script>
        const API = 'https://693824c5c1ad33c1f114ebd2.base44.app/api/functions/submitGuideForm';

        document.getElementById('advancedForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = document.getElementById('submitBtn');
            btn.disabled = true;
            btn.textContent = '⏳ שולח...';

            const form = e.target;

            const data = {
                full_name: form.full_name.value,
                email: form.email.value,
                phone: form.phone.value,
                age: form.age.value,
                learning_style: form.learning_style.value,
                preferred_time: form.preferred_time.value,
                interests: Array.from(form.querySelectorAll('input[name="interests"]:checked'))
                    .map(cb => cb.value),
                experience_level: form.experience_level.value,
                main_goal: form.main_goal.value,
                has_experience: form.has_experience.value,
                notes: form.notes.value,
                referral_source: form.referral_source.value
            };

            try {
                const res = await fetch(API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        student_id: form.student_id.value,
                        guide_name: 'טופס מתקדם לבדיקה',
                        guide_chapter: 'פרק 1 - מידע כללי',
                        guide_section: 'סעיף A - נתונים אישיים',
                        guide_task: 'מילוי טופס מתקדם',
                        page_url: window.location.href,
                        form_data: data
                    })
                });

                const result = await res.json();
                
                if (result.success) {
                    document.getElementById('container').innerHTML = '<div class="success">' +
                        '<div class="success-icon">✅</div>' +
                        '<h2>הטופס נשלח בהצלחה!</h2>' +
                        '<p style="color: #666; margin: 20px 0;">כל הנתונים נשמרו במערכת.</p>' +
                        '<a href="' + result.links.student_portal + '" style="display:inline-block; padding:12px 24px; background:#667eea; color:white; text-decoration:none; border-radius:8px; margin:5px;">פורטל תלמיד</a>' +
                        '</div>';
                } else {
                    alert('❌ שגיאה: ' + result.error);
                    btn.disabled = false;
                    btn.textContent = '✅ שלח טופס מתקדם';
                }
            } catch (error) {
                alert('❌ שגיאת חיבור: ' + error.message);
                btn.disabled = false;
                btn.textContent = '✅ שלח טופס מתקדם';
            }
        });
    </script>
</body>
</html>`;

    const htmlCode = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>בדיקת מדריך - EduManage</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            width: 100%;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 20px 20px 0 0;
        }
        .content { padding: 30px; }
        .field { margin-bottom: 20px; }
        .field label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: #333;
        }
        .required { color: #e74c3c; }
        input, textarea, select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 15px;
        }
        input:focus, textarea:focus, select:focus {
            outline: none;
            border-color: #667eea;
        }
        textarea { min-height: 100px; resize: vertical; }
        .option {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            margin-bottom: 8px;
            cursor: pointer;
        }
        .option:hover { background: #f5f5f5; }
        button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
        }
        button:hover { transform: translateY(-2px); }
        button:disabled { opacity: 0.6; }
        .success {
            text-align: center;
            padding: 40px;
        }
        .success-icon {
            width: 60px;
            height: 60px;
            background: #10b981;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
        }
    </style>
</head>
<body>
    <div class="container" id="container">
        <div class="header">
            <h1>🧪 בדיקת טופס מדריך</h1>
            <p>דוגמא לבדיקת שליחת נתונים</p>
        </div>
        
        <div class="content">
            <form id="testForm">
                
                <div class="field">
                    <label>מזהה תלמיד <span class="required">*</span></label>
                    <input type="text" name="student_id" required placeholder="הכנס מזהה תלמיד קיים">
                    <small style="color: #666; font-size: 12px;">מזהה תלמיד קיים במערכת שלך</small>
                </div>

                <div class="field">
                    <label>שם מלא <span class="required">*</span></label>
                    <input type="text" name="full_name" required placeholder="שם מלא">
                </div>

                <div class="field">
                    <label>בחר סגנון למידה</label>
                    <div>
                        <label class="option">
                            <input type="radio" name="learning_style" value="visual">
                            <span>ויזואלי</span>
                        </label>
                        <label class="option">
                            <input type="radio" name="learning_style" value="auditory">
                            <span>שמיעתי</span>
                        </label>
                    </div>
                </div>

                <div class="field">
                    <label>תחומי עניין (מרובה)</label>
                    <label class="option">
                        <input type="checkbox" name="interests" value="coding">
                        <span>תכנות</span>
                    </label>
                    <label class="option">
                        <input type="checkbox" name="interests" value="design">
                        <span>עיצוב</span>
                    </label>
                </div>

                <div class="field">
                    <label>הערות</label>
                    <textarea name="notes" placeholder="כתוב הערות..."></textarea>
                </div>

                <button type="submit" id="submitBtn">✅ שלח לבדיקה</button>
            </form>
        </div>
    </div>

    <script>
        const API = 'https://693824c5c1ad33c1f114ebd2.base44.app/api/functions/submitGuideForm';

        document.getElementById('testForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = document.getElementById('submitBtn');
            btn.disabled = true;
            btn.textContent = '⏳ שולח...';

            const formData = new FormData(e.target);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                if (key === 'student_id') continue;
                
                if (data[key]) {
                    if (!Array.isArray(data[key])) data[key] = [data[key]];
                    data[key].push(value);
                } else {
                    data[key] = value;
                }
            }

            try {
                const res = await fetch(API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        student_id: formData.get('student_id'),
                        guide_name: 'טופס בדיקה',
                        page_url: window.location.href,
                        form_data: data
                    })
                });

                const result = await res.json();
                
                if (result.success) {
                    document.getElementById('container').innerHTML = '<div class="success">' +
                        '<div class="success-icon">✅</div>' +
                        '<h2>הטופס נשלח בהצלחה!</h2>' +
                        '<p style="color: #666; margin: 20px 0;">כל הנתונים נשמרו במערכת.</p>' +
                        '<a href="' + result.links.student_portal + '" style="display:inline-block; padding:12px 24px; background:#667eea; color:white; text-decoration:none; border-radius:8px; margin:5px;">פורטל תלמיד</a>' +
                        '</div>';
                } else {
                    alert('❌ שגיאה: ' + result.error);
                    btn.disabled = false;
                    btn.textContent = '✅ שלח לבדיקה';
                }
            } catch (error) {
                alert('❌ שגיאת חיבור: ' + error.message);
                btn.disabled = false;
                btn.textContent = '✅ שלח לבדיקה';
            }
        });
    </script>
</body>
</html>`;

    const handleDownload = () => {
        const blob = new Blob([htmlCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'test-guide-form.html';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('קובץ הבדיקה הורד!');
    };

    const handleDownloadAdvanced = () => {
        const blob = new Blob([htmlCodeAdvanced], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'advanced-guide-form.html';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('טופס מורחב הורד!');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(htmlCode);
        toast.success('הקוד הועתק ללוח!');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <CardTitle className="text-2xl">טופס בדיקה - מקצה לקצה</CardTitle>
                    <p className="text-blue-100 text-sm mt-2">
                        הורד את הקובץ ופתח אותו בדפדפן לבדיקה מלאה
                    </p>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    
                    <div className="bg-green-50 border-r-4 border-green-500 p-6 rounded-lg">
                        <h3 className="font-bold text-green-900 mb-3 text-lg">✅ אין צורך ב-API Key!</h3>
                        <p className="text-green-800 text-sm">
                            הפונקציה פתוחה לשליחה חיצונית. רק צריך מזהה תלמיד תקין.
                        </p>
                    </div>

                    <div className="bg-blue-50 border-r-4 border-blue-500 p-6 rounded-lg">
                        <h3 className="font-bold text-blue-900 mb-3">📋 איך לבדוק?</h3>
                        <ol className="space-y-2 text-blue-800 text-sm">
                            <li>1. הורד את קובץ הבדיקה</li>
                            <li>2. פתח אותו בדפדפן</li>
                            <li>3. הכנס מזהה תלמיד **קיים** במערכת שלך</li>
                            <li>4. מלא את השדות ושלח</li>
                            <li>5. בדוק בכרטיס התלמיד שהנתונים התקבלו!</li>
                        </ol>
                    </div>

                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <Button onClick={handleDownload} className="gap-2 bg-blue-600 hover:bg-blue-700 flex-1">
                                <Download className="h-4 w-4" />
                                הורד טופס בסיסי
                            </Button>
                            <Button onClick={handleCopy} variant="outline" className="gap-2 flex-1">
                                <ExternalLink className="h-4 w-4" />
                                העתק קוד
                            </Button>
                        </div>
                        <Button onClick={handleDownloadAdvanced} className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full">
                            <Download className="h-4 w-4" />
                            🚀 הורד טופס מורחב (כל סוגי השדות)
                        </Button>
                    </div>

                    <div className="bg-amber-50 border-r-4 border-amber-500 p-6 rounded-lg">
                        <h3 className="font-bold text-amber-900 mb-3">⚠️ שים לב</h3>
                        <ul className="space-y-2 text-amber-800 text-sm">
                            <li>• השתמש במזהה תלמיד <strong>אמיתי</strong> שקיים במערכת</li>
                            <li>• הקובץ עובד ישירות מהדפדפן (אין צורך בשרת)</li>
                            <li>• כל הנתונים נשמרים אוטומטית ב-GuideSubmission</li>
                        </ul>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}