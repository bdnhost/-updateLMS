import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SessionAttendance({ session, course }) {
    const queryClient = useQueryClient();
    const [attendanceMap, setAttendanceMap] = useState({});
    const [hasChanges, setHasChanges] = useState(false);

    // Fetch students in course
    const { data: students, isLoading: studentsLoading } = useQuery({
        queryKey: ['courseStudents', course.id],
        queryFn: () => base44.entities.Student.filter({ course_id: course.id, status: 'active' }),
        enabled: !!course.id
    });

    // Fetch existing attendance records for this session
    const { data: existingAttendance, isLoading: attendanceLoading } = useQuery({
        queryKey: ['sessionAttendance', session.id],
        queryFn: () => base44.entities.Attendance.filter({ session_id: session.id }),
        enabled: !!session.id
    });

    useEffect(() => {
        if (existingAttendance && students) {
            const initialMap = {};
            students.forEach(student => {
                const record = existingAttendance.find(r => r.student_id === student.id);
                initialMap[student.id] = record ? record.status : 'unknown'; // default to unknown/none
            });
            setAttendanceMap(initialMap);
            setHasChanges(false);
        }
    }, [existingAttendance, students]);

    const handleStatusChange = (studentId, newStatus) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: newStatus
        }));
        setHasChanges(true);
    };

    const saveMutation = useMutation({
        mutationFn: async () => {
            const promises = students.map(async (student) => {
                const status = attendanceMap[student.id];
                const existingRecord = existingAttendance?.find(r => r.student_id === student.id);
                
                if (status === 'unknown') {
                    // If unknown and record exists, delete it? Or leave it?
                    // Let's assume unknown means "clear selection".
                    if (existingRecord) {
                        return base44.entities.Attendance.delete(existingRecord.id);
                    }
                    return null;
                }

                const payload = {
                    organization_id: course.organization_id,
                    course_id: course.id,
                    session_id: session.id,
                    student_id: student.id,
                    student_name: student.full_name,
                    date: session.date || new Date().toISOString().split('T')[0], // Use session date or today
                    lesson_number: session.session_number,
                    status: status,
                    check_in_time: new Date().toLocaleTimeString()
                };

                if (existingRecord) {
                    // Only update if changed
                    if (existingRecord.status !== status) {
                        return base44.entities.Attendance.update(existingRecord.id, payload);
                    }
                    return null;
                } else {
                    return base44.entities.Attendance.create(payload);
                }
            });

            await Promise.all(promises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessionAttendance'] });
            toast.success('הנוכחות נשמרה בהצלחה');
            setHasChanges(false);
        },
        onError: () => toast.error('שגיאה בשמירת הנוכחות')
    });

    const markAll = (status) => {
        const newMap = { ...attendanceMap };
        students.forEach(s => newMap[s.id] = status);
        setAttendanceMap(newMap);
        setHasChanges(true);
    };

    if (studentsLoading || attendanceLoading) return <Loader2 className="animate-spin" />;

    if (!students || students.length === 0) return <div className="text-center p-4 text-slate-500">אין סטודנטים בקורס זה</div>;

    const stats = {
        present: Object.values(attendanceMap).filter(s => s === 'present').length,
        absent: Object.values(attendanceMap).filter(s => s === 'absent').length,
        late: Object.values(attendanceMap).filter(s => s === 'late').length,
        unknown: Object.values(attendanceMap).filter(s => s === 'unknown').length,
        total: students.length
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>בדיקת נוכחות</CardTitle>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => markAll('present')} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                            סמן הכל כנוכח
                        </Button>
                        <Button size="sm" onClick={() => saveMutation.mutate()} disabled={!hasChanges || saveMutation.isPending} className="bg-indigo-600">
                            <Save className="w-4 h-4 ml-2" />
                            {saveMutation.isPending ? 'שומר...' : 'שמור שינויים'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Stats Bar */}
                    <div className="flex gap-4 mb-6 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-1 text-emerald-600 font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            נוכחים: {stats.present}
                        </div>
                        <div className="flex items-center gap-1 text-red-600 font-medium">
                            <XCircle className="w-4 h-4" />
                            נעדרים: {stats.absent}
                        </div>
                        <div className="flex items-center gap-1 text-orange-600 font-medium">
                            <Clock className="w-4 h-4" />
                            מאחרים: {stats.late}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                            <AlertCircle className="w-4 h-4" />
                            לא סומן: {stats.unknown}
                        </div>
                    </div>

                    <div className="space-y-2">
                        {students.map(student => {
                            const status = attendanceMap[student.id];
                            return (
                                <div key={student.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-200 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                            {student.full_name.charAt(0)}
                                        </div>
                                        <span className="font-medium text-slate-800">{student.full_name}</span>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <Button 
                                            size="sm" 
                                            variant={status === 'present' ? 'default' : 'ghost'} 
                                            className={`h-8 px-3 ${status === 'present' ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                            onClick={() => handleStatusChange(student.id, 'present')}
                                        >
                                            נוכח
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant={status === 'late' ? 'default' : 'ghost'} 
                                            className={`h-8 px-3 ${status === 'late' ? 'bg-orange-500 hover:bg-orange-600' : 'text-slate-500 hover:text-orange-600 hover:bg-orange-50'}`}
                                            onClick={() => handleStatusChange(student.id, 'late')}
                                        >
                                            מאחר
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant={status === 'absent' ? 'default' : 'ghost'} 
                                            className={`h-8 px-3 ${status === 'absent' ? 'bg-red-600 hover:bg-red-700' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'}`}
                                            onClick={() => handleStatusChange(student.id, 'absent')}
                                        >
                                            נעדר
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant={status === 'excused' ? 'default' : 'ghost'} 
                                            className={`h-8 px-3 ${status === 'excused' ? 'bg-blue-600 hover:bg-blue-700' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}
                                            onClick={() => handleStatusChange(student.id, 'excused')}
                                        >
                                            מוצדק
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}