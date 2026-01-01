import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, isPast, isToday, differenceInDays, isValid } from 'date-fns';
import { he } from 'date-fns/locale';
import { 
  Calendar, 
  Percent, 
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Share2,
  Sparkles,
  Mic,
  Download
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const typeLabels = {
  assignment: 'מטלה',
  quiz: 'בוחן',
  exam: 'מבחן',
  project: 'פרויקט',
};

const typeColors = {
  assignment: 'bg-blue-100 text-blue-700',
  quiz: 'bg-purple-100 text-purple-700',
  exam: 'bg-red-100 text-red-700',
  project: 'bg-emerald-100 text-emerald-700',
};

export default function AssignmentCard({ 
  assignment, 
  courseName,
  submissionStats,
  onEdit, 
  onDelete,
  onToggleStatus,
  onShare,
  onViewSubmissions
}) {
  const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
  const isValidDate = dueDate && !isNaN(dueDate.getTime());
  
  const isOverdue = isValidDate && isPast(dueDate) && assignment.status === 'open';
  const isDueToday = isValidDate && isToday(dueDate);
  const daysUntilDue = isValidDate ? differenceInDays(dueDate, new Date()) : 0;
  const isDueSoon = isValidDate && daysUntilDue >= 0 && daysUntilDue <= 3 && assignment.status === 'open';

  const pendingGradingCount = submissionStats?.pendingGrading || 0;
  const requiresAttention = pendingGradingCount > 0;

  // Determine if assignment is AI enriched based on content presence
  const isEnriched = (assignment.key_concepts && assignment.key_concepts.length > 0) || 
                     (assignment.resource_links && assignment.resource_links.length > 0) ||
                     (assignment.content_data && Object.keys(assignment.content_data).length > 0) ||
                     assignment.audio_url;

  const getDueDateLabel = () => {
    if (!isValidDate || !isValid(dueDate)) return 'אין תאריך';
    if (isDueToday) return 'היום';
    if (daysUntilDue === 1) return 'מחר';
    if (daysUntilDue > 0 && daysUntilDue <= 7) return `בעוד ${daysUntilDue} ימים`;
    if (isOverdue) return 'עבר';
    return format(dueDate, 'd בMMMM', { locale: he });
  };

  return (
    <Card className={`p-5 shadow-sm hover:shadow-md transition-all border-r-4 ${
      assignment.status === 'closed' ? 'opacity-60 border-r-slate-300' : 
      requiresAttention ? 'border-r-orange-500 bg-orange-50/20' :
      isOverdue ? 'border-r-red-500 bg-red-50/10' :
      isDueSoon ? 'border-r-yellow-500 bg-yellow-50/10' :
      'border-r-indigo-500'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={typeColors[assignment.type]}>
              {typeLabels[assignment.type]}
            </Badge>
            {assignment.status === 'closed' && (
              <Badge variant="secondary">סגור</Badge>
            )}
            {isOverdue && (
              <Badge variant="destructive">פג תוקף</Badge>
            )}
            {isDueSoon && (
              <Badge className="bg-yellow-500 hover:bg-yellow-600">קרוב להגשה</Badge>
            )}

            {requiresAttention && (
               <Badge className="bg-orange-600 hover:bg-orange-700 animate-pulse">
                   ממתין לבדיקה ({pendingGradingCount})
               </Badge>
            )}
            
            {isEnriched && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 gap-1 pr-1.5">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      מועשר ב-AI
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>מטלה זו עברה העשרת תוכן אוטומטית</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {assignment.audio_url && (
                <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200 gap-1 pr-1.5">
                      <Mic className="w-3 h-3" />
                      קולי
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>כולל הנחיה קולית</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <Link to={`${createPageUrl('AssignmentProfile')}?id=${assignment.id}`} className="hover:underline hover:text-indigo-600 transition-colors">
              <h3 className="text-lg font-semibold text-slate-800 mb-1 flex items-center gap-2">
                {assignment.title}
              </h3>
          </Link>
          
          {courseName && (
            <p className="text-sm text-slate-500 mb-3">{courseName}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <div className={`flex items-center gap-1.5 ${
              isOverdue ? 'text-red-600' : isDueToday ? 'text-orange-600' : ''
            }`}>
              <Calendar className="h-4 w-4" />
              <span>הגשה: {getDueDateLabel()}</span>
            </div>
            
            {assignment.weight && (
              <div className="flex items-center gap-1.5">
                <Percent className="h-4 w-4" />
                <span>משקל: {assignment.weight}%</span>
              </div>
            )}
          </div>

          {submissionStats && (
            <div className="mt-4 flex items-center gap-4">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${(submissionStats.submitted / submissionStats.total) * 100}%` }}
                />
              </div>
              <span className="text-sm text-slate-500">
                {submissionStats.submitted}/{submissionStats.total} הגישו
              </span>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
                <Link to={`${createPageUrl('AssignmentProfile')}?id=${assignment.id}`} className="w-full cursor-pointer">
                  <FileText className="h-4 w-4 ml-2" />
                  פרטי מטלה מלאים
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(assignment)}>
              <Share2 className="h-4 w-4 ml-2" />
              שתף קישור
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewSubmissions && onViewSubmissions(assignment)}>
              <FileText className="h-4 w-4 ml-2" />
              צפייה בהגשות
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
                const data = {
                    id: assignment.id,
                    title: assignment.title,
                    course_id: assignment.course_id,
                    script: assignment.audio_script || assignment.description || "",
                    filename: `audio_${assignment.id}.mp3`
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `script_${assignment.id}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success('קובץ תמליל הורד');
            }}>
              <Download className="h-4 w-4 ml-2" />
              הורד סקריפט (JSON)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(assignment)}>
              <Edit className="h-4 w-4 ml-2" />
              עריכה
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleStatus(assignment)}>
              {assignment.status === 'open' ? (
                <>
                  <XCircle className="h-4 w-4 ml-2" />
                  סגירה
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 ml-2" />
                  פתיחה
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(assignment)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 ml-2" />
              מחיקה
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}