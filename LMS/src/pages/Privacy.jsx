import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Privacy() {
    return (
        <div className="min-h-screen bg-slate-50" dir="rtl">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to={createPageUrl('Home')}>
                        <Button variant="ghost" className="gap-2">
                            <ArrowRight className="w-4 h-4" />
                            חזרה לדף הבית
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                        <ShieldCheck className="w-5 h-5 text-violet-600" />
                        מדיניות פרטיות - EduManage
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 space-y-8 text-slate-700 leading-relaxed">
                    <h1 className="text-3xl font-bold text-slate-900">מדיניות פרטיות</h1>
                    <p className="text-sm text-slate-500">עודכן לאחרונה: {new Date().toLocaleDateString('he-IL')}</p>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">1. איסוף מידע</h2>
                        <p>
                            אנו אוספים מידע הנחוץ לתפעול המערכת, כגון שמות, כתובות דוא"ל, מספרי טלפון ונתוני נוכחות/ציונים של תלמידים.
                            מידע זה נשמר בצורה מאובטחת.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">2. שימוש במידע</h2>
                        <p>
                            המידע משמש אך ורק למטרת ניהול הלימודים, שליחת התראות (SMS/WhatsApp) והפקת דוחות.
                            איננו מוכרים או מעבירים מידע לצד שלישי למטרות שיווקיות.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">3. אבטחת מידע</h2>
                        <p>
                            אנו נוקטים באמצעי אבטחה מתקדמים כדי להגן על המידע שלך. עם זאת, אין מערכת חסינה לחלוטין.
                            מומלץ להשתמש בסיסמאות חזקות ולהחליפן מעת לעת.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">4. כלי AI וצד שלישי</h2>
                        <p>
                            בעת שימוש בכלי AI במערכת, חלק מהטקסטים עשויים להישלח לעיבוד חיצוני (למשל OpenAI).
                            מידע אישי רגיש (PII) מסונן ככל הניתן לפני השליחה.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}