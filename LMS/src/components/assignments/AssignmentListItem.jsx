import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { format, isPast, isValid } from 'date-fns';
import { he } from 'date-fns/locale';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  FileText,
  Share2,
  Calendar,
  Sparkles,
  Mic,
  Download
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

export default function AssignmentListItem({ 
  assignment, 
  courseName,
  submissionStats,
  onEdit, 
  onDelete,
  onToggleStatus,
  onShare,
  onViewSubmissions,
  isSelected,
  onSelect
}) {
  const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
  const isValidDate = dueDate && !isNaN(dueDate.getTime());
  const isOverdue = isValidDate && isPast(dueDate) && assignment.status === 'open';

  // Determine if assignment is AI enriched
  const isEnriched = (assignment.key_concepts && assignment.key_concepts.length > 0) || 
                     (assignment.resource_links && assignment.resource_links.length > 0) ||
                     (assignment.content_data && Object.keys(assignment.content_data).length > 0) ||
                     assignment.audio_url;

  return (
    <tr className={`group hover:bg-slate-50/80 transition-colors border-b last:border-0 ${assignment.status === 'closed' ? 'bg-slate-50/50' : ''}`}>
      <td className="p-4 w-[50px]">
        <Checkbox 
          checked={isSelected}
          onCheckedChange={onSelect}
        />
      </td>
      <td className="p-4">
        <div className="flex flex-col">
          <Link 
            to={`${createPageUrl('AssignmentProfile')}?id=${assignment.id}`}
            className="font-medium text-slate-800 hover:text-indigo-600 transition-colors flex items-center gap-2"
          >
            {assignment.title}
            {isEnriched && (
               <TooltipProvider>
                 <Tooltip>
                   <TooltipTrigger>
                     <Sparkles className="w-3 h-3 text-purple-500" />
                   </TooltipTrigger>
                   <TooltipContent><p>מועשר ב-AI</p></TooltipContent>
                 </Tooltip>
               </TooltipProvider>
            )}
            {assignment.audio_url && (
                <TooltipProvider>
                 <Tooltip>
                   <TooltipTrigger>
                     <Mic className="w-3 h-3 text-indigo-500" />
                   </TooltipTrigger>
                   <TooltipContent><p>כולל הנחיה קולית</p></TooltipContent>
                 </Tooltip>
               </TooltipProvider>
            )}
          </Link>
          {assignment.status === 'closed' && <span className="text-xs text-slate-400">סגור</span>}
        </div>
      </td>
      <td className="p-4 text-slate-600">
        {courseName}
      </td>
      <td className="p-4">
        <Badge variant="outline" className={`${typeColors[assignment.type]} border-0`}>
          {typeLabels[assignment.type]}
        </Badge>
      </td>
      <td className="p-4">
        <div className={`flex items-center gap-1.5 text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
           <Calendar className="w-3.5 h-3.5" />
           {isValidDate ? format(dueDate, 'dd/MM/yyyy') : '-'}
        </div>
      </td>
      <td className="p-4">
        {submissionStats ? (
           <div className="flex items-center gap-2 text-sm">
             <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-emerald-500 rounded-full"
                 style={{ width: `${(submissionStats.submitted / submissionStats.total) * 100}%` }}
               />
             </div>
             <span className="text-slate-500 text-xs">
               {submissionStats.submitted}/{submissionStats.total}
             </span>
           </div>
        ) : '-'}
      </td>
      <td className="p-4">
         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                onClick={() => onToggleStatus(assignment)}
                title={assignment.status === 'open' ? 'סגור מטלה' : 'פתח מטלה'}
            >
                {assignment.status === 'open' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            </Button>
            
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
      </td>
    </tr>
  );
}