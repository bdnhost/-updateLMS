import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Users, 
  Loader2,
  MessageSquare,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  FileAudio,
  Image as ImageIcon,
  ClipboardList,
  Activity,
  TrendingUp,
  Clock,
  BookOpen,
  FileText,
  Calendar,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

import { 
    SystemStatusGrid,
    CompactSchedule,
    QuickActionsSidebar,
    StudentProgressWidget,
    CompetencyRadarWidget
} from '@/components/dashboard/SmartWidgetsV2';

import EnhancedRecentActivity from '@/components/dashboard/EnhancedRecentActivity';
import EngagementChart from '@/components/dashboard/EngagementChart';
import SimpleMessageDialog from '@/components/common/SimpleMessageDialog';
import RecentAudioFiles from '@/components/dashboard/RecentAudioFiles';
import RecentMediaFiles from '@/components/dashboard/RecentMediaFiles';
import RecentAssignments from '@/components/dashboard/RecentAssignments';
import RecentMaterials from '@/components/dashboard/RecentMaterials';
import AttendanceTrendChart from '@/components/dashboard/AttendanceTrendChart';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedApprovedStudent, setSelectedApprovedStudent] = useState(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  const { data: currentUser } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: organization } = useQuery({
    queryKey: ['dashboardOrg', currentUser?.organization_id],
    queryFn: () => base44.entities.Organization.get(currentUser.organization_id),
    enabled: !!currentUser?.organization_id
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'בוקר טוב', icon: Sunrise, gradient: 'from-amber-400 to-orange-500' };
    if (hour >= 12 && hour < 17) return { text: 'צהריים טובים', icon: Sun, gradient: 'from-yellow-400 to-orange-400' };
    if (hour >= 17 && hour < 21) return { text: 'ערב טוב', icon: Sunset, gradient: 'from-orange-400 to-pink-500' };
    return { text: 'לילה טוב', icon: Moon, gradient: 'from-indigo-400 to-purple-500' };
  };
  
  const { data: students, isLoading: studentsLoading } = useQuery({ 
    queryKey: ['students', currentUser?.organization_id], 
    queryFn: async () => {
        if (!currentUser?.organization_id) return [];
        return base44.entities.Student.filter({ organization_id: currentUser.organization_id }, undefined, 1000);
    },
    enabled: !!currentUser?.organization_id
  });

  const { data: attendance } = useQuery({ 
      queryKey: ['attendance_stats', currentUser?.organization_id], 
      queryFn: () => currentUser?.organization_id ? base44.entities.Attendance.filter({ organization_id: currentUser.organization_id }, undefined, 500) : [],
      enabled: !!currentUser?.organization_id
  });

  const { data: appSettings } = useQuery({ queryKey: ['dashboard_settings'], queryFn: () => base44.entities.AppSetting.list() });

  const { data: courses } = useQuery({ 
    queryKey: ['dashboard_courses', currentUser?.organization_id], 
    queryFn: async () => {
        if (!currentUser?.organization_id) return [];
        return base44.entities.Course.filter({ organization_id: currentUser.organization_id });
    },
    enabled: !!currentUser?.organization_id
  });

  const { data: events } = useQuery({
    queryKey: ['dashboard_events', courses, currentUser?.organization_id],
    queryFn: async () => {
       if (!currentUser?.organization_id) return [];
       const now = new Date();
       
       const events = await base44.entities.CalendarEvent.filter({ 
           organization_id: currentUser.organization_id,
           date: { $gte: now.toISOString().split('T')[0] } 
       });
       
       const visibleCourseIds = courses?.map(c => c.id) || [];
       const filteredEvents = currentUser?.role === 'admin' ? events : events.filter(e => visibleCourseIds.includes(e.course_id));

       return filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    enabled: !!courses && !!currentUser?.organization_id
  });
  
  const { data: grades } = useQuery({ 
    queryKey: ['dashboard_grades', currentUser?.organization_id, students], 
    queryFn: async () => {
        if (!currentUser?.organization_id) return [];
        
        if (currentUser.role === 'admin') {
            const orgGrades = await base44.entities.Grade.filter({ organization_id: currentUser.organization_id });
            return orgGrades.filter(g => g.submission_status === 'submitted');
        }
        
        const myStudent = students?.[0];
        if (myStudent) {
            return base44.entities.Grade.filter({ student_id: myStudent.id });
        }
        return [];
    },
    enabled: !!currentUser?.organization_id
  });

  const { data: messages } = useQuery({ 
    queryKey: ['dashboard_messages', currentUser?.organization_id, students], 
    queryFn: async () => {
        if (!currentUser?.organization_id) return [];
        
        const orgMessages = await base44.entities.Message.filter({ organization_id: currentUser.organization_id }, '-created_date', 20);

        if (currentUser.role === 'admin') {
            return orgMessages.slice(0, 5);
        }
        
        const myStudent = students?.[0];
        if (myStudent) {
            return orgMessages.filter(m => m.student_ids && m.student_ids.includes(myStudent.id)).slice(0, 5);
        }
        return [];
    },
    enabled: !!currentUser?.organization_id
  });

  const [prevInboundCount, setPrevInboundCount] = useState(0);
  
  const { data: inboundMessages } = useQuery({
    queryKey: ['inbound_messages_poll', currentUser?.organization_id],
    queryFn: async () => {
         if (!currentUser?.organization_id) return [];
         return base44.entities.Message.filter({ 
             organization_id: currentUser.organization_id,
             direction: 'inbound'
         }, '-created_date', 20);
    },
    enabled: !!currentUser?.organization_id && currentUser?.role === 'admin',
    refetchInterval: 10000,
  });

  React.useEffect(() => {
      if (!inboundMessages) return;
      
      const unreadCount = inboundMessages.filter(m => !m.is_read).length;
      
      if (unreadCount > prevInboundCount) {
          const audio = new Audio('https://cdn.freesound.org/previews/352/352651_4019029-lq.mp3');
          audio.volume = 0.5;
          audio.play().catch(e => console.log("Audio play failed", e));
      }
      
      setPrevInboundCount(unreadCount);
  }, [inboundMessages]);
  
  const { data: competencies } = useQuery({ queryKey: ['competencies'], queryFn: () => base44.entities.Competency.list() });

  const approveStudentMutation = useMutation({
    mutationFn: (studentId) => base44.entities.Student.update(studentId, { status: 'active' }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['students']);
      setShowApprovalDialog(false);
      setSelectedApprovedStudent(data);
      setShowMessageDialog(true);
    }
  });

  const stats = useMemo(() => {
    if (!students || !attendance || !events || !courses) return {
      activeStudents: 0,
      pendingStudents: 0,
      activeCourses: 0,
      atRiskStudents: [],
      upcomingEvents: [],
      pendingGrades: 0,
      unreadMessages: 0,
      unreadInbound: 0,
      waStatus: 'DISCONNECTED',
      competencyMap: {}
    };

    const atRiskStudents = students
        .filter(s => s.status === 'active')
        .map(s => {
             const studentAttendance = attendance.filter(a => a.student_id === s.id);
             const rate = studentAttendance.length > 0 
                ? Math.round((studentAttendance.filter(a => a.status === 'present').length / studentAttendance.length) * 100)
                : 100;
             return { ...s, attendance_rate: rate };
        })
        .filter(s => s.attendance_rate < 75)
        .sort((a, b) => a.attendance_rate - b.attendance_rate);

    const enrichedEvents = events.map(evt => ({
        ...evt,
        course_name: courses?.find(c => c.id === evt.course_id)?.name
    }));

    const waStatus = appSettings?.find(s => s.key === 'whatsapp_status')?.value || 'DISCONNECTED';

    return {
      activeStudents: students.filter(s => s.status === 'active').length,
      pendingStudents: students.filter(s => s.status === 'pending').length,
      activeCourses: courses?.filter(c => c.status === 'active').length || 0,
      atRiskStudents,
      upcomingEvents: enrichedEvents,
      pendingGrades: grades?.length || 0,
      unreadMessages: messages?.filter(m => !m.is_read).length || 0,
      unreadInbound: inboundMessages?.filter(m => !m.is_read).length || 0,
      waStatus,
      competencyMap: competencies?.reduce((acc, comp) => ({ ...acc, [comp.id]: comp.name }), {}) || {}
    };
  }, [students, attendance, events, courses, grades, messages, inboundMessages, appSettings, competencies]);
  
  const pendingStudentList = useMemo(() => students?.filter(s => s.status === 'pending') || [], [students]);

  if (studentsLoading || !stats) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/20 to-cyan-50/30">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-cyan-50/30 pb-20" dir="rtl">

      <header className="bg-white/80 border-b border-slate-200 sticky top-0 z-30 shadow-sm backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  {organization?.logo_url && (
                      <div className="relative group">
                          <div className={`absolute -inset-1 bg-gradient-to-r ${greeting.gradient} rounded-xl opacity-0 group-hover:opacity-75 blur transition duration-300`}></div>
                          <img 
                              src={organization.logo_url} 
                              alt="Logo" 
                              className="relative h-12 w-12 object-contain rounded-lg border border-slate-200 bg-white p-1 shadow-sm" 
                          />
                      </div>
                  )}
                  <div>
                      <div className="flex items-center gap-2 mb-0.5">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${greeting.gradient} flex items-center justify-center shadow-md`}>
                              <GreetingIcon className="w-4 h-4 text-white" />
                          </div>
                          <h1 className="text-lg font-bold text-slate-900">
                              {greeting.text}, {currentUser?.full_name || 'אורח'}
                          </h1>
                      </div>
                      <p className="text-xs text-slate-500 mr-10">
                          {format(new Date(), 'dd בMMMM yyyy', { locale: he })}
                      </p>
                  </div>
              </div>
              <div className="flex gap-3">
                   {stats.pendingStudents > 0 && (
                        <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowApprovalDialog(true)}
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0 shadow-lg shadow-orange-500/30 animate-pulse"
                        >
                            <Users className="w-4 h-4 ml-2" />
                            {stats.pendingStudents} ממתינים
                        </Button>
                   )}
              </div>
          </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div className="mb-2">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Zap className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">סקירה מערכתית</h2>
            </div>
            <SystemStatusGrid stats={stats} />
        </div>

        {currentUser?.role !== 'admin' && students?.find(s => s.email === currentUser?.email) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <StudentProgressWidget student={students.find(s => s.email === currentUser?.email)} />
                <CompetencyRadarWidget 
                    student={students.find(s => s.email === currentUser?.email)} 
                    competencyNames={stats.competencyMap} 
                />
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* חומרי לימוד - מעוצב */}
            <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                <div className="relative bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden h-[420px] flex flex-col transition-all duration-300 hover:shadow-2xl">
                    {/* Header מעוצב */}
                    <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-white font-bold text-lg">חומרי לימוד</h3>
                        </div>
                        <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
                            <FileText className="h-3 w-3 ml-1" />
                            חדש
                        </Badge>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar" dir="rtl">
                        <RecentMaterials organizationId={currentUser?.organization_id} />
                    </div>
                </div>
            </div>

            <CompactSchedule events={stats.upcomingEvents} />
            <QuickActionsSidebar />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <EngagementChart organizationId={currentUser?.organization_id} />
            <AttendanceTrendChart organizationId={currentUser?.organization_id} />
        </div>

        {/* טיזרים משופרים */}
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">עדכונים אחרונים</h2>
                </div>
                <Badge className="bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border-0 shadow-sm">
                    <Clock className="h-3 w-3 ml-1" />
                    עדכון אוטומטי
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* טיזר אודיו/מדיה - עם יישור לימין */}
                <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                    <div className="relative bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden h-[420px] flex flex-col transition-all duration-300 hover:shadow-2xl">
                        {/* Header מעוצב */}
                        <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <FileAudio className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-white font-bold text-lg">מדיה</h3>
                            </div>
                            <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
                                <Activity className="h-3 w-3 ml-1" />
                                חדש
                            </Badge>
                        </div>

                        <Tabs defaultValue="audio" className="flex-1 flex flex-col" dir="rtl">
                            <TabsList className="w-full bg-slate-50 p-1.5 grid grid-cols-2 shrink-0 m-0 rounded-none border-b border-slate-200">
                                <TabsTrigger 
                                    value="audio" 
                                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg transition-all"
                                >
                                    <FileAudio className="h-4 w-4 ml-2" />
                                    אודיו
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="media" 
                                    className="data-[state=active]:bg-white data-[state=active]:text-cyan-600 data-[state=active]:shadow-sm rounded-lg transition-all"
                                >
                                    <ImageIcon className="h-4 w-4 ml-2" />
                                    תמונות
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="audio" className="p-0 m-0 flex-1 overflow-y-auto custom-scrollbar text-right" dir="rtl">
                                <div className="text-right" dir="rtl">
                                    <RecentAudioFiles organizationId={currentUser?.organization_id} />
                                </div>
                            </TabsContent>
                            <TabsContent value="media" className="p-0 m-0 flex-1 overflow-y-auto custom-scrollbar text-right" dir="rtl">
                                <div className="text-right" dir="rtl">
                                    <RecentMediaFiles organizationId={currentUser?.organization_id} />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* טיזר מטלות */}
                <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                    <div className="relative bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden h-[420px] flex flex-col transition-all duration-300 hover:shadow-2xl">
                        {/* Header מעוצב */}
                        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <ClipboardList className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-white font-bold text-lg">מטלות</h3>
                            </div>
                            <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
                                {stats.pendingGrades}
                            </Badge>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar" dir="rtl">
                            <RecentAssignments organizationId={currentUser?.organization_id} />
                        </div>
                    </div>
                </div>

                {/* טיזר פעילות */}
                <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                    <div className="relative bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden h-[420px] flex flex-col transition-all duration-300 hover:shadow-2xl">
                        {/* Header מעוצב */}
                        <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <Activity className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-white font-bold text-lg">פעילות</h3>
                            </div>
                            <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
                                <MessageSquare className="h-3 w-3 ml-1" />
                                עדכונים
                            </Badge>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar" dir="rtl">
                            <EnhancedRecentActivity organizationId={currentUser?.organization_id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>

      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent dir="rtl">
            <DialogHeader>
                <DialogTitle>אישור תלמידים ממתינים</DialogTitle>
                <DialogDescription>
                    ישנם {pendingStudentList.length} תלמידים הממתינים לאישור הצטרפות.
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[300px] mt-4">
                <div className="space-y-4">
                    {pendingStudentList.map(student => (
                        <div key={student.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 hover:shadow-md group">
                            <div className="text-right">
                                <p className="font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">{student.full_name}</p>
                                <p className="text-sm text-slate-500">{student.email}</p>
                            </div>
                            <Button 
                                size="sm" 
                                onClick={() => approveStudentMutation.mutate(student.id)} 
                                disabled={approveStudentMutation.isPending}
                                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md"
                            >
                                {approveStudentMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    'אשר'
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </DialogContent>
      </Dialog>

      <SimpleMessageDialog 
        isOpen={showMessageDialog}
        onClose={() => setShowMessageDialog(false)}
        recipientName={selectedApprovedStudent?.full_name}
        recipientId={selectedApprovedStudent?.id}
        defaultSubject="ברוכים הבאים!"
        defaultContent={`שלום ${selectedApprovedStudent?.full_name},\n\nשמחים לבשר לך שחשבונך אושר בהצלחה!`}
      />

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #a855f7);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #9333ea);
        }
      `}</style>

    </div>
  );
}