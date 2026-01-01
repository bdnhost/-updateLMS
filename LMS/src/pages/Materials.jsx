import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PlanGuard from '@/components/common/PlanGuard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Plus,
  Search,
  FolderOpen,
  FileText,
  Video,
  Link as LinkIcon,
  Presentation,
  File,
  Upload,
  ExternalLink,
  Loader2,
  Trash2,
  Download,
  Share2,
  Pencil,
  ImageIcon,
  Palette,
  Wand2,
  Mic,
  LayoutGrid,
  List,
  BookOpen,
  TrendingUp,
  Target,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createPageUrl } from '@/utils';
import { toast, Toaster } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import ImportDialog from '@/components/common/ImportDialog';
import MaterialViewDialog from '@/components/materials/MaterialViewDialog';
import SimpleMessageDialog from '@/components/common/SimpleMessageDialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

const materialTypes = [
  { value: 'presentation', label: 'מצגת', icon: Presentation, color: 'orange' },
  { value: 'document', label: 'מסמך', icon: FileText, color: 'blue' },
  { value: 'video', label: 'וידאו', icon: Video, color: 'red' },
  { value: 'link', label: 'קישור', icon: LinkIcon, color: 'cyan' },
  { value: 'other', label: 'אחר', icon: File, color: 'gray' }
];

