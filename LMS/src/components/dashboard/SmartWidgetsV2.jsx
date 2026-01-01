import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { 
    Users, 
    GraduationCap, 
    Calendar, 
    AlertTriangle, 
    CheckCircle2, 
    Clock, 
    ArrowLeft,
    Plus,
    MessageCircle,
    FileText,
    TrendingUp,
    Zap,
    BookOpen,
    LayoutDashboard,
    ArrowUpRight,
    ClipboardList,
    FileBarChart,
    PieChart
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

// --- 1. System Status Grid (The "Big" Navigation/Legend) ---
export const SystemStatusGrid = ({ stats }) => {
    const items = [
        {
            label: 'תלמידים',
            value: stats.activeStudents,
            subValue: `${stats.pendingStudents} ממתינים`,
            icon: Users,
            color: 'blue',
            link: 'Students',
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-blue-100'
        },
        {
            label: 'קורסים',
            value: stats.activeCourses,
            subValue: 'סמסטר פעיל',
            icon: GraduationCap,
            color: 'violet',
            link: 'Courses',
            bg: 'bg-violet-50',
            text: 'text-violet-700',
            border: 'border-violet-100'
        },
        {
            label: 'מטלות',
            value: stats.pendingGrades,
            subValue: 'ממתינות לבדיקה',
            icon: FileText,
            color: 'pink',
            link: 'Assignments',
            bg: 'bg-pink-50',
            text: 'text-pink-700',
            border: 'border-pink-100'
        },
        {
            label: 'הודעות',
            value: stats.unreadMessages,
            subValue: stats.unreadInbound > 0 ? `${stats.unreadInbound} חדשות מתלמידים!` : 'לא נקראו',
            icon: MessageCircle,
            color: 'emerald',
            link: 'Messages',
            bg: stats.unreadInbound > 0 ? 'bg-emerald-100 animate-pulse' : 'bg-emerald-50',
            text: stats.unreadInbound > 0 ? 'text-emerald-800 font-bold' : 'text-emerald-700',
            border: stats.unreadInbound > 0 ? 'border-emerald-300 ring-2 ring-emerald-200' : 'border-emerald-100',
            alert: stats.unreadInbound > 0
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item, index) => (
                <Link key={index} to={createPageUrl(item.link)}>
                    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
                        <Card className={`h-[100px] border border-transparent hover:border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden group relative`}>
                            <div className={`absolute top-0 left-0 w-1 h-full ${item.bg.replace('50', '500')}`} />
                            <CardContent className="p-4 h-full">
                                <div className="flex items-center gap-3 h-full">
                                    <div className={`p-2.5 rounded-xl ${item.bg} ${item.text} ${item.alert ? 'animate-bounce' : ''} shrink-0`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-slate-500 font-medium text-xs mb-0.5">{item.label}</p>
                                        <h3 className="text-2xl font-bold text-slate-900 leading-none mb-1">{item.value}</h3>
                                        <p className={`text-[10px] font-medium truncate ${item.subValue.includes('0') ? 'text-slate-400' : item.text}`}>
                                            {item.subValue}
                                        </p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        <ArrowUpRight className="w-4 h-4 text-slate-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Link>
            ))}
        </div>
    );
};

