import React from 'react';
import { Card } from '@/components/ui/card';

export default function StatsCard({ title, value, icon: Icon, color, trend }) {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600',
    green: 'bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600',
    purple: 'bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600',
    orange: 'bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600',
    red: 'bg-gradient-to-br from-red-100 to-rose-100 text-red-600',
  };

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-transparent hover:border-purple-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend > 0 ? '+' : ''}{trend}% מהשבוע שעבר
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.blue} shadow-md`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}