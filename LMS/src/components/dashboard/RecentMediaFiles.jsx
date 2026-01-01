import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageIcon, ExternalLink, Calendar, FileText, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function RecentMediaFiles({ organizationId }) {
    const { data: mediaItems, isLoading } = useQuery({
        queryKey: ['recentMedia', organizationId],
        queryFn: async () => {
            if (!organizationId) return [];
            
            // Fetch recent items from multiple entities
            const [sessions, assignments, materials, courses] = await Promise.all([
                base44.entities.CourseSession.filter({ organization_id: organizationId }, '-updated_date', 20),
                base44.entities.Assignment.filter({ organization_id: organizationId }, '-updated_date', 20),
                base44.entities.Material.filter({ organization_id: organizationId }, '-updated_date', 20),
                base44.entities.Course.filter({ organization_id: organizationId }, '-updated_date', 20)
            ]);

            const allItems = [
                ...(sessions || []).map(i => ({ ...i, entityType: 'session', label: 'מפגש' })),
                ...(assignments || []).map(i => ({ ...i, entityType: 'assignment', label: 'מטלה' })),
                ...(materials || []).map(i => ({ ...i, entityType: 'material', label: 'חומר לימוד' })),
                ...(courses || []).map(i => ({ ...i, entityType: 'course', label: 'קורס' }))
            ];

            // Filter for items with media_url and sort by update date
            return allItems
                .filter(item => item.media_url)
                .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
                .slice(0, 4); // Top 4
        },
        enabled: !!organizationId,
        refetchInterval: 30000
    });

    if (!organizationId || (!isLoading && (!mediaItems || mediaItems.length === 0))) return null;

    return (
        <div>
            <CardHeader className="pb-3 border-b border-slate-50 bg-gradient-to-r from-indigo-50 to-white">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-900">
                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                        <ImageIcon className="w-4 h-4 text-indigo-600" />
                    </div>
                    הפקות מדיה חדשות
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="p-4 space-y-3">
                        {[1, 2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />)}
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {mediaItems.map((item) => (
                            <div key={`${item.entityType}-${item.id}`} className="p-4 hover:bg-white/80 transition-colors group">
                                <div className="flex gap-4">
                                    {/* Thumbnail */}
                                    <div className="relative w-20 h-20 shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                        <img 
                                            src={item.media_url} 
                                            alt={item.title || item.name} 
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                                        />
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                                    {item.label}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {format(new Date(item.updated_date), 'dd/MM HH:mm')}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-semibold text-slate-800 truncate" title={item.title || item.name}>
                                                {item.title || item.name}
                                            </h4>
                                        </div>
                                        
                                        <div className="flex justify-end mt-2">
                                            <Button asChild variant="ghost" size="sm" className="h-6 text-xs gap-1 hover:bg-indigo-100 hover:text-indigo-700">
                                                <a href={item.media_url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="w-3 h-3" />
                                                    הצג מדיה
                                                </a>
                                            </Button>
                                            {item.entityType === 'session' && (
                                                <Button asChild variant="ghost" size="sm" className="h-6 text-xs gap-1 hover:bg-indigo-100 hover:text-indigo-700">
                                                    <Link to={`/SessionProfile?sessionId=${item.id}&courseId=${item.course_id}`}>
                                                        <ArrowRight className="w-3 h-3" />
                                                        למפגש
                                                    </Link>
                                                </Button>
                                            )}
                                            {item.entityType === 'assignment' && (
                                                <Button asChild variant="ghost" size="sm" className="h-6 text-xs gap-1 hover:bg-indigo-100 hover:text-indigo-700">
                                                    <Link to={`/AssignmentProfile?id=${item.id}`}>
                                                        <ArrowRight className="w-3 h-3" />
                                                        למטלה
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </div>
    );
}