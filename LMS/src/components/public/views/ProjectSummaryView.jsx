import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

export default function ProjectSummaryView({ resource, contentData }) {
    const rawMilestones = contentData?.milestones;
    const milestones = Array.isArray(rawMilestones) ? rawMilestones : [];
    const guidelines = contentData?.guidelines || '';
    const [expandedMilestones, setExpandedMilestones] = React.useState([]);

    const toggleExpand = (index) => {
        setExpandedMilestones(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    if (!milestones || milestones.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500">
                לא הוגדרו אבני דרך לפרויקט זה.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {guidelines && (
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-800">
                    <span className="font-bold block mb-1">הנחיות כלליות:</span>
                    <p className="whitespace-pre-wrap">{guidelines}</p>
                </div>
            )}

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    אבני דרך לפרויקט
                </h3>
                {milestones.map((milestone, index) => {
                    const isExpanded = expandedMilestones.includes(index);
                    return (
                        <Card 
                            key={milestone.id || index} 
                            className="transition-all duration-300 border-l-4 border-l-slate-200"
                        >
                            <CardHeader 
                                className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => toggleExpand(index)}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-slate-100 text-slate-600">
                                            {index + 1}
                                        </div>
                                        <CardTitle className="text-base">
                                            {milestone.title}
                                        </CardTitle>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600">
                                            {milestone.percentage}%
                                        </span>
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </div>
                                </div>
                            </CardHeader>
                            
                            {isExpanded && (
                                <CardContent className="p-4 pt-0 animate-in slide-in-from-top-2">
                                    <div className="pl-9 space-y-4">
                                        <p className="text-slate-600 text-sm whitespace-pre-wrap">
                                            {milestone.description}
                                        </p>
                                        
                                        {milestone.dueDate && (
                                            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 w-fit px-2 py-1 rounded">
                                                <Clock className="w-3 h-3" />
                                                תאריך יעד: {format(new Date(milestone.dueDate), 'dd/MM/yyyy')}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}