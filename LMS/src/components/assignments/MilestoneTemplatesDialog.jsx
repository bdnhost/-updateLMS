import React, { useState } from 'react';
import { 
    NestedDialog, 
    NestedDialogContent, 
    NestedDialogHeader, 
    NestedDialogTitle, 
    NestedDialogDescription 
} from '@/components/ui/nested-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wand2, BookOpen, Presentation, Code, FileText, Lightbulb, TestTube } from 'lucide-react';

// תבניות מוכנות מראש לאבני דרך
const MILESTONE_TEMPLATES = [
    {
        id: 'research-paper',
        name: 'עבודת מחקר אקדמית',
        icon: BookOpen,
        color: 'text-blue-600',
        description: 'מתאים לעבודות מחקר, סמינריונים ותזות',
        milestones: [
            {
                title: 'הגשת הצעת מחקר',
                description: 'הגדרת שאלת המחקר, מטרות, והשערות. סקירת ספרות ראשונית.',
                percentage: 15,
                dueOffset: 14 // ימים מתאריך ההגשה הסופי
            },
            {
                title: 'סקירת ספרות מלאה',
                description: 'סקירה מקיפה של המחקר הקיים בתחום. לפחות 15 מקורות אקדמיים.',
                percentage: 20,
                dueOffset: 28
            },
            {
                title: 'מתודולוגיה ותכנון המחקר',
                description: 'תיאור מפורט של שיטות המחקר, אוכלוסיית המדגם וכלי המחקר.',
                percentage: 15,
                dueOffset: 42
            },
            {
                title: 'איסוף וניתוח נתונים',
                description: 'ביצוע המחקר, איסוף הנתונים וניתוח ראשוני של התוצאות.',
                percentage: 25,
                dueOffset: 56
            },
            {
                title: 'הגשת טיוטה מלאה',
                description: 'גרסה ראשונה של העבודה כולה, לרבות ממצאים ומסקנות.',
                percentage: 15,
                dueOffset: 7
            },
            {
                title: 'הגשה סופית',
                description: 'עבודה מושלמת לאחר תיקונים, עריכה לשונית ועיצוב מקצועי.',
                percentage: 10,
                dueOffset: 0
            }
        ]
    },
    {
        id: 'software-project',
        name: 'פרוייקט פיתוח תוכנה',
        icon: Code,
        color: 'text-purple-600',
        description: 'מתאים לפרוייקטי תכנות ואפליקציות',
        milestones: [
            {
                title: 'הגדרת דרישות ותכנון',
                description: 'תיאור הפרוייקט, תרשימי זרימה, ו-wireframes ראשוניים.',
                percentage: 15,
                dueOffset: 21
            },
            {
                title: 'Proof of Concept',
                description: 'הדגמת היתכנות טכנית - אב טיפוס פשוט עם פיצ\'רים בסיסיים.',
                percentage: 20,
                dueOffset: 35
            },
            {
                title: 'גרסת אלפא - תכונות ליבה',
                description: 'מימוש הפיצ\'רים העיקריים של האפליקציה. עדיין עם באגים מותר.',
                percentage: 25,
                dueOffset: 49
            },
            {
                title: 'גרסת בטא - בדיקות ושיפורים',
                description: 'אפליקציה פונקציונלית מלאה, בדיקות משתמש וטיפול בבאגים.',
                percentage: 20,
                dueOffset: 14
            },
            {
                title: 'תיעוד ומצגת',
                description: 'מדריך משתמש, תיעוד קוד, ומצגת הדגמה.',
                percentage: 10,
                dueOffset: 7
            },
            {
                title: 'הגשה סופית + הדגמה',
                description: 'קוד סופי, תיעוד מלא, והדגמה חיה.',
                percentage: 10,
                dueOffset: 0
            }
        ]
    },
    {
        id: 'presentation',
        name: 'פרוייקט מצגת והצגה',
        icon: Presentation,
        color: 'text-green-600',
        description: 'מתאים להצגות, פרזנטציות ועבודות חזותיות',
        milestones: [
            {
                title: 'בחירת נושא ומיקוד',
                description: 'הגדרת הנושא, קהל היעד, והמסר המרכזי.',
                percentage: 15,
                dueOffset: 14
            },
            {
                title: 'מחקר ואיסוף חומרים',
                description: 'איסוף תוכן, תמונות, נתונים וציטוטים רלוונטיים.',
                percentage: 20,
                dueOffset: 21
            },
            {
                title: 'מתווה ותסריט',
                description: 'מבנה המצגת, תסריט מילולי, ורעיונות לעיצוב ויזואלי.',
                percentage: 20,
                dueOffset: 28
            },
            {
                title: 'עיצוב המצגת',
                description: 'יצירת המצגת המלאה בעיצוב מושקע וקריאטיבי.',
                percentage: 25,
                dueOffset: 7
            },
            {
                title: 'אימון וחזרות',
                description: 'תרגול ההצגה, כוונון הזמן והשבחת הביטחון.',
                percentage: 10,
                dueOffset: 3
            },
            {
                title: 'הצגה סופית',
                description: 'ביצוע ההצגה בפני הקהל.',
                percentage: 10,
                dueOffset: 0
            }
        ]
    },
    {
        id: 'creative-writing',
        name: 'פרוייקט כתיבה יצירתית',
        icon: FileText,
        color: 'text-pink-600',
        description: 'מתאים לסיפורים, מאמרים ועבודות ספרותיות',
        milestones: [
            {
                title: 'Brainstorming ורעיון מרכזי',
                description: 'הגדרת נושא, דמויות מרכזיות, ומבנה כללי.',
                percentage: 10,
                dueOffset: 14
            },
            {
                title: 'תסריט ומתווה',
                description: 'רשימת פרקים, קווי עלילה ראשיים, ופיתוח דמויות.',
                percentage: 15,
                dueOffset: 21
            },
            {
                title: 'טיוטה ראשונה - פרקים 1-3',
                description: 'כתיבת ההתחלה עם התמקדות בהצגת הדמויות והסביבה.',
                percentage: 20,
                dueOffset: 35
            },
            {
                title: 'המשך כתיבה - אמצע',
                description: 'פיתוח העלילה והסתבכויות, לפחות 50% מהעבודה.',
                percentage: 25,
                dueOffset: 49
            },
            {
                title: 'כתיבה לסיום וקלימקס',
                description: 'השלמת העלילה עד לסיום מספק.',
                percentage: 15,
                dueOffset: 14
            },
            {
                title: 'עריכה וליטוש סופי',
                description: 'תיקוני שפה, עריכת תוכן, ומשוב מקוראים.',
                percentage: 15,
                dueOffset: 0
            }
        ]
    },
    {
        id: 'science-experiment',
        name: 'פרוייקט ניסוי מדעי',
        icon: TestTube,
        color: 'text-amber-600',
        description: 'מתאים לניסויים, מעבדות ופרוייקטים מדעיים',
        milestones: [
            {
                title: 'בחירת נושא והשערה',
                description: 'הגדרת שאלת המחקר, רקע תיאורטי, והצגת ההשערה.',
                percentage: 15,
                dueOffset: 14
            },
            {
                title: 'תכנון הניסוי',
                description: 'הכנת פרוטוקול מפורט, רשימת ציוד, ונהלי בטיחות.',
                percentage: 15,
                dueOffset: 21
            },
            {
                title: 'ביצוע הניסוי - שלב א',
                description: 'ניסוי ראשוני, איסוף נתונים מקדמי ותיעוד.',
                percentage: 20,
                dueOffset: 35
            },
            {
                title: 'ביצוע הניסוי - שלב ב',
                description: 'חזרות נוספות, איסוף נתונים מקיף, ובדיקות נוספות.',
                percentage: 20,
                dueOffset: 49
            },
            {
                title: 'ניתוח נתונים ומסקנות',
                description: 'עיבוד הנתונים, גרפים, ומסקנות ביחס להשערה.',
                percentage: 20,
                dueOffset: 7
            },
            {
                title: 'הגשת דוח סופי',
                description: 'כתיבת דוח מלא כולל הקדמה, שיטות, תוצאות ודיון.',
                percentage: 10,
                dueOffset: 0
            }
        ]
    },
    {
        id: 'business-plan',
        name: 'תכנית עסקית',
        icon: Lightbulb,
        color: 'text-indigo-600',
        description: 'מתאים לפרוייקטי יזמות וניהול',
        milestones: [
            {
                title: 'תיאור הרעיון וחזון',
                description: 'הצגת הרעיון העסקי, הבעיה הנפתרת, והשוק הפוטנציאלי.',
                percentage: 15,
                dueOffset: 14
            },
            {
                title: 'ניתוח שוק ותחרות',
                description: 'מחקר שוק, פילוח קהל יעד, וניתוח מתחרים.',
                percentage: 20,
                dueOffset: 28
            },
            {
                title: 'מודל עסקי ותוכנית שיווק',
                description: 'הגדרת מקורות הכנסה, תמחור, ואסטרטגיית שיווק.',
                percentage: 25,
                dueOffset: 42
            },
            {
                title: 'תוכנית תפעולית',
                description: 'תיאור משאבים, ציוד, ספקים, ותהליכי ייצור/שירות.',
                percentage: 15,
                dueOffset: 56
            },
            {
                title: 'תחזית כספית',
                description: 'תקציב התחלתי, תזרים מזומנים חזוי, ורווחיות צפויה.',
                percentage: 15,
                dueOffset: 7
            },
            {
                title: 'הגשת תכנית סופית + פיץ\'',
                description: 'מסמך מלא ומצגת השקעה לבעלי עניין.',
                percentage: 10,
                dueOffset: 0
            }
        ]
    }
];

