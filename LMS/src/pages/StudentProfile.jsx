import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  GraduationCap,
  MessageSquare,
  FileText,
  FolderOpen,
  ArrowRight,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Download,
  ExternalLink,
  Eye,
  Share2,
  Send,
  LayoutDashboard,
  Paperclip,
  MoreVertical,
  Activity,
  MousePointerClick,
  Award,
  Video,
  Presentation } from
'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger } from
"@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import UnifiedMessageDialog from '@/components/common/UnifiedMessageDialog';
import StudentWhatsAppView from '@/components/students/StudentWhatsAppView';
import SubmissionDetailsDialog from '@/components/students/SubmissionDetailsDialog';
import StudentForm from '@/components/students/StudentForm';
import UnifiedSubmissionsView from '@/components/students/UnifiedSubmissionsView';

export default function StudentProfile() {
  const [activeTab, setActiveTab] = useState('overview');
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [messageType, setMessageType] = useState('email');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const queryClient = useQueryClient();

  // Get student ID from URL
  const queryParams = new URLSearchParams(window.location.search);
  const studentId = queryParams.get('id');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: ['student', studentId, user?.organization_id],
    queryFn: async () => {
      const s = await base44.entities.Student.get(studentId);
      // Security check: Ensure student belongs to current user's org (if user is not super-admin/student self-view logic isn't bypassing this)
      // If current user is Admin, they must be in same org.
      if (user?.role === 'admin' && s.organization_id !== user.organization_id) {
        throw new Error("Unauthorized access to student from another organization");
      }
      return s;
    },
    enabled: !!studentId && !!user
  });

  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Initialize selectedCourseId when student loads
  React.useEffect(() => {
    if (student && !selectedCourseId) {
      setSelectedCourseId(student.course_id || student.course_ids && student.course_ids[0]);
    }
  }, [student, selectedCourseId]);

  const { data: allCourses } = useQuery({
    queryKey: ['courses', user?.organization_id],
    queryFn: () => base44.entities.Course.filter({ organization_id: user?.organization_id }),
    enabled: !!user?.organization_id
  });

  // Use allCourses to derive enrolled courses for UI logic
  const enrolledCourses = useMemo(() => {
    if (!student || !allCourses) return [];
    const ids = [...new Set([student.course_id, ...(student.course_ids || [])].filter(Boolean))];
    return allCourses.filter((c) => ids.includes(c.id));
  }, [student, allCourses]);

  const studentCourses = useMemo(() => {
    if (!student || !allCourses) return [];
    const ids = [...new Set([student.course_id, ...(student.course_ids || [])].filter(Boolean))];
    return allCourses.filter((c) => ids.includes(c.id));
  }, [student, allCourses]);

  const activeCourseId = selectedCourseId || student?.course_id;

  const { data: course } = useQuery({
    queryKey: ['course', activeCourseId],
    queryFn: () => base44.entities.Course.get(activeCourseId),
    enabled: !!activeCourseId
  });

  const { data: announcements } = useQuery({
    queryKey: ['courseAnnouncements', activeCourseId],
    queryFn: () => base44.entities.Announcement.filter({ course_id: activeCourseId }),
    enabled: !!activeCourseId
  });

  const { data: attendance } = useQuery({
    queryKey: ['studentAttendance', studentId, activeCourseId],
    queryFn: async () => {
      const records = await base44.entities.Attendance.filter({ student_id: studentId });
      return records.filter((r) => r.course_id === activeCourseId);
    },
    enabled: !!studentId && !!activeCourseId
  });

  const { data: grades } = useQuery({
    queryKey: ['studentGrades', studentId, activeCourseId],
    queryFn: async () => {
      const records = await base44.entities.Grade.filter({ student_id: studentId });
      return records.filter((g) => g.course_id === activeCourseId);
    },
    enabled: !!studentId && !!activeCourseId
  });

  const { data: assignments } = useQuery({
    queryKey: ['courseAssignments', activeCourseId],
    queryFn: () => base44.entities.Assignment.filter({ course_id: activeCourseId }),
    enabled: !!activeCourseId
  });

  // Fetch all files uploaded by student (via grades)
  const studentFiles = useMemo(() => {
    if (!grades) return [];
    return grades.filter((g) => g.file_url).map((g) => {
      const assignment = assignments?.find((a) => a.id === g.assignment_id);
      return {
        id: g.id,
        name: assignment?.title || 'קובץ ללא שם',
        url: g.file_url,
        date: g.submission_date,
        type: 'submission'
      };
    });
  }, [grades, assignments]);

  const { data: materials } = useQuery({
    queryKey: ['courseMaterials', activeCourseId],
    queryFn: async () => {
      const [legacy, newMats] = await Promise.all([
      base44.entities.Material.filter({ course_id: activeCourseId }),
      base44.entities.Material.filter({ course_ids: activeCourseId })]
      );
      const all = [...(legacy || []), ...(newMats || [])];
      return all.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);
    },
    enabled: !!activeCourseId
  });

  const { data: messages } = useQuery({
    queryKey: ['studentMessages', studentId],
    queryFn: async () => {
      // Fetch messages with higher limit to ensure history is complete
      const allMsgs = await base44.entities.Message.filter({ organization_id: user.organization_id }, undefined, 500);
      return allMsgs.filter((m) => m.student_ids && m.student_ids.includes(studentId));
    },
    enabled: !!studentId && !!user?.organization_id
  });

  const { data: sessions } = useQuery({
    queryKey: ['courseSessions', activeCourseId],
    queryFn: () => base44.entities.CourseSession.filter({ course_id: activeCourseId }),
    enabled: !!activeCourseId
  });

  const { data: sessionMaterials } = useQuery({
    queryKey: ['courseSessionMaterials', activeCourseId],
    queryFn: () => base44.entities.SessionMaterial.filter({ course_id: activeCourseId }),
    enabled: !!activeCourseId
  });

  // Activity Logs
  const { data: activityLogs } = useQuery({
    queryKey: ['studentActivity', studentId],
    queryFn: () => base44.entities.StudentActivityLog.filter({ student_id: studentId }, '-created_date', 100),
    enabled: !!studentId
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      // Update Student
      await base44.entities.Student.update(id, data);

      // Update Identity if linked (Sync changes to master record)
      if (data.student_identity_id) {
        try {
          await base44.entities.StudentIdentity.update(data.student_identity_id, {
            full_name: data.full_name,
            id_number: data.id_number,
            primary_email: data.email,
            primary_phone: data.phone
          });
        } catch (e) {
          console.warn("Failed to update identity", e);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsEditOpen(false);
      toast.success('התלמיד עודכן בהצלחה');
    }
  });

  const handleUpdateStudent = (data) => {
    updateMutation.mutate({ id: studentId, data });
  };

  const handleSharePublicLink = () => {
    const link = `${window.location.origin}${createPageUrl('PublicView')}?type=student&id=${studentId}`;
    navigator.clipboard.writeText(link);
    toast.success('הקישור הועתק ללוח', {
      description: 'ניתן לשלוח את הקישור לתלמיד או להורים לצפייה בתיק האישי'
    });
    // Open in new tab for preview
    window.open(link, '_blank');
  };

  // Derived Data
  const attendanceStats = useMemo(() => {
    if (!attendance || attendance.length === 0) return { present: 0, total: 0, percentage: 0 };
    const present = attendance.filter((a) => a.status === 'present' || a.status === 'late').length;
    return {
      present,
      total: attendance.length,
      percentage: Math.round(present / attendance.length * 100)
    };
  }, [attendance]);

  const assignmentsWithGrades = useMemo(() => {
    if (!assignments) return [];
    return assignments.map((assignment) => {
      const grade = grades?.find((g) => g.assignment_id === assignment.id);
      return { ...assignment, grade };
    });
  }, [assignments, grades]);

  const gradeAverage = useMemo(() => {
    if (!grades || grades.length === 0) return 0;
    const sum = grades.reduce((acc, curr) => acc + (curr.score || 0), 0);
    return Math.round(sum / grades.length);
  }, [grades]);

  const { data: guideSubmissions } = useQuery({
    queryKey: ['guideSubmissions', studentId],
    queryFn: () => base44.entities.GuideSubmission.filter({ student_id: studentId }),
    enabled: !!studentId
  });

  const combinedAverage = useMemo(() => {
    let total = 0;
    let count = 0;

    if (grades && grades.length > 0) {
      total += grades.reduce((acc, curr) => acc + (curr.score || 0), 0);
      count += grades.length;
    }

    if (student?.average_guide_score !== null && student?.average_guide_score !== undefined) {
      const scoredGuides = guideSubmissions?.filter((g) => g.manual_score !== null && g.manual_score !== undefined).length || 0;
      if (scoredGuides > 0) {
        total += student.average_guide_score * scoredGuides;
        count += scoredGuides;
      }
    }

    return count > 0 ? Math.round(total / count) : 0;
  }, [grades, student, guideSubmissions]);

  const formatMessageContent = (content, message) => {
    if (!content) return '';
    let formatted = content;

    // Resolve Course
    const msgCourseId = message?.course_id || activeCourseId;
    const msgCourse = allCourses?.find((c) => c.id === msgCourseId) || course;

    if (msgCourse) {
      formatted = formatted.replace(/{{\s*course_name\s*}}/g, msgCourse.name);
    } else {
      formatted = formatted.replace(/{{\s*course_name\s*}}/g, 'שם הקורס');
    }

    // Resolve Student
    if (student) {
      formatted = formatted.replace(/{{\s*student_name\s*}}/g, student.full_name);
      const link = `${window.location.origin}${createPageUrl('PublicView')}?type=student&id=${student.id}`;
      formatted = formatted.replace(/{{\s*student_public_link\s*}}/g, link);
    }

    // Attempt to resolve Session Placeholders if message has related session
    // Note: We might not have the specific session loaded, but we have 'sessions' array if viewing a course
    if (message?.related_entity_type === 'session' && message.related_entity_id && sessions) {
      const session = sessions.find((s) => s.id === message.related_entity_id);
      if (session) {
        formatted = formatted.replace(/{{\s*session_number\s*}}/g, session.session_number || '');
        formatted = formatted.replace(/{{\s*session_title\s*}}/g, session.title || '');
        formatted = formatted.replace(/{{\s*session_date\s*}}/g, session.date ? format(new Date(session.date), 'dd/MM/yyyy') : '');
        formatted = formatted.replace(/{{\s*session_time\s*}}/g, session.start_time || '');
        formatted = formatted.replace(/{{\s*session_location\s*}}/g, session.location || '');
      }
    }

    // Cleanup remaining placeholders
    formatted = formatted.replace(/{{\s*session_.*?\s*}}/g, '');

    return formatted;
  };

  if (studentLoading) return <div className="p-8 text-center">טוען נתוני תלמיד...</div>;
  if (!student) return <div className="p-8 text-center">תלמיד לא נמצא</div>;

    return (
        <div className="space-y-6" dir="rtl" style={{ textAlign: 'right' }}>
      {/* Header / Banner */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 start-0 w-24 h-24 bg-blue-50 rounded-br-full -z-0 opacity-50"></div>
        <div className="flex flex-col md:flex-row-reverse items-start md:items-center justify-between gap-4 relative z-10" dir="rtl">
          <div className="flex items-center gap-4">
             <Link to={createPageUrl('Students')}>
                <Button variant="ghost" size="icon">
                    <ArrowRight className="h-5 w-5" />
                </Button>
             </Link>
             <div className="relative">
                 <Avatar className="h-16 w-16 border-2 border-white shadow-md bg-slate-100">
                    <AvatarFallback className="text-xl bg-violet-100 text-violet-700">
                        {student.full_name.charAt(0)}
                    </AvatarFallback>
                 </Avatar>
                 <div className="absolute -bottom-1 -end-1 bg-blue-100 text-blue-600 p-1 rounded-full border-2 border-white shadow-sm" title="תלמיד">
                    <User className="w-4 h-4" />
                 </div>
             </div>
             <div>
                <div className="flex items-center gap-3 mb-1">
                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-xl flex items-center gap-2 shadow-sm">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-bold">תלמיד</span>
                    </div>
                    {/* Course Selector */}
                    {studentCourses.length > 1 &&
                <div className="ms-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 gap-2 bg-white border-slate-200 hover:bg-slate-50">
                                        <GraduationCap className="w-3 h-3 text-indigo-500" />
                                        <span className="truncate max-w-[150px]">{course?.name || 'בחר קורס'}</span>
                                        <ArrowRight className="w-3 h-3 rotate-90 text-slate-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    {studentCourses.map((c) =>
                      <DropdownMenuItem
                        key={c.id}
                        onClick={() => setSelectedCourseId(c.id)}
                        className={c.id === activeCourseId ? "bg-indigo-50 text-indigo-700 font-medium" : ""}>

                                            {c.name}
                                        </DropdownMenuItem>
                      )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                }
                </div>
                <h1 className="text-3xl font-bold text-slate-800">{student.full_name}</h1>
                <div className="flex flex-wrap gap-2 text-sm text-slate-500 mt-1">
                    {studentCourses.length <= 1 &&
                <>
                            <span className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                {course?.name || 'ללא קורס'}
                            </span>
                            <span className="hidden md:inline text-slate-300">|</span>
                        </>
                }
                    <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {student.id_number}
                    </span>
                    <span className="hidden md:inline text-slate-300">|</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Badge
                      variant={student.status === 'active' ? 'default' : 'secondary'}
                      className={`cursor-pointer ${student.status === 'active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0' : ''}`}>

                                {student.status === 'active' ? 'פעיל' : student.status === 'inactive' ? 'לא פעיל' : student.status === 'dropped' ? 'פרש' : 'ממתין'}
                            </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => updateMutation.mutate({ id: studentId, data: { status: 'active' } })}>
                                סמן כפעיל
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateMutation.mutate({ id: studentId, data: { status: 'inactive' } })}>
                                סמן כלא פעיל
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateMutation.mutate({ id: studentId, data: { status: 'dropped' } })}>
                                סמן כפורש
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateMutation.mutate({ id: studentId, data: { status: 'pending' } })}>
                                סמן כממתין
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
             </div>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex gap-2 w-full md:w-auto">
             <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsEditOpen(true)}>

                <User className="h-4 w-4" />
                עריכה
             </Button>

             <Button
              variant="secondary"
              className="gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 border"
              onClick={handleSharePublicLink}>

                <Eye className="h-4 w-4" />
                צפייה ציבורית
             </Button>

             {student.email &&
            <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Mail className="h-4 w-4" />
                            אימייל
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {setMessageType('email');setMessageDialogOpen(true);}}>
                            <Send className="h-4 w-4 ms-2" />
                            שלח דרך המערכת
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = `mailto:${student.email}`}>
                            <ExternalLink className="h-4 w-4 ms-2" />
                            פתח בתוכנת דואר
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            }

             {student.phone &&
            <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Phone className="h-4 w-4" />
                            טלפון
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {setMessageType('sms');setMessageDialogOpen(true);}}>
                            <MessageSquare className="h-4 w-4 ms-2" />
                            שלח SMS
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = `tel:${student.phone}`}>
                            <Phone className="h-4 w-4 ms-2" />
                            חייג
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`https://wa.me/${student.phone.replace(/[^0-9]/g, '').replace(/^0/, '972')}`, '_blank')}>
                            <Share2 className="h-4 w-4 ms-2" />
                            וואטסאפ
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            }
          </div>

          {/* Mobile Actions Menu */}
          <div className="md:hidden flex gap-2">
              <Button variant="outline" size="icon" onClick={handleSharePublicLink}>
                  <Eye className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                          <MoreVertical className="h-4 w-4" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                          <User className="h-4 w-4 ms-2" /> עריכת פרטים
                      </DropdownMenuItem>
                        {student.email &&
                    <DropdownMenuItem onClick={() => {setMessageType('email');setMessageDialogOpen(true);}}>
                            <Mail className="h-4 w-4 ms-2" /> שליחת אימייל
                          </DropdownMenuItem>
                    }
                      {student.phone &&
                <>
                              <DropdownMenuItem onClick={() => {setMessageType('sms');setMessageDialogOpen(true);}}>
                                  <MessageSquare className="h-4 w-4 ms-2" /> שליחת SMS
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(`https://wa.me/${student.phone.replace(/[^0-9]/g, '').replace(/^0/, '972')}`, '_blank')}>
                                  <Share2 className="h-4 w-4 ms-2" /> וואטסאפ
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.location.href = `tel:${student.phone}`}>
                                  <Phone className="h-4 w-4 ms-2" /> חייג
                              </DropdownMenuItem>
                          </>
                }
                  </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Sidebar Info */}
        <div className="md:col-span-1 space-y-6">
           {/* Quick Stats */}
           <Card>
              <CardHeader className="pb-2">
                 <CardTitle className="text-base font-medium text-slate-500">מדדים עיקריים</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">נוכחות</span>
                        <span className={`text-sm font-bold ${attendanceStats.percentage < 80 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {attendanceStats.percentage}%
                        </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${attendanceStats.percentage < 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${attendanceStats.percentage}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{attendanceStats.present} מתוך {attendanceStats.total} שיעורים</p>
                 </div>

                 <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">ממוצע משוקלל</span>
                        <span className="text-sm font-bold text-blue-600">{combinedAverage}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(combinedAverage, 100)}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        {gradeAverage > 0 && student?.average_guide_score ? 'מטלות + מדריכים' :
                  gradeAverage > 0 ? 'מטלות בלבד' :
                  student?.average_guide_score ? 'מדריכים בלבד' : 'אין ציונים'}
                    </p>
                 </div>
              </CardContent>
           </Card>

           {/* Contact Info */}
           <Card>
              <CardHeader className="pb-2">
                 <CardTitle className="text-base font-medium text-slate-500">פרטי קשר</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                 <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="truncate">{student.email || '-'}</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{student.phone || '-'}</span>
                 </div>
                 {student.department &&
              <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-slate-400" />
                        <span>{student.department}</span>
                     </div>
              }
                 {student.notes &&
              <div className="pt-2 border-t mt-2">
                        <p className="text-slate-500 text-xs mb-1">הערות:</p>
                        <p className="text-slate-700 bg-slate-50 p-2 rounded">{student.notes}</p>
                     </div>
              }
              </CardContent>
           </Card>
        </div>

        {/* Main Content Tabs */}
        <div className="md:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start bg-white p-1 rounded-lg border shadow-sm mb-4 h-auto flex-wrap gap-1">
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <TabsTrigger value="overview" className="flex-1 min-w-[50px]">
                                    <LayoutDashboard className="w-5 h-5" />
                                </TabsTrigger>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-0"><p>סקירה</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <TabsTrigger value="syllabus" className="flex-1 min-w-[50px]">
                                    <BookOpen className="w-5 h-5" />
                                </TabsTrigger>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-0"><p>סילבוס</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <TabsTrigger value="attendance" className="flex-1 min-w-[50px]">
                                    <Clock className="w-5 h-5" />
                                </TabsTrigger>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-0"><p>נוכחות</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <TabsTrigger value="submissions" className="flex-1 min-w-[50px]">
                                    <Award className="w-5 h-5" />
                                </TabsTrigger>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-0"><p>מטלות והגשות</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <TabsTrigger value="materials" className="flex-1 min-w-[50px]">
                                    <FolderOpen className="w-5 h-5" />
                                </TabsTrigger>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-0"><p>חומרי לימוד</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <TabsTrigger value="announcements" className="flex-1 min-w-[50px]">
                                    <Bell className="w-5 h-5" />
                                </TabsTrigger>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-0"><p>הכרזות</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <TabsTrigger value="messages" className="flex-1 min-w-[50px]">
                                    <MessageSquare className="w-5 h-5" />
                                </TabsTrigger>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-0"><p>הודעות</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <TabsTrigger value="whatsapp" className="flex-1 min-w-[50px]">
                                    <Share2 className="w-5 h-5" />
                                </TabsTrigger>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-0"><p>WhatsApp</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <TabsTrigger value="files" className="flex-1 min-w-[50px]">
                                    <Paperclip className="w-5 h-5" />
                                </TabsTrigger>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-0"><p>קבצים</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <TabsTrigger value="activity" className="flex-1 min-w-[50px]">
                                    <Activity className="w-5 h-5" />
                                </TabsTrigger>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-0"><p>אנליזת פעילות</p></TooltipContent>
                        </Tooltip>


                        </TooltipProvider>
                        </TabsList>

                {/* Syllabus Tab */}
                <TabsContent value="syllabus" dir="rtl" style={{ textAlign: 'right' }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-indigo-600" />
                                תוכנית הלימודים
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {sessions?.sort((a, b) => a.session_number - b.session_number).map((session) => {
                      const sessionAssignments = assignments?.filter((a) => a.session_id === session.id) || [];
                      const linkedMaterialsCount = sessionMaterials?.filter((sm) => sm.session_id === session.id).length || 0;

                      return (
                        <div key={session.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors group">
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
                                                {session.session_number}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-semibold text-slate-900">
                                                        <Link
                                    to={`${createPageUrl('SessionProfile')}?courseId=${student.course_id}&sessionId=${session.id}`}
                                    className="hover:text-indigo-600 hover:underline flex items-center gap-2">

                                                            {session.title}
                                                            <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </Link>
                                                    </h4>
                                                    <Button variant="ghost" size="sm" asChild className="h-6 text-xs hidden group-hover:inline-flex">
                                                        <Link to={`${createPageUrl('SessionProfile')}?courseId=${student.course_id}&sessionId=${session.id}`}>
                                                            לדף מפגש
                                                        </Link>
                                                    </Button>
                                                </div>
                                                {session.description &&
                              <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap text-start rtl">{session.description}</p>
                              }
                                                {session.objectives &&
                              <div className="mt-2 flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                                                        <span className="font-semibold shrink-0">מטרות:</span> 
                                                        <span>{session.objectives}</span>
                                                    </div>
                              }
                                                
                                                {(sessionAssignments.length > 0 || linkedMaterialsCount > 0) &&
                              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                                                        {sessionAssignments.map((a) =>
                                <Link key={a.id} to={`${createPageUrl('AssignmentProfile')}?id=${a.id}`}>
                                                                <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 gap-1 cursor-pointer border border-purple-200">
                                                                    <FileText className="w-3 h-3" />
                                                                    {a.title}
                                                                </Badge>
                                                            </Link>
                                )}
                                                        {linkedMaterialsCount > 0 &&
                                <Link to={`${createPageUrl('Materials')}?courseId=${student.course_id}`}>
                                                                <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 gap-1 cursor-pointer border border-blue-200">
                                                                    <FolderOpen className="w-3 h-3" />
                                                                    {linkedMaterialsCount} חומרי לימוד
                                                                </Badge>
                                                            </Link>
                                }
                                                    </div>
                              }
                                            </div>
                                        </div>
                                    </div>);
                    })}
                                {(!sessions || sessions.length === 0) &&
                    <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                                        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        אין סילבוס זמין לקורס זה
                                    </div>
                    }
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6" dir="rtl" style={{ textAlign: 'right' }}>
                    
                    {/* Recent Pinned Announcements */}
                    {announcements && announcements.length > 0 &&
              <Card className="border-e-4 border-e-orange-500 bg-orange-50/30" dir="rtl" style={{ textAlign: 'right' }}>
                            <CardHeader className="flex flex-row-reverse items-center justify-between pb-2" dir="rtl">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-orange-500" />
                                    הודעות חשובות מהקורס
                                </CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setActiveTab('announcements')} className="text-violet-600 hover:text-violet-700">
                                    לכל ההודעות
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {announcements.
                    filter((a) => !a.expiration_date || new Date(a.expiration_date) > new Date()) // Show only non-expired
                    .sort((a, b) => {
                      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
                      return new Date(b.created_date) - new Date(a.created_date);
                    }).
                    slice(0, 2).
                    map((announcement) =>
                    <div key={announcement.id} className={`p-3 rounded-lg border bg-white ${announcement.is_pinned ? 'border-orange-200' : 'border-slate-100'}`}>
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                                    {announcement.is_pinned && <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-[10px] h-5 px-1">נעוץ</Badge>}
                                                    {announcement.title}
                                                </h4>
                                                <span className="text-xs text-slate-400">{format(new Date(announcement.created_date), 'dd/MM/yyyy')}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 mt-1 line-clamp-2" dir="rtl">{announcement.content}</p>
                                        </div>
                    )}
                                </div>
                            </CardContent>
                        </Card>
              }

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Recent Grades */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                                    ציונים אחרונים
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {assignmentsWithGrades.length > 0 ?
                    <div className="space-y-3">
                                        {assignmentsWithGrades.
                      filter((a) => a.grade).
                      sort((a, b) => new Date(b.due_date) - new Date(a.due_date)).
                      slice(0, 3).
                      map((item) =>
                      <div key={item.id} className="flex justify-between items-center border-b last:border-0 pb-2 last:pb-0">
                                                    <div>
                                                        <p className="font-medium text-sm">{item.title}</p>
                                                        <p className="text-xs text-slate-400">{item.due_date}</p>
                                                    </div>
                                                    <Badge variant={item.grade.score >= 80 ? 'outline' : 'secondary'} className={item.grade.score >= 80 ? 'text-emerald-600 border-emerald-200' : ''}>
                                                        {item.grade.score}
                                                    </Badge>
                                                </div>
                      )}
                                    </div> :

                    <p className="text-slate-400 text-sm text-center py-4">אין ציונים עדיין</p>
                    }
                            </CardContent>
                        </Card>

                        {/* Attendance Trend */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-orange-500" />
                                    נוכחות אחרונה
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {attendance && attendance.length > 0 ?
                    <div className="space-y-3">
                                        {attendance.
                      sort((a, b) => new Date(b.date) - new Date(a.date)).
                      slice(0, 3).
                      map((record) =>
                      <div key={record.id} className="flex justify-between items-center border-b last:border-0 pb-2 last:pb-0">
                                                    <div>
                                                        <p className="font-medium text-sm">שיעור {record.lesson_number}</p>
                                                        <p className="text-xs text-slate-400">{format(new Date(record.date), 'dd/MM/yyyy')}</p>
                                                    </div>
                                                    <Badge className={
                        record.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                        record.status === 'absent' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                        }>
                                                        {record.status === 'present' ? 'נוכח' : record.status === 'absent' ? 'נעדר' : record.status === 'late' ? 'מאחר' : 'מוצדק'}
                                                    </Badge>
                                                </div>
                      )}
                                    </div> :

                    <p className="text-slate-400 text-sm text-center py-4">אין נתוני נוכחות</p>
                    }
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Attendance Tab */}
                <TabsContent value="attendance" dir="rtl" style={{ textAlign: 'right' }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>היסטוריית נוכחות</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm text-start">
                                    <thead className="bg-slate-50 text-slate-500">
                                        <tr>
                                            <th className="p-3 font-medium">תאריך</th>
                                            <th className="p-3 font-medium">שיעור</th>
                                            <th className="p-3 font-medium">סטטוס</th>
                                            <th className="p-3 font-medium">הערות</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendance?.sort((a, b) => new Date(b.date) - new Date(a.date)).map((record) =>
                        <tr key={record.id} className="border-t">
                                                <td className="p-3">{format(new Date(record.date), 'dd/MM/yyyy')}</td>
                                                <td className="p-3">{record.lesson_number}</td>
                                                <td className="p-3">
                                                    <Badge variant="outline" className={
                            record.status === 'present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            record.status === 'absent' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-orange-50 text-orange-700 border-orange-200'
                            }>
                                                        {record.status === 'present' ? 'נוכח' : record.status === 'absent' ? 'נעדר' : record.status === 'late' ? 'מאחר' : 'מוצדק'}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-slate-500">{record.notes || '-'}</td>
                                            </tr>
                        )}
                                        {(!attendance || attendance.length === 0) &&
                        <tr>
                                                <td colSpan={4} className="p-6 text-center text-slate-500">אין נתונים להצגה</td>
                                            </tr>
                        }
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Unified Submissions Tab */}
                <TabsContent value="submissions" dir="rtl" style={{ textAlign: 'right' }}>
                    <UnifiedSubmissionsView
                studentId={studentId}
                assignments={assignments}
                grades={grades} />

                </TabsContent>

                {/* Announcements Tab */}
                <TabsContent value="announcements" dir="rtl" style={{ textAlign: 'right' }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-indigo-600" />
                                לוח הודעות קורס
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {announcements?.
                    filter((a) => !a.expiration_date || new Date(a.expiration_date) > new Date()) // Filter expired
                    .sort((a, b) => {
                      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
                      return new Date(b.created_date) - new Date(a.created_date);
                    }).map((announcement) =>
                    <div key={announcement.id} className={`p-4 rounded-xl border ${announcement.is_pinned ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-white border-slate-200'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                {announcement.is_pinned && <Badge className="bg-orange-500 hover:bg-orange-600">נעוץ</Badge>}
                                                <Badge variant="outline" className={
                          announcement.priority === 'urgent' ? 'text-red-600 border-red-200 bg-red-50' :
                          announcement.priority === 'high' ? 'text-orange-600 border-orange-200 bg-orange-50' :
                          'text-slate-600 border-slate-200 bg-slate-50'
                          }>
                                                    {announcement.priority === 'urgent' ? 'דחוף' : announcement.priority === 'high' ? 'גבוה' : 'רגיל'}
                                                </Badge>
                                                <h3 className="font-bold text-lg text-slate-800">{announcement.title}</h3>
                                            </div>
                                            <span className="text-sm text-slate-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(announcement.created_date).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem', dateStyle: 'short', timeStyle: 'short' })}
                                            </span>
                                        </div>
                                        <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-wrap">
                                            {announcement.content}
                                        </div>
                                        {announcement.author_name &&
                      <div className="mt-3 pt-3 border-t border-slate-100/50 flex items-center gap-2 text-xs text-slate-400">
                                                <User className="w-3 h-3" />
                                                פורסם ע"י {announcement.author_name}
                                            </div>
                      }
                                    </div>
                    )}
                                {(!announcements || announcements.length === 0) &&
                    <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        אין הכרזות חדשות
                                    </div>
                    }
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Materials Tab */}
                <TabsContent value="materials" dir="rtl" style={{ textAlign: 'right' }}>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {materials?.map((material) =>
                <Card key={material.id} className="hover:border-violet-200 transition-colors">
                <CardContent className="p-4 flex items-start gap-3">
                    <div className={`p-3 rounded-2xl shadow-sm ${
                        material.type === 'video' ? 'bg-red-50 text-red-500' :
                        material.type === 'presentation' ? 'bg-orange-50 text-orange-500' :
                        material.type === 'link' ? 'bg-blue-50 text-blue-500' :
                        'bg-violet-50 text-violet-500'
                    }`}>
                        {material.type === 'video' ? <Video className="h-8 w-8" /> :
                material.type === 'presentation' ? <Presentation className="h-8 w-8" /> :
                material.type === 'link' ? <ExternalLink className="h-8 w-8" /> :
                <FileText className="h-8 w-8" />}
                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-slate-900 truncate">{material.title}</h4>
                                        <p className="text-sm text-slate-500 line-clamp-2 mt-1">{material.description || 'ללא תיאור'}</p>
                                        {material.file_url &&
                      <Button asChild variant="link" className="p-0 h-auto mt-2 text-violet-600">
                                                <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                                                    פתח חומר לימוד
                                                </a>
                                            </Button>
                      }
                                    </div>
                                </CardContent>
                            </Card>
                )}
                        {(!materials || materials.length === 0) &&
                <div className="col-span-full text-center py-10 text-slate-500">
                                אין חומרי לימוד זמינים
                            </div>
                }
                     </div>
                </TabsContent>

                {/* Messages Tab */}
                <TabsContent value="messages" dir="rtl" style={{ textAlign: 'right' }}>
                    <Card>
                        <CardHeader className="flex flex-row-reverse items-center justify-between" dir="rtl">
                            <CardTitle>הודעות ותקשורת</CardTitle>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => {setMessageType('email');setMessageDialogOpen(true);}}>
                                    <Mail className="h-4 w-4 ms-2" />
                                    אימייל חדש
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => {setMessageType('sms');setMessageDialogOpen(true);}}>
                                    <MessageSquare className="h-4 w-4 ms-2" />
                                    SMS חדש
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {messages?.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map((msg) =>
                    <div key={msg.id} className={`flex gap-4 p-4 border rounded-lg ${msg.direction === 'inbound' ? 'bg-white border-orange-200 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className={`mt-1 p-2 rounded-full h-fit ${
                      msg.direction === 'inbound' ? 'bg-orange-100 text-orange-600' :
                      msg.type === 'email' ? 'bg-blue-100 text-blue-600' :
                      msg.type === 'sms' ? 'bg-green-100 text-green-600' :
                      'bg-slate-200 text-slate-600'}`
                      }>
                                            {msg.direction === 'inbound' ? <MessageSquare className="h-4 w-4" /> :
                        msg.type === 'email' ? <Mail className="h-4 w-4" /> :
                        msg.type === 'sms' ? <Phone className="h-4 w-4" /> :
                        <MessageSquare className="h-4 w-4" />
                        }
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    {msg.direction === 'inbound' &&
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-[10px]">
                                                            נכנס
                                                        </Badge>
                            }
                                                    <h4 className="font-medium text-slate-900">{msg.subject}</h4>
                                                </div>
                                                <span className="text-xs text-slate-500">{new Date(msg.created_date).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem', dateStyle: 'short', timeStyle: 'short' })}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{formatMessageContent(msg.content, msg)}</p>
                                        </div>
                                    </div>
                    )}
                                {(!messages || messages.length === 0) &&
                    <p className="text-center text-slate-500 py-8">אין היסטוריית הודעות</p>
                    }
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* WhatsApp Tab */}
                <TabsContent value="whatsapp">
                    {student && <StudentWhatsAppView student={student} />}
                </TabsContent>

                {/* Files Tab */}
                <TabsContent value="files">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Paperclip className="h-5 w-5 text-indigo-600" />
                                תיק עבודות וקבצים
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {studentFiles.length > 0 ?
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {studentFiles.map((file) =>
                    <div key={file.id} className="p-4 border rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all bg-white group">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-slate-800 line-clamp-1" title={file.name}>{file.name}</h4>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            {file.date ? format(new Date(file.date), 'dd/MM/yyyy') : '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                <Button size="sm" variant="outline" className="w-full gap-2 text-xs h-8" asChild>
                                                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                        <Download className="w-3 h-3" />
                                                        הורד קובץ
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                    )}
                                </div> :

                  <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                                    <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    לא נמצאו קבצים שהועלו על ידי התלמיד
                                </div>
                  }
                        </CardContent>
                    </Card>
                </TabsContent>



                {/* Activity Analysis Tab */}
                <TabsContent value="activity">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-indigo-600" />
                                יומן פעילות ואנליזה
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm text-start">
                                    <thead className="bg-slate-50 text-slate-500">
                                        <tr>
                                            <th className="p-3 font-medium">זמן</th>
                                            <th className="p-3 font-medium">משאב/דף</th>
                                            <th className="p-3 font-medium">פעולה</th>
                                            <th className="p-3 font-medium">זמן שהייה (דק')</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activityLogs?.map((log) => {
                          const resourceName =
                          log.resource_type === 'course' ? course?.name :
                          log.resource_type === 'session' ? sessions?.find((s) => s.id === log.resource_id)?.title :
                          log.resource_type === 'assignment' ? assignments?.find((a) => a.id === log.resource_id)?.title :
                          log.resource_id;

                          const durationMinutes = Math.round((log.duration_seconds || 0) / 60);

                          return (
                            <tr key={log.id} className="border-t hover:bg-slate-50">
                                                    <td className="p-3 whitespace-nowrap">
                                                        {format(new Date(log.created_date), 'dd/MM/yy HH:mm')}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-xs">
                                                                {log.resource_type === 'assignment' ? 'מטלה' :
                                    log.resource_type === 'course' ? 'קורס' :
                                    log.resource_type === 'session' ? 'מפגש' : log.resource_type}
                                                            </Badge>
                                                            <span className="truncate max-w-[200px]" title={resourceName}>{resourceName || 'לא ידוע'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        {log.action === 'view' && <span className="text-slate-500 flex items-center gap-1"><Eye className="w-3 h-3" /> צפייה</span>}
                                                        {log.action === 'heartbeat' && <span className="text-blue-500 flex items-center gap-1"><Activity className="w-3 h-3" /> פעיל</span>}
                                                        {log.action === 'interaction' && <span className="text-purple-500 flex items-center gap-1"><MousePointerClick className="w-3 h-3" /> אינטראקציה</span>}
                                                        {log.action === 'submission' && <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> הגשה</span>}
                                                    </td>
                                                    <td className="p-3">
                                                        {durationMinutes > 0 ? `${durationMinutes} דק'` : '< 1 דק\''}
                                                    </td>
                                                </tr>);

                        })}
                                        {(!activityLogs || activityLogs.length === 0) &&
                        <tr>
                                                <td colSpan={4} className="p-8 text-center text-slate-500">
                                                    טרם נרשמה פעילות לתלמיד זה
                                                </td>
                                            </tr>
                        }
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                </Tabs>
        </div>

      </div>

      <UnifiedMessageDialog
        open={messageDialogOpen}
        onClose={() => setMessageDialogOpen(false)}
        recipients={[student]}
        initialTab={messageType}
        courseId={activeCourseId} />


      <SubmissionDetailsDialog
        open={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        submission={selectedSubmission?.grade}
        assignment={selectedSubmission?.assignment} />


      <StudentForm
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdateStudent}
        student={student}
        courses={allCourses}
        isLoading={updateMutation.isPending} />

    </div>);

}