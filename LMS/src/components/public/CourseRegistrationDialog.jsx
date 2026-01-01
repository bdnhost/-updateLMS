import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { UserPlus, Loader2, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CourseRegistrationDialog({ course, open, onClose }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    id_number: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.phone) {
      toast.error('נא למלא את כל השדות הנדרשים');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await base44.functions.invoke('courseRegistration', {
        course_id: course.id,
        student_data: formData
      });

      if (response.data?.success) {
        setSuccess(true);
        toast.success('נרשמת בהצלחה לקורס!');
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setFormData({ full_name: '', email: '', phone: '', id_number: '' });
        }, 2000);
      } else {
        toast.error(response.data?.message || 'שגיאה ברישום');
      }
    } catch (error) {
      console.error(error);
      toast.error('שגיאה ברישום לקורס');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-right">הרשמה לקורס</DialogTitle>
          <DialogDescription className="text-right">
            {course?.name}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">נרשמת בהצלחה!</h3>
            <p className="text-slate-600">תקבל אישור לרישום בקרוב</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">שם מלא *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="שם פרטי ושם משפחה"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">טלפון *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="05X-XXXXXXX"
                dir="ltr"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_number">תעודת זהות</Label>
              <Input
                id="id_number"
                value={formData.id_number}
                onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                placeholder="123456789"
                dir="ltr"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                ביטול
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-violet-600 hover:bg-violet-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    שולח...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 ml-2" />
                    הרשמה לקורס
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}