import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { 
    Globe, 
    Copy, 
    ExternalLink, 
    Search, 
    BookOpen, 
    FileText, 
    Users, 
    Eye,
    TrendingUp,
    Activity,
    MousePointerClick,
    Clock
} from 'lucide-react';

export default function PublicResourcesMonitor() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('courses');

    const { data: courses } = useQuery({
        queryKey: ['publicCourses'],
        queryFn: () => base44.entities.Course.list()
    });

    const { data: assignments } = useQuery({
        queryKey: ['publicAssignments'],
        queryFn: () => base44.entities.Assignment.list()
    });

    const { data: students } = useQuery({
        queryKey: ['publicStudents'],
        queryFn: () => base44.entities.Student.list()
    });

    // Fetch Activity Logs for Analytics
    const { data: activityLogs } = useQuery({
        queryKey: ['publicActivityLogs'],
        queryFn: async () => {
            const logs = await base44.asServiceRole.entities.StudentActivityLog.list('-created_date', 10000);
            return logs;
        }
    });

    // Calculate Analytics
    const analytics = React.useMemo(() => {
        if (!activityLogs) return null;

        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Filter view actions only
        const viewLogs = activityLogs.filter(log => log.action === 'view');

        // Total views
        const totalViews = viewLogs.length;

        // Views in last 24 hours
        const views24h = viewLogs.filter(log => new Date(log.created_date) > last24h).length;

        // Views in last 7 days
        const views7d = viewLogs.filter(log => new Date(log.created_date) > last7d).length;

        // Unique visitors (by session_id or student_id)
        const uniqueVisitors = new Set(viewLogs.map(log => log.session_id || log.student_id)).size;

        // Anonymous vs Registered
        const anonymousViews = viewLogs.filter(log => !log.student_id || log.student_id === 'anonymous').length;
        const registeredViews = totalViews - anonymousViews;

        // Most viewed resources
        const resourceViews = {};
        viewLogs.forEach(log => {
            const key = `${log.resource_type}:${log.resource_id}`;
            resourceViews[key] = (resourceViews[key] || 0) + 1;
        });

        const topResources = Object.entries(resourceViews)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([key, count]) => {
                const [type, id] = key.split(':');
                return { type, id, count };
            });

        return {
            totalViews,
            views24h,
            views7d,
            uniqueVisitors,
            anonymousViews,
            registeredViews,
            topResources
        };
    }, [activityLogs]);

    const generatePublicLink = (type, id) => {
        return `${window.location.origin}${createPageUrl('PublicView')}?type=${type}&id=${id}`;
    };

    const copyLink = (link) => {
        navigator.clipboard.writeText(link);
        toast.success('הקישור הועתק ללוח');
    };

    const openLink = (link) => {
        window.open(link, '_blank');
    };

    const filterItems = (items) => {
        if (!items) return [];
        return items.filter(item => 
            (item.name || item.title || item.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const renderResourceTable = (items, type, Icon) => (
        <div className="rounded-md border">
            <div className="bg-slate-50 p-3 border-b grid grid-cols-12 gap-4 text-sm font-medium text-slate-500">
                <div className="col-span-4">שם המשאב</div>
                <div className="col-span-2">סטטוס</div>
                <div className="col-span-3">מזהה</div>
                <div className="col-span-3 text-left">פעולות</div>
            </div>
            <div className="divide-y max-h-[400px] overflow-y-auto">
                {filterItems(items).map(item => {
                    const link = generatePublicLink(type, item.id);
                    return (
                        <div key={item.id} className="p-3 grid grid-cols-12 gap-4 items-center text-sm hover:bg-slate-50 transition-colors">
                            <div className="col-span-4 font-medium flex items-center gap-2">
                                <Icon className="w-4 h-4 text-slate-400" />
                                {item.name || item.title || item.full_name}
                            </div>
                            <div className="col-span-2">
                                <Badge variant="outline" className="bg-slate-50">
                                    {item.status || 'פעיל'}
                                </Badge>
                            </div>
                            <div className="col-span-3 text-slate-400 text-xs font-mono truncate">
                                {item.id}
                            </div>
                            <div className="col-span-3 flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => copyLink(link)} title="העתק קישור">
                                    <Copy className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => openLink(link)} title="פתח קישור">
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
                {filterItems(items).length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        לא נמצאו תוצאות
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-indigo-600" />
                        ניטור דפים ציבוריים
                    </CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="חיפוש משאבים..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-9"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Analytics Dashboard */}
                {analytics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 border rounded-lg bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Eye className="w-5 h-5 text-violet-600" />
                                <p className="text-sm font-medium text-violet-900">צפיות כוללות</p>
                            </div>
                            <p className="text-3xl font-bold text-violet-700">{analytics.totalViews.toLocaleString()}</p>
                            <p className="text-xs text-violet-600 mt-1">מתחילת המעקב</p>
                        </div>

                        <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                <p className="text-sm font-medium text-blue-900">צפיות (24 שעות)</p>
                            </div>
                            <p className="text-3xl font-bold text-blue-700">{analytics.views24h.toLocaleString()}</p>
                            <p className="text-xs text-blue-600 mt-1">ביום האחרון</p>
                        </div>

                        <div className="p-4 border rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-5 h-5 text-emerald-600" />
                                <p className="text-sm font-medium text-emerald-900">מבקרים ייחודיים</p>
                            </div>
                            <p className="text-3xl font-bold text-emerald-700">{analytics.uniqueVisitors.toLocaleString()}</p>
                            <p className="text-xs text-emerald-600 mt-1">מזוהים ואנונימיים</p>
                        </div>

                        <div className="p-4 border rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                            <div className="flex items-center gap-2 mb-2">
                                <MousePointerClick className="w-5 h-5 text-amber-600" />
                                <p className="text-sm font-medium text-amber-900">משתמשים אנונימיים</p>
                            </div>
                            <p className="text-3xl font-bold text-amber-700">{analytics.anonymousViews.toLocaleString()}</p>
                            <p className="text-xs text-amber-600 mt-1">{analytics.registeredViews.toLocaleString()} רשומים</p>
                        </div>
                    </div>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full justify-start mb-4">
                        <TabsTrigger value="analytics" className="flex-1">
                            <TrendingUp className="w-4 h-4 ml-2" />
                            דוח כניסות
                        </TabsTrigger>
                        <TabsTrigger value="courses" className="flex-1">
                            <BookOpen className="w-4 h-4 ml-2" />
                            קורסים ({courses?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="assignments" className="flex-1">
                            <FileText className="w-4 h-4 ml-2" />
                            מטלות ({assignments?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="students" className="flex-1">
                            <Users className="w-4 h-4 ml-2" />
                            תלמידים ({students?.length || 0})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="analytics">
                        {analytics && (
                            <div className="space-y-6">
                                {/* Top Viewed Resources */}
                                <div className="rounded-md border">
                                    <div className="bg-slate-50 p-3 border-b">
                                        <h3 className="font-semibold text-sm flex items-center gap-2">
                                            <Eye className="w-4 h-4 text-indigo-600" />
                                            המשאבים הנצפים ביותר
                                        </h3>
                                    </div>
                                    <div className="divide-y max-h-[400px] overflow-y-auto">
                                        {analytics.topResources.map((resource, idx) => (
                                            <div key={`${resource.type}-${resource.id}`} className="p-3 flex justify-between items-center hover:bg-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{resource.type}</p>
                                                        <p className="text-xs text-slate-500 font-mono">{resource.id}</p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-indigo-100 text-indigo-700 font-bold">
                                                    {resource.count.toLocaleString()} צפיות
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Additional Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 border rounded-lg bg-slate-50">
                                        <p className="text-sm text-slate-500 mb-1">שיעור כניסות אנונימיות</p>
                                        <p className="text-2xl font-bold text-slate-800">
                                            {analytics.totalViews > 0 ? Math.round((analytics.anonymousViews / analytics.totalViews) * 100) : 0}%
                                        </p>
                                    </div>
                                    <div className="p-4 border rounded-lg bg-slate-50">
                                        <p className="text-sm text-slate-500 mb-1">ממוצע צפיות ביום (7 ימים)</p>
                                        <p className="text-2xl font-bold text-slate-800">
                                            {Math.round(analytics.views7d / 7).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="courses">
                        {renderResourceTable(courses, 'course', BookOpen)}
                    </TabsContent>
                    <TabsContent value="assignments">
                        {renderResourceTable(assignments, 'assignment', FileText)}
                    </TabsContent>
                    <TabsContent value="students">
                        {renderResourceTable(students, 'student', Users)}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}