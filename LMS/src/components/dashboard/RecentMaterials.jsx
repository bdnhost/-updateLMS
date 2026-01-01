import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Loader2, ExternalLink, FileText, Video, Link as LinkIcon, Presentation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';

const typeIcons = {
    presentation: Presentation,
    document: FileText,
    video: Video,
    link: LinkIcon,
    other: FileText
};

export default function RecentMaterials({ organizationId }) {
    const { data: materials, isLoading } = useQuery({
        queryKey: ['recent_materials', organizationId],
        queryFn: async () => {
            if (!organizationId) return [];
            const recents = await base44.entities.Material.filter({ 
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

    if (!materials || materials.length === 0) {
        return (
            <div className="p-6 text-center text-slate-400 text-sm">
                אין חומרי לימוד חדשים
            </div>
        );
    }

    return (
        <div>
            <CardHeader className="pb-3 border-b border-slate-50 bg-gradient-to-r from-amber-50 to-white">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-900">
                    <div className="p-1.5 bg-amber-100 rounded-lg">
                        <FolderOpen className="w-4 h-4 text-amber-600" />
                    </div>
                    חומרי לימוד חדשים
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                    {materials.map((material) => {
                        const Icon = typeIcons[material.type] || FileText;
                        return (
                            <a
                                key={material.id}
                                href={material.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 hover:bg-slate-50 transition-colors block group"
                            >
                                <div className="flex items-start gap-2">
                                    <Icon className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-slate-800 line-clamp-1 group-hover:text-amber-600 transition-colors flex items-center gap-1">
                                            {material.title}
                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="secondary" className="text-[10px] px-1.5 h-4">
                                                {material.type === 'presentation' ? 'מצגת' : 
                                                 material.type === 'video' ? 'וידאו' :
                                                 material.type === 'link' ? 'קישור' : 'מסמך'}
                                            </Badge>
                                            <span className="text-[10px] text-slate-500">
                                                {new Date(material.created_date).toLocaleString('he-IL', { 
                                                    timeZone: 'Asia/Jerusalem',
                                                    dateStyle: 'short',
                                                    timeStyle: 'short'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </CardContent>
        </div>
    );
}