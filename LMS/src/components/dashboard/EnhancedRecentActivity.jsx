import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { 
  UserPlus, 
  ClipboardCheck, 
  FileText, 
  Bell,
  Clock,
  Eye,
  Users,
  GraduationCap,
  Calendar,
  FolderOpen,
  MessageSquare,
  BookOpen,
  Activity
} from 'lucide-react';

const activityIcons = {
  attendance: ClipboardCheck,
  student: UserPlus,
  assignment: FileText,
  announcement: Bell,
  course: GraduationCap,
  session: Calendar,
  material: FolderOpen,
  message: MessageSquare,
  student_view: Eye,
  student_activity: BookOpen
};

const activityColors = {
  attendance: 'bg-emerald-50 text-emerald-600',
  student: 'bg-blue-50 text-blue-600',
  assignment: 'bg-violet-50 text-violet-600',
  announcement: 'bg-orange-50 text-orange-600',
  course: 'bg-indigo-50 text-indigo-600',
  session: 'bg-pink-50 text-pink-600',
  material: 'bg-teal-50 text-teal-600',
  message: 'bg-amber-50 text-amber-600',
  student_view: 'bg-cyan-50 text-cyan-600',
  student_activity: 'bg-purple-50 text-purple-600'
};

export default function EnhancedRecentActivity({ organizationId }) {
  const { data: activityLogs, isLoading } = useQuery({
    queryKey: ['studentActivityLogs', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      // Get only students from this organization
      const orgStudents = await base44.entities.Student.filter({ organization_id: organizationId });
      const studentIds = orgStudents.map(s => s.id);
      
      if (studentIds.length === 0) return [];
      
      // Fetch activity logs only for these students
      const allLogs = await base44.entities.StudentActivityLog.list('-created_date', 100);
      return allLogs.filter(log => 
        studentIds.includes(log.student_id) &&
        ['course', 'session', 'assignment', 'material'].includes(log.resource_type)
      ).slice(0, 20);
    },
    enabled: !!organizationId,
    refetchInterval: 30000
  });

  const { data: auditLogs, isLoading: auditLoading } = useQuery({
    queryKey: ['auditLogs', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      try {
        return base44.entities.AuditLog.filter(
          { organization_id: organizationId },
          '-created_date',
          20
        );
      } catch (e) {
        console.log("AuditLog not accessible or doesn't exist");
        return [];
      }
    },
    enabled: !!organizationId
  });

  const { data: students } = useQuery({
    queryKey: ['students', organizationId],
    queryFn: () => base44.entities.Student.filter({ organization_id: organizationId }),
    enabled: !!organizationId
  });

  const { data: courses } = useQuery({
    queryKey: ['courses', organizationId],
    queryFn: () => base44.entities.Course.filter({ organization_id: organizationId }),
    enabled: !!organizationId
  });

  const { data: assignments } = useQuery({
    queryKey: ['assignments', organizationId],
    queryFn: () => base44.entities.Assignment.filter({ organization_id: organizationId }),
    enabled: !!organizationId
  });

  const { data: materials } = useQuery({
    queryKey: ['materials', organizationId],
    queryFn: () => base44.entities.Material.filter({ organization_id: organizationId }),
    enabled: !!organizationId
  });

  const combinedActivities = React.useMemo(() => {
    const combined = [];

    // Student Activity Logs
    if (activityLogs) {
      activityLogs.forEach(log => {
        const student = students?.find(s => s.id === log.student_id);
        let resourceName = '';
        let type = 'student_activity';

        if (log.resource_type === 'course') {
          resourceName = courses?.find(c => c.id === log.resource_id)?.name || 'קורס';
          type = 'course';
        } else if (log.resource_type === 'session') {
          type = 'session';
          resourceName = 'מפגש';
        } else if (log.resource_type === 'assignment') {
          resourceName = assignments?.find(a => a.id === log.resource_id)?.title || 'מטלה';
          type = 'assignment';
        } else if (log.resource_type === 'material') {
          resourceName = materials?.find(m => m.id === log.resource_id)?.title || 'חומר לימוד';
          type = 'material';
        }

        combined.push({
          type,
          message: `${student?.full_name || 'תלמיד'} צפה ב${resourceName}`,
          date: log.created_date,
          entity_id: log.resource_id,
          student_name: student?.full_name
        });
      });
    }

    // Audit Logs (entity creation)
    if (auditLogs) {
      auditLogs.forEach(log => {
        let type = 'student';
        let icon = UserPlus;
        
        if (log.entity_type === 'Student') {
          type = 'student';
          combined.push({
            type,
            message: `תלמיד חדש נרשם: ${log.entity_name || 'תלמיד'}`,
            date: log.created_date,
            entity_id: log.entity_id
          });
        } else if (log.entity_type === 'Assignment') {
          type = 'assignment';
          combined.push({
            type,
            message: `מטלה חדשה נוצרה: ${log.entity_name || 'מטלה'}`,
            date: log.created_date,
            entity_id: log.entity_id
          });
        } else if (log.entity_type === 'Course') {
          type = 'course';
          combined.push({
            type,
            message: `קורס חדש נוצר: ${log.entity_name || 'קורס'}`,
            date: log.created_date,
            entity_id: log.entity_id
          });
        } else if (log.entity_type === 'Material') {
          type = 'material';
          combined.push({
            type,
            message: `חומר לימוד חדש נוסף: ${log.entity_name || 'חומר'}`,
            date: log.created_date,
            entity_id: log.entity_id
          });
        }
      });
    }

    return combined.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15);
  }, [activityLogs, auditLogs, students, courses, assignments, materials]);

  if (isLoading || auditLoading) {
    return (
      <Card className="p-6 bg-white border-0 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Clock className="h-8 w-8 animate-spin text-slate-300" />
        </div>
      </Card>
    );
  }

  if (!combinedActivities || combinedActivities.length === 0) {
    return (
      <Card className="p-6 bg-white border-0 shadow-sm">
        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
          <Activity className="h-12 w-12 mb-3" />
          <p className="text-sm">אין פעילות אחרונה להצגה</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-0 shadow-sm h-[400px] flex flex-col">
      <div className="px-6 pt-6 pb-3 border-b border-slate-50">
        <h3 className="text-base font-bold text-slate-800">פעילות אחרונה</h3>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 pt-3 space-y-3">
        {combinedActivities.map((activity, index) => {
          const Icon = activityIcons[activity.type] || Clock;
          const colorClass = activityColors[activity.type] || 'bg-slate-50 text-slate-600';
          
          let linkTarget = null;
          if (activity.type === 'student' && activity.entity_id) {
              linkTarget = `${createPageUrl('StudentProfile')}?id=${activity.entity_id}`;
          } else if (activity.type === 'assignment' && activity.entity_id) {
              linkTarget = `${createPageUrl('AssignmentProfile')}?id=${activity.entity_id}`;
          } else if (activity.type === 'course' && activity.entity_id) {
              linkTarget = `${createPageUrl('CourseProfile')}?id=${activity.entity_id}`;
          } else if (activity.type === 'material' && activity.entity_id) {
              linkTarget = createPageUrl('Materials');
          }

          const Content = () => (
            <div className={`flex items-start gap-3 p-3 rounded-lg transition-all ${linkTarget ? 'hover:bg-slate-50 cursor-pointer group' : ''}`}>
              <div className={`p-2 rounded-lg ${colorClass} ${linkTarget ? 'group-hover:scale-110 transition-transform' : ''}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm text-slate-700 leading-tight ${linkTarget ? 'group-hover:text-violet-700' : ''}`}>
                  {activity.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    {activity.student_name && (
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-gradient-to-r from-blue-500 to-violet-600 text-white border-0 font-semibold">
                            {activity.student_name}
                        </Badge>
                    )}
                    <span className="text-xs text-slate-400">
                        {format(new Date(activity.date), 'dd/MM HH:mm', { locale: he })}
                    </span>
                </div>
              </div>
            </div>
          );

          return (
            <div key={index}>
                {linkTarget ? (
                    <Link to={linkTarget}>
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