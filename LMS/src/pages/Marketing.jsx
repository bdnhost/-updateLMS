import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, GraduationCap, Users, FileText, ClipboardList, MessageSquare, 
  FolderOpen, Calendar, BarChart3, Zap, Trophy, Video, Mic, Image, 
  Puzzle, Globe, Lock, QrCode, BookOpen, Send, Brain, Wand2, Clock,
  CheckCircle2, Megaphone, Target, TrendingUp, Link2, Code2, PenTool,
  Lightbulb, ExternalLink, PlayCircle, Award, Smartphone
} from 'lucide-react';

export default function MarketingPage() {
  useEffect(() => {
    document.title = "EduManage - מערכת ניהול קורסים חכמה עם AI";

    const setMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const setOg = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    setMeta('description', 'מערכת ניהול קורסים מתקדמת עם AI, תקשורת WhatsApp/SMS, מטלות אינטראקטיביות ופורטל ציבורי. ניהול תלמידים, נוכחות, ציונים ודוחות חכמים - הכל במקום אחד.');
    setOg('og:title', 'EduManage - מערכת ניהול קורסים חכמה עם AI');
    setOg('og:description', 'פלטפורמה All-in-One לניהול קורסים, תלמידים ומטלות עם כוח AI מובנה.');
    setOg('og:type', 'website');
    setOg('og:url', window.location.href);
  }, []);

  const capabilities = [
    { icon: GraduationCap, label: "קורסים", desc: "ניהול ללא הגבלה", color: "violet" },
    { icon: Users, label: "תלמידים", desc: "פרופילים מלאים", color: "blue" },
    { icon: FileText, label: "מטלות", desc: "4 סוגים", color: "indigo" },
    { icon: ClipboardList, label: "נוכחות", desc: "QR + ידני", color: "emerald" },
    { icon: MessageSquare, label: "הודעות", desc: "SMS + WhatsApp", color: "pink" },
    { icon: Calendar, label: "יומן", desc: "סנכרון אוטומטי", color: "amber" },
    { icon: FolderOpen, label: "חומרים", desc: "מדיה + מצגות", color: "orange" },
    { icon: BarChart3, label: "תובנות", desc: "דוחות חכמים", color: "cyan" },
    { icon: Brain, label: "AI", desc: "יצירה + ניתוח", color: "purple" },
    { icon: Globe, label: "ציבורי", desc: "פורטל תלמידים", color: "teal" },
    { icon: Zap, label: "אוטומציות", desc: "תזכורות + דריפ", color: "yellow" },
    { icon: Lock, label: "אבטחה", desc: "RLS + הרשאות", color: "red" }
  ];

  const aiFeatures = [
    { icon: Mic, text: "יצירת הנחיות קוליות (ElevenLabs)" },
    { icon: Image, text: "ייצור תמונות ואינפוגרפיקות" },
    { icon: Wand2, text: "שיפור תוכן ופרומפטים" },
    { icon: Brain, text: "ניתוח והמלצות חכמות" },
    { icon: PenTool, text: "יצירת מטלות אוטומטית" },
    { icon: Target, text: "מוטיבטור AI לתלמידים" }
  ];

  const assignmentTypes = [
    { icon: FileText, type: "assignment", name: "מטלה רגילה", desc: "הגשת טקסט + קבצים" },
    { icon: Trophy, type: "quiz", name: "בוחן", desc: "שאלות רב ברירה + פתוחות" },
    { icon: Award, type: "exam", name: "מבחן", desc: "מבנה מלא + ציון אוטומטי" },
    { icon: Puzzle, type: "project", name: "פרויקט", desc: "אבני דרך + מעקב התקדמות" }
  ];

  const integrations = [
    { name: "WhatsApp", icon: MessageSquare, desc: "תקשורת + קבוצות" },
    { name: "Zoom", icon: Video, desc: "סנכרון + נוכחות" },
    { name: "ElevenLabs", icon: Mic, desc: "שיבוט קול AI" },
    { name: "SMS", icon: Smartphone, desc: "התראות + תזכורות" },
    { name: "PayPal", icon: Trophy, desc: "מנויים + תשלומים" },
    { name: "External APIs", icon: Code2, desc: "Webhooks + קישוריות" }
  ];

  const colors = {
    violet: "from-violet-500 to-purple-600",
    blue: "from-blue-500 to-cyan-600",
    indigo: "from-indigo-500 to-blue-600",
    emerald: "from-emerald-500 to-teal-600",
    pink: "from-pink-500 to-rose-600",
    amber: "from-amber-500 to-orange-600",
    orange: "from-orange-500 to-red-500",
    cyan: "from-cyan-500 to-blue-500",
    purple: "from-purple-500 to-indigo-600",
    teal: "from-teal-500 to-cyan-600",
    yellow: "from-yellow-400 to-amber-500",
    red: "from-red-500 to-pink-600"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20" dir="rtl">
      <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-16">
        
        {/* Hero */}
        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2 rounded-full shadow-lg">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="font-bold text-lg">EduManage Platform</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight">
            מערכת הניהול<br />
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
              שמשנה את המשחק
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            פלטפורמה All-in-One לניהול קורסים, תלמידים, מטלות ותקשורת. 
            מונעת AI, מתוחכמת, אבל פשוטה לשימוש.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {capabilities.map((cap, i) => (
            <div
              key={i}
              className="group relative bg-white rounded-2xl p-6 border-2 border-slate-100 hover:border-violet-300 transition-all hover:scale-105 hover:shadow-lg flex flex-col items-center text-center"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${colors[cap.color]} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colors[cap.color]} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                <cap.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1">{cap.label}</h3>
              <p className="text-sm text-slate-500">{cap.desc}</p>
            </div>
          ))}
        </div>

        {/* AI Superpowers */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="absolute top-0 end-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -me-48 -mt-48" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white">כוח ה-AI שלנו</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiFeatures.map((feat, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all">
                  <feat.icon className="w-6 h-6 text-white shrink-0" />
                  <span className="text-white font-medium text-sm">{feat.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assignment Types */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
              4 סוגי מטלות. <span className="text-violet-600">חוויה אחת.</span>
            </h2>
            <p className="text-slate-600">מבחנים דיגיטליים, פרויקטים מורכבים, בוחנים מהירים - הכל במקום אחד</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {assignmentTypes.map((at, i) => (
              <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden group">
                <div className={`h-1.5 bg-gradient-to-r ${
                  at.type === 'exam' ? 'from-red-500 to-pink-600' :
                  at.type === 'quiz' ? 'from-purple-500 to-indigo-600' :
                  at.type === 'project' ? 'from-emerald-500 to-teal-600' :
                  'from-blue-500 to-cyan-600'
                }`} />
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                    at.type === 'exam' ? 'from-red-100 to-pink-100 text-red-600' :
                    at.type === 'quiz' ? 'from-purple-100 to-indigo-100 text-purple-600' :
                    at.type === 'project' ? 'from-emerald-100 to-teal-100 text-emerald-600' :
                    'from-blue-100 to-cyan-100 text-blue-600'
                  } flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                    <at.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">{at.name}</h3>
                  <p className="text-xs text-slate-500">{at.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 text-center">
            <span className="text-indigo-600">מחוברים</span> לעולם
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {integrations.map((int, i) => (
              <div key={i} className="text-center space-y-2 p-4 rounded-xl hover:bg-slate-50 transition-all group">
                <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all">
                  <int.icon className="w-7 h-7 text-slate-700" />
                </div>
                <p className="font-bold text-slate-800 text-sm">{int.name}</p>
                <p className="text-xs text-slate-500">{int.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-50 to-rose-50 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-pink-500 rounded-xl shadow-md">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">פורטל ציבורי</h3>
              </div>
              <ul className="space-y-3 text-slate-700">
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" /> כניסה ללא סיסמה</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" /> דפים מותאמים לנייד</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" /> כרטיסיות ידע אינטראקטיביות</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" /> מעקב פעילות בזמן אמת</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" /> הגשות + העלאת קבצים</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-500 rounded-xl shadow-md">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">תוכן חכם</h3>
              </div>
              <ul className="space-y-3 text-slate-700">
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> מצגות דיגיטליות (JSON)</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> מונחונים + לקסיקונים</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> ייבוא מקבצים (AI parsing)</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> רובריקות הערכה</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> קישור למערכות חיצוניות</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Unique Features Strip */}
        <div className="bg-slate-900 rounded-3xl p-8 md:p-10 shadow-2xl text-white">
          <h2 className="text-2xl md:text-3xl font-black mb-8 text-center">✨ ייחודי ל-EduManage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-violet-400">
                <QrCode className="w-5 h-5" />
                <span className="font-bold">נוכחות QR</span>
              </div>
              <p className="text-sm text-slate-300">תלמידים מאשרים בסריקה. ללא בזבוז זמן.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Puzzle className="w-5 h-5" />
                <span className="font-bold">Milestone Compass</span>
              </div>
              <p className="text-sm text-slate-300">מעקב ויזואלי אחר התקדמות בפרויקטים.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-pink-400">
                <Code2 className="w-5 h-5" />
                <span className="font-bold">Bridge API</span>
              </div>
              <p className="text-sm text-slate-300">חיבור למערכות חיצוניות (Moodle, Canvas...).</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400">
                <Wand2 className="w-5 h-5" />
                <span className="font-bold">שיבוט קול</span>
              </div>
              <p className="text-sm text-slate-300">קול המורה מלווה כל חומר ומטלה.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-cyan-400">
                <Target className="w-5 h-5" />
                <span className="font-bold">מוטיבטור AI</span>
              </div>
              <p className="text-sm text-slate-300">עידוד והמלצות אישיות לכל תלמיד.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-orange-400">
                <TrendingUp className="w-5 h-5" />
                <span className="font-bold">תובנות חכמות</span>
              </div>
              <p className="text-sm text-slate-300">ניתוח מעורבות והתקדמות בזמן אמת.</p>
            </div>
          </div>
        </div>

        {/* Core Modules */}
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center mb-10">
            המודולים המרכזיים
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/50">
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">LMS מלא</h3>
                    <p className="text-sm text-slate-600">Learning Management System</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2"><Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> סילבוס דינמי + ניהול מפגשים</li>
                  <li className="flex gap-2"><Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> מטלות אינטראקטיביות (4 סוגים)</li>
                  <li className="flex gap-2"><Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> ציון אוטומטי + רובריקות</li>
                  <li className="flex gap-2"><Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> ספריית חומרים + מצגות AI</li>
                  <li className="flex gap-2"><Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> מדריכים HTML חיצוניים</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-pink-50/50">
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg">
                    <Megaphone className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">תקשורת 360</h3>
                    <p className="text-sm text-slate-600">Multi-Channel Engagement</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2"><Zap className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" /> WhatsApp Business + קבוצות</li>
                  <li className="flex gap-2"><Zap className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" /> SMS Campaigns + דריפ אוטומטי</li>
                  <li className="flex gap-2"><Zap className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" /> הודעות פנימיות + מיילים</li>
                  <li className="flex gap-2"><Zap className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" /> תבניות + משתנים דינמיים</li>
                  <li className="flex gap-2"><Zap className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" /> התראות חכמות (נוכחות, ציונים)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-violet-50/50">
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">ניתוח נתונים</h3>
                    <p className="text-sm text-slate-600">Data-Driven Insights</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2"><Zap className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" /> דשבורדים חכמים בזמן אמת</li>
                  <li className="flex gap-2"><Zap className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" /> מעקב מעורבות (Public Activity Logs)</li>
                  <li className="flex gap-2"><Zap className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" /> ניתוח מיומנויות (Competencies)</li>
                  <li className="flex gap-2"><Zap className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" /> זיהוי תלמידים בסיכון</li>
                  <li className="flex gap-2"><Zap className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" /> דוחות מותאמים אישית</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-emerald-50/50">
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                    <Lock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">ניהול מתקדם</h3>
                    <p className="text-sm text-slate-600">Enterprise Grade</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2"><Zap className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Multi-tenant (ארגונים מרובים)</li>
                  <li className="flex gap-2"><Zap className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> RLS + הרשאות מתקדמות</li>
                  <li className="flex gap-2"><Zap className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> ביקורת מלאה (Audit Logs)</li>
                  <li className="flex gap-2"><Zap className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> מנויים + תשלומים (PayPal)</li>
                  <li className="flex gap-2"><Zap className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> API מלא לאינטגרציות</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-3xl p-12 shadow-2xl">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            מוכנים להתחיל?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            הצטרפו לעשרות מוסדות ומרצים שכבר משתמשים ב-EduManage לניהול הקורסים שלהם
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/20 backdrop-blur-md rounded-xl px-6 py-3 border border-white/30">
              <p className="text-3xl font-black text-white">2,500+</p>
              <p className="text-xs text-white/80">תלמידים פעילים</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl px-6 py-3 border border-white/30">
              <p className="text-3xl font-black text-white">150+</p>
              <p className="text-xs text-white/80">קורסים</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl px-6 py-3 border border-white/30">
              <p className="text-3xl font-black text-white">5,000+</p>
              <p className="text-xs text-white/80">מטלות הוגשו</p>
            </div>
          </div>
        </div>

        {/* Enhanced CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-12 shadow-2xl">
          <a
            href="https://edu-manage.org/"
            className="inline-flex items-center gap-3 bg-white text-violet-700 hover:bg-white/90 text-xl font-bold px-10 py-5 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-white/40"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>התחילו עכשיו בחינם</span>
            <ExternalLink className="w-6 h-6" />
          </a>
          <p className="text-white/70 text-sm mt-6">
            ללא כרטיס אשראי • התנסות מלאה
          </p>
        </div>

        {/* Footer Tagline */}
        <div className="text-center space-y-3 py-8">
          <p className="text-2xl font-black text-slate-800">
            🚀 EduManage — <span className="text-violet-600">חינוך בעידן הדיגיטלי</span>
          </p>
          <p className="text-sm text-slate-500">מערכת ניהול חכמה, גמישה ומונעת AI</p>
        </div>

      </div>
    </div>
  );
}