// --- 2. Compact Schedule Timeline (The "Small" Schedule) ---
export function CompactSchedule({ events }) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayEvents = events?.filter(e => e.date === today) || [];

    return (
        <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/60 h-[400px] flex flex-col bg-white transform transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] hover:-translate-y-0.5">
            <CardHeader className="pb-3 border-b border-slate-50">
                <div className="flex justify-between items-center">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                    <Calendar className="w-4 h-4 text-violet-500" />
                    סדר יום
                </CardTitle>
                <Link to={createPageUrl('Calendar')}>
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-slate-400 hover:text-violet-600">
                        לוח מלא
                    </Button>
                </Link>
            </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto custom-scrollbar pt-4 px-4">
            {(!events || events.length === 0) ? (
                <div className="text-center py-8 opacity-60">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Clock className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-500">אין אירועים להיום</p>
                </div>
            ) : (
                <div className="space-y-4 relative">
                    {/* Timeline Line */}
                    <div className="absolute top-2 bottom-2 right-[7px] w-[2px] bg-slate-100" />
                    
                    {events.map((event, i) => {
                        const isNow = new Date() >= new Date(`${event.date}T${event.start_time}`) && new Date() <= new Date(`${event.date}T${event.end_time}`);
                        return (
                            <div key={i} className="relative pr-6 group">
                                <div className={`absolute right-0 top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 ${isNow ? 'bg-green-500 animate-pulse' : 'bg-slate-200 group-hover:bg-violet-400'} transition-colors`} />
                                
                                <div className={`p-3 rounded-lg border transition-all ${isNow ? 'bg-green-50 border-green-100 shadow-sm' : 'bg-white border-slate-100 group-hover:border-violet-100 group-hover:shadow-sm'}`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-xs font-mono font-medium ${isNow ? 'text-green-700' : 'text-slate-500'}`}>
                                            {event.start_time}
                                        </span>
                                        {isNow && <Badge className="bg-green-500 text-[9px] h-4 px-1.5">עכשיו</Badge>}
                                    </div>
                                    <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{event.title}</h4>
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{event.course_name}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </CardContent>
        </Card>
    );
}

// --- 3. Attention Widget (At Risk) ---
export const AttentionWidget = ({ atRiskStudents }) => (
    <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/60 h-[400px] flex flex-col bg-white transform transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] hover:-translate-y-0.5">
        <CardHeader className="pb-3 border-b border-slate-50">
            <div className="flex justify-between items-center">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    תשומת לב נדרשת
                </CardTitle>
                {atRiskStudents?.length > 0 && 
                    <Badge variant="secondary" className="bg-red-50 text-red-600 border-0 text-xs">
                        {atRiskStudents.length}
                    </Badge>
                }
            </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-0">
            {(!atRiskStudents || atRiskStudents.length === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-10">
                    <CheckCircle2 className="w-12 h-12 mb-3 text-green-500/20" />
                    <p className="text-sm font-medium text-slate-600">המצב מצוין!</p>
                    <p className="text-xs text-slate-400">אין תלמידים בסיכון כרגע</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-50">
                    {atRiskStudents.slice(0, 5).map((student) => (
                        <div key={student.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors group">
                            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs border border-red-100 shrink-0">
                                {student.full_name.slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between">
                                    <h4 className="text-sm font-semibold text-slate-800 truncate">{student.full_name}</h4>
                                    <span className="text-xs font-bold text-red-600">{student.attendance_rate}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${student.attendance_rate}%` }} />
                                </div>
                            </div>
                            <Link to={createPageUrl('StudentProfile') + `?id=${student.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" className="h-7 w-7">
                                    <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
    </Card>
);

// --- 4. Quick Actions (Vertical for Sidebar) ---
export function QuickActionsSidebar() {
    return (
        <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 overflow-hidden relative h-[400px] transform transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] hover:-translate-y-0.5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-200/20 rounded-full blur-[60px]" />
            
            <CardHeader className="pb-2 relative z-10 border-b border-slate-200/50">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                    <Zap className="w-4 h-4 text-indigo-600" />
                    פעולות מהירות
                </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-2 pt-4">
            <Link to={createPageUrl('Courses') + '?action=new'}>
                <Button variant="secondary" className="w-full justify-start bg-white/80 hover:bg-white border border-slate-200/50 text-slate-700 hover:text-indigo-700 h-9 text-xs font-medium shadow-sm hover:shadow transition-all">
                    <Plus className="w-3.5 h-3.5 ml-2" />
                    יצירת קורס חדש
                </Button>
            </Link>
            <Link to={createPageUrl('Students') + '?action=new'}>
                <Button variant="secondary" className="w-full justify-start bg-white/80 hover:bg-white border border-slate-200/50 text-slate-700 hover:text-indigo-700 h-9 text-xs font-medium shadow-sm hover:shadow transition-all">
                    <Users className="w-3.5 h-3.5 ml-2" />
                    רישום תלמיד
                </Button>
            </Link>
            <Link to={createPageUrl('Messages')}>
                <Button variant="secondary" className="w-full justify-start bg-white/80 hover:bg-white border border-slate-200/50 text-slate-700 hover:text-indigo-700 h-9 text-xs font-medium shadow-sm hover:shadow transition-all">
                    <MessageCircle className="w-3.5 h-3.5 ml-2" />
                    שליחת הודעה
                </Button>
            </Link>
            <Link to={createPageUrl('Courses')}>
                <Button variant="secondary" className="w-full justify-start bg-white/80 hover:bg-white border border-slate-200/50 text-slate-700 hover:text-indigo-700 h-9 text-xs font-medium shadow-sm hover:shadow transition-all">
                    <FileBarChart className="w-3.5 h-3.5 ml-2" />
                    דוח קורס
                </Button>
            </Link>
            <Link to={createPageUrl('Assignments')}>
                <Button variant="secondary" className="w-full justify-start bg-white/80 hover:bg-white border border-slate-200/50 text-slate-700 hover:text-indigo-700 h-9 text-xs font-medium shadow-sm hover:shadow transition-all">
                    <ClipboardList className="w-3.5 h-3.5 ml-2" />
                    דוח מטלה
                </Button>
            </Link>
            <Link to={createPageUrl('Sessions')}>
                <Button variant="secondary" className="w-full justify-start bg-white/80 hover:bg-white border border-slate-200/50 text-slate-700 hover:text-indigo-700 h-9 text-xs font-medium shadow-sm hover:shadow transition-all">
                    <PieChart className="w-3.5 h-3.5 ml-2" />
                    דוח מפגש
                </Button>
            </Link>
        </CardContent>
        </Card>
    );
}

// --- 5. Student Progress Widget (Phase 1) ---
export const StudentProgressWidget = ({ student }) => {
    if (!student) return null;
    
    const progress = student.progress || { overall: 0, activities_completed: 0 };
    
    return (
        <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-2 border-b border-slate-50">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        ההתקדמות שלי
                    </CardTitle>
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100">
                        {progress.overall}% הושלם
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-slate-500 font-medium">התקדמות כללית בקורס</span>
                            <span className="text-slate-700 font-bold">{progress.overall}/100</span>
                        </div>
                        <Progress value={progress.overall} className="h-2 bg-slate-100" indicatorClassName="bg-gradient-to-r from-blue-500 to-violet-500" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-slate-800">{progress.activities_completed || 0}</p>
                            <p className="text-xs text-slate-500">פעילויות שהושלמו</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-slate-800">{progress.sessions_completed || 0}</p>
                            <p className="text-xs text-slate-500">מפגשים שהסתיימו</p>
                        </div>
                    </div>

                    <Link to={createPageUrl('StudentProfile') + `?id=${student.id}`}>
                        <Button variant="outline" size="sm" className="w-full text-xs border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                            לפרופיל המלא
                            <ArrowLeft className="w-3 h-3 mr-1" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};

// --- 6. Competency Radar Widget (Phase 2) ---
export const CompetencyRadarWidget = ({ student, competencyNames }) => {
    if (!student || !student.competencies) return null;
    
    // Transform competencies object {id: score} to array [{subject: name, A: score, fullMark: 100}]
    const data = Object.entries(student.competencies).map(([id, score]) => ({
        subject: competencyNames[id] || 'מיומנות', // Fallback name
        A: score,
        fullMark: 100
    }));

    if (data.length === 0) return null; // Don't show if no data

    return (
        <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
            <CardHeader className="pb-2 border-b border-slate-50">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                    <TrendingUp className="w-4 h-4 text-violet-500" />
                    מפת מיומנויות
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px] flex items-center justify-center pt-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="שליטה"
                        dataKey="A"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="#8b5cf6"
                        fillOpacity={0.3}
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#475569', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};