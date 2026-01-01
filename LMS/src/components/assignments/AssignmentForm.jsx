import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { format, isValid } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import ReactQuill from 'react-quill';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger } from
'@/components/ui/popover';
import { CalendarIcon, Loader2, Plus, X, Video, Lightbulb, Link as LinkIcon, LayoutTemplate, FolderOpen, Check, ScrollText, FileText, ListChecks, Terminal, Mic, Wand2, PlayCircle, Download, Upload, ImageIcon, Palette, Trash2 } from 'lucide-react';
import AudioPlayer from '@/components/common/AudioPlayer';
import AIStudioPanel from './AIStudioPanel';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { he } from 'date-fns/locale';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ExamBuilder from './builders/ExamBuilder';
import ProjectBuilder from './builders/ProjectBuilder';
import RubricBuilder from './RubricBuilder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IntegrationGuide from './IntegrationGuide';

const assignmentTypes = [
{ value: 'assignment', label: 'מטלה רגילה' },
{ value: 'quiz', label: 'בוחן' },
{ value: 'exam', label: 'מבחן' },
{ value: 'project', label: 'פרויקט' }];


export default function AssignmentForm({ open, onClose, onSubmit, assignment, courses, isLoading }) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues: assignment || {
      title: '',
      description: '',
      course_id: '',
      session_id: '',
      type: 'assignment',
      due_date: '',
      weight: '',
      max_score: 100,
      status: 'open',
      video_url: '',
      audio_url: '',
      audio_script: '',
      media_url: '',
      media_prompt: '',
      key_concepts: [],
      resource_links: [],
      related_material_ids: [],
      content_data: {}
    }
  });

  // Audio & Media Generation State
  const [isGeneratingScript, setIsGeneratingScript] = React.useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = React.useState(false);
  const [previewAudioUrl, setPreviewAudioUrl] = React.useState(null); // Direct state for immediate preview
  const [isGeneratingPrompt, setIsGeneratingPrompt] = React.useState(false);
  const [isGeneratingMedia, setIsGeneratingMedia] = React.useState(false);
  
  const generateScript = async () => {
    const values = watch();
    if (!values.title) {
        toast.error('יש להזין כותרת למטלה לפני יצירת תמליל');
        return;
    }
    
    setIsGeneratingScript(true);
    try {
        // We pass the current form values as a temporary "entity" like object for context
        // But the function expects entityId. For new assignments, we don't have ID.
        // So we might need to handle "unsaved" generation differently or require save first.
        // Let's modify the backend function to accept context directly OR require saving.
        // EASIER: Require saving draft first? No, UX bad.
        // Better: Backend function can accept "contextData" if entityId is missing.
        // But for now, let's just use the current form data and mock the entity structure if needed,
        // OR better: Just allow the user to write the script, or click "Suggest" which uses a direct LLM call if possible?
        // Since we have a backend function `generateAudioGuide`, let's use it.
        // But `generateAudioGuide` requires entityId to fetch context.
        // Workaround: We will handle this by only enabling this for saved assignments OR passing raw text.
        
        const res = await base44.functions.invoke('generateAudioGuide', {
            entityId: assignment?.id,
            entityType: 'assignment',
            action: 'generate_script',
            contextData: {
                title: values.title,
                description: values.description,
                extra: JSON.stringify(values.key_concepts || [])
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

    if (!assignment?.id) {
        toast.error('יש לשמור את המטלה תחילה לפני הפקת אודיו');
        return;
    }
    
    setIsGeneratingAudio(true);
    const toastId = toast.loading('שולח לייצור אודיו...');
    try {
        // Step 1: Save the script to the assignment
        await base44.entities.Assignment.update(assignment.id, { 
            audio_script: script,
            voice_id: watch('voice_id'),
            stability: watch('stability') || 0.5
        });
        
        // Step 2: Trigger cPanel sync to generate audio
        const res = await base44.functions.invoke('mediaSync', {
            action: 'cpanel_sync',
            entityType: 'assignment',
            entityId: assignment.id,
            skipPull: false
        });

        if (res.data?.success) {
            if (res.data.processed > 0) {
                const updatedAssignment = await base44.entities.Assignment.get(assignment.id);
                if (updatedAssignment?.audio_url) {
                    setValue('audio_url', updatedAssignment.audio_url);
                    setPreviewAudioUrl(updatedAssignment.audio_url);
                }
                toast.success('האודיו נוצר ונטען בהצלחה!', { id: toastId });
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
    const title = watch('title');
    const description = watch('description');
    const type = watch('type');
    
    if (!title && !description) {
        toast.error('יש להזין כותרת או תיאור למטלה תחילה', { description: 'המערכת צריכה הקשר כדי להציע רעיון לתמונה.' });
        return;
    }
    
    const typeInstructions = {
        'assignment': 'Create an educational infographic or illustration that visually explains the assignment concept. Use diagrams, icons, flowcharts, and visual aids. Professional educational style with clear information hierarchy. Focus on making complex information easy to understand through visuals.',
        'quiz': 'Create a quiz-themed educational image with question marks, checkmarks, brain icons, and learning symbols. Modern, engaging, and colorful design that motivates students. Include elements that suggest thinking and problem-solving.',
        'exam': 'Create a formal exam-themed image with academic symbols, certificates, achievement icons, and educational badges. Professional and encouraging tone. Use academic colors (blues, golds) and symbols of excellence.',
        'project': 'Create a project-themed image showing teamwork, creativity, building blocks, gears, lightbulbs, or collaborative development process. Inspirational and dynamic feel with emphasis on innovation and hands-on work.'
    };
    
    setIsGeneratingPrompt(true);
    try {
        const res = await base44.functions.invoke('generateVisualMedia', {
            entityId: assignment?.id,
            entityType: 'assignment',
            action: 'suggest_prompt',
            contextData: {
                title: title || 'New Assignment',
                description: description || '',
                type: type,
                customInstructions: (typeInstructions[type] || typeInstructions.assignment) + ' NO TEXT OR LETTERS in the image. Use vibrant educational colors and thematic elements related to the specific topic. 4k quality, professional design.'
            }
        });

        if (res.data?.prompt) {
            setValue('media_prompt', res.data.prompt);
            toast.success('הצעה לפרומפט נוצרה בהצלחה!');
        } else {
            toast.error('לא התקבלה הצעה, נסה שוב');
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

    // For new assignments (no ID), we can't save media to entity yet in backend function easily without ID.
    // However, the backend function supports updating if entityId is provided.
    // If not provided, it just returns the URL. We set it in form state.
    
    setIsGeneratingMedia(true);
    try {
        const res = await base44.functions.invoke('generateVisualMedia', {
            entityId: assignment?.id,
            entityType: 'assignment',
            action: 'generate_image',
            customPrompt: prompt
        });

        if (res.data?.success) {
            toast.success('המדיה הופקה בהצלחה!');
            setValue('media_url', res.data.media_url);
        } else {
            toast.error('שגיאה בהפקה: ' + (res.data?.error || 'Unknown'));
        }
    } catch (e) {
        console.error(e);
        toast.error('תקלה בתקשורת');
    } finally {
        setIsGeneratingMedia(false);
    }
  };

  // Rubric State
  const [rubricCriteria, setRubricCriteria] = React.useState([]);
  const [showIntegrationGuide, setShowIntegrationGuide] = React.useState(false);
  
  // Fetch existing rubric if editing
  useQuery({
      queryKey: ['assignmentRubric', assignment?.id],
      queryFn: async () => {
          if (!assignment?.id) return null;
          const rubrics = await base44.entities.GradingRubric.filter({ assignment_id: assignment.id });
          if (rubrics && rubrics.length > 0) {
              const criteria = await base44.entities.RubricCriterion.filter({ rubric_id: rubrics[0].id });
              setRubricCriteria(criteria);
              return rubrics[0];
          }
          return null;
      },
      enabled: !!assignment?.id
  });

  const selectedType = watch('type');
  const contentData = watch('content_data');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const selectedCourseId = watch('course_id');

  const { data: materials } = useQuery({
    queryKey: ['courseMaterials', selectedCourseId],
    queryFn: async () => {
        const [legacy, newMats] = await Promise.all([
            base44.entities.Material.filter({ course_id: selectedCourseId }),
            base44.entities.Material.filter({ course_ids: selectedCourseId })
        ]);
        const all = [...(legacy || []), ...(newMats || [])];
        return all.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
    },
    enabled: !!selectedCourseId
  });

  // Auto-link materials when session changes
  const selectedSessionId = watch('session_id');
  React.useEffect(() => {
    if (selectedSessionId && materials) {
      const sessionMaterials = materials.filter(m => m.session_id === selectedSessionId);
      const sessionMaterialIds = sessionMaterials.map(m => m.id);
      
      // Merge with existing material IDs (don't override manual selections)
      const currentIds = watch('related_material_ids') || [];
      const newIds = [...new Set([...currentIds, ...sessionMaterialIds])];
      
      if (newIds.length !== currentIds.length) {
        setValue('related_material_ids', newIds);
        if (sessionMaterialIds.length > 0) {
          toast.success(`${sessionMaterialIds.length} חומרי לימוד משויכים אוטומטית מהמפגש`);
        }
      }
    }
  }, [selectedSessionId, materials]);

  const { data: sessions } = useQuery({
    queryKey: ['courseSessions', selectedCourseId],
    queryFn: () => base44.entities.CourseSession.filter({ course_id: selectedCourseId }, 'session_number', 100),
    enabled: !!selectedCourseId
  });

  const { data: templates } = useQuery({
    queryKey: ['assignmentTemplates', user?.organization_id],
    queryFn: async () => {
      if (!user?.organization_id) return [];
      const [orgTemplates, globalTemplates] = await Promise.all([
      base44.entities.AssignmentTemplate.filter({ organization_id: user.organization_id }),
      base44.entities.AssignmentTemplate.filter({ is_global: true })]
      );
      return [...(globalTemplates || []), ...(orgTemplates || [])];
    },
    enabled: !!user?.organization_id
  });

  const handleTemplateSelect = (templateId) => {
    const template = templates?.find((t) => t.id === templateId);
    if (template) {
      if (template.default_title) setValue('title', template.default_title);
      if (template.default_description) setValue('description', template.default_description);
      if (template.video_url) setValue('video_url', template.video_url);
      if (template.max_score) setValue('max_score', template.max_score);
      if (template.key_concepts) setValue('key_concepts', template.key_concepts);
      if (template.resource_links) setValue('resource_links', template.resource_links);
    }
  };

  const relatedMaterialIds = watch('related_material_ids') || [];

  const toggleMaterial = (materialId) => {
    const current = relatedMaterialIds;
    if (current.includes(materialId)) {
      setValue('related_material_ids', current.filter((id) => id !== materialId));
    } else {
      setValue('related_material_ids', [...current, materialId]);
    }
  };

  React.useEffect(() => {
    if (assignment) {
      reset({
        ...assignment,
        due_date: assignment.due_date || '',
        key_concepts: assignment.key_concepts || [],
        resource_links: assignment.resource_links || [],
        video_url: assignment.video_url || '',
        audio_url: assignment.audio_url || '',
        audio_script: assignment.audio_script || '',
        media_url: assignment.media_url || '',
        media_prompt: assignment.media_prompt || ''
      });
    } else {
      reset({
        title: '',
        description: '',
        course_id: '',
        type: 'assignment',
        due_date: '',
        weight: '',
        max_score: 100,
        status: 'open',
        video_url: '',
        media_url: '',
        media_prompt: '',
        key_concepts: [],
        resource_links: []
      });
    }
  }, [assignment, reset]);

  const dueDate = watch('due_date');
  // Normalize key concepts to objects if they are strings (legacy support)
  const rawConcepts = watch('key_concepts') || [];
  const keyConcepts = rawConcepts.map((c) => typeof c === 'string' ? { term: c, definition: '' } : c);

  const resourceLinks = watch('resource_links') || [];

  const addConcept = () => {
    setValue('key_concepts', [...keyConcepts, { term: '', definition: '' }]);
  };

  const removeConcept = (index) => {
    setValue('key_concepts', keyConcepts.filter((_, i) => i !== index));
  };

  const updateConcept = (index, field, value) => {
    const newConcepts = [...keyConcepts];
    newConcepts[index] = { ...newConcepts[index], [field]: value };
    setValue('key_concepts', newConcepts);
  };

  const addLink = () => {
    setValue('resource_links', [...resourceLinks, '']);
  };

  const removeLink = (index) => {
    setValue('resource_links', resourceLinks.filter((_, i) => i !== index));
  };

  const updateLink = (index, value) => {
    const newLinks = [...resourceLinks];
    newLinks[index] = value;
    setValue('resource_links', newLinks);
  };
  const activeCourses = courses?.filter((c) => c.status === 'active') || [];

  const onFormSubmit = (data) => {
    onSubmit({
      ...data,
      weight: data.weight ? Number(data.weight) : null,
      max_score: data.max_score ? Number(data.max_score) : 100,
      rubricCriteria // Pass rubric criteria to parent
    });
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto z-[50]"
        onInteractOutside={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}>

        <DialogHeader>
          <DialogTitle dir="rtl">{assignment ? 'עריכת מטלה' : 'מטלה חדשה'}</DialogTitle>
        </DialogHeader>

        {!assignment && templates && templates.length > 0 &&
        <div className="bg-indigo-50 p-3 rounded-lg flex items-center gap-3 mb-4">
                <LayoutTemplate className="text-indigo-600 w-5 h-5" />
                <div className="flex-1">
                    <Label className="text-indigo-800 text-sm mb-1 block">טען מתבנית קיימת</Label>
                    <Select onValueChange={handleTemplateSelect}>
                        <SelectTrigger className="bg-white border-indigo-200 h-8">
                            <SelectValue placeholder="בחר תבנית..." />
                        </SelectTrigger>
                        <SelectContent>
                            {templates.map((t) =>
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                )}
                        </SelectContent>
                    </Select>
                </div>
             </div>
        }

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Basic Info */}
              <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">כותרת *</Label>
                    <Input
                  id="title"
                  {...register('title', { required: 'שדה חובה' })}
                  placeholder="שם המטלה" />

                    {errors.title &&
                <p className="text-sm text-red-500">{errors.title.message}</p>
                }
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="course_id">קורס *</Label>
                      <Select
                    value={watch('course_id') || undefined}
                    onValueChange={(value) => setValue('course_id', value)}>

                        <SelectTrigger>
                          <SelectValue placeholder="בחר קורס" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeCourses.map((course) =>
                      <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                      )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">סוג</Label>
                      <Select
                    value={watch('type')}
                    onValueChange={(value) => setValue('type', value)}>

                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {assignmentTypes.map((type) =>
                      <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                      )}
                        </SelectContent>
                      </Select>
                    </div>
                    </div>

                    {/* Session Selector */}
                    {sessions && sessions.length > 0 &&
              <div className="space-y-2">
                          <Label htmlFor="session_id">שיוך למפגש (אופציונלי)</Label>
                          <Select
                  value={watch('session_id') || "none"}
                  onValueChange={(value) => setValue('session_id', value === "none" ? null : value)}>

                            <SelectTrigger>
                              <SelectValue placeholder="בחר מפגש מהסילבוס" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">ללא שיוך</SelectItem>
                              {sessions.sort((a, b) => a.session_number - b.session_number).map((session) =>
                    <SelectItem key={session.id} value={session.id}>
                                  מפגש {session.session_number}: {session.title}
                                </SelectItem>
                    )}
                            </SelectContent>
                          </Select>
                       </div>
              }

                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="due_date">תאריך הגשה *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                        variant="outline"
                        className={`w-full justify-start text-right ${!dueDate && 'text-muted-foreground'}`}>

                              <CalendarIcon className="ml-2 h-4 w-4" />
                              {(() => {
                          if (!dueDate) return 'בחר תאריך';
                          const d = new Date(dueDate);
                          return isValid(d) ? format(d, 'dd/MM/yyyy', { locale: he }) : 'תאריך לא תקין';
                        })()}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                        mode="single"
                        selected={(() => {
                          if (!dueDate) return undefined;
                          const d = new Date(dueDate);
                          return isValid(d) ? d : undefined;
                        })()}
                        onSelect={(date) => setValue('due_date', date ? format(date, 'yyyy-MM-dd') : '')}
                        locale={he} />

                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="max_score">ציון מקסימלי</Label>
                          <Input
                    id="max_score"
                    type="number"
                    {...register('max_score')}
                    placeholder="100" />

                      </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">תיאור והנחיות (תומך בעיצוב עשיר)</Label>
                    <ReactQuill
                      value={watch('description') || ''}
                      onChange={(value) => setValue('description', value)}
                      placeholder="תיאור המטלה עם עיצוב, קישורים, רשימות ועוד..."
                      className="bg-white rounded-lg border border-slate-200"
                      theme="snow"
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          [{ 'color': [] }, { 'background': [] }],
                          ['link', 'code-block'],
                          ['clean']
                        ]
                      }}
                      style={{ minHeight: '200px' }}
                    />
                  </div>
              </div>

              {/* Right Column: Dynamic Content & Resources */}
              <div className="space-y-4">
                  <Tabs defaultValue="content" className="w-full">
                      <TabsList className="w-full gap-1">
                          <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                  <TooltipTrigger asChild>
                                      <TabsTrigger value="content" className="flex-1">
                                          <FileText className="w-4 h-4" />
                                      </TabsTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-slate-900 text-white border-0"><p>תוכן המטלה</p></TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                  <TooltipTrigger asChild>
                                      <TabsTrigger value="resources" className="flex-1">
                                          <LinkIcon className="w-4 h-4" />
                                      </TabsTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-slate-900 text-white border-0"><p>חומרים ומקורות</p></TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                  <TooltipTrigger asChild>
                                      <TabsTrigger value="rubric" className="flex-1">
                                          <ListChecks className="w-4 h-4" />
                                      </TabsTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-slate-900 text-white border-0"><p>מחוון הערכה</p></TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                  <TooltipTrigger asChild>
                                      <TabsTrigger value="audio" className="flex-1">
                                          <Wand2 className="w-4 h-4" />
                                      </TabsTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-slate-900 text-white border-0"><p>מדיה ו-AI</p></TooltipContent>
                              </Tooltip>
                          </TooltipProvider>
                      </TabsList>

                      <TabsContent value="audio" className="mt-4 p-1 space-y-6">
                            <AIStudioPanel
                                audioScript={watch('audio_script')}
                                onAudioScriptChange={(val) => setValue('audio_script', val)}
                                voiceId={watch('voice_id')}
                                onVoiceIdChange={(val) => setValue('voice_id', val)}
                                stability={watch('stability') || 0.5}
                                onStabilityChange={(val) => setValue('stability', val)}
                                audioUrl={previewAudioUrl || watch('audio_url')}
                                onAudioGenerate={generateAudio}
                                isGeneratingAudio={isGeneratingAudio}
                                onScriptGenerate={generateScript}
                                isGeneratingScript={isGeneratingScript}
                                mediaPrompt={watch('media_prompt')}
                                onMediaPromptChange={(val) => setValue('media_prompt', val)}
                                mediaUrl={watch('media_url')}
                                onMediaGenerate={generateMedia}
                                isGeneratingMedia={isGeneratingMedia}
                                onPromptSuggest={suggestPrompt}
                                isGeneratingPrompt={isGeneratingPrompt}
                                onMediaClear={() => setValue('media_url', '')}
                                entityId={assignment?.id}
                            />
                      </TabsContent>

                      <TabsContent value="rubric" className="mt-4 p-1">
                          <RubricBuilder 
                              value={rubricCriteria} 
                              onChange={setRubricCriteria} 
                          />
                      </TabsContent>

                      <TabsContent value="content" className="mt-4 p-1">
                          {(selectedType === 'exam' || selectedType === 'quiz') &&
                  <div className="space-y-2">
                                  <Label className="text-indigo-600 flex items-center gap-2">
                                      <ScrollText className="w-4 h-4" />
                                      עורך שאלות
                                  </Label>
                                  <ExamBuilder
                      value={contentData || {}}
                      onChange={(newData) => setValue('content_data', newData)} />

                              </div>
                  }

                          {selectedType === 'project' &&
                  <div className="space-y-2">
                                  <Label className="text-indigo-600 flex items-center gap-2">
                                      <ScrollText className="w-4 h-4" />
                                      מבנה הפרויקט
                                  </Label>
                                  <ProjectBuilder
                      value={contentData || {}}
                      onChange={(newData) => setValue('content_data', newData)}
                      finalDueDate={watch('due_date')} />

                              </div>
                  }

                          {selectedType === 'assignment' &&
                  <div className="bg-slate-50 p-8 text-center rounded-xl border border-slate-200 text-slate-500">
                                  <p>למטלה רגילה אין מבנה מיוחד.</p>
                                  <p className="text-sm mt-2">ניתן להוסיף תיאור, קבצים וקישורים.</p>
                              </div>
                  }
                      </TabsContent>

                      <TabsContent value="resources" className="mt-4 space-y-6">
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-slate-500" />
                              קישור לסרטון (YouTube)
                            </Label>
                            <Input
                      {...register('video_url')}
                      placeholder="https://www.youtube.com/watch?v=..."
                      dir="ltr" />
                          </div>

                          <div className="space-y-2 pt-2 border-t border-dashed">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="external_link">קישור למטלה חיצונית (אינטגרציה)</Label>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 text-xs text-blue-600 gap-1 hover:bg-blue-50"
                                        onClick={() => setShowIntegrationGuide(true)}
                                    >
                                        <Terminal size={12} />
                                        מדריך טכני למפתחים
                                    </Button>
                                </div>
                                <Input
                                    id="external_link"
                                    {...register('file_url')} 
                                    placeholder="https://external-quiz-app.com/quiz/123"
                                    className="text-left dir-ltr bg-slate-50"
                                />
                                <p className="text-[11px] text-slate-500">
                                    הדבק כאן קישור למערכת חיצונית. המערכת תוסיף אוטומטית מזהי תלמיד לקישור זה.
                                </p>
                            </div>

                          <div className="space-y-2">
                            <Label className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-slate-500" />
                                מושגי מפתח
                              </div>
                              <Button type="button" variant="outline" size="sm" onClick={addConcept}>
                                <Plus className="w-4 h-4 mr-1" />
                                הוסף
                              </Button>
                            </Label>
                            <div className="space-y-3 max-h-60 overflow-y-auto p-1">
                              {keyConcepts.map((concept, index) =>
                      <div key={index} className="flex gap-2 items-start bg-slate-50 p-2 rounded-lg border border-slate-100">
                                  <div className="flex-1 space-y-2">
                                      <Input
                            value={concept.term}
                            onChange={(e) => updateConcept(index, 'term', e.target.value)}
                            placeholder="שם המושג"
                            className="bg-white h-8" />

                                      <Textarea
                            value={concept.definition}
                            onChange={(e) => updateConcept(index, 'definition', e.target.value)}
                            placeholder="הסבר קצר / הגדרה"
                            className="bg-white min-h-[60px] text-xs resize-none" />

                                  </div>
                                  <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeConcept(index)}
                          className="shrink-0 hover:bg-red-50 hover:text-red-600 h-8 w-8">

                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                      )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-slate-500" />
                                קישורים חיצוניים
                              </div>
                              <Button type="button" variant="outline" size="sm" onClick={addLink}>
                                <Plus className="w-4 h-4 mr-1" />
                                הוסף
                              </Button>
                            </Label>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {resourceLinks.map((link, index) =>
                      <div key={index} className="flex gap-2">
                                  <Input
                          value={link}
                          onChange={(e) => updateLink(index, e.target.value)}
                          placeholder="https://"
                          dir="ltr" />

                                  <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLink(index)}
                          className="shrink-0">

                                    <X className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                      )}
                            </div>
                          </div>

                          <div className="space-y-2">
                             <Label className="flex items-center gap-2">
                                <FolderOpen className="w-4 h-4 text-slate-500" />
                                חומרי לימוד קשורים
                             </Label>
                             {selectedCourseId ?
                    materials && materials.length > 0 ?
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-lg p-2 bg-slate-50">
                                         {materials.map((material) => {
                        const isSelected = relatedMaterialIds.includes(material.id);
                        return (
                          <div
                            key={material.id}
                            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors border ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-transparent hover:bg-slate-100'}`}
                            onClick={() => toggleMaterial(material.id)}>

                                                     <div className="flex items-center gap-2 overflow-hidden">
                                                         <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                                             {isSelected && <Check className="w-3 h-3 text-white" />}
                                                         </div>
                                                         <span className={`text-sm truncate ${isSelected ? 'font-medium text-indigo-700' : 'text-slate-600'}`}>
                                                             {material.title}
                                                         </span>
                                                     </div>
                                                     <Badge variant="secondary" className="text-xs scale-90 opacity-70">
                                                         {material.type}
                                                     </Badge>
                                                 </div>);

                      })}
                                     </div> :

                    <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded border border-dashed">
                                         לא נמצאו חומרי לימוד בקורס זה
                                     </p> :


                    <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded border border-dashed">
                                     יש לבחור קורס כדי לראות חומרי לימוד
                                 </p>
                    }
                          </div>
                      </TabsContent>
                  </Tabs>
              </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="bg-slate-700 hover:bg-slate-800 text-white border-slate-600">
              ביטול
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isLoading && <Loader2 className="h-4 w-4 ms-2 animate-spin" />}
              {assignment ? 'עדכון' : 'יצירה'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    {showIntegrationGuide && (
        <IntegrationGuide onClose={() => setShowIntegrationGuide(false)} />
    )}
    </>);

}