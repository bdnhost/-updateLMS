import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PrintLayout, { PrintButton } from '@/components/common/PrintLayout';
import { Loader2, FolderOpen, FileText, Video, Link as LinkIcon, CheckCircle2, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const typeIcons = {
    presentation: FileText,
    document: FileText,
    video: Video,
    link: LinkIcon,
    other: FileText
};

export default function MaterialsReviewDocument({ course, trigger }) {
    const [open, setOpen] = React.useState(false);

    const { data: materials, isLoading } = useQuery({
        queryKey: ['courseMaterials', course.id],
        queryFn: async () => {
            const [legacy, newMats] = await Promise.all([
                base44.entities.Material.filter({ course_id: course.id }),
                base44.entities.Material.filter({ course_ids: course.id })
            ]);
            const all = [...(legacy || []), ...(newMats || [])];
            return all.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);
        },
        enabled: open
    });

    const { data: sessions } = useQuery({
        queryKey: ['courseSessions', course.id],
        queryFn: () => base44.entities.CourseSession.filter({ course_id: course.id }),
        enabled: open
    });

    const { data: sessionMaterials } = useQuery({
        queryKey: ['sessionMaterialLinks', course.id],
        queryFn: () => base44.entities.SessionMaterial.filter({ course_id: course.id }),
        enabled: open
    });

    const { data: organization } = useQuery({
        queryKey: ['organization', course.organization_id],
        queryFn: () => base44.entities.Organization.get(course.organization_id),
        enabled: open
    });

    const materialsBySession = React.useMemo(() => {
        if (!materials || !sessions) return [];
        
        return sessions.sort((a, b) => (a.session_number || 0) - (b.session_number || 0)).map(session => {
            const linkedIds = sessionMaterials?.filter(sm => sm.session_id === session.id).map(sm => sm.material_id) || [];
            const sessionMats = materials.filter(m => 
                m.session_id === session.id || linkedIds.includes(m.id)
            );
            
            return {
                session,
                materials: sessionMats
            };
        });
    }, [materials, sessions, sessionMaterials]);

    const stats = React.useMemo(() => {
        const totalMaterials = materials?.length || 0;
        const withFiles = materials?.filter(m => m.file_url).length || 0;
        const withAudio = materials?.filter(m => m.audio_url).length || 0;
        const withMedia = materials?.filter(m => m.media_url).length || 0;
        
        return { totalMaterials, withFiles, withAudio, withMedia };
    }, [materials]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2">
                        <FolderOpen className="w-4 h-4" />
                        סקירת חומרים
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="no-print">
                    <DialogTitle>סקירת חומרי לימוד - {course.name}</DialogTitle>
                </DialogHeader>
                
                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                ) : (
                    <PrintLayout
                        title="סקירת חומרי לימוד"
                        subtitle={course.name}
                        organizationName={organization?.name}
                        organizationLogo={course.logo_url || organization?.logo_url}
                        documentType="materials-review"
                        metadata={{
                            קורס: course.name,
                            'סה"כ חומרים': stats.totalMaterials,
                            'עם קבצים': stats.withFiles,
                            'עם הנחיות קוליות': stats.withAudio
                        }}
                    >
                        {/* Summary */}
                        <div className="grid grid-cols-4 gap-3 mb-6 avoid-break">
                            <div className="print-info-box p-3">
                                <div className="text-2xl font-bold text-slate-800">{stats.totalMaterials}</div>
                                <div className="text-xs text-slate-600">סה"כ חומרים</div>
                            </div>
                            <div className="print-info-box p-3">
                                <div className="text-2xl font-bold text-blue-700">{stats.withFiles}</div>
                                <div className="text-xs text-slate-600">עם קבצים</div>
                            </div>
                            <div className="print-info-box p-3">
                                <div className="text-2xl font-bold text-purple-700">{stats.withAudio}</div>
                                <div className="text-xs text-slate-600">עם אודיו</div>
                            </div>
                            <div className="print-info-box p-3">
                                <div className="text-2xl font-bold text-pink-700">{stats.withMedia}</div>
                                <div className="text-xs text-slate-600">עם מדיה</div>
                            </div>
                        </div>

                        {/* Materials by Session */}
                        <h3 className="print-section-title" dir="rtl">חומרים לפי מפגש</h3>
                        {materialsBySession.map(({ session, materials: sessionMats }) => (
                            <div key={session.id} className="avoid-break mb-4" dir="rtl">
                                <div className="bg-slate-100 px-4 py-2 rounded-lg mb-2" dir="rtl">
                                    <div className="font-bold text-slate-800" dir="rtl">
                                        מפגש {session.session_number}: {session.title}
                                    </div>
                                    {session.date && (
                                        <div className="text-sm text-slate-600">{session.date}</div>
                                    )}
                                </div>
                                
                                {sessionMats.length > 0 ? (
                                    <table className="print-table text-sm">
                                        <thead>
                                            <tr>
                                                <th style={{width: '5%'}} className="text-center">#</th>
                                                <th style={{width: '30%'}}>שם החומר</th>
                                                <th style={{width: '20%'}}>סוג</th>
                                                <th style={{width: '15%'}} className="text-center">קובץ</th>
                                                <th style={{width: '15%'}} className="text-center">אודיו</th>
                                                <th style={{width: '15%'}} className="text-center">מדיה</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sessionMats.map((material, idx) => {
                                                const Icon = typeIcons[material.type] || FileText;
                                                return (
                                                    <tr key={material.id}>
                                                        <td className="text-center text-slate-500">{idx + 1}</td>
                                                        <td className="font-medium">{material.title}</td>
                                                        <td>
                                                            <div className="flex items-center gap-2">
                                                                <Icon className="w-4 h-4 text-slate-500" />
                                                                <span className="text-xs">{material.type || 'other'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="text-center">
                                                            {material.file_url ? (
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            {material.audio_url ? (
                                                                <CheckCircle2 className="w-4 h-4 text-purple-600 mx-auto" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            {material.media_url ? (
                                                                <CheckCircle2 className="w-4 h-4 text-pink-600 mx-auto" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded">
                                        אין חומרים למפגש זה
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* General Materials (not linked to sessions) */}
                        {materials?.filter(m => !m.session_id && !sessionMaterials?.some(sm => sm.material_id === m.id)).length > 0 && (
                            <div className="avoid-break" dir="rtl">
                                <h3 className="print-section-title" dir="rtl">חומרים כלליים (לא משויכים למפגש)</h3>
                                <ul className="print-list">
                                    {materials
                                        .filter(m => !m.session_id && !sessionMaterials?.some(sm => sm.material_id === m.id))
                                        .map((material, idx) => {
                                            const Icon = typeIcons[material.type] || FileText;
                                            return (
                                                <li key={material.id} className="print-list-item flex items-start gap-3">
                                                    <Icon className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-slate-800">{material.title}</div>
                                                        {material.description && (
                                                            <div className="text-sm text-slate-600 mt-1">{material.description}</div>
                                                        )}
                                                    </div>
                                                </li>
                                            );
                                        })
                                    }
                                </ul>
                            </div>
                        )}

                        <div className="no-print mt-6 flex justify-center">
                            <PrintButton className="px-8 py-3 text-lg" />
                        </div>
                    </PrintLayout>
                )}
            </DialogContent>
        </Dialog>
    );
}