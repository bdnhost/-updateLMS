import React from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Upload, Copy, Loader2, Globe, Wand2, PlayCircle, Trash2, Mic, Zap, ImageIcon, Palette } from 'lucide-react';
import AudioPlayer from '@/components/common/AudioPlayer';
import AIStudioPanel from '@/components/assignments/AIStudioPanel';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlanGuard from '@/components/common/PlanGuard';

const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'];
const semesters = ['סמסטר א', 'סמסטר ב', 'סמסטר קיץ', 'שנתי'];
const courseColors = [
{ label: 'סגול', value: 'from-violet-600 via-purple-600 to-fuchsia-600' },
{ label: 'כחול', value: 'from-blue-600 via-cyan-600 to-teal-600' },
{ label: 'וורוד', value: 'from-pink-600 via-rose-600 to-red-600' },
{ label: 'כתום', value: 'from-orange-600 via-amber-600 to-yellow-600' },
{ label: 'ירוק', value: 'from-emerald-600 via-green-600 to-lime-600' },
{ label: 'אינדיגו', value: 'from-indigo-600 via-blue-600 to-sky-600' }];


export default function CourseForm({ open, onClose, onSubmit, course, isLoading }) {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
        const u = await base44.auth.me();
        if (u && u.organization_id) {
            try {
                const org = await base44.entities.Organization.get(u.organization_id);
                if (org && org.plan_id) {
                    const plan = await base44.entities.SubscriptionPlan.get(org.plan_id);
                    org.plan = plan;
                }
                u.organization = org;
            } catch (e) { console.error(e); }
        }
        return u;
    }
  });

  const [isUploading, setIsUploading] = React.useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = React.useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = React.useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = React.useState(false);
  const [isGeneratingMedia, setIsGeneratingMedia] = React.useState(false);
  const [pollingMedia, setPollingMedia] = React.useState(false);
  const [isGeneratingBulk, setIsGeneratingBulk] = React.useState(false); // New state for bulk generation
  const queryClient = useQueryClient(); // Ensure imported from @tanstack/react-query

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues: course || {
      logo_url: '',
      allow_self_registration: true,
      teacher_id: user?.id || '',
      name: '',
      code: '',
      institution: '',
      semester: '',
      year: new Date().getFullYear().toString(),
      start_date: '',
      weekly_hours: '',
      total_sessions: '',
      total_hours: '',
      day_of_week: '',
      start_time: '',
      end_time: '',
      room: '',
      description: '',
      attendance_threshold: 80,
      status: 'active',
      whatsapp_group_link: '',
      color: '',
      audio_script: '',
      media_prompt: '',
      media_url: ''
    }
  });

  // Polling for Media
  React.useEffect(() => {
      let interval;
      if (pollingMedia && course?.id) {
          interval = setInterval(async () => {
              try {
                  const res = await base44.functions.invoke('mediaSync', {
                      action: 'cpanel_sync',
                      entityType: 'course',
                      entityId: course.id
                  });
                  // If processed > 0, it means a file was found and entity updated
                  if (res.data?.processed > 0) {
                      setPollingMedia(false);
                      setIsGeneratingMedia(false);
                      toast.success('המדיה נוצרה בהצלחה!');
                      
                      // Refresh course data to get the new URL
                      const updatedCourse = await base44.entities.Course.get(course.id);
                      if (updatedCourse?.media_url) {
                          setValue('media_url', updatedCourse.media_url);
                      }
                      queryClient.invalidateQueries({ queryKey: ['course', course.id] });
                  }
              } catch (e) { 
                  console.error("Media Polling error", e);
                  if (e.response && (e.response.status === 401 || e.response.status === 403)) {
                      setPollingMedia(false);
                      setIsGeneratingMedia(false);
                  }
              }
          }, 5000);
      }
      return () => clearInterval(interval);
  }, [pollingMedia, course?.id, queryClient, setValue]);

  React.useEffect(() => {
    if (course) {
      reset({
        ...course,
        allow_self_registration: course.allow_self_registration !== false
      });
    } else {
      reset({
        teacher_id: user?.id || '',
        name: '',
        code: '',
        institution: '',
        semester: '',
        year: new Date().getFullYear().toString(),
        start_date: '',
        weekly_hours: '',
        total_sessions: '',
        total_hours: '',
        day_of_week: '',
        start_time: '',
        end_time: '',
        room: '',
        description: '',
        attendance_threshold: 80,
        status: 'active',
        whatsapp_group_link: '',
        logo_url: '',
        allow_self_registration: true,
        is_public: false,
        color: '',
        audio_script: '',
        media_prompt: '',
        media_url: ''
      });
    }
  }, [course, user?.id, reset]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setValue('logo_url', file_url);
      toast.success("הלוגו הועלה בהצלחה");
    } catch (error) {
      toast.error("שגיאה בהעלאת הלוגו");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const copyInviteLink = () => {
    if (!course?.id) return;
    const link = `${window.location.origin}/JoinCourse?courseId=${course.id}`;
    navigator.clipboard.writeText(link);
    toast.success("הקישור הועתק ללוח");
  };

  const onFormSubmit = (data) => {
    onSubmit({
      ...data,
      weekly_hours: data.weekly_hours ? Number(data.weekly_hours) : null,
      total_sessions: Number(data.total_sessions),
      total_hours: Number(data.total_hours),
      attendance_threshold: Number(data.attendance_threshold)
    });
  };

  const generateScript = async () => {
    const courseName = watch('name');
    if (!courseName) {
        toast.error('יש להזין שם לקורס לפני יצירת תמליל');
        return;
    }
    
    setIsGeneratingScript(true);
    try {
        const res = await base44.functions.invoke('generateAudioGuide', {
            entityId: course?.id, 
            entityType: 'course',
            action: 'generate_script',
            contextData: {
                title: courseName,
                description: watch('description'),
                extra: 'Course Intro'
            }
        });

        if (res.data?.script) {
            setValue('audio_script', res.data.script);
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
    const script = watch('audio_script');
    if (!script) {
        toast.error('יש להזין תמליל לפני יצירת אודיו');
        return;
    }

    if (!course?.id) {
        toast.error('ניתן להפיק אודיו רק לאחר שמירת הקורס לראשונה');
        return;
    }

    setIsGeneratingAudio(true);
    const toastId = toast.loading('שולח לייצור אודיו...');
    try {
        // Step 1: Save the script to the course
        await base44.entities.Course.update(course.id, { 
            audio_script: script,
            voice_id: watch('voice_id'),
            stability: watch('stability') || 0.5
        });
        
        // Step 2: Trigger cPanel sync to generate audio
        const res = await base44.functions.invoke('mediaSync', {
            action: 'cpanel_sync',
            entityType: 'course',
            entityId: course.id,
            skipPull: false
        });

        if (res.data?.success) {
            if (res.data.processed > 0) {
                toast.success('האודיו נוצר ונטען בהצלחה!', { id: toastId });
                const updatedCourse = await base44.entities.Course.get(course.id);
                if (updatedCourse?.audio_url) {
                    setValue('audio_url', updatedCourse.audio_url);
                }
                queryClient.invalidateQueries({ queryKey: ['course', course.id] });
            } else {
                toast.success('הבקשה נשלחה לייצור! המערכת תעדכן כשהאודיו יהיה מוכן (1-2 דקות).', { id: toastId });
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
    const courseName = watch('name');
    const description = watch('description');
    const institution = watch('institution');

    if (!courseName) {
        toast.error('יש להזין שם לקורס תחילה');
        return;
    }

    setIsGeneratingPrompt(true);
    try {
        const res = await base44.functions.invoke('generateVisualMedia', {
            entityId: course?.id,
            entityType: 'course',
            action: 'suggest_prompt',
            contextData: {
                title: courseName,
                description: description,
                institution: institution,
                customInstructions: 'Create a professional course cover image. The image should be visually appealing, educational, and represent the course topic with relevant symbols, icons, or imagery. Use vibrant colors suitable for education. NO TEXT OR LETTERS in the image. Focus on visual metaphors and thematic elements that relate to the course subject.'
            }
        });

        if (res.data?.prompt) {
            setValue('media_prompt', res.data.prompt);
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
    const prompt = watch('media_prompt');
    if (!prompt) {
        toast.error('יש להזין פרומפט');
        return;
    }

    if (!course?.id) {
        toast.error('יש לשמור את הקורס תחילה');
        return;
    }

    setIsGeneratingMedia(true);
    const toastId = toast.loading('שולח בקשה להפקת מדיה...');

    try {
        // 1. Update course with prompt first to ensure it's saved
        await base44.entities.Course.update(course.id, { media_prompt: prompt });

        // 2. Trigger Sync (Push via mediaSync)
        const res = await base44.functions.invoke('mediaSync', {
            action: 'cpanel_sync',
            entityType: 'course',
            entityId: course.id
        });

        if (res.data?.success) {
            if (res.data.processed > 0) {
                toast.success('מדיה סונכרנה בהצלחה!', { id: toastId });
                const updatedCourse = await base44.entities.Course.get(course.id);
                if (updatedCourse?.media_url) setValue('media_url', updatedCourse.media_url);
                setIsGeneratingMedia(false);
            } else {
                toast.success('הבקשה נשלחה לייצור! המערכת תעדכן כשהתמונה מוכנה.', { id: toastId });
                setPollingMedia(true); 
            }
        } else {
            toast.error('שגיאה: ' + (res.data?.error || 'Unknown'), { id: toastId });
            setIsGeneratingMedia(false);
        }
    } catch (e) {
        console.error(e);
        toast.error('תקלה בתקשורת', { id: toastId });
        setIsGeneratingMedia(false);
    }
  };

  const handleBulkGeneration = async (scope) => {
    if (!course?.id) {
        toast.error('יש לשמור את הקורס תחילה');
        return;
    }

    setIsGeneratingBulk(true);
    const toastId = toast.loading(`מפעיל יצירת מדיה (${scope === 'all' ? 'הכל' : scope})...`);

    try {
        let promises = [];

        // 1. Course
        if (scope === 'all' || scope === 'course') {
            promises.push(base44.functions.invoke('mediaSync', {
                action: 'cpanel_sync',
                entityType: 'course',
                forcePush: true,
                courseId: course.id
            }));
        }

        // 2. Sessions
        if (scope === 'all' || scope === 'sessions') {
            promises.push(base44.functions.invoke('mediaSync', {
                action: 'cpanel_sync',
                entityType: 'session',
                forcePush: true,
                courseId: course.id
            }));
        }

        // 3. Assignments
        if (scope === 'all' || scope === 'assignments') {
            promises.push(base44.functions.invoke('mediaSync', {
                action: 'cpanel_sync',
                entityType: 'assignment',
                forcePush: true,
                courseId: course.id
            }));
        }

        // 4. Materials
        if (scope === 'all' || scope === 'materials') {
            promises.push(base44.functions.invoke('mediaSync', {
                action: 'cpanel_sync',
                entityType: 'material',
                forcePush: true,
                courseId: course.id
            }));
        }

        await Promise.all(promises);
        toast.success('פקודות הייצור נשלחו בהצלחה! התוצרים יופיעו בהדרגה.', { id: toastId });

    } catch (e) {
        console.error("Bulk Generation Error", e);
        toast.error('תקלה בשליחת פקודות הייצור', { id: toastId });
    } finally {
        setIsGeneratingBulk(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle dir="rtl">{course ? 'עריכת קורס' : 'קורס חדש'}</DialogTitle>
        </DialogHeader>

        {/* Media Generation Dashboard (Only if course exists) */}
        {course?.id && (
            <div className="mb-4 p-4 bg-gradient-to-l from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl shrink-0">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 text-indigo-900 font-bold text-lg">
                        <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        מרכז ייצור מדיה (AI Batch)
                    </div>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                        ייצור המוני לכל תכני הקורס
                    </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button 
                        type="button"
                        onClick={() => handleBulkGeneration('all')}
                        disabled={isGeneratingBulk}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm h-auto py-2 text-xs flex flex-col gap-1"
                    >
                        {isGeneratingBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        <span className="font-bold">צור הכל</span>
                    </Button>

                    <Button 
                        type="button"
                        variant="outline"
                        onClick={() => handleBulkGeneration('sessions')}
                        disabled={isGeneratingBulk}
                        className="bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700 h-auto py-2 text-xs flex flex-col gap-1"
                    >
                        <PlayCircle className="w-4 h-4" />
                        <span className="font-bold">רק מפגשים</span>
                    </Button>

                    <Button 
                        type="button"
                        variant="outline"
                        onClick={() => handleBulkGeneration('assignments')}
                        disabled={isGeneratingBulk}
                        className="bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700 h-auto py-2 text-xs flex flex-col gap-1"
                    >
                        <Zap className="w-4 h-4" />
                        <span className="font-bold">רק מטלות</span>
                    </Button>

                    <Button 
                        type="button"
                        variant="outline"
                        onClick={() => handleBulkGeneration('materials')}
                        disabled={isGeneratingBulk}
                        className="bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700 h-auto py-2 text-xs flex flex-col gap-1"
                    >
                        <ImageIcon className="w-4 h-4" />
                        <span className="font-bold">רק חומרים</span>
                    </Button>
                </div>
            </div>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col h-full min-h-0">
            <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-3 mb-4 shrink-0">
                    <TabsTrigger value="general">פרטים כלליים</TabsTrigger>
                    <TabsTrigger value="settings">הגדרות ורישום</TabsTrigger>
                    <TabsTrigger value="media">מדיה ו-AI</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
                    <TabsContent value="general" className="space-y-6 mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">שם הקורס *</Label>
                              <Input
                                id="name"
                                {...register('name', { required: 'שדה חובה' })}
                                placeholder="לדוגמה: מבוא לתכנות" />
                              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="code">קוד קורס *</Label>
                              <Input
                                id="code"
                                {...register('code', { required: 'שדה חובה' })}
                                placeholder="לדוגמה: CS101" />
                              {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="institution">מוסד לימודים</Label>
                              <Input
                                id="institution"
                                {...register('institution')}
                                placeholder="שם המכללה/אוניברסיטה" />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="teacher_name">מרצה/מורה</Label>
                              <Input
                                id="teacher_name"
                                value={user?.full_name || 'טוען...'}
                                disabled
                                className="bg-slate-50 text-slate-600"
                              />
                              <p className="text-xs text-slate-500">המורה הוא המשתמש המחובר כרגע</p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="semester">סמסטר</Label>
                              <Select
                                value={watch('semester')}
                                onValueChange={(value) => setValue('semester', value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="בחר סמסטר" />
                                </SelectTrigger>
                                <SelectContent>
                                  {semesters.map((sem) =>
                                  <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="year">שנת לימודים</Label>
                              <Input
                                id="year"
                                {...register('year')}
                                placeholder="2024" />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="start_date">תאריך התחלה *</Label>
                              <Input
                                id="start_date"
                                type="date"
                                {...register('start_date', { required: 'שדה חובה' })} />
                              {errors.start_date && <p className="text-sm text-red-500">{errors.start_date.message}</p>}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="description">תיאור הקורס</Label>
                              <Textarea
                                id="description"
                                {...register('description')}
                                placeholder="תיאור קצר של הקורס..."
                                className="min-h-[100px]"
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6 mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="weekly_hours">שעות שבועיות</Label>
                              <Input
                                id="weekly_hours"
                                type="number"
                                {...register('weekly_hours')}
                                placeholder="4" />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="total_sessions">מספר מפגשים *</Label>
                              <Input
                                id="total_sessions"
                                type="number"
                                {...register('total_sessions', { required: 'שדה חובה' })}
                                placeholder="14" />
                              {errors.total_sessions && <p className="text-sm text-red-500">{errors.total_sessions.message}</p>}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="total_hours">סה״כ שעות קורס *</Label>
                              <Input
                                id="total_hours"
                                type="number"
                                {...register('total_hours', { required: 'שדה חובה' })}
                                placeholder="56" />
                              {errors.total_hours && <p className="text-sm text-red-500">{errors.total_hours.message}</p>}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="day_of_week">יום בשבוע</Label>
                              <Select
                                value={watch('day_of_week')}
                                onValueChange={(value) => setValue('day_of_week', value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="בחר יום" />
                                </SelectTrigger>
                                <SelectContent>
                                  {daysOfWeek.map((day) =>
                                  <SelectItem key={day} value={day}>{day}</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="room">חדר/כיתה</Label>
                              <Input
                                id="room"
                                {...register('room')}
                                placeholder="חדר 101" />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="start_time">שעת התחלה</Label>
                              <Input
                                id="start_time"
                                type="time"
                                {...register('start_time')} />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="end_time">שעת סיום</Label>
                              <Input
                                id="end_time"
                                type="time"
                                {...register('end_time')} />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="attendance_threshold">סף נוכחות מינימלי (%)</Label>
                              <Input
                                id="attendance_threshold"
                                type="number"
                                {...register('attendance_threshold')}
                                min="0"
                                max="100" />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="whatsapp_group_link">קישור לקבוצת וואטסאפ</Label>
                              <Input
                                id="whatsapp_group_link"
                                {...register('whatsapp_group_link')}
                                placeholder="https://chat.whatsapp.com/..."
                                dir="ltr" />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label>צבע הקורס</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {courseColors.map((color) =>
                                        <div
                                          key={color.label}
                                          className={`w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 bg-gradient-to-r ${color.value} ${watch('color') === color.value ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                                          onClick={() => setValue('color', color.value)}
                                          title={color.label} />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-slate-50">
                            {/* Logo Upload */}
                            <div className="space-y-2">
                                <Label>לוגו הקורס</Label>
                                <div className="flex flex-col gap-3">
                                    {watch('logo_url') && (
                                        <div className="relative w-fit">
                                            <img src={watch('logo_url')} alt="Logo" className="w-20 h-20 rounded-lg object-contain border-2 bg-white shadow-sm" />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute -top-2 -left-2 h-6 w-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
                                                onClick={() => setValue('logo_url', '')}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            disabled={isUploading}
                                            className="cursor-pointer flex-1"
                                            id="logo-upload-input"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={async () => {
                                                const courseName = watch('name');
                                                if (!courseName) {
                                                    toast.error('הזן שם קורס תחילה');
                                                    return;
                                                }
                                                setIsUploading(true);
                                                const loadingToast = toast.loading('יוצר לוגו...');
                                                try {
                                                    const prompt = `Professional minimalist logo design for "${courseName}" course. IMPORTANT: Icon/symbol only, absolutely NO TEXT, NO LETTERS, NO WORDS. Clean geometric shapes, vibrant educational colors, centered composition filling most of the canvas, white/transparent background, modern flat design, 4k quality`;
                                                    const res = await base44.integrations.Core.GenerateImage({ prompt });
                                                    if (res?.url) {
                                                        setValue('logo_url', res.url);
                                                        toast.success('לוגו נוצר!', { id: loadingToast });
                                                    }
                                                } catch (e) {
                                                    toast.error('שגיאה ביצירת לוגו', { id: loadingToast });
                                                } finally {
                                                    setIsUploading(false);
                                                }
                                            }}
                                            disabled={isUploading}
                                            className="shrink-0 gap-1.5"
                                        >
                                            {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                            AI
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Registration Settings */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="cursor-pointer" htmlFor="allow_reg">אפשר הרשמה עצמית</Label>
                                    <Switch
                                      id="allow_reg"
                                      checked={watch('allow_self_registration')}
                                      onCheckedChange={(checked) => setValue('allow_self_registration', checked)} className="peer peer peer bg-gray-500 rounded-full peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-700" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label className="cursor-pointer flex items-center gap-2" htmlFor="is_public">
                                        <Globe className="w-4 h-4 text-slate-500" />
                                        קורס ציבורי
                                    </Label>
                                    <Switch
                                      id="is_public"
                                      checked={watch('is_public')}
                                      onCheckedChange={(checked) => setValue('is_public', checked)} className="bg-gray-500 rounded-full peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center border-2 border-transparent shadow-sm transition-colors\nfocus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background\ndisabled:cursor-not-allowed disabled:opacity-50\ndata-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-700\n" />
                                </div>
                                
                                {course?.id && watch('allow_self_registration') &&
                                    <div className="pt-2 border-t">
                                        <Label className="text-xs text-slate-500 mb-1 block">קישור להרשמה:</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                readOnly
                                                value={`${window.location.origin}/JoinCourse?courseId=${course.id}`}
                                                className="text-xs bg-white h-8" />
                                            <Button type="button" size="sm" variant="ghost" onClick={copyInviteLink}>
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="media" className="space-y-6 mt-0">
                        <AIStudioPanel
                            audioScript={watch('audio_script')}
                            onAudioScriptChange={(val) => setValue('audio_script', val)}
                            voiceId={watch('voice_id')}
                            onVoiceIdChange={(val) => setValue('voice_id', val)}
                            stability={watch('stability') || 0.5}
                            onStabilityChange={(val) => setValue('stability', val)}
                            audioUrl={watch('audio_url')}
                            onAudioGenerate={generateAudio}
                            isGeneratingAudio={isGeneratingAudio}
                            onScriptGenerate={generateScript}
                            isGeneratingScript={isGeneratingScript}
                            mediaPrompt={watch('media_prompt')}
                            onMediaPromptChange={(val) => setValue('media_prompt', val)}
                            mediaUrl={watch('media_url')}
                            onMediaGenerate={generateMedia}
                            isGeneratingMedia={isGeneratingMedia || pollingMedia}
                            onPromptSuggest={suggestPrompt}
                            isGeneratingPrompt={isGeneratingPrompt}
                            onMediaClear={() => setValue('media_url', '')}
                            entityId={course?.id}
                        />
                    </TabsContent>
                </div>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 mt-auto border-t">
              <Button type="button" variant="outline" onClick={() => onClose()} className="bg-slate-700 hover:bg-slate-800 text-white border-slate-600">
                ביטול
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isLoading && <Loader2 className="h-4 w-4 ms-2 animate-spin" />}
                {course ? 'עדכון' : 'הוספה'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );

}