import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function Material() {
  useEffect(() => {
    const pathParts = window.location.pathname.split('/').filter(p => p);
    const materialId = pathParts[pathParts.length - 1];
    
    if (materialId && materialId !== 'material') {
      const searchParams = new URLSearchParams(window.location.search);
      const studentId = searchParams.get('student_id');
      const courseId = searchParams.get('course_id');
      
      let redirectUrl = `${window.location.origin}/PublicView?type=material&id=${materialId}`;
      if (studentId) redirectUrl += `&student_id=${studentId}`;
      if (courseId) redirectUrl += `&course_id=${courseId}`;
      
      window.location.href = redirectUrl;
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-4" />
        <p className="text-slate-600">מעביר לדף חומר הלימוד...</p>
      </div>
    </div>
  );
}