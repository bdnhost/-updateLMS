import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2, ExternalLink, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';

export default function RecentAssignments({ organizationId }) {
    const { data: assignments, isLoading } = useQuery({
        queryKey: ['recent_assignments', organizationId],
        queryFn: async () => {
            if (!organizationId) return [];
            const recents = await base44.entities.Assignment.filter({ 
                organization_id: organizationId 
            }, '-created_date', 5);
            return recents;
        },
        enabled: !!organizationId
    });

    if (isLoading) {
        return (
            <div className="p-6 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!assignments || assignments.length === 0) {
        return (
            <div className="p-6 text-center text-slate-400 text-sm">
                אין מטלות חדשות
            </div>
        );
    }

    return (
        <div>
            <CardHeader className="pb-3 border-b border-slate-50 bg-gradient-to-r from-violet-50 to-white">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-violet-900">
                    <div className="p-1.5 bg-violet-100 rounded-lg">
                        <FileText className="w-4 h-4 text-violet-600" />
                    </div>
                    מטלות חדשות
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                    {assignments.map((assignment) => (
                        <Link 
                            key={assignment.id} 
                            to={`${createPageUrl('AssignmentProfile')}?id=${assignment.id}`}
                            className="p-3 hover:bg-slate-50 transition-colors block group"
                        >
                            <div className="flex items-start gap-2 mb-1">
                                <FileText className="w-3.5 h-3.5 text-violet-500 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-slate-800 line-clamp-1 group-hover:text-violet-600 transition-colors flex items-center gap-1">
                                        {assignment.title}
                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="text-[10px] px-1.5 h-4">
                                            {assignment.type === 'exam' ? 'מבחן' : assignment.type === 'quiz' ? 'בוחן' : 'מטלה'}
                                        </Badge>
                                        {assignment.due_date && (
                                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {assignment.due_date}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </div>
    );
}