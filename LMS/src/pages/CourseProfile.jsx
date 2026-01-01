import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import SimpleMessageDialog from '@/components/common/SimpleMessageDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, Clock, MapPin, Calendar, GraduationCap, MessageSquare, FileText, FolderOpen,
  ArrowRight, Bell, TrendingUp, Mail, Phone, Settings, MoreVertical, Plus, MessageCircle,
  Share2, Eye, BookOpen, LayoutDashboard, Loader2, Edit, Zap, Mic, AlertTriangle,
  LayoutTemplate, Sparkles, ImageIcon as ImageIconLucide, PlayCircle, Trash2, Wand2,
  Code2, BarChart3
} from 'lucide-react';
import { Video as VideoIcon, Presentation, Link as LinkIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { createPageUrl } from '@/utils';
import { formatIsraelDate } from '@/components/utils/dateUtils';
import { toast, Toaster } from 'sonner';
import StudentTable from '@/components/students/StudentTable';
import AssignmentCard from '@/components/assignments/AssignmentCard';
import SubmissionsDialog from '@/components/assignments/SubmissionsDialog';
import TeacherPedagogicalToolbox from '@/components/courses/TeacherPedagogicalToolbox';
import CommunicationStrategy from '@/components/courses/CommunicationStrategy';
import WhatsAppGroupView from '@/components/courses/WhatsAppGroupView';
import AssignmentImportDialog from "@/components/assignments/AssignmentImportDialog";
import AutoGenerateAssignmentsDialog from "@/components/assignments/AutoGenerateAssignmentsDialog";
import AssignmentForm from '@/components/assignments/AssignmentForm';
import CourseForm from '@/components/courses/CourseForm';
import ScheduleManager from '@/components/courses/ScheduleManager';
import CourseMediaGallery from '@/components/courses/CourseMediaGallery';
import PublicViewAnalytics from '@/components/courses/PublicViewAnalytics';
import AudioPlayer from '@/components/common/AudioPlayer';
import EmbedCodeDialog from '@/components/common/EmbedCodeDialog';
import AttendanceReport from '@/components/documents/AttendanceReport';
import GradesReport from '@/components/documents/GradesReport';
import MaterialsReviewDocument from '@/components/documents/MaterialsReviewDocument';
import ContentGapsReport from '@/components/courses/ContentGapsReport';
import CourseAnalyticsDashboard from '@/components/courses/CourseAnalyticsDashboard';
import SyllabusManager from '@/components/courses/SyllabusManager';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

function ZoomRecordingsList({ courseId }) {
  const { data: recordings, isLoading } = useQuery({
    queryKey: ['courseRecordings', courseId],
    queryFn: async () => {
      const res = await base44.functions.invoke('zoom', { action: 'getCourseRecordings', courseId });
      return res.data.recordings || [];
    }
  });
  if (isLoading) return (
    <div className="p-8 text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-600" />
    </div>
  );
  if (!recordings || recordings.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 bg-white rounded-xl border-2 border-dashed border-slate-200">
        <VideoIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p className="font-medium">אין הקלטות זום זמינות לקורס זה</p>
      </div>
    );
  }
  return (
    <Card className="border-2 border-red-100 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b-2 border-red-100">
        <CardTitle className="flex items-center gap-3 text-red-900">
          <div className="p-2 bg-red-100 rounded-xl">
            <VideoIcon className="w-6 h-6 text-red-600" />
          </div>
          ארכיון הקלטות שיעורים
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {recordings.map((recording, idx) => (
            <motion.div
              key={recording.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-gradient-to-br from-white to-red-50/30 border-2 border-red-100 rounded-2xl hover:border-red-300 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{recording.meeting_topic || 'שיעור ללא כותרת'}</h4>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatIsraelDate(recording.recording_start)}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-red-600">
                      {(recording.file_size_bytes / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                </div>
              </div>
              <Button
                asChild
                className="mt-4 md:mt-0 gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <a href={recording.play_url || recording.download_url} target="_blank" rel="noopener noreferrer">
                  <PlayCircle className="w-4 h-4" />
                  צפה בהקלטה
                </a>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CourseProfile() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState(null);
  const [assignmentFormOpen, setAssignmentFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [deleteAssignmentDialogOpen, setDeleteAssignmentDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [deleteCourseDialogOpen, setDeleteCourseDialogOpen] = useState(false);
  const [scheduleManagerOpen, setScheduleManagerOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageType, setMessageType] = useState('whatsapp');
  const [messageRecipients, setMessageRecipients] = useState([]);
  const [courseFormOpen, setCourseFormOpen] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  const queryParams = new URLSearchParams(window.location.search);
  const courseId = queryParams.get('id');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => base44.entities.Course.get(courseId),
    enabled: !!courseId
  });

  const { data: students } = useQuery({
    queryKey: ['courseStudents', courseId],
    queryFn: async () => {
      const allStudents = await base44.entities.Student.filter({ organization_id: user.organization_id }, undefined, 1000);
      return allStudents.filter((s) => s.course_id === courseId || s.course_ids && s.course_ids.includes(courseId));
    },
    enabled: !!courseId && !!user?.organization_id,
    refetchInterval: 30000
  });

  const { data: attendance } = useQuery({
    queryKey: ['courseAttendance', courseId],
    queryFn: () => base44.entities.Attendance.filter({ course_id: courseId }),
    enabled: !!courseId
  });

  const { data: assignments } = useQuery({
    queryKey: ['courseAssignments', courseId],
    queryFn: () => base44.entities.Assignment.filter({ course_id: courseId }),
    enabled: !!courseId
  });

  const { data: grades } = useQuery({
    queryKey: ['courseGrades', courseId],
    queryFn: () => base44.entities.Grade.filter({ course_id: courseId }),
    enabled: !!courseId
  });

  const { data: materials } = useQuery({
    queryKey: ['courseMaterials', courseId],
    queryFn: async () => {
      const [legacy, newMats] = await Promise.all([
        base44.entities.Material.filter({ course_id: courseId }),
        base44.entities.Material.filter({ course_ids: courseId })
      ]);
      const all = [...(legacy || []), ...(newMats || [])];
      return all.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);
    },
    enabled: !!courseId
  });

  const { data: sessionMaterials } = useQuery({
    queryKey: ['courseSessionMaterials', courseId],
    queryFn: () => base44.entities.SessionMaterial.filter({ course_id: courseId }),
    enabled: !!courseId
  });

  const { data: messages } = useQuery({
    queryKey: ['courseMessages', courseId],
    queryFn: async () => {
      const msgs = await base44.entities.Message.filter({ course_id: courseId });
      return msgs;
    },
    enabled: !!courseId
  });

  const { data: announcements } = useQuery({
    queryKey: ['courseAnnouncements', courseId],
    queryFn: () => base44.entities.Announcement.filter({ course_id: courseId }),
    enabled: !!courseId
  });

  const { data: events } = useQuery({
    queryKey: ['courseEvents', courseId],
    queryFn: () => base44.entities.CalendarEvent.filter({ course_id: courseId }),
    enabled: !!courseId
  });

  const { data: syllabusSessions } = useQuery({
    queryKey: ['courseSessions', courseId],
    queryFn: () => base44.entities.CourseSession.filter({ course_id: courseId }),
    enabled: !!courseId
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (data) => {
      const { rubricCriteria, ...assignmentData } = data;
      const assignment = await base44.entities.Assignment.create({ ...assignmentData, organization_id: user?.organization_id });
      if (rubricCriteria && rubricCriteria.length > 0) {
        const rubric = await base44.entities.GradingRubric.create({
          organization_id: user?.organization_id,
          assignment_id: assignment.id,
          name: 'מחוון הערכה',
          total_points: rubricCriteria.reduce((sum, c) => sum + (Number(c.max_points) || 0), 0)
        });
        await Promise.all(rubricCriteria.map((c, index) =>
          base44.entities.RubricCriterion.create({
            organization_id: user?.organization_id,
            rubric_id: rubric.id,
            title: c.title,
            description: c.description,
            max_points: Number(c.max_points),
            order: index
          })
        ));
      }
      if (data.related_material_ids && data.related_material_ids.length > 0) {
        try {
          await Promise.all(data.related_material_ids.map((mid) =>
            base44.entities.AssignmentMaterial.create({
              organization_id: user?.organization_id,
              assignment_id: assignment.id,
              material_id: mid,
              is_reference: true
            })
          ));
        } catch (e) {
          console.error("Failed to link materials", e);
        }
      }
      if (data.due_date) {
        try {
          await base44.entities.CalendarEvent.create({
            organization_id: user?.organization_id,
            course_id: data.course_id,
            title: `הגשה: ${data.title}`,
            description: `מועד אחרון להגשת מטלה: ${data.title}`,
            date: data.due_date,
            start_time: '23:59',
            end_time: '23:59',
            type: 'deadline',
            location: 'מקוון'
          });
        } catch (e) {
          console.error("Failed to create calendar event for assignment", e);
        }
      }
      return assignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['courseEvents'] });
      setAssignmentFormOpen(false);
      toast.success('המטלה נוצרה ונוספה ללוח השנה');
    }
  });

  const updateCourseMutation = useMutation({
    mutationFn: (data) => base44.entities.Course.update(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      setCourseFormOpen(false);
      toast.success('פרטי הקורס עודכנו בהצלחה');
    }
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { rubricCriteria, ...assignmentData } = data;
      await base44.entities.Assignment.update(id, assignmentData);
      if (rubricCriteria) {
        const rubrics = await base44.entities.GradingRubric.filter({ assignment_id: id });
        let rubricId;
        if (rubrics.length > 0) {
          rubricId = rubrics[0].id;
          await base44.entities.GradingRubric.update(rubricId, {
            total_points: rubricCriteria.reduce((sum, c) => sum + (Number(c.max_points) || 0), 0)
          });
          const oldCriteria = await base44.entities.RubricCriterion.filter({ rubric_id: rubricId });
          await Promise.all(oldCriteria.map((c) => base44.entities.RubricCriterion.delete(c.id)));
        } else if (rubricCriteria.length > 0) {
          const newRubric = await base44.entities.GradingRubric.create({
            organization_id: user?.organization_id,
            assignment_id: id,
            name: 'מחוון הערכה',
            total_points: rubricCriteria.reduce((sum, c) => sum + (Number(c.max_points) || 0), 0)
          });
          rubricId = newRubric.id;
        }
        if (rubricId && rubricCriteria.length > 0) {
          await Promise.all(rubricCriteria.map((c, index) =>
            base44.entities.RubricCriterion.create({
              organization_id: user?.organization_id,
              rubric_id: rubricId,
              title: c.title,
              description: c.description,
              max_points: Number(c.max_points),
              order: index
            })
          ));
        }
      }
      try {
        const existing = await base44.entities.AssignmentMaterial.filter({ assignment_id: id });
        await Promise.all(existing.map((am) => base44.entities.AssignmentMaterial.delete(am.id)));
        if (data.related_material_ids && data.related_material_ids.length > 0) {
          await Promise.all(data.related_material_ids.map((mid) =>
            base44.entities.AssignmentMaterial.create({
              organization_id: user?.organization_id,
              assignment_id: id,
              material_id: mid,
              is_reference: true
            })
          ));
        }
      } catch (e) {
        console.error("Failed to sync materials", e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseAssignments'] });
      setAssignmentFormOpen(false);
      setEditingAssignment(null);
      toast.success('המטלה עודכנה בהצלחה');
    }
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (id) => base44.entities.Assignment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseAssignments'] });
      setDeleteAssignmentDialogOpen(false);
      setAssignmentToDelete(null);
      toast.success('המטלה נמחקה בהצלחה');
    }
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id) => {
      const response = await base44.functions.invoke('deleteCourseCascade', { courseId: id });
      if (response.data.error) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setDeleteCourseDialogOpen(false);
      toast.success('הקורס נמחק בהצלחה');
      navigate(createPageUrl('Courses'));
    },
    onError: (error) => {
      toast.error(`שגיאה במחיקת הקורס: ${error.message}`);
    }
  });

  const saveAsTemplateMutation = useMutation({
    mutationFn: async () => {
      const sessions = await base44.entities.CourseSession.filter({ course_id: courseId });
      const syllabusData = sessions.map(s => ({
        title: s.title,
        description: s.description,
        objectives: s.objectives,
        duration_hours: s.duration_hours
      }));
      const templateData = {
        organization_id: user?.organization_id,
        name: `תבנית: ${course.name}`,
        code: course.code,
        description: course.description,
        default_syllabus: JSON.stringify(syllabusData),
        default_duration_hours: course.total_hours,
        default_sessions_count: course.total_sessions
      };
      return base44.entities.CourseTemplate.create(templateData);
    },
    onSuccess: () => {
      toast.success('הקורס נשמר כתבנית בהצלחה');
      queryClient.invalidateQueries({ queryKey: ['courseTemplates'] });
    },
    onError: () => toast.error('שגיאה בשמירת התבנית')
  });

  const handleAssignmentSubmit = (data) => {
    if (editingAssignment) {
      updateAssignmentMutation.mutate({ id: editingAssignment.id, data });
    } else {
      createAssignmentMutation.mutate(data);
    }
  };

  const formatMessageContent = (content, message) => {
    if (!content) return '';
    let formatted = content;
    if (course) {
      formatted = formatted.replace(/{{\s*course_name\s*}}/g, course.name);
    }
    formatted = formatted.replace(/{{\s*student_name\s*}}/g, '[שם התלמיד]');
    formatted = formatted.replace(/{{\s*student_public_link\s*}}/g, '[קישור לפורטל]');
    if (message?.related_entity_type === 'session' && message.related_entity_id && syllabusSessions) {
      const session = syllabusSessions.find((s) => s.id === message.related_entity_id);
      if (session) {
        formatted = formatted.replace(/{{\s*session_number\s*}}/g, session.session_number || '');
        formatted = formatted.replace(/{{\s*session_title\s*}}/g, session.title || '');
        formatted = formatted.replace(/{{\s*session_date\s*}}/g, session.date ? format(new Date(session.date), 'dd/MM/yyyy') : '');
        formatted = formatted.replace(/{{\s*session_time\s*}}/g, session.start_time || '');
        formatted = formatted.replace(/{{\s*session_location\s*}}/g, session.location || '');
      }
    }
    formatted = formatted.replace(/{{\s*session_.*?\s*}}/g, '[פרטי מפגש]');
    return formatted;
  };

  const handleSharePublicLink = () => {
    const link = `${window.location.origin}${createPageUrl('PublicView')}?type=course&id=${courseId}`;
    navigator.clipboard.writeText(link);
    toast.success('הקישור הועתק ללוח', {
      description: 'ניתן לשלוח את הקישור לכל מי שמעוניין לצפות בפרטי הקורס'
    });
    window.open(link, '_blank');
  };

  const handleSendSMS = (student) => {
    setMessageRecipients([student]);
    setMessageType('sms');
    setMessageDialogOpen(true);
  };

  const handleSendEmail = (student) => {
    setMessageRecipients([student]);
    setMessageType('email');
    setMessageDialogOpen(true);
  };

  const handleBulkMessage = (type) => {
    const selected = students?.filter((s) => selectedStudentIds.includes(s.id)) || [];
    if (selected.length === 0) {
      toast.error('לא נבחרו תלמידים');
      return;
    }
    setMessageRecipients(selected);
    setMessageType(type);
    setMessageDialogOpen(true);
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setAssignmentFormOpen(true);
  };

  const handleGenerateAudio = async () => {
    if (!course.audio_script) {
      toast.error('יש להזין תמליל לפני הפקת אודיו. לחץ על "ערוך תמליל".');
      return;
    }
    setIsGeneratingAudio(true);
    const toastId = toast.loading('שולח לייצור אודיו...');
    try {
      const res = await base44.functions.invoke('mediaSync', {
        action: 'cpanel_sync',
        entityType: 'course',
        entityId: courseId,
        skipPull: false
      });
      if (res.data?.success) {
        if (res.data.processed > 0) {
          toast.success('האודיו נוצר ונטען בהצלחה!', { id: toastId });
          queryClient.invalidateQueries({ queryKey: ['course', courseId] });
        } else {
          toast.success('הבקשה נשלחה לייצור! המערכת תעדכן כשהאודיו יהיה מוכן (1-2 דקות).', { id: toastId });
        }
      } else {
        toast.error('שגיאה: ' + (res.data?.error || 'Unknown error'), { id: toastId });
      }
    } catch (e) {
      console.error(e);
      toast.error('תקלה בתקשורת', { id: toastId });
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleDeleteAssignment = (assignment) => {
    const relatedGrades = grades?.filter((g) => g.assignment_id === assignment.id) || [];
    if (relatedGrades.length > 0) {
      toast.error(`לא ניתן למחוק מטלה עם ${relatedGrades.length} ציונים מוזנים. יש למחוק את הציונים תחילה.`);
      return;
    }
    setAssignmentToDelete(assignment);
    setDeleteAssignmentDialogOpen(true);
  };

  const handleToggleAssignmentStatus = (assignment) => {
    const newStatus = assignment.status === 'open' ? 'closed' : 'open';
    updateAssignmentMutation.mutate({
      id: assignment.id,
      data: { ...assignment, status: newStatus }
    });
    toast.success(newStatus === 'open' ? 'המטלה נפתחה' : 'המטלה נסגרה');
  };

  const stats = useMemo(() => {
    if (!students) return { students: 0, attendance: 0, assignments: 0 };
    let avgAttendance = 0;
    if (attendance && attendance.length > 0) {
      const presentCount = attendance.filter((a) => a.status === 'present' || a.status === 'late').length;
      avgAttendance = Math.round(presentCount / attendance.length * 100);
    }
    return {
      students: students.length,
      attendance: avgAttendance,
      assignments: assignments?.length || 0
    };
  }, [students, attendance, assignments]);

  const nextLesson = useMemo(() => {
    if (!events) return null;
    const today = new Date();
    const futureLessons = events
      .filter((e) => e.type === 'lesson' && new Date(e.date + 'T' + e.start_time) > today)
      .sort((a, b) => new Date(a.date + 'T' + a.start_time) - new Date(b.date + 'T' + b.start_time));
    return futureLessons[0] || null;
  }, [events]);

  const materialsByTopic = useMemo(() => {
    if (!materials) return {};
    const grouped = {};
    materials.forEach((m) => {
      const topic = m.topic || 'כללי';
      if (!grouped[topic]) grouped[topic] = [];
      grouped[topic].push(m);
    });
    return grouped;
  }, [materials]);

  if (courseLoading) return (
    <div className="p-8 text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-600 mb-3" />
      <p className="text-slate-600 font-medium">טוען נתוני קורס...</p>
    </div>
  );

  if (!course) return (
    <div className="p-8 text-center">
      <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-3" />
      <p className="text-slate-600 font-medium">קורס לא נמצא</p>
    </div>
  );

  return (
    <div className="space-y-6" dir="rtl" style={{ textAlign: 'right' }}>
      <Toaster position="top-center" richColors />
      <TeacherPedagogicalToolbox
        course={course}
        sessions={syllabusSessions || []}
        events={events || []}
        students={students || []}
        materials={materials || []}
        assignments={assignments || []}
        grades={grades || []}
        messages={messages || []}
        nextSession={nextLesson}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-100"
      >
        <div className="relative min-h-[240px] bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 transition-all duration-500 ease-in-out flex flex-col justify-between p-8" dir="rtl" style={{ textAlign: 'right' }}>
          {course.media_url ? (
            <>
              <div className="absolute inset-0 z-0">
                <img src={course.media_url} alt="Course Cover" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30 z-0" />
            </>
          ) : (
            <div className="absolute inset-0 bg-black/10 z-0" />
          )}
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse z-0" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse z-0" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl animate-pulse z-0" style={{ animationDelay: '2s' }} />
          <div className="relative z-10 flex justify-between items-start w-full">
            <div className="flex items-start gap-5">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="h-16 w-16 bg-white/15 backdrop-blur-xl rounded-2xl flex items-center justify-center border-2 border-white/30 overflow-hidden shrink-0 shadow-2xl relative group"
              >
                {course.logo_url ? (
                  <img src={course.logo_url} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <GraduationCap className="h-9 w-9 text-white/90" />
                )}
                {!course.logo_url && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/80 hover:from-black/70 hover:to-black/90 text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                    onClick={async () => {
                      const loadingToast = toast.loading('יוצר לוגו מדהים...');
                      try {
                        const prompt = `A professional minimalist logo icon for educational course "${course.name}", clean modern design, simple geometric shapes, vibrant colors, white background, 4k`;
                        const res = await base44.integrations.Core.GenerateImage({ prompt });
                        if (res?.url) {
                          await base44.entities.Course.update(courseId, { logo_url: res.url });
                          queryClient.invalidateQueries({ queryKey: ['course', courseId] });
                          toast.success('לוגו נוצר בהצלחה!', { id: loadingToast });
                        }
                      } catch (e) {
                        toast.error('שגיאה ביצירת לוגו', { id: loadingToast });
                      }
                    }}
                  >
                    <Wand2 className="w-5 h-5" />
                  </Button>
                )}
              </motion.div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-3xl font-black text-white drop-shadow-2xl leading-tight mb-2"
                >
                  {course.name}
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 flex-wrap"
                >
                  <Badge className="text-xs font-bold bg-white/20 backdrop-blur-md text-white border-2 border-white/40 shadow-lg hover:bg-white/30 transition-all">
                    {course.code}
                  </Badge>
                  {course.institution && (
                    <span className="text-white/90 text-sm flex items-center gap-1.5 font-medium">
                      <MapPin className="h-4 w-4" />
                      {course.institution}
                    </span>
                  )}
                </motion.div>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/20 backdrop-blur-xl text-white px-4 py-2 rounded-full flex items-center gap-2.5 border-2 border-white/40 shadow-xl shrink-0"
            >
              <GraduationCap className="w-5 h-5" />
              <span className="text-sm font-black">קורס</span>
            </motion.div>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-5 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/95 items-center"
            >
              {course.audio_url && (
                <span className="flex items-center gap-2 bg-gradient-to-r from-indigo-500/40 to-purple-500/40 backdrop-blur-md px-3 py-1.5 rounded-full text-xs border-2 border-indigo-400/40 shadow-lg">
                  <Mic className="h-3.5 w-3.5 text-indigo-200" />
                  <span className="font-bold">הנחיה קולית</span>
                  <Sparkles className="h-3 w-3 text-yellow-300" />
                </span>
              )}
              {course.day_of_week && (
                <span className="flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 opacity-80" />
                  {course.day_of_week}, {course.start_time}-{course.end_time}
                </span>
              )}
              <span className="flex items-center gap-2 font-bold">
                <Users className="h-4 w-4 opacity-80" />
                {stats.students} תלמידים
              </span>
              {course.whatsapp_group_link && (
                <a
                  href={course.whatsapp_group_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-300 hover:text-emerald-200 transition-colors font-medium"
                >
                  <MessageCircle className="h-4 w-4" />
                  קבוצת וואטסאפ
                </a>
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-2 flex-wrap"
            >
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      className="h-10 w-10 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border-2 border-white/20 rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-110"
                      onClick={() => setCourseFormOpen(true)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-900 text-white border-0 font-bold">עריכת קורס</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      className="h-10 w-10 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border-2 border-white/20 rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-110"
                      onClick={handleSharePublicLink}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-900 text-white border-0 font-bold">דף ציבורי</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          className="h-10 w-10 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border-2 border-white/20 rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-110"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-2 border-purple-100 shadow-2xl rounded-xl">
                        <AttendanceReport
                          course={course}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 font-medium">
                              <Clock className="w-4 h-4 text-emerald-600" />
                              דוח נוכחות
                            </DropdownMenuItem>
                          }
                        />
                        <GradesReport
                          course={course}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 font-medium">
                              <TrendingUp className="w-4 h-4 text-blue-600" />
                              דוח ציונים
                            </DropdownMenuItem>
                          }
                        />
                        <MaterialsReviewDocument
                          course={course}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 font-medium">
                              <FolderOpen className="w-4 h-4 text-violet-600" />
                              סקירת חומרים
                            </DropdownMenuItem>
                          }
                        />
                        <ContentGapsReport
                          course={course}
                          sessions={syllabusSessions}
                          assignments={assignments}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 font-medium">
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                              דוח חסרים ושיפורים
                            </DropdownMenuItem>
                          }
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-900 text-white border-0">
                    <p className="font-bold">מסמכי עבודה ודוחות</p>
                    <p className="text-xs text-slate-300 mt-1">נוכחות • ציונים • חומרים • חסרים</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      className="h-10 w-10 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border-2 border-white/20 rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-110"
                      onClick={() => saveAsTemplateMutation.mutate()}
                    >
                      <LayoutTemplate className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-900 text-white border-0 font-bold">שמור כתבנית</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      className="h-10 w-10 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border-2 border-white/20 rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-110"
                      onClick={() => setEmbedDialogOpen(true)}
                    >
                      <Code2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-900 text-white border-0 font-bold">קוד הטמעה</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      className="h-10 w-10 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border-2 border-white/20 rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-110"
                      onClick={() => {
                        setMessageRecipients(students || []);
                        setMessageType('email');
                        setMessageDialogOpen(true);
                      }}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-900 text-white border-0 font-bold">שלח דוא"ל לכולם</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={`${createPageUrl('Messages')}?courseId=${courseId}`}>
                      <Button
                        size="icon"
                        className="h-10 w-10 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border-2 border-white/20 rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-110"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-900 text-white border-0 font-bold">ניהול הודעות</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      className="h-10 w-10 bg-gradient-to-br from-red-500/30 to-pink-500/30 hover:from-red-500/50 hover:to-pink-500/50 backdrop-blur-md text-red-100 hover:text-white border-2 border-red-400/40 rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-110"
                      onClick={() => setDeleteCourseDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-red-600 text-white border-0 font-bold">מחיקת קורס</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 border-t-2 border-purple-100 px-8 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-5 border-2 border-indigo-200 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">השיעור הבא</span>
                  {nextLesson && nextLesson.date ? (
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <span className="truncate">{nextLesson.title}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-indigo-600">{format(new Date(nextLesson.date), 'd/M HH:mm')}</span>
                      {nextLesson.location && <span className="text-slate-400 text-xs">({nextLesson.location})</span>}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic font-medium">אין שיעור מתוכנן</span>
                  )}
                </div>
              </div>
            </motion.div>
            <div className="grid grid-cols-3 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-4 border-2 border-emerald-200 shadow-md hover:shadow-lg transition-all text-center group hover:scale-105"
              >
                <div className="p-2 bg-emerald-100 rounded-lg inline-block mb-2 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">נוכחות</div>
                <div className="text-2xl font-black text-slate-800">{stats.attendance}%</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-md hover:shadow-lg transition-all text-center group hover:scale-105"
              >
                <div className="p-2 bg-blue-100 rounded-lg inline-block mb-2 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">מטלות</div>
                <div className="text-2xl font-black text-slate-800">{stats.assignments}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-4 border-2 border-amber-200 shadow-md hover:shadow-lg transition-all text-center group hover:scale-105"
              >
                <div className="p-2 bg-amber-100 rounded-lg inline-block mb-2 group-hover:scale-110 transition-transform">
                  <FolderOpen className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-1">חומרים</div>
                <div className="text-2xl font-black text-slate-800">{materials?.length || 0}</div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
      <SimpleMessageDialog
        open={messageDialogOpen}
        onClose={() => {
          setMessageDialogOpen(false);
          setMessageRecipients([]);
        }}
        recipients={messageRecipients.length > 0 ? messageRecipients : students || []}
        initialType={messageType}
        courseId={courseId}
      />
      <div className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl" style={{ textAlign: 'right' }}>
          <TabsList className="w-full justify-start bg-white p-2 rounded-2xl border-2 border-purple-100 shadow-xl mb-6 h-auto flex-wrap gap-2" dir="rtl">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="overview"
                    className="flex-1 min-w-[60px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all rounded-xl"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 text-white border-0 font-bold">סקירה</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="syllabus"
                    className="flex-1 min-w-[60px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all rounded-xl"
                  >
                    <BookOpen className="w-5 h-5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 text-white border-0 font-bold">סילבוס</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="students"
                    className="flex-1 min-w-[60px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all rounded-xl"
                  >
                    <Users className="w-5 h-5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 text-white border-0 font-bold">תלמידים</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="materials"
                    className="flex-1 min-w-[60px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all rounded-xl"
                  >
                    <FolderOpen className="w-5 h-5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 text-white border-0 font-bold">חומרי לימוד</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="assignments"
                    className="flex-1 min-w-[60px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all rounded-xl"
                  >
                    <FileText className="w-5 h-5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 text-white border-0 font-bold">מטלות</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="announcements"
                    className="flex-1 min-w-[60px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all rounded-xl"
                  >
                    <Bell className="w-5 h-5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 text-white border-0 font-bold">הכרזות</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="media"
                    className="flex-1 min-w-[60px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all rounded-xl"
                  >
                    <ImageIconLucide className="w-5 h-5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 text-white border-0 font-bold">מדיה</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="recordings"
                    className="flex-1 min-w-[60px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all rounded-xl"
                  >
                    <VideoIcon className="w-5 h-5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 text-white border-0 font-bold">הקלטות זום</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="messages"
                    className="flex-1 min-w-[60px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all rounded-xl"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 text-white border-0 font-bold">תקשורת</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="strategy"
                    className="flex-1 min-w-[60px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all rounded-xl"
                  >
                    <TrendingUp className="w-5 h-5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 text-white border-0 font-bold">אסטרטגיה</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="whatsapp"
                    className="flex-1 min-w-[60px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-lime-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all rounded-xl"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 text-white border-0 font-bold">WhatsApp</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="analytics"
                    className="flex-1 min-w-[60px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-gray-700 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all rounded-xl"
                  >
                    <BarChart3 className="w-5 h-5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 text-white border-0 font-bold">ויזואליזציה ואנליטיקה</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TabsList>
          <TabsContent value="overview" className="space-y-6" dir="rtl" style={{ textAlign: 'right' }}>
            <PublicViewAnalytics courseId={courseId} />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 rounded-3xl border-2 border-indigo-200 shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-black text-xl text-indigo-900 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg">
                    <Zap className="w-5 h-5" />
                  </div>
                  הנחיה קולית (Intro)
                </h4>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs bg-white border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-bold"
                    onClick={() => setCourseFormOpen(true)}
                  >
                    <Edit className="w-3.5 h-3.5 me-1" />
                    ערוך תמליל
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleGenerateAudio}
                    disabled={isGeneratingAudio}
                    className="h-8 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg font-bold"
                  >
                    {isGeneratingAudio ? (
                      <Loader2 className="w-3.5 h-3.5 me-1 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 me-1" />
                    )}
                    {course.audio_url ? 'הפק מחדש (AI)' : 'הפק אודיו (AI)'}
                  </Button>
                </div>
              </div>
              {course.audio_url ? (
                <div className="bg-white/70 backdrop-blur-sm p-3 rounded-2xl shadow-md">
                  <AudioPlayer src={course.audio_url} title="פתיח לקורס" minimal />
                </div>
              ) : (
                <div className="text-center py-6 bg-white/60 rounded-2xl border-2 border-dashed border-indigo-300">
                  <Mic className="w-10 h-10 mx-auto mb-2 text-indigo-300" />
                  <p className="text-sm text-indigo-500 font-medium">טרם הופק אודיו לקורס זה</p>
                </div>
              )}
              {course.audio_script && (
                <div className="mt-4 text-sm text-slate-600 bg-white/50 backdrop-blur-sm p-4 rounded-xl border-2 border-indigo-100 shadow-sm">
                  <span className="font-black text-indigo-900 block mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    תמליל:
                  </span>
                  <p className="leading-relaxed">{course.audio_script}</p>
                </div>
              )}
            </motion.div>
            {announcements && announcements.length > 0 && (
              <Card className="border-s-4 border-s-orange-500 border-2 shadow-xl" dir="rtl" style={{ textAlign: 'right' }}>
                <CardHeader className="flex flex-row-reverse items-center justify-between pb-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b-2 border-orange-100" dir="rtl">
                  <CardTitle className="text-xl font-black flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-xl">
                      <Bell className="h-6 w-6 text-orange-600" />
                    </div>
                    לוח מודעות
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('announcements')}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 font-bold"
                  >
                    לכל ההודעות
                    <ArrowRight className="w-4 h-4 me-1" />
                  </Button>
                </CardHeader>
                <CardContent className="p-6" dir="rtl" style={{ textAlign: 'right' }}>
                  <div className="space-y-4">
                    {announcements
                      .sort((a, b) => {
                        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
                        return new Date(b.created_date) - new Date(a.created_date);
                      })
                      .slice(0, 3)
                      .map((announcement, idx) => (
                        <motion.div
                          key={announcement.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-4 rounded-2xl border-2 bg-gradient-to-br from-white to-orange-50/30 border-orange-200 hover:shadow-lg transition-all"
                          dir="rtl"
                          style={{ textAlign: 'right' }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                              {announcement.is_pinned && (
                                <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs h-5 px-2 shadow-md">
                                  נעוץ
                                </Badge>
                              )}
                              {announcement.title}
                            </h4>
                            <span className="text-xs text-slate-400 font-medium">
                              {formatIsraelDate(announcement.created_date, 'dd/MM/yyyy')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {announcement.content}
                          </p>
                        </motion.div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 border-violet-100 shadow-xl" dir="rtl" style={{ textAlign: 'right' }}>
                <CardHeader className="flex flex-row-reverse items-center justify-between bg-gradient-to-r from-violet-50 to-purple-50 border-b-2 border-violet-100" dir="rtl">
                  <CardTitle className="text-lg font-black flex items-center gap-2">
                    <div className="p-1.5 bg-violet-100 rounded-lg">
                      <FolderOpen className="w-5 h-5 text-violet-600" />
                    </div>
                    חומרים אחרונים
                  </CardTitle>
                  <Link to={createPageUrl('Materials')} className="text-sm text-violet-600 hover:underline font-bold">
                    לכל החומרים →
                  </Link>
                </CardHeader>
                <CardContent className="p-5" dir="rtl" style={{ textAlign: 'right' }}>
                  {materials && materials.length > 0 ? (
                    <div className="space-y-3">
                      {materials.slice(0, 3).map((m, idx) => {
                        const MaterialIcon =
                          m.type === 'video' ? VideoIcon :
                          m.type === 'presentation' ? Presentation :
                          m.type === 'link' ? LinkIcon :
                          FileText;
                        return (
                          <motion.div
                            key={m.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 rounded-xl cursor-pointer border-2 border-transparent hover:border-violet-200 transition-all group"
                            dir="rtl"
                            style={{ textAlign: 'right' }}
                          >
                            <div className={`p-2.5 rounded-xl shadow-md group-hover:scale-110 transition-transform ${
                              m.type === 'video' ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white' :
                              m.type === 'presentation' ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white' :
                              m.type === 'link' ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' :
                              'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                            }`}>
                              <MaterialIcon className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate">{m.title}</p>
                              <p className="text-xs text-slate-500">{m.topic || 'כללי'}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-slate-400 py-6">אין חומרים</p>
                  )}
                </CardContent>
              </Card>
              <Card className="border-2 border-blue-100 shadow-xl" dir="rtl" style={{ textAlign: 'right' }}>
                <CardHeader className="flex flex-row-reverse items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-100" dir="rtl">
                  <CardTitle className="text-lg font-black flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    הודעות אחרונות
                  </CardTitle>
                  <Link to={createPageUrl('Messages')} className="text-sm text-blue-600 hover:underline font-bold">
                    לכל ההודעות →
                  </Link>
                </CardHeader>
                <CardContent className="p-5" dir="rtl" style={{ textAlign: 'right' }}>
                  {messages && messages.length > 0 ? (
                    <div className="space-y-3">
                      {messages.slice(0, 3).map((m, idx) => (
                        <motion.div
                          key={m.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex gap-3 p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 rounded-xl border-2 border-transparent hover:border-blue-200 transition-all"
                          dir="rtl"
                          style={{ textAlign: 'right' }}
                        >
                          <div className={`p-2 rounded-full h-fit shadow-md ${
                            m.type === 'email' ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' :
                            'bg-gradient-to-br from-slate-500 to-gray-600 text-white'
                          }`}>
                            <Mail className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{formatMessageContent(m.subject, m)}</p>
                            <p className="text-xs text-slate-500">{formatIsraelDate(m.created_date, 'dd/MM/yyyy')}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-400 py-6">אין הודעות</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="syllabus" className="space-y-6" dir="rtl" style={{ textAlign: 'right' }}>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setScheduleManagerOpen(true)}
                className="gap-2 border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold"
              >
                <Calendar className="w-4 h-4" />
                מחולל מערכת שעות
              </Button>
            </div>
            <SyllabusManager course={course} />
            {scheduleManagerOpen && (
              <ScheduleManager
                course={course}
                open={scheduleManagerOpen}
                onClose={() => setScheduleManagerOpen(false)}
              />
            )}
          </TabsContent>
          <TabsContent value="students" className="space-y-6" dir="rtl" style={{ textAlign: 'right' }}>
            {selectedStudentIds.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl shadow-lg">
                <span className="text-sm font-bold text-indigo-900 px-3 ms-2 border-s-2 border-indigo-300">
                  {selectedStudentIds.length} תלמידים נבחרו
                </span>
                <span className="text-xs text-slate-600 ms-2 font-medium">שלח הודעה מרוכזת:</span>
                <Button size="sm" onClick={() => handleBulkMessage('whatsapp')} className="bg-[#25D366] hover:bg-[#128C7E] text-white h-9 gap-2 font-bold shadow-md">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
                <Button size="sm" onClick={() => handleBulkMessage('email')} variant="outline" className="bg-white border-2 border-blue-300 text-blue-700 hover:bg-blue-50 h-9 gap-2 font-bold">
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                <Button size="sm" onClick={() => handleBulkMessage('sms')} variant="outline" className="bg-white border-2 border-green-300 text-green-700 hover:bg-green-50 h-9 gap-2 font-bold">
                  <MessageSquare className="w-4 h-4" />
                  SMS
                </Button>
                <div className="flex-1" />
                <Button size="sm" variant="ghost" onClick={() => setSelectedStudentIds([])} className="text-slate-500 hover:text-slate-700 h-9 font-bold">
                  ביטול בחירה
                </Button>
              </div>
            )}
            {students && (
              <div dir="rtl" style={{ textAlign: 'right' }}>
                <StudentTable
                  students={students}
                  courses={[course]}
                  attendanceStats={{}}
                  onView={(s) => navigate(createPageUrl('StudentProfile') + `?id=${s.id}`)}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onSendSMS={handleSendSMS}
                  onSendEmail={handleSendEmail}
                  onStatusChange={async (student, newStatus) => {
                    try {
                      await base44.entities.Student.update(student.id, { status: newStatus });
                      queryClient.invalidateQueries({ queryKey: ['courseStudents'] });
                      toast.success('הסטטוס עודכן');
                    } catch (e) {
                      toast.error('שגיאה בעדכון סטטוס');
                  }
                }}
                selectedIds={selectedStudentIds}
                onSelectionChange={setSelectedStudentIds}
              />
              </div>
            )}
          </TabsContent>
          <TabsContent value="materials" className="space-y-6" dir="rtl" style={{ textAlign: 'right' }}>
            {Object.entries(materialsByTopic).map(([topic, topicMaterials]) => (
              <div key={topic} className="space-y-4" dir="rtl" style={{ textAlign: 'right' }}>
                <h3 className="font-bold text-lg text-slate-700 flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-violet-500" />
                  {topic}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topicMaterials.map((m) => {
                    const MaterialIcon = 
                      m.type === 'video' ? VideoIcon :
                      m.type === 'presentation' ? Presentation :
                      m.type === 'link' ? LinkIcon :
                      FileText;
                    return (
                      <Card key={m.id} className="hover:border-violet-300 hover:shadow-lg transition-all border-2" dir="rtl" style={{ textAlign: 'right' }}>
                        <CardContent className="p-4" dir="rtl" style={{ textAlign: 'right' }}>
                          <div className="flex items-start gap-3">
                            <div className={`p-3 rounded-xl shadow-md ${
                              m.type === 'video' ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white' :
                              m.type === 'presentation' ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white' :
                              m.type === 'link' ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' :
                              'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                            }`}>
                              <MaterialIcon className="h-7 w-7" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-800">{m.title}</h4>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{m.description}</p>
                            </div>
                          </div>
                          {m.file_url && (
                            <Button asChild variant="link" className="p-0 h-auto mt-3 text-violet-600 font-bold">
                              <a href={m.file_url} target="_blank" rel="noopener noreferrer">
                                צפייה בחומר →
                              </a>
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
            {(!materials || materials.length === 0) && (
              <div className="text-center py-12 text-slate-500 bg-white rounded-xl border-2 border-dashed">
                אין חומרי לימוד בקורס זה עדיין
              </div>
            )}
          </TabsContent>
          <TabsContent value="assignments" className="space-y-6" dir="rtl" style={{ textAlign: 'right' }}>
            <div className="flex justify-between items-center mb-6" dir="rtl">
              <div>
                <h3 className="text-xl font-bold text-slate-800">מטלות הקורס</h3>
                <p className="text-sm text-slate-500">ניהול מטלות, בחנים ופרויקטים</p>
              </div>
              <div className="flex gap-2">
                <AssignmentImportDialog
                  courseId={courseId}
                  onSuccess={() => queryClient.invalidateQueries({ queryKey: ['courseAssignments'] })}
                />
                <AutoGenerateAssignmentsDialog courseId={courseId} />
                <Button onClick={() => setAssignmentFormOpen(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-bold shadow-lg">
                  <Plus className="w-4 w-4 ms-2" />
                  מטלה חדשה
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl" style={{ textAlign: 'right' }}>
              {assignments?.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  courseName={course?.name}
                  submissionStats={{
                    submitted: grades?.filter((g) => g.assignment_id === assignment.id && g.submission_status === 'submitted').length || 0,
                    total: students?.length || 0,
                    pendingGrading: grades?.filter((g) => g.assignment_id === assignment.id && g.submission_status === 'submitted' && (g.score === undefined || g.score === null)).length || 0
                  }}
                  onEdit={handleEditAssignment}
                  onDelete={handleDeleteAssignment}
                  onToggleStatus={handleToggleAssignmentStatus}
                  onShare={() => {
                    const link = `${window.location.origin}${createPageUrl('PublicView')}?type=assignment&id=${assignment.id}`;
                    navigator.clipboard.writeText(link);
                    toast.success('קישור למטלה הועתק');
                  }}
                  onViewSubmissions={setSelectedAssignmentForSubmissions}
                />
              ))}
              {(!assignments || assignments.length === 0) && (
                <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border-2 border-dashed">
                  אין מטלות בקורס זה עדיין
                </div>
              )}
            </div>
            {selectedAssignmentForSubmissions && (
              <SubmissionsDialog
                open={!!selectedAssignmentForSubmissions}
                onClose={() => setSelectedAssignmentForSubmissions(null)}
                assignment={selectedAssignmentForSubmissions}
                grades={grades}
                students={students}
              />
            )}
          </TabsContent>
          <TabsContent value="announcements" className="space-y-6" dir="rtl" style={{ textAlign: 'right' }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>לוח מודעות והכרזות</CardTitle>
                <Link to={createPageUrl('Announcements')}>
                  <Button variant="outline" size="sm" className="gap-2 font-bold">
                    <Settings className="w-4 h-4" />
                    ניהול הכרזות
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements?.sort((a, b) => {
                    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
                    return new Date(b.created_date) - new Date(a.created_date);
                  }).map((announcement) => (
                    <div key={announcement.id} className={`p-5 rounded-xl border-2 ${announcement.is_pinned ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300 shadow-md' : 'bg-white border-slate-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {announcement.is_pinned && <Badge className="bg-orange-500 hover:bg-orange-600 shadow-sm">נעוץ</Badge>}
                          <h3 className="font-bold text-lg text-slate-800">{announcement.title}</h3>
                        </div>
                        <span className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatIsraelDate(announcement.created_date)}
                        </span>
                      </div>
                      <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{announcement.content}</p>
                      {announcement.author_name && (
                        <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-slate-400">
                          <Users className="w-3 h-3" />
                          פורסם ע"י {announcement.author_name}
                        </div>
                      )}
                    </div>
                  ))}
                  {(!announcements || announcements.length === 0) && (
                    <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      אין הכרזות בקורס זה
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="media" className="space-y-6" dir="rtl" style={{ textAlign: 'right' }}>
            <CourseMediaGallery
              course={course}
              sessions={syllabusSessions}
              assignments={assignments}
              materials={materials}
            />
          </TabsContent>
          <TabsContent value="recordings" className="space-y-6" dir="rtl" style={{ textAlign: 'right' }}>
            <ZoomRecordingsList courseId={courseId} />
          </TabsContent>
          <TabsContent value="messages" className="space-y-6" dir="rtl" style={{ textAlign: 'right' }}>
            <div className="flex justify-end mb-4">
              <Button variant="outline" onClick={() => setActiveTab('strategy')} className="gap-2 border-2 border-violet-300 text-violet-700 hover:bg-violet-50 font-bold">
                <TrendingUp className="w-4 h-4" />
                נהל אסטרטגיית תקשורת
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>היסטוריית הודעות לקורס</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages?.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map((msg) => (
                    <div key={msg.id} className="flex gap-4 p-4 border-2 rounded-xl bg-slate-50 hover:border-blue-300 transition-all">
                      <div className={`mt-1 p-2 rounded-full h-fit shadow-md ${
                        msg.type === 'email' ? 'bg-blue-100 text-blue-600' :
                        msg.type === 'sms' ? 'bg-green-100 text-green-600' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {msg.type === 'email' ? <Mail className="h-4 w-4" /> :
                         msg.type === 'sms' ? <Phone className="h-4 w-4" /> :
                         <MessageSquare className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-900">{formatMessageContent(msg.subject, msg)}</h4>
                          <span className="text-xs text-slate-500">{formatIsraelDate(msg.created_date)}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap leading-relaxed">{formatMessageContent(msg.content, msg)}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 me-1" />
                            {msg.student_ids?.length || 0} נמענים
                          </Badge>
                          {msg.template_id && (
                            <Badge variant="secondary" className="text-xs bg-violet-100 text-violet-700">
                              <Zap className="h-3 w-3 me-1" />
                              הודעה חכמה
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!messages || messages.length === 0) && (
                    <p className="text-center text-slate-500 py-8">אין היסטוריית הודעות</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="strategy" className="space-y-6" dir="rtl" style={{ textAlign: 'right' }}>
            {course && <CommunicationStrategy course={course} />}
          </TabsContent>
          <TabsContent value="whatsapp" className="space-y-6" dir="rtl" style={{ textAlign: 'right' }}>
            {course && <WhatsAppGroupView course={course} />}
          </TabsContent>
          <TabsContent value="analytics" className="space-y-6" dir="rtl" style={{ textAlign: 'right' }}>
            <CourseAnalyticsDashboard
              course={course}
              students={students}
              assignments={assignments}
              grades={grades}
              attendance={attendance}
              materials={materials}
              sessions={syllabusSessions}
              messages={messages}
            />
          </TabsContent>
        </Tabs>
      </div>
      <AssignmentForm
        open={assignmentFormOpen}
        onClose={() => {
          setAssignmentFormOpen(false);
          setEditingAssignment(null);
        }}
        onSubmit={handleAssignmentSubmit}
        assignment={editingAssignment}
        courses={course ? [course] : []}
        isLoading={createAssignmentMutation.isPending || updateAssignmentMutation.isPending}
      />
      {course && (
        <CourseForm
          open={courseFormOpen}
          onClose={() => setCourseFormOpen(false)}
          onSubmit={(data) => updateCourseMutation.mutate(data)}
          course={course}
          isLoading={updateCourseMutation.isPending}
        />
      )}
      <AlertDialog open={deleteCourseDialogOpen} onOpenChange={setDeleteCourseDialogOpen}>
        <AlertDialogContent className="bg-white border-2 border-red-200 shadow-2xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-red-900 flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              האם למחוק את הקורס?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 leading-relaxed">
              פעולה זו תמחק את הקורס "<span className="font-bold text-red-600">{course?.name}</span>" לצמיתות.
              <br /><br />
              <strong className="text-slate-900">שימו לב:</strong> הפעולה תמחק גם את כל המפגשים, המטלות, ההודעות והאירועים הקשורים לקורס. תלמידים יוסרו מהרישום לקורס זה.
              <br />
              <strong className="text-red-600">הפעולה אינה ניתנת לביטול.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-slate-700 hover:bg-slate-800 text-white font-bold">
              ביטול
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCourseMutation.mutate(course?.id)}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold shadow-lg"
            >
              מחיקה סופית
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={deleteAssignmentDialogOpen} onOpenChange={setDeleteAssignmentDialogOpen}>
        <AlertDialogContent className="bg-white border-2 border-red-200 shadow-2xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-red-900">האם למחוק את המטלה?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              פעולה זו תמחק את "<span className="font-bold text-red-600">{assignmentToDelete?.title}</span>" לצמיתות.
              <br />
              הפעולה אינה ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-slate-700 hover:bg-slate-800 text-white font-bold">
              ביטול
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAssignmentMutation.mutate(assignmentToDelete?.id)}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold shadow-lg"
            >
              מחיקה
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <EmbedCodeDialog
        open={embedDialogOpen}
        onClose={() => setEmbedDialogOpen(false)}
        url={`${window.location.origin}${createPageUrl('PublicView')}?type=course&id=${courseId}`}
        title={course?.name || 'קורס'}
      />
    </div>
  );
}