import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowRight, Calendar, Clock, MapPin, Video, FileText, CheckSquare, Presentation, Mic, Share2, Plus, Download, ExternalLink, Bell, Trash2, Edit, LayoutDashboard, FolderOpen, Wand2, PlayCircle, ImageIcon, Palette, Code2 } from 'lucide-react';
import AudioPlayer from '@/components/common/AudioPlayer';
import EmbedCodeDialog from '@/components/common/EmbedCodeDialog';
import SessionPrepDocument from '@/components/documents/SessionPrepDocument';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger } from
"@/components/ui/tooltip";
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { toast } from 'sonner';
import SessionAttendance from '@/components/sessions/SessionAttendance';

export default function SessionProfile() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('sessionId');
  const courseId = params.get('courseId');
  const queryClient = useQueryClient();

  // Dialog States
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedSession, setEditedSession] = useState({});
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingMedia, setIsGeneratingMedia] = useState(false);
  const [pollingAudio, setPollingAudio] = useState(false);
  const [pollingMedia, setPollingMedia] = useState(false);
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);

  // Polling Effects
  React.useEffect(() => {
      let interval;
      if (pollingAudio) {
          interval = setInterval(async () => {
              try {
                  const res = await base44.functions.invoke('mediaSync', {
                      action: 'cpanel_sync',
                      entityType: 'session',
                      entityId: sessionId
                  });
                  if (res.data?.processed > 0) {
                      setPollingAudio(false);
                      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
                      toast.success('האודיו מוכן להשמעה!');
                  }
              } catch (e) { 
                  console.error("Audio Polling error", e);
                  // Stop polling on 401/403 or critical errors to prevent spam
                  if (e.response && (e.response.status === 401 || e.response.status === 403)) {
                      setPollingAudio(false);
                  }
              }
          }, 5000);
      }
      return () => clearInterval(interval);
  }, [pollingAudio, sessionId, queryClient]);

  React.useEffect(() => {
      let interval;
      if (pollingMedia) {
          interval = setInterval(async () => {
              try {
                  const res = await base44.functions.invoke('mediaSync', {
                      action: 'cpanel_sync',
                      entityType: 'session',
                      entityId: sessionId
                  });
                  if (res.data?.processed > 0) {
                      setPollingMedia(false);
                      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
                      toast.success('המדיה נוצרה בהצלחה!');
                  }
              } catch (e) { 
                  console.error("Media Polling error", e);
                  // Stop polling on critical errors
                  if (e.response && (e.response.status === 401 || e.response.status === 403)) {
                      setPollingMedia(false);
                  }
              }
          }, 5000);
      }
      return () => clearInterval(interval);
  }, [pollingMedia, sessionId, queryClient]);

  // New Item States
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [newAssignment, setNewAssignment] = useState({ title: '', due_date: '', type: 'assignment' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', priority: 'normal' });

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => base44.entities.CourseSession.get(sessionId),
    enabled: !!sessionId
  });

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => base44.entities.Course.get(courseId),
    enabled: !!courseId
  });

  // Fetch Linked Data
  const { data: sessionMaterials } = useQuery({
    queryKey: ['sessionMaterials', sessionId],
    queryFn: () => base44.entities.SessionMaterial.filter({ session_id: sessionId }),
    enabled: !!sessionId
  });

  const { data: courseMaterials } = useQuery({
    queryKey: ['courseMaterials', courseId],
    queryFn: async () => {
      const [legacy, newMats] = await Promise.all([
      base44.entities.Material.filter({ course_id: courseId }),
      base44.entities.Material.filter({ course_ids: courseId })]
      );
      const all = [...(legacy || []), ...(newMats || [])];
      return all.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);
    },
    enabled: !!courseId
  });

  const { data: assignments } = useQuery({
    queryKey: ['sessionAssignments', sessionId],
    queryFn: () => base44.entities.Assignment.filter({ session_id: sessionId }),
    enabled: !!sessionId
  });

  const { data: announcements } = useQuery({
    queryKey: ['sessionAnnouncements', sessionId],
    queryFn: () => base44.entities.Announcement.filter({ session_id: sessionId }),
    enabled: !!sessionId
  });

  const { data: zoomMeeting } = useQuery({
    queryKey: ['sessionZoomMeeting', sessionId],
    queryFn: async () => {
      const meetings = await base44.entities.ZoomMeeting.filter({ parent_id: sessionId });
      return meetings.length > 0 ? meetings[0] : null;
    },
    enabled: !!sessionId
  });

  // Mutations
  const linkMaterialMutation = useMutation({
    mutationFn: (materialId) => base44.entities.SessionMaterial.create({
      organization_id: course.organization_id,
      course_id: courseId,
      session_id: sessionId,
      material_id: materialId
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionMaterials'] });
      setMaterialDialogOpen(false);
      setSelectedMaterialId('');
      toast.success('חומר לימוד קושר בהצלחה');
    }
  });

  const unlinkMaterialMutation = useMutation({
    mutationFn: (id) => base44.entities.SessionMaterial.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionMaterials'] });
      toast.success('חומר לימוד הוסר');
    }
  });

  const createAssignmentMutation = useMutation({
    mutationFn: (data) => base44.entities.Assignment.create({
      organization_id: course.organization_id,
      course_id: courseId,
      session_id: sessionId,
      ...data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionAssignments'] });
      setAssignmentDialogOpen(false);
      setNewAssignment({ title: '', due_date: '', type: 'assignment' });
      toast.success('מטלה נוצרה בהצלחה');
    }
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: (data) => base44.entities.Announcement.create({
      organization_id: course.organization_id,
      course_id: courseId,
      session_id: sessionId,
      ...data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionAnnouncements'] });
      setAnnouncementDialogOpen(false);
      setNewAnnouncement({ title: '', content: '', priority: 'normal' });
      toast.success('הכרזה פורסמה בהצלחה');
    }
  });

  const updateSessionMutation = useMutation({
    mutationFn: (data) => base44.entities.CourseSession.update(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      setEditDialogOpen(false);
      toast.success('פרטי המפגש עודכנו');
    },
    onError: () => toast.error('שגיאה בעדכון הפרטים')
  });

  const createZoomMeetingMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('zoom', {
        action: 'createMeeting',
        topic: `מפגש: ${session.title}`,
        start_time: `${session.date}T${session.start_time}:00`,
        duration: session.duration_hours * 60,
        parent_type: 'CourseSession',
        parent_id: sessionId,
        course_id: courseId,
        organization_id: course.organization_id
      });
      if (response.data.error) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessionZoomMeeting', sessionId] });
      toast.success('מפגש זום נוצר בהצלחה');
    },
    onError: (err) => {
      console.error(err);
      toast.error('שגיאה ביצירת מפגש זום. וודא שהגדרות זום תקינות.');
    }
  });

  const handleEditOpen = () => {
    let formattedDate = session.date || '';
    if (formattedDate && formattedDate.includes('T')) {
      formattedDate = formattedDate.split('T')[0];
    }
    setEditedSession({
      title: session.title,
      description: session.description || '',
      objectives: session.objectives || '',
      date: formattedDate,
      start_time: session.start_time || '',
      end_time: session.end_time || '',
      location: session.location || '',
      video_conference_link: session.video_conference_link || '',
      recording_url: session.recording_url || '',
      presentation_url: session.presentation_url || '',
      audio_url: session.audio_url || '',
      audio_script: session.audio_script || '',
      media_url: session.media_url || '',
      media_prompt: session.media_prompt || '',
      teacher_notes: session.teacher_notes || '',
      status: session.status || 'planned'
    });
    setEditDialogOpen(true);
  };

  const generateScript = async () => {
    if (!editedSession.title) {
        toast.error('יש להזין כותרת למפגש לפני יצירת תמליל');
        return;
    }
    
    setIsGeneratingScript(true);
    try {
        const res = await base44.functions.invoke('generateAudioGuide', {
            entityId: sessionId,
            entityType: 'session',
            action: 'generate_script',
            contextData: {
                title: editedSession.title,
                description: editedSession.description,
                extra: editedSession.objectives
            }
        });

        if (res.data?.script) {
            setEditedSession(prev => ({ ...prev, audio_script: res.data.script }));
            toast.success('תמליל נוצר בהצלחה! ניתן לערוך אותו כעת.');
        } else {
            toast.error('שגיאה ביצירת תמליל');
        }
    } catch (e) {
        console.error(e);
        toast.error('תקלה ביצירת תמליל');
    } finally {
        setIsGeneratingScript(false);
    }
  };

  const generateAudio = async () => {
    if (!editedSession.audio_script) {
        toast.error('יש להזין תמליל לפני יצירת אודיו');
        return;
    }

    setIsGeneratingAudio(true);
    const toastId = toast.loading('שולח בקשה להפקת אודיו...');

    try {
        // 1. Update session with script first
        await base44.entities.CourseSession.update(sessionId, { audio_script: editedSession.audio_script });
        
        // 2. Trigger Sync (Push via mediaSync)
        const res = await base44.functions.invoke('mediaSync', {
            action: 'cpanel_sync',
            entityType: 'session',
            entityId: sessionId
        });

        if (res.data?.success) {
            if (res.data.processed > 0) {
                toast.success('אודיו סונכרן בהצלחה!', { id: toastId });
                queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
            } else {
                toast.success('הבקשה נשלחה לייצור! המערכת תעדכן כשהקובץ מוכן.', { id: toastId });
                setPollingAudio(true); // Start polling
            }
        } else {
            toast.error('שגיאה: ' + (res.data?.error || 'Unknown'), { id: toastId });
        }
    } catch (e) {
        console.error(e);
        toast.error('תקלה בתקשורת', { id: toastId });
    } finally {
        setIsGeneratingAudio(false);
    }
  };

  const suggestPrompt = async () => {
    if (!editedSession.title) {
        toast.error('יש להזין נושא למפגש תחילה');
        return;
    }
    
    setIsGeneratingPrompt(true);
    try {
        const res = await base44.functions.invoke('generateVisualMedia', {
            entityId: sessionId,
            entityType: 'session',
            action: 'suggest_prompt',
            contextData: {
                title: editedSession.title,
                description: editedSession.description
            }
        });

        if (res.data?.prompt) {
            setEditedSession(prev => ({ ...prev, media_prompt: res.data.prompt }));
            toast.success('הצעה לפרומפט נוצרה בהצלחה!');
        }
    } catch (e) {
        console.error(e);
        toast.error('תקלה בקבלת הצעה');
    } finally {
        setIsGeneratingPrompt(false);
    }
  };

  const generateMedia = async () => {
    if (!editedSession.media_prompt) {
        toast.error('יש להזין פרומפט');
        return;
    }

    setIsGeneratingMedia(true);
    const toastId = toast.loading('שולח בקשה להפקת מדיה...');

    try {
        // 1. Update session with prompt first
        await base44.entities.CourseSession.update(sessionId, { media_prompt: editedSession.media_prompt });

        // 2. Trigger Sync (Push via mediaSync)
        const res = await base44.functions.invoke('mediaSync', {
            action: 'cpanel_sync',
            entityType: 'session',
            entityId: sessionId
        });

        if (res.data?.success) {
            if (res.data.processed > 0) {
                toast.success('מדיה סונכרנה בהצלחה!', { id: toastId });
                queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
            } else {
                toast.success('הבקשה נשלחה לייצור! המערכת תעדכן כשהתמונה מוכנה.', { id: toastId });
                setPollingMedia(true); // Start polling
            }
        } else {
            toast.error('שגיאה: ' + (res.data?.error || 'Unknown'), { id: toastId });
        }
    } catch (e) {
        console.error(e);
        toast.error('תקלה בתקשורת', { id: toastId });
    } finally {
        setIsGeneratingMedia(false);
    }
  };

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const publicUrl = `${window.location.origin}/PublicView?type=session&id=${sessionId}`;

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success('הקישור הועתק ללוח');
  };

  const shareToWhatsapp = () => {
    const text = `היי, הנה קישור למפגש ${session.title}:\n${publicUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (sessionLoading || courseLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!session || !course) return <div className="p-8 text-center">המפגש לא נמצא</div>;

  const statusColors = {
    planned: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    delayed: 'bg-orange-100 text-orange-800'
  };

    return (
        <div className="space-y-6" dir="rtl" style={{ textAlign: 'right' }}>
            {/* Header */}
            <div className="flex flex-col md:flex-row-reverse justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm" dir="rtl">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link to={`/CourseProfile?id=${courseId}`} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm">
                            <ArrowRight className="w-4 h-4" />
                            חזרה לקורס {course.name}
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-violet-100 text-violet-700 p-2.5 rounded-xl">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <Badge className="bg-indigo-600 text-white text-lg w-10 h-10 flex items-center justify-center rounded-lg shadow-sm">
                            {session.session_number}
                        </Badge>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-xl flex items-center gap-2 shadow-sm">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm font-bold">מפגש</span>
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800" dir="rtl">{session.title}</h1>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-1">
                                {session.date &&
                <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {format(new Date(session.date), 'EEEE, dd/MM/yyyy', { locale: he })}
                                    </span>
                }
                                {(session.start_time || session.end_time || course.start_time || course.end_time) &&
                <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {session.start_time || course.start_time} - {session.end_time || course.end_time}
                                    </span>
                }
                                {(session.location || course.room) &&
                <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {session.location || course.room}
                                    </span>
                }
                                <Badge variant="secondary" className={statusColors[session.status] || 'bg-slate-100'}>
                                    {session.status}
                                </Badge>
                                {session.audio_url && (
                                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200 gap-1">
                                        <Mic className="w-3 h-3" />
                                        הנחיה קולית
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <SessionPrepDocument 
                        session={session} 
                        course={course}
                        trigger={
                            <Button variant="outline" className="gap-2">
                                <FileText className="w-4 h-4" />
                                מסמך הכנה
                            </Button>
                        }
                    />
                    <Button onClick={handleEditOpen} variant="outline" className="gap-2">
                        <Edit className="w-4 h-4" />
                        ערוך פרטים
                    </Button>
                    <Button onClick={handleShare} className="gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200">
                        <Share2 className="w-4 h-4" />
                        שתף מפגש
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start bg-white p-1 rounded-lg border shadow-sm mb-4 overflow-x-auto gap-1">
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <TabsTrigger value="overview" className="flex-1 min-w-[50px]">
                                    <LayoutDashboard className="w-5 h-5" />
                                </TabsTrigger>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-0"><p>סקירה כללית</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <TabsTrigger value="attendance" className="flex-1 min-w-[50px]">
                                    <CheckSquare className="w-5 h-5" />
                                </TabsTrigger>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-0"><p>נוכחות</p></TooltipContent>
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
                                <TabsTrigger value="assignments" className="flex-1 min-w-[50px]">
                                    <FileText className="w-5 h-5" />
                                </TabsTrigger>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-0"><p>מטלות</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <TabsTrigger value="announcements" className="flex-1 min-w-[50px]">
                                    <Bell className="w-5 h-5" />
                                </TabsTrigger>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-0"><p>הכרזות</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </TabsList>

                <TabsContent value="overview" className="space-y-6" dir="rtl" style={{ textAlign: 'right' }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>תקציר המפגש</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose max-w-none text-slate-600" dir="rtl">
                                        {/* Audio Guide Section - Enhanced with Generator */}
                                        <div className="mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="font-bold text-indigo-900 flex items-center gap-2 text-sm">
                                                    <Mic className="w-4 h-4 text-indigo-600" />
                                                    הנחיה קולית (AI)
                                                </h4>
                                                <div className="flex gap-2">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="h-7 text-xs bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                                        onClick={() => {
                                                            setEditedSession({
                                                                ...session,
                                                                date: session.date ? session.date.split('T')[0] : ''
                                                            });
                                                            setEditDialogOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="w-3 h-3 me-1" />
                                                        ערוך
                                                    </Button>
                                                    {/* Quick Generate Action */}
                                                    {session.audio_script && (
                                                        <Button 
                                                            size="sm" 
                                                            variant="ghost" 
                                                            onClick={async () => {
                                                                setIsGeneratingAudio(true);
                                                                const toastId = toast.loading('מפיק אודיו...');
                                                                try {
                                                                    const res = await base44.functions.invoke('audioSync', {
                                                                        action: 'cpanel_sync',
                                                                        entityType: 'session',
                                                                        entityId: sessionId
                                                                    });
                                                                    if (res.data?.success) {
                                                                        if(res.data.uploaded > 0) toast.success('נשלח להפקה', { id: toastId });
                                                                        else if(res.data.processed > 0) {
                                                                            toast.success('אודיו סונכרן!', { id: toastId });
                                                                            queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
                                                                        } else {
                                                                            toast.success('הפקודה התקבלה', { id: toastId });
                                                                        }
                                                                    } else {
                                                                        toast.error('שגיאה: ' + res.data?.error, { id: toastId });
                                                                    }
                                                                } catch(e) { toast.error('תקלה בתקשורת', { id: toastId }); }
                                                                finally { setIsGeneratingAudio(false); }
                                                            }}
                                                            disabled={isGeneratingAudio}
                                                            className="h-7 text-xs text-indigo-600 hover:text-indigo-800"
                                                        >
                                                            {isGeneratingAudio ? <Loader2 className="w-3 h-3 me-1 animate-spin" /> : <PlayCircle className="w-3 h-3 me-1" />}
                                                            הפק כעת
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {pollingAudio ? (
                                                <div className="bg-indigo-100/50 p-4 rounded-lg flex flex-col items-center justify-center animate-pulse border border-indigo-200">
                                                    <div className="flex items-center gap-2 text-indigo-700 font-medium mb-1">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        מפיק אודיו...
                                                    </div>
                                                    <p className="text-xs text-indigo-500">התהליך עשוי לקחת כדקה</p>
                                                </div>
                                            ) : session.audio_url ? (
                                                <div className="bg-white/60 p-2 rounded-lg">
                                                    <AudioPlayer src={session.audio_url} title="הנחיה קולית למפגש" />
                                                </div>
                                            ) : (
                                                <div className="text-center py-3 bg-white/50 rounded-lg border border-dashed border-indigo-200">
                                                    <p className="text-xs text-indigo-400">
                                                        {session.audio_script ? 'מוכן להפקה. לחץ על "הפק כעת"' : 'לא הוגדר אודיו. לחץ על "ערוך" להוספת תמליל'}
                                                    </p>
                                                </div>
                                            )}

                                            {session.audio_script && (
                                                <div className="mt-3 text-xs text-slate-500 bg-white/40 p-2 rounded border border-indigo-50">
                                                    <span className="font-semibold block mb-1">תמליל:</span>
                                                    {session.audio_script}
                                                </div>
                                            )}
                                        </div>

                                        {pollingMedia ? (
                                            <div className="mb-6 rounded-xl bg-slate-100 h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 animate-pulse">
                                                <ImageIcon className="w-12 h-12 text-slate-300 mb-2 opacity-50" />
                                                <span className="text-slate-500 font-medium flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    מייצר תמונה...
                                                </span>
                                            </div>
                                        ) : session.media_url && (
                                            <div className="mb-6 rounded-xl overflow-hidden shadow-md border border-slate-100">
                                                <img src={session.media_url} alt="Session Media" className="w-full h-auto object-cover max-h-[400px]" />
                                            </div>
                                        )}

                                        <h4 className="font-semibold text-slate-800" dir="rtl">תיאור</h4>
                                        <p className="whitespace-pre-wrap mb-4 text-start" dir="rtl">{session.description || 'אין תיאור זמין'}</p>
                                        
                                        <h4 className="font-semibold text-slate-800" dir="rtl">מטרות השיעור</h4>
                                        <p className="whitespace-pre-wrap text-start" dir="rtl">{session.objectives || 'לא הוגדרו מטרות'}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {session.teacher_notes &&
              <Card className="bg-yellow-50 border-yellow-200">
                                    <CardHeader>
                                        <CardTitle className="text-yellow-800 flex items-center gap-2" dir="rtl">
                                            <FileText className="w-5 h-5" />
                                            הערות למרצה (אישי)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-yellow-900 whitespace-pre-wrap text-start" dir="rtl">{session.teacher_notes}</p>
                                    </CardContent>
                                </Card>
              }
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>משאבים וקישורים</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {zoomMeeting ?
                  <div className="space-y-2">
                                            <Button asChild className="w-full justify-start gap-2 h-auto py-3 bg-blue-600 hover:bg-blue-700 text-white">
                                                <a href={zoomMeeting.start_url || zoomMeeting.join_url} target="_blank" rel="noopener noreferrer">
                                                    <Video className="w-5 h-5" />
                                                    <div className="text-start">
                                                        <div className="font-semibold">התחל מפגש זום</div>
                                                        <div className="text-xs opacity-90">כמארח</div>
                                                    </div>
                                                </a>
                                            </Button>
                                            <div className="text-xs text-center text-slate-500">
                                                מזהה פגישה: {zoomMeeting.zoom_meeting_id} | סיסמה: {zoomMeeting.passcode}
                                            </div>
                                        </div> :
                  session.video_conference_link ?
                  <Button asChild variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                                            <a href={session.video_conference_link} target="_blank" rel="noopener noreferrer">
                                                <Video className="w-5 h-5 text-blue-600" />
                                                <div className="text-start">
                                                    <div className="font-semibold">שיעור אונליין</div>
                                                    <div className="text-xs text-slate-500">קישור לזום/Teams</div>
                                                </div>
                                            </a>
                                        </Button> :

                  <div className="space-y-2">
                                            <div className="text-sm text-slate-400 flex items-center gap-2 p-2 border border-dashed rounded">
                                                <Video className="w-4 h-4" /> אין קישור לשיעור אונליין
                                            </div>
                                            <Button
                      variant="secondary"
                      className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100"
                      onClick={() => createZoomMeetingMutation.mutate()}
                      disabled={createZoomMeetingMutation.isPending}>

                                                {createZoomMeetingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <Video className="w-4 h-4 me-2" />}
                                                צור מפגש זום אוטומטי
                                            </Button>
                                        </div>
                  }

                                    {session.presentation_url &&
                  <Button asChild variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                                            <a href={session.presentation_url} target="_blank" rel="noopener noreferrer">
                                                <Presentation className="w-5 h-5 text-orange-600" />
                                                <div className="text-start">
                                                    <div className="font-semibold">מצגת השיעור</div>
                                                    <div className="text-xs text-slate-500">צפייה במצגת</div>
                                                </div>
                                            </a>
                                        </Button>
                  }

                                    {session.audio_url &&
                                        <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                                            <div className="flex items-center gap-2 mb-2 text-indigo-700 font-semibold text-sm">
                                                <Mic className="w-4 h-4" />
                                                הנחיה קולית
                                            </div>
                                            <AudioPlayer src={session.audio_url} minimal />
                                        </div>
                                    }

                                    {session.recording_url &&
                  <Button asChild variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                                            <a href={session.recording_url} target="_blank" rel="noopener noreferrer">
                                                <Mic className="w-5 h-5 text-red-600" />
                                                <div className="text-start">
                                                    <div className="font-semibold">הקלטת השיעור</div>
                                                    <div className="text-xs text-slate-500">צפייה בהקלטה</div>
                                                </div>
                                            </a>
                                        </Button>
                  }
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="attendance" dir="rtl" style={{ textAlign: 'right' }}>
                     <SessionAttendance session={session} course={course} />
                </TabsContent>

                <TabsContent value="materials" dir="rtl" style={{ textAlign: 'right' }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>חומרי לימוד למפגש</CardTitle>
                            <Button size="sm" onClick={() => setMaterialDialogOpen(true)} className="bg-pink-700 text-primary-foreground px-3 text-xs font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 h-8">
                                <Plus className="w-4 h-4 ms-2" />
                                קשר חומר לימוד
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {sessionMaterials?.length === 0 ?
                <div className="text-center py-8 text-slate-500">אין חומרי לימוד מקושרים</div> :

                sessionMaterials?.map((sm) => {
                  const mat = courseMaterials?.find((m) => m.id === sm.material_id);
                  if (!mat) return null;
                  return (
                    <div key={sm.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
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
                                                    <Button size="icon" variant="ghost" asChild>
                                                        <a href={mat.file_url} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="text-red-500" onClick={() => unlinkMaterialMutation.mutate(sm.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>);

                })
                }
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="assignments" dir="rtl" style={{ textAlign: 'right' }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>מטלות למפגש</CardTitle>
                            <Button size="sm" onClick={() => setAssignmentDialogOpen(true)} className="bg-purple-600 text-primary-foreground px-3 text-xs font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 h-8">
                                <Plus className="w-4 h-4 ms-2" />
                                צור מטלה חדשה
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {assignments?.length === 0 ?
                <div className="text-center py-8 text-slate-500">אין מטלות למפגש זה</div> :

                assignments?.map((assignment) =>
                <div key={assignment.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
                                                    <CheckSquare className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{assignment.title}</div>
                                                    <div className="text-xs text-slate-500">הגשה: {assignment.due_date} | {assignment.type}</div>
                                                </div>
                                            </div>
                                            <Link to={`/AssignmentProfile?id=${assignment.id}`}>
                                                <Button size="sm" variant="outline">ניהול</Button>
                                            </Link>
                                        </div>
                )
                }
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="announcements" dir="rtl" style={{ textAlign: 'right' }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>הכרזות למפגש</CardTitle>
                            <Button size="sm" onClick={() => setAnnouncementDialogOpen(true)} className="bg-fuchsia-700 text-primary-foreground px-3 text-xs font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 h-8">
                                <Plus className="w-4 h-4 ms-2" />
                                פרסם הכרזה
                            </Button>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-2">
                                {announcements?.length === 0 ?
                <div className="text-center py-8 text-slate-500">אין הכרזות למפגש זה</div> :

                announcements?.map((announcement) =>
                <div key={announcement.id} className="p-4 bg-orange-50 border border-orange-100 rounded-lg">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="font-bold text-slate-800">{announcement.title}</div>
                                                <div className="text-xs text-slate-500">{format(new Date(announcement.created_date), 'dd/MM/yyyy')}</div>
                                            </div>
                                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{announcement.content}</p>
                                        </div>
                )
                }
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Material Dialog */}
            <Dialog open={materialDialogOpen} onOpenChange={setMaterialDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>קישור חומר לימוד למפגש</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>בחר חומר לימוד מהקורס</Label>
                        <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
                            <SelectTrigger>
                                <SelectValue placeholder="בחר חומר..." />
                            </SelectTrigger>
                            <SelectContent>
                                {courseMaterials?.filter((m) => !sessionMaterials?.some((sm) => sm.material_id === m.id)).map((m) =>
                <SelectItem key={m.id} value={m.id}>{m.title} ({m.type})</SelectItem>
                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMaterialDialogOpen(false)} className="bg-slate-700 hover:bg-slate-800 text-white border-slate-600">ביטול</Button>
                        <Button onClick={() => linkMaterialMutation.mutate(selectedMaterialId)} disabled={!selectedMaterialId} className="bg-indigo-600 hover:bg-indigo-700 text-white">קשר</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assignment Dialog */}
            <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>יצירת מטלה למפגש</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>כותרת המטלה</Label>
                            <Input value={newAssignment.title} onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>תאריך הגשה</Label>
                            <Input type="date" value={newAssignment.due_date} onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>סוג</Label>
                            <Select value={newAssignment.type} onValueChange={(v) => setNewAssignment({ ...newAssignment, type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="assignment">מטלה</SelectItem>
                                    <SelectItem value="quiz">בוחן</SelectItem>
                                    <SelectItem value="exam">מבחן</SelectItem>
                                    <SelectItem value="project">פרויקט</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAssignmentDialogOpen(false)} className="bg-slate-700 hover:bg-slate-800 text-white border-slate-600">ביטול</Button>
                        <Button onClick={() => createAssignmentMutation.mutate(newAssignment)} disabled={!newAssignment.title || !newAssignment.due_date} className="bg-indigo-600 hover:bg-indigo-700 text-white">צור</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Share Dialog */}
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>שיתוף מפגש</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex gap-2">
                            <Input value={publicUrl} readOnly />
                            <Button onClick={copyToClipboard} variant="outline">העתק</Button>
                        </div>
                        <Button onClick={shareToWhatsapp} className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white">
                            שתף בוואטסאפ
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Announcement Dialog */}
            <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>פרסום הכרזה למפגש</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>כותרת</Label>
                            <Input value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>תוכן ההודעה</Label>
                            <Textarea value={newAnnouncement.content} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>עדיפות</Label>
                            <Select value={newAnnouncement.priority} onValueChange={(v) => setNewAnnouncement({ ...newAnnouncement, priority: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="normal">רגיל</SelectItem>
                                    <SelectItem value="high">גבוה</SelectItem>
                                    <SelectItem value="urgent">דחוף</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAnnouncementDialogOpen(false)} className="bg-slate-700 hover:bg-slate-800 text-white border-slate-600">ביטול</Button>
                        <Button onClick={() => createAnnouncementMutation.mutate(newAnnouncement)} disabled={!newAnnouncement.title || !newAnnouncement.content} className="bg-indigo-600 hover:bg-indigo-700 text-white">פרסם</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Session Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>עריכת פרטי מפגש</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>נושא המפגש</Label>
                            <Input value={editedSession.title} onChange={(e) => setEditedSession({ ...editedSession, title: e.target.value })} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>תאריך</Label>
                                <Input type="date" value={editedSession.date} onChange={(e) => setEditedSession({ ...editedSession, date: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>מיקום</Label>
                                <Input value={editedSession.location} onChange={(e) => setEditedSession({ ...editedSession, location: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>שעת התחלה</Label>
                                <Input type="time" value={editedSession.start_time} onChange={(e) => setEditedSession({ ...editedSession, start_time: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>שעת סיום</Label>
                                <Input type="time" value={editedSession.end_time} onChange={(e) => setEditedSession({ ...editedSession, end_time: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>תיאור</Label>
                            <Textarea value={editedSession.description} onChange={(e) => setEditedSession({ ...editedSession, description: e.target.value })} rows={3} />
                        </div>

                        <div className="space-y-2">
                            <Label>מטרות</Label>
                            <Textarea value={editedSession.objectives} onChange={(e) => setEditedSession({ ...editedSession, objectives: e.target.value })} rows={2} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                            <div className="space-y-2">
                                <Label>קישור לזום/אונליין</Label>
                                <Input
                  value={editedSession.video_conference_link}
                  onChange={(e) => setEditedSession({ ...editedSession, video_conference_link: e.target.value })}
                  placeholder="https://..."
                  dir="ltr" />

                            </div>
                            <div className="space-y-2">
                                <Label>קישור להקלטה</Label>
                                <Input
                  value={editedSession.recording_url}
                  onChange={(e) => setEditedSession({ ...editedSession, recording_url: e.target.value })}
                  placeholder="https://..."
                  dir="ltr" />

                            </div>
                            <div className="space-y-2">
                                <Label>קישור למצגת</Label>
                                <Input
                  value={editedSession.presentation_url}
                  onChange={(e) => setEditedSession({ ...editedSession, presentation_url: e.target.value })}
                  placeholder="https://..."
                  dir="ltr" />

                            </div>
                            <div className="space-y-2">
                                <Label>קישור לאודיו</Label>
                                <Input
                  value={editedSession.audio_url}
                  onChange={(e) => setEditedSession({ ...editedSession, audio_url: e.target.value })}
                  placeholder="https://..."
                  dir="ltr" />
                            </div>
                            <div className="space-y-2 md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="flex items-center gap-2 text-indigo-700 font-bold">
                                        <Mic className="w-4 h-4" />
                                        הנחיה קולית (AI)
                                    </Label>
                                    <div className="flex gap-2">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={generateScript}
                                            disabled={isGeneratingScript}
                                            className="h-7 text-xs bg-white"
                                        >
                                            {isGeneratingScript ? <Loader2 className="w-3 h-3 animate-spin me-1" /> : <Wand2 className="w-3 h-3 me-1" />}
                                            הצע תמליל
                                        </Button>
                                        <Button 
                                            type="button" 
                                            size="sm"
                                            onClick={generateAudio}
                                            disabled={isGeneratingAudio || !editedSession.audio_script || pollingAudio}
                                            className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                                        >
                                            {isGeneratingAudio || pollingAudio ? <Loader2 className="w-3 h-3 animate-spin me-1" /> : <PlayCircle className="w-3 h-3 me-1" />}
                                            {pollingAudio ? 'בתהליך...' : 'הפק MP3'}
                                        </Button>
                                    </div>
                                </div>
                                <Textarea
                                    value={editedSession.audio_script}
                                    onChange={(e) => setEditedSession({ ...editedSession, audio_script: e.target.value })}
                                    rows={3}
                                    placeholder="תמליל להקראה..."
                                    className="bg-white mb-3"
                                />
                                {editedSession.audio_url && (
                                    <div className="flex items-center gap-2 bg-white p-2 rounded border border-indigo-100">
                                        <div className="flex-1">
                                            <AudioPlayer key={editedSession.audio_url} src={editedSession.audio_url} title="תצוגה מקדימה" minimal />
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="text-red-500 h-8 w-8 p-0"
                                            onClick={() => setEditedSession({ ...editedSession, audio_url: '' })}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="flex items-center gap-2 text-indigo-700 font-bold">
                                        <ImageIcon className="w-4 h-4" />
                                        מדיה ויזואלית (אינפוגרפיקה/תמונה)
                                    </Label>
                                    <div className="flex gap-2">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={suggestPrompt}
                                            disabled={isGeneratingPrompt}
                                            className="h-7 text-xs bg-white"
                                        >
                                            {isGeneratingPrompt ? <Loader2 className="w-3 h-3 animate-spin me-1" /> : <Wand2 className="w-3 h-3 me-1" />}
                                            הצע פרומפט
                                        </Button>
                                        <Button 
                                            type="button" 
                                            size="sm"
                                            onClick={generateMedia}
                                            disabled={isGeneratingMedia || !editedSession.media_prompt || pollingMedia}
                                            className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                                        >
                                            {isGeneratingMedia || pollingMedia ? <Loader2 className="w-3 h-3 animate-spin me-1" /> : <Palette className="w-3 h-3 me-1" />}
                                            {pollingMedia ? 'בתהליך...' : 'הפק מדיה'}
                                        </Button>
                                    </div>
                                </div>
                                <Textarea
                                    value={editedSession.media_prompt}
                                    onChange={(e) => setEditedSession({ ...editedSession, media_prompt: e.target.value })}
                                    rows={3}
                                    placeholder="תאר את התמונה הרצויה (באנגלית)..."
                                    dir="ltr"
                                    className="bg-white mb-3 font-mono text-sm"
                                />
                                {editedSession.media_url && (
                                    <div className="relative mt-2 bg-white p-2 rounded border border-indigo-100 flex justify-center group">
                                        <img src={editedSession.media_url} alt="Generated Media" className="max-h-48 rounded shadow-sm object-contain" />
                                        <Button 
                                            type="button"
                                            variant="ghost" 
                                            size="icon"
                                            className="absolute top-2 end-2 text-red-500 bg-white/80 hover:bg-white hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => setEditedSession({ ...editedSession, media_url: '' })}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>סטטוס</Label>
                                <Select value={editedSession.status} onValueChange={(v) => setEditedSession({ ...editedSession, status: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="planned">מתוכנן</SelectItem>
                                        <SelectItem value="completed">בוצע</SelectItem>
                                        <SelectItem value="cancelled">בוטל</SelectItem>
                                        <SelectItem value="delayed">נדחה</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        <div className="space-y-2 border-t pt-4">
                            <Label className="text-yellow-600">הערות למרצה (אישי)</Label>
                            <Textarea
                value={editedSession.teacher_notes}
                onChange={(e) => setEditedSession({ ...editedSession, teacher_notes: e.target.value })}
                className="bg-yellow-50/50" />

                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="bg-slate-700 hover:bg-slate-800 text-white border-slate-600">ביטול</Button>
                        <Button onClick={() => updateSessionMutation.mutate(editedSession)} className="bg-violet-700 hover:bg-violet-800 text-white">שמור שינויים</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <EmbedCodeDialog
                open={embedDialogOpen}
                onClose={() => setEmbedDialogOpen(false)}
                url={`${window.location.origin}/PublicView?type=session&id=${sessionId}`}
                title={session?.title || 'מפגש'}
            />
        </div>);

}