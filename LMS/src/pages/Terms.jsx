import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ScrollText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Terms() {
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
                        <ScrollText className="w-5 h-5 text-violet-600" />
                        תנאי שימוש - EduManage
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 space-y-8 text-slate-700 leading-relaxed">
                    <h1 className="text-3xl font-bold text-slate-900">תנאי שימוש</h1>
                    <p className="text-sm text-slate-500">עודכן לאחרונה: {new Date().toLocaleDateString('he-IL')}</p>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">1. כללי</h2>
                        <p>
                            ברוכים הבאים למערכת EduManage. השימוש במערכת מעיד על הסכמתך לתנאים אלה.
                            המערכת מספקת כלי ניהול למידה, מעקב נוכחות ותקשורת עבור מוסדות לימוד.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">2. חשבון משתמש</h2>
                        <p>
                            באחריותך לשמור על סודיות פרטי הכניסה שלך. כל פעולה שתתבצע בחשבונך הינה באחריותך הבלעדית.
                            השימוש במערכת מיועד למטרות חינוכיות וניהוליות בלבד.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">3. שימוש בפיצ'רים ובחבילות</h2>
                        <p>
                            חלק מהשירותים (כגון כלי AI, אינטגרציית WhatsApp) זמינים רק בחבילות מסוימות.
                            הנהלת המערכת שומרת לעצמה את הזכות לעדכן את תכולת החבילות מעת לעת.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">4. הגבלת אחריות</h2>
                        <p>
                            המערכת מסופקת כפי שהיא (AS IS). לא נשא באחריות לכל נזק עקיף או ישיר שיגרם כתוצאה משימוש במערכת,
                            כולל אובדן נתונים או הפסקת שירות.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}