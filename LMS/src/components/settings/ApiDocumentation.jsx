import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Copy, Terminal, Code, BookOpen, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ApiDocumentation({ apiKey, apiUrl }) {
    
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('הקוד הועתק ללוח');
    };

    const CodeBlock = ({ language, code }) => (
        <div className="relative group bg-slate-950 rounded-lg overflow-hidden border border-slate-800 my-4 dir-ltr text-left">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                <span className="text-xs text-slate-400 font-mono">{language}</span>
                <button 
                    onClick={() => copyToClipboard(code)}
                    className="text-slate-400 hover:text-white transition-colors"
                >
                    <Copy className="h-3 w-3" />
                </button>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto">
                <code>{code}</code>
            </pre>
        </div>
    );

    const endpoints = [
        {
            method: 'GET',
            path: '/publicApi?resource=courses',
            description: 'קבלת רשימת כל הקורסים הפעילים בארגון.',
            params: [
                { name: 'limit', type: 'number', desc: 'הגבלת כמות (ברירת מחדל: 50)' },
                { name: 'offset', type: 'number', desc: 'דילוג על רשומות (לצורך דפדוף)' }
            ]
        },
        {
            method: 'GET',
            path: '/publicApi?resource=sessions&course_id={id}',
            description: 'קבלת הסילבוס (רשימת מפגשים) עבור קורס ספציפי.',
            params: [
                { name: 'course_id', type: 'string', required: true, desc: 'מזהה הקורס' }
            ]
        },
        {
            method: 'GET',
            path: '/publicApi?resource=assignments&course_id={id}',
            description: 'קבלת רשימת המטלות והמבחנים.',
            params: [
                { name: 'course_id', type: 'string', desc: 'סינון לפי קורס (אופציונלי)' }
            ]
        }
    ];

    const jsExample = `
// דוגמה: משיכת קורסים וסילבוס מלא באמצעות JavaScript (Fetch API)

const API_KEY = '${apiKey || 'YOUR_API_KEY'}';
const BASE_URL = '${apiUrl}';

async function fetchCourseData() {
    try {
        // 1. קבלת רשימת הקורסים
        const coursesRes = await fetch(\`\${BASE_URL}?resource=courses&limit=10\`, {
            headers: { 'x-api-key': API_KEY }
        });
        const { data: courses } = await coursesRes.json();
        
        console.log(\`נמצאו \${courses.length} קורסים\`);

        // 2. עבור כל קורס - משוך את הסילבוס
        for (const course of courses) {
            const syllabusRes = await fetch(\`\${BASE_URL}?resource=sessions&course_id=\${course.id}\`, {
                headers: { 'x-api-key': API_KEY }
            });
            const { data: sessions } = await syllabusRes.json();
            
            console.log(\`קורס: \${course.name} - \${sessions.length} מפגשים\`);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchCourseData();
`;

    const pythonExample = `
# דוגמה: משיכת מטלות וניתוח נתונים באמצעות Python

import requests

API_KEY = '${apiKey || 'YOUR_API_KEY'}'
BASE_URL = '${apiUrl}'

headers = {
    'x-api-key': API_KEY
}

def analyze_assignments():
    try:
        # שליפת כל המטלות
        response = requests.get(f"{BASE_URL}?resource=assignments", headers=headers)
        data = response.json()
        
        if data['success']:
            assignments = data['data']
            print(f"סה\\"כ מטלות במערכת: {len(assignments)}")
            
            # סינון מטלות פתוחות
            open_assignments = [a for a in assignments if a.get('status') == 'open']
            print(f"מטלות פתוחות להגשה: {len(open_assignments)}")
            
            for assignment in open_assignments:
                print(f"- {assignment['title']} (עד: {assignment['due_date']})")
                
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    analyze_assignments()
`;

    return (
        <div className="mt-8 space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6 text-violet-600" />
                <h2 className="text-2xl font-bold text-slate-800">מדריך למפתחים ואינטגרציה</h2>
            </div>

            <Tabs defaultValue="endpoints" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="endpoints">נקודות קצה (Endpoints)</TabsTrigger>
                    <TabsTrigger value="examples">דוגמאות קוד</TabsTrigger>
                    <TabsTrigger value="guides">מדריכים מתקדמים</TabsTrigger>
                </TabsList>

                {/* Endpoints Tab */}
                <TabsContent value="endpoints" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>רשימת משאבים זמינים</CardTitle>
                            <CardDescription>פירוט מלא של בקשות GET הנתמכות במערכת</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                {endpoints.map((endpoint, idx) => (
                                    <AccordionItem key={idx} value={`item-${idx}`}>
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center gap-3 w-full">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-mono">
                                                    {endpoint.method}
                                                </Badge>
                                                <span className="font-mono text-sm text-slate-600 dir-ltr text-left flex-1">
                                                    {endpoint.path}
                                                </span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="bg-slate-50 p-4 rounded-b-lg">
                                            <p className="mb-4 text-slate-700">{endpoint.description}</p>
                                            
                                            {endpoint.params && (
                                                <div className="space-y-2">
                                                    <h4 className="font-bold text-xs text-slate-500 uppercase">פרמטרים:</h4>
                                                    <div className="grid gap-2">
                                                        {endpoint.params.map((param, pIdx) => (
                                                            <div key={pIdx} className="flex items-center text-sm">
                                                                <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800 ml-2">{param.name}</code>
                                                                <span className="text-slate-400 text-xs ml-2">({param.type})</span>
                                                                <span className="text-slate-600">{param.desc}</span>
                                                                {param.required && <Badge className="mr-auto text-[10px] h-5 bg-red-100 text-red-700 hover:bg-red-100 border-0">חובה</Badge>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-4 pt-4 border-t border-slate-200">
                                                <h4 className="font-bold text-xs text-slate-500 uppercase mb-2">דוגמה לבקשה:</h4>
                                                <CodeBlock 
                                                    language="bash" 
                                                    code={`curl -X GET "${apiUrl.split('?')[0]}?resource=${endpoint.path.split('resource=')[1].split('&')[0]}" \\\n  -H "x-api-key: ${apiKey || 'YOUR_KEY'}"`} 
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Examples Tab */}
                <TabsContent value="examples" className="mt-4">
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Code className="w-5 h-5 text-yellow-500" />
                                    JavaScript / Node.js
                                </CardTitle>
                                <CardDescription>
                                    שימוש ב-Fetch API למשיכת נתונים היררכיים (קורסים -> סילבוס)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CodeBlock language="javascript" code={jsExample} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Terminal className="w-5 h-5 text-blue-500" />
                                    Python
                                </CardTitle>
                                <CardDescription>
                                    שימוש בספריית requests לניתוח נתוני מטלות
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CodeBlock language="python" code={pythonExample} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Advanced Guides Tab */}
                <TabsContent value="guides" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>תרחישי שימוש מתקדמים</CardTitle>
                            <CardDescription>איך לבנות אינטגרציות חכמות להשבחת תוכן</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            
                            <div className="flex gap-4 items-start">
                                <div className="bg-purple-100 p-2 rounded-lg text-purple-600 mt-1">
                                    <Terminal className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">1. בוט בקרת איכות לסילבוס</h3>
                                    <p className="text-slate-600 mt-1 mb-2">
                                        ניתן להשתמש ב-API כדי למשוך את כל המפגשים (Sessions) ולנתח את התיאורים שלהם באמצעות LLM חיצוני.
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-slate-500 space-y-1">
                                        <li>משוך את כל הקורסים באמצעות <code>resource=courses</code></li>
                                        <li>עבור כל קורס, משוך את הסילבוס עם <code>resource=sessions</code></li>
                                        <li>שלח את הטקסטים לניתוח ב-OpenAI/Claude</li>
                                        <li>הפק דוח המלצות לשיפור</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 my-4"></div>

                            <div className="flex gap-4 items-start">
                                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 mt-1">
                                    <Check className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">2. סנכרון מטלות למערכת LMS חיצונית</h3>
                                    <p className="text-slate-600 mt-1 mb-2">
                                        אם הארגון משתמש במערכת Moodle או Canvas במקביל, ניתן לסנכרן מטלות אוטומטית.
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-slate-500 space-y-1">
                                        <li>הגדר Cron Job שרץ אחת ליום</li>
                                        <li>משוך מטלות חדשות שנוצרו ב-24 שעות האחרונות</li>
                                        <li>סנן לפי <code>course_id</code> רלוונטי</li>
                                        <li>צור את המטלה המקבילה במערכת היעד</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-amber-800 text-sm">הערה חשובה למפתחים</h4>
                                    <p className="text-xs text-amber-700 mt-1">
                                        בשלב זה ה-API תומך בקריאה בלבד (Read-Only). יכולות עריכה ועדכון (Write/Update) יתווספו בגרסאות הבאות.
                                        לצורך שינוי תכנים בפועל, יש להשתמש בממשק הניהול או לפנות לתמיכה לפתיחת גישה מיוחדת.
                                    </p>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}