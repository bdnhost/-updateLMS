import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import { 
  Calendar as CalendarIcon, 
  Search, 
  MapPin, 
  Clock, 
  Filter, 
  Video, 
  GraduationCap,
  MoreVertical,
  ExternalLink,
  ChevronLeft,
  CalendarDays,
  Trash2
} from 'lucide-react';
import { format, isToday, isFuture, isPast, isValid } from 'date-fns';
import { he } from 'date-fns/locale';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function Sessions() {
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all, upcoming, past, today
  const [viewMode, setViewMode] = useState('list'); // list, grid
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['allSessions', user?.organization_id],
    queryFn: () => base44.entities.CourseSession.filter({ organization_id: user?.organization_id }, undefined, 1000),
    enabled: !!user?.organization_id
  });

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', user?.organization_id],
    queryFn: () => base44.entities.Course.filter({ organization_id: user?.organization_id }),
    enabled: !!user?.organization_id
  });

  const getCourse = (courseId) => courses?.find(c => c.id === courseId);

  const deleteMutation = useMutation({
    mutationFn: async (sessionIds) => {
      const deletePromises = sessionIds.map(id => base44.entities.CourseSession.delete(id));
      return Promise.all(deletePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSessions'] });
      setSelectedSessions([]);
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
      toast.success('המפגשים נמחקו בהצלחה');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('שגיאה במחיקת המפגשים');
    }
  });

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedSessions(filteredSessions.map(s => s.id));
    } else {
      setSelectedSessions([]);
    }
  };

  const handleSelectSession = (sessionId, checked) => {
    if (checked) {
      setSelectedSessions([...selectedSessions, sessionId]);
    } else {
      setSelectedSessions(selectedSessions.filter(id => id !== sessionId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedSessions.length === 0) return;
    setSessionToDelete(selectedSessions);
    setDeleteDialogOpen(true);
  };

  const handleSingleDelete = (sessionId) => {
    setSessionToDelete([sessionId]);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      deleteMutation.mutate(sessionToDelete);
    }
  };

  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    
    return sessions.filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(search.toLowerCase());
      const matchesCourse = courseFilter === 'all' || session.course_id === courseFilter;
      
      let matchesStatus = true;
      const hasDate = session.date && isValid(new Date(session.date));
      
      if (hasDate) {
          const sessionDate = new Date(session.date);
          if (statusFilter === 'upcoming') matchesStatus = isFuture(sessionDate);
          if (statusFilter === 'past') matchesStatus = isPast(sessionDate) && !isToday(sessionDate);
          if (statusFilter === 'today') matchesStatus = isToday(sessionDate);
      } else {
          // If no date, only show if filter is 'all'
          if (statusFilter !== 'all') matchesStatus = false;
      }

      return matchesSearch && matchesCourse && matchesStatus;
    }).sort((a, b) => {
        const hasDateA = a.date && isValid(new Date(a.date));
        const hasDateB = b.date && isValid(new Date(b.date));

        if (!hasDateA && !hasDateB) return (a.session_number || 0) - (b.session_number || 0);
        if (!hasDateA) return 1;
        if (!hasDateB) return -1;

        const dateA = new Date(a.date + 'T' + (a.start_time || '00:00'));
        const dateB = new Date(b.date + 'T' + (b.start_time || '00:00'));
        return dateA - dateB;
    });
  }, [sessions, search, courseFilter, statusFilter]);

  const activeCourses = courses?.filter(c => c.status === 'active') || [];

  if (sessionsLoading || coursesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">ניהול מפגשים</h1>
          <p className="text-slate-500 mt-1">ריכוז כל המפגשים מכל הקורסים</p>
        </div>
        {selectedSessions.length > 0 && (
          <Button 
            variant="destructive" 
            onClick={handleBulkDelete}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            מחק {selectedSessions.length} מפגשים
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="חיפוש מפגש..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10" 
          />
        </div>
        
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="כל הקורסים" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הקורסים</SelectItem>
            {activeCourses.map(course => (
              <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="כל הזמנים" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הזמנים</SelectItem>
            <SelectItem value="upcoming">עתידיים</SelectItem>
            <SelectItem value="today">היום</SelectItem>
            <SelectItem value="past">עבר</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {filteredSessions.length > 0 && (
          <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
            <Checkbox 
              checked={selectedSessions.length === filteredSessions.length && filteredSessions.length > 0}
              onCheckedChange={handleSelectAll}
              id="select-all"
            />
            <label htmlFor="select-all" className="text-sm text-slate-600 cursor-pointer">
              בחר הכל ({filteredSessions.length} מפגשים)
            </label>
          </div>
        )}
        {filteredSessions.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CalendarIcon className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-medium text-slate-600">לא נמצאו מפגשים</h3>
            <p className="text-slate-400">נסה לשנות את סינון החיפוש</p>
          </div>
        ) : (
          filteredSessions.map(session => {
            const course = getCourse(session.course_id);
            const sessionDate = new Date(session.date);
            const validDate = isValid(sessionDate);
            const isSessionToday = validDate && isToday(sessionDate);
            const isSessionPast = validDate && isPast(sessionDate) && !isSessionToday;

            return (
              <Card key={session.id} className={`p-4 hover:shadow-md transition-shadow group border-slate-200 ${selectedSessions.includes(session.id) ? 'ring-2 ring-violet-500 bg-violet-50/30' : ''}`}>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  
                  {/* Checkbox */}
                  <Checkbox 
                    checked={selectedSessions.includes(session.id)}
                    onCheckedChange={(checked) => handleSelectSession(session.id, checked)}
                    className="shrink-0"
                  />
                  
                  {/* Date Badge */}
                  <div className={`
                    flex flex-col items-center justify-center w-16 h-16 rounded-xl shrink-0 border
                    ${isSessionToday ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                      isSessionPast ? 'bg-slate-50 border-slate-200 text-slate-500' : 
                      'bg-violet-50 border-violet-200 text-violet-700'}
                  `}>
                    {validDate ? (
                        <>
                            <span className="text-xs font-medium">{format(sessionDate, 'MMM')}</span>
                            <span className="text-xl font-bold">{format(sessionDate, 'dd')}</span>
                        </>
                    ) : (
                        <span className="text-xs text-center">תאריך<br/>חסר</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      {course && (
                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 flex items-center gap-1 text-xs font-normal">
                          <GraduationCap className="w-3 h-3" />
                          {course.name}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px] h-5">
                        מפגש {session.session_number}
                      </Badge>
                      {isSessionToday && <Badge className="bg-blue-600 hover:bg-blue-700 text-[10px] h-5">היום!</Badge>}
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-800 truncate pr-1">
                      {session.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.start_time} - {session.end_time}
                      </div>
                      {session.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {session.location}
                        </div>
                      )}
                      {session.video_conference_link && (
                        <div className="flex items-center gap-1 text-indigo-600">
                          <Video className="w-3 h-3" />
                          מפגש מקוון
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto sm:justify-end">
                    <Link to={`${createPageUrl('SessionProfile')}?courseId=${session.course_id}&sessionId=${session.id}`} className="w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2 group-hover:border-violet-300 group-hover:text-violet-700">
                            פרטים ונוכחות
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleSingleDelete(session.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>אישור מחיקה</AlertDialogTitle>
            <AlertDialogDescription>
              {sessionToDelete && sessionToDelete.length === 1 
                ? 'האם אתה בטוח שברצונך למחוק מפגש זה? פעולה זו אינה ניתנת לביטול.'
                : `האם אתה בטוח שברצונך למחוק ${sessionToDelete?.length || 0} מפגשים? פעולה זו אינה ניתנת לביטול.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'מוחק...' : 'מחק'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}