export default function MilestoneTemplatesDialog({ open, onClose, onApply, finalDueDate }) {
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const handleApply = () => {
        if (!selectedTemplate) return;
        
        const template = MILESTONE_TEMPLATES.find(t => t.id === selectedTemplate);
        if (!template) return;

        // חישוב תאריכי יעד על בסיס תאריך ההגשה הסופי
        const finalDate = finalDueDate ? new Date(finalDueDate) : new Date();
        const milestones = template.milestones.map((m, idx) => {
            const dueDate = new Date(finalDate);
            dueDate.setDate(dueDate.getDate() - m.dueOffset);
            
            return {
                id: crypto.randomUUID(),
                title: m.title,
                description: m.description,
                percentage: m.percentage,
                dueDate: dueDate.toISOString().split('T')[0]
            };
        });

        onApply(milestones);
        onClose();
    };

    return (
        <NestedDialog open={open} onOpenChange={onClose}>
            <NestedDialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" dir="rtl">
                <NestedDialogHeader>
                    <NestedDialogTitle className="flex items-center gap-2 text-2xl">
                        <Wand2 className="w-6 h-6 text-violet-600" />
                        תבניות אבני דרך מוכנות
                    </NestedDialogTitle>
                    <NestedDialogDescription>
                        בחר תבנית מוכנה למבנה אבני הדרך של הפרוייקט. התאריכים יחושבו אוטומטית על בסיס תאריך ההגשה הסופי.
                    </NestedDialogDescription>
                </NestedDialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {MILESTONE_TEMPLATES.map((template) => {
                        const Icon = template.icon;
                        const isSelected = selectedTemplate === template.id;
                        
                        return (
                            <Card 
                                key={template.id}
                                className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                                    isSelected 
                                        ? 'border-violet-500 bg-violet-50' 
                                        : 'border-slate-200 hover:border-violet-300'
                                }`}
                                onClick={() => setSelectedTemplate(template.id)}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <Icon className={`w-6 h-6 ${template.color}`} />
                                        <span className="text-lg">{template.name}</span>
                                        {isSelected && (
                                            <Badge className="mr-auto bg-violet-600">נבחר</Badge>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-slate-600">{template.description}</p>
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-slate-500">
                                            {template.milestones.length} שלבים:
                                        </p>
                                        <ul className="text-xs text-slate-500 space-y-0.5 pr-4">
                                            {template.milestones.slice(0, 3).map((m, idx) => (
                                                <li key={idx} className="list-disc">
                                                    {m.title} ({m.percentage}%)
                                                </li>
                                            ))}
                                            {template.milestones.length > 3 && (
                                                <li className="text-violet-600 font-medium">
                                                    + {template.milestones.length - 3} שלבים נוספים
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        ביטול
                    </Button>
                    <Button 
                        onClick={handleApply}
                        disabled={!selectedTemplate}
                        className="bg-violet-600 hover:bg-violet-700"
                    >
                        <Wand2 className="w-4 h-4 ml-2" />
                        החל תבנית
                    </Button>
                </div>
            </NestedDialogContent>
        </NestedDialog>
    );
}