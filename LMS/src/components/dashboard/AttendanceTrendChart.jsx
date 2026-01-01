import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

export default function AttendanceTrendChart({ organizationId }) {
    const { data: attendanceData, isLoading } = useQuery({
        queryKey: ['attendanceTrend', organizationId],
        queryFn: async () => {
            const last30Days = subDays(new Date(), 30);
            const attendance = await base44.entities.Attendance.filter({
                organization_id: organizationId,
                date: { $gte: format(last30Days, 'yyyy-MM-dd') }
            }, '-date', 500);

            // Group by date
            const byDate = {};
            attendance.forEach(a => {
                if (!byDate[a.date]) {
                    byDate[a.date] = { date: a.date, present: 0, absent: 0, total: 0 };
                }
                byDate[a.date].total++;
                if (a.status === 'present' || a.status === 'late') {
                    byDate[a.date].present++;
                } else {
                    byDate[a.date].absent++;
                }
            });

            // Convert to array and calculate percentage
            const data = Object.values(byDate)
                .map(d => ({
                    date: format(new Date(d.date), 'dd/MM'),
                    נוכחות: Math.round((d.present / d.total) * 100),
                    היעדרות: Math.round((d.absent / d.total) * 100)
                }))
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(-14); // Last 14 days with data

            return data;
        },
        enabled: !!organizationId
    });

    if (isLoading) {
        return (
            <Card className="border-0 shadow-sm h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-sm h-[400px] flex flex-col">
            <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    מגמת נוכחות (14 ימים אחרונים)
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            stroke="#cbd5e1"
                        />
                        <YAxis 
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            stroke="#cbd5e1"
                            domain={[0, 100]}
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
                            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="נוכחות" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            dot={{ r: 3, fill: '#10b981' }}
                            activeDot={{ r: 5 }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="היעדרות" 
                            stroke="#ef4444" 
                            strokeWidth={2}
                            dot={{ r: 3, fill: '#ef4444' }}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}