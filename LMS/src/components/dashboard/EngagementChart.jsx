import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Eye, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function EngagementChart({ organizationId }) {
  const { data: activityLogs } = useQuery({
    queryKey: ['engagementData', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      // Get only students from this organization
      const orgStudents = await base44.entities.Student.filter({ organization_id: organizationId });
      const studentIds = orgStudents.map(s => s.id);
      
      if (studentIds.length === 0) return [];
      
      // Fetch activity logs only for these students
      const allLogs = await base44.entities.StudentActivityLog.list('-created_date', 1000);
      return allLogs.filter(log => studentIds.includes(log.student_id));
    },
    enabled: !!organizationId
  });

  const { data: students } = useQuery({
    queryKey: ['students', organizationId],
    queryFn: () => base44.entities.Student.filter({ organization_id: organizationId }),
    enabled: !!organizationId
  });

  const { data: assignments } = useQuery({
    queryKey: ['assignments', organizationId],
    queryFn: () => base44.entities.Assignment.filter({ organization_id: organizationId }),
    enabled: !!organizationId
  });

  const chartData = React.useMemo(() => {
    if (!activityLogs || activityLogs.length === 0) return [];

    // Group by date (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const dataByDay = last7Days.map(day => {
      const dayLogs = activityLogs.filter(log => {
        const logDate = new Date(log.created_date).toISOString().split('T')[0];
        return logDate === day;
      });

      const uniqueStudents = new Set(dayLogs.map(log => log.student_id)).size;
      const views = dayLogs.filter(log => log.action === 'view').length;
      const interactions = dayLogs.filter(log => log.action === 'interaction').length;

      return {
        date: format(new Date(day), 'dd/MM', { locale: he }),
        students: uniqueStudents,
        views,
        interactions
      };
    });

    return dataByDay;
  }, [activityLogs]);

  const stats = React.useMemo(() => {
    const totalViews = activityLogs?.length || 0;
    const uniqueStudents = new Set(activityLogs?.map(log => log.student_id) || []).size;
    const mostViewedResource = activityLogs?.reduce((acc, log) => {
      acc[log.resource_id] = (acc[log.resource_id] || 0) + 1;
      return acc;
    }, {});
    
    const topResource = mostViewedResource ? 
      Object.entries(mostViewedResource).sort(([,a], [,b]) => b - a)[0] : null;

    return {
      totalViews,
      uniqueStudents,
      activeStudentsPercent: students?.length > 0 ? Math.round((uniqueStudents / students.length) * 100) : 0,
      topResourceViews: topResource?.[1] || 0
    };
  }, [activityLogs, students]);

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-3 border-b border-slate-50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
            <TrendingUp className="w-4 h-4 text-violet-500" />
            מעורבות תלמידים (7 ימים)
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-violet-50 text-violet-600 border-violet-100 text-xs">
              <Eye className="w-3 h-3 ml-1" />
              {stats.totalViews} צפיות
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 text-xs">
              <Users className="w-3 h-3 ml-1" />
              {stats.uniqueStudents} פעילים
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <TrendingUp className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">אין מספיק נתונים להצגת תרשים</p>
            <p className="text-xs text-slate-400 mt-1">נתונים יופיעו ברגע שתלמידים יתחילו לצפות בתכנים</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px'
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Bar 
                dataKey="students" 
                name="תלמידים פעילים"
                fill="#8b5cf6" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="views" 
                name="צפיות"
                fill="#06b6d4" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">{stats.activeStudentsPercent}%</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">מעורבות כללית</div>
          </div>
          <div className="text-center border-x border-slate-100">
            <div className="text-2xl font-bold text-slate-800">{stats.totalViews}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">צפיות סה"כ</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">{stats.topResourceViews}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">תוכן פופולרי</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}