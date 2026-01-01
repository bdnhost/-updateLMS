import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Clock, Calendar, CheckSquare, ListTodo,
  Users, Video, FileText, QrCode, MessageSquare,
  Play, ChevronLeft, ChevronDown, Plus, BookOpen, AlertCircle,
  Download, ExternalLink, Settings, TrendingUp,
  PenTool, FileUp, Share2 } from
'lucide-react';
import { format, differenceInDays, isWithinInterval, isBefore, subHours } from 'date-fns';
import { he } from 'date-fns/locale';
import SessionWizard from '@/components/sessions/SessionWizard';
import SimpleMessageDialog from '@/components/common/SimpleMessageDialog';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function TeacherPedagogicalToolbox({
  course,
  sessions = [],
  events = [],
  students = [],
  materials = [],
  assignments = [],
  grades = [],
  messages = [],
  nextSession // This is likely a CalendarEvent
}) {
  const [showWizard, setShowWizard] = useState(false);
  const [showSMSDialog, setShowSMSDialog] = useState(false);
  const [smsTriggerType, setSmsTriggerType] = useState(null); // Track which smart button was clicked
  const [showPrepDialog, setShowPrepDialog] = useState(false);
  const [showTasksDialog, setShowTasksDialog] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleOpenSMS = (type) => {
    setSmsTriggerType(type);
    setShowSMSDialog(true);
  };

  // Calculate course readiness
  const hasSyllabus = sessions.length > 0;
  const hasStudents = students.length > 0;
  const readinessScore = (hasSyllabus ? 50 : 0) + (hasStudents ? 50 : 0);

  // Determine current state based on time
  const now = new Date();

  // Find current LIVE session
  const liveSession = events.find((e) => {
    if (e.type !== 'lesson') return false;
    const start = new Date(`${e.date}T${e.start_time}`);
    const end = new Date(`${e.date}T${e.end_time}`);
    return isWithinInterval(now, { start, end });
  });

  // Find LAST session (recently ended within 48 hours)
  const lastSession = events.
  filter((e) => e.type === 'lesson' && isBefore(new Date(`${e.date}T${e.end_time}`), now)).
  sort((a, b) => new Date(`${b.date}T${b.end_time}`) - new Date(`${a.date}T${a.end_time}`)).
  find((e) => {
    const endTime = new Date(`${e.date}T${e.end_time}`);
    return differenceInDays(now, endTime) <= 2;
  });

  const isLive = !!liveSession;

  // Find the linked CourseSession for the next session (if it exists)
  const activeSession = isLive ? liveSession : nextSession;
  const linkedSession = activeSession?.session_id ?
  sessions.find((s) => s.id === activeSession.session_id) :
  null;

  // Filter materials and assignments for the active/next session
  const sessionMaterials = activeSession ?
  materials.filter((m) => m.session_id === activeSession.session_id || linkedSession && m.session_id === linkedSession.id) :
  [];

  const sessionAssignments = activeSession ?
  assignments.filter((a) => a.session_id === activeSession.session_id || linkedSession && a.session_id === linkedSession.id) :
  [];

  const handleOpenPresentation = () => {
    const url = linkedSession?.presentation_url || activeSession?.presentation_url;
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.info('לא הוגדר קישור למצגת למפגש זה');
    }
  };

  const handleOpenQR = () => {
    // Navigate to QRAttendance page
    window.location.href = createPageUrl('QRAttendance');
  };

  // Calculate real stats for ongoing tasks
  const pendingGradingCount = grades.filter((g) =>
  g.submission_status === 'submitted' && (
  g.score === undefined || g.score === null)
  ).length;

  const recentMessagesCount = messages.filter((m) => {
    const messageDate = new Date(m.created_date);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return messageDate > sevenDaysAgo;
  }).length;

  // Quick Actions Panel based on context
  const renderContextualActions = () => {
    // 1. Course Setup
    if (!hasSyllabus || !hasStudents) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5" />
                        הקמת הקורס נדרשת
                    </h4>
                    <div className="space-y-2">
                        {!hasSyllabus &&
            <div className="flex items-center justify-between bg-white p-2 rounded border border-amber-100">
                                <span className="text-sm text-amber-900">עדיין לא הוגדרו מפגשים</span>
                                <Button size="sm" variant="outline" onClick={() => setShowWizard(true)}>
                                    אשף הקמת סילבוס
                                </Button>
                            </div>
            }
                        {!hasStudents &&
            <div className="flex items-center justify-between bg-white p-2 rounded border border-amber-100">
                                <span className="text-sm text-amber-900">אין תלמידים רשומים</span>
                                <Button size="sm" variant="outline" onClick={() => toast.info('עבור ללשונית "תלמידים" לייבוא')}>ייבוא תלמידים</Button>
                            </div>
            }
                        {/* New setup tasks */}
                        <div className="flex items-center justify-between bg-white p-2 rounded border border-amber-100 opacity-80">
                            <span className="text-sm text-amber-900">הגדרת מבנה ציונים (אופציונלי)</span>
                            <Button size="sm" variant="ghost" onClick={() => toast.info('ייפתח מסך הגדרת ציונים')}>הגדר</Button>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-700">
                        <span>מוכנות הקורס:</span>
                        <Progress value={readinessScore} className="h-2 w-24" />
                        <span>{readinessScore}%</span>
                    </div>
                </div>);

    }

    // 3. During Session
    if (isLive) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 animate-pulse-slow">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-green-800 flex items-center gap-2">
                            <Video className="w-5 h-5" />
                            שיעור פעיל כעת: {liveSession.title}
                        </h4>
                        <Badge variant="outline" className="bg-white text-green-700 border-green-300 animate-pulse">LIVE</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <Button className="bg-green-600 hover:bg-green-700 h-auto py-4 flex flex-col gap-1" onClick={handleOpenQR}>
                            <QrCode className="w-6 h-6" />
                            <span>פתח נוכחות (QR)</span>
                        </Button>
                        <Button variant="outline" className="bg-white border-green-200 hover:bg-green-100 h-auto py-4 flex flex-col gap-1 text-green-800" onClick={handleOpenPresentation}>
                            <Play className="w-6 h-6" />
                            <span>מצב מצגת</span>
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="flex-1 bg-white/50 text-green-800" onClick={() => setShowTasksDialog(true)}>
                            <ListTodo className="w-4 h-4 mr-2" />
                            ניהול תרגולים
                        </Button>
                        <Button size="sm" variant="ghost" className="flex-1 bg-white/50 text-green-800" onClick={() => window.open(course.whatsapp_group_link, '_blank')}>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            מענה לשאלות
                        </Button>
                    </div>
                </div>);

    }

    // 4. After Session (Recent past)
    if (lastSession) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-blue-800 flex items-center gap-2">
                            <CheckSquare className="w-5 h-5" />
                            סיכום מפגש: {lastSession.title}
                        </h4>
                        <span className="text-xs text-blue-600">הסתיים {format(new Date(lastSession.date), 'dd/MM')}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Button variant="outline" size="sm" className="justify-start gap-2 bg-white text-blue-700 hover:bg-blue-50" onClick={() => toast.info('ייפתח דיאלוג העלאת סיכום/הקלטה')}>
                            <FileUp className="w-4 h-4" />
                            העלאת סיכום/הקלטה
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start gap-2 bg-white text-blue-700 hover:bg-blue-50" onClick={() => toast.info('ייפתח מסך נוכחות')}>
                            <Users className="w-4 h-4" />
                            בדיקת/סגירת נוכחות
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start gap-2 bg-white text-blue-700 hover:bg-blue-50" onClick={() => setShowTasksDialog(true)}>
                            <ListTodo className="w-4 h-4" />
                            בדיקת מטלות
                        </Button>
                    </div>
                </div>);

    }

    // 2. Before Session (Next up)
    if (nextSession) {
      const daysUntil = differenceInDays(new Date(nextSession.date), new Date());
      const isSoon = daysUntil <= 2;

      return (
        <div className={`border rounded-lg p-4 mb-4 ${isSoon ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}>
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-600" />
                                המפגש הבא: {nextSession.title}
                            </h4>
                            <p className="text-sm text-slate-500 mt-1">
                                {format(new Date(nextSession.date), 'EEEE, d בMMMM', { locale: he })} בשעה {nextSession.start_time}
                            </p>
                        </div>
                        {isSoon && <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">מתקרב</Badge>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Button variant="outline" size="sm" className="justify-start gap-2 bg-white" onClick={() => setShowPrepDialog(true)}>
                            <BookOpen className="w-4 h-4 text-slate-500" />
                            חומרי הכנה
                            {sessionMaterials.length > 0 && <Badge variant="secondary" className="mr-auto text-[10px] h-5">{sessionMaterials.length}</Badge>}
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start gap-2 bg-white" onClick={() => setShowTasksDialog(true)}>
                            <ListTodo className="w-4 h-4 text-slate-500" />
                            משימות לשיעור
                            {sessionAssignments.length > 0 && <Badge variant="secondary" className="mr-auto text-[10px] h-5">{sessionAssignments.length}</Badge>}
                        </Button>
                        <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600 shadow-sm"
              onClick={() => handleOpenSMS('pre_session')}>

                            <MessageSquare className="w-4 h-4" />
                            שלח תזכורת חכמה
                        </Button>
                    </div>
                </div>);

    }

    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 text-center">
                <p className="text-slate-500 mb-2">אין מפגשים מתוכננים בקרוב</p>
                <Button onClick={() => setShowWizard(true)} className="bg-sky-600 text-primary-foreground px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 h-9">
                    <Plus className="w-4 h-4 mr-2" />
                    תכנן מפגש חדש
                </Button>
            </div>);

  };

  return (
    <>
            <Card className="border-t-4 border-t-indigo-600 shadow-sm transition-all duration-300">
                <CardHeader 
                    className="pb-2 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <CardTitle className="text-lg flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span>ארגז כלים למורה</span>
                            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                        <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                            Pedagogical Assistant
                        </span>
                    </CardTitle>
                </CardHeader>
                
                {isExpanded && (
                <CardContent className="animate-in slide-in-from-top-2 duration-300">
                    {renderContextualActions()}

                    {/* Ongoing Tasks */}
                    <div className="space-y-1 mt-4 pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">לטיפול שוטף</h5>
                            <Button variant="link" className="h-auto p-0 text-xs text-indigo-600" onClick={() => toast.info('ייפתח דוח התקדמות')}>
                                <TrendingUp className="w-3 h-3 mr-1" />
                                דוח התקדמות
                            </Button>
                        </div>
                        
                        {pendingGradingCount > 0 ?
            <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded cursor-pointer group" onClick={() => toast.info('עבור ללשונית "מטלות" לבדיקה')}>
                                <div className="flex items-center gap-3">
                                    <div className="bg-orange-100 p-1.5 rounded text-orange-600">
                                        <CheckSquare className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">
                                        {pendingGradingCount} מטלות ממתינות לבדיקה
                                    </span>
                                </div>
                                <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-indigo-400" />
                            </div> :

            <div className="flex items-center justify-between p-2 rounded opacity-50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-slate-100 p-1.5 rounded text-slate-400">
                                        <CheckSquare className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm text-slate-500">אין מטלות להיום</span>
                                </div>
                            </div>
            }

                        {recentMessagesCount > 0 ?
            <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded cursor-pointer group" onClick={() => toast.info('עבור ללשונית "תקשורת" לצפייה בהודעות')}>
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-1.5 rounded text-blue-600">
                                        <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">
                                        {recentMessagesCount} הודעות חדשות מהשבוע
                                    </span>
                                </div>
                                <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-indigo-400" />
                            </div> :

            <div className="flex items-center justify-between p-2 rounded opacity-50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-slate-100 p-1.5 rounded text-slate-400">
                                        <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm text-slate-500">אין הודעות חדשות</span>
                                </div>
                            </div>
            }
                    </div>
                </CardContent>
                )}
            </Card>

            <SessionWizard
        open={showWizard}
        onClose={() => setShowWizard(false)}
        courseId={course.id} />


            <SimpleMessageDialog
        open={showSMSDialog}
        onClose={() => setShowSMSDialog(false)}
        recipients={students}
        initialType={smsTriggerType === 'pre_session' ? 'sms' : 'whatsapp'}
        courseId={course.id}
        initialContent={!smsTriggerType && activeSession ? `תזכורת: השיעור ${activeSession.title} יתקיים ב${format(new Date(activeSession.date), 'dd/MM')} בשעה ${activeSession.start_time}. נא להכין את חומרי הלימוד.` : ''} />


            {/* Prep Materials Dialog */}
            <Dialog open={showPrepDialog} onOpenChange={setShowPrepDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>חומרי הכנה למפגש</DialogTitle>
                        <DialogDescription>{activeSession?.title}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 mt-4">
                        {sessionMaterials.length === 0 ?
            <p className="text-center text-slate-500 py-4">אין חומרי הכנה למפגש זה</p> :

            sessionMaterials.map((m) =>
            <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded ${m.type === 'video' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {m.type === 'video' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{m.title}</p>
                                            <p className="text-xs text-slate-500">{m.type}</p>
                                        </div>
                                    </div>
                                    {m.file_url &&
              <Button variant="ghost" size="sm" asChild>
                                            <a href={m.file_url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </Button>
              }
                                </div>
            )
            }
                    </div>
                </DialogContent>
            </Dialog>

             {/* Tasks Dialog */}
             <Dialog open={showTasksDialog} onOpenChange={setShowTasksDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>משימות ומטלות למפגש</DialogTitle>
                        <DialogDescription>{activeSession?.title}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 mt-4">
                        {sessionAssignments.length === 0 ?
            <p className="text-center text-slate-500 py-4">אין מטלות למפגש זה</p> :

            sessionAssignments.map((a) =>
            <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded">
                                            <CheckSquare className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{a.title}</p>
                                            <p className="text-xs text-slate-500">הגשה עד: {a.due_date ? format(new Date(a.due_date), 'dd/MM/yy') : '-'}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{a.status}</Badge>
                                </div>
            )
            }
                    </div>
                </DialogContent>
            </Dialog>
        </>);

}