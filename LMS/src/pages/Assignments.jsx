import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  FileText,
  Upload,
  Trash2,
  LayoutGrid,
  Kanban,
  List,
  User,
  Sparkles,
  Settings2,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Target,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { isPast, differenceInDays } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import AssignmentImportDialog from '@/components/assignments/AssignmentImportDialog';
import SimpleMessageDialog from '@/components/common/SimpleMessageDialog';
import AssignmentCard from '@/components/assignments/AssignmentCard';
import AssignmentListItem from '@/components/assignments/AssignmentListItem';
import AudioScriptManager from '@/components/assignments/AudioScriptManager';
import { createPageUrl } from '@/utils';
import AssignmentForm from '@/components/assignments/AssignmentForm';
import TemplateManager from '@/components/assignments/TemplateManager';
import SubmissionsDialog from '@/components/assignments/SubmissionsDialog';
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
import { Skeleton } from '@/components/ui/skeleton';

export default function Assignments() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');
  const [typeFilter, setTypeFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [creatorFilter, setCreatorFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('due_date_asc');
  const [viewMode, setViewMode] = useState('grid');

  const [shareAssignment, setShareAssignment] = useState(null);
  const [selectedAssignmentIds, setSelectedAssignmentIds] = useState([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState(null);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: currentStudent } = useQuery({
    queryKey: ['currentStudent', user?.email],
    queryFn: async () => {
      const res = await base44.entities.Student.filter({ email: user?.email });
      return res[0];
    },
    enabled: !!user?.email && user?.role !== 'admin'
  });

  const { data: courses } = useQuery({
    queryKey: ['courses', user?.organization_id, user?.role, currentStudent],
    queryFn: async () => {
      const all = await base44.entities.Course.filter({ organization_id: user?.organization_id });
      if (user?.role === 'admin') return all;
      if (currentStudent?.course_ids) {
        return all.filter(c => currentStudent.course_ids.includes(c.id));
      }
      return [];
    },
    enabled: !!user?.organization_id && (user?.role === 'admin' || !!currentStudent)
  });

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['assignments', user?.organization_id, courses],
    queryFn: async () => {
      if (!user?.organization_id) return [];
      const all = await base44.entities.Assignment.filter({ organization_id: user.organization_id });
      if (user?.role === 'admin') return all;
      const visibleCourseIds = courses?.map(c => c.id) || [];
      return all.filter(a => visibleCourseIds.includes(a.course_id));
    },
    enabled: !!user?.organization_id && !!courses
  });

  const { data: grades } = useQuery({
    queryKey: ['grades', user?.organization_id],
    queryFn: () => base44.entities.Grade.filter({ organization_id: user?.organization_id }),
    enabled: !!user?.organization_id
  });

  const { data: students } = useQuery({
    queryKey: ['students', user?.organization_id],
    queryFn: () => base44.entities.Student.filter({ organization_id: user?.organization_id }),
    enabled: !!user?.organization_id
  });

  const createMutation = useMutation({
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
          await Promise.all(data.related_material_ids.map(mid =>
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
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setFormOpen(false);
      toast.success('המטלה נוצרה ונוספה ללוח השנה');
    }
  });

  const updateMutation = useMutation({
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
          await Promise.all(oldCriteria.map(c => base44.entities.RubricCriterion.delete(c.id)));
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
        await Promise.all(existing.map(am => base44.entities.AssignmentMaterial.delete(am.id)));
        
        if (data.related_material_ids && data.related_material_ids.length > 0) {
          await Promise.all(data.related_material_ids.map(mid =>
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
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      setFormOpen(false);
      setEditingAssignment(null);
      toast.success('המטלה עודכנה בהצלחה');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (assignment) => {
      if (assignment.audio_url || assignment.audio_script) {
        try {
          await base44.functions.invoke('audioSync', {
            action: 'delete_file',
            entityType: 'assignment',
            entityId: assignment.id,
            courseId: assignment.course_id
          });
        } catch (e) {
          console.error("Failed to delete audio file", e);
        }
      }
      return base44.entities.Assignment.delete(assignment.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      setDeleteDialogOpen(false);
      setAssignmentToDelete(null);
      toast.success('המטלה נמחקה בהצלחה');
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      const promises = ids.map(id => base44.entities.Assignment.delete(id));
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      setBulkDeleteDialogOpen(false);
      setSelectedAssignmentIds([]);
      toast.success(`${selectedAssignmentIds.length} מטלות נמחקו בהצלחה`);
    },
    onError: () => {
      toast.error('שגיאה במחיקת מטלות');
    }
  });

  const handleSubmit = (data) => {
    if (editingAssignment) {
      updateMutation.mutate({ id: editingAssignment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormOpen(true);
  };

  const handleDelete = (assignment) => {
    const relatedGrades = grades?.filter(g => g.assignment_id === assignment.id) || [];
    if (relatedGrades.length > 0) {
      toast.error(`לא ניתן למחוק מטלה עם ${relatedGrades.length} ציונים מוזנים. יש למחוק את הציונים תחילה.`);
      return;
    }
    setAssignmentToDelete(assignment);
    setDeleteDialogOpen(true);
  };

  const handleToggleStatus = (assignment) => {
    const newStatus = assignment.status === 'open' ? 'closed' : 'open';
    updateMutation.mutate({
      id: assignment.id,
      data: { ...assignment, status: newStatus }
    });
    toast.success(newStatus === 'open' ? 'המטלה נפתחה' : 'המטלה נסגרה');
  };

  const getCourseName = (courseId) => {
    return courses?.find((c) => c.id === courseId)?.name || '';
  };

  const getSubmissionStats = (assignmentId, courseId) => {
    const courseStudents = students?.filter((s) => s.course_id === courseId) || [];
    const submittedGrades = grades?.filter((g) => g && g.assignment_id === assignmentId && g.submission_status === 'submitted') || [];
    const pendingGrading = submittedGrades.filter(g => g && (g.score === undefined || g.score === null)).length;
    return {
      total: courseStudents.length,
      submitted: submittedGrades.length,
      pendingGrading
    };
  };

  const creators = useMemo(() => {
    if (!assignments) return [];
    const uniqueCreators = [...new Set(assignments.map(a => a.created_by))];
    return uniqueCreators.filter(Boolean);
  }, [assignments]);

  const filteredAssignments = useMemo(() => {
    return assignments?.filter((assignment) => {
      const matchesSearch = assignment.title.toLowerCase().includes(search.toLowerCase());
      
      let matchesStatus = true;
      if (viewMode !== 'kanban' && statusFilter !== 'all') {
        if (statusFilter === 'expired') {
          matchesStatus = assignment.due_date && isPast(new Date(assignment.due_date)) && assignment.status !== 'closed';
        } else if (statusFilter === 'pending_review') {
          const assignmentGrades = grades?.filter(g => g && g.assignment_id === assignment.id && g.submission_status === 'submitted');
          const hasPending = assignmentGrades?.some(g => g && (g.score === undefined || g.score === null));
          matchesStatus = hasPending;
        } else {
          matchesStatus = assignment.status === statusFilter;
        }
      }

      const matchesType = typeFilter === 'all' || assignment.type === typeFilter;
      const matchesCourse = courseFilter === 'all' || assignment.course_id === courseFilter;
      const matchesCreator = creatorFilter === 'all' || assignment.created_by === creatorFilter;
      return matchesSearch && matchesStatus && matchesType && matchesCourse && matchesCreator;
    }).sort((a, b) => {
      if (sortOrder === 'updated_date_desc') {
        return new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date);
      }
      if (sortOrder === 'created_date_desc') {
        return new Date(b.created_date) - new Date(a.created_date);
      }
      if (sortOrder === 'due_date_desc') {
        return new Date(b.due_date || '9999-12-31') - new Date(a.due_date || '9999-12-31');
      }
      return new Date(a.due_date || '9999-12-31') - new Date(b.due_date || '9999-12-31');
    }) || [];
  }, [assignments, search, statusFilter, typeFilter, courseFilter, creatorFilter, viewMode, sortOrder, grades]);

  const kanbanColumns = useMemo(() => {
    if (viewMode !== 'kanban') return [];
    
    const cols = {
      overdue: { title: 'באיחור', items: [], color: 'bg-gradient-to-br from-red-50 to-pink-50 text-red-700 border-red-200' },
      due_soon: { title: 'קרוב להגשה', items: [], color: 'bg-gradient-to-br from-orange-50 to-amber-50 text-orange-700 border-orange-200' },
      upcoming: { title: 'פתוח', items: [], color: 'bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-700 border-indigo-200' },
      closed: { title: 'סגור', items: [], color: 'bg-gradient-to-br from-slate-50 to-gray-50 text-slate-700 border-slate-200' }
    };

    filteredAssignments.forEach(assignment => {
      const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
      const isValidDate = dueDate && !isNaN(dueDate.getTime());
      
      if (assignment.status === 'closed') {
        cols.closed.items.push(assignment);
      } else if (isValidDate && isPast(dueDate)) {
        cols.overdue.items.push(assignment);
      } else if (isValidDate && differenceInDays(dueDate, new Date()) <= 3) {
        cols.due_soon.items.push(assignment);
      } else {
        cols.upcoming.items.push(assignment);
      }
    });

    return cols;
  }, [filteredAssignments, viewMode]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = assignments?.length || 0;
    const open = assignments?.filter(a => a.status === 'open').length || 0;
    const overdue = assignments?.filter(a => a.due_date && isPast(new Date(a.due_date)) && a.status !== 'closed').length || 0;
    const pending = assignments?.filter(a => {
      const assignmentGrades = grades?.filter(g => g && g.assignment_id === a.id && g.submission_status === 'submitted');
      return assignmentGrades?.some(g => g && (g.score === undefined || g.score === null));
    }).length || 0;
    
    return { total, open, overdue, pending };
  }, [assignments, grades]);

  const activeCourses = courses?.filter((c) => c.status === 'active') || [];

  return (
    <div className="space-y-6" dir="rtl">
      <Toaster position="top-center" richColors />

      {/* HEADER משודרג */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 rounded-3xl shadow-xl border-2 border-indigo-100 p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* כותרת */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 mb-1">ניהול מטלות</h1>
              <p className="text-slate-500 flex items-center gap-2">
                <Target className="w-4 h-4" />
                מטלות, בחנים ופרויקטים
              </p>
            </div>
          </div>

          {/* כפתורי פעולה */}
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-2 border-slate-200 hover:bg-slate-50 font-bold">
                  <Settings2 className="w-4 h-4" />
                  <span className="hidden sm:inline">כלים</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 bg-white border-2 border-slate-200 shadow-xl rounded-xl">
                <DropdownMenuLabel className="font-black text-slate-700">ניהול וכלים</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <div onSelect={(e) => e.preventDefault()}>
                  <AssignmentImportDialog
                    courseId={courseFilter === 'all' ? null : courseFilter}
                    courses={courses}
                    organizationId={user?.organization_id}
                    onImportSuccess={() => queryClient.invalidateQueries(['assignments'])}
                    trigger={
                      <div className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors hover:bg-indigo-50 hover:text-indigo-700 w-full font-medium">
                        <Upload className="w-4 h-4 me-2 text-indigo-600" />
                        ייבוא מטלות
                      </div>
                    }
                  />
                </div>

                <DropdownMenuItem
                  onClick={async () => {
                    toast.info('מתחיל העשרת מטלות באמצעות AI...', { description: 'תהליך זה עשוי לקחת מספר דקות' });
                    try {
                      const res = await base44.functions.invoke('enrichAllAssignments', {});
                      const data = res.data;
                      if (data.success) {
                        toast.success(`התהליך הושלם! ${data.updates_performed} מטלות עודכנו`);
                        queryClient.invalidateQueries({ queryKey: ['assignments'] });
                      }
                    } catch (e) {
                      toast.error('שגיאה בתקשורת עם השרת');
                    }
                  }}
                  className="font-medium"
                >
                  <Sparkles className="w-4 h-4 me-2 text-purple-600" />
                  העשרה אוטומטית (AI)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AudioScriptManager
              assignments={filteredAssignments}
              selectedIds={selectedAssignmentIds}
              onUpdate={() => queryClient.invalidateQueries(['assignments'])}
            />

            <Button
              onClick={() => {
                setEditingAssignment(null);
                setFormOpen(true);
              }}
              className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">מטלה חדשה</span>
              <span className="sm:hidden">חדש</span>
            </Button>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 border-2 border-indigo-200 shadow-md hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 rounded-xl group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-0.5">סה"כ מטלות</div>
                <div className="text-2xl font-black text-slate-800">{stats.total}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 border-2 border-emerald-200 shadow-md hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 rounded-xl group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-0.5">פתוחות</div>
                <div className="text-2xl font-black text-slate-800">{stats.open}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-4 border-2 border-red-200 shadow-md hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-100 rounded-xl group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-xs text-red-600 font-bold uppercase tracking-wider mb-0.5">באיחור</div>
                <div className="text-2xl font-black text-slate-800">{stats.overdue}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-md hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-0.5">לבדיקה</div>
                <div className="text-2xl font-black text-slate-800">{stats.pending}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* SELECT ALL + BULK ACTIONS */}
      <AnimatePresence>
        {filteredAssignments.length > 0 && viewMode === 'grid' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-slate-200 shadow-sm"
          >
            <Checkbox
              checked={selectedAssignmentIds.length === filteredAssignments.length && filteredAssignments.length > 0}
              onCheckedChange={(checked) => {
                if (checked) setSelectedAssignmentIds(filteredAssignments.map(a => a.id));
                else setSelectedAssignmentIds([]);
              }}
              id="select-all-assignments"
              className="border-2 border-indigo-400 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
            />
            <label htmlFor="select-all-assignments" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
              בחר הכל ({filteredAssignments.length})
            </label>
          </motion.div>
        )}

        {selectedAssignmentIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-2xl flex items-center justify-between border-2 border-indigo-200 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-md">
                {selectedAssignmentIds.length}
              </div>
              <span className="text-sm font-black text-slate-800">מטלות נבחרו</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  toast.info(`מעשיר ${selectedAssignmentIds.length} מטלות נבחרות...`);
                  try {
                    const res = await base44.functions.invoke('enrichAllAssignments', { assignmentIds: selectedAssignmentIds });
                    const data = res.data;
                    if (data.success) {
                      toast.success(`התהליך הושלם! ${data.updates_performed} מטלות עודכנו`);
                      queryClient.invalidateQueries({ queryKey: ['assignments'] });
                      setSelectedAssignmentIds([]);
                    } else {
                      toast.error('שגיאה בהפעלת התהליך');
                    }
                  } catch (e) {
                    console.error(e);
                    toast.error('שגיאה בתקשורת עם השרת');
                  }
                }}
                className="gap-2 border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-bold"
              >
                <Sparkles className="h-4 w-4" />
                העשרה ב-AI
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteDialogOpen(true)}
                className="gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 font-bold shadow-md"
              >
                <Trash2 className="h-4 w-4" />
                מחיקת נבחרים
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTERS משודרג */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="חיפוש מטלה..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-10 h-11 border-2 border-slate-200 focus:border-indigo-400 rounded-xl shadow-sm"
          />
        </div>

        {viewMode !== 'kanban' && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44 h-11 border-2 border-slate-200 rounded-xl shadow-sm">
              <Filter className="w-4 h-4 me-2 text-slate-400" />
              <SelectValue placeholder="סטטוס" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הצג הכל</SelectItem>
              <SelectItem value="open">פתוחות</SelectItem>
              <SelectItem value="expired">פג תוקף</SelectItem>
              <SelectItem value="pending_review">ממתין לבדיקה</SelectItem>
              <SelectItem value="closed">סגורות</SelectItem>
              <SelectItem value="templates">ניהול תבניות</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-full sm:w-48 h-11 border-2 border-slate-200 rounded-xl shadow-sm">
            <SelectValue placeholder="כל הקורסים" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הקורסים</SelectItem>
            {activeCourses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48 h-11 border-2 border-slate-200 rounded-xl shadow-sm">
            <SelectValue placeholder="סוג מטלה" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסוגים</SelectItem>
            <SelectItem value="assignment">מטלה</SelectItem>
            <SelectItem value="quiz">בוחן</SelectItem>
            <SelectItem value="exam">מבחן</SelectItem>
            <SelectItem value="project">פרויקט</SelectItem>
          </SelectContent>
        </Select>

        {creators.length > 1 && (
          <Select value={creatorFilter} onValueChange={setCreatorFilter}>
            <SelectTrigger className="w-full sm:w-48 h-11 border-2 border-slate-200 rounded-xl shadow-sm">
              <User className="w-4 h-4 me-2 text-slate-400" />
              <SelectValue placeholder="כל המורים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל המורים</SelectItem>
              {creators.map((email) => (
                <SelectItem key={email} value={email}>
                  {email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-full sm:w-48 h-11 border-2 border-slate-200 rounded-xl shadow-sm">
            <SelectValue placeholder="מיון" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="due_date_asc">תאריך הגשה (קרוב לרחוק)</SelectItem>
            <SelectItem value="due_date_desc">תאריך הגשה (רחוק לקרוב)</SelectItem>
            <SelectItem value="updated_date_desc">עודכן לאחרונה</SelectItem>
            <SelectItem value="created_date_desc">נוצר לאחרונה</SelectItem>
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
            onClick={() => setViewMode('kanban')}
            className={`px-3 transition-all ${viewMode === 'kanban' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'}`}
          >
            <Kanban className="w-4 h-4" />
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

      {/* CONTENT */}
      {statusFilter === 'templates' ? (
        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-slate-200">
          <TemplateManager organizationId={user?.organization_id} />
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border-2 border-slate-100">
              <Skeleton className="h-6 w-24 mb-3 rounded-lg" />
              <Skeleton className="h-6 w-3/4 mb-2 rounded-lg" />
              <Skeleton className="h-4 w-1/2 mb-4 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-gradient-to-br from-white to-slate-50 rounded-3xl border-2 border-dashed border-slate-200 shadow-lg"
        >
          <div className="p-4 bg-slate-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <FileText className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-black text-slate-700 mb-2">
            {search || statusFilter !== 'all' || courseFilter !== 'all' ? 'לא נמצאו מטלות' : 'אין מטלות עדיין'}
          </h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            {search || statusFilter !== 'all' || courseFilter !== 'all' ? 'נסה לשנות את החיפוש או הסינון' : 'צור את המטלה הראשונה שלך'}
          </p>
          {!search && statusFilter === 'all' && courseFilter === 'all' && (
            <Button
              onClick={() => setFormOpen(true)}
              className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg"
            >
              <Plus className="h-4 w-4" />
              מטלה חדשה
            </Button>
          )}
        </motion.div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssignments.map((assignment, index) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <div className="absolute top-4 end-4 z-10 bg-white rounded-full shadow-md">
                <Checkbox
                  checked={selectedAssignmentIds.includes(assignment.id)}
                  onCheckedChange={(checked) => {
                    if (checked) setSelectedAssignmentIds(prev => [...prev, assignment.id]);
                    else setSelectedAssignmentIds(prev => prev.filter(id => id !== assignment.id));
                  }}
                  className="border-2 border-indigo-400 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
              </div>
              <AssignmentCard
                assignment={assignment}
                courseName={getCourseName(assignment.course_id)}
                submissionStats={getSubmissionStats(assignment.id, assignment.course_id)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onShare={setShareAssignment}
                onViewSubmissions={setSelectedAssignmentForSubmissions}
              />
            </motion.div>
          ))}
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead className="bg-gradient-to-l from-indigo-100 via-purple-50 to-violet-50 text-slate-700 border-b-2 border-indigo-200">
                <tr>
                  <th className="p-4 w-[50px]">
                    <Checkbox
                      checked={selectedAssignmentIds.length === filteredAssignments.length && filteredAssignments.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) setSelectedAssignmentIds(filteredAssignments.map(a => a.id));
                        else setSelectedAssignmentIds([]);
                      }}
                      className="border-2 border-indigo-400 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                    />
                  </th>
                  <th className="p-4 font-black">שם המטלה</th>
                  <th className="p-4 font-black">קורס</th>
                  <th className="p-4 font-black">סוג</th>
                  <th className="p-4 font-black">תאריך הגשה</th>
                  <th className="p-4 font-black">הגשות</th>
                  <th className="p-4 font-black">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssignments.map((assignment, index) => (
                  <motion.tr
                    key={assignment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <AssignmentListItem
                      assignment={assignment}
                      courseName={getCourseName(assignment.course_id)}
                      submissionStats={getSubmissionStats(assignment.id, assignment.course_id)}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                      onShare={setShareAssignment}
                      onViewSubmissions={setSelectedAssignmentForSubmissions}
                      isSelected={selectedAssignmentIds.includes(assignment.id)}
                      onSelect={(checked) => {
                        if (checked) setSelectedAssignmentIds(prev => [...prev, assignment.id]);
                        else setSelectedAssignmentIds(prev => prev.filter(id => id !== assignment.id));
                      }}
                    />
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
          {Object.entries(kanbanColumns).map(([key, column]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Object.keys(kanbanColumns).indexOf(key) * 0.1 }}
              className="flex-1 min-w-[320px] flex flex-col bg-white/50 rounded-2xl p-4 border-2 border-slate-200 shadow-lg"
            >
              <div className={`p-4 rounded-xl border-2 mb-4 flex items-center justify-between shadow-md ${column.color}`}>
                <span className="font-black text-lg">{column.title}</span>
                <Badge className="bg-white/70 text-current px-3 py-1 text-sm font-black shadow-sm">
                  {column.items.length}
                </Badge>
              </div>

              <div className="space-y-3 overflow-y-auto flex-1 px-1">
                {column.items.map((assignment, idx) => (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative group"
                  >
                    <AssignmentCard
                      assignment={assignment}
                      courseName={getCourseName(assignment.course_id)}
                      submissionStats={getSubmissionStats(assignment.id, assignment.course_id)}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                      onShare={setShareAssignment}
                      onViewSubmissions={setSelectedAssignmentForSubmissions}
                    />
                  </motion.div>
                ))}
                {column.items.length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-sm bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    אין מטלות בקטגוריה זו
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* DIALOGS */}
      {selectedAssignmentForSubmissions && (
        <SubmissionsDialog
          open={!!selectedAssignmentForSubmissions}
          onClose={() => setSelectedAssignmentForSubmissions(null)}
          assignment={selectedAssignmentForSubmissions}
          grades={grades}
          students={students}
        />
      )}

      {shareAssignment && (
        <SimpleMessageDialog
          open={!!shareAssignment}
          onClose={() => setShareAssignment(null)}
          recipients={courses?.find(c => c.id === shareAssignment.course_id)
            ? students?.filter(s => s.course_id === shareAssignment.course_id)
            : []
          }
          initialType="whatsapp"
        />
      )}

      <AssignmentForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingAssignment(null);
        }}
        onSubmit={handleSubmit}
        assignment={editingAssignment}
        courses={courses}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-2 border-red-200 rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-red-900">
              האם למחוק את המטלות הנבחרות?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 leading-relaxed">
              פעולה זו תמחק <span className="font-bold text-red-600">{selectedAssignmentIds.length} מטלות</span> לצמיתות.
              <br />
              <strong className="text-red-600">הפעולה אינה ניתנת לביטול.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-slate-700 hover:bg-slate-800 text-white font-bold">
              ביטול
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkDeleteMutation.mutate(selectedAssignmentIds)}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold shadow-lg"
            >
              מחיקה סופית
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-2 border-red-200 rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-red-900">
              האם למחוק את המטלה?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 leading-relaxed">
              פעולה זו תמחק את "<span className="font-bold text-red-600">{assignmentToDelete?.title}</span>" לצמיתות.
              <br />
              <strong className="text-red-600">הפעולה אינה ניתנת לביטול.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-slate-700 hover:bg-slate-800 text-white font-bold">
              ביטול
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(assignmentToDelete)}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold shadow-lg"
            >
              מחיקה סופית
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}