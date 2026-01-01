import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger } from
'@/components/ui/popover';
import {
  CalendarIcon,
  Save,
  ClipboardList,
  Loader2,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Printer } from
'lucide-react';
import { toast } from 'sonner';
import AttendanceGrid from '@/components/attendance/AttendanceGrid';
import { Skeleton } from '@/components/ui/skeleton';
import AttendanceReport from '@/components/documents/AttendanceReport';

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourse, setSelectedCourse] = useState('');
  const [lessonNumber, setLessonNumber] = useState('');
  const [attendanceMap, setAttendanceMap] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: courses } = useQuery({
    queryKey: ['courses', user?.organization_id],
    queryFn: () => {
      if (user?.organization_id) {
        return base44.entities.Course.filter({ organization_id: user.organization_id });
      }
      return base44.entities.Course.list();
    },
    enabled: !!user
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students', user?.organization_id],
    queryFn: () => base44.entities.Student.filter({ organization_id: user?.organization_id }),
    enabled: !!user?.organization_id
  });

  const { data: attendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance', user?.organization_id],
    queryFn: () => base44.entities.Attendance.filter({ organization_id: user?.organization_id }),
    enabled: !!user?.organization_id
  });

  const { data: events } = useQuery({
    queryKey: ['courseEvents', selectedCourse],
    queryFn: () => base44.entities.CalendarEvent.filter({ course_id: selectedCourse, type: 'lesson' }),
    enabled: !!selectedCourse
  });

  const { data: sessions } = useQuery({
    queryKey: ['courseSessions', selectedCourse],
    queryFn: () => base44.entities.CourseSession.filter({ course_id: selectedCourse }),
    enabled: !!selectedCourse
  });

  const sortedLessons = useMemo(() => {
    const lessonEvents = events || [];
    const sessionList = sessions || [];

    if (lessonEvents.length > 0) {
      return lessonEvents.sort((a, b) => new Date(a.date + 'T' + a.start_time) - new Date(b.date + 'T' + b.start_time));
    } else if (sessionList.length > 0) {
      return sessionList.
      filter((s) => s.date).
      sort((a, b) => new Date(a.date + 'T' + (a.start_time || '00:00')) - new Date(b.date + 'T' + (b.start_time || '00:00'))).
      map((s) => ({
        id: s.id,
        title: s.title,
        date: s.date,
        start_time: s.start_time || '00:00'
      }));
    }
    return [];
  }, [events, sessions]);

  const activeCourses = courses?.filter((c) => c.status === 'active') || [];
  const selectedCourseData = courses?.find((c) => c.id === selectedCourse);

  const courseStudents = useMemo(() => {
    if (!selectedCourse || !students) return [];
    return students.filter((s) => 
      (s.course_id === selectedCourse || (s.course_ids && s.course_ids.includes(selectedCourse))) && 
      s.status === 'active'
    );
  }, [students, selectedCourse]);

  // Load existing attendance for selected date and course
  useEffect(() => {
    if (!selectedCourse || !selectedDate || !attendance) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // Filter by course, date AND lesson number if set
    const existingAttendance = attendance.filter((a) => {
      const matchesCourse = a.course_id === selectedCourse;
      const matchesDate = a.date === dateStr;
      const matchesLesson = !lessonNumber || !a.lesson_number || a.lesson_number === parseInt(lessonNumber);
      return matchesCourse && matchesDate && matchesLesson;
    });

    const newMap = {};
    existingAttendance.forEach((a) => {
      newMap[a.student_id] = {
        id: a.id,
        status: a.status,
        notes: a.notes || '',
        lesson_number: a.lesson_number
      };
    });

    // Try to infer lesson number from date if not set from attendance
    if (!lessonNumber && existingAttendance.length > 0 && existingAttendance[0].lesson_number) {
      setLessonNumber(existingAttendance[0].lesson_number.toString());
    } else if (!lessonNumber) {
      // Find lesson number from events matching this date
      const event = sortedLessons.find((e) => e.date === dateStr);
      if (event) {
        const index = sortedLessons.findIndex((e) => e.id === event.id);
        setLessonNumber((index + 1).toString());
      }
    }

    setAttendanceMap(newMap);
    setHasChanges(false);
  }, [selectedCourse, selectedDate, attendance, sortedLessons]);

  const handleLessonSelect = (eventId) => {
    const event = sortedLessons.find((e) => e.id === eventId);
    if (event) {
      setSelectedDate(new Date(event.date));
      const index = sortedLessons.findIndex((e) => e.id === eventId);
      setLessonNumber((index + 1).toString());
    }
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Attendance.create(data)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Attendance.update(id, data)
  });

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
    setHasChanges(true);
  };

  const handleNoteChange = (studentId, notes) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
    setHasChanges(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const saveAttendance = async () => {
    if (!selectedCourse || !selectedDate) return;

    setIsSaving(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    try {
      const promises = Object.entries(attendanceMap).map(([studentId, data]) => {
        if (!data.status) return Promise.resolve();

        const student = courseStudents.find(s => s.id === studentId);
        const attendanceData = {
          organization_id: user?.organization_id,
          student_id: studentId,
          course_id: selectedCourse,
          date: dateStr,
          status: data.status,
          notes: data.notes || '',
          lesson_number: lessonNumber ? parseInt(lessonNumber) : null,
          student_name: student?.full_name || '',
          joined_via: 'physical'
        };

        if (data.id) {
          return updateMutation.mutateAsync({ id: data.id, data: attendanceData });
        } else {
          return createMutation.mutateAsync(attendanceData);
        }
      });

      await Promise.all(promises);
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      setHasChanges(false);
      toast.success('הנוכחות נשמרה בהצלחה');
    } catch (error) {
      console.error('Save attendance error:', error);
      toast.error('שגיאה בשמירת הנוכחות: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const markAllPresent = () => {
    const newMap = {};
    courseStudents.forEach((student) => {
      newMap[student.id] = {
        ...attendanceMap[student.id],
        status: 'present'
      };
    });
    setAttendanceMap(newMap);
    setHasChanges(true);
  };

  const exportAttendance = () => {
    if (!selectedCourse || !attendance) return;

    const course = courses?.find((c) => c.id === selectedCourse);
    const courseAttendance = attendance.filter((a) => a.course_id === selectedCourse);

    // Group by student
    const studentAttendanceMap = {};
    courseAttendance.forEach((a) => {
      if (!studentAttendanceMap[a.student_id]) {
        const student = students?.find((s) => s.id === a.student_id);
        studentAttendanceMap[a.student_id] = {
          name: student?.full_name || a.student_name || 'לא ידוע',
          attendance: []
        };
      }
      studentAttendanceMap[a.student_id].attendance.push(a);
    });

    // Calculate statistics per student
    const rows = Object.entries(studentAttendanceMap).map(([studentId, data]) => {
      const total = data.attendance.length;
      const present = data.attendance.filter((a) => a.status === 'present').length;
      const absent = data.attendance.filter((a) => a.status === 'absent').length;
      const late = data.attendance.filter((a) => a.status === 'late').length;
      const excused = data.attendance.filter((a) => a.status === 'excused').length;
      const percentage = total > 0 ? Math.round(present / total * 100) : 0;

      return [
      data.name,
      total,
      present,
      absent,
      late,
      excused,
      `${percentage}%`];

    });

    const csvContent = [
    ['שם התלמיד', 'סה"כ שיעורים', 'נוכח', 'נעדר', 'איחור', 'חופש מאושר', 'אחוז נוכחות'].join(','),
    ...rows.map((row) => row.join(','))].
    join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_${course?.name || 'report'}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('הדוח יוצא בהצלחה');
  };

  const exportCurrentSession = () => {
    if (!selectedCourse || !selectedDate || courseStudents.length === 0) return;

    const course = courses?.find((c) => c.id === selectedCourse);
    const dateStr = format(selectedDate, 'dd/MM/yyyy', { locale: he });

    const rows = courseStudents.map((student) => {
      const status = attendanceMap[student.id]?.status || 'לא סומן';
      const statusLabels = {
        present: 'נוכח',
        absent: 'נעדר',
        late: 'איחור',
        excused: 'חופש מאושר',
        'לא סומן': 'לא סומן'
      };
      const notes = attendanceMap[student.id]?.notes || '';

      return [
      student.full_name,
      student.id_number || '',
      statusLabels[status],
      notes];

    });

    const csvContent = [
    ['שם התלמיד', 'תעודת זהות', 'סטטוס', 'הערות'].join(','),
    ...rows.map((row) => row.join(','))].
    join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_${course?.name || 'course'}_${dateStr.replace(/\//g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('הנוכחות יוצאה בהצלחה');
  };

  // Calculate stats
  const stats = useMemo(() => {
    const statuses = Object.values(attendanceMap);
    return {
      present: statuses.filter((s) => s.status === 'present').length,
      absent: statuses.filter((s) => s.status === 'absent').length,
      late: statuses.filter((s) => s.status === 'late').length,
      excused: statuses.filter((s) => s.status === 'excused').length,
      total: courseStudents.length
    };
  }, [attendanceMap, courseStudents]);

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          /* Hide Layout Elements */
          aside, header, nav {
            display: none !important;
          }
          /* Reset Main Margins */
          main {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          /* Ensure Backgrounds Print */
          body {
            -webkit-print-color-adjust: exact;
          }
          /* Hide all other page elements not in the print area if needed, or rely on print:hidden classes */
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">נוכחות</h1>
          <p className="text-slate-500 mt-1">רישום נוכחות לשיעורים</p>
        </div>
        <div className="flex gap-2">
          {selectedCourse &&
          <>
              {selectedCourseData && (
                <AttendanceReport 
                  course={selectedCourseData}
                  trigger={
                    <Button variant="outline" className="gap-2">
                      <Printer className="h-4 w-4" />
                      דוח מקצועי
                    </Button>
                  }
                />
              )}
              <Button variant="outline" onClick={exportAttendance}>
                <FileSpreadsheet className="h-4 w-4 ml-2" />
                ייצוא CSV
              </Button>
              {courseStudents.length > 0 &&
            <Button variant="outline" onClick={exportCurrentSession}>
                  <Download className="h-4 w-4 ml-2" />
                  ייצוא מפגש זה
                </Button>
            }
            </>
          }
          {hasChanges &&
          <Button onClick={saveAttendance} disabled={isSaving} className="bg-fuchsia-800 text-primary-foreground px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 h-9">
              {isSaving ?
            <Loader2 className="h-4 w-4 ml-2 animate-spin" /> :

            <Save className="h-4 w-4 ml-2" />
            }
              שמירה
            </Button>
          }
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 print:hidden">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">קורס</label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
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

          <div className="flex-1">
             <label className="text-sm font-medium text-slate-700 mb-1.5 block">בחירה מהירה (מפגשים מתוכננים)</label>
             <Select onValueChange={handleLessonSelect}>
                <SelectTrigger>
                    <SelectValue placeholder="בחר מפגש מהלוח..." />
                </SelectTrigger>
                <SelectContent>
                    {sortedLessons.map((lesson, idx) =>
                <SelectItem key={lesson.id} value={lesson.id}>
                            מפגש {idx + 1}: {format(new Date(lesson.date), 'dd/MM/yyyy')} ({lesson.title})
                        </SelectItem>
                )}
                </SelectContent>
             </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">תאריך (ידני)</label>
            <Popover className="bg-slate-300 text-lime-800 px-3 py-1 text-base rounded-md flex h-9 w-full border border-input shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="h-4 w-4 ml-2" />
                  {format(selectedDate, 'dd/MM/yyyy', { locale: he })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  locale={he} />

              </PopoverContent>
            </Popover>
          </div>

          <div className="w-32">
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">מספר מפגש</label>
            <Input
              type="number"
              value={lessonNumber}
              onChange={(e) => setLessonNumber(e.target.value)}
              min="1" className="bg-slate-300 px-3 py-1 text-base rounded-md flex h-9 w-full border border-input shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />

          </div>
        </div>
      </Card>

      {/* Stats */}
      {selectedCourse && courseStudents.length > 0 &&
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            <p className="text-sm text-slate-500">סה״כ</p>
          </Card>
          <Card className="p-4 text-center bg-emerald-50 border-emerald-200">
            <p className="text-2xl font-bold text-emerald-600">{stats.present}</p>
            <p className="text-sm text-emerald-600">נוכחים</p>
          </Card>
          <Card className="p-4 text-center bg-red-50 border-red-200">
            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            <p className="text-sm text-red-600">נעדרים</p>
          </Card>
          <Card className="p-4 text-center bg-orange-50 border-orange-200">
            <p className="text-2xl font-bold text-orange-600">{stats.late}</p>
            <p className="text-sm text-orange-600">איחורים</p>
          </Card>
          <Card className="p-4 text-center bg-violet-50 border-violet-200">
            <p className="text-2xl font-bold text-violet-600">{stats.excused}</p>
            <p className="text-sm text-violet-600">חופש מאושר</p>
          </Card>
        </div>
      }

      {/* Attendance Grid */}
      {!selectedCourse ?
      <Card className="p-16 text-center">
          <ClipboardList className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">בחר קורס להתחלה</h3>
          <p className="text-slate-400">בחר קורס ותאריך לרישום נוכחות</p>
        </Card> :
      studentsLoading || attendanceLoading ?
      <Card className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) =>
        <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-10 w-40" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
        )}
        </Card> :
      courseStudents.length === 0 ?
      <Card className="p-16 text-center">
          <ClipboardList className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">אין תלמידים בקורס זה</h3>
          <p className="text-slate-400">הוסף תלמידים לקורס כדי לרשום נוכחות</p>
        </Card> :

      <div className="space-y-4">
          <div className="hidden print:block mb-8 p-4 border-b border-slate-200">
              <div className="flex justify-between items-start">
                  <div>
                      <h1 className="text-3xl font-bold text-slate-900 mb-2">{selectedCourseData?.name}</h1>
                      <div className="text-lg text-slate-600 space-y-1">
                          <p>קוד קורס: {selectedCourseData?.code}</p>
                          <p>מוסד: {selectedCourseData?.institution || 'לא צוין'}</p>
                      </div>
                  </div>
                  <div className="text-left text-slate-600">
                      <p className="text-xl font-medium">דו"ח נוכחות</p>
                      <p>תאריך: {format(selectedDate, 'dd/MM/yyyy')}</p>
                      <p>מפגש מספר: {lessonNumber}</p>
                  </div>
              </div>
          </div>
          <div className="flex justify-end print:hidden">
            <Button variant="outline" onClick={markAllPresent}>
              <CheckCircle2 className="h-4 w-4 ml-2" />
              סמן את כולם כנוכחים
            </Button>
          </div>
          <AttendanceGrid
          students={courseStudents}
          attendanceMap={attendanceMap}
          onStatusChange={handleStatusChange}
          onNoteChange={handleNoteChange}
          isLoading={isSaving} />

        </div>
      }
    </div>);

}