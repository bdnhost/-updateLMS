import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, Activity, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PublicViewAnalytics({ courseId }) {
    const { data: analytics, isLoading } = useQuery({
        queryKey: ['publicViewAnalytics', courseId],
        queryFn: async () => {
            // Fetch all activity logs for this course
            const logs = await base44.entities.StudentActivityLog.filter(
                { resource_type: 'course', resource_id: courseId },
                '-created_date',
                1000
            );

            const now = Date.now();
            const fiveMinutesAgo = now - 5 * 60 * 1000;
            const oneDayAgo = now - 24 * 60 * 60 * 1000;
            const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

            // Count unique viewers NOW (last 5 minutes with recent update)
            // Use updated_date for heartbeats (more accurate for live tracking)
            const recentLogs = logs.filter(log => {
                const checkTime = log.updated_date ? new Date(log.updated_date).getTime() : new Date(log.created_date).getTime();
                return checkTime > fiveMinutesAgo;
            });
            const viewingNow = new Set(recentLogs.map(log => log.student_id || log.session_id)).size;

            // Total unique viewers all time (count both student_id and session_id)
            const totalViewers = new Set(logs.map(log => log.student_id || log.session_id)).size;

            // Last 24h unique viewers
            const last24hLogs = logs.filter(log => new Date(log.created_date).getTime() > oneDayAgo);
            const viewers24h = new Set(last24hLogs.map(log => log.student_id || log.session_id)).size;

            // Last 7 days unique viewers
            const last7dLogs = logs.filter(log => new Date(log.created_date).getTime() > oneWeekAgo);
            const viewers7d = new Set(last7dLogs.map(log => log.student_id || log.session_id)).size;

            // Total engagement time (sum of all duration_seconds)
            const totalEngagementMinutes = Math.round(
                logs.reduce((sum, log) => sum + (log.duration_seconds || 0), 0) / 60
            );

            return {
                viewingNow,
                totalViewers,
                viewers24h,
                viewers7d,
                totalEngagementMinutes,
                recentActivity: logs.slice(0, 10)
            };
        },
        enabled: !!courseId,
        refetchInterval: 15000 // Refresh every 15 seconds for live data
    });

    if (isLoading) {
        return (
            <Card className="border-0 shadow-sm">
                <CardContent className="p-6 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                </CardContent>
            </Card>
        );
    }

    const stats = [
        {
            label: 'צופים כעת',
            value: analytics?.viewingNow || 0,
            icon: Eye,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            pulse: analytics?.viewingNow > 0
        },
        {
            label: 'צפו ב-24 שעות',
            value: analytics?.viewers24h || 0,
            icon: Clock,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            label: 'צפו השבוע',
            value: analytics?.viewers7d || 0,
            icon: TrendingUp,
            color: 'text-violet-600',
            bgColor: 'bg-violet-50'
        },
        {
            label: 'סה"כ צפיות',
            value: analytics?.totalViewers || 0,
            icon: Users,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50'
        }
    ];

    return (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-violet-50/30">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                    <Activity className="w-5 h-5 text-violet-600" />
                    ניטור דף ציבורי בזמן אמת
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`relative p-4 rounded-xl border border-slate-100 bg-white hover:shadow-md transition-all ${stat.pulse ? 'animate-pulse' : ''}`}
                        >
                            <div className={`absolute top-2 right-2 p-2 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                            <div className="mt-8">
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-2xl font-bold ${stat.color}`}>
                                        {stat.value}
                                    </span>
                                    {stat.pulse && stat.value > 0 && (
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Engagement Summary */}
                {analytics?.totalEngagementMinutes > 0 && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-amber-600 font-medium">זמן שהייה כולל</p>
                            <p className="text-lg font-bold text-amber-800">
                                {analytics.totalEngagementMinutes} דקות
                            </p>
                        </div>
                    </div>
                )}

                {/* Live Indicator */}
                {analytics?.viewingNow > 0 && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-full border border-green-200">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="font-medium">
                            {analytics.viewingNow} {analytics.viewingNow === 1 ? 'תלמיד צופה' : 'תלמידים צופים'} כרגע
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}