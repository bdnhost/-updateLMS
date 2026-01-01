import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { 
  User, Mail, Phone, BookOpen, GraduationCap, Clock, TrendingUp,
  CheckCircle2, XCircle, AlertCircle, Bell, ExternalLink, MessageCircle,
  FolderOpen, FileText, Download, Paperclip, Share2, MessageSquare,
  LayoutDashboard, MoreVertical, ChevronDown, Calendar, Trophy,
  Sparkles, Zap, Target, Award, Mic, Video, Presentation
} from 'lucide-react';
import { format, differenceInDays, differenceInHours, differenceInMinutes, isAfter } from 'date-fns';
import { he } from 'date-fns/locale';
import NextLessonTeaser from './NextLessonTeaser';
import TasksTeaser from './TasksTeaser';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function PublicStudentView({ resource }) {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { 
    attendance_records: attendance = [], 
    grade_records: grades = [], 
    course_assignments: assignments = [],
    course_announcements: announcements = [],
    course_sessions: sessions = [],
    course_events: events = [],
    enrolled_courses = [],
    active_course_id,
    course_name,
    student = resource
  } = resource;

  const handleCourseChange = (courseId) => {
      const url = new URL(window.location.href);
      url.searchParams.set('course_id', courseId);
      window.location.href = url.toString();
  };

  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const latestAnnouncement = useMemo(() => {
      if (!announcements || announcements.length === 0) return null;
      return announcements
          .filter(a => !a.expiration_date || new Date(a.expiration_date) > new Date())
          .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
  }, [announcements]);

  React.useEffect(() => {
      if (latestAnnouncement) {
          setShowAnnouncement(true);
          const timer = setTimeout(() => {
              setShowAnnouncement(false);
          }, 3000); 
          return () => clearTimeout(timer);
      }
  }, [latestAnnouncement]);

  const nextLesson = useMemo(() => {
    if (!events || events.length === 0) return null;
    const now = new Date();
    const futureEvents = events
        .filter(e => {
            if (!e.date) return false;
            const date = new Date(e.date + 'T' + (e.start_time || '00:00'));
            return !isNaN(date.getTime()) && date > now;
        })
        .sort((a, b) => {
            const dateA = new Date(a.date + 'T' + (a.start_time || '00:00'));
            const dateB = new Date(b.date + 'T' + (b.start_time || '00:00'));
            return dateA - dateB;
        });
    
    return futureEvents.length > 0 ? futureEvents[0] : null;
  }, [events]);

  const nextAssignment = useMemo(() => {
      if (!assignments) return null;
      const now = new Date();
      const upcoming = assignments
          .filter(a => {
              if (a.status === 'closed' || !a.due_date) return false;
              const date = new Date(a.due_date);
              return !isNaN(date.getTime()) && date > now;
          })
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
      return upcoming.length > 0 ? upcoming[0] : null;
  }, [assignments]);

  const handleSendMessage = async () => {
      if (!messageContent.trim()) {
          toast.error('נא להזין תוכן להודעה');
          return;
      }

      setIsSending(true);
      try {
          const res = await base44.functions.invoke('sendPublicMessageToTeacher', {
              studentId: resource.id,
              message: messageContent,
              senderContact: senderContact
          });
          
          if (res.data?.success) {
              toast.success('ההודעה נשלחה בהצלחה');
              setIsContactOpen(false);
              setMessageContent('');
              setSenderContact('');
          } else {
              toast.error('שגיאה בשליחת ההודעה');
          }
      } catch (error) {
          toast.error('שגיאה בשליחת ההודעה');
      } finally {
          setIsSending(false);
      }
  };

  const attendanceStats = useMemo(() => {
    if (!attendance || attendance.length === 0) return { present: 0, total: 0, percentage: 0 };
    const present = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    return {
      present,
      total: attendance.length,
      percentage: Math.round((present / attendance.length) * 100)
    };
  }, [attendance]);

  const assignmentsWithGrades = useMemo(() => {
    if (!assignments) return [];
    return assignments.map(assignment => {
      const grade = grades?.find(g => g.assignment_id === assignment.id);
      return { ...assignment, grade };
    });
  }, [assignments, grades]);

  const gradeAverage = useMemo(() => {
    if (!grades || grades.length === 0) return 0;
    const sum = grades.reduce((acc, curr) => acc + (curr.score || 0), 0);
    return Math.round(sum / grades.length);
  }, [grades]);

  const messages = resource.student_messages || [];

  const formatMessageContent = (content) => {
    if (!content) return '';
    let formatted = content;
    formatted = formatted.replace(/{{\s*course_name\s*}}/g, course_name || 'הקורס');
    formatted = formatted.replace(/{{\s*student_name\s*}}/g, resource.full_name || 'תלמיד');
    const link = window.location.href;
    formatted = formatted.replace(/{{\s*student_public_link\s*}}/g, link);
    formatted = formatted.replace(/{{\s*session_.*?\s*}}/g, '');
    return formatted;
  };

  // Helper to determine a numeric session index if available
  const getSessionNumber = (s) => {
    if (!s) return undefined;
    const candidates = ['session_number', 'sessionNum', 'number', 'order', 'position', 'index'];
    for (const key of candidates) {
      if (s[key] !== undefined && s[key] !== null && !isNaN(Number(s[key]))) return Number(s[key]);
    }
    const m = (s.title || '').match(/(\d+)/);
    if (m) return Number(m[1]);
    return undefined;
  };

  const sortedSessions = useMemo(() => {
    if (!sessions) return [];
    const arr = Array.isArray(sessions) ? [...sessions] : [];
    arr.sort((a, b) => {
      const na = getSessionNumber(a);
      const nb = getSessionNumber(b);
      const finiteA = Number.isFinite(na);
      const finiteB = Number.isFinite(nb);
      if (finiteA && finiteB) return na - nb;
      if (finiteA) return -1;
      if (finiteB) return 1;
      return 0;
    });
    return arr;
  }, [sessions]);

  const sortedAnnouncements = useMemo(() => {
    if (!announcements) return [];
    const arr = Array.isArray(announcements) ? [...announcements] : [];
    arr.sort((a, b) => {
      const da = a?.created_date ? new Date(a.created_date) : null;
      const db = b?.created_date ? new Date(b.created_date) : null;
      const validA = da && !isNaN(da.getTime());
      const validB = db && !isNaN(db.getTime());
      if (validA && validB) return da - db; // oldest first
      if (validA) return -1;
      if (validB) return 1;
      return 0;
    });
    return arr;
  }, [announcements]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-cyan-50/20" dir="rtl">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6" dir="rtl">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border-0 shadow-2xl overflow-hidden bg-white rounded-3xl">
            <div className="relative h-40 md:h-48 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            <div className="px-6 md:px-10 pb-8">
              <div className="relative flex flex-col md:flex-row md:justify-between md:items-end -mt-16 md:-mt-14 mb-6 gap-4">
                <div className="flex items-end gap-4">
                  <div className="relative">
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }}>
                      <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-white shadow-2xl bg-white">
                        <AvatarFallback className="text-4xl md:text-5xl bg-gradient-to-br from-violet-100 to-purple-100 text-violet-700 font-black">
                          {resource.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    {resource.course_logo_url && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring" }} className="absolute -bottom-2 -left-2 h-12 w-12 bg-white rounded-full shadow-xl border-4 border-white flex items-center justify-center overflow-hidden">
                          <img src={resource.course_logo_url} alt="Course" className="w-full h-full object-cover" />
                        </motion.div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {enrolled_courses.length > 1 ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-10 text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 border-2 border-slate-200 hover:border-indigo-300 shadow-md hover:shadow-lg transition-all">
                            <GraduationCap className="h-5 w-5 ml-2 text-indigo-600" />
                            <span className="font-bold">{course_name || 'בחר קורס'}</span>
                            <ChevronDown className="h-4 w-4 mr-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[250px] bg-white/95 backdrop-blur-xl border-2">
                          <div className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b">החלף קורס:</div>
                          {enrolled_courses.map(c => (
                            <DropdownMenuItem key={c.id} onClick={() => handleCourseChange(c.id)} className={'cursor-pointer text-base py-3 ' + (c.id === active_course_id ? "bg-indigo-50 text-indigo-700 font-bold" : "hover:bg-slate-50")}>
                              <CheckCircle2 className={'h-4 w-4 ml-2 text-indigo-600 ' + (c.id === active_course_id ? "opacity-100" : "opacity-0")} />
                              {c.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <div className="flex items-center gap-2 bg-gradient-to-r from-slate-100 to-slate-50 px-4 py-2 rounded-xl text-slate-700 border-2 border-slate-200 shadow-sm">
                        <GraduationCap className="h-5 w-5 text-indigo-600" />
                        <span className="font-bold">{course_name || 'ללא קורס'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-3 mb-2">
                  <Badge variant={resource.status === 'active' ? 'default' : 'secondary'} className={'text-sm px-4 py-1.5 shadow-lg ' + (resource.status === 'active' ? 'bg-gradient-to-r from-emerald-500 to-green-600' : '')}>
                    {resource.status === 'active' ? (<><CheckCircle2 className="h-4 w-4 ml-1" />פעיל</>) : 'לא פעיל'}
                  </Badge>
                  <Button variant="outline" size="default" onClick={() => setIsContactOpen(true)} className="gap-2 border-2 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-400 shadow-md hover:shadow-xl transition-all font-bold">
                    <MessageCircle className="h-5 w-5" />
                    צור קשר עם המורה
                  </Button>
                </div>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {resource.email && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform"><Mail className="h-5 w-5 text-blue-600" /></div>
                    <div><div className="text-xs text-slate-500 font-semibold">אימייל</div><div className="font-bold text-slate-800">{resource.email}</div></div>
                  </div>
                )}
                {resource.phone && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform"><Phone className="h-5 w-5 text-emerald-600" /></div>
                    <div><div className="text-xs text-slate-500 font-semibold">טלפון</div><div className="font-bold text-slate-800">{resource.phone}</div></div>
                  </div>
                )}
                {resource.department && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform"><BookOpen className="h-5 w-5 text-purple-600" /></div>
                    <div><div className="text-xs text-slate-500 font-semibold">מחלקה</div><div className="font-bold text-slate-800">{resource.department}</div></div>
                  </div>
                )}
              </motion.div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full flex-row-reverse justify-end bg-white/90 backdrop-blur-xl p-2 rounded-2xl border-2 border-slate-200 shadow-xl mb-6 h-auto flex-wrap gap-2 overflow-x-auto md:overflow-x-visible">
              <TabsTrigger value="overview" className="flex-none md:flex-1 min-w-[80px] md:min-w-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white font-bold rounded-xl text-xs md:text-sm"><LayoutDashboard className="h-3 w-3 md:h-4 md:w-4 ml-1" />ראשי</TabsTrigger>
              <TabsTrigger value="grades" className="flex-none md:flex-1 min-w-[80px] md:min-w-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white font-bold rounded-xl text-xs md:text-sm"><Trophy className="h-3 w-3 md:h-4 md:w-4 ml-1" />ציונים</TabsTrigger>
              <TabsTrigger value="syllabus" className="flex-none md:flex-1 min-w-[80px] md:min-w-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white font-bold rounded-xl text-xs md:text-sm"><BookOpen className="h-3 w-3 md:h-4 md:w-4 ml-1" />סילבוס</TabsTrigger>
              <TabsTrigger value="attendance" className="flex-none md:flex-1 min-w-[80px] md:min-w-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-amber-600 data-[state=active]:text-white font-bold rounded-xl text-xs md:text-sm"><Clock className="h-3 w-3 md:h-4 md:w-4 ml-1" />נוכחות</TabsTrigger>
              <TabsTrigger value="announcements" className="flex-none md:flex-1 min-w-[80px] md:min-w-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-pink-600 data-[state=active]:text-white font-bold rounded-xl text-xs md:text-sm"><Bell className="h-3 w-3 md:h-4 md:w-4 ml-1" />הכרזות</TabsTrigger>
              <TabsTrigger value="messages" className="flex-none md:flex-1 min-w-[80px] md:min-w-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-fuchsia-600 data-[state=active]:text-white font-bold rounded-xl text-xs md:text-sm"><MessageSquare className="h-3 w-3 md:h-4 md:w-4 ml-1" />הודעות</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {nextLesson && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-row-reverse"><NextLessonTeaser lesson={nextLesson} courseName={course_name} /></motion.div>}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-row-reverse"><TasksTeaser assignments={assignments} grades={grades} sessions={sessions} studentId={resource.id} /></motion.div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {nextAssignment && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-2xl transition-all overflow-hidden group">
                      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-red-500 to-rose-600" />
                      <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2 text-red-700"><div className="p-2 bg-white rounded-xl shadow-md group-hover:scale-110 transition-transform"><AlertCircle className="h-5 w-5 text-red-500" /></div>הגשה קרובה</CardTitle></CardHeader>
                      <CardContent>
                        <div className="mb-3 text-right"><div className="font-black text-slate-900 text-lg mb-1 line-clamp-1">{nextAssignment.title}</div><div className="text-sm text-slate-600 flex items-center gap-2 flex-row-reverse justify-end"><Calendar className="h-3 w-3" />{nextAssignment.due_date}</div></div>
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-red-700 bg-red-100 px-3 py-2 rounded-full shadow-sm flex-row-reverse"><Clock className="h-3 w-3" />{(() => {const date = new Date(nextAssignment.due_date); if (isNaN(date.getTime())) return 'תאריך לא תקין'; const diff = differenceInDays(date, new Date()); return diff === 0 ? 'היום!' : 'נותרו ' + diff + ' ימים';})()}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 via-amber-50 to-white hover:shadow-2xl transition-all overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-orange-500 to-amber-600" />
                    <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2 text-orange-700"><div className="p-2 bg-white rounded-xl shadow-md group-hover:scale-110 transition-transform"><Clock className="h-5 w-5 text-orange-500" /></div>נוכחות</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-end mb-3"><div className="text-4xl font-black text-slate-900 tracking-tight">{attendanceStats.percentage}%</div><div className="text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full shadow-sm">{attendanceStats.present}/{attendanceStats.total}</div></div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner"><motion.div initial={{ width: 0 }} animate={{ width: attendanceStats.percentage + '%' }} transition={{ delay: 0.6, duration: 1, ease: "easeOut" }} className={'h-full rounded-full ' + (attendanceStats.percentage < 80 ? 'bg-gradient-to-r from-orange-500 to-amber-600' : 'bg-gradient-to-r from-emerald-500 to-green-600')} /></div>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 via-cyan-50 to-white hover:shadow-2xl transition-all overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-cyan-600" />
                    <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2 text-blue-700"><div className="p-2 bg-white rounded-xl shadow-md group-hover:scale-110 transition-transform"><TrendingUp className="h-5 w-5 text-blue-500" /></div>ממוצע ציונים</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-end mb-3"><div className="text-4xl font-black text-slate-900 tracking-tight">{gradeAverage}</div><div className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full shadow-sm">ציון משוקלל</div></div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner"><motion.div initial={{ width: 0 }} animate={{ width: Math.min(gradeAverage, 100) + '%' }} transition={{ delay: 0.7, duration: 1, ease: "easeOut" }} className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full" /></div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="grades">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-100"><CardTitle className="flex items-center gap-3 text-xl"><div className="p-2 bg-white rounded-xl shadow-md"><Trophy className="h-6 w-6 text-blue-600" /></div>מטלות וציונים</CardTitle></CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {assignmentsWithGrades.map((item, idx) => (
                        <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex flex-col p-4 md:p-5 bg-gradient-to-r from-white to-slate-50 border-2 border-slate-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all group">
                          <div className="flex flex-col gap-4">
                            <div className="flex-1">
                              <h4 className="font-bold text-base md:text-lg text-slate-900 group-hover:text-blue-600 transition-colors text-right"><a href={'?type=assignment&id=' + item.id + '&student_id=' + resource.id} className="flex items-center gap-2 flex-row-reverse">{item.title}<ExternalLink className="w-3 h-3 md:w-4 md:h-4 opacity-0 group-hover:opacity-100 transition-opacity" /></a></h4>
                              <div className="flex flex-col sm:flex-row flex-wrap gap-2 text-xs md:text-sm text-slate-600 mt-2 text-right flex-row-reverse"><span className="flex items-center gap-1 flex-row-reverse"><Calendar className="w-3 h-3" />{item.due_date}</span><span className="flex items-center gap-1 flex-row-reverse"><Award className="w-3 h-3" />משקל: {item.weight}%</span></div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-end gap-3 md:gap-4">
                              {item.grade && typeof item.grade === 'object' ? (
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <div className="text-right">
                                      <div className="text-2xl md:text-3xl font-black text-slate-900 text-right">{item.grade?.score !== undefined ? item.grade.score : '-'}</div>
                                      {item.grade?.submission_date && <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1 flex-row-reverse justify-end"><CheckCircle2 className="w-3 h-3" />הוגש {item.grade.submission_date}</span>}
                                    </div>
                                    <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg">{item.grade?.score || '?'}</div>
                                  </div>
                                  {item.grade?.file_url && <a href={item.grade.file_url} target="_blank" rel="noreferrer" className="text-xs md:text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 hover:underline flex-row-reverse text-right"><Download className="w-3 h-3" />הורד קובץ</a>}
                                </div>
                              ) : <Badge variant="secondary" className="bg-slate-100 text-slate-600 px-3 md:px-4 py-2 text-xs md:text-sm w-fit">טרם הוגש</Badge>}
                            </div>
                          </div>
                          {item.grade?.feedback && <div className="mt-4 p-3 md:p-4 bg-blue-50 rounded-xl border-2 border-blue-100"><div className="flex items-start gap-2 text-xs md:text-sm text-right flex-row-reverse"><MessageCircle className="w-3 h-3 md:w-4 md:h-4 text-blue-600 mt-0.5 shrink-0" /><div><span className="font-bold text-blue-900">משוב מהמרצה: </span><span className="text-slate-700">{item.grade.feedback}</span></div></div></div>}
                        </motion.div>
                      ))}
                      {assignmentsWithGrades.length === 0 && <div className="text-center py-16 text-slate-500 bg-slate-50 rounded-2xl border-2 border-dashed"><Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="text-lg font-semibold">אין מטלות בקורס זה</p></div>}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="syllabus">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-100"><CardTitle className="flex items-center gap-3 text-xl"><div className="p-2 bg-white rounded-xl shadow-md"><BookOpen className="h-6 w-6 text-emerald-600" /></div>סילבוס הקורס</CardTitle></CardHeader>
                  <CardContent className="p-6">
                    {sortedSessions && sortedSessions.length > 0 ? (
                      <div className="space-y-4">
                        {sortedSessions.map((session, idx) => {
                          // מצא מטלות שקשורות לממפגש הזה
                          const relatedAssignments = assignments?.filter(a => a.session_id === session.id) || [];
                          // מצא חומרי לימוד שקשורים למפגש זה
                          const relatedMaterials = session.related_materials || [];
                          
                          return (
                            <motion.div key={session.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="p-5 bg-gradient-to-r from-white to-emerald-50 border-2 border-emerald-100 rounded-xl hover:shadow-lg hover:border-emerald-300 transition-all group">
                              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                                <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">{(getSessionNumber(session) ?? (idx + 1))}</div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-black text-lg text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors text-right">{session.title}</h4>
                                  {session.description && <p className="text-slate-600 text-sm leading-relaxed mb-3 text-right">{session.description}</p>}
                                  <div className="flex flex-wrap gap-2 mb-4 flex-row-reverse justify-end">
                                    {session.session_date && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 flex flex-row-reverse"><Calendar className="w-3 h-3 ml-1" />{session.session_date}</Badge>}
                                    {session.duration && <Badge className="bg-blue-100 text-blue-700 border-blue-200 flex flex-row-reverse"><Clock className="w-3 h-3 ml-1" />{session.duration} דקות</Badge>}
                                  </div>
                                  
                                  {/* קישורים למטלות קשורות */}
                                  {relatedAssignments.length > 0 && (
                                    <div className="mt-4 pt-4 border-t-2 border-emerald-100">
                                      <h5 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-2 text-right flex-row-reverse justify-end">
                                        <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                                        מטלות קשורות
                                      </h5>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {relatedAssignments.map((assignment) => (
                                          <a 
                                            key={assignment.id} 
                                            href={`?type=assignment&id=${assignment.id}&student_id=${resource.id}`}
                                            className="text-sm p-2 bg-emerald-100/50 hover:bg-emerald-200/70 rounded-lg border border-emerald-200 hover:border-emerald-400 transition-all flex items-center gap-2 group flex-row-reverse text-right"
                                          >
                                            <ExternalLink className="w-3 h-3 text-emerald-600 group-hover:scale-110 transition-transform" />
                                            <span className="text-emerald-700 font-semibold truncate hover:text-emerald-900">{assignment.title}</span>
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* חומרי לימוד קשורים */}
                                  {relatedMaterials.length > 0 && (
                                    <div className="mt-4 pt-4 border-t-2 border-emerald-100">
                                      <h5 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-2 text-right flex-row-reverse justify-end">
                                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                        חומרי לימוד
                                      </h5>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {relatedMaterials.map((material, mIdx) => {
                                          const getTypeColor = (type) => {
                                            switch(type) {
                                              case 'video': return 'text-red-600 bg-red-100 hover:bg-red-200';
                                              case 'presentation': return 'text-orange-600 bg-orange-100 hover:bg-orange-200';
                                              case 'document': return 'text-blue-600 bg-blue-100 hover:bg-blue-200';
                                              default: return 'text-slate-600 bg-slate-100 hover:bg-slate-200';
                                            }
                                          };
                                          
                                          const getTypeIcon = (type) => {
                                            switch(type) {
                                              case 'video': return Video;
                                              case 'presentation': return Presentation;
                                              case 'document': return FileText;
                                              default: return FileText;
                                            }
                                          };
                                          
                                          const getTypeLabel = (type) => {
                                            switch(type) {
                                              case 'video': return 'וידאו';
                                              case 'presentation': return 'מצגת';
                                              case 'document': return 'מסמך';
                                              default: return 'קובץ';
                                            }
                                          };
                                          
                                          const MaterialIcon = getTypeIcon(material.type);
                                          const colorClass = getTypeColor(material.type);
                                          const typeLabel = getTypeLabel(material.type);
                                          
                                          return (
                                            <a 
                                              key={mIdx} 
                                              href={material.url || '#'}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className={`text-sm p-2 rounded-lg border transition-all flex items-center gap-2 group flex-row-reverse text-right ${colorClass}`}
                                            >
                                              <MaterialIcon className="w-3 h-3 group-hover:scale-110 transition-transform shrink-0" />
                                              <span className="font-semibold truncate">{material.title || typeLabel}</span>
                                            </a>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : <div className="text-center py-16 text-slate-500 bg-emerald-50 rounded-2xl border-2 border-dashed border-emerald-200"><BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="text-lg font-semibold">אין מפגשים רשומים</p></div>}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="attendance">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b-2 border-orange-100"><CardTitle className="flex items-center gap-3 text-xl"><div className="p-2 bg-white rounded-xl shadow-md"><Clock className="h-6 w-6 text-orange-600" /></div>היסטוריית נוכחות</CardTitle></CardHeader>
                  <CardContent className="p-6">
                    {attendance && attendance.length > 0 ? (
                      <div className="space-y-3">{attendance.map((record, idx) => (
                        <motion.div key={record.id || idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 md:p-5 bg-gradient-to-r from-white to-orange-50 border-2 border-orange-100 rounded-xl hover:shadow-lg hover:border-orange-300 transition-all group">
                          <div className="flex items-center gap-3 md:gap-4 flex-row-reverse">
                            <div className={'w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-lg shrink-0 ' + (record.status === 'present' ? 'bg-gradient-to-br from-emerald-500 to-green-600' : record.status === 'late' ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-red-500 to-rose-600')}>
                              {record.status === 'present' ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-white" /> : record.status === 'late' ? <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" /> : <XCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />}
                            </div>
                            <div className="text-right">
                              <h4 className="font-bold text-sm md:text-base text-slate-900 text-right">{record.session_title || 'מפגש'}</h4>
                              <div className="text-xs md:text-sm text-slate-600 flex items-center gap-1 mt-0.5 md:mt-1 flex-row-reverse justify-end"><Calendar className="w-3 h-3" />{record.session_date || record.date}</div>
                            </div>
                          </div>
                          <Badge className={'text-xs md:text-sm py-1 md:py-1.5 ' + (record.status === 'present' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : record.status === 'late' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-red-100 text-red-700 border-red-200')}>
                            {record.status === 'present' ? 'נוכח' : record.status === 'late' ? 'איחור' : 'נעדר'}
                          </Badge>
                        </motion.div>
                      ))}</div>
                    ) : <div className="text-center py-16 text-slate-500 bg-orange-50 rounded-2xl border-2 border-dashed border-orange-200"><Clock className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="text-lg font-semibold">אין רישומי נוכחות</p></div>}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="announcements">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b-2 border-rose-100"><CardTitle className="flex items-center gap-3 text-xl"><div className="p-2 bg-white rounded-xl shadow-md"><Bell className="h-6 w-6 text-rose-600" /></div>הכרזות והודעות כלליות</CardTitle></CardHeader>
                  <CardContent className="p-6">
                    {sortedAnnouncements && sortedAnnouncements.length > 0 ? (
                      <div className="space-y-4">{sortedAnnouncements.map((announcement, idx) => (
                        <motion.div key={announcement.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="p-4 md:p-5 bg-gradient-to-r from-white to-rose-50 border-2 border-rose-100 rounded-xl hover:shadow-lg hover:border-rose-300 transition-all">
                          <div className="flex items-start gap-2 md:gap-3 mb-3 flex-row-reverse">
                            <div className="p-2 bg-rose-100 rounded-lg shrink-0"><Bell className="w-4 h-4 md:w-5 md:h-5 text-rose-600" /></div>
                            <div className="flex-1 min-w-0 text-right">
                              <h4 className="font-black text-base md:text-lg text-slate-900 mb-2 text-right">{announcement.title}</h4>
                              <p className="text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-wrap break-words text-right">{announcement.content}</p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row flex-wrap gap-2 text-xs text-slate-500 mt-3 pt-3 border-t border-rose-100 text-right flex-row-reverse justify-end">
                            <span className="flex items-center gap-1 flex-row-reverse"><Calendar className="w-3 h-3" />{announcement.created_date}</span>
                            {announcement.expiration_date && <span className="flex items-center gap-1 flex-row-reverse"><Clock className="w-3 h-3" />תוקף עד: {announcement.expiration_date}</span>}
                          </div>
                        </motion.div>
                      ))}</div>
                    ) : <div className="text-center py-16 text-slate-500 bg-rose-50 rounded-2xl border-2 border-dashed border-rose-200"><Bell className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="text-lg font-semibold">אין הכרזות חדשות</p></div>}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="messages">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-fuchsia-50 border-b-2 border-purple-100"><CardTitle className="flex items-center gap-3 text-xl"><div className="p-2 bg-white rounded-xl shadow-md"><MessageSquare className="h-6 w-6 text-purple-600" /></div>הודעות אישיות</CardTitle></CardHeader>
                  <CardContent className="p-6">
                    {messages && messages.length > 0 ? (
                      <div className="space-y-4">{messages.map((message, idx) => (
                        <motion.div key={message.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="p-4 md:p-5 bg-gradient-to-r from-white to-purple-50 border-2 border-purple-100 rounded-xl hover:shadow-lg hover:border-purple-300 transition-all">
                          <div className="flex items-start gap-2 md:gap-3 flex-row-reverse">
                            <div className="p-2 bg-purple-100 rounded-lg shrink-0"><MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-purple-600" /></div>
                            <div className="flex-1 min-w-0 text-right">
                              {message.subject && <h4 className="font-bold text-base md:text-lg text-slate-900 mb-2 text-right">{message.subject}</h4>}
                              <div className="text-sm md:text-base text-slate-700 leading-relaxed prose prose-sm max-w-none break-words text-right" dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content || message.message) }} />
                              <div className="flex flex-col sm:flex-row flex-wrap gap-2 text-xs text-slate-500 mt-3 pt-3 border-t border-purple-100 text-right flex-row-reverse justify-end">
                                <span className="flex items-center gap-1 flex-row-reverse"><Calendar className="w-3 h-3" />{message.sent_date || message.created_date}</span>
                                {message.sender_name && <span className="flex items-center gap-1 flex-row-reverse"><User className="w-3 h-3" />מאת: {message.sender_name}</span>}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}</div>
                    ) : <div className="text-center py-16 text-slate-500 bg-purple-50 rounded-2xl border-2 border-dashed border-purple-200"><MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="text-lg font-semibold">אין הודעות חדשות</p></div>}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-xl"><MessageCircle className="h-6 w-6 text-indigo-600" />שליחת הודעה למורה</DialogTitle><DialogDescription>ההודעה תישלח למורה הקורס ולמזכירות בית הספר.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4" dir="rtl">
            <div className="space-y-2"><Label className="font-bold">תוכן ההודעה</Label><Textarea placeholder="כתוב את הודעתך כאן..." value={messageContent} onChange={(e) => setMessageContent(e.target.value)} className="min-h-[120px] border-2" dir="rtl" /></div>
            <div className="space-y-2"><Label className="font-bold">פרטי קשר לחזרה (טלפון/אימייל)</Label><Input placeholder="איך לחזור אליך?" value={senderContact} onChange={(e) => setSenderContact(e.target.value)} className="border-2" dir="rtl" /></div>
          </div>
          <DialogFooter className="flex-row-reverse gap-2">
            <Button variant="outline" onClick={() => setIsContactOpen(false)}>ביטול</Button>
            <Button onClick={handleSendMessage} disabled={isSending} className="bg-gradient-to-r from-indigo-600 to-purple-600">{isSending ? 'שולח...' : 'שלח הודעה'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAnnouncement} onOpenChange={setShowAnnouncement}>
        <DialogContent className="sm:max-w-md border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50" dir="rtl">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-orange-800 text-xl"><Bell className="h-6 w-6 animate-pulse" />הודעה חדשה</DialogTitle></DialogHeader>
          <div className="py-4" dir="rtl"><h4 className="font-black text-xl text-slate-900 mb-3 text-right">{latestAnnouncement?.title}</h4><p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-right">{latestAnnouncement?.content}</p></div>
        </DialogContent>
      </Dialog>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:8px}.custom-scrollbar::-webkit-scrollbar-track{background:#f1f5f9;border-radius:10px}.custom-scrollbar::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#6366f1,#8b5cf6);border-radius:10px}`}</style>
    </div>
  );
}