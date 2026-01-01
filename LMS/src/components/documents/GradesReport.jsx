import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PrintLayout, { PrintButton } from '@/components/common/PrintLayout';
import { Loader2, TrendingUp, Award, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function GradesReport({ course, trigger }) {
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

    const { data: assignments, isLoading: assignmentsLoading } = useQuery({
        queryKey: ['courseAssignments', course.id],
        queryFn: () => base44.entities.Assignment.filter({ course_id: course.id }),
        enabled: open
    });

    const { data: grades, isLoading: gradesLoading } = useQuery({
        queryKey: ['courseGrades', course.id],
        queryFn: () => base44.entities.Grade.filter({ course_id: course.id }),
        enabled: open
    });

    const { data: organization } = useQuery({
        queryKey: ['organization', course.organization_id],
        queryFn: () => base44.entities.Organization.get(course.organization_id),
        enabled: open
    });

    const gradeStats = React.useMemo(() => {
        if (!students || !assignments || !grades) return [];
        
        return students.map(student => {
            const studentGrades = grades.filter(g => g.student_id === student.id);
            const assignmentGrades = assignments.map(assignment => {
                const grade = studentGrades.find(g => g.assignment_id === assignment.id);
                return {
                    assignment,
                    grade: grade?.score,
                    submitted: grade?.submission_status === 'submitted'
                };
            });
            
            const scoredGrades = studentGrades.filter(g => g.score !== null && g.score !== undefined);
            const average = scoredGrades.length > 0
                ? Math.round(scoredGrades.reduce((sum, g) => sum + g.score, 0) / scoredGrades.length)
                : null;
            
            return {
                student,
                assignmentGrades,
                average,
                submitted: studentGrades.filter(g => g.submission_status === 'submitted').length,
                total: assignments.length
            };
        }).sort((a, b) => a.student.full_name.localeCompare(b.student.full_name, 'he'));
    }, [students, assignments, grades]);

    const overallStats = React.useMemo(() => {
        const withGrades = gradeStats.filter(s => s.average !== null);
        const avgGrade = withGrades.length > 0
            ? Math.round(withGrades.reduce((sum, s) => sum + s.average, 0) / withGrades.length)
            : 0;
        
        const totalSubmitted = gradeStats.reduce((sum, s) => sum + s.submitted, 0);
        const totalAssignments = gradeStats.length * (assignments?.length || 0);
        const submissionRate = totalAssignments > 0 ? Math.round((totalSubmitted / totalAssignments) * 100) : 0;
        
        return { avgGrade, submissionRate, studentsWithGrades: withGrades.length };
    }, [gradeStats, assignments]);

    const isLoading = studentsLoading || assignmentsLoading || gradesLoading;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2">
                        <TrendingUp className="w-4 h-4" />
                        דוח ציונים
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="no-print">
                    <DialogTitle>דוח ציונים - {course.name}</DialogTitle>
                </DialogHeader>
                
                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                ) : (
                    <PrintLayout
                        title="דוח ציונים"
                        subtitle={course.name}
                        organizationName={organization?.name}
                        organizationLogo={organization?.logo_url || course.logo_url}
                        documentType="grades"
                        metadata={{
                            קורס: course.name,
                            'מס\' מטלות': assignments?.length || 0,
                            'ציון ממוצע': overallStats.avgGrade || 'אין',
                            'אחוז הגשות': `${overallStats.submissionRate}%`
                        }}
                    >
                        {/* Summary */}
                        <div className="grid grid-cols-3 gap-4 mb-6 avoid-break">
                            <div className="print-info-box">
                                <div className="flex items-center gap-3">
                                    <Award className="w-8 h-8 text-amber-600" />
                                    <div>
                                        <div className="text-2xl font-bold text-amber-700">{overallStats.avgGrade}</div>
                                        <div className="text-sm text-slate-600">ממוצע כיתה</div>
                                    </div>
                                </div>
                            </div>
                            <div className="print-info-box">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="w-8 h-8 text-green-600" />
                                    <div>
                                        <div className="text-2xl font-bold text-green-700">{overallStats.submissionRate}%</div>
                                        <div className="text-sm text-slate-600">אחוז הגשות</div>
                                    </div>
                                </div>
                            </div>
                            <div className="print-info-box">
                                <div className="flex items-center gap-3">
                                    <Award className="w-8 h-8 text-indigo-600" />
                                    <div>
                                        <div className="text-2xl font-bold text-indigo-700">{overallStats.studentsWithGrades}</div>
                                        <div className="text-sm text-slate-600">תלמידים עם ציונים</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Assignments Summary */}
                        <h3 className="print-section-title" dir="rtl">סיכום מטלות</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            {assignments?.map(assignment => {
                                const submitted = grades?.filter(g => 
                                    g.assignment_id === assignment.id && g.submission_status === 'submitted'
                                ).length || 0;
                                const submissionRate = students?.length ? Math.round((submitted / students.length) * 100) : 0;
                                
                                return (
                                    <div key={assignment.id} className="print-info-box p-3">
                                        <div className="text-sm font-semibold text-slate-800 mb-1 line-clamp-2">
                                            {assignment.title}
                                        </div>
                                        <div className="text-xs text-slate-600">
                                            הוגשו: {submitted}/{students?.length || 0} ({submissionRate}%)
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Detailed Table */}
                        <h3 className="print-section-title" dir="rtl">ציונים לפי תלמיד</h3>
                        <table className="print-table text-sm" dir="rtl">
                            <thead>
                                <tr>
                                    <th style={{width: '25%'}} dir="rtl">שם התלמיד</th>
                                    {assignments?.slice(0, 8).map(a => (
                                        <th key={a.id} className="text-center text-xs" style={{width: `${75 / Math.min(assignments.length, 8)}%`}}>
                                            {a.title.length > 15 ? a.title.substring(0, 15) + '...' : a.title}
                                        </th>
                                    ))}
                                    <th style={{width: '10%'}} className="text-center">ממוצע</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gradeStats.map(stat => (
                                    <tr key={stat.student.id}>
                                        <td className="font-medium" dir="rtl">{stat.student.full_name}</td>
                                        {stat.assignmentGrades.slice(0, 8).map((ag, idx) => (
                                            <td key={idx} className="text-center">
                                                {ag.grade !== null && ag.grade !== undefined ? (
                                                    <span className={`font-semibold ${ag.grade >= 80 ? 'text-emerald-700' : ag.grade >= 60 ? 'text-amber-700' : 'text-red-700'}`}>
                                                        {ag.grade}
                                                    </span>
                                                ) : ag.submitted ? (
                                                    <span className="text-slate-400">-</span>
                                                ) : (
                                                    <span className="text-red-400">✗</span>
                                                )}
                                            </td>
                                        ))}
                                        <td className="text-center">
                                            {stat.average !== null ? (
                                                <span className={`font-bold text-lg ${stat.average >= 80 ? 'text-emerald-700' : stat.average >= 60 ? 'text-amber-700' : 'text-red-700'}`}>
                                                    {stat.average}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Low Performers */}
                        {gradeStats.filter(s => s.average !== null && s.average < 60).length > 0 && (
                            <div className="avoid-break mt-6" dir="rtl">
                                <h3 className="print-section-title" dir="rtl">תלמידים הדורשים תשומת לב (ממוצע מתחת ל-60)</h3>
                                <div className="print-info-box" style={{borderRightColor: '#ef4444'}}>
                                    <ul className="space-y-2">
                                        {gradeStats
                                            .filter(s => s.average !== null && s.average < 60)
                                            .map(stat => (
                                                <li key={stat.student.id} className="flex justify-between items-center">
                                                    <span className="font-medium">{stat.student.full_name}</span>
                                                    <span className="text-red-700 font-bold">{stat.average}</span>
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