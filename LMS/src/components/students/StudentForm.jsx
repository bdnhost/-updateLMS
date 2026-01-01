import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function StudentForm({ open, onClose, onSubmit, student, courses, isLoading }) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues: student || {
      full_name: '',
      id_number: '',
      email: '',
      phone: '',
      department: '',
      course_id: '',
      notes: '',
      status: 'active'
    }
  });

  React.useEffect(() => {
    if (open) {
      if (student) {
        reset({
          ...student,
          course_ids: student.course_ids || (student.course_id ? [student.course_id] : [])
        });
      } else {
        reset({
          full_name: '',
          id_number: '',
          email: '',
          phone: '',
          department: '',
          course_id: '',
          course_ids: [],
          notes: '',
          status: 'active'
        });
      }
    }
  }, [student, reset, open]);

  const activeCourses = courses?.filter((c) => c.status === 'active') || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle dir="rtl">{student ? 'עריכת תלמיד' : 'תלמיד חדש'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">שם מלא *</Label>
            <Input
              id="full_name"
              {...register('full_name', { required: 'שדה חובה' })}
              placeholder="ישראל ישראלי" />

            {errors.full_name &&
            <p className="text-sm text-red-500">{errors.full_name.message}</p>
            }
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id_number">תעודת זהות</Label>
              <Input
                id="id_number"
                {...register('id_number')}
                placeholder="123456789" />

            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">טלפון</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="050-1234567" />

            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="email@example.com" />

          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>קורסים *</Label>
              <div className="border rounded-md p-2 max-h-32 overflow-y-auto space-y-2 bg-white">
                {activeCourses.map((course) => {
                  const currentCourses = watch('course_ids') || [];
                  const isSelected = currentCourses.includes(course.id);
                  return (
                    <div key={course.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`course-${course.id}`}
                        checked={isSelected}
                        onChange={(e) => {
                          let newCourses = e.target.checked
                            ? [...currentCourses, course.id]
                            : currentCourses.filter(id => id !== course.id);
                          
                          setValue('course_ids', newCourses);
                          // Sync primary course_id for backward compatibility
                          setValue('course_id', newCourses[0] || '');
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor={`course-${course.id}`} className="text-sm text-slate-700 cursor-pointer select-none">
                        {course.name}
                      </label>
                    </div>
                  );
                })}
                {activeCourses.length === 0 && (
                  <p className="text-sm text-slate-500">אין קורסים פעילים</p>
                )}
              </div>
              {(!watch('course_ids') || watch('course_ids').length === 0) && (
                <p className="text-sm text-red-500">יש לבחור לפחות קורס אחד</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">מחלקה/חוג</Label>
              <Input
                id="department"
                {...register('department')}
                placeholder="מדעי המחשב" />

            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">סטטוס</Label>
            <Select
              value={watch('status')}
              onValueChange={(value) => setValue('status', value)}>

              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">פעיל</SelectItem>
                <SelectItem value="pending">ממתין</SelectItem>
                <SelectItem value="inactive">לא פעיל</SelectItem>
                <SelectItem value="dropped">פרש</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="הערות נוספות..."
              rows={3} />

          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="bg-slate-700 hover:bg-slate-800 text-white border-slate-600">
              ביטול
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isLoading && <Loader2 className="h-4 w-4 ms-2 animate-spin" />}
              {student ? 'עדכון' : 'הוספה'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>);

}