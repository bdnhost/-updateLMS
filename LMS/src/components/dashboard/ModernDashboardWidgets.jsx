import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
    Users, GraduationCap, Calendar, CheckCircle2, 
    TrendingUp, AlertTriangle, MessageCircle, 
    ArrowUpRight, Clock, Plus, Zap, QrCode, FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

// --- 1. Welcome & Quick Stats Banner ---
export function WelcomeBanner({ user, stats }) {
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeOptions = { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit' };
    const dateOptions = { timeZone: 'Asia/Jerusalem', weekday: 'long', day: 'numeric', month: 'long' };
    
    const timeString = new Intl.DateTimeFormat('he-IL', timeOptions).format(currentTime);
    const dateString = new Intl.DateTimeFormat('he-IL', dateOptions).format(currentTime);
    
    // Determine greeting based on Jerusalem hour
    const jerusalemHour = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', hour: 'numeric', hour12: false }).format(currentTime));
    const greeting = jerusalemHour < 12 ? 'בוקר טוב' : jerusalemHour < 18 ? 'צהריים טובים' : 'ערב טוב';

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white p-8 shadow-xl mb-8">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                            {user?.role === 'admin' ? 'מנהל מערכת' : 'סגל הוראה'}
                        </Badge>
                        <span className="text-indigo-100 text-sm flex items-center gap-2">
                            <span>{dateString}</span>
                            <span className="w-1 h-1 bg-indigo-300 rounded-full"></span>
                            <span className="font-mono text-base">{timeString}</span>
                            <span className="text-xs opacity-75">(שעון ירושלים)</span>
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{greeting}, {user?.full_name?.split(' ')[0]} 👋</h1>
                    <p className="text-indigo-100 max-w-lg leading-relaxed opacity-90">
                        המערכת פעילה ומסונכרנת. יש לך {stats.todayEvents} אירועים היום ו-{stats.pendingTasks} משימות הדורשות תשומת לב.
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <Link to={createPageUrl('Courses')}>
                        <Button className="bg-white text-indigo-600 hover:bg-indigo-50 border-0 shadow-lg">
                            <GraduationCap className="w-4 h-4 ml-2" />
                            קורסים
                        </Button>
                    </Link>
                    <Link to={createPageUrl('Messages')}>
                        <Button className="bg-white/20 text-white hover:bg-white/30 border-0 backdrop-blur-md">
                            <MessageCircle className="w-4 h-4 ml-2" />
                            הודעות
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

// --- 2. Smart Stat Cards ---
export function StatCardsGrid({ stats }) {
    const cards = [
        {
            title: "תלמידים פעילים",
            value: stats.totalStudents,
            icon: Users,
            trend: "+12%",
            trendUp: true,
            color: "blue",
            desc: "מתוך סך כל הנרשמים",
            link: createPageUrl('Students')
        },
        {
            title: "נוכחות יומית",
            value: `${stats.dailyAttendance}%`,
            icon: CheckCircle2,
            trend: "+5%",
            trendUp: true,
            color: "emerald",
            desc: "ממוצע בכל הקורסים",
            link: createPageUrl('Attendance')
        },
        {
            title: "הודעות שנשלחו",
            value: stats.messagesCount,
            icon: MessageCircle,
            trend: "פעיל",
            trendUp: true,
            color: "violet",
            desc: "SMS ו-WhatsApp החודש",
            link: createPageUrl('Messages')
        },
        {
            title: "מטלות לבדיקה",
            value: stats.pendingGrades,
            icon: FileText,
            trend: "-2",
            trendUp: true,
            color: "orange",
            desc: "ממתינות למשוב",
            link: createPageUrl('Assignments')
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                >
                    <Link to={card.link}>
                        <Card className="border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl bg-${card.color}-50 text-${card.color}-600`}>
                                        <card.icon className="w-6 h-6" />
                                    </div>
                                    {card.trend && (
                                        <Badge variant="outline" className={`bg-${card.trendUp ? 'emerald' : 'red'}-50 text-${card.trendUp ? 'emerald' : 'red'}-700 border-0`}>
                                            {card.trend}
                                            {card.trendUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1 rotate-180" />}
                                        </Badge>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-slate-800 mb-1">{card.value}</h3>
                                    <p className="text-sm font-medium text-slate-500">{card.title}</p>
                                    <p className="text-xs text-slate-400 mt-1">{card.desc}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}

// --- 3. WhatsApp & System Health Widget ---
export function SystemHealthWidget({ whatsappStatus, qrCode }) {
    const isConnected = whatsappStatus === 'CONNECTED';
    
    return (
        <Card className={`overflow-hidden border-0 shadow-sm ${isConnected ? 'bg-gradient-to-br from-emerald-50 to-teal-50' : 'bg-gradient-to-br from-slate-50 to-orange-50'}`}>
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                    <Zap className={`w-4 h-4 ${isConnected ? 'text-emerald-600' : 'text-orange-500'}`} />
                    סטטוס מערכת
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`relative w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                            <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${isConnected ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                        </div>
                        <div>
                            <p className="font-bold text-slate-700">WhatsApp Bridge</p>
                            <p className="text-xs text-slate-500">{isConnected ? 'מחובר ומסונכרן' : 'נדרשת סריקה / מנותק'}</p>
                        </div>
                    </div>
                    <Link to={createPageUrl('Settings')}>
                         <Button size="sm" variant="outline" className="bg-white/50 hover:bg-white border-0">
                            {isConnected ? 'הגדרות' : 'חבר כעת'}
                         </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

// --- 4. Academic Pulse / At Risk Widget ---
export function AcademicPulseWidget({ atRiskStudents = [], pendingStudents = [], onApprove }) {
    const hasData = atRiskStudents.length > 0 || pendingStudents.length > 0;

    return (
        <Card className="h-full border-slate-100 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-50">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        דופק אקדמי
                        {(pendingStudents.length > 0) && <Badge className="bg-red-500 hover:bg-red-600 border-0">{pendingStudents.length}</Badge>}
                    </CardTitle>
                    <Link to={createPageUrl('Students')}>
                        <Button variant="ghost" size="sm" className="text-xs h-7">לכל התלמידים</Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                    {/* Pending Students Section */}
                    {pendingStudents.length > 0 && (
                        <>
                            <div className="bg-red-50/50 p-2 text-xs font-semibold text-red-600 px-4">ממתינים לאישור</div>
                            {pendingStudents.map((student) => (
                                <div key={student.id} className="p-3 bg-red-50/10 hover:bg-red-50/30 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-8 h-8 bg-red-100 text-red-700">
                                            <AvatarFallback className="text-xs">{student.full_name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{student.full_name}</p>
                                            <p className="text-[10px] text-red-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                נרשם: {format(new Date(student.created_date || student.registered_at), 'dd/MM')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button 
                                            size="sm" 
                                            onClick={() => onApprove(student.id)}
                                            className="h-7 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                        >
                                            אשר
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {/* At Risk Students Section */}
                    {atRiskStudents.length > 0 && (
                        <>
                            <div className="bg-orange-50/50 p-2 text-xs font-semibold text-orange-600 px-4">תשומת לב נדרשת</div>
                            {atRiskStudents.map((student, i) => (
                                <Link key={i} to={`${createPageUrl('StudentProfile')}?id=${student.id}`} className="block">
                                    <div className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8 bg-orange-100 text-orange-700">
                                                <AvatarFallback className="text-xs">{student.full_name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium text-slate-700 group-hover:text-orange-700 transition-colors">{student.full_name}</p>
                                                <p className="text-[10px] text-slate-400">{student.issue}</p>
                                            </div>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowUpRight className="w-4 h-4 text-slate-400" />
                                        </Button>
                                    </div>
                                </Link>
                            ))}
                        </>
                    )}

                    {!hasData && (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-20 text-emerald-500" />
                            מצוין! אין התראות חדשות.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// --- 5. Upcoming Schedule Widget ---
export function ScheduleWidget({ events = [] }) {
    const today = new Date();
    const todaysEvents = events.filter(e => 
        new Date(e.date).toDateString() === today.toDateString()
    ).sort((a,b) => a.start_time.localeCompare(b.start_time));

    return (
        <Card className="h-full border-slate-100 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-50">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                        <Calendar className="w-4 h-4 text-violet-500" />
                        סדר יום
                    </CardTitle>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal">
                        {format(today, 'd/MM')}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {todaysEvents.length > 0 ? (
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute top-4 bottom-4 right-[19px] w-[2px] bg-slate-100"></div>
                        
                        {todaysEvents.map((event, idx) => (
                            <Link 
                                key={idx} 
                                to={event.course_id ? `${createPageUrl('CourseProfile')}?id=${event.course_id}` : createPageUrl('Calendar')}
                                className="block"
                            >
                                <div className="relative p-4 pr-10 hover:bg-slate-50 transition-colors group cursor-pointer">
                                    <div className={`absolute right-[15px] top-6 w-2.5 h-2.5 rounded-full border-2 border-white ring-1 ${
                                        idx === 0 ? 'bg-violet-500 ring-violet-200' : 'bg-slate-300 ring-slate-100'
                                    } z-10`}></div>
                                    
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm group-hover:text-violet-700 transition-colors">{event.title}</h4>
                                            {event.course_name && (
                                                <div className="flex items-center gap-1 mt-0.5 text-xs text-indigo-600 font-medium">
                                                    <GraduationCap className="w-3 h-3" />
                                                    {event.course_name}
                                                </div>
                                            )}
                                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {event.location || 'כיתה ראשית'}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="bg-white group-hover:border-violet-200">
                                            {event.start_time}
                                        </Badge>
                                    </div>
                                    
                                    {idx === 0 && (
                                        <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                            <Link to={createPageUrl('QRAttendance')}>
                                                <Button size="sm" variant="secondary" className="h-6 text-[10px] px-2 bg-violet-50 text-violet-700 hover:bg-violet-100">
                                                    <QrCode className="w-3 h-3 ml-1" />
                                                    נוכחות
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        אין אירועים מתוכננים להיום
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// --- 6. Quick Actions ---
export function QuickActions() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             <Link to={createPageUrl('QRAttendance')}>
                <Button variant="outline" className="w-full h-auto py-3 flex flex-col gap-2 bg-white hover:bg-slate-50 hover:border-violet-200 group">
                    <QrCode className="w-5 h-5 text-slate-500 group-hover:text-violet-600 transition-colors" />
                    <span className="text-xs">נוכחות QR</span>
                </Button>
             </Link>
             <Link to={createPageUrl('Messages')}>
                <Button variant="outline" className="w-full h-auto py-3 flex flex-col gap-2 bg-white hover:bg-slate-50 hover:border-emerald-200 group">
                    <MessageCircle className="w-5 h-5 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                    <span className="text-xs">הודעה חדשה</span>
                </Button>
             </Link>
             <Link to={`${createPageUrl('Courses')}?action=new`}>
                <Button variant="outline" className="w-full h-auto py-3 flex flex-col gap-2 bg-white hover:bg-slate-50 hover:border-blue-200 group">
                    <Plus className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                    <span className="text-xs">קורס חדש</span>
                </Button>
             </Link>
             <Link to={createPageUrl('Calendar')}>
                <Button variant="outline" className="w-full h-auto py-3 flex flex-col gap-2 bg-white hover:bg-slate-50 hover:border-orange-200 group">
                    <Calendar className="w-5 h-5 text-slate-500 group-hover:text-orange-600 transition-colors" />
                    <span className="text-xs">יומן</span>
                </Button>
             </Link>
        </div>
    );
}