import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { 
    MessageSquare, 
    Zap, 
    UserPlus, 
    Calendar, 
    AlertTriangle, 
    CheckCircle2, 
    PenTool, 
    Clock,
    ArrowLeft,
    GraduationCap,
    BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

export default function CommunicationStrategy({ course }) {
    const queryClient = useQueryClient();
    const [editingTemplate, setEditingTemplate] = useState(null);

    // Fetch Templates
    const { data: templates } = useQuery({
        queryKey: ['notificationTemplates'],
        queryFn: () => base44.entities.NotificationTemplate.list()
    });

    // Fetch Messages stats
    const { data: messages } = useQuery({
        queryKey: ['courseMessages', course.id],
        queryFn: () => base44.entities.Message.filter({ course_id: course.id })
    });

    const createTemplateMutation = useMutation({
        mutationFn: (data) => base44.entities.NotificationTemplate.create({
            ...data,
            organization_id: course.organization_id
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['notificationTemplates']);
            setEditingTemplate(null);
            toast.success('תבנית נוצרה בהצלחה');
        }
    });

    const updateTemplateMutation = useMutation({
        mutationFn: (data) => base44.entities.NotificationTemplate.update(data.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['notificationTemplates']);
            setEditingTemplate(null);
            toast.success('תבנית עודכנה בהצלחה');
        }
    });

    const handleSaveTemplate = (formData) => {
        if (formData.id) {
            updateTemplateMutation.mutate(formData);
        } else {
            createTemplateMutation.mutate(formData);
        }
    };

    // Calculate Stats
    const getStatsForTrigger = (triggerType) => {
        if (!messages) return { count: 0, lastSent: null };
        const relevant = messages.filter(m => {
            // Find if this message was generated from a template of this trigger type
            // This is a bit loose without a direct link to trigger_type on Message, 
            // but we can infer or if we linked template_id
            const template = templates?.find(t => t.id === m.template_id);
            return template?.trigger_type === triggerType;
        });

        return {
            count: relevant.length,
            lastSent: relevant.length > 0 ? new Date(Math.max(...relevant.map(m => new Date(m.created_date)))) : null
        };
    };

    // Strategy Steps Definition
    const strategySteps = [
        {
            id: 'onboarding',
            title: 'קליטה ופתיחה',
            icon: UserPlus,
            color: 'bg-emerald-100 text-emerald-700',
            description: 'הרושם הראשוני וקבלת הפנים לתלמיד',
            items: [
                {
                    trigger: 'course_welcome',
                    label: 'הודעת ברוכים הבאים',
                    desc: 'נשלחת אוטומטית בעת רישום עצמי לקורס',
                    defaultContent: 'היי {{student_name}}, ברוכים הבאים לקורס {{course_name}}! אנחנו מתחילים ב-{{start_date}}. נתראה!',
                    isAutomated: true
                }
            ]
        },
        {
            id: 'routine',
            title: 'שגרת למידה',
            icon: Calendar,
            color: 'bg-blue-100 text-blue-700',
            description: 'ליווי שוטף לפני ואחרי מפגשים',
            items: [
                {
                    trigger: 'pre_session',
                    label: 'תזכורת לפני מפגש',
                    desc: 'מומלץ לשלוח 24 שעות לפני כל מפגש',
                    defaultContent: 'היי {{student_name}}, תזכורת: מחר ניפגש לשיעור בקורס {{course_name}}. נא לא לשכוח להכין את המטלה.',
                    isAutomated: false
                },
                {
                    trigger: 'post_session',
                    label: 'סיכום ומשימות',
                    desc: 'נשלח לאחר סיום המפגש עם חומרי לימוד',
                    defaultContent: 'היי {{student_name}}, היה כיף לראות אותך היום! סיכום השיעור והמצגת זמינים כעת במערכת.',
                    isAutomated: false
                }
            ]
        },
        {
            id: 'retention',
            title: 'שימור ומעקב',
            icon: AlertTriangle,
            color: 'bg-orange-100 text-orange-700',
            description: 'זיהוי וטיפול במקרים חריגים',
            items: [
                {
                    trigger: 'attendance_alert',
                    label: 'התראה על חיסור',
                    desc: 'נשלחת כאשר תלמיד מחסיר שיעור',
                    defaultContent: 'היי {{student_name}}, חסרת לנו היום בשיעור. חשוב להשלים את החומר באתר הקורס.',
                    isAutomated: false
                },
                {
                    trigger: 'inactivity_warning',
                    label: 'חוסר פעילות',
                    desc: 'עידוד תלמידים שלא הגישו מטלות',
                    defaultContent: 'היי {{student_name}}, שמנו לב שלא הגשת את המטלות האחרונות. אנחנו כאן לעזור!',
                    isAutomated: false
                }
            ]
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Zap className="h-6 w-6 text-yellow-300" />
                            אסטרטגיית תקשורת פדגוגית
                        </h2>
                        <p className="text-violet-100 mt-2 max-w-2xl">
                            ניהול חכם של המסע התקשורתי עם התלמיד. כאן ניתן להגדיר מה התלמיד יקבל בכל שלב של הקורס,
                            מייצר וודאות, מגביר מעורבות ומונע נשירה.
                        </p>
                    </div>
                    <div className="hidden md:block bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                        <div className="text-center">
                            <p className="text-3xl font-bold">{messages?.length || 0}</p>
                            <p className="text-xs text-violet-200">הודעות שנשלחו</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategy Timeline */}
            <div className="relative space-y-8 before:absolute before:inset-0 before:mr-6 before:ml-auto before:h-full before:w-0.5 before:bg-slate-200 before:content-['']">
                {strategySteps.map((step, stepIdx) => (
                    <div key={step.id} className="relative pr-16">
                        {/* Step Marker */}
                        <span className={`absolute -right-3 top-0 flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-white ${step.color}`}>
                            <step.icon className="h-5 w-5" />
                        </span>

                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-800">{step.title}</h3>
                            <p className="text-sm text-slate-500">{step.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {step.items.map((item) => {
                                const activeTemplate = templates?.find(t => t.trigger_type === item.trigger);
                                const stats = getStatsForTrigger(item.trigger);
                                
                                return (
                                    <Card key={item.trigger} className={`border-l-4 ${activeTemplate ? 'border-l-emerald-500' : 'border-l-slate-300'} hover:shadow-md transition-shadow`}>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-base flex items-center gap-2">
                                                        {item.label}
                                                        {item.isAutomated && (
                                                            <Badge variant="secondary" className="text-[10px] bg-sky-100 text-sky-700">
                                                                <Zap className="w-3 h-3 mr-1" /> אוטומטי
                                                            </Badge>
                                                        )}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs mt-1">
                                                        {item.desc}
                                                    </CardDescription>
                                                </div>
                                                <Switch 
                                                    checked={!!activeTemplate?.is_active}
                                                    onCheckedChange={(checked) => {
                                                        if (activeTemplate) {
                                                            handleSaveTemplate({ ...activeTemplate, is_active: checked });
                                                        } else if (checked) {
                                                            // Create new default if turning on for first time
                                                            setEditingTemplate({
                                                                name: item.label,
                                                                trigger_type: item.trigger,
                                                                content_template: item.defaultContent,
                                                                is_active: true
                                                            });
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="bg-slate-50 p-3 rounded-md mb-4 text-sm text-slate-600 min-h-[60px] relative group">
                                                {activeTemplate ? activeTemplate.content_template : (
                                                    <span className="text-slate-400 italic">לא הוגדרה תבנית (ייעשה שימוש בברירת מחדל בעת יצירה)</span>
                                                )}
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    className="absolute top-1 left-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm"
                                                    onClick={() => setEditingTemplate(activeTemplate || {
                                                        name: item.label,
                                                        trigger_type: item.trigger,
                                                        content_template: item.defaultContent,
                                                        is_active: true
                                                    })}
                                                >
                                                    <PenTool className="h-3 w-3" />
                                                </Button>
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-slate-400 border-t pt-2">
                                                <div className="flex items-center gap-1">
                                                    <BarChart3 className="w-3 h-3" />
                                                    נשלח {stats.count} פעמים
                                                </div>
                                                {stats.lastSent && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        לאחרונה: {stats.lastSent.toLocaleDateString('he-IL')}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Template Editor Dialog */}
            <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>עריכת תבנית הודעה</DialogTitle>
                        <DialogDescription>
                            הגדר את תוכן ההודעה שיישלח לתלמידים. השתמש ב-Tags למידע דינמי.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {editingTemplate && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">תוכן ההודעה</label>
                                <Textarea 
                                    value={editingTemplate.content_template}
                                    onChange={(e) => setEditingTemplate({...editingTemplate, content_template: e.target.value})}
                                    rows={5}
                                    dir="rtl"
                                />
                                <div className="flex gap-2 text-xs text-slate-500 flex-wrap">
                                    <span className="bg-slate-100 px-1 rounded cursor-help" title="שם התלמיד">{`{{student_name}}`}</span>
                                    <span className="bg-slate-100 px-1 rounded cursor-help" title="שם הקורס">{`{{course_name}}`}</span>
                                    <span className="bg-slate-100 px-1 rounded cursor-help" title="תאריך">{`{{start_date}}`}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Switch 
                                    id="is_active"
                                    checked={editingTemplate.is_active}
                                    onCheckedChange={(checked) => setEditingTemplate({...editingTemplate, is_active: checked})}
                                />
                                <label htmlFor="is_active" className="text-sm">תבנית פעילה</label>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingTemplate(null)}>ביטול</Button>
                        <Button onClick={() => handleSaveTemplate(editingTemplate)}>שמור שינויים</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}