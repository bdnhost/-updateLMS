import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Calendar as CalendarIcon, Wand2 } from 'lucide-react';
import { addDays, format, parse, startOfWeek } from 'date-fns';
import { toast } from 'sonner';

const DAYS = [
    { value: 'Sunday', label: 'ראשון' },
    { value: 'Monday', label: 'שני' },
    { value: 'Tuesday', label: 'שלישי' },
    { value: 'Wednesday', label: 'רביעי' },
    { value: 'Thursday', label: 'חמישי' },
    { value: 'Friday', label: 'שישי' },
];

export default function ScheduleManager({ course, open, onClose }) {
    const queryClient = useQueryClient();
    const [schedule, setSchedule] = useState({
        recurrence_type: 'weekly',
        days_of_week: [],
        start_time: course?.start_time || '09:00',
        end_time: course?.end_time || '10:30',
        start_date: course?.start_date || '',
        end_date: '',
        location: course?.room || ''
    });

    const generateMutation = useMutation({
        mutationFn: async () => {
            // 1. Create CourseSchedule entity
            const courseSchedule = await base44.entities.CourseSchedule.create({
                organization_id: course.organization_id,
                course_id: course.id,
                ...schedule
            });

            // 2. Call backend function to generate sessions
            const res = await base44.functions.invoke('generateCourseSchedule', {
                courseId: course.id,
                scheduleId: courseSchedule.id,
                action: 'generateFromSchedule'
            });

            return res.data;
        },
        onSuccess: (data) => {
            toast.success(`נוצרו ${data.sessions_created} מפגשים בהצלחה`);
            queryClient.invalidateQueries({ queryKey: ['courseSessions', course.id] });
            onClose();
        },
        onError: (err) => {
            toast.error('שגיאה ביצירת המערכת');
            console.error(err);
        }
    });

    const toggleDay = (day) => {
        const days = schedule.days_of_week.includes(day)
            ? schedule.days_of_week.filter(d => d !== day)
            : [...schedule.days_of_week, day];
        setSchedule({ ...schedule, days_of_week: days });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>מחולל מערכת שעות אוטומטי</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>תאריך התחלה</Label>
                            <Input 
                                type="date" 
                                value={schedule.start_date}
                                onChange={(e) => setSchedule({ ...schedule, start_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>תאריך סיום</Label>
                            <Input 
                                type="date" 
                                value={schedule.end_date}
                                onChange={(e) => setSchedule({ ...schedule, end_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>שעת התחלה</Label>
                            <Input 
                                type="time" 
                                value={schedule.start_time}
                                onChange={(e) => setSchedule({ ...schedule, start_time: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>שעת סיום</Label>
                            <Input 
                                type="time" 
                                value={schedule.end_time}
                                onChange={(e) => setSchedule({ ...schedule, end_time: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>ימי לימוד</Label>
                        <div className="flex flex-wrap gap-2">
                            {DAYS.map((day) => (
                                <div 
                                    key={day.value}
                                    onClick={() => toggleDay(day.value)}
                                    className={`
                                        cursor-pointer px-3 py-1.5 rounded-full border text-sm transition-colors
                                        ${schedule.days_of_week.includes(day.value) 
                                            ? 'bg-indigo-600 text-white border-indigo-600' 
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}
                                    `}
                                >
                                    {day.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>מיקום / חדר</Label>
                        <Input 
                            value={schedule.location}
                            onChange={(e) => setSchedule({ ...schedule, location: e.target.value })}
                            placeholder="למשל: חדר 101 או Zoom"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>ביטול</Button>
                    <Button 
                        onClick={() => generateMutation.mutate()} 
                        disabled={generateMutation.isPending || schedule.days_of_week.length === 0 || !schedule.end_date}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {generateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        <Wand2 className="w-4 h-4 mr-2" />
                        צור מערכת שעות
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}