import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, GraduationCap, Upload, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import CourseCard from '@/components/courses/CourseCard';
import CourseForm from '@/components/courses/CourseForm';
import SimpleMessageDialog from '@/components/common/SimpleMessageDialog';
import CourseImportDialog from '@/components/courses/CourseImportDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle } from
'@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function Courses() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);
  const [selectedCourseForSMS, setSelectedCourseForSMS] = useState(null);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch Templates
  const { data: templates } = useQuery({
    queryKey: ['courseTemplates', user?.organization_id],
    queryFn: () => base44.entities.CourseTemplate.filter({ organization_id: user?.organization_id }),
    enabled: !!user?.organization_id
  });

  // Fetch current student record if user is not admin
  const { data: currentStudent } = useQuery({
    queryKey: ['currentStudent', user?.email],
    queryFn: async () => {
      const res = await base44.entities.Student.filter({ email: user?.email });
      return res[0];
    },
    enabled: !!user?.email && user?.role !== 'admin'
  });

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', user?.organization_id, user?.role, currentStudent],
    queryFn: async () => {
      const allCourses = await base44.entities.Course.filter({ organization_id: user?.organization_id });
      
      if (user?.role === 'admin') return allCourses;
      
      if (currentStudent && currentStudent.course_ids) {
        return allCourses.filter(c => currentStudent.course_ids.includes(c.id));
      }
      return [];
    },
    enabled: !!user?.organization_id && (user?.role === 'admin' || !!currentStudent)
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

  const { data: students } = useQuery({
    queryKey: ['students', user?.organization_id],
    queryFn: () => base44.entities.Student.filter({ organization_id: user?.organization_id }, undefined, 1000),
    enabled: !!user?.organization_id
  });

  const canCreateCourse = !currentPlan || !currentPlan.max_courses || currentPlan.max_courses === 0 || (courses?.length || 0) < currentPlan.max_courses;

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Extract template meta-data
      const { _templateId, _syllabus, ...courseData } = data;
      
      // Auto-generate logo if missing
      if (!courseData.logo_url && courseData.name) {
        try {
          const prompt = `Professional minimalist logo design for "${courseData.name}" course. IMPORTANT: Icon/symbol only, absolutely NO TEXT, NO LETTERS, NO WORDS. Clean geometric shapes, vibrant educational colors, centered composition filling most of the canvas, white/transparent background, modern flat design, 4k quality`;
          const res = await base44.integrations.Core.GenerateImage({ prompt });
          if (res?.url) {
            courseData.logo_url = res.url;
          }
        } catch (e) {
          console.log('Logo generation skipped:', e.message);
        }
      }
      
      const course = await base44.entities.Course.create({ ...courseData, organization_id: user?.organization_id });
      
      // 1. Copy Syllabus from Template if exists
      if (_syllabus) {
          try {
              const syllabusItems = JSON.parse(_syllabus);
              if (Array.isArray(syllabusItems)) {
                  await base44.entities.CourseSession.bulkCreate(
                      syllabusItems.map((s, i) => ({
                          organization_id: user?.organization_id,
                          course_id: course.id,
                          session_number: i + 1,
                          title: s.title,
                          description: s.description,
                          objectives: s.objectives,
                          duration_hours: s.duration_hours || courseData.weekly_hours
                      }))
                  );
              }
          } catch (e) {
              console.error("Failed to copy syllabus from template", e);
          }
      }

      // 2. Auto-generate Calendar Events
      try {
        if (data.start_date && data.total_sessions && data.day_of_week) {
          const events = [];
          const daysMap = {
            'ראשון': 0, 'שני': 1, 'שלישי': 2, 'רביעי': 3, 'חמישי': 4, 'שישי': 5, 'שבת': 6
          };
          const targetDay = daysMap[data.day_of_week];
          
          if (targetDay !== undefined) {
            let currentDate = new Date(data.start_date);
            
            // Adjust to the first occurrence of the day of week if needed, though usually start_date should be it.
            // But let's assume start_date is the first lesson date. 
            // If start_date day != targetDay, we might want to warn or adjust, but simple logic: start from start_date.
            
            for (let i = 0; i < data.total_sessions; i++) {
              events.push({
                organization_id: user?.organization_id,
                course_id: course.id,
                title: `${course.name} - שיעור ${i + 1}`,
                description: `שיעור מספר ${i + 1} בקורס ${course.name}`,
                date: currentDate.toISOString().split('T')[0],
                start_time: data.start_time || '09:00',
                end_time: data.end_time || '10:00',
                type: 'lesson',
                location: data.room || 'TBD'
              });
              
              // Add 1 week
              currentDate.setDate(currentDate.getDate() + 7);
            }
            
            if (events.length > 0) {
              await base44.entities.CalendarEvent.bulkCreate(events);
            }
          }
        }
      } catch (error) {
        console.error("Error creating calendar events:", error);
        toast.error("שגיאה ביצירת אירועים בלוח שנה");
      }

      return course;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setFormOpen(false);
      toast.success('הקורס והשיעורים נוצרו בהצלחה');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Course.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setFormOpen(false);
      setEditingCourse(null);
      toast.success('הקורס עודכן בהצלחה');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
        const response = await base44.functions.invoke('deleteCourseCascade', { courseId: id });
        if (response.data.error) throw new Error(response.data.error);
        return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
      toast.success('הקורס נמחק בהצלחה');
    }
  });

  const handleSubmit = (data) => {
    if (editingCourse?.id) {
      updateMutation.mutate({ id: editingCourse.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormOpen(true);
  };

  const handleCreateFromTemplate = (template) => {
      setIsTemplatesOpen(false);
      
      const newCourseData = {
          name: template.name + ' (עותק)',
          code: template.code,
          description: template.description,
          total_sessions: template.default_sessions_count,
          total_hours: template.default_duration_hours,
          // Defaults for required fields
          start_date: new Date().toISOString().split('T')[0],
          status: 'active'
      };
      
      setEditingCourse(newCourseData); // Pre-fill form
      setFormOpen(true);
      
      // Note: Syllabus copy logic should ideally happen after course creation
      // We can handle this by passing a "templateId" to the form or handling it in onSuccess
      // For now, we pre-fill basic data.
      // A better approach: 
      // 1. Create course from form
      // 2. If template was used, trigger a backend function to copy syllabus.
      // Let's attach templateId to the editing object temporarily
      setEditingCourse({ ...newCourseData, _templateId: template.id, _syllabus: template.default_syllabus });
  };

  const handleDelete = (course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const handleArchive = (course) => {
    const newStatus = course.status === 'archived' ? 'active' : 'archived';
    updateMutation.mutate({
      id: course.id,
      data: { ...course, status: newStatus }
    });
    toast.success(newStatus === 'archived' ? 'הקורס הועבר לארכיון' : 'הקורס הופעל');
  };

  const handleTogglePublic = (course) => {
    updateMutation.mutate({
      id: course.id,
      data: { ...course, is_public: !course.is_public }
    });
    toast.success(!course.is_public ? 'הקורס כעת ציבורי' : 'הקורס כעת פרטי');
  };

  const handleSendSMS = (course) => {
    setSelectedCourseForSMS(course);
    setSmsDialogOpen(true);
  };

  const getStudentsCount = (courseId) => {
    return students?.filter((s) => 
      s.course_id === courseId || (s.course_ids && s.course_ids.includes(courseId))
    ).length || 0;
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/JoinCourse?org=${user?.organization_id}`;
    navigator.clipboard.writeText(link);
    toast.success('קישור להרשמה הועתק ללוח');
  };

  const filteredCourses = courses?.filter((course) => {
    const matchesSearch = course.name.toLowerCase().includes(search.toLowerCase()) ||
    course.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">קורסים</h1>
          <p className="text-slate-500 mt-1">ניהול הקורסים שלך</p>
        </div>
        {user?.role === 'admin' && (
          <Button 
            onClick={() => setImportDialogOpen(true)}
            variant="outline"
            className="hidden sm:flex"
          >
            <Upload className="h-4 w-4 ml-2" />
            ייבוא קורסים
          </Button>
        )}
        <Button 
            onClick={copyInviteLink} 
            variant="outline" 
            className="hidden sm:flex text-violet-600 border-violet-200 hover:bg-violet-50"
        >
            <Share2 className="h-4 w-4 ml-2" />
            קישור הרשמה
        </Button>
        <Button 
          onClick={() => setIsTemplatesOpen(true)}
          variant="outline"
          className="hidden sm:flex"
        >
          <Plus className="h-4 w-4 ml-2" />
          מתבנית
        </Button>
        <Button 
          onClick={() => {
            if (canCreateCourse) {
              setEditingCourse(null);
              setFormOpen(true);
            } else {
              toast.error(`הגעת למכסת הקורסים בחבילה שלך (${currentPlan?.max_courses || 0}). נא לשדרג חבילה.`);
            }
          }} 
          className={`px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors shadow h-9 ${
            canCreateCourse 
              ? 'bg-indigo-900 text-primary-foreground hover:bg-primary/90' 
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Plus className="h-4 w-4 ml-2" />
          קורס חדש
        </Button>
        </div>

        {/* Templates Dialog */}
        <AlertDialog open={isTemplatesOpen} onOpenChange={setIsTemplatesOpen}>
        <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>בחר תבנית ליצירת קורס</AlertDialogTitle>
          <AlertDialogDescription>
            בחר תבנית מוכנה מראש כדי לייבא מבנה קורס וסילבוס.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-2 py-4">
            {templates?.map(t => (
                <Button key={t.id} variant="outline" className="justify-start h-auto py-3" onClick={() => handleCreateFromTemplate(t)}>
                    <div className="text-right">
                        <div className="font-semibold">{t.name}</div>
                        <div className="text-xs text-slate-500">{t.description}</div>
                    </div>
                </Button>
            ))}
            {(!templates || templates.length === 0) && (
                <p className="text-center text-slate-500">לא נמצאו תבניות</p>
            )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>ביטול</AlertDialogCancel>
        </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="חיפוש לפי שם או קוד..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10" />

        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">הכל</TabsTrigger>
            <TabsTrigger value="active">פעילים</TabsTrigger>
            <TabsTrigger value="archived">ארכיון</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Courses Grid */}
      {coursesLoading ?
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) =>
        <div key={i} className="bg-white rounded-xl p-6">
              <Skeleton className="h-24 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
        )}
        </div> :
      filteredCourses.length === 0 ?
      <div className="text-center py-16">
          <GraduationCap className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">
            {search || statusFilter !== 'all' ? 'לא נמצאו קורסים' : 'אין קורסים עדיין'}
          </h3>
          <p className="text-slate-400 mb-4">
            {search || statusFilter !== 'all' ? 'נסה לשנות את החיפוש' : 'צור את הקורס הראשון שלך'}
          </p>
          {!search && statusFilter === 'all' &&
        <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              קורס חדש
            </Button>
        }
        </div> :

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) =>
        <CourseCard
          key={course.id}
          course={course}
          studentsCount={getStudentsCount(course.id)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onArchive={handleArchive}
          onTogglePublic={handleTogglePublic}
          onSendSMS={handleSendSMS}
          index={index} />

        )}
        </div>
      }

      {/* Course Form Dialog */}
      <CourseForm
        open={formOpen}
        onClose={() => {setFormOpen(false);setEditingCourse(null);}}
        onSubmit={handleSubmit}
        course={editingCourse}
        isLoading={createMutation.isPending || updateMutation.isPending} />


      {/* SMS Dialog */}
      <SimpleMessageDialog
        open={smsDialogOpen}
        onClose={() => {setSmsDialogOpen(false);setSelectedCourseForSMS(null);}}
        recipients={students?.filter((s) => s.course_id === selectedCourseForSMS?.id || (s.course_ids && s.course_ids.includes(selectedCourseForSMS?.id))) || []}
        initialType="sms"
        courseId={selectedCourseForSMS?.id}
        onSuccess={() => {}}
      />

      {/* Import Dialog */}
      <CourseImportDialog 
          open={importDialogOpen}
          onClose={() => setImportDialogOpen(false)}
          onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['courses'] });
          }}
      />


      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם למחוק את הקורס?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את הקורס "{courseToDelete?.name}" לצמיתות.
              <br/><br/>
              <strong>שימו לב:</strong> הפעולה תמחק גם את כל המפגשים, המטלות, ההודעות והאירועים הקשורים לקורס. תלמידים יוסרו מהרישום לקורס זה.
              <br/>
              הפעולה אינה ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(courseToDelete?.id)}
              className="bg-red-600 hover:bg-red-700">

              מחיקה
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>);

}