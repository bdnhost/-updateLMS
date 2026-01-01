import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import PrintLayout, { PrintButton } from '@/components/common/PrintLayout';
import { Loader2, BookOpen, Target, FileText, FolderOpen, CheckSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function SessionPrepDocument({ session, course, trigger }) {
    const [open, setOpen] = React.useState(false);

    const { data: assignments } = useQuery({
        queryKey: ['sessionAssignments', session.id],
        queryFn: () => base44.entities.Assignment.filter({ session_id: session.id }),
        enabled: open
    });

    const { data: materials } = useQuery({
        queryKey: ['sessionMaterials', session.id],
        queryFn: async () => {
            const sessionMats = await base44.entities.SessionMaterial.filter({ session_id: session.id });
            if (sessionMats.length === 0) return [];
            
            const materialIds = sessionMats.map(sm => sm.material_id);
            const allMaterials = await base44.entities.Material.list();
            return allMaterials.filter(m => materialIds.includes(m.id));
        },
        enabled: open
    });

    const { data: organization } = useQuery({
        queryKey: ['organization', course?.organization_id],
        queryFn: () => base44.entities.Organization.get(course.organization_id),
        enabled: open && !!course
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2">
                        <BookOpen className="w-4 h-4" />
                        מסמך הכנה
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="no-print">
                    <DialogTitle>מסמך הכנה למפגש - {session.title}</DialogTitle>
                </DialogHeader>
                
                <PrintLayout
                    title="מסמך הכנה למפגש"
                    subtitle={session.title}
                    organizationName={organization?.name}
                    organizationLogo={organization?.logo_url || course?.logo_url}
                    documentType="session-prep"
                    metadata={{
                        קורס: course?.name,
                        'מספר מפגש': session.session_number,
                        תאריך: session.date ? format(new Date(session.date), 'dd/MM/yyyy', { locale: he }) : 'לא נקבע',
                        'שעות הוראה': session.duration_hours || 'לא נקבע'
                    }}
                >
                    {/* Overview */}
                    <div className="print-info-box avoid-break">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Target className="w-5 h-5 text-indigo-600" />
                            סקירה כללית
                        </h3>
                        {session.description && (
                            <p className="text-slate-700 whitespace-pre-wrap mb-3">{session.description}</p>
                        )}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="font-semibold text-slate-600">מיקום:</span>
                                <span className="mr-2">{session.location || 'לא צוין'}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-slate-600">זמן:</span>
                                <span className="mr-2">{session.start_time || 'לא נקבע'} - {session.end_time || 'לא נקבע'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Objectives */}
                    {session.objectives && (
                        <div className="avoid-break">
                            <h3 className="print-section-title">מטרות המפגש</h3>
                            <div className="print-info-box">
                                <p className="text-slate-700 whitespace-pre-wrap">{session.objectives}</p>
                            </div>
                        </div>
                    )}

                    {/* Materials */}
                    {materials && materials.length > 0 && (
                        <div className="avoid-break">
                            <h3 className="print-section-title">חומרי לימוד נדרשים</h3>
                            <ul className="print-list">
                                {materials.map(material => (
                                    <li key={material.id} className="print-list-item flex items-start gap-3">
                                        <FolderOpen className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-800">{material.title}</div>
                                            {material.description && (
                                                <div className="text-sm text-slate-600 mt-1">{material.description}</div>
                                            )}
                                            {material.file_url && (
                                                <div className="text-xs text-slate-500 mt-1 font-mono break-all">
                                                    {material.file_url}
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Assignments */}
                    {assignments && assignments.length > 0 && (
                        <div className="avoid-break">
                            <h3 className="print-section-title">מטלות ובדיקות</h3>
                            {assignments.map(assignment => (
                                <div key={assignment.id} className="print-info-box mb-3">
                                    <div className="flex items-start gap-3">
                                        <FileText className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-800 mb-1">{assignment.title}</div>
                                            {assignment.description && (
                                                <div className="text-sm text-slate-600 mb-2 whitespace-pre-wrap">
                                                    {assignment.description}
                                                </div>
                                            )}
                                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                                                <div>
                                                    <span className="font-semibold">תאריך הגשה:</span> {assignment.due_date}
                                                </div>
                                                <div>
                                                    <span className="font-semibold">משקל:</span> {assignment.weight}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Preparation Checklist */}
                    <div className="avoid-break">
                        <h3 className="print-section-title">רשימת בדיקה להכנה</h3>
                        <div className="print-info-box">
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <CheckSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                    <span>בדיקת חומרי הלימוד וזמינותם</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                    <span>הכנת מצגת / לוח וירטואלי</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                    <span>בדיקת ציוד טכני (מחשב, מקרן, מיקרופון)</span>
                                </li>
                                {session.video_conference_link && (
                                    <li className="flex items-start gap-2">
                                        <CheckSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                        <span>וידוא קישור Zoom: {session.video_conference_link}</span>
                                    </li>
                                )}
                                <li className="flex items-start gap-2">
                                    <CheckSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                    <span>הכנת דוגמאות ותרגילים</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Teacher Notes */}
                    {session.teacher_notes && (
                        <div className="avoid-break">
                            <h3 className="print-section-title">הערות אישיות למרצה</h3>
                            <div className="print-info-box" style={{borderRightColor: '#3b82f6'}}>
                                <p className="text-slate-700 whitespace-pre-wrap italic">{session.teacher_notes}</p>
                            </div>
                        </div>
                    )}

                    <div className="no-print mt-6 flex justify-center">
                        <PrintButton className="px-8 py-3 text-lg" filename={`מסמך-הכנה-${session.title}.pdf`}>ייצא PDF</PrintButton>
                    </div>
                </PrintLayout>
            </DialogContent>
        </Dialog>
    );
}