export default function Materials() {
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('-created_date');
  const [viewMaterial, setViewMaterial] = useState(null);
  const [shareMaterial, setShareMaterial] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    course_id: '',
    course_ids: [],
    session_id: '',
    type: 'document',
    topic: '',
    week_number: '',
    file_url: '',
    media_url: '',
    media_prompt: '',
    audio_url: '',
    audio_script: '',
    generated_content: null
  });
  const [uploading, setUploading] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingMedia, setIsGeneratingMedia] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [pollingAudio, setPollingAudio] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const queryClient = useQueryClient();

  // Polling for Audio
  React.useEffect(() => {
    let interval;
    if (pollingAudio && editingId) {
      interval = setInterval(async () => {
        try {
          const res = await base44.functions.invoke('mediaSync', {
            action: 'cpanel_sync',
            entityType: 'material',
            entityId: editingId
          });
          if (res.data?.processed > 0) {
            setPollingAudio(false);
            queryClient.invalidateQueries({ queryKey: ['materials'] });
            toast.success('האודיו מוכן להשמעה!');
          }
        } catch (e) {
          console.error("Audio Polling error", e);
          if (e.response && (e.response.status === 401 || e.response.status === 403)) {
            setPollingAudio(false);
          }
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [pollingAudio, editingId, queryClient]);

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
        } catch (e) {
          console.error(e);
        }
      }
      return u;
    }
  });

  const { data: materials, isLoading } = useQuery({
    queryKey: ['materials', user?.organization_id],
    queryFn: () => base44.entities.Material.filter({ organization_id: user?.organization_id }),
    enabled: !!user?.organization_id
  });

  const { data: courses } = useQuery({
    queryKey: ['courses', user?.organization_id],
    queryFn: () => base44.entities.Course.filter({ organization_id: user?.organization_id }),
    enabled: !!user?.organization_id
  });

  const { data: sessions } = useQuery({
    queryKey: ['courseSessions', newMaterial.course_id],
    queryFn: () => base44.entities.CourseSession.filter({ course_id: newMaterial.course_id }, 'session_number', 100),
    enabled: !!newMaterial.course_id
  });

  const { data: students } = useQuery({
    queryKey: ['students', user?.organization_id],
    queryFn: () => base44.entities.Student.filter({ organization_id: user?.organization_id }),
    enabled: !!user?.organization_id
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Material.create({ ...data, organization_id: user?.organization_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      setFormOpen(false);
      resetForm();
      toast.success('החומר נוסף בהצלחה');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Material.update(editingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      setFormOpen(false);
      resetForm();
      toast.success('החומר עודכן בהצלחה');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Material.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('החומר נמחק');
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      const promises = ids.map((id) => base44.entities.Material.delete(id));
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      setBulkDeleteDialogOpen(false);
      setSelectedMaterialIds([]);
      toast.success(`${selectedMaterialIds.length} חומרים נמחקו בהצלחה`);
    },
    onError: () => {
      toast.error('שגיאה במחיקת חומרים');
    }
  });

  const resetForm = () => {
    setNewMaterial({
      title: '',
      description: '',
      course_id: '',
      course_ids: [],
      session_id: '',
      type: 'document',
      topic: '',
      week_number: '',
      file_url: '',
      media_url: '',
      media_prompt: '',
      audio_url: '',
      audio_script: '',
      generated_content: null
    });
    setEditingId(null);
  };

  const handleEdit = (material) => {
    setNewMaterial({
      title: material.title || '',
      description: material.description || '',
      course_id: material.course_id || '',
      course_ids: material.course_ids || (material.course_id ? [material.course_id] : []),
      session_id: material.session_id || '',
      type: material.type || 'document',
      topic: material.topic || '',
      week_number: material.week_number || '',
      file_url: material.file_url || '',
      media_url: material.media_url || '',
      media_prompt: material.media_prompt || '',
      audio_url: material.audio_url || '',
      audio_script: material.audio_script || '',
      generated_content: material.generated_content || null
    });
    setEditingId(material.id);
    setFormOpen(true);
  };

  const suggestPrompt = async () => {
    if (!newMaterial.title) {
      toast.error('יש להזין כותרת לחומר תחילה');
      return;
    }

    setIsGeneratingPrompt(true);
    try {
      const res = await base44.functions.invoke('generateVisualMedia', {
        entityId: editingId,
        entityType: 'material',
        action: 'suggest_prompt',
        contextData: {
          title: newMaterial.title,
          description: newMaterial.description
        }
      });

      if (res.data?.prompt) {
        setNewMaterial((prev) => ({ ...prev, media_prompt: res.data.prompt }));
        toast.success('הצעה לפרומפט נוצרה בהצלחה!');
      }
    } catch (e) {
      console.error(e);
      toast.error('תקלה בקבלת הצעה');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const generateAIContent = async () => {
    if (!newMaterial.title) {
      toast.error('יש להזין כותרת תחילה');
      return;
    }

    setIsGeneratingContent(true);
    try {
      const isPresentation = newMaterial.type === 'presentation';
      const prompt = isPresentation
        ? `Create a presentation outline of about 5 slides for "${newMaterial.title}". Context: ${newMaterial.description || ''}. 
               Return a JSON object with a "slides" array. Each slide should have "title", "bullets" (array of strings), and "speaker_notes".
               Target audience: Students. Language: Hebrew.`
        : `Write a comprehensive educational document about "${newMaterial.title}". Context: ${newMaterial.description || ''}.
               Return a JSON object with "html_content" containing rich HTML text (use headings, paragraphs, lists).
               Target audience: Students. Language: Hebrew.`;

      const schema = isPresentation
        ? {
            type: "object",
            properties: {
              slides: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    bullets: { type: "array", items: { type: "string" } },
                    speaker_notes: { type: "string" }
                  },
                  required: ["title", "bullets"]
                }
              }
            }
          }
        : {
            type: "object",
            properties: {
              html_content: { type: "string" }
            }
          };

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: schema
      });

      console.log("AI Content Generation Response:", res);

      if (res && (res.slides || res.html_content)) {
        setNewMaterial((prev) => ({ ...prev, generated_content: res }));
        toast.success('התוכן נוצר בהצלחה!');

        // If presentation: auto-populate audio_script from speaker_notes
        if (isPresentation && res.slides) {
          const fullScript = res.slides
            .map((s) => s.speaker_notes || '')
            .filter((n) => n.trim().length > 0)
            .join('\n\n');
          if (fullScript.trim().length > 0) {
            setNewMaterial((prev) => ({ ...prev, audio_script: fullScript }));
            toast.info('תמליל אודיו הוזן אוטומטית מהערות המרצה');
          }
        }
      } else {
        console.error("AI did not return expected content:", res);
        toast.error('ה-AI לא הצליח לייצר תוכן. נסה שוב.');
      }
    } catch (e) {
      console.error(e);
      toast.error('שגיאה ביצירת תוכן');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const generateMedia = async () => {
    if (!newMaterial.media_prompt) {
      toast.error('יש להזין פרומפט');
      return;
    }

    if (newMaterial.media_url) {
      toast.info('כבר קיימת תמונה. מדלג על יצירה');
      return;
    }

    setIsGeneratingMedia(true);
    try {
      const res = await base44.functions.invoke('generateVisualMedia', {
        entityId: editingId,
        entityType: 'material',
        action: 'generate_image',
        customPrompt: newMaterial.media_prompt
      });

      if (res.data?.success) {
        toast.success('המedia הופקה בהצלחה!');
        setNewMaterial((prev) => ({ ...prev, media_url: res.data.media_url }));
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

  const generateScript = async () => {
    if (!newMaterial.title) {
      toast.error('יש להזין כותרת תחילה');
      return;
    }

    setIsGeneratingScript(true);
    try {
      const res = await base44.functions.invoke('generateAudioGuide', {
        entityId: editingId,
        entityType: 'material',
        action: 'generate_script',
        contextData: {
          title: newMaterial.title,
          description: newMaterial.description
        }
      });

      if (res.data?.script) {
        setNewMaterial((prev) => ({ ...prev, audio_script: res.data.script }));
        toast.success('תמליל נוצר בהצלחה!');
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
    if (!newMaterial.audio_script) {
      toast.error('יש להזין תמליל לפני יצירת אודיו');
      return;
    }

    setIsGeneratingAudio(true);
    const toastId = toast.loading('שולח בקשה להפקת אודיו...');

    try {
      // Update material with script first (if editing)
      if (editingId) {
        await base44.entities.Material.update(editingId, { audio_script: newMaterial.audio_script });
      }

      const res = await base44.functions.invoke('mediaSync', {
        action: 'cpanel_sync',
        entityType: 'material',
        entityId: editingId
      });

      if (res.data?.success) {
        if (res.data.processed > 0) {
          toast.success('אודיו סונכרן בהצלחה!', { id: toastId });
          queryClient.invalidateQueries({ queryKey: ['materials'] });
        } else {
          toast.success('הבקשה נשלחה לייצור! המערכת תעדכן כשהקובץ מוכן.', { id: toastId });
          setPollingAudio(true);
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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNewMaterial((prev) => ({
        ...prev,
        file_url,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '')
      }));
      toast.success('הקובץ הועלה בהצלחה');
    } catch (error) {
      toast.error('שגיאה בהעלאת הקובץ');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMaterial.title || (!newMaterial.course_ids?.length && !newMaterial.course_id)) {
      toast.error('נא למלא את כל השדות הנדרשים');
      return;
    }

    const payload = {
      ...newMaterial,
      course_id: newMaterial.course_ids?.[0] || newMaterial.course_id,
      week_number: newMaterial.week_number ? parseInt(newMaterial.week_number) : null
    };

    if (editingId) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const getTypeConfig = (type) => {
    return materialTypes.find((t) => t.value === type) || materialTypes[4];
  };

  const getCourseName = (courseId) => {
    return courses?.find((c) => c.id === courseId)?.name || '';
  };

  const filteredMaterials = useMemo(() => {
    let filtered = materials?.filter((material) => {
      const matchesSearch = material.title?.toLowerCase().includes(search.toLowerCase() || '') ?? true;

      // Handle unassigned filter
      if (courseFilter === 'unassigned') {
        const hasNoCourse = (!material.course_ids || material.course_ids.length === 0) && !material.course_id;
        const matchesType = typeFilter === 'all' || material.type === typeFilter;
        return matchesSearch && hasNoCourse && matchesType;
      }

      // Regular course filter
      const matchesCourse =
        courseFilter === 'all' ||
        material.course_id === courseFilter ||
        material.course_ids?.includes(courseFilter);
      const matchesType = typeFilter === 'all' || material.type === typeFilter;
      return matchesSearch && matchesCourse && matchesType;
    }) || [];

    // Sort
    if (sortBy === '-created_date') {
      filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    } else if (sortBy === 'created_date') {
      filtered.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'he'));
    }

    return filtered;
  }, [materials, search, courseFilter, typeFilter, sortBy]);

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: filteredMaterials.length,
      presentations: filteredMaterials.filter((m) => m.type === 'presentation').length,
      documents: filteredMaterials.filter((m) => m.type === 'document').length,
      withAI: filteredMaterials.filter((m) => m.generated_content || m.media_url || m.audio_url).length
    };
  }, [filteredMaterials]);

  const groupedMaterials = useMemo(() => {
    // If filtering for unassigned, return only orphans
    if (courseFilter === 'unassigned') {
      const orphans = filteredMaterials.filter(
        (m) => (!m.course_ids || m.course_ids.length === 0) && !m.course_id
      );
      return orphans.length > 0 ? { orphan: orphans } : {};
    }

    const groups = {};
    filteredMaterials.forEach((material) => {
      const cIds =
        material.course_ids && material.course_ids.length > 0
          ? material.course_ids
          : material.course_id
          ? [material.course_id]
          : [];

      if (cIds.length === 0) {
        if (!groups['orphan']) groups['orphan'] = [];
        groups['orphan'].push(material);
      } else {
        cIds.forEach((cId) => {
          if (!groups[cId]) {
            groups[cId] = [];
          }
          if (!groups[cId].find((m) => m.id === material.id)) {
            groups[cId].push(material);
          }
        });
      }
    });
    return groups;
  }, [filteredMaterials, courseFilter]);

  const activeCourses = courses?.filter((c) => c.status === 'active') || [];

  return (
    <div className="space-y-6" dir="rtl">
      <Toaster position="top-center" richColors />

      {/* HEADER משודרג */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white via-sky-50/30 to-blue-50/30 rounded-3xl shadow-xl border-2 border-sky-100 p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* כותרת */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 mb-1">חומרי לימוד</h1>
              <p className="text-slate-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                מצגות, מסמכים וחומרי עזר
              </p>
            </div>
          </div>

          {/* כפתורי פעולה */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setImportOpen(true)}
              className="gap-2 border-2 border-slate-200 hover:bg-slate-50 font-bold"
            >
              <Upload className="h-4 w-4" />
              ייבוא
            </Button>
            <Button
              onClick={() => setFormOpen(true)}
              className="gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-4 w-4" />
              חומר חדש
            </Button>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-sky-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 border-2 border-sky-200 shadow-md hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-100 rounded-xl group-hover:scale-110 transition-transform">
                <Target className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <div className="text-xs text-sky-600 font-bold uppercase tracking-wider mb-0.5">סה"כ חומרים</div>
                <div className="text-2xl font-black text-slate-800">{stats.total}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 border-2 border-orange-200 shadow-md hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-100 rounded-xl group-hover:scale-110 transition-transform">
                <Presentation className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-0.5">מצגות</div>
                <div className="text-2xl font-black text-slate-800">{stats.presentations}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-4 border-2 border-blue-200 shadow-md hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-0.5">מסמכים</div>
                <div className="text-2xl font-black text-slate-800">{stats.documents}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-4 border-2 border-violet-200 shadow-md hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-100 rounded-xl group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <div className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-0.5">עם AI</div>
                <div className="text-2xl font-black text-slate-800">{stats.withAI}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* BULK ACTIONS BAR */}
      <AnimatePresence>
        {selectedMaterialIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-red-50 to-pink-50 p-5 rounded-2xl flex items-center justify-between border-2 border-red-200 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="bg-red-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-md">
                {selectedMaterialIds.length}
              </div>
              <span className="text-sm font-black text-slate-800">חומרים נבחרו</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMaterialIds([])}
                className="h-9 border-2 border-slate-300 hover:bg-white font-bold"
              >
                ביטול בחירה
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteDialogOpen(true)}
                className="gap-2 h-9 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 font-bold shadow-md"
              >
                <Trash2 className="h-4 w-4" />
                מחק נבחרים
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="חיפוש חומר..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pe-10 border-2 border-slate-200 rounded-xl"
          />
        </div>

        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-full sm:w-48 border-2 border-slate-200 rounded-xl">
            <SelectValue placeholder="כל הקורסים" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הקורסים</SelectItem>
            <SelectItem value="unassigned">ללא שיוך</SelectItem>
            {activeCourses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40 border-2 border-slate-200 rounded-xl">
            <SelectValue placeholder="סוג" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסוגים</SelectItem>
            {materialTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40 border-2 border-slate-200 rounded-xl">
            <SelectValue placeholder="מיון" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-created_date">חדשים ראשון</SelectItem>
            <SelectItem value="created_date">ישנים ראשון</SelectItem>
            <SelectItem value="title">לפי שם</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex bg-gradient-to-r from-slate-100 to-slate-50 p-1.5 rounded-xl border-2 border-slate-200 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('grid')}
            className={`px-3 transition-all ${viewMode === 'grid' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('list')}
            className={`px-3 transition-all ${viewMode === 'list' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'}`}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* MATERIALS VIEW */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i}>
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-32 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : filteredMaterials.length === 0 ? (
        <Card className="p-16 text-center border-2 border-slate-200 rounded-2xl shadow-lg">
          <FolderOpen className="h-20 w-20 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-black text-slate-600 mb-2">
            {search || courseFilter !== 'all' ? 'לא נמצאו חומרים' : 'אין חומרי לימוד עדיין'}
          </h3>
          <p className="text-slate-400 mb-6">
            {search || courseFilter !== 'all' ? 'נסה לשנות את החיפוש' : 'העלה את החומר הראשון שלך'}
          </p>
          {!search && courseFilter === 'all' && (
            <Button
              onClick={() => setFormOpen(true)}
              className="gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold shadow-lg"
            >
              <Plus className="h-4 w-4" />
              חומר חדש
            </Button>
          )}
        </Card>
      ) : viewMode === 'list' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-lg"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 border-b-2 border-slate-200">
                <tr>
                  <th className="p-4 w-[50px]">
                    <Checkbox
                      checked={selectedMaterialIds.length === filteredMaterials.length && filteredMaterials.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) setSelectedMaterialIds(filteredMaterials.map((m) => m.id));
                        else setSelectedMaterialIds([]);
                      }}
                    />
                  </th>
                  <th className="p-4 font-black">כותרת</th>
                  <th className="p-4 font-black">סוג</th>
                  <th className="p-4 font-black">קורס</th>
                  <th className="p-4 font-black">שבוע</th>
                  <th className="p-4 font-black">מדיה</th>
                  <th className="p-4 font-black">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaterials.map((material, index) => {
                  const typeConfig = getTypeConfig(material.type);
                  const Icon = typeConfig.icon;
                  const courseIds =
                    material.course_ids?.length > 0
                      ? material.course_ids
                      : material.course_id
                      ? [material.course_id]
                      : [];

                  return (
                    <motion.tr
                      key={material.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gradient-to-l hover:from-sky-50 hover:via-blue-50/30 cursor-pointer transition-all"
                      onClick={() =>
                        setViewMaterial({
                          ...material,
                          course_name: courseIds.map((id) => getCourseName(id)).join(', ')
                        })
                      }
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedMaterialIds.includes(material.id)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedMaterialIds((prev) => [...prev, material.id]);
                            else setSelectedMaterialIds((prev) => prev.filter((id) => id !== material.id));
                          }}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              material.type === 'video'
                                ? 'bg-red-50 text-red-500'
                                : material.type === 'presentation'
                                ? 'bg-orange-50 text-orange-500'
                                : material.type === 'link'
                                ? 'bg-blue-50 text-blue-500'
                                : 'bg-violet-50 text-violet-500'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-black text-slate-800">{material.title}</p>
                            {material.topic && <p className="text-xs text-slate-500">{material.topic}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="text-xs font-bold">
                          {typeConfig.label}
                        </Badge>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {courseIds.length > 0 ? courseIds.map((id) => getCourseName(id)).join(', ') : 'ללא שיוך'}
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {material.week_number ? `שבוע ${material.week_number}` : '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {material.audio_url && (
                            <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-600 border-indigo-200 font-bold">
                              🎵 אודיו
                            </Badge>
                          )}
                          {material.media_url && (
                            <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-600 border-purple-200 font-bold">
                              🖼️ תמונה
                            </Badge>
                          )}
                          {material.file_url && (
                            <Badge variant="outline" className="text-[10px] bg-green-50 text-green-600 border-green-200 font-bold">
                              📎 קובץ
                            </Badge>
                          )}
                          {material.generated_content && (
                            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200 font-bold">
                              ✨ AI
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-indigo-50"
                            onClick={() => handleEdit(material)}
                          >
                            <Pencil className="h-3 w-3 text-indigo-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-blue-50"
                            onClick={() => setShareMaterial(material)}
                          >
                            <Share2 className="h-3 w-3 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-50"
                            onClick={() => deleteMutation.mutate(material.id)}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedMaterials).map(([courseId, courseMaterials]) => (
            <motion.div
              key={courseId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-xl font-black text-slate-800 mb-5 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-sky-500 to-blue-600 rounded-full" />
                {courseId === 'orphan' ? 'חומרים ללא שיוך' : getCourseName(courseId)}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {courseMaterials.map((material, index) => {
                  const typeConfig = getTypeConfig(material.type);
                  const Icon = typeConfig.icon;

                  return (
                    <motion.div
                      key={material.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card
                        className="p-5 hover:shadow-2xl transition-all cursor-pointer group border-2 border-slate-200 hover:border-sky-300 rounded-2xl relative"
                        onClick={() =>
                          setViewMaterial({ ...material, course_name: getCourseName(courseId) })
                        }
                      >
                        <div className="absolute top-3 start-3 z-10" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedMaterialIds.includes(material.id)}
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedMaterialIds((prev) => [...prev, material.id]);
                              else setSelectedMaterialIds((prev) => prev.filter((id) => id !== material.id));
                            }}
                            className="border-2 border-slate-400 data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600"
                          />
                        </div>

                        <div className="flex items-start gap-4">
                          <div
                            className={`p-3 rounded-2xl shrink-0 transition-all shadow-md ${
                              material.type === 'video'
                                ? 'bg-red-50 text-red-500 group-hover:bg-red-100 group-hover:shadow-lg'
                                : material.type === 'presentation'
                                ? 'bg-orange-50 text-orange-500 group-hover:bg-orange-100 group-hover:shadow-lg'
                                : material.type === 'link'
                                ? 'bg-blue-50 text-blue-500 group-hover:bg-blue-100 group-hover:shadow-lg'
                                : 'bg-violet-50 text-violet-500 group-hover:bg-violet-100 group-hover:shadow-lg'
                            }`}
                          >
                            <Icon className="h-7 w-7" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-black text-slate-900 truncate group-hover:text-sky-700 transition-colors text-base">
                                {material.title}
                              </h4>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:bg-indigo-50 rounded-xl"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(material);
                                  }}
                                >
                                  <Pencil className="h-3 w-3 text-indigo-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:bg-blue-50 rounded-xl"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShareMaterial(material);
                                  }}
                                >
                                  <Share2 className="h-3 w-3 text-blue-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:bg-red-50 rounded-xl"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteMutation.mutate(material.id);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                              </div>
                            </div>

                            {material.topic && (
                              <p className="text-sm text-slate-500 mt-1 line-clamp-1 font-medium">{material.topic}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              <Badge
                                variant="secondary"
                                className="text-xs font-bold bg-slate-100 text-slate-600 group-hover:bg-white group-hover:shadow-sm"
                              >
                                {typeConfig.label}
                              </Badge>
                              {material.week_number && (
                                <Badge
                                  variant="outline"
                                  className="text-xs font-bold text-slate-500 border-slate-200 group-hover:border-sky-300 group-hover:text-sky-600"
                                >
                                  שבוע {material.week_number}
                                </Badge>
                              )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                              <div className="flex gap-1 flex-wrap">
                                {material.audio_url && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] bg-indigo-50 text-indigo-600 border-indigo-200 font-bold"
                                  >
                                    🎵
                                  </Badge>
                                )}
                                {material.media_url && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] bg-purple-50 text-purple-600 border-purple-200 font-bold"
                                  >
                                    🖼️
                                  </Badge>
                                )}
                                {material.file_url && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] bg-green-50 text-green-600 border-green-200 font-bold"
                                  >
                                    📎
                                  </Badge>
                                )}
                                {material.generated_content && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] bg-amber-50 text-amber-600 border-amber-200 font-bold"
                                  >
                                    ✨ AI
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400 font-black group-hover:text-sky-500 transition-colors">
                                  לחץ לצפייה
                                </span>
                                <div className="bg-slate-50 p-1.5 rounded-full group-hover:bg-sky-50 transition-colors">
                                  <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-sky-500" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* View Material Dialog */}
      <MaterialViewDialog
        material={viewMaterial}
        open={!!viewMaterial}
        onClose={() => setViewMaterial(null)}
        onEdit={() => {
          if (viewMaterial) {
            handleEdit(viewMaterial);
            setViewMaterial(null);
          }
        }}
      />

      {/* Share Dialog */}
      {shareMaterial && (
        <SimpleMessageDialog
          open={!!shareMaterial}
          onClose={() => setShareMaterial(null)}
          recipients={
            courses?.find((c) => c.id === shareMaterial.course_id)
              ? students?.filter((s) => s.course_id === shareMaterial.course_id)
              : []
          }
          initialType="whatsapp"
          initialContent={`היי, מצורף חומר לימוד בקורס ${getCourseName(
            shareMaterial.course_id
          )}: ${shareMaterial.title}\n${window.location.origin}${createPageUrl(
            'PublicView'
          )}?type=material&id=${shareMaterial.id}`}
        />
      )}

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-2 border-red-200 rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-red-900">
              האם למחוק את החומרים הנבחרים?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 leading-relaxed">
              פעולה זו תמחק <span className="font-bold text-red-600">{selectedMaterialIds.length} חומרים</span> לצמיתות.
              <br />
              <strong className="text-red-600">הפעולה אינה ניתנת לביטול.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-slate-700 hover:bg-slate-800 text-white font-bold">ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkDeleteMutation.mutate(selectedMaterialIds)}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold shadow-lg"
            >
              מחיקה סופית
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Dialog */}
      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        entityName="Material"
        courses={courses}
        organizationId={user?.organization_id}
        onImportComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['materials'] });
        }}
        templateData="כותרת*,תיאור,שם הקורס,סוג (document/presentation/lexicon/video/link),מספר שבוע,נושא,קישור,פרומפט לתמונה,טקסט לקריינות
