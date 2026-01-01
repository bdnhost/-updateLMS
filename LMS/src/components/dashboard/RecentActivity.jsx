import React from 'react';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { 
  UserPlus, 
  ClipboardCheck, 
  FileText, 
  Bell,
  Clock
} from 'lucide-react';

const activityIcons = {
  attendance: ClipboardCheck,
  student: UserPlus,
  assignment: FileText,
  announcement: Bell,
};

const activityColors = {
  attendance: 'bg-emerald-50 text-emerald-600',
  student: 'bg-blue-50 text-blue-600',
  assignment: 'bg-violet-50 text-violet-600',
  announcement: 'bg-orange-50 text-orange-600',
};

export default function RecentActivity({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <Card className="p-6 bg-white border-0 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">פעילות אחרונה</h3>
        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
          <Clock className="h-12 w-12 mb-3" />
          <p>אין פעילות אחרונה להצגה</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-0 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">פעילות אחרונה</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type] || Clock;
          const colorClass = activityColors[activity.type] || 'bg-slate-50 text-slate-600';
          
          // Determine Link Target
          let linkTarget = null;
          if (activity.type === 'student' && activity.entity_id) {
              linkTarget = `${createPageUrl('StudentProfile')}?id=${activity.entity_id}`;
          } else if (activity.type === 'assignment' && activity.entity_id) {
              linkTarget = `${createPageUrl('AssignmentProfile')}?id=${activity.entity_id}`;
          } else if (activity.course_id) {
              linkTarget = `${createPageUrl('CourseProfile')}?id=${activity.course_id}`;
          }

          const Content = () => (
            <div className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${linkTarget ? 'hover:bg-slate-50 cursor-pointer group' : ''}`}>
              <div className={`p-2 rounded-lg ${colorClass} ${linkTarget ? 'group-hover:scale-110 transition-transform' : ''}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    {activity.course_name && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                            {activity.course_name}
                        </span>
                    )}
                    <span className="text-xs text-slate-400">
                        {format(new Date(activity.date), 'dd/MM/yyyy HH:mm', { locale: he })}
                    </span>
                </div>
                <p className={`text-sm text-slate-700 leading-tight ${linkTarget ? 'group-hover:text-violet-700' : ''}`}>{activity.message}</p>
              </div>
            </div>
          );

          return (
            <div key={index}>
                {linkTarget ? (
                    <Link to={linkTarget} className="block">
                        <Content />
                    </Link>
                ) : (
                    <Content />
                )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}