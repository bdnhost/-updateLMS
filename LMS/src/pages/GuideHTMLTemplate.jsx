import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

/**
 * דף ליצירת תבנית HTML להטמעה חיצונית
 */
export default function GuideHTMLTemplate() {
    const [apiUrl, setApiUrl] = useState(window.location.origin);

    const htmlTemplate = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>מדריך התלמיד - EduManage</title>
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
            max-width: 700px;
            width: 100%;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            border-radius: 20px 20px 0 0;
        }
        .content { padding: 40px 30px; }
        .intro {
            background: #f0f4ff;
            border-right: 4px solid #667eea;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .field { margin-bottom: 25px; }
        .field label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: #333;
        }
        .required { color: #e74c3c; }
        input[type="text"], input[type="number"], textarea, select {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 15px;
            transition: border-color 0.3s;
        }
        input:focus, textarea:focus, select:focus {
            outline: none;
            border-color: #667eea;
        }
        textarea { min-height: 120px; resize: vertical; }
        .option {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            cursor: pointer;
            margin-bottom: 10px;
        }
        .option:hover { background: #f5f5f5; border-color: #667eea; }
        .submit-btn {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
        }
        .submit-btn:hover { transform: translateY(-2px); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .success-message {
            text-align: center;
            padding: 60px 30px;
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
        .link-button {
            display: inline-block;
            margin: 10px;
            padding: 15px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 10px;
        }
    </style>
</head>
<body>
    <div class="container" id="formContainer">
        <div class="header">
            <h1>📚 שם המדריך שלך</h1>
            <p>פרק X > מדור Y > מטלה Z</p>
        </div>
        
        <div class="content">
            <div class="intro">
                <h3>🎯 מטרת המדריך</h3>
                <p>הסבר קצר על מטרת המדריך...</p>
            </div>

            <form id="guideForm">
                
                <div class="field">
                    <label for="student_id">מזהה תלמיד <span class="required">*</span></label>
                    <input type="text" id="student_id" name="student_id" required>
                </div>

                <div class="field">
                    <label for="full_name">שם מלא <span class="required">*</span></label>
                    <input type="text" id="full_name" name="full_name" required>
                </div>

                <div class="field">
                    <label for="answer">תשובתך <span class="required">*</span></label>
                    <textarea id="answer" name="answer" required></textarea>
                </div>

                <button type="submit" class="submit-btn" id="submitBtn">✅ שלח טופס</button>
            </form>
        </div>
    </div>

    <script>
        const API_URL = '${apiUrl}/api/functions/submitGuideForm';

        // טעינה אוטומטית של student_id מה-URL
        const urlParams = new URLSearchParams(window.location.search);
        const studentId = urlParams.get('student_id');
        if (studentId) {
            document.getElementById('student_id').value = studentId;
        }

        document.getElementById('guideForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ שולח...';

            const formData = new FormData(e.target);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                if (key === 'student_id') continue;
                
                // טיפול בשדות מרובים
                if (data.hasOwnProperty(key)) {
                    if (!Array.isArray(data[key])) data[key] = [data[key]];
                    data[key].push(value);
                } else {
                    data[key] = value;
                }
            }

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        student_id: formData.get('student_id'),
                        guide_name: 'שם המדריך שלך',
                        guide_chapter: 'פרק X',
                        guide_section: 'מדור Y',
                        guide_task: 'מטלה Z',
                        form_data: data
                    })
                });

                const result = await response.json();

                if (result.success) {
                    document.getElementById('formContainer').innerHTML = \`
                        <div class="success-message">
                            <div class="success-icon">✅</div>
                            <h2 style="font-size: 24px; margin-bottom: 10px;">הטופס נשלח בהצלחה!</h2>
                            <p style="color: #666; margin-bottom: 30px;">תודה על ההגשה.</p>
                            <a href="\${result.links.student_portal}" class="link-button">🏠 חזרה לפורטל</a>
                            <a href="\${result.links.main_site}" class="link-button">🌐 EduManage</a>
                        </div>
                    \`;
                } else {
                    alert('שגיאה: ' + result.error);
                    submitBtn.disabled = false;
                    submitBtn.textContent = '✅ שלח טופס';
                }
            } catch (error) {
                alert('שגיאה בשליחה');
                submitBtn.disabled = false;
                submitBtn.textContent = '✅ שלח טופס';
            }
        });
    </script>
</body>
</html>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(htmlTemplate);
        toast.success('הקוד הועתק בהצלחה!');
    };

    const handleDownload = () => {
        const blob = new Blob([htmlTemplate], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'guide-template.html';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('הקובץ הורד בהצלחה!');
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto" dir="rtl">
            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                    <CardTitle className="text-2xl">תבנית HTML למדריכים חיצוניים</CardTitle>
                    <p className="text-violet-100 text-sm mt-2">
                        העתק את הקוד הזה וצור דף HTML חיצוני ששולח נתונים ישירות למערכת EduManage
                    </p>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    
                    <div className="bg-blue-50 border-r-4 border-blue-500 p-6 rounded-lg">
                        <h3 className="font-bold text-blue-900 mb-3 text-lg">📖 איך זה עובד?</h3>
                        <ol className="space-y-2 text-blue-800 text-sm">
                            <li>1. העתק את קוד ה-HTML למטה</li>
                            <li>2. ערוך את שמות המדריך, הפרק, המדור והמטלה</li>
                            <li>3. התאם את השדות לפי הצורך שלך</li>
                            <li>4. שמור כקובץ .html והעלה לשרת או שלח ישירות לתלמידים</li>
                            <li>5. התלמיד ממלא ומשלח - הנתונים נשמרים בכרטיס שלו!</li>
                        </ol>
                    </div>

                    <div className="flex gap-3">
                        <Button onClick={handleCopy} className="gap-2">
                            <Copy className="h-4 w-4" />
                            העתק קוד
                        </Button>
                        <Button onClick={handleDownload} variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            הורד כקובץ HTML
                        </Button>
                        <Button 
                            asChild
                            variant="secondary"
                            className="gap-2"
                        >
                            <a href="https://github.com/yourusername/edumanage-guides" target="_blank">
                                <ExternalLink className="h-4 w-4" />
                                מדריך מלא
                            </a>
                        </Button>
                    </div>

                    <div className="relative">
                        <Textarea
                            value={htmlTemplate}
                            readOnly
                            className="font-mono text-xs min-h-[600px] bg-slate-50 border-slate-200"
                            dir="ltr"
                        />
                    </div>

                    <div className="bg-amber-50 border-r-4 border-amber-500 p-6 rounded-lg">
                        <h3 className="font-bold text-amber-900 mb-3">⚠️ הערות חשובות</h3>
                        <ul className="space-y-2 text-amber-800 text-sm">
                            <li>• <strong>API URL:</strong> החלף את <code className="bg-amber-100 px-2 py-1 rounded">YOUR_APP_URL</code> בכתובת האפליקציה שלך</li>
                            <li>• <strong>שמות שדות:</strong> השתמש בשמות באנגלית (עם _ במקום רווחים)</li>
                            <li>• <strong>נתיב היררכי:</strong> עדכן את guide_name, guide_chapter, guide_section, guide_task</li>
                            <li>• <strong>העלאת קבצים:</strong> דורשת שני שלבים (העלאה + שליחת URL)</li>
                        </ul>
                    </div>

                    <div className="bg-green-50 border-r-4 border-green-500 p-6 rounded-lg">
                        <h3 className="font-bold text-green-900 mb-3">✅ משתנים דינמיים נתמכים</h3>
                        <p className="text-green-800 text-sm mb-3">
                            אם תשלח לתלמיד קישור עם <code className="bg-green-100 px-2 py-1 rounded">?student_id=XXX</code>, 
                            השדה יתמלא אוטומטית!
                        </p>
                        <code className="block bg-green-100 p-3 rounded text-xs" dir="ltr">
                            https://yoursite.com/guide.html?student_id=abc123
                        </code>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}