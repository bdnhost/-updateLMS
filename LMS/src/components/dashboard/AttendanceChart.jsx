import React from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const statusLabels = {
  present: 'נוכח',
  late: 'איחור',
  absent: 'נעדר',
  excused: 'חופש מאושר',
};

export default function AttendanceChart({ data }) {
  const chartData = data ? [
    { name: 'נוכח', value: data.present || 0 },
    { name: 'איחור', value: data.late || 0 },
    { name: 'נעדר', value: data.absent || 0 },
    { name: 'חופש מאושר', value: data.excused || 0 },
  ].filter(d => d.value > 0) : [];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <Card className="p-6 bg-white border-0 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">סטטיסטיקת נוכחות</h3>
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <p>אין נתוני נוכחות להצגה</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-0 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">סטטיסטיקת נוכחות</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value} תלמידים`, '']}
              contentStyle={{ direction: 'rtl' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => <span className="text-sm text-slate-600">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}