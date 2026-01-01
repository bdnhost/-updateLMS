import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2, AlertCircle, BookOpen, ExternalLink, Home } from 'lucide-react';
import { toast } from 'sonner';
import GuideFieldRenderer from './GuideFieldRenderer';

/**
 * DynamicGuideForm - טופס דינמי שמקבל הגדרת מדריך ומרנדר אותו
 * 
 * @param {Object} guideConfig - הגדרת המדריך (ראה GUIDE_SCHEMA.md)
 * @param {string} studentId - מזהה התלמיד (אופציונלי, אם לא מועבר יתבקש מהמשתמש)
 */
export default function DynamicGuideForm({ guideConfig, studentId: propStudentId }) {
    const [studentId, setStudentId] = useState(propStudentId || '');
    const [formData, setFormData] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [links, setLinks] = useState(null);

    useEffect(() => {
        // Initialize form data with default values
        const initialData = {};
        guideConfig.fields?.forEach(field => {
            if (field.defaultValue !== undefined) {
                initialData[field.name] = field.defaultValue;
            }
        });
        setFormData(initialData);

        // Check URL for student_id
        const params = new URLSearchParams(window.location.search);
        const urlStudentId = params.get('student_id');
        if (urlStudentId) {
            setStudentId(urlStudentId);
        }
    }, [guideConfig]);

    const handleFieldChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const validateForm = () => {
        for (const field of guideConfig.fields || []) {
            if (field.required && !formData[field.name]) {
                toast.error(`יש למלא את השדה: ${field.label}`);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!studentId) {
            toast.error('נא להזין מזהה תלמיד');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        try {
            const response = await base44.functions.invoke('submitGuideForm', {
                student_id: studentId,
                guide_name: guideConfig.title,
                guide_chapter: guideConfig.chapter,
                guide_section: guideConfig.section,
                guide_task: guideConfig.task,
                form_data: formData
            });

            if (response.data.success) {
                setSubmitted(true);
                setLinks(response.data.links);
                toast.success(response.data.message);
            } else {
                toast.error(response.data.error || 'שגיאה בשליחת הטופס');
            }
        } catch (error) {
            console.error(error);
            toast.error('אירעה שגיאה בשליחת הטופס');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4" dir="rtl">
                <Card className="max-w-lg w-full shadow-2xl border-0">
                    <CardContent className="p-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                הטופס נשלח בהצלחה!
                            </h2>
                            <p className="text-slate-600">
                                תודה על מילוי המדריך. המורה שלך יוכל לצפות בתשובות שלך.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            {links?.student_portal && (
                                <Button 
                                    asChild
                                    size="lg"
                                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                                >
                                    <a href={links.student_portal}>
                                        <Home className="h-5 w-5 ml-2" />
                                        חזרה לפורטל התלמידים
                                    </a>
                                </Button>
                            )}
                            {links?.main_site && (
                                <Button 
                                    asChild
                                    variant="outline"
                                    size="lg"
                                >
                                    <a href={links.main_site}>
                                        <ExternalLink className="h-5 w-5 ml-2" />
                                        חזרה ל-EduManage
                                    </a>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 py-12 px-4" dir="rtl">
            <div className="max-w-3xl mx-auto space-y-6">
                
                <Card className="shadow-xl border-0">
                    <CardHeader className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <BookOpen className="h-8 w-8" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">{guideConfig.title}</CardTitle>
                                {(guideConfig.chapter || guideConfig.section || guideConfig.task) && (
                                    <p className="text-violet-100 text-sm mt-1">
                                        {[guideConfig.chapter, guideConfig.section, guideConfig.task]
                                            .filter(Boolean)
                                            .join(' > ')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        {guideConfig.introduction && (
                            <div className="mb-8 p-6 bg-indigo-50 rounded-xl border-2 border-indigo-100">
                                <h3 className="font-bold text-indigo-900 mb-3 text-lg">
                                    {guideConfig.introTitle || '🎯 מטרת המדריך'}
                                </h3>
                                <p className="text-indigo-800 leading-relaxed whitespace-pre-wrap">
                                    {guideConfig.introduction}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {!propStudentId && (
                                <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-amber-900 mb-2">מזהה תלמיד נדרש</p>
                                            <input
                                                type="text"
                                                value={studentId}
                                                onChange={(e) => setStudentId(e.target.value)}
                                                placeholder="הכנס מזהה תלמיד"
                                                className="w-full p-2 border rounded"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                {guideConfig.fields?.map((field, idx) => (
                                    <GuideFieldRenderer
                                        key={field.name || idx}
                                        field={field}
                                        value={formData[field.name]}
                                        onChange={handleFieldChange}
                                    />
                                ))}
                            </div>

                            <Button 
                                type="submit" 
                                size="lg" 
                                disabled={submitting}
                                className="w-full h-14 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                                        שולח...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="ml-2 h-5 w-5" />
                                        שלח טופס
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="text-center text-sm text-slate-500">
                    התשובות שלך נשמרות באופן מאובטח ויהיו זמינות למורה שלך לצורך מעקב והתאמה אישית
                </div>
            </div>
        </div>
    );
}