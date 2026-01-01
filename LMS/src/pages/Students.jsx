import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Upload,
  Download,
  Users,
  Trash2,
  Mail,
  MessageSquare,
  UserCheck,
  UserX,
  GraduationCap,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { createPageUrl } from '@/utils';
import StudentTable from '@/components/students/StudentTable';
import StudentForm from '@/components/students/StudentForm';
import ImportDialog from '@/components/common/ImportDialog';
import SimpleMessageDialog from '@/components/common/SimpleMessageDialog';
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
import { Badge } from '@/components/ui/badge';

export default function Students() {
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageType, setMessageType] = useState('email');
  const [messageRecipients, setMessageRecipients] = useState([]);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students', user?.organization_id],
    queryFn: () => base44.entities.Student.filter({ organization_id: user?.organization_id }, undefined, 1000),
    enabled: !!user?.organization_id,
    refetchInterval: 30000
  });

  const { data: courses } = useQuery({
    queryKey: ['courses', user?.organization_id],
    queryFn: () => base44.entities.Course.filter({ organization_id: user?.organization_id }),
    enabled: !!user?.organization_id
  });

  const { data: organization } = useQuery({
    queryKey: ['myOrganization', user?.organization_id],
    queryFn: () => user?.organization_id ? base44.entities.Organization.get(user.organization_id) : null,
    enabled: !!user?.organization_id
  });

  const { data: currentPlan } = useQuery({
    queryKey: ['plan', organization?.plan_id],
    queryFn: () => organization?.plan_id ? base44.entities.SubscriptionPlan.get(organization.plan_id) : null,
    enabled: !!organization?.plan_id
  });

  const canCreateStudent = !currentPlan || !currentPlan.max_students || currentPlan.max_students === 0 || (students?.length || 0) < currentPlan.max_students;

  const { data: attendance } = useQuery({
    queryKey: ['attendance', user?.organization_id],
    queryFn: () => base44.entities.Attendance.filter({ organization_id: user?.organization_id }),
    enabled: !!user?.organization_id
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      let identityId;
      if (data.id_number) {
        const existing = await base44.entities.StudentIdentity.filter({ id_number: data.id_number });
        if (existing && existing.length > 0) {
          identityId = existing[0].id;
        }
      }
      if (!identityId) {
        const newIdentity = await base44.entities.StudentIdentity.create({
          organization_id: user?.organization_id,
          full_name: data.full_name,
          id_number: data.id_number,
          primary_email: data.email,
          primary_phone: data.phone,
        });
        identityId = newIdentity.id;
      }
      return base44.entities.Student.create({
        ...data,
        student_identity_id: identityId,
        organization_id: user?.organization_id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setFormOpen(false);
      toast.success('התלמיד נוסף בהצלחה');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await base44.entities.Student.update(id, data);
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
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setFormOpen(false);
      setEditingStudent(null);
      toast.success('התלמיד עודכן בהצלחה');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Student.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
      toast.success('התלמיד נמחק בהצלחה');
    },
    onError: (error) => {
      if (error?.message?.includes('not found')) {
        queryClient.invalidateQueries({ queryKey: ['students'] });
        setDeleteDialogOpen(false);
        setStudentToDelete(null);
        toast.info('התלמיד כבר הוסר מהמערכת');
      } else {
        toast.error('שגיאה במחיקת התלמיד');
      }
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      const promises = ids.map(id => base44.entities.Student.delete(id));
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setBulkDeleteDialogOpen(false);
      setSelectedStudentIds([]);
      toast.success(`${selectedStudentIds.length} תלמידים נמחקו בהצלחה`);
    },
    onError: () => {
      toast.error('שגיאה במחיקת תלמידים');
    }
  });

  const attendanceStats = useMemo(() => {
    if (!attendance || !students) return {};
    const stats = {};
    students.forEach((student) => {
      const studentAttendance = attendance.filter((a) => a.student_id === student.id);
      stats[student.id] = {
        present: studentAttendance.filter((a) => a.status === 'present' || a.status === 'late').length,
        total: studentAttendance.length
      };
    });
    return stats;
  }, [attendance, students]);

  const handleSubmit = (data) => {
    if (editingStudent) {
      updateMutation.mutate({ id: editingStudent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormOpen(true);
  };

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleView = (student) => {
    window.location.href = createPageUrl('StudentProfile') + `?id=${student.id}`;
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
    const recipients = students.filter(s => selectedStudentIds.includes(s.id));
    if (recipients.length === 0) return;
    setMessageRecipients(recipients);
    setMessageType(type);
    setMessageDialogOpen(true);
  };

  const exportStudents = () => {
    const filteredData = filteredStudents.map((s) => ({
      'שם מלא': s.full_name,
      'תעודת זהות': s.id_number || '',
      'אימייל': s.email || '',
      'טלפון': s.phone || '',
      'מחלקה': s.department || '',
      'קורס': courses?.find((c) => c.id === s.course_id)?.name || '',
      'סטטוס': s.status === 'active' ? 'פעיל' : s.status === 'inactive' ? 'לא פעיל' : 'פרש'
    }));

    const headers = Object.keys(filteredData[0] || {}).join(',');
    const rows = filteredData.map((row) => Object.values(row).join(',')).join('\n');
    const csvContent = '\ufeff' + headers + '\n' + rows;

    const blob = new Blob([csvContent], { type: 'text-csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'students_export.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('הקובץ יוצא בהצלחה');
  };

  const filteredStudents = useMemo(() => {
    return students?.filter((student) => {
      const matchesSearch = student.full_name.toLowerCase().includes(search.toLowerCase()) ||
        student.email && student.email.toLowerCase().includes(search.toLowerCase()) ||
        student.id_number && student.id_number.includes(search);
      const matchesCourse = courseFilter === 'all' ||
        (student.course_ids && student.course_ids.includes(courseFilter)) ||
        student.course_id === courseFilter;
      return matchesSearch && matchesCourse;
    }) || [];
  }, [students, search, courseFilter]);

  const activeCourses = courses?.filter((c) => c.status === 'active') || [];

  // Stats calculations
  const stats = useMemo(() => {
    const activeCount = students?.filter(s => s.status === 'active').length || 0;
    const inactiveCount = students?.filter(s => s.status === 'inactive').length || 0;
    const totalCount = students?.length || 0;
    return { activeCount, inactiveCount, totalCount };
  }, [students]);

  return (
    <div className="space-y-6" dir="rtl">
      <Toaster position="top-center" richColors />

      {/* HEADER משודרג */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white via-violet-50/30 to-indigo-50/30 rounded-3xl shadow-xl border-2 border-violet-100 p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* כותרת + תיאור */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 mb-1">ניהול תלמידים</h1>
              <p className="text-slate-500 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                רשימת התלמידים והרישום לקורסים
              </p>
            </div>
          </div>

          {/* כפתורי פעולה */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => setImportOpen(true)}
              className="gap-2 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-bold shadow-sm hover:shadow-md transition-all"
            >
              <Upload className="h-4 w-4" />
              ייבוא
            </Button>
            <Button 
              variant="outline" 
              onClick={exportStudents} 
              disabled={!filteredStudents.length}
              className="gap-2 border-2 border-green-200 text-green-700 hover:bg-green-50 font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              ייצוא
            </Button>
            <Button
              onClick={() => {
                if (canCreateStudent) {
                  setEditingStudent(null);
                  setFormOpen(true);
                } else {
                  toast.error(`הגעת למכסת התלמידים בחבילה שלך (${currentPlan?.max_students || 0}). נא לשדרג חבילה.`);
                }
              }}
              disabled={!canCreateStudent}
              className={`gap-2 font-bold shadow-lg hover:shadow-xl transition-all ${
                canCreateStudent
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Plus className="h-4 w-4" />
              תלמיד חדש
              {!canCreateStudent && (
                <Badge variant="destructive" className="ms-2 text-xs">
                  מלא
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* STATS BAR משודרג */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-violet-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 border-2 border-emerald-200 shadow-md hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 rounded-xl group-hover:scale-110 transition-transform">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-0.5">פעילים</div>
                <div className="text-2xl font-black text-slate-800">{stats.activeCount}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-md hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl group-hover:scale-110 transition-transform">
                <UserX className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-0.5">לא פעילים</div>
                <div className="text-2xl font-black text-slate-800">{stats.inactiveCount}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-4 border-2 border-indigo-200 shadow-md hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 rounded-xl group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-0.5">סה"כ</div>
                <div className="text-2xl font-black text-slate-800">{stats.totalCount}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* FLOATING ACTION BAR משודרג + RTL FIX */}
      <AnimatePresence>
        {selectedStudentIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 start-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4"
          >
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 backdrop-blur-xl text-white p-5 rounded-3xl shadow-2xl flex items-center justify-between border-2 border-white/10">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">
                  {selectedStudentIds.length}
                </div>
                <div>
                  <span className="font-black text-lg">תלמידים נבחרו</span>
                  <p className="text-xs text-slate-400 mt-0.5">בחר פעולה מהתפריט</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStudentIds([])}
                  className="text-slate-400 hover:text-white hover:bg-white/10"
                >
                  ביטול
                </Button>
                <div className="h-10 w-px bg-white/20 mx-1" />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkMessage('email')}
                  className="gap-2 bg-blue-600 text-white hover:bg-blue-700 border-0 shadow-lg shadow-blue-900/20"
                >
                  <Mail className="h-4 w-4" />
                  אימייל
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkMessage('sms')}
                  className="gap-2 bg-green-600 text-white hover:bg-green-700 border-0 shadow-lg shadow-green-900/20"
                >
                  <MessageSquare className="h-4 w-4" />
                  SMS
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBulkDeleteDialogOpen(true)}
                  className="gap-2 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                  מחק
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTERS משודרג + RTL FIX */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="חיפוש לפי שם, אימייל או ת.ז..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pe-10 h-11 border-2 border-slate-200 focus:border-violet-400 rounded-xl shadow-sm"
          />
        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-full sm:w-64 h-11 border-2 border-slate-200 rounded-xl shadow-sm">
            <SelectValue placeholder="כל הקורסים" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <span className="font-medium">כל הקורסים</span>
              </div>
            </SelectItem>
            {activeCourses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  <span>{course.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* STUDENTS TABLE */}
      {studentsLoading ? (
        <div className="bg-white rounded-2xl p-6 space-y-4 border-2 border-slate-100 shadow-lg">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-12 w-48 rounded-xl" />
              <Skeleton className="h-12 w-40 rounded-xl" />
              <Skeleton className="h-12 w-56 rounded-xl" />
              <Skeleton className="h-12 w-32 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-gradient-to-br from-white to-slate-50 rounded-3xl border-2 border-dashed border-slate-200 shadow-lg"
        >
          <div className="p-4 bg-slate-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Users className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-black text-slate-700 mb-2">
            {search || courseFilter !== 'all' ? 'לא נמצאו תלמידים' : 'אין תלמידים עדיין'}
          </h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            {search || courseFilter !== 'all' ? 'נסה לשנות את החיפוש או הסינון' : 'הוסף תלמידים באופן ידני או ייבא רשימה מקובץ'}
          </p>
          {!search && courseFilter === 'all' && (
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={() => setImportOpen(true)}
                className="gap-2 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-bold"
              >
                <Upload className="h-4 w-4" />
                ייבוא מקובץ
              </Button>
              <Button 
                onClick={() => setFormOpen(true)}
                className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold shadow-lg"
              >
                <Plus className="h-4 w-4" />
                תלמיד חדש
              </Button>
            </div>
          )}
        </motion.div>
      ) : (
        <StudentTable
          students={filteredStudents}
          courses={courses}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onSendSMS={handleSendSMS}
          onSendEmail={handleSendEmail}
          attendanceStats={attendanceStats}
          selectedIds={selectedStudentIds}
          onSelectionChange={setSelectedStudentIds}
        />
      )}

      {/* DIALOGS */}
      <StudentForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={handleSubmit}
        student={editingStudent}
        courses={courses}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <SimpleMessageDialog
        open={messageDialogOpen}
        onClose={() => setMessageDialogOpen(false)}
        recipients={messageRecipients}
        initialType={messageType}
        courseId={courseFilter !== 'all' ? courseFilter : null}
      />

      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        entityName="Student"
        courses={courses}
        organizationId={user?.organization_id}
        onImportComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['students'] });
        }}
        templateData="שם מלא*,תעודת זהות,אימייל,טלפון,מחלקה,שם הקורס,הערות
ישראל ישראלי,123456789,israel@example.com,050-1234567,מדעי המחשב,,"
        schemaDescription="List of students. Map keys: full_name (שם מלא*), id_number (ת.ז), email, phone, department, course_name (שם הקורס), notes."
        entityDisplayMap={{ 'Student': 'תלמידים' }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-2 border-red-200 rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-red-900 flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              האם למחוק את התלמיד?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 leading-relaxed">
              פעולה זו תמחק את "<span className="font-bold text-red-600">{studentToDelete?.full_name}</span>" לצמיתות.
              <br />
              כל הנוכחות והציונים של התלמיד יימחקו גם הם.
              <br />
              <strong className="text-red-600">הפעולה אינה ניתנת לביטול.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-slate-700 hover:bg-slate-800 text-white font-bold">
              ביטול
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(studentToDelete?.id)}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold shadow-lg"
            >
              מחיקה סופית
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-2 border-red-200 rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-red-900">
              האם למחוק את התלמידים הנבחרים?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 leading-relaxed">
              פעולה זו תמחק <span className="font-bold text-red-600">{selectedStudentIds.length} תלמידים</span> לצמיתות.
              <br />
              כל הנוכחות והציונים של התלמידים יימחקו גם הם.
              <br />
              <strong className="text-red-600">הפעולה אינה ניתנת לביטול.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-slate-700 hover:bg-slate-800 text-white font-bold">
              ביטול
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkDeleteMutation.mutate(selectedStudentIds)}
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