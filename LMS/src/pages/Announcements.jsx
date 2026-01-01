import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import {
  Plus,
  Search,
  Bell,
  Pin,
  Trash2,
  Edit,
  Loader2,
  AlertTriangle,
  Calendar as CalendarIcon,
  User,
  Clock,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import AnnouncementImportDialog from '@/components/announcements/AnnouncementImportDialog';

const priorityConfig = {
  low: { label: 'נמוכה', color: 'bg-slate-100 text-slate-700' },
  normal: { label: 'רגילה', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'גבוהה', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'דחופה', color: 'bg-red-100 text-red-700' }
};

export default function Announcements() {
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    course_id: '',
    priority: 'normal',
    is_pinned: false,
    expiration_date: ''
  });
  const [notifyStudents, setNotifyStudents] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements', user?.organization_id],
    queryFn: () => base44.entities.Announcement.filter({ organization_id: user?.organization_id }),
    enabled: !!user?.organization_id
  });

  const { data: courses } = useQuery({
    queryKey: ['courses', user?.organization_id],
    queryFn: () => base44.entities.Course.filter({ organization_id: user?.organization_id }),
    enabled: !!user?.organization_id
  });

  // Fetch all sessions to link in the form
  const { data: sessions } = useQuery({
      queryKey: ['sessions', user?.organization_id],
      queryFn: () => base44.entities.CourseSession.filter({ organization_id: user?.organization_id }),
      enabled: !!user?.organization_id
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Announcement.create({ ...data, organization_id: user?.organization_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setFormOpen(false);
      resetForm();
      toast.success('ההכרזה נוספה בהצלחה');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Announcement.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setFormOpen(false);
      setEditingAnnouncement(null);
      resetForm();
      toast.success('ההכרזה עודכנה בהצלחה');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Announcement.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('ההכרזה נמחקה');
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: () => base44.functions.invoke('bulkDeleteAnnouncements', {}),
    onSuccess: (res) => {
      if (res.data?.error) {
          toast.error('שגיאה במחיקה: ' + res.data.error);
      } else {
          queryClient.invalidateQueries({ queryKey: ['announcements'] });
          toast.success(`נמחקו ${res.data.count} הכרזות בהצלחה`);
      }
    },
    onError: (err) => toast.error('שגיאה במחיקה המונית')
  });

  const handleBulkDelete = () => {
      if (confirm('האם אתה בטוח שברצונך למחוק את כל ההכרזות? פעולה זו אינה הפיכה.')) {
          bulkDeleteMutation.mutate();
      }
  };

  const resetForm = () => {
    setNewAnnouncement({
      title: '',
      content: '',
      course_id: '',
      session_id: '',
      priority: 'normal',
      is_pinned: false,
      expiration_date: ''
    });
    setNotifyStudents(false);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setNewAnnouncement({
      title: announcement.title,
      content: announcement.content,
      course_id: announcement.course_id,
      session_id: announcement.session_id || '',
      priority: announcement.priority,
      is_pinned: announcement.is_pinned,
      expiration_date: announcement.expiration_date || ''
    });
    setNotifyStudents(false);
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content || !newAnnouncement.course_id) {
      toast.error('נא למלא את כל השדות הנדרשים');
      return;
    }

    const dataToSave = {
      ...newAnnouncement,
      author_name: user?.full_name || 'מערכת',
    };

    try {
      if (editingAnnouncement) {
        updateMutation.mutate({ id: editingAnnouncement.id, data: dataToSave });
      } else {
        createMutation.mutate(dataToSave);
      }

      // Handle notifications
      if (notifyStudents && newAnnouncement.course_id) {
        const students = await base44.entities.Student.filter({ course_id: newAnnouncement.course_id });
        if (students && students.length > 0) {
          const studentIds = students.map(s => s.id);
          const courseName = getCourseName(newAnnouncement.course_id);
          
          await base44.functions.invoke('sendCourseMessage', {
            student_ids: studentIds,
            organization_id: user.organization_id,
            subject: `הודעה חדשה בקורס ${courseName}: ${newAnnouncement.title}`,
            content: `
שלום {{student_name}},

פורסמה הודעה חדשה בקורס **${courseName}**:

---
**${newAnnouncement.title}**

${newAnnouncement.content}
---

לצפייה בלוח המודעות המלא, היכנס למערכת.

בברכה,
צוות הקורס
            `,
            origin: window.location.origin
          });
          toast.success(`נשלחו הודעות ל-${students.length} סטודנטים`);
        }
      }
    } catch (error) {
      console.error('Error handling submission:', error);
      toast.error('שגיאה בשמירת ההכרזה או בשליחת ההודעות');
    }
  };

  const getCourseName = (courseId) => {
    return courses?.find((c) => c.id === courseId)?.name || '';
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements?.filter((announcement) => {
      const matchesSearch = announcement.title.toLowerCase().includes(search.toLowerCase()) ||
      announcement.content.toLowerCase().includes(search.toLowerCase());
      const matchesCourse = courseFilter === 'all' || announcement.course_id === courseFilter;
      // Filter expired announcements only if explicitly set
      const isExpired = announcement.expiration_date && new Date(announcement.expiration_date) < new Date();
      // Show expired only if searching, otherwise hide them from main view (optional logic, usually we hide them)
      // Actually, let's just keep them visible but maybe mark them or filter them out if not searching.
      // For now, keeping them all visible for admins/teachers is better, maybe adding a visual indicator.
      
      return matchesSearch && matchesCourse;
    }).sort((a, b) => {
      // Pinned first, then by date
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_date) - new Date(a.created_date);
    }) || [];
  }, [announcements, search, courseFilter]);

  const activeCourses = courses?.filter((c) => c.status === 'active') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">הכרזות</h1>
          <p className="text-slate-500 mt-1">עדכונים והודעות לתלמידים</p>
        </div>
        <div className="flex gap-2">
            {announcements && announcements.length > 0 && (
                <Button 
                    variant="outline" 
                    className="text-red-600 hover:bg-red-50 border-red-200 gap-2 h-9"
                    onClick={handleBulkDelete}
                    disabled={bulkDeleteMutation.isPending}
                >
                    <Trash2 className="w-4 h-4 ml-2" />
                    {bulkDeleteMutation.isPending ? 'מוחק...' : 'מחיקת הכל'}
                </Button>
            )}
            <AnnouncementImportDialog 
                courses={activeCourses} 
                onImportSuccess={() => queryClient.invalidateQueries({ queryKey: ['announcements'] })} 
            />
            <Button onClick={() => {setEditingAnnouncement(null);resetForm();setFormOpen(true);}} className="bg-purple-800 text-primary-foreground px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 h-9">
              <Plus className="h-4 w-4 ml-2" />
              הכרזה חדשה
            </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="חיפוש הכרזה..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10" />

        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="כל הקורסים" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הקורסים</SelectItem>
            {activeCourses.map((course) =>
            <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Announcements List */}
      {isLoading ?
      <div className="space-y-4">
          {[1, 2, 3].map((i) =>
        <Skeleton key={i} className="h-32 w-full" />
        )}
        </div> :
      filteredAnnouncements.length === 0 ?
      <Card className="p-16 text-center">
          <Bell className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">
            {search || courseFilter !== 'all' ? 'לא נמצאו הכרזות' : 'אין הכרזות עדיין'}
          </h3>
          <p className="text-slate-400 mb-4">
            {search || courseFilter !== 'all' ? 'נסה לשנות את החיפוש' : 'צור את ההכרזה הראשונה שלך'}
          </p>
          {!search && courseFilter === 'all' &&
        <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              הכרזה חדשה
            </Button>
        }
        </Card> :

      <div className="space-y-4">
          {filteredAnnouncements.map((announcement) =>
        <Card
          key={announcement.id}
          className={`p-5 ${announcement.is_pinned ? 'border-blue-200 bg-blue-50/30' : ''}`}>

              <div className="flex items-start gap-4">
                {announcement.priority === 'urgent' &&
            <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
            }
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {announcement.is_pinned &&
                  <Pin className="h-4 w-4 text-blue-600" />
                  }
                      <h3 className="text-lg font-semibold text-slate-800">
                        {announcement.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(announcement)}>

                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => deleteMutation.mutate(announcement.id)}>

                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-slate-600 whitespace-pre-wrap mb-3">
                    {announcement.content}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <Badge variant="outline">
                      {getCourseName(announcement.course_id)}
                    </Badge>
                    {announcement.session_id && sessions && (
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100">
                            מפגש {sessions.find(s => s.id === announcement.session_id)?.session_number}
                        </Badge>
                    )}
                    <Badge className={priorityConfig[announcement.priority]?.color}>
                      {priorityConfig[announcement.priority]?.label}
                    </Badge>
                    
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(announcement.created_date), 'dd/MM/yyyy HH:mm', { locale: he })}
                    </span>

                    {announcement.author_name && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {announcement.author_name}
                      </span>
                    )}

                    {announcement.expiration_date && (
                      <span className={`flex items-center gap-1 ${new Date(announcement.expiration_date) < new Date() ? 'text-red-500' : ''}`}>
                         <CalendarIcon className="w-3 h-3" />
                         בתוקף עד: {format(new Date(announcement.expiration_date), 'dd/MM/yyyy')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
        )}
        </div>
      }

      {/* Add/Edit Announcement Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAnnouncement ? 'עריכת הכרזה' : 'הכרזה חדשה'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>כותרת *</Label>
              <Input
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="כותרת ההכרזה" />

            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>קורס *</Label>
                <Select
                  value={newAnnouncement.course_id}
                  onValueChange={(value) => setNewAnnouncement((prev) => ({ ...prev, course_id: value, session_id: '' }))}>

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

              {newAnnouncement.course_id && sessions && (
                  <div className="space-y-2">
                      <Label>מפגש רלוונטי (אופציונלי)</Label>
                      <Select
                          value={newAnnouncement.session_id || "none"}
                          onValueChange={(value) => setNewAnnouncement((prev) => ({ ...prev, session_id: value === "none" ? "" : value }))}
                      >
                          <SelectTrigger>
                              <SelectValue placeholder="בחר מפגש (ללא שיוך)" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="none">-- ללא שיוך למפגש --</SelectItem>
                              {sessions
                                  .filter(s => s.course_id === newAnnouncement.course_id)
                                  .sort((a, b) => a.session_number - b.session_number)
                                  .map(session => (
                                      <SelectItem key={session.id} value={session.id}>
                                          מפגש {session.session_number}: {session.title}
                                      </SelectItem>
                                  ))
                              }
                          </SelectContent>
                      </Select>
                  </div>
              )}
              <div className="space-y-2">
                <Label>עדיפות</Label>
                <Select
                  value={newAnnouncement.priority}
                  onValueChange={(value) => setNewAnnouncement((prev) => ({ ...prev, priority: value }))}>

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([value, config]) =>
                    <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>תאריך תפוגה (אופציונלי)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-right ${!newAnnouncement.expiration_date && 'text-muted-foreground'}`}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {newAnnouncement.expiration_date ? format(new Date(newAnnouncement.expiration_date), 'dd/MM/yyyy', { locale: he }) : 'ללא תאריך תפוגה'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newAnnouncement.expiration_date ? new Date(newAnnouncement.expiration_date) : undefined}
                    onSelect={(date) => setNewAnnouncement((prev) => ({ ...prev, expiration_date: date ? format(date, 'yyyy-MM-dd') : '' }))}
                    locale={he}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>תוכן *</Label>
              <Textarea
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="תוכן ההכרזה..."
                rows={5} />

            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={newAnnouncement.is_pinned}
                  onCheckedChange={(checked) => setNewAnnouncement((prev) => ({ ...prev, is_pinned: checked }))} />

                <Label className="cursor-pointer">קיבוע בראש הרשימה</Label>
              </div>

              {!editingAnnouncement && (
                 <div className="flex items-center gap-2">
                   <Switch
                     checked={notifyStudents}
                     onCheckedChange={setNotifyStudents} 
                   />
                   <Label className="cursor-pointer flex items-center gap-1">
                     <Send className="w-3 h-3" />
                     שלח התראה במייל לסטודנטים
                   </Label>
                 </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                ביטול
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) &&
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                }
                {editingAnnouncement ? 'עדכון' : 'פרסום'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>);

}