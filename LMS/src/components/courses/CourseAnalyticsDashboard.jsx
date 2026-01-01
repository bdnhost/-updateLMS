import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Users, FileText, CheckCircle, Clock, TrendingUp, Award, Calendar, MessageSquare, Target, Zap } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { he } from 'date-fns/locale';

const COLORS = {
    primary: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
    status: {
        submitted: '#10b981',
        pending: '#f59e0b', 
        late: '#ef4444',
        absent: '#94a3b8'
    }
};

export default function CourseAnalyticsDashboard({ 
    course, 
    students, 
    assignments, 
    grades, 
    attendance, 
    materials,
    sessions,
    messages 
}) {

    // ===== STUDENTS ANALYTICS =====
    const studentStats = useMemo(() => {
        if (!students) return { total: 0, active: 0, inactive: 0, pending: 0 };
        
        return {
            total: students.length,
            active: students.filter(s => s.status === 'active').length,
            inactive: students.filter(s => s.status === 'inactive').length,
            pending: students.filter(s => s.status === 'pending').length
        };
    }, [students]);

    const studentStatusData = useMemo(() => {
        if (!students) return [];
        const statuses = { active: 0, inactive: 0, pending: 0, dropped: 0 };
        students.forEach(s => {
            statuses[s.status] = (statuses[s.status] || 0) + 1;
        });
        return [
            { name: 'פעילים', value: statuses.active, color: '#10b981' },
            { name: 'ממתינים', value: statuses.pending, color: '#f59e0b' },
            { name: 'לא פעילים', value: statuses.inactive, color: '#94a3b8' },
            { name: 'נשרו', value: statuses.dropped, color: '#ef4444' }
        ].filter(item => item.value > 0);
    }, [students]);

    // ===== ASSIGNMENTS ANALYTICS =====
    const assignmentStats = useMemo(() => {
        if (!assignments || !grades || !students) return null;

        const stats = assignments.map(a => {
            const assignmentGrades = grades.filter(g => g.assignment_id === a.id);
            const submitted = assignmentGrades.filter(g => g.submission_status === 'submitted').length;
            const total = students.length;
            
            return {
                name: a.title.length > 20 ? a.title.substring(0, 20) + '...' : a.title,
                submitted,
                pending: total - submitted,
                percentage: total > 0 ? Math.round((submitted / total) * 100) : 0,
                avgScore: assignmentGrades.filter(g => g.score).length > 0 
                    ? Math.round(assignmentGrades.reduce((sum, g) => sum + (g.score || 0), 0) / assignmentGrades.filter(g => g.score).length)
                    : null
            };
        });

        return stats;
    }, [assignments, grades, students]);

    const assignmentTypeDistribution = useMemo(() => {
        if (!assignments) return [];
        const types = { assignment: 0, quiz: 0, exam: 0, project: 0 };
        assignments.forEach(a => {
            types[a.type] = (types[a.type] || 0) + 1;
        });
        return [
            { name: 'מטלות', value: types.assignment, color: '#6366f1' },
            { name: 'בוחנים', value: types.quiz, color: '#8b5cf6' },
            { name: 'מבחנים', value: types.exam, color: '#ec4899' },
            { name: 'פרויקטים', value: types.project, color: '#f59e0b' }
        ].filter(item => item.value > 0);
    }, [assignments]);

    // ===== ATTENDANCE ANALYTICS =====
    const attendanceOverTime = useMemo(() => {
        if (!attendance || attendance.length === 0) return [];
        
        // Group attendance by date
        const attendanceByDate = {};
        attendance.forEach(a => {
            if (!a.date) return;
            if (!attendanceByDate[a.date]) {
                attendanceByDate[a.date] = [];
            }
            attendanceByDate[a.date].push(a);
        });
        
        // Create data points sorted by date
        return Object.entries(attendanceByDate)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .map(([date, records]) => {
                const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
                const total = students?.length || records.length;
                
                return {
                    session: format(new Date(date), 'dd/MM', { locale: he }),
                    percentage: total > 0 ? Math.round((present / total) * 100) : 0,
                    present,
                    absent: records.filter(r => r.status === 'absent').length,
                    total
                };
            });
    }, [attendance, students]);

    const overallAttendanceRate = useMemo(() => {
        if (!attendance || attendance.length === 0) return 0;
        const present = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
        return Math.round((present / attendance.length) * 100);
    }, [attendance]);

    // ===== GRADES ANALYTICS =====
    const gradesDistribution = useMemo(() => {
        if (!grades) return [];
        
        const ranges = [
            { name: '0-60', min: 0, max: 60, count: 0, color: '#ef4444' },
            { name: '60-70', min: 60, max: 70, count: 0, color: '#f59e0b' },
            { name: '70-80', min: 70, max: 80, count: 0, color: '#eab308' },
            { name: '80-90', min: 80, max: 90, count: 0, color: '#22c55e' },
            { name: '90-100', min: 90, max: 100, count: 0, color: '#10b981' }
        ];

        grades.filter(g => g.score !== null && g.score !== undefined).forEach(g => {
            const range = ranges.find(r => g.score >= r.min && g.score <= r.max);
            if (range) range.count++;
        });

        return ranges.filter(r => r.count > 0);
    }, [grades]);

    const averageGrade = useMemo(() => {
        if (!grades) return 0;
        const validGrades = grades.filter(g => g.score !== null && g.score !== undefined);
        if (validGrades.length === 0) return 0;
        return Math.round(validGrades.reduce((sum, g) => sum + g.score, 0) / validGrades.length);
    }, [grades]);

    // ===== MATERIALS ANALYTICS =====
    const materialTypeData = useMemo(() => {
        if (!materials) return [];
        const types = { presentation: 0, document: 0, video: 0, link: 0, lexicon: 0, other: 0 };
        materials.forEach(m => {
            types[m.type] = (types[m.type] || 0) + 1;
        });
        return [
            { name: 'מצגות', value: types.presentation, color: '#f59e0b' },
            { name: 'מסמכים', value: types.document, color: '#6366f1' },
            { name: 'וידאו', value: types.video, color: '#ef4444' },
            { name: 'קישורים', value: types.link, color: '#06b6d4' },
            { name: 'לקסיקון', value: types.lexicon, color: '#8b5cf6' },
            { name: 'אחר', value: types.other, color: '#64748b' }
        ].filter(item => item.value > 0);
    }, [materials]);

    // ===== MESSAGES ANALYTICS =====
    const messageStats = useMemo(() => {
        if (!messages) return { total: 0, email: 0, sms: 0, whatsapp: 0, internal: 0 };
        return {
            total: messages.length,
            email: messages.filter(m => m.type === 'email').length,
            sms: messages.filter(m => m.type === 'sms').length,
            whatsapp: messages.filter(m => m.type === 'whatsapp').length,
            internal: messages.filter(m => m.type === 'internal').length
        };
    }, [messages]);

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">סה"כ תלמידים</p>
                                <p className="text-3xl font-bold text-slate-800">{studentStats.total}</p>
                                <p className="text-xs text-emerald-600 mt-1">{studentStats.active} פעילים</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">מטלות</p>
                                <p className="text-3xl font-bold text-slate-800">{assignments?.length || 0}</p>
                                <p className="text-xs text-purple-600 mt-1">{assignments?.filter(a => a.status === 'open').length || 0} פתוחות</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-xl">
                                <FileText className="w-8 h-8 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">נוכחות ממוצעת</p>
                                <p className="text-3xl font-bold text-slate-800">{overallAttendanceRate}%</p>
                                <p className="text-xs text-slate-500 mt-1">{attendance?.length || 0} רשומות</p>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-xl">
                                <CheckCircle className="w-8 h-8 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">ציון ממוצע</p>
                                <p className="text-3xl font-bold text-slate-800">{averageGrade}</p>
                                <p className="text-xs text-slate-500 mt-1">{grades?.filter(g => g.score).length || 0} ציונים</p>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-xl">
                                <Award className="w-8 h-8 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Student Status Distribution */}
                {studentStatusData.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                התפלגות סטטוס תלמידים
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={studentStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {studentStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Assignment Type Distribution */}
                {assignmentTypeDistribution.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="w-5 h-5 text-purple-600" />
                                סוגי מטלות
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={assignmentTypeDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {assignmentTypeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Attendance Over Time */}
                {attendanceOverTime.length > 0 && (
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                                מגמת נוכחות לאורך זמן
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={attendanceOverTime}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="session" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="percentage" stroke="#10b981" fill="#bbf7d0" name="נוכחות %" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Submission Rates per Assignment */}
                {assignmentStats && assignmentStats.length > 0 && (
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-600" />
                                אחוזי הגשה למטלות
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={assignmentStats}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="submitted" fill="#10b981" name="הוגש" />
                                    <Bar dataKey="pending" fill="#f59e0b" name="ממתין" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Grades Distribution */}
                {gradesDistribution.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-600" />
                                התפלגות ציונים
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={gradesDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" name="תלמידים">
                                        {gradesDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Material Types */}
                {materialTypeData.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="w-5 h-5 text-violet-600" />
                                סוגי חומרי לימוד
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={materialTypeData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {materialTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Communication Stats */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                            סטטיסטיקות תקשורת
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
                                <p className="text-2xl font-bold text-blue-700">{messageStats.total}</p>
                                <p className="text-xs text-blue-600 mt-1">סה"כ הודעות</p>
                            </div>
                            <div className="bg-gradient-to-br from-violet-50 to-violet-100 p-4 rounded-xl text-center">
                                <p className="text-2xl font-bold text-violet-700">{messageStats.email}</p>
                                <p className="text-xs text-violet-600 mt-1">אימיילים</p>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl text-center">
                                <p className="text-2xl font-bold text-emerald-700">{messageStats.whatsapp}</p>
                                <p className="text-xs text-emerald-600 mt-1">WhatsApp</p>
                            </div>
                            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl text-center">
                                <p className="text-2xl font-bold text-amber-700">{messageStats.sms}</p>
                                <p className="text-xs text-amber-600 mt-1">SMS</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Average Scores per Assignment */}
                {assignmentStats && assignmentStats.filter(a => a.avgScore !== null).length > 0 && (
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-600" />
                                ציון ממוצע למטלה
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={assignmentStats.filter(a => a.avgScore !== null)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="avgScore" stroke="#f59e0b" strokeWidth={3} name="ציון ממוצע" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Summary Insights */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="w-5 h-5 text-indigo-600" />
                        תובנות ותצפית
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {overallAttendanceRate < 70 && (
                        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <Clock className="w-5 h-5 text-red-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-red-800">נוכחות נמוכה</p>
                                <p className="text-sm text-red-600">אחוז הנוכחות הממוצע נמוך מ-70%. מומלץ לבדוק סיבות ולשקול יצירת קשר עם תלמידים.</p>
                            </div>
                        </div>
                    )}
                    
                    {averageGrade > 0 && averageGrade < 65 && (
                        <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <Award className="w-5 h-5 text-orange-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-orange-800">ציון ממוצע נמוך</p>
                                <p className="text-sm text-orange-600">הציון הממוצע נמוך. שקול להוסיף חומרי עזר או לבצע שיעור חזרה.</p>
                            </div>
                        </div>
                    )}

                    {assignmentStats && assignmentStats.some(a => a.percentage < 50) && (
                        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <Target className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-amber-800">אחוזי הגשה נמוכים</p>
                                <p className="text-sm text-amber-600">חלק מהמטלות קיבלו פחות מ-50% הגשות. שקול להזכיר לתלמידים או להאריך מועדים.</p>
                            </div>
                        </div>
                    )}

                    {overallAttendanceRate >= 80 && averageGrade >= 80 && (
                        <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-emerald-800">ביצועים מצוינים!</p>
                                <p className="text-sm text-emerald-600">הקורס מתנהל מצוין - נוכחות גבוהה וציונים טובים. כל הכבוד!</p>
                            </div>
                        </div>
                    )}

                    {(!materials || materials.length === 0) && (
                        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-blue-800">לא נמצאו חומרי לימוד</p>
                                <p className="text-sm text-blue-600">מומלץ להעלות מצגות, מסמכים וחומרי עזר לתלמידים.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}