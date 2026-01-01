import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2,
  UserCheck,
  QrCode
} from 'lucide-react';
import { toast } from 'sonner';

export default function CheckIn() {
  const [status, setStatus] = useState('loading'); // loading, select, success, error, already
  const [selectedStudent, setSelectedStudent] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const queryClient = useQueryClient();

  // Get URL params
  const urlParams = new URLSearchParams(window.location.search);
  const sessionCode = urlParams.get('code');
  const courseId = urlParams.get('course');
  const lessonNumber = urlParams.get('lesson');
  const dateParam = urlParams.get('date');

  // Fetch course and students using backend function (bypass permissions)
  const { data: checkInData, isLoading: isLoadingData } = useQuery({
    queryKey: ['checkInData', courseId],
    queryFn: async () => {
      const response = await base44.functions.invoke('getCheckInStudents', { course_id: courseId });
      return response.data;
    },
    enabled: !!courseId,
  });

  const course = checkInData?.course;
  const students = checkInData?.students;

  const createMutation = useMutation({
    mutationFn: async (data) => {
        const response = await base44.functions.invoke('submitCheckIn', data);
        if (response.data.error) throw new Error(response.data.error);
        return response.data;
    },
    onSuccess: (data) => {
      if (data.status === 'already_checked_in') {
          setStatus('already');
      } else {
          setStatus('success');
      }
    },
    onError: (error) => {
      setStatus('error');
      setErrorMessage(error.message || 'שגיאה ברישום הנוכחות');
    },
  });

  useEffect(() => {
    if (!sessionCode || !courseId || !lessonNumber) {
      setStatus('error');
      setErrorMessage('קישור לא תקין');
      return;
    }
    setStatus('select');
  }, [sessionCode, courseId, lessonNumber]);

  const handleCheckIn = () => {
    if (!selectedStudent) {
      toast.error('נא לבחור את שמך מהרשימה');
      return;
    }

    if (!phoneNumber) {
      toast.error('נא להזין את מספר הטלפון שלך');
      return;
    }

    // Find student name for display
    const studentData = students?.find(s => s.id === selectedStudent);

    createMutation.mutate({
      student_id: selectedStudent,
      phone_number: phoneNumber,
      course_id: courseId,
      date: dateParam || format(new Date(), 'yyyy-MM-dd'),
      lesson_number: parseInt(lessonNumber),
      check_in_time: format(new Date(), 'HH:mm'),
    });
  };

  // All students are available in the dropdown
  const availableStudents = students || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        {status === 'loading' && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-600" />
            <p className="mt-4 text-slate-600">טוען...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-8">
            <XCircle className="h-16 w-16 mx-auto text-red-500" />
            <h2 className="text-xl font-bold text-slate-800 mt-4">שגיאה</h2>
            <p className="text-slate-500 mt-2">{errorMessage}</p>
          </div>
        )}

        {status === 'select' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">אישור נוכחות</h2>
              {course && (
                <p className="text-lg text-slate-600 mt-2">{course.name}</p>
              )}
              <p className="text-slate-500">שיעור {lessonNumber}</p>
              <p className="text-sm text-slate-400 mt-1">
                {format(new Date(), 'EEEE, d בMMMM yyyy', { locale: he })}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">בחר את שמך</label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="בחר שם מהרשימה" />
                  </SelectTrigger>
                  <SelectContent>
                    {!students || students.length === 0 ? (
                      <div className="p-2 text-sm text-slate-500">אין תלמידים רשומים לקורס</div>
                    ) : (
                      availableStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">מספר טלפון לאימות</label>
                <Input
                  type="tel"
                  placeholder="05X-XXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full"
                  dir="ltr"
                />
                <p className="text-xs text-slate-500">
                  הזן את מספר הטלפון שלך לאימות זהות
                </p>
              </div>

              <Button 
                onClick={handleCheckIn} 
                className="w-full h-12 text-lg"
                disabled={!selectedStudent || !phoneNumber || createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 ml-2" />
                    אשר נוכחות
                  </>
                )}
              </Button>
            </div>

            {!students || students.length === 0 ? (
              <p className="text-center text-sm text-slate-500">
                טוען רשימת תלמידים...
              </p>
            ) : null}
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mt-6">נוכחות אושרה!</h2>
            <p className="text-slate-500 mt-2">
              הנוכחות שלך נרשמה בהצלחה
            </p>
            <p className="text-sm text-slate-400 mt-4">
              {format(new Date(), 'HH:mm')}
            </p>
          </div>
        )}

        {status === 'already' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mt-6">כבר אישרת נוכחות</h2>
            <p className="text-slate-500 mt-2">
              הנוכחות שלך כבר נרשמה לשיעור זה
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}