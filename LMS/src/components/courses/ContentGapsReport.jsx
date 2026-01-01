import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, AlertTriangle, CheckCircle2, XCircle, FileWarning, Wand2, AlertCircle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ContentGapsReport({ course, sessions, assignments, trigger }) {
    const [open, setOpen] = useState(false);
    const [fixResults, setFixResults] = useState(null);
    const [showLogs, setShowLogs] = useState(false);
    const queryClient = useQueryClient();

    const { data: report, isLoading, refetch } = useQuery({
        queryKey: ['contentGapsReport', course?.id],
        queryFn: async () => {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `אתה מומחה פדגוגי ומעריך איכות תכנים לימודיים. נתח את הנתונים הבאים וזהה חוסרים, בעיות ושיפורים אפשריים.

**חשוב מאוד**: בתיאור כל חוסר, ציין במדויק את המפגש או המטלה הספציפית. השתמש בפורמט "מפגש X" או "מטלה: שם_המטלה".
אם מדובר בחוסר כללי, השתמש בביטוי "מספר מטלות" או "חלק מהמפגשים" והסבר מהו החוסר המדויק.

קורס: ${course.name}
תיאור: ${course.description || 'לא הוזן תיאור'}

מפגשים (${sessions?.length || 0}):
${sessions?.map((s, idx) => `
${idx + 1}. מפגש ${s.session_number}: ${s.title}
   - תיאור: ${s.description || 'חסר'}
   - מטרות: ${s.objectives || 'חסר'}
   - משך: ${s.duration_hours || 'לא צוין'} שעות
   - הנחיה קולית: ${s.audio_url ? 'קיים' : 'חסר'}
   - מדיה ויזואלית: ${s.media_url ? 'קיים' : 'חסר'}
`).join('\n') || 'אין מפגשים מוגדרים'}

מטלות (${assignments?.length || 0}):
${assignments?.map((a, idx) => `
${idx + 1}. ${a.title} (${a.type === 'exam' ? 'מבחן' : a.type === 'quiz' ? 'בוחן' : a.type === 'project' ? 'פרויקט' : 'מטלה'})
   - תיאור: ${a.description || 'חסר'}
   - מושגי מפתח: ${a.key_concepts?.length ? a.key_concepts.map(k => k.term).join(', ') : 'חסר'}
   - משאבים: ${a.resource_links?.length || 0}
   - מטלת סינתזה: ${a.content_data ? 'קיים' : 'חסר'}
   - הנחיה קולית: ${a.audio_url ? 'קיים' : 'חסר'}
   - מדיה ויזואלית: ${a.media_url ? 'קיים' : 'חסר'}
`).join('\n') || 'אין מטלות מוגדרות'}

בצע ניתוח מקיף וספק דוח JSON מובנה. **לכל חוסר ציין מפורשות**:
- עבור מפגשים: "מפגש 3 חסר תיאור" או "מפגשים 1, 3, 5 חסרים הנחיה קולית"
- עבור מטלות: "מטלה: שם_המטלה חסרה מושגי מפתח" או "מספר מטלות חסרות תיאור"
- עבור חוסרים כלליים: "חלק מהמפגשים חסרים מדיה ויזואלית"

הדוח צריך לכלול:
1. gaps - רשימת חוסרים קריטיים (כל פריט: {type, severity, title, description, recommendations})
   - description חייב להכיל את המזהה הספציפי של הפריט (מספר מפגש, שם מטלה, או "מספר מטלות")
2. warnings - רשימת אזהרות ובעיות קלות יותר
3. strengths - נקודות חוזק שזוהו
4. overall_score - ציון כולל 0-100
5. summary - סיכום קצר (2-3 משפטים)

severity יכול להיות: "critical", "high", "medium", "low"
type יכול להיות: "course", "session", "assignment", "structure"`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        gaps: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string" },
                                    severity: { type: "string" },
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    recommendations: { type: "string" }
                                }
                            }
                        },
                        warnings: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" }
                                }
                            }
                        },
                        strengths: {
                            type: "array",
                            items: { type: "string" }
                        },
                        overall_score: { type: "number" },
                        summary: { type: "string" }
                    }
                }
            });
            return response;
        },
        enabled: false
    });

    const handleOpen = () => {
        setOpen(true);
        refetch(); // Always refetch when opening
    };

    const autoFixMutation = useMutation({
        mutationFn: async () => {
            const response = await base44.functions.invoke('autoFixContent', {
                courseId: course.id,
                report
            });
            return response.data;
        },
        onSuccess: (data) => {
            setFixResults(data);
            toast.success('התיקונים הושלמו!', {
                description: `תוקנו ${data.fixed_items?.length || 0} פריטים בהצלחה`
            });
            queryClient.invalidateQueries({ queryKey: ['course', course.id] });
            queryClient.invalidateQueries({ queryKey: ['courseSessions', course.id] });
            queryClient.invalidateQueries({ queryKey: ['courseAssignments', course.id] });
            setTimeout(() => refetch(), 1000);
        },
        onError: (error) => {
            toast.error('שגיאה בתיקון אוטומטי', {
                description: error.message
            });
        }
    });

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical': return <XCircle className="w-4 h-4" />;
            case 'high': return <AlertTriangle className="w-4 h-4" />;
            default: return <FileWarning className="w-4 h-4" />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button onClick={handleOpen} variant="outline" className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50">
                        <FileWarning className="w-4 h-4" />
                        דוח חסרים ושיפורים
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <FileWarning className="w-6 h-6 text-amber-600" />
                        דוח חסרים פדגוגיים - {course?.name}
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="relative">
                            <Loader2 className="w-16 h-16 animate-spin text-violet-600" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-violet-100 animate-pulse"></div>
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-lg font-semibold text-slate-700">מנתח את התכנים באמצעות AI</p>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                                <span>בודק קורסים, מפגשים ומטלות</span>
                            </div>
                            <p className="text-xs text-slate-400">תהליך זה עשוי לקחת 10-30 שניות</p>
                        </div>
                        <div className="w-64 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                ) : report ? (
                    <div className="space-y-6 py-4">
                        {/* Overall Score */}
                        <Card className="border-2">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-slate-800 mb-1">ציון כולל</h3>
                                        <p className="text-sm text-slate-600">{report.summary}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-5xl font-bold ${
                                            report.overall_score >= 80 ? 'text-green-600' :
                                            report.overall_score >= 60 ? 'text-yellow-600' :
                                            'text-red-600'
                                        }`}>
                                            {report.overall_score}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">מתוך 100</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Gaps */}
                        {report.gaps && report.gaps.length > 0 && (
                            <Card className="border-l-4 border-l-red-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-red-800">
                                        <AlertTriangle className="w-5 h-5" />
                                        חוסרים שזוהו ({report.gaps.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {report.gaps.map((gap, idx) => (
                                        <div key={idx} className={`p-4 rounded-lg border-2 ${getSeverityColor(gap.severity)}`}>
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5">
                                                    {getSeverityIcon(gap.severity)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <h4 className="font-bold">{gap.title}</h4>
                                                        <Badge variant="outline" className="shrink-0">
                                                            {gap.type === 'course' ? 'קורס' :
                                                             gap.type === 'session' ? 'מפגש' :
                                                             gap.type === 'assignment' ? 'מטלה' :
                                                             'מבנה'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm mb-2">{gap.description}</p>
                                                    {gap.recommendations && (
                                                        <div className="bg-white/50 p-2 rounded text-xs mt-2 border border-current/10">
                                                            <span className="font-semibold">המלצות: </span>
                                                            {gap.recommendations}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Warnings */}
                        {report.warnings && report.warnings.length > 0 && (
                            <Card className="border-l-4 border-l-yellow-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-yellow-800">
                                        <FileWarning className="w-5 h-5" />
                                        אזהרות ושיפורים ({report.warnings.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {report.warnings.map((warning, idx) => (
                                        <div key={idx} className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                                            <h5 className="font-semibold text-yellow-900 text-sm">{warning.title}</h5>
                                            <p className="text-xs text-yellow-800 mt-1">{warning.description}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Strengths */}
                        {report.strengths && report.strengths.length > 0 && (
                            <Card className="border-l-4 border-l-green-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-800">
                                        <CheckCircle2 className="w-5 h-5" />
                                        נקודות חוזק ({report.strengths.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {report.strengths.map((strength, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                                <span className="text-slate-700">{strength}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Fix Results */}
                        {fixResults && (
                            <Card className="border-l-4 border-l-violet-500 mt-6">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-violet-800">
                                            <Wand2 className="w-5 h-5" />
                                            תוצאות תיקון אוטומטי
                                        </CardTitle>
                                        <div className="flex gap-2">
                                            {fixResults.logs && fixResults.logs.length > 0 && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setShowLogs(!showLogs)}
                                                    className="h-7 text-xs"
                                                >
                                                    <FileText className="w-3 h-3 ml-1" />
                                                    {showLogs ? 'הסתר לוגים' : 'הצג לוגים'}
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setFixResults(null)}
                                                className="h-7 text-xs"
                                            >
                                                סגור תוצאות
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Summary Stats */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                                            <div className="text-3xl font-bold text-emerald-600">{fixResults.summary?.fixed || 0}</div>
                                            <div className="text-sm text-emerald-700 mt-1">תוקנו</div>
                                        </div>
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                            <div className="text-3xl font-bold text-red-600">{fixResults.summary?.failed || 0}</div>
                                            <div className="text-sm text-red-700 mt-1">נכשלו</div>
                                        </div>
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                                            <div className="text-3xl font-bold text-amber-600">{fixResults.summary?.skipped || 0}</div>
                                            <div className="text-sm text-amber-700 mt-1">דולגו</div>
                                        </div>
                                    </div>

                                    {/* Fixed Items */}
                                    {fixResults.fixed_items && fixResults.fixed_items.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-sm text-emerald-700 mb-2 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" />
                                                פריטים שתוקנו ({fixResults.fixed_items.length})
                                            </h4>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {fixResults.fixed_items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                                        <div className="flex-1">
                                                            <span className="font-medium text-emerald-900">{item.item}</span>
                                                            <span className="text-emerald-700"> - {item.fix}</span>
                                                        </div>
                                                        <Badge variant="outline" className="text-[10px] bg-white">
                                                            {item.type === 'session' ? 'מפגש' : 
                                                             item.type === 'assignment' ? 'מטלה' : 'קורס'}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Skipped Items */}
                                    {fixResults.skipped_items && fixResults.skipped_items.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-sm text-amber-700 mb-2 flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4" />
                                                פריטים שדולגו ({fixResults.skipped_items.length})
                                            </h4>
                                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                                {fixResults.skipped_items.map((item, idx) => (
                                                    <div key={idx} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                                        <div className="font-medium text-amber-900 text-sm mb-1">
                                                            {item.item || item.gap?.substring(0, 80)}
                                                        </div>
                                                        <div className="text-xs text-amber-700 flex items-start gap-1">
                                                            <span className="font-semibold shrink-0">סיבה:</span>
                                                            <span>{item.reason}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Failed Items */}
                                    {fixResults.failed_items && fixResults.failed_items.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-sm text-red-700 mb-2 flex items-center gap-2">
                                                <XCircle className="w-4 h-4" />
                                                פריטים שנכשלו ({fixResults.failed_items.length})
                                            </h4>
                                            <div className="space-y-2">
                                                {fixResults.failed_items.map((item, idx) => (
                                                    <div key={idx} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
                                                        <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                                        <div className="flex-1">
                                                            <span className="font-medium text-red-900">{item.item}</span>
                                                            <p className="text-red-700 mt-1">{item.error}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Logs Section */}
                                    {showLogs && fixResults.logs && fixResults.logs.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                                                <FileText className="w-4 h-4" />
                                                לוגים טכניים ({fixResults.logs.length})
                                            </h4>
                                            <div className="bg-slate-900 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-xs" dir="ltr">
                                                {fixResults.logs.map((log, idx) => (
                                                    <div key={idx} className="text-slate-300 mb-2 pb-2 border-b border-slate-800 last:border-0">
                                                        <div className="flex items-start gap-2">
                                                            <span className="text-slate-500 shrink-0">
                                                                [{new Date(log.timestamp).toLocaleTimeString('he-IL')}]
                                                            </span>
                                                            <span className="text-emerald-400">{log.message}</span>
                                                        </div>
                                                        {log.data && (
                                                            <pre className="text-slate-400 mt-1 mr-20 text-[10px] whitespace-pre-wrap">
                                                                {typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : log.data}
                                                            </pre>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                סגור
                            </Button>
                            <Button 
                                onClick={() => autoFixMutation.mutate()} 
                                className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700" 
                                disabled={autoFixMutation.isPending || isLoading || !report?.gaps?.length}
                            >
                                {autoFixMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        מתקן...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-4 h-4" />
                                        תקן אוטומטית
                                    </>
                                )}
                            </Button>
                            <Button onClick={refetch} variant="outline" className="gap-2" disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Loader2 className="w-4 h-4" />}
                                נתח מחדש
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                            <FileWarning className="w-8 h-8 text-amber-600" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-slate-800">מוכן לניתוח</h3>
                            <p className="text-sm text-slate-600 max-w-md">
                                הניתוח יבדוק את כל המפגשים והמטלות בקורס, ויזהה חוסרים, בעיות ואפשרויות לשיפור פדגוגי
                            </p>
                        </div>
                        <Button onClick={refetch} className="mt-4 gap-2 bg-amber-600 hover:bg-amber-700">
                            <FileWarning className="w-4 h-4" />
                            התחל ניתוח
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}