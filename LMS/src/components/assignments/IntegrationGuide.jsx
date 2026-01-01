import React from 'react';
import { X, Copy, Terminal, Server, Globe, Database, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const IntegrationGuide = ({ onClose }) => {
  // Construct the webhook URL dynamically based on current origin
  // Assuming standard Base44 proxy or direct function access pattern
  const webhookUrl = `${window.location.origin}/functions/externalAssignmentWebhook`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('הועתק ללוח');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Terminal size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">מדריך אינטגרציה למטלות חיצוניות</h2>
              <p className="text-slate-400 text-sm">חיבור מערכות למידה חיצוניות (HTML/H5P/SCORM) ל-EduManage</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50 text-right">
          
          {/* Step 1: Initialization */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-blue-700">
              <Globe size={24} />
              <h3 className="text-lg font-bold">1. זיהוי התלמיד (Client Side)</h3>
            </div>
            <p className="text-slate-600 mb-4 text-sm">
              כאשר תלמיד עובר למטלה החיצונית דרך המערכת, ה-URL יכיל אוטומטית את הפרמטרים הבאים.
              עליכם לקרוא אותם (למשל בעזרת JavaScript) ולשמור אותם לשלב ההגשה.
            </p>
            
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300 relative group overflow-x-auto text-left" dir="ltr">
              <span className="text-green-400">GET</span> https://your-external-task.com/index.html<span className="text-yellow-400">?base44StudentId=...&base44AssignmentId=...</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-600 list-disc list-inside">
              <li><strong>base44StudentId</strong>: מזהה התלמיד (חובה לשלוח בחזרה).</li>
              <li><strong>base44AssignmentId</strong>: מזהה המטלה (חובה לשלוח בחזרה).</li>
            </ul>
          </section>

          {/* Step 2: Submission */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-4 text-purple-700">
              <Server size={24} />
              <h3 className="text-lg font-bold">2. שליחת נתונים בסיום (Form Submission)</h3>
            </div>
            <p className="text-slate-600 mb-4 text-sm">
              בסיום המטלה, יש לבצע שליחת טופס (POST) לכתובת ה-Webhook שלנו.
              הדפדפן של התלמיד חייב לבצע את הניווט (לא AJAX/Fetch בלבד), כדי שהתלמיד יראה את דף האישור.
            </p>

            <div className="mb-4">
                <label className="text-xs font-bold text-slate-500 uppercase">כתובת ה-Webhook (Action URL)</label>
                <div className="flex gap-2 mt-1">
                    <code className="flex-1 p-3 bg-slate-100 rounded border border-slate-200 text-sm font-mono text-slate-700 break-all" dir="ltr">
                        {webhookUrl}
                    </code>
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(webhookUrl)}>
                        <Copy size={16} />
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-bold text-sm text-slate-700 mb-2">דוגמת קוד (HTML Form)</h4>
                    <div className="bg-slate-100 p-3 rounded text-sm font-mono text-slate-700 overflow-x-auto" dir="ltr">
{`<form action="${webhookUrl}" method="POST">
  <input type="hidden" name="base44StudentId" value="...">
  <input type="hidden" name="base44AssignmentId" value="...">
  <!-- JSON String of results -->
  <input type="hidden" name="submission_content" value='{...}'>
  <button type="submit">הגש מטלה</button>
</form>`}
                    </div>
                </div>
                <div>
                     <h4 className="font-bold text-sm text-slate-700 mb-2">שדות חובה (Body Parameters)</h4>
                     <ul className="text-sm space-y-2 text-slate-600 font-mono bg-slate-50 p-3 rounded" dir="ltr">
                         <li><span className="text-blue-600">base44StudentId</span></li>
                         <li><span className="text-blue-600">base44AssignmentId</span></li>
                         <li><span className="text-blue-600">submission_content</span> (JSON String)</li>
                     </ul>
                </div>
            </div>
          </section>

          {/* Step 3: Payload Structure */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-green-700">
              <Database size={24} />
              <h3 className="text-lg font-bold">3. מבנה ה-JSON (submission_content)</h3>
            </div>
            <p className="text-slate-600 mb-4 text-sm">
              השדה <code>submission_content</code> צריך להכיל מחרוזת JSON עם המבנה הבא. המערכת תחלץ אוטומטית את הציון (meta.score).
            </p>
            
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto text-left" dir="ltr">
<pre>{`{
  "answers": {
    "q1": "Answer A",
    "q2": true
  },
  "meta": {
    "score": 95,           // חובה: ציון סופי (0-100)
    "timeSpent": 120,      // אופציונלי: זמן בשניות
    "finishedAt": "2023..." 
  }
}`}</pre>
            </div>
          </section>

        </div>
        
        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t flex justify-end">
          <Button onClick={onClose} className="bg-slate-800 text-white hover:bg-slate-700">
            סגור מדריך
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationGuide;