import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Loader2, Music, ExternalLink } from 'lucide-react';
import AudioPlayer from '@/components/common/AudioPlayer';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

export default function RecentAudioFiles({ organizationId }) {
    const { data: assignments, isLoading } = useQuery({
        queryKey: ['recent_audio_assignments', organizationId],
        queryFn: async () => {
            if (!organizationId) return [];
            // Fetch assignments that likely have audio (updated recently)
            // We can't filter by non-empty audio_url easily in all backends, 
            // so we fetch recent assignments and filter client side.
            const recents = await base44.entities.Assignment.filter({ 
                organization_id: organizationId 
            }, '-updated_date', 50);
            
            return recents
                .filter(a => a.audio_url)
                .slice(0, 5); // Take top 5
        },
        enabled: !!organizationId,
        refetchInterval: 5000 // Poll every 5 seconds for real-time updates
    });

    if (isLoading) {
        return (
            <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6 flex justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </CardContent>
            </Card>
        );
    }

    if (!assignments || assignments.length === 0) {
        return null;
    }

    return (
        <div>
            <CardHeader className="pb-3 border-b border-slate-50 bg-gradient-to-r from-indigo-50 to-white">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-900">
                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                        <Mic className="w-4 h-4 text-indigo-600" />
                    </div>
                    הפקות אודיו חדשות
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                    {assignments.map((assignment) => (
                        <div key={assignment.id} className="p-3 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-start gap-2">
                                    <div className="mt-1">
                                        <Music className="w-3 h-3 text-slate-400" />
                                    </div>
                                    <div>
                                        <Link to={`${createPageUrl('AssignmentProfile')}?id=${assignment.id}`} className="group">
                                            <h4 className="text-sm font-medium text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                                                {assignment.title}
                                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </h4>
                                        </Link>
                                        <p className="text-[10px] text-slate-500">
                                            {new Date(assignment.updated_date || assignment.created_date).toLocaleString('he-IL', { 
                                                timeZone: 'Asia/Jerusalem',
                                                dateStyle: 'short',
                                                timeStyle: 'short'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="ltr">
                                <AudioPlayer 
                                    src={assignment.audio_url} 
                                    minimal={true} 
                                    title={assignment.title}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </div>
    );
}