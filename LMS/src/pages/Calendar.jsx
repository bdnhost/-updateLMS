import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  Clock,
  MapPin,
  Loader2,
  Trash2,
  Edit,
  Calendar as CalendarIcon,
  List,
  LayoutGrid,
  Filter,
  Download,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
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

const eventTypes = [
  { value: 'lesson', label: 'שיעור', color: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600' },
  { value: 'exam', label: 'מבחן', color: 'bg-red-500', gradient: 'from-red-500 to-pink-600' },
  { value: 'deadline', label: 'הגשה', color: 'bg-orange-500', gradient: 'from-orange-500 to-amber-600' },
  { value: 'event', label: 'אירוע', color: 'bg-violet-500', gradient: 'from-violet-500 to-purple-600' },
  { value: 'holiday', label: 'חופשה', color: 'bg-emerald-500', gradient: 'from-emerald-500 to-green-600' }
];

const daysOfWeek = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

export default function Calendar() {
  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    type: 'event',
    location: '',
    course_id: ''
  });
  const [selectedEventIds, setSelectedEventIds] = useState([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: events } = useQuery({
    queryKey: ['events', user?.organization_id],
    queryFn: () => base44.entities.CalendarEvent.filter({ organization_id: user?.organization_id }),
    enabled: !!user?.organization_id
  });

  const { data: courses } = useQuery({
    queryKey: ['courses', user?.organization_id],
    queryFn: () => base44.entities.Course.filter({ organization_id: user?.organization_id }),
    enabled: !!user?.organization_id
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const newEvent = await base44.entities.CalendarEvent.create({ ...data, organization_id: user?.organization_id });
      try {
        const syncResult = await base44.functions.syncEventToGoogle(newEvent, 'create');
        if (syncResult.success && syncResult.googleEventId) {
          await base44.entities.CalendarEvent.update(newEvent.id, {
            google_event_id: syncResult.googleEventId
          });
        }
      } catch (e) {
        console.error("Failed to sync with Google Calendar", e);
      }
      return newEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setFormOpen(false);
      resetForm();
      toast.success('האירוע נוסף וסונכרן בהצלחה');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CalendarEvent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setFormOpen(false);
      setEditingEvent(null);
      resetForm();
      toast.success('האירוע עודכן בהצלחה');
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      const promises = ids.map((id) => base44.entities.CalendarEvent.delete(id));
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setBulkDeleteDialogOpen(false);
      setSelectedEventIds([]);
      toast.success(`${selectedEventIds.length} אירועים נמחקו בהצלחה`);
    },
    onError: () => {
      toast.error('שגיאה במחיקת אירועים');
    }
  });

  const resetForm = () => {
    setNewEvent({
      title: '',
      description: '',
      date: '',
      start_time: '',
      end_time: '',
      type: 'event',
      location: '',
      course_id: ''
    });
  };

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  const getEventsForDay = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    let dayEvents = events?.filter((e) => e.date === dateStr) || [];
    
    if (filterType !== 'all') {
      dayEvents = dayEvents.filter(e => e.type === filterType);
    }
    if (filterCourse !== 'all') {
      dayEvents = dayEvents.filter(e => e.course_id === filterCourse);
    }
    
    return dayEvents;
  };

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    let filtered = [...events];
    
    if (filterType !== 'all') {
      filtered = filtered.filter(e => e.type === filterType);
    }
    if (filterCourse !== 'all') {
      filtered = filtered.filter(e => e.course_id === filterCourse);
    }
    
    return filtered;
  }, [events, filterType, filterCourse]);

  // Stats calculation
  const stats = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthEvents = filteredEvents.filter(e => {
      const eventDate = parseISO(e.date);
      return eventDate >= monthStart && eventDate <= monthEnd;
    });

    return {
      total: monthEvents.length,
      lessons: monthEvents.filter(e => e.type === 'lesson').length,
      exams: monthEvents.filter(e => e.type === 'exam').length,
      deadlines: monthEvents.filter(e => e.type === 'deadline').length
    };
  }, [filteredEvents, currentMonth]);

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  const handleAddEvent = () => {
    setEditingEvent(null);
    setNewEvent({
      title: '',
      description: '',
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      start_time: '',
      end_time: '',
      type: 'event',
      location: '',
      course_id: ''
    });
    setFormOpen(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description || '',
      date: event.date,
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      type: event.type,
      location: event.location || '',
      course_id: event.course_id || ''
    });
    setFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) {
      toast.error('נא למלא את כל השדות הנדרשים');
      return;
    }

    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data: newEvent });
    } else {
      createMutation.mutate(newEvent);
    }
  };

  const getEventTypeConfig = (type) => {
    return eventTypes.find((t) => t.value === type) || eventTypes[0];
  };

  const activeCourses = courses?.filter((c) => c.status === 'active') || [];
  const firstDayOfMonth = startOfMonth(currentMonth).getDay();

  const handleExportICS = () => {
    const eventsToExport = filteredEvents;
    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//EduManage//Calendar//HE\n';
    
    eventsToExport.forEach(event => {
      const startDateTime = event.start_time 
        ? `${event.date.replace(/-/g, '')}T${event.start_time.replace(/:/g, '')}00`
        : `${event.date.replace(/-/g, '')}`;
      const endDateTime = event.end_time
        ? `${event.date.replace(/-/g, '')}T${event.end_time.replace(/:/g, '')}00`
        : `${event.date.replace(/-/g, '')}`;
      
      icsContent += `BEGIN:VEVENT\n`;
      icsContent += `UID:${event.id}@edumanage.org\n`;
      icsContent += `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss")}\n`;
      icsContent += `DTSTART:${startDateTime}\n`;
      icsContent += `DTEND:${endDateTime}\n`;
      icsContent += `SUMMARY:${event.title}\n`;
      if (event.description) icsContent += `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}\n`;
      if (event.location) icsContent += `LOCATION:${event.location}\n`;
      icsContent += `END:VEVENT\n`;
    });
    
    icsContent += 'END:VCALENDAR';
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'calendar.ics';
    link.click();
    toast.success('לוח השנה יוצא בהצלחה');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Toaster position="top-center" richColors />

      {/* HEADER משודרג */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white via-violet-50/30 to-purple-50/30 rounded-3xl shadow-xl border-2 border-violet-100 p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* כותרת */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg">
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 mb-1">לוח שנה</h1>
              <p className="text-slate-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                מפגשים, בחנים ואירועים
              </p>
            </div>
          </div>

          {/* כפתורי פעולה */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleExportICS}
              variant="outline"
              className="gap-2 border-2 border-slate-200 hover:bg-slate-50 font-bold"
            >
              <Download className="h-4 w-4" />
              ייצא ל-ICS
            </Button>
            <Button
              onClick={() => {
                setSelectedDate(new Date());
                handleAddEvent();
              }}
              className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-4 w-4" />
              אירוע חדש
            </Button>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-violet-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 border-2 border-violet-200 shadow-md hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-100 rounded-xl group-hover:scale-110 transition-transform">
                <Target className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <div className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-0.5">סה"כ אירועים</div>
                <div className="text-2xl font-black text-slate-800">{stats.total}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 border-2 border-blue-200 shadow-md hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform">
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-0.5">שיעורים</div>
                <div className="text-2xl font-black text-slate-800">{stats.lessons}</div>
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
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-xs text-red-600 font-bold uppercase tracking-wider mb-0.5">מבחנים</div>
                <div className="text-2xl font-black text-slate-800">{stats.exams}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-4 border-2 border-orange-200 shadow-md hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-100 rounded-xl group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-0.5">הגשות</div>
                <div className="text-2xl font-black text-slate-800">{stats.deadlines}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* VIEW MODE + FILTERS */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-gradient-to-r from-slate-100 to-slate-50 border-2 border-slate-200 rounded-xl p-1.5 shadow-sm">
          <Button
            variant={viewMode === 'day' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('day')}
            className={`h-9 transition-all ${viewMode === 'day' ? 'bg-violet-600 text-white shadow-md scale-105' : 'text-slate-600 hover:bg-white/50'}`}
          >
            <List className="h-4 w-4 me-2" />
            יומי
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('week')}
            className={`h-9 transition-all ${viewMode === 'week' ? 'bg-violet-600 text-white shadow-md scale-105' : 'text-slate-600 hover:bg-white/50'}`}
          >
            <CalendarDays className="h-4 w-4 me-2" />
            שבועי
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('month')}
            className={`h-9 transition-all ${viewMode === 'month' ? 'bg-violet-600 text-white shadow-md scale-105' : 'text-slate-600 hover:bg-white/50'}`}
          >
            <LayoutGrid className="h-4 w-4 me-2" />
            חודשי
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36 h-9 text-sm border-2 border-slate-200 rounded-xl shadow-sm">
              <SelectValue placeholder="כל הסוגים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסוגים</SelectItem>
              {eventTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCourse} onValueChange={setFilterCourse}>
            <SelectTrigger className="w-44 h-9 text-sm border-2 border-slate-200 rounded-xl shadow-sm">
              <SelectValue placeholder="כל הקורסים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הקורסים</SelectItem>
              {activeCourses.map(course => (
                <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* BULK ACTIONS BAR */}
      <AnimatePresence>
        {selectedEventIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-violet-50 to-purple-50 p-5 rounded-2xl flex items-center justify-between border-2 border-violet-200 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="bg-violet-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-md">
                {selectedEventIds.length}
              </div>
              <span className="text-sm font-black text-slate-800">אירועים נבחרו</span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteDialogOpen(true)}
              className="gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 font-bold shadow-md"
            >
              <Trash2 className="h-4 w-4" />
              מחיקת נבחרים
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CALENDAR */}
        <Card className="lg:col-span-2 p-6 border-2 border-slate-200 shadow-lg rounded-2xl">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-violet-100 hover:text-violet-700"
                onClick={() => {
                  if (viewMode === 'month') setCurrentMonth(subMonths(currentMonth, 1));
                  else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
                  else setCurrentDate(addDays(currentDate, -1));
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex border-2 border-violet-200 hover:bg-violet-50 font-bold"
                onClick={() => {
                  const now = new Date();
                  setCurrentMonth(now);
                  setCurrentDate(now);
                  setSelectedDate(now);
                }}
              >
                היום
              </Button>
            </div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-violet-600" />
              {viewMode === 'month' && format(currentMonth, 'MMMM yyyy', { locale: he })}
              {viewMode === 'week' && `שבוע ${format(currentDate, 'd MMM', { locale: he })} - ${format(addDays(startOfWeek(currentDate, { weekStartsOn: 0 }), 6), 'd MMM yyyy', { locale: he })}`}
              {viewMode === 'day' && format(currentDate, 'EEEE, d בMMMM yyyy', { locale: he })}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-violet-100 hover:text-violet-700"
              onClick={() => {
                if (viewMode === 'month') setCurrentMonth(addMonths(currentMonth, 1));
                else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
                else setCurrentDate(addDays(currentDate, 1));
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* MONTH VIEW */}
          {viewMode === 'month' && (
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center py-3 text-sm font-black text-violet-600 uppercase tracking-wider">
                  {day}
                </div>
              ))}

              {/* Empty cells for offset */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px] bg-slate-50/30 rounded-lg" />
              ))}

              {/* Calendar Days */}
              {days.map((day, index) => {
                const dayEvents = getEventsForDay(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isTodayDate = isToday(day);

                return (
                  <motion.button
                    key={day.toISOString()}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01 }}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative p-2 min-h-[100px] text-start transition-all border-2 rounded-xl
                      ${isSelected ? 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-400 shadow-lg z-10' : 'border-slate-100 hover:border-violet-200'}
                      ${!isCurrentMonth ? 'opacity-30 bg-slate-50/50' : 'bg-white hover:bg-violet-50/30'}
                      ${isTodayDate && !isSelected ? 'border-violet-300 bg-violet-50/20' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`
                        text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-all
                        ${isTodayDate ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-md scale-110' : 'text-slate-700'}
                      `}>
                        {format(day, 'd')}
                      </span>
                      {dayEvents.length > 0 && (
                        <Badge className="text-[10px] bg-violet-100 text-violet-700 border-0 px-2 shadow-sm">
                          {dayEvents.length}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => {
                        const typeConfig = getEventTypeConfig(event.type);
                        return (
                          <div
                            key={event.id}
                            className={`text-[10px] truncate rounded-lg px-2 py-1 text-white shadow-md bg-gradient-to-r ${typeConfig.gradient} font-medium`}
                          >
                            {event.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-slate-500 font-bold pe-1">
                          +{dayEvents.length - 3} נוספים
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* WEEK VIEW */}
          {viewMode === 'week' && (
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => {
                const dayEvents = getEventsForDay(day).sort((a, b) =>
                  (a.start_time || '00:00').localeCompare(b.start_time || '00:00')
                );
                const isTodayDate = isToday(day);

                return (
                  <motion.div
                    key={day.toISOString()}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border-2 rounded-2xl overflow-hidden shadow-lg ${
                      isTodayDate ? 'bg-gradient-to-b from-violet-50 to-purple-50 border-violet-300' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className={`p-3 border-b-2 ${
                      isTodayDate ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white border-violet-400' : 'bg-slate-50 text-slate-700 border-slate-200'
                    } text-center`}>
                      <div className="text-xs font-bold">{format(day, 'EEE', { locale: he })}</div>
                      <div className={`text-2xl font-black ${isTodayDate ? 'text-white' : 'text-slate-800'}`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                    <div className="p-2 space-y-2 min-h-[300px] max-h-[500px] overflow-y-auto">
                      {dayEvents.map((event) => {
                        const typeConfig = getEventTypeConfig(event.type);
                        return (
                          <motion.button
                            key={event.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleEditEvent(event)}
                            className={`w-full text-start p-3 rounded-xl text-white shadow-md hover:shadow-lg transition-all bg-gradient-to-r ${typeConfig.gradient}`}
                          >
                            <div className="text-xs font-black truncate">{event.title}</div>
                            {event.start_time && (
                              <div className="text-[10px] opacity-90 mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {event.start_time}
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* DAY VIEW */}
          {viewMode === 'day' && (
            <div className="space-y-2">
              {Array.from({ length: 24 }, (_, hour) => {
                const timeStr = `${String(hour).padStart(2, '0')}:00`;
                const hourEvents = getEventsForDay(currentDate).filter(e => {
                  if (!e.start_time) return false;
                  const eventHour = parseInt(e.start_time.split(':')[0]);
                  return eventHour === hour;
                });

                return (
                  <div key={hour} className="flex gap-3">
                    <div className="w-20 text-sm font-black text-slate-600 pt-1">{timeStr}</div>
                    <div className="flex-1 min-h-[60px] border-t-2 border-slate-200 pt-2">
                      {hourEvents.map((event, idx) => {
                        const typeConfig = getEventTypeConfig(event.type);
                        return (
                          <motion.button
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handleEditEvent(event)}
                            className={`w-full text-start p-4 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all mb-2 bg-gradient-to-r ${typeConfig.gradient}`}
                          >
                            <div className="font-black text-base">{event.title}</div>
                            <div className="text-xs opacity-90 mt-2 flex flex-wrap items-center gap-3">
                              <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg">
                                <Clock className="h-3 w-3" />
                                {event.start_time} {event.end_time && `- ${event.end_time}`}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </span>
                              )}
                            </div>
                            {event.description && (
                              <div className="text-xs opacity-80 mt-2 line-clamp-2 bg-white/10 p-2 rounded-lg">{event.description}</div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* SIDEBAR */}
        <div className="space-y-4">
          {/* Month Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-5 bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 shadow-lg rounded-2xl">
              <h3 className="font-black text-slate-800 mb-4 text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-600" />
                סיכום החודש
              </h3>
              <div className="space-y-3">
                {eventTypes.map(type => {
                  const count = filteredEvents.filter(e => {
                    const eventDate = parseISO(e.date);
                    return e.type === type.value &&
                      eventDate >= startOfMonth(currentMonth) &&
                      eventDate <= endOfMonth(currentMonth);
                  }).length;

                  if (count === 0) return null;

                  return (
                    <div key={type.value} className="flex items-center justify-between text-sm bg-white p-3 rounded-xl border border-violet-100 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${type.color} shadow-sm`} />
                        <span className="font-medium text-slate-700">{type.label}</span>
                      </div>
                      <span className="font-black text-slate-900 text-lg">{count}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Selected Day Events */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 border-2 border-slate-200 shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-800">
                  {selectedDate ? format(selectedDate, 'EEEE, d בMMMM', { locale: he }) : 'בחר יום'}
                </h3>
                <div className="flex gap-2">
                  {selectedEventIds.length > 0 && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setBulkDeleteDialogOpen(true)}
                      className="h-8 px-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {selectedDate && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddEvent}
                      className="h-8 px-2 border-2 border-violet-200 hover:bg-violet-50"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {!selectedDate ? (
                <div className="text-center py-12 text-slate-400">
                  <CalendarDays className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <p className="font-medium">לחץ על יום לצפייה באירועים</p>
                </div>
              ) : selectedDayEvents.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <CalendarDays className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <p className="font-medium mb-2">אין אירועים ביום זה</p>
                  <Button
                    size="sm"
                    variant="link"
                    onClick={handleAddEvent}
                    className="text-violet-600 font-bold"
                  >
                    הוסף אירוע
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pe-2">
                  {selectedDayEvents.map((event, index) => {
                    const typeConfig = getEventTypeConfig(event.type);
                    const isSelected = selectedEventIds.includes(event.id);

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          isSelected ? 'bg-blue-50 border-blue-300 shadow-lg' : 'bg-slate-50 border-slate-200 hover:border-violet-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="pt-1">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) setSelectedEventIds((prev) => [...prev, event.id]);
                                else setSelectedEventIds((prev) => prev.filter((id) => id !== event.id));
                              }}
                              className="border-2 border-slate-400 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                            />
                          </div>
                          <div className={`w-1.5 self-stretch rounded-full bg-gradient-to-b ${typeConfig.gradient} shadow-sm`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <Badge className={`bg-gradient-to-r ${typeConfig.gradient} text-white border-0 shadow-sm font-bold`}>
                                {typeConfig.label}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                                onClick={() => handleEditEvent(event)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                            <h4 className="font-black text-slate-800 truncate mb-1" title={event.title}>
                              {event.title}
                            </h4>
                            {event.description && (
                              <p className="text-sm text-slate-600 mt-1 line-clamp-2 bg-slate-100 p-2 rounded-lg">
                                {event.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-3 text-xs">
                              {event.start_time && (
                                <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg font-medium text-slate-700">
                                  <Clock className="h-3 w-3" />
                                  {event.start_time}
                                  {event.end_time && ` - ${event.end_time}`}
                                </span>
                              )}
                              {event.location && (
                                <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg font-medium text-slate-700">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ADD/EDIT DIALOG */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md bg-white border-2 border-violet-200 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-800">
              {editingEvent ? 'עריכת אירוע' : 'אירוע חדש'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">כותרת *</Label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="שם האירוע"
                className="border-2 border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">תאריך *</Label>
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, date: e.target.value }))}
                  className="border-2 border-slate-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">סוג</Label>
                <Select
                  value={newEvent.type}
                  onValueChange={(value) => setNewEvent((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="border-2 border-slate-200 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">שעת התחלה</Label>
                <Input
                  type="time"
                  value={newEvent.start_time}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, start_time: e.target.value }))}
                  className="border-2 border-slate-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">שעת סיום</Label>
                <Input
                  type="time"
                  value={newEvent.end_time}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, end_time: e.target.value }))}
                  className="border-2 border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">קורס</Label>
              <Select
                value={newEvent.course_id}
                onValueChange={(value) => setNewEvent((prev) => ({ ...prev, course_id: value }))}
              >
                <SelectTrigger className="border-2 border-slate-200 rounded-xl">
                  <SelectValue placeholder="בחר קורס (אופציונלי)" />
                </SelectTrigger>
                <SelectContent>
                  {activeCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">מיקום</Label>
              <Input
                value={newEvent.location}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="חדר / מיקום"
                className="border-2 border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">תיאור</Label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="תיאור האירוע..."
                rows={3}
                className="border-2 border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-100">
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
                className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold shadow-lg"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {editingEvent ? 'שמור שינויים' : 'הוספה'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* BULK DELETE DIALOG */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-2 border-red-200 rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-red-900">
              האם למחוק את האירועים הנבחרים?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 leading-relaxed">
              פעולה זו תמחק <span className="font-bold text-red-600">{selectedEventIds.length} אירועים</span> לצמיתות.
              <br />
              <strong className="text-red-600">הפעולה אינה ניתנת לביטול.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-slate-700 hover:bg-slate-800 text-white font-bold">
              ביטול
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkDeleteMutation.mutate(selectedEventIds)}
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