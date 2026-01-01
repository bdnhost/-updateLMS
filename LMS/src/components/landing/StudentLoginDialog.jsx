import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { UserCircle2, Loader2, AlertCircle, Bookmark } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentLoginDialog({ open, onClose }) {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setError('נא להזין מזהה תלמיד');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Search for student by ID
      const students = await base44.entities.Student.filter({ id: studentId.trim() });
      
      if (!students || students.length === 0) {
        setError('מזהה תלמיד לא נמצא במערכת');
        setLoading(false);
        return;
      }

      const student = students[0];
      
      // Redirect to student portal
      window.location.href = `?type=student&id=${student.id}`;
      
    } catch (err) {
      console.error('Student login error:', err);
      setError('אירעה שגיאה בחיבור למערכת');
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStudentId('');
    setError('');
    onClose();
  };

  const handleAddBookmark = () => {
    if (window.sidebar && window.sidebar.addPanel) { 
      window.sidebar.addPanel(document.title, window.location.href, '');
    } else if (window.external && ('AddFavorite' in window.external)) { 
      window.external.AddFavorite(window.location.href, document.title);
    } else {
      toast.info('לחץ Ctrl+D (או Cmd+D על Mac) כדי להוסיף לסימניות');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <UserCircle2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">כניסת תלמידים</DialogTitle>
          <DialogDescription className="text-center">
            הזן את מזהה התלמיד שלך כדי להיכנס לפורטל האישי
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="studentId" className="text-base font-medium">
              מזהה תלמיד
            </Label>
            <Input
              id="studentId"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                setError('');
              }}
              placeholder="הכנס את מזהה התלמיד שלך"
              className="h-12 text-lg text-center"
              disabled={loading}
              autoFocus
              dir="ltr"
            />
            <p className="text-xs text-slate-500 text-center">
              המזהה נמצא בהודעת האישור שקיבלת מהמוסד
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 h-12"
            >
              ביטול
            </Button>
            <Button
              type="submit"
              disabled={loading || !studentId.trim()}
              className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  מתחבר...
                </>
              ) : (
                'כניסה לפורטל'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-xs text-indigo-800 leading-relaxed">
                💡 <strong>טיפ:</strong> שמור את הקישור לפורטל האישי שלך בסימניות על מנת לגשת אליו בקלות בפעם הבאה
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddBookmark}
              className="h-8 px-3 text-indigo-700 hover:text-indigo-800 hover:bg-indigo-100 shrink-0"
            >
              <Bookmark className="h-4 w-4 ml-1" />
              שמור
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}