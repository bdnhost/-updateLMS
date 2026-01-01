import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight, Calendar, Clock, FileText, Users, CheckCircle2,
  XCircle, Share2, MoreVertical, Edit, Trash2, Copy, BarChart3,
  Lightbulb, Link as LinkIcon, Download, Trophy, AlertTriangle,
  LayoutTemplate, ExternalLink, HelpCircle, Eye, Mic, ImageIcon, Code2, FolderOpen, Plus } from
  'lucide-react';
import AudioPlayer from '@/components/common/AudioPlayer';
import EmbedCodeDialog from '@/components/common/EmbedCodeDialog';
import AssignmentPrintDocument from '@/components/documents/AssignmentPrintDocument';
import { format, isPast, differenceInDays, isValid } from 'date-fns';
import { he } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator } from
'@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import SubmissionsDialog from '@/components/assignments/SubmissionsDialog';
import AssignmentForm from '@/components/assignments/AssignmentForm';
import InteractiveAssignmentView from '@/components/public/InteractiveAssignmentView';
import AssignmentRoadmap from '@/components/assignments/AssignmentRoadmap';
import ProjectSummaryView from '@/components/public/views/ProjectSummaryView';

export default function AssignmentProfile() {
  const queryParams = new URLSearchParams(window.location.search);
  const assignmentId = queryParams.get('id');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const queryClient = useQueryClient();

  // Fetch Assignment Data
  const { data: assignment, isLoading: assignmentLoading } = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () => base44.entities.Assignment.get(assignmentId),
    enabled: !!assignmentId,
    refetchInterval: 5000 // Poll every 5 seconds to catch async media generation
  });

  // Fetch Related Data
  const { data: course } = useQuery({
    queryKey: ['course', assignment?.course_id],
    queryFn: () => base44.entities.Course.get(assignment.course_id),
    enabled: !!assignment?.course_id
  });

  const { data: grades } = useQuery({
    queryKey: ['assignmentGrades', assignmentId],
    queryFn: () => base44.entities.Grade.filter({ assignment_id: assignmentId }),
    enabled: !!assignmentId
  });

  const { data: session } = useQuery({
    queryKey: ['courseSession', assignment?.session_id],
    queryFn: () => base44.entities.CourseSession.get(assignment.session_id),
    enabled: !!assignment?.session_id
  });

  const { data: students } = useQuery({
    queryKey: ['courseStudents', assignment?.course_id],
    queryFn: () => base44.entities.Student.filter({ course_id: assignment.course_id }),
    enabled: !!assignment?.course_id
  });

  const { data: courseMaterials } = useQuery({
    queryKey: ['courseMaterials', assignment?.course_id],
    queryFn: async () => {
      const [legacy, newMats] = await Promise.all([
        base44.entities.Material.filter({ course_id: assignment.course_id }),
        base44.entities.Material.filter({ course_ids: assignment.course_id })
      ]);
      const all = [...(legacy || []), ...(newMats || [])];
      return all.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);
    },
    enabled: !!assignment?.course_id
  });

  const { data: relatedMaterials } = useQuery({
    queryKey: ['relatedMaterials', assignment?.related_material_ids],
    queryFn: async () => {
      if (!assignment?.related_material_ids || assignment.related_material_ids.length === 0) return [];
      const promises = assignment.related_material_ids.map((id) => base44.entities.Material.get(id));
      const results = await Promise.all(promises);
      return results.filter(Boolean);
    },
    enabled: !!assignment?.related_material_ids && assignment.related_material_ids.length > 0
  });

  // Mutations
  const updateAssignmentMutation = useMutation({
    mutationFn: (data) => base44.entities.Assignment.update(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] });
      setIsEditOpen(false);
      toast.success('המטלה עודכנה בהצלחה');
    },
    onError: () => toast.error('שגיאה בעדכון המטלה')
  });

  const saveAsTemplateMutation = useMutation({
    mutationFn: async () => {
      const templateData = {
        organization_id: assignment.organization_id,
        name: `תבנית: ${assignment.title}`,
        description: assignment.description,
        type: assignment.type,
        default_title: assignment.title,
        default_description: assignment.description,
        video_url: assignment.video_url,
        key_concepts: assignment.key_concepts || [],
        resource_links: assignment.resource_links || [],
        max_score: assignment.max_score,
        is_global: false
      };
      return base44.entities.AssignmentTemplate.create(templateData);
    },
    onSuccess: () => toast.success('המטלה נשמרה כתבנית חדשה'),
    onError: () => toast.error('שגיאה בשמירת התבנית')
  });

  const linkMaterialMutation = useMutation({
    mutationFn: async (materialId) => {
      const currentIds = assignment.related_material_ids || [];
      if (currentIds.includes(materialId)) {
        toast.info('חומר זה כבר מקושר');
        return;
      }
      return base44.entities.Assignment.update(assignmentId, {
        related_material_ids: [...currentIds, materialId]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] });
      setMaterialDialogOpen(false);
      setSelectedMaterialId('');
      toast.success('חומר לימוד קושר בהצלחה');
    }
  });

  const unlinkMaterialMutation = useMutation({
    mutationFn: async (materialId) => {
      const currentIds = assignment.related_material_ids || [];
      return base44.entities.Assignment.update(assignmentId, {
        related_material_ids: currentIds.filter(id => id !== materialId)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] });
      toast.success('חומר לימוד הוסר');
    }
  });

  // Derived Stats
  const stats = useMemo(() => {
    if (!students || !grades) return { submitted: 0, pending: 0, late: 0, avgScore: 0, total: 0, submissionRate: 0 };

    const validGrades = grades.filter(g => g);
    const submittedCount = validGrades.filter((g) => g.submission_status === 'submitted' || g.submission_status === 'late').length;
    const lateCount = validGrades.filter((g) => g.submission_status === 'late').length;

    const scores = validGrades.filter((g) => typeof g?.score === 'number').map((g) => g.score);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    return {
      submitted: submittedCount,
      total: students.length,
      pending: students.length - submittedCount,
      late: lateCount,
      avgScore,
      submissionRate: students.length > 0 ? Math.round(submittedCount / students.length * 100) : 0
    };
  }, [students, grades]);

  if (assignmentLoading) return <div className="p-8 text-center"><span className="loading loading-spinner text-primary"></span> טוען פרטי מטלה...</div>;
  if (!assignment) return <div className="p-8 text-center">מטלה לא נמצאה</div>;

  const typeColors = {
    assignment: 'bg-blue-100 text-blue-700',
    quiz: 'bg-purple-100 text-purple-700',
    exam: 'bg-red-100 text-red-700',
    project: 'bg-emerald-100 text-emerald-700'
  };

  const dueDateObj = assignment.due_date ? new Date(assignment.due_date) : null;
  const isDateValid = dueDateObj && isValid(dueDateObj);
  const isOverdue = isDateValid && isPast(dueDateObj) && assignment.status === 'open';

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${
        assignment.type === 'exam' ? 'from-red-500 to-pink-600' :
        assignment.type === 'quiz' ? 'from-purple-500 to-indigo-600' :
        assignment.type === 'project' ? 'from-emerald-500 to-teal-600' :
        'from-blue-500 to-cyan-600'}`
        } />
        <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex gap-4 items-start">
                    <div className={`p-3 rounded-xl shrink-0 ${
                        assignment.type === 'exam' ? 'bg-red-100 text-red-700' :
                        assignment.type === 'quiz' ? 'bg-purple-100 text-purple-700' :
                        assignment.type === 'project' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                        {assignment.type === 'exam' ? <Trophy className="w-8 h-8" /> :
                         assignment.type === 'quiz' ? <HelpCircle className="w-8 h-8" /> :
                         assignment.type === 'project' ? <LayoutTemplate className="w-8 h-8" /> :
                         <FileText className="w-8 h-8" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`px-3 py-1 rounded-xl flex items-center gap-2 shadow-sm font-bold text-sm ${
                                assignment.type === 'exam' ? 'bg-red-100 text-red-700' :
                                assignment.type === 'quiz' ? 'bg-purple-100 text-purple-700' :
                                assignment.type === 'project' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-blue-100 text-blue-700'
                            }`}>
                                {assignment.type === 'exam' ? <Trophy className="w-4 h-4" /> :
                                 assignment.type === 'quiz' ? <HelpCircle className="w-4 h-4" /> :
                                 assignment.type === 'project' ? <LayoutTemplate className="w-4 h-4" /> :
                                 <FileText className="w-4 h-4" />}
                                <span>
                                    {assignment.type === 'exam' ? 'מבחן' :
                                     assignment.type === 'quiz' ? 'בוחן' :
                                     assignment.type === 'project' ? 'פרויקט' : 'מטלה'}
                                </span>
                            </div>
                            {assignment.status === 'closed' && <Badge variant="secondary">סגור</Badge>}
                            {isOverdue && <Badge variant="destructive">פג תוקף</Badge>}
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2" dir="rtl">{assignment.title}</h1>
                        {course &&
                  <Link to={`${createPageUrl('CourseProfile')}?id=${course.id}`} className="text-slate-500 hover:text-indigo-600 flex items-center gap-1">
                                <ArrowRight className="w-4 h-4 rotate-180" />
                                {course.name} ({course.code})
                            </Link>
                  }
                        {session &&
                  <div className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                מפגש {session.session_number}: {session.title}
                            </div>
                  }
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                     {/* Action Icons Bar */}
                     <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setIsSubmissionsOpen(true)}
                            className="text-slate-600 hover:text-indigo-600 hover:bg-white shadow-none hover:shadow-sm"
                            title="בדיקת הגשות"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="hidden sm:inline mr-2">בדיקה</span>
                        </Button>
                        <Separator orientation="vertical" className="h-6 mx-1" />
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setIsEditOpen(true)}
                            className="text-slate-600 hover:text-indigo-600 hover:bg-white shadow-none hover:shadow-sm"
                            title="עריכה"
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                           variant="ghost" 
                           size="sm" 
                           onClick={() => {
                               const link = `${window.location.origin}${createPageUrl('PublicView')}?type=assignment&id=${assignment.id}`;
                               window.open(link, '_blank');
                           }}
                           className="text-slate-600 hover:text-indigo-600 hover:bg-white shadow-none hover:shadow-sm"
                           title="תצוגה מקדימה"
                        >
                           <Eye className="w-4 h-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-6 mx-1" />
                        <AssignmentPrintDocument 
                           assignment={assignment}
                           course={course}
                           trigger={
                               <Button 
                                   variant="ghost" 
                                   size="sm" 
                                   className="text-slate-600 hover:text-indigo-600 hover:bg-white shadow-none hover:shadow-sm"
                                   title="הדפסת מטלה לתלמידים"
                               >
                                   <FileText className="w-4 h-4" />
                                   <span className="hidden md:inline mr-2">הדפסה</span>
                               </Button>
                           }
                        />
                        <Separator orientation="vertical" className="h-6 mx-1" />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-indigo-600">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEmbedDialogOpen(true)}>
                                    <Code2 className="w-4 h-4 ml-2" />
                                    קוד הטמעה (Embed)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => saveAsTemplateMutation.mutate()}>
                                    <LayoutTemplate className="w-4 h-4 ml-2" />
                                    שמור כתבנית
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    const link = `${window.location.origin}${createPageUrl('PublicView')}?type=assignment&id=${assignment.id}`;
                                    navigator.clipboard.writeText(link);
                                    toast.success('הקישור הועתק');
                                }}>
                                    <Share2 className="w-4 h-4 ml-2" />
                                    העתק קישור להפצה
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 ml-2" />
                                    מחיקת מטלה
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">תאריך הגשה</p>
                        <p className="font-semibold text-slate-800">
                          {isDateValid ? format(dueDateObj, 'dd/MM/yyyy') : 'לא נקבע'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">ניקוד מקסימלי</p>
                        <p className="font-semibold text-slate-800">{assignment.max_score || 100} נק'</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">סטטוס הגשות</p>
                        <p className="font-semibold text-slate-800">{stats.submitted} / {stats.total}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">ממוצע ציונים</p>
                        <p className="font-semibold text-slate-800">{stats.avgScore}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Pedagogical Roadmap - Visual Indicator */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="text-sm font-semibold text-slate-500 mb-2">מפת דרכים למטלה</div>
          <AssignmentRoadmap status={assignment.status === 'closed' ? 'submitted' : 'open'} />
      </div>

      <div className="grid grid-cols-1 gap-6">
          {/* Main Content - Full Width now */}
          <div className="space-y-6">
              <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="bg-white p-1 border w-full justify-start h-auto rounded-xl">
                      <TabsTrigger value="overview" className="flex-1 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                          <FileText className="w-4 h-4 ml-2" />
                          דף המטלה והנחיות
                      </TabsTrigger>
                      <TabsTrigger value="materials" className="flex-1 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                          <FolderOpen className="w-4 h-4 ml-2" />
                          חומרי לימוד
                      </TabsTrigger>
                      <TabsTrigger value="submissions" className="flex-1 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                          <CheckCircle2 className="w-4 h-4 ml-2" />
                          הגשות וציונים
                      </TabsTrigger>
                      <TabsTrigger value="insights" className="flex-1 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                          <Lightbulb className="w-4 h-4 ml-2" />
                          תובנות
                      </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6 mt-6">
                      
                      {/* Media & Audio Section */}
                      {(assignment.audio_url || assignment.media_url) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {assignment.audio_url && (
                                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 h-full">
                                    <CardContent className="pt-6">
                                        <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                            <Mic className="w-4 h-4" />
                                            הנחיה קולית
                                        </h3>
                                        <AudioPlayer src={assignment.audio_url} title={assignment.title} />
                                        {assignment.audio_script && (
                                            <div className="mt-3 p-3 bg-white/60 rounded border border-indigo-50 text-xs text-slate-500 max-h-20 overflow-y-auto">
                                                {assignment.audio_script}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                            
                            {assignment.media_url && (
                                <Card className="overflow-hidden border-indigo-100 h-full">
                                    <div className="relative h-48 bg-slate-100 group">
                                        <img 
                                            src={assignment.media_url} 
                                            alt="Assignment Media" 
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <Button asChild size="sm" variant="secondary" className="bg-white/90 text-slate-800 shadow-sm">
                                                <a href={assignment.media_url} target="_blank" rel="noopener noreferrer">
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    הגדל
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                                        <ImageIcon className="w-3 h-3 text-indigo-500" />
                                        <span className="text-xs font-medium text-slate-600">מדיה ויזואלית (AI)</span>
                                    </div>
                                </Card>
                            )}
                        </div>
                      )}

                      <Card>
                          <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2">
                                  <FileText className="w-5 h-5 text-indigo-600" />
                                  תיאור והנחיות
                              </CardTitle>
                          </CardHeader>
                          <CardContent>
                              <div 
                                className="text-slate-600 leading-relaxed prose prose-slate max-w-none text-start" 
                                dir="rtl"
                                dangerouslySetInnerHTML={{ __html: assignment.description || '<p class="text-slate-400">אין תיאור זמין</p>' }}
                              />
                          </CardContent>
                      </Card>

                      {/* Project Details View */}
                      {assignment.type === 'project' && assignment.content_data && (
                          <Card>
                              <CardHeader>
                                  <CardTitle className="text-lg flex items-center gap-2">
                                      <LayoutTemplate className="w-5 h-5 text-emerald-600" />
                                      אבני דרך ומבנה הפרויקט
                                  </CardTitle>
                              </CardHeader>
                              <CardContent>
                                  <ProjectSummaryView resource={assignment} contentData={assignment.content_data} />
                              </CardContent>
                          </Card>
                      )}

                      {/* Exam/Quiz Details View */}
                      {(assignment.type === 'exam' || assignment.type === 'quiz') && assignment.content_data?.questions && (
                          <Card>
                              <CardHeader>
                                  <CardTitle className="text-lg flex items-center gap-2">
                                      <HelpCircle className="w-5 h-5 text-purple-600" />
                                      שאלות ה{assignment.type === 'exam' ? 'מבחן' : 'בוחן'}
                                  </CardTitle>
                              </CardHeader>
                              <CardContent>
                                  <div className="space-y-4">
                                      <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                                          <Trophy className="w-4 h-4 text-purple-600" />
                                          <span>סה"כ {assignment.content_data.questions.length} שאלות</span>
                                      </div>
                                      <div className="space-y-3">
                                          {assignment.content_data.questions.map((q, idx) => (
                                              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                                  <div className="flex items-start gap-3">
                                                      <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                          {idx + 1}
                                                      </div>
                                                      <div className="flex-1">
                                                          <p className="font-medium text-slate-800 mb-2">{q.text}</p>
                                                          {q.type === 'multiple_choice' && q.options && (
                                                              <div className="space-y-1 mr-6">
                                                                  {q.options.map((opt, optIdx) => (
                                                                      <div key={optIdx} className="flex items-center gap-2 text-sm">
                                                                          <div className={`w-4 h-4 rounded-full border-2 ${q.correctAnswer === optIdx ? 'border-green-500 bg-green-100' : 'border-slate-300'}`} />
                                                                          <span className={q.correctAnswer === optIdx ? 'text-green-700 font-medium' : 'text-slate-600'}>{opt}</span>
                                                                      </div>
                                                                  ))}
                                                              </div>
                                                          )}
                                                          <div className="flex items-center gap-2 mt-2">
                                                              <Badge variant="outline" className="text-xs">
                                                                  {q.points || 0} נקודות
                                                              </Badge>
                                                              <Badge variant="outline" className="text-xs">
                                                                  {q.type === 'multiple_choice' ? 'רב ברירה' : 'פתוחה'}
                                                              </Badge>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              </CardContent>
                          </Card>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card>
                              <CardHeader>
                                  <CardTitle className="text-lg flex items-center gap-2">
                                      <Lightbulb className="w-5 h-5 text-amber-500" />
                                      מושגי מפתח
                                  </CardTitle>
                              </CardHeader>
                              <CardContent>
                                  {assignment.key_concepts && assignment.key_concepts.length > 0 ?
                    <ul className="space-y-2">
                                          {assignment.key_concepts.map((concept, idx) =>
                      <li key={idx} className="flex items-start gap-2 text-slate-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                                                  <CheckCircle2 className="w-4 h-4 text-amber-600 mt-1 shrink-0" />
                                                  <div className="flex-1">
                                                      <span className="font-medium block">{typeof concept === 'string' ? concept : concept.term}</span>
                                                      {typeof concept === 'object' && concept.definition && <span className="text-xs text-slate-500 block mt-0.5">{concept.definition}</span>}
                                                  </div>
                                              </li>
                      )}
                                      </ul> :

                    <p className="text-slate-400 text-sm">לא הוגדרו מושגי מפתח</p>
                    }
                              </CardContent>
                          </Card>

                          <Card>
                              <CardHeader>
                                  <CardTitle className="text-lg flex items-center gap-2">
                                      <LinkIcon className="w-5 h-5 text-blue-500" />
                                      מקורות וקישורים
                                  </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                  {relatedMaterials && relatedMaterials.length > 0 &&
                    <div className="space-y-2">
                                          <p className="text-xs font-semibold text-slate-500 uppercase">חומרי לימוד מהקורס</p>
                                          <ul className="space-y-2">
                                              {relatedMaterials.map((material) =>
                        <li key={material.id}>
                                                      <a href={material.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 text-indigo-700 hover:bg-indigo-50 bg-white p-2 rounded-lg border border-slate-200 transition-colors group">
                                                          <div className="flex items-center gap-2 truncate">
                                                              <div className="p-1 bg-indigo-100 rounded text-indigo-600">
                                                                  <FileText className="w-3 h-3" />
                                                              </div>
                                                              <span className="truncate font-medium">{material.title}</span>
                                                          </div>
                                                          <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                                                      </a>
                                                  </li>
                        )}
                                          </ul>
                                      </div>
                    }

                                  {assignment.resource_links && assignment.resource_links.length > 0 || relatedMaterials && relatedMaterials.length > 0 || assignment.file_url ?
                    <div className="space-y-2">
                                          {assignment.resource_links && assignment.resource_links.length > 0 &&
                      <>
                                                {relatedMaterials && relatedMaterials.length > 0 && <Separator className="my-2" />}
                                                <p className="text-xs font-semibold text-slate-500 uppercase">קישורים חיצוניים</p>
                                                <ul className="space-y-2">
                                                    {assignment.resource_links.map((link, idx) =>
                          <li key={idx}>
                                                            <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline bg-blue-50 p-2 rounded-lg border border-blue-100 transition-colors">
                                                                <ExternalLink className="w-4 h-4 shrink-0" />
                                                                <span className="truncate">{link}</span>
                                                            </a>
                                                        </li>
                          )}
                                                </ul>
                                              </>
                      }
                                      </div> :

                    <p className="text-slate-400 text-sm">לא הוגדרו מקורות</p>
                    }
                                  
                                  {assignment.file_url &&
                    <div className="mt-4 pt-4 border-t">
                                          <Button variant="outline" className="w-full gap-2" asChild>
                                              <a href={assignment.file_url} target="_blank" rel="noopener noreferrer">
                                                  <Download className="w-4 h-4" />
                                                  הורדת קובץ מצורף
                                              </a>
                                          </Button>
                                      </div>
                    }
                              </CardContent>
                          </Card>
                      </div>
                  </TabsContent>

                  <TabsContent value="materials" className="mt-6">
                      <Card>
                          <CardHeader className="flex flex-row items-center justify-between">
                              <CardTitle>חומרי לימוד למטלה</CardTitle>
                              <Button size="sm" onClick={() => setMaterialDialogOpen(true)} className="bg-pink-700 hover:bg-pink-800">
                                  <Plus className="w-4 h-4 ml-2" />
                                  קשר חומר לימוד
                              </Button>
                          </CardHeader>
                          <CardContent>
                              <div className="space-y-2">
                                  {!relatedMaterials || relatedMaterials.length === 0 ? (
                                      <div className="text-center py-8 text-slate-500">אין חומרי לימוד מקושרים</div>
                                  ) : (
                                      relatedMaterials.map((mat) => {
                                          if (!mat) return null;
                                          return (
                                              <div key={mat.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:border-indigo-200 transition-colors">
                                                  <div className="flex items-center gap-3">
                                                      <div className="p-2 bg-slate-100 rounded">
                                                          <FileText className="w-4 h-4 text-slate-600" />
                                                      </div>
                                                      <div>
                                                          <div className="font-medium">{mat.title}</div>
                                                          <div className="text-xs text-slate-500">{mat.type}</div>
                                                      </div>
                                                  </div>
                                                  <div className="flex gap-2">
                                                      {mat.file_url && (
                                                          <Button size="icon" variant="ghost" asChild>
                                                              <a href={mat.file_url} target="_blank" rel="noopener noreferrer">
                                                                  <ExternalLink className="w-4 h-4" />
                                                              </a>
                                                          </Button>
                                                      )}
                                                      <Button 
                                                          size="icon" 
                                                          variant="ghost" 
                                                          className="text-red-500 hover:bg-red-50" 
                                                          onClick={() => unlinkMaterialMutation.mutate(mat.id)}
                                                      >
                                                          <Trash2 className="w-4 h-4" />
                                                      </Button>
                                                  </div>
                                              </div>
                                          );
                                      })
                                  )}
                              </div>
                          </CardContent>
                      </Card>
                  </TabsContent>

                  <TabsContent value="submissions" className="mt-6">
                      <Card>
                          <CardHeader className="flex flex-row items-center justify-between">
                              <CardTitle>רשימת הגשות</CardTitle>
                              <Button onClick={() => setIsSubmissionsOpen(true)} className="bg-purple-800 text-primary-foreground px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 h-9">
                                  ניהול מרוכז
                              </Button>
                          </CardHeader>
                          <CardContent>
                               {/* Brief List Preview */}
                               <div className="space-y-1">
                                  {grades && grades.filter(g => g).slice(0, 5).map((grade, idx) => {
                                    if (!grade) return null;
                                    return (
                    <div key={idx} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors">
                                          <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                  {grade?.submission_data?.student_name_input?.[0] || '?'}
                                              </div>
                                              <div>
                                                  <p className="font-medium text-slate-800">{grade?.submission_data?.student_name_input || 'לא מזוהה'}</p>
                                                  <p className="text-xs text-slate-500">
                                                      {(() => {
                              const dateStr = grade?.submission_date || grade?.created_date;
                              const dateObj = dateStr ? new Date(dateStr) : null;
                              return dateObj && isValid(dateObj) ? format(dateObj, 'dd/MM/yyyy HH:mm') : '-';
                            })()}
                                                  </p>
                                              </div>
                                          </div>
                                          <Badge variant={grade?.score !== undefined && grade?.score !== null ? 'success' : 'outline'} className={grade?.score !== undefined && grade?.score !== null ? 'bg-green-100 text-green-700' : 'bg-slate-100'}>
                                              {grade?.score !== undefined && grade?.score !== null ? `ציון: ${grade?.score}` : 'ממתין לבדיקה'}
                                          </Badge>
                                      </div>
                                    );
                                  })}
                                  {(!grades || grades.length === 0) &&
                    <p className="text-center text-slate-500 py-8">אין הגשות עדיין</p>
                    }
                                  {grades && grades.length > 5 &&
                    <Button variant="ghost" className="w-full text-slate-500 mt-2" onClick={() => setIsSubmissionsOpen(true)}>
                                          צפה בכל {grades.length} ההגשות
                                      </Button>
                    }
                               </div>
                          </CardContent>
                      </Card>
                  </TabsContent>
                  
                  <TabsContent value="insights" className="mt-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <Card>
                               <CardHeader>
                                   <CardTitle className="text-lg">התפלגות הגשות</CardTitle>
                               </CardHeader>
                               <CardContent className="space-y-4">
                                   <div className="space-y-2">
                                       <div className="flex justify-between text-sm">
                                           <span>הוגשו בזמן</span>
                                           <span className="font-bold">{stats.submitted - stats.late}</span>
                                       </div>
                                       <Progress value={(stats.submitted - stats.late) / stats.total * 100} className="bg-slate-100" indicatorClassName="bg-green-500" />
                                   </div>
                                   <div className="space-y-2">
                                       <div className="flex justify-between text-sm">
                                           <span>הוגשו באיחור</span>
                                           <span className="font-bold">{stats.late}</span>
                                       </div>
                                       <Progress value={stats.late / stats.total * 100} className="bg-slate-100" indicatorClassName="bg-orange-500" />
                                   </div>
                                   <div className="space-y-2">
                                       <div className="flex justify-between text-sm">
                                           <span>לא הוגשו</span>
                                           <span className="font-bold">{stats.pending}</span>
                                       </div>
                                       <Progress value={stats.pending / stats.total * 100} className="bg-slate-100" indicatorClassName="bg-red-200" />
                                   </div>
                               </CardContent>
                           </Card>
                       </div>
                  </TabsContent>
              </Tabs>
          </div>

          {/* Legacy Sidebar Removed - Actions moved to Header */}
          {assignment.submission_type === 'physical' &&
              <Card className="border-orange-200 bg-orange-50 mt-6">
                  <CardContent className="p-4 flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
                      <div>
                          <p className="font-bold text-orange-800 text-sm">הגשה פיזית</p>
                          <p className="text-orange-700 text-xs mt-1">מטלה זו מוגדרת להגשה בכיתה/פיזית, ולכן לא ניתן להגיש אותה דרך המערכת.</p>
                      </div>
                  </CardContent>
              </Card>
          }
      </div>

      {/* Dialogs */}
      {isSubmissionsOpen &&
      <SubmissionsDialog
        open={isSubmissionsOpen}
        onClose={() => setIsSubmissionsOpen(false)}
        assignment={assignment}
        grades={grades}
        students={students} />

      }

      {isEditOpen &&
      <AssignmentForm
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        assignment={assignment}
        onSubmit={(data) => updateAssignmentMutation.mutate(data)}
        courses={course ? [course] : []}
        isLoading={updateAssignmentMutation.isPending}
      />
      }

      <EmbedCodeDialog
        open={embedDialogOpen}
        onClose={() => setEmbedDialogOpen(false)}
        url={`${window.location.origin}${createPageUrl('PublicView')}?type=assignment&id=${assignmentId}`}
        title={assignment?.title || 'מטלה'}
      />

      {/* Material Dialog */}
      <Dialog open={materialDialogOpen} onOpenChange={setMaterialDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>קישור חומר לימוד למטלה</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                  <Label>בחר חומר לימוד מהקורס</Label>
                  <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
                      <SelectTrigger>
                          <SelectValue placeholder="בחר חומר..." />
                      </SelectTrigger>
                      <SelectContent>
                          {courseMaterials?.filter((m) => !(assignment?.related_material_ids || []).includes(m.id)).map((m) => (
                              <SelectItem key={m.id} value={m.id}>{m.title} ({m.type})</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setMaterialDialogOpen(false)}>ביטול</Button>
                  <Button onClick={() => linkMaterialMutation.mutate(selectedMaterialId)} disabled={!selectedMaterialId} className="bg-indigo-600 hover:bg-indigo-700">קשר</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}