מצגת מבוא לקורס,סקירה כללית על הקורס והציפיות,פיתון למתחילים,presentation,1,מבוא ויסודות,https://example.com/intro.pptx,A colorful educational presentation cover with Python logo and coding symbols,ברוכים הבאים לקורס פיתון. בשיעור הראשון נכיר את יסודות השפה.
חומר לימוד - משתנים,הסבר מפורט על משתנים וסוגי נתונים,פיתון למתחילים,document,2,משתנים וסוגי נתונים,https://example.com/variables.pdf,An infographic showing different variable types in programming,בפרק זה נלמד על משתנים - איך להגדיר אותם ולהשתמש בהם בקוד"
        schemaDescription="List of materials. Map keys: title (כותרת*), description (תיאור), course_name (שם הקורס), type (סוג), week_number (מספר שבוע), topic (נושא), file_url (קישור), media_prompt (פרומפט לתמונה), audio_script (טקסט לקריינות)."
        entityDisplayMap={{ Material: 'חומרי לימוד' }}
      />

      {/* Add/Edit Material Dialog - SAME AS BEFORE */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col bg-white border-2 border-sky-200 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-800">
              {editingId ? 'עריכת חומר לימוד' : 'חומר לימוד חדש'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-3 mb-4 shrink-0">
                <TabsTrigger value="general">פרטים כלליים</TabsTrigger>
                <TabsTrigger value="content">תוכן וקבצים</TabsTrigger>
                <TabsTrigger value="media">מדיה ו-AI</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
                {/* TAB CONTENT - אותו תוכן כמו בקובץ המקורי */}
                <TabsContent value="general" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">כותרת *</Label>
                    <Input
                      value={newMaterial.title}
                      onChange={(e) => setNewMaterial((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="שם החומר"
                      className="border-2 border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">תיאור</Label>
                    <Textarea
                      value={newMaterial.description || ''}
                      onChange={(e) => setNewMaterial((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="הוסף תיאור לחומר"
                      className="min-h-[120px] text-start border-2 border-slate-200 rounded-xl"
                      dir="rtl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">קורסים משוייכים *</Label>
                      <div className="border-2 border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto bg-white space-y-2">
                        {activeCourses.map((course) => {
                          const isSelected =
                            newMaterial.course_ids?.includes(course.id) || newMaterial.course_id === course.id;
                          return (
                            <div key={course.id} className="flex items-center gap-2">
                              <Checkbox
                                id={`course-${course.id}`}
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  let currentIds = newMaterial.course_ids || [];
                                  if (!currentIds.length && newMaterial.course_id) currentIds = [newMaterial.course_id];

                                  let newIds;
                                  if (checked) {
                                    newIds = [...currentIds, course.id];
                                  } else {
                                    newIds = currentIds.filter((id) => id !== course.id);
                                  }

                                  setNewMaterial((prev) => ({
                                    ...prev,
                                    course_ids: newIds,
                                    course_id: newIds.length > 0 ? newIds[0] : ''
                                  }));
                                }}
                                className="border-2 border-slate-400 data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600"
                              />
                              <label htmlFor={`course-${course.id}`} className="text-sm cursor-pointer select-none font-medium">
                                {course.name}
                              </label>
                            </div>
                          );
                        })}
                        {activeCourses.length === 0 && <p className="text-sm text-slate-500">אין קורסים פעילים</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">סוג</Label>
                      <Select
                        value={newMaterial.type}
                        onValueChange={(value) => setNewMaterial((prev) => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="border-2 border-slate-200 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {materialTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {sessions && sessions.length > 0 && (
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">שיוך למפגש (אופציונלי)</Label>
                      <Select
                        value={newMaterial.session_id || 'none'}
                        onValueChange={(value) =>
                          setNewMaterial((prev) => ({ ...prev, session_id: value === 'none' ? null : value }))
                        }
                      >
                        <SelectTrigger className="border-2 border-slate-200 rounded-xl">
                          <SelectValue placeholder="בחר מפגש" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">ללא שיוך</SelectItem>
                          {sessions
                            .sort((a, b) => a.session_number - b.session_number)
                            .map((session) => (
                              <SelectItem key={session.id} value={session.id}>
                                מפגש {session.session_number}: {session.title}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">נושא</Label>
                      <Input
                        value={newMaterial.topic}
                        onChange={(e) => setNewMaterial((prev) => ({ ...prev, topic: e.target.value }))}
                        placeholder="נושא / פרק"
                        className="border-2 border-slate-200 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">שבוע</Label>
                      <Input
                        type="number"
                        value={newMaterial.week_number}
                        onChange={(e) => setNewMaterial((prev) => ({ ...prev, week_number: e.target.value }))}
                        placeholder="1"
                        min="1"
                        className="border-2 border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">העלאת קובץ</Label>
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
                      <Input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="material-upload"
                        disabled={uploading}
                      />
                      <label htmlFor="material-upload" className="cursor-pointer">
                        {uploading ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                            <span>מעלה...</span>
                          </div>
                        ) : newMaterial.file_url ? (
                          <div className="text-emerald-600">✓ קובץ הועלה</div>
                        ) : (
                          <div>
                            <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                            <p className="text-sm text-slate-500">לחץ לבחירת קובץ</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">או קישור</Label>
                    <Input
                      value={newMaterial.file_url}
                      onChange={(e) => setNewMaterial((prev) => ({ ...prev, file_url: e.target.value }))}
                      placeholder="https://..."
                      className="border-2 border-slate-200 rounded-xl"
                    />
                  </div>

                  {['presentation', 'document'].includes(newMaterial.type) && (
                    <PlanGuard
                      plan={user?.organization?.plan || { permissions: { ai_tools: 'none' } }}
                      feature="ai_tools"
                      requiredLevel="basic"
                      fallbackMessage="יצירת תוכן ב-AI זמינה בחבילות מתקדמות"
                    >
                      <div className="space-y-4 bg-gradient-to-br from-violet-50 to-purple-50 p-4 rounded-lg border border-violet-100 mt-4">
                        <div className="flex justify-between items-center">
                          <Label className="flex items-center gap-2 text-violet-900 font-bold">
                            <Wand2 className="w-4 h-4 text-violet-600" />
                            מחולל תוכן (AI Content Generator)
                          </Label>
                          <Button
                            type="button"
                            size="sm"
                            onClick={generateAIContent}
                            disabled={isGeneratingContent || !newMaterial.title}
                            className="bg-violet-600 hover:bg-violet-700 text-white h-8 text-xs"
                          >
                            {isGeneratingContent ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Wand2 className="w-3 h-3 mr-1" />}
                            צור תוכן אוטומטי
                          </Button>
                        </div>

                        {newMaterial.generated_content && (
                          <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
                            {newMaterial.type === 'document' ? (
                              <ReactQuill
                                theme="snow"
                                value={newMaterial.generated_content.html_content || ''}
                                onChange={(content) =>
                                  setNewMaterial((prev) => ({
                                    ...prev,
                                    generated_content: { ...prev.generated_content, html_content: content }
                                  }))
                                }
                                modules={{
                                  toolbar: [
                                    [{ header: [1, 2, false] }],
                                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                    [{ list: 'ordered' }, { list: 'bullet' }],
                                    ['link'],
                                    ['clean']
                                  ]
                                }}
                              />
                            ) : (
                              <div className="p-3 max-h-60 overflow-y-auto">
                                <div className="space-y-3">
                                  {newMaterial.generated_content.slides?.map((slide, idx) => (
                                    <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-100">
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-slate-500">שקף {idx + 1}</span>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 text-red-400 hover:text-red-600"
                                          onClick={() => {
                                            const newSlides = [...newMaterial.generated_content.slides];
                                            newSlides.splice(idx, 1);
                                            setNewMaterial((prev) => ({
                                              ...prev,
                                              generated_content: { ...prev.generated_content, slides: newSlides }
                                            }));
                                          }}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                      <Input
                                        value={slide.title}
                                        onChange={(e) => {
                                          const newSlides = [...newMaterial.generated_content.slides];
                                          newSlides[idx].title = e.target.value;
                                          setNewMaterial((prev) => ({
                                            ...prev,
                                            generated_content: { ...prev.generated_content, slides: newSlides }
                                          }));
                                        }}
                                        className="mb-2 font-bold h-8"
                                        placeholder="כותרת שקף"
                                      />
                                      <Textarea
                                        value={slide.bullets?.join('\n')}
                                        onChange={(e) => {
                                          const newSlides = [...newMaterial.generated_content.slides];
                                          newSlides[idx].bullets = e.target.value.split('\n').filter((b) => b.trim());
                                          setNewMaterial((prev) => ({
                                            ...prev,
                                            generated_content: { ...prev.generated_content, slides: newSlides }
                                          }));
                                        }}
                                        className="text-xs min-h-[60px] mb-2"
                                        placeholder="נקודות תוכן (כל שורה נקודה)"
                                      />
                                      <Textarea
                                        value={slide.speaker_notes || ''}
                                        onChange={(e) => {
                                          const newSlides = [...newMaterial.generated_content.slides];
                                          newSlides[idx].speaker_notes = e.target.value;
                                          setNewMaterial((prev) => ({
                                            ...prev,
                                            generated_content: { ...prev.generated_content, slides: newSlides }
                                          }));
                                        }}
                                        className="text-xs min-h-[40px] bg-amber-50/50 border-amber-200"
                                        placeholder="הערות מרצה (לא יוצגו לתלמיד)"
                                      />
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-xs"
                                    onClick={() => {
                                      const newSlides = [
                                        ...(newMaterial.generated_content?.slides || []),
                                        { title: 'שקף חדש', bullets: [], speaker_notes: '' }
                                      ];
                                      setNewMaterial((prev) => ({
                                        ...prev,
                                        generated_content: { ...(prev.generated_content || {}), slides: newSlides }
                                      }));
                                    }}
                                  >
                                    <Plus className="w-3 h-3 mr-1" /> הוסף שקף
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </PlanGuard>
                  )}
                </TabsContent>

                <TabsContent value="media" className="space-y-4 mt-0">
                  {['presentation', 'document', 'lexicon'].includes(newMaterial.type) && (
                    <PlanGuard
                      plan={user?.organization?.plan}
                      feature="ai_tools"
                      requiredLevel="basic"
                      showFallback={true}
                      fallbackMessage="קריינות AI זמינה בחבילות מתקדמות"
                    >
                      <div className="space-y-2 bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                        <div className="flex justify-between items-center mb-2">
                          <Label className="flex items-center gap-2 text-indigo-900">
                            <Mic className="w-4 h-4 text-indigo-600" />
                            טקסט לקריינות (Voice4u AI)
                          </Label>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={generateScript}
                              disabled={isGeneratingScript || !newMaterial.title}
                              className="h-7 text-xs bg-white"
                            >
                              {isGeneratingScript ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Wand2 className="w-3 h-3 mr-1" />}
                              הצע תמליל
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={generateAudio}
                              disabled={isGeneratingAudio || !newMaterial.audio_script || !editingId || pollingAudio}
                              className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              {isGeneratingAudio || pollingAudio ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Mic className="w-3 h-3 mr-1" />}
                              {pollingAudio ? 'בתהליך...' : 'הפק MP3'}
                            </Button>
                          </div>
                        </div>

                        {pollingAudio ? (
                          <div className="bg-indigo-100/50 p-3 rounded-lg flex items-center justify-center gap-2 animate-pulse border border-indigo-200">
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-700" />
                            <span className="text-indigo-700 font-medium text-sm">מפיק אודיו...</span>
                          </div>
                        ) : (
                          <Textarea
                            value={newMaterial.audio_script}
                            onChange={(e) => setNewMaterial((prev) => ({ ...prev, audio_script: e.target.value }))}
                            placeholder="כתוב כאן את הטקסט שהקריין יקריא..."
                            className="min-h-[80px] bg-white text-sm"
                          />
                        )}

                        <p className="text-[10px] text-slate-500">
                          * הזן תמליל או לחץ "הצע תמליל" ליצירה אוטומטית. לאחר מכן "הפק MP3" ליצירת קובץ שמע.
                        </p>
                      </div>
                    </PlanGuard>
                  )}

                  <PlanGuard
                    plan={user?.organization?.plan}
                    feature="ai_tools"
                    requiredLevel="basic"
                    showFallback={true}
                    fallbackMessage="הפקת תמונות ב-AI זמינה בחבילות מתקדמות"
                  >
                    <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
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
                            {isGeneratingPrompt ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Wand2 className="w-3 h-3 mr-1" />}
                            הצע פרומפט
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={generateMedia}
                            disabled={isGeneratingMedia || !newMaterial.media_prompt || !!newMaterial.media_url}
                            className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            {isGeneratingMedia ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Palette className="w-3 h-3 mr-1" />}
                            {newMaterial.media_url ? 'קיימת תמונה' : 'הפק מדיה'}
                          </Button>
                        </div>
                      </div>
                      <Input
                        value={newMaterial.media_prompt}
                        onChange={(e) => setNewMaterial((prev) => ({ ...prev, media_prompt: e.target.value }))}
                        placeholder="תאר את התמונה הרצויה (באנגלית)..."
                        dir="ltr"
                        className="bg-white mb-3 text-sm border-2 border-slate-200 rounded-xl"
                      />

                      {newMaterial.media_url && (
                        <div className="relative mt-2 bg-white p-2 rounded border border-indigo-100 flex justify-center group">
                          <img src={newMaterial.media_url} alt="Generated Media" className="max-h-48 rounded shadow-sm object-contain" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 text-red-500 bg-white/80 hover:bg-white hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setNewMaterial((prev) => ({ ...prev, media_url: '' }))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </PlanGuard>
                </TabsContent>
              </div>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 mt-auto border-t-2 border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                className="border-2 border-slate-300 hover:bg-slate-50 font-bold"
              >
                ביטול
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold shadow-lg"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {editingId ? 'עדכון' : 'הוספה'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}