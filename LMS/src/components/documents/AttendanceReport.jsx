import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import PrintLayout, { PrintButton } from '@/components/common/PrintLayout';
import { Loader2, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function AttendanceReport({ course, trigger }) {
    const [open, setOpen] = React.useState(false);

    const { data: students, isLoading: studentsLoading } = useQuery({
        queryKey: ['courseStudents', course.id],
        queryFn: async () => {
            const allStudents = await base44.entities.Student.filter({ organization_id: course.organization_id });
            return allStudents.filter(s => 
                s.course_id === course.id || s.course_ids?.includes(course.id)
            );
        },
        enabled: open
    });

    const { data: attendance, isLoading: attendanceLoading } = useQuery({
        queryKey: ['courseAttendance', course.id],
        queryFn: () => base44.entities.Attendance.filter({ course_id: course.id }),
        enabled: open
    });

    const { data: organization } = useQuery({
        queryKey: ['organization', course.organization_id],
        queryFn: () => base44.entities.Organization.get(course.organization_id),
        enabled: open
    });

    const attendanceStats = React.useMemo(() => {
        if (!students || !attendance) return [];
        
        return students.map(student => {
            const studentRecords = attendance.filter(a => a.student_id === student.id);
            const present = studentRecords.filter(a => a.status === 'present' || a.status === 'late').length;
            const total = studentRecords.length;
            const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
            
            return {
                student,
                present,
                absent: total - present,
                total,
                percentage
            };
        }).sort((a, b) => a.student.full_name.localeCompare(b.student.full_name, 'he'));
    }, [students, attendance]);

    const overallStats = React.useMemo(() => {
        if (attendanceStats.length === 0) return { avgPercentage: 0, totalPresent: 0, totalAbsent: 0 };
        
        const totalPresent = attendanceStats.reduce((sum, s) => sum + s.present, 0);
        const totalAbsent = attendanceStats.reduce((sum, s) => sum + s.absent, 0);
        const avgPercentage = Math.round(attendanceStats.reduce((sum, s) => sum + s.percentage, 0) / attendanceStats.length);
        
        return { avgPercentage, totalPresent, totalAbsent };
    }, [attendanceStats]);

    const isLoading = studentsLoading || attendanceLoading;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2">
                        <Clock className="w-4 h-4" />
                        דוח נוכחות
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="no-print">
                    <DialogTitle>דוח נוכחות - {course.name}</DialogTitle>
                </DialogHeader>
                
                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                ) : (
                    <PrintLayout
                        title="דוח נוכחות"
                        subtitle={course.name}
                        organizationName={organization?.name}
                        organizationLogo={organization?.logo_url || course.logo_url}
                        documentType="attendance"
                        metadata={{
                            קורס: course.name,
                            קוד: course.code,
                            'מס\' תלמידים': students?.length || 0,
                            'אחוז נוכחות ממוצע': `${overallStats.avgPercentage}%`
                        }}
                    >
                        {/* Summary */}
                        <div className="grid grid-cols-3 gap-4 mb-6 avoid-break">
                            <div className="print-info-box">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                    <div dir="rtl">
                                        <div className="text-2xl font-bold text-emerald-700">{overallStats.totalPresent}</div>
                                        <div className="text-sm text-slate-600" dir="rtl">נוכחויות</div>
                                    </div>
                                </div>
                            </div>
                            <div className="print-info-box">
                                <div className="flex items-center gap-3">
                                    <XCircle className="w-8 h-8 text-red-600" />
                                    <div>
                                        <div className="text-2xl font-bold text-red-700">{overallStats.totalAbsent}</div>
                                        <div className="text-sm text-slate-600">היעדרויות</div>
                                    </div>
                                </div>
                            </div>
                            <div className="print-info-box">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-8 h-8 text-blue-600" />
                                    <div>
                                        <div className="text-2xl font-bold text-blue-700">{overallStats.avgPercentage}%</div>
                                        <div className="text-sm text-slate-600">ממוצע נוכחות</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Table */}
                        <h3 className="print-section-title" dir="rtl">פירוט לפי תלמיד</h3>
                        <table className="print-table" dir="rtl">
                            <thead>
                                <tr>
                                    <th style={{width: '40%'}} dir="rtl">שם התלמיד</th>
                                    <th style={{width: '15%'}} dir="rtl">נוכח</th>
                                    <th style={{width: '15%'}} dir="rtl">נעדר</th>
                                    <th style={{width: '15%'}} dir="rtl">סה"כ מפגשים</th>
                                    <th style={{width: '15%'}} dir="rtl">אחוז נוכחות</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceStats.map((stat, idx) => (
                                    <tr key={stat.student.id} className={stat.percentage < 80 ? 'bg-red-50' : ''}>
                                        <td className="font-medium" dir="rtl">{stat.student.full_name}</td>
                                        <td className="text-center text-emerald-700 font-semibold">{stat.present}</td>
                                        <td className="text-center text-red-700 font-semibold">{stat.absent}</td>
                                        <td className="text-center">{stat.total}</td>
                                        <td className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className={`font-bold ${stat.percentage >= 80 ? 'text-emerald-700' : 'text-red-700'}`}>
                                                    {stat.percentage}%
                                                </span>
                                                {stat.percentage < 80 && (
                                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {attendanceStats.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-slate-500">
                                            אין נתוני נוכחות זמינים
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* At Risk Students */}
                        {attendanceStats.filter(s => s.percentage < 80).length > 0 && (
                            <div className="avoid-break mt-6" dir="rtl">
                                <h3 className="print-section-title" dir="rtl">תלמידים בסיכון (מתחת ל-80% נוכחות)</h3>
                                <div className="print-info-box" style={{borderRightColor: '#ef4444'}}>
                                    <ul className="space-y-2">
                                        {attendanceStats
                                            .filter(s => s.percentage < 80)
                                            .map(stat => (
                                                <li key={stat.student.id} className="flex justify-between items-center">
                                                    <span className="font-medium">{stat.student.full_name}</span>
                                                    <span className="text-red-700 font-bold">{stat.percentage}%</span>
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>
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