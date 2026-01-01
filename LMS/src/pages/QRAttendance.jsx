import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import {
  QrCode,
  RefreshCw,
  Users,
  Clock,
  CheckCircle2,
  Printer,
  GraduationCap } from
'lucide-react';

export default function QRAttendance() {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [lessonNumber, setLessonNumber] = useState('1');
  const [sessionCode, setSessionCode] = useState('');
  const [qrActive, setQrActive] = useState(false);
  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));

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

  const { data: attendance, refetch: refetchAttendance } = useQuery({
    queryKey: ['attendance', selectedCourse, sessionCode, user?.organization_id],
    queryFn: () => base44.entities.Attendance.filter({ course_id: selectedCourse, organization_id: user?.organization_id }),
    enabled: !!selectedCourse && !!sessionCode && !!user?.organization_id,
    refetchInterval: qrActive ? 3000 : false
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

  const sortedLessons = React.useMemo(() => {
    const lessonEvents = events || [];
    const sessionList = sessions || [];

    if (lessonEvents.length > 0) {
      return lessonEvents.sort((a, b) => new Date(a.date + 'T' + a.start_time) - new Date(b.date + 'T' + b.start_time));
    } else if (sessionList.length > 0) {
      return sessionList
        .sort((a, b) => {
            if (a.date && b.date) {
                return new Date(a.date + 'T' + (a.start_time || '00:00')) - new Date(b.date + 'T' + (b.start_time || '00:00'));
            }
            return (a.session_number || 0) - (b.session_number || 0);
        })
        .map(s => ({
          id: s.id,
          title: s.title,
          date: s.date || null,
          start_time: s.start_time || '00:00',
          session_number: s.session_number
        }));
    }
    return [];
  }, [events, sessions]);

  const activeCourses = courses?.filter((c) => c.status === 'active') || [];
  
  const [selectedEventId, setSelectedEventId] = useState('manual');
  
  useEffect(() => {
    if (sortedLessons.length > 0 && selectedEventId === 'manual') {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const todaysLesson = sortedLessons.find(l => l.date === todayStr);
        if (todaysLesson) {
            setSelectedEventId(todaysLesson.id);
            const index = sortedLessons.findIndex(l => l.id === todaysLesson.id);
            setLessonNumber((index + 1).toString());
        }
    }
  }, [sortedLessons, selectedEventId]);

  const handleEventSelect = (val) => {
    setSelectedEventId(val);
    if (val === 'manual') {
        setLessonNumber('1');
        setCurrentDate(format(new Date(), 'yyyy-MM-dd'));
    } else {
        const event = sortedLessons.find(l => l.id === val);
        if (event) {
            const index = sortedLessons.findIndex(l => l.id === val);
            setLessonNumber((index + 1).toString());
            if (event.date) {
                setCurrentDate(event.date);
            }
        }
    }
    setQrActive(false);
  };

  const generateSessionCode = () => {
    let dateStr = currentDate;
    if (selectedEventId !== 'manual') {
        const event = sortedLessons.find(l => l.id === selectedEventId);
        if (event && event.date) dateStr = event.date;
    }
    
    const code = `${selectedCourse}-${dateStr.replace(/-/g, '')}-${lessonNumber}-${Math.random().toString(36).substring(2, 8)}`;
    setSessionCode(code);
    setQrActive(true);
  };

  const currentSessionAttendance = attendance?.filter((a) => {
      return a.course_id === selectedCourse &&
      a.date === currentDate &&
      a.lesson_number === parseInt(lessonNumber);
  }) || [];

  const presentCount = currentSessionAttendance.filter((a) => a.status === 'present').length;

  const qrUrl = sessionCode ?
  `${window.location.origin}/CheckIn?code=${encodeURIComponent(sessionCode)}&course=${selectedCourse}&lesson=${lessonNumber}&date=${currentDate}` :
  '';

  const selectedCourseName = courses?.find((c) => c.id === selectedCourse)?.name || '';
  const selectedCourse_obj = courses?.find((c) => c.id === selectedCourse);
  
  const { data: organization } = useQuery({
    queryKey: ['organization', user?.organization_id],
    queryFn: () => base44.entities.Organization.get(user?.organization_id),
    enabled: !!user?.organization_id
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          @page { margin: 0; size: A4 portrait; }
          body { -webkit-print-color-adjust: exact; background: white !important; }
          
          body * {
            visibility: hidden;
          }
          
          header, aside, nav, .layout-sidebar, .layout-header {
            display: none !important;
          }

          .print-container, .print-container * {
            visibility: visible;
          }

          .print-container { 
            display: flex !important; 
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: white; 
            z-index: 9999;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="print-container hidden print:flex flex-col items-center justify-center min-h-screen text-center p-12 bg-white text-black">
        <div className="border-b-4 border-indigo-600 w-full pb-6 mb-10">
            <div className="flex items-start justify-between mb-6">
                <div className="flex-1 text-right">
                    <h1 className="text-6xl font-black mb-4 text-slate-900">{selectedCourseName}</h1>
                    <h2 className="text-4xl font-bold text-indigo-600">מפגש מספר {lessonNumber}</h2>
                </div>
                <div className="flex flex-col items-center gap-3">
                    {selectedCourse_obj?.logo_url && (
                        <img 
                            src={selectedCourse_obj.logo_url} 
                            alt="Course Logo" 
                            className="h-32 w-auto object-contain"
                        />
                    )}
                    {organization?.logo_url && (
                        <img 
                            src={organization.logo_url} 
                            alt="Organization Logo" 
                            className="h-24 w-auto object-contain"
                        />
                    )}
                    {!selectedCourse_obj?.logo_url && !organization?.logo_url && (
                        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center">
                            <GraduationCap className="h-16 w-16 text-white" />
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        <div className="border-[6px] border-indigo-600 p-6 rounded-3xl mb-10 bg-white shadow-none">
            <QRCodeSVG
              value={qrUrl}
              size={500}
              level="H"
              includeMargin={true}
              className="w-[500px] h-[500px]"
            />
        </div>

        <div className="space-y-4">
            <p className="text-4xl font-black">יש לסרוק את הקוד לאישור נוכחות</p>
            <p className="text-3xl text-indigo-700 font-bold">
                {format(new Date(currentDate), 'EEEE, d בMMMM yyyy', { locale: he })}
            </p>
        </div>
        
        <div className="mt-auto pt-16 border-t-2 border-slate-200 w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
                {(selectedCourse_obj?.logo_url || organization?.logo_url) ? (
                    <img 
                        src={selectedCourse_obj?.logo_url || organization?.logo_url} 
                        alt="Logo" 
                        className="h-12 w-auto object-contain"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                )}
                <span className="font-bold text-lg text-slate-700">{organization?.name || 'EduManage'}</span>
            </div>
            <div className="text-slate-500 text-sm">
                <div>הופק בתאריך: {format(new Date(), 'dd/MM/yyyy HH:mm')}</div>
                <div className="mt-1">מופק באמצעות מערכת EduManage</div>
            </div>
        </div>
      </div>

      <div className="print:hidden">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">נוכחות QR Code</h1>
                <p className="text-slate-500 mt-1">הצג QR Code לתלמידים לאישור נוכחות</p>
            </div>
            {qrActive && (
                <Button onClick={handlePrint} variant="outline" className="gap-2">
                    <Printer className="w-4 h-4" />
                    הדפס דף A4
                </Button>
            )}
        </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">קורס</label>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">מפגש</label>
            <Select value={selectedEventId} onValueChange={handleEventSelect}>
              <SelectTrigger>
                <SelectValue placeholder="בחר מפגש" />
              </SelectTrigger>
              <SelectContent>
                {sortedLessons.map((lesson, index) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                        מפגש {lesson.session_number || index + 1}: {lesson.date ? format(new Date(lesson.date), 'dd/MM/yyyy') : 'ללא תאריך'} - {lesson.title}
                    </SelectItem>
                ))}
                {sortedLessons.length === 0 && (
                    <div className="p-2 text-sm text-center text-slate-500">
                        לא נמצאו מפגשים בקורס זה
                    </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={generateSessionCode}
              disabled={!selectedCourse} className="bg-fuchsia-400 text-slate-800 px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 h-9 w-full">


              <QrCode className="h-4 w-4 ml-2" />
              {qrActive ? 'חידוש QR' : 'הפעל QR'}
            </Button>
          </div>
        </div>
      </Card>

      {qrActive && sessionCode &&
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-8 flex flex-col items-center justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <QRCodeSVG
              value={qrUrl}
              size={280}
              level="H"
              includeMargin={true} />

            </div>
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-bold text-slate-800">{selectedCourseName}</h2>
              <p className="text-slate-500 mt-1">מפגש {lessonNumber}</p>
              <p className="text-slate-400 text-sm mt-2">
                {format(new Date(currentDate), 'EEEE, d בMMMM yyyy', { locale: he })}
              </p>
            </div>
            <Button
            variant="outline"
            onClick={generateSessionCode}
            className="mt-4">

              <RefreshCw className="h-4 w-4 ml-2" />
              רענן קוד
            </Button>
          </Card>

          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-emerald-100 rounded-xl">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-slate-800">{presentCount}</p>
                  <p className="text-slate-500">תלמידים אישרו נוכחות</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                תלמידים שאישרו
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {currentSessionAttendance.length === 0 ?
              <p className="text-slate-400 text-center py-4">
                    ממתין לתלמידים...
                  </p> :

              currentSessionAttendance.map((record, index) =>
              <div
                key={record.id || index}
                className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">

                      <span className="font-medium text-slate-700">
                        {record.student_name || `תלמיד ${index + 1}`}
                      </span>
                      <span className="text-sm text-slate-500">
                        {record.check_in_time || format(new Date(record.created_date), 'HH:mm')}
                      </span>
                    </div>
              )
              }
              </div>
            </Card>

            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">הרשימה מתעדכנת אוטומטית</p>
                  <p className="text-sm text-blue-600">
                    כל 3 שניות נבדקים תלמידים חדשים שאישרו נוכחות
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      }

      {!qrActive &&
      <Card className="p-8 text-center">
          <QrCode className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">בחר קורס והפעל QR Code</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            התלמידים יסרקו את הקוד באמצעות הטלפון הנייד שלהם ויאשרו נוכחות
          </p>
        </Card>
      }
      </div>
    </div>);

}