import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileText, Calendar, ChevronRight, Loader2, Info } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function GuideSubmissionsView({ studentId }) {
    const { data: submissions, isLoading } = useQuery({
        queryKey: ['guide_submissions', studentId],
        queryFn: async () => {
            const results = await base44.entities.GuideSubmission.filter(
                { student_id: studentId },
                '-created_date',
                100
            );
            return results || [];
        },
        enabled: !!studentId
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
            </div>
        );
    }

    if (!submissions || submissions.length === 0) {
        return (
            <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">התלמיד עדיין לא הגיש מדריכים</p>
                </CardContent>
            </Card>
        );
    }

    // Group by guide name
    const groupedSubmissions = submissions.reduce((acc, sub) => {
        if (!acc[sub.guide_name]) {
            acc[sub.guide_name] = [];
        }
        acc[sub.guide_name].push(sub);
        return acc;
    }, {});

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-violet-600" />
                    הגשות מדריכים ({submissions.length})
                </h3>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
                {Object.entries(groupedSubmissions).map(([guideName, guideSubs]) => (
                    <AccordionItem 
                        key={guideName} 
                        value={guideName}
                        className="border-0 bg-white rounded-xl shadow-sm overflow-hidden"
                    >
                        <AccordionTrigger className="px-6 py-4 hover:bg-violet-50/50">
                            <div className="flex items-center gap-3 text-right">
                                <div className="p-2 bg-violet-100 rounded-lg">
                                    <FileText className="h-4 w-4 text-violet-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{guideName}</h4>
                                    <p className="text-xs text-slate-500">
                                        {guideSubs.length} הגשות
                                    </p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                            <div className="space-y-3 pt-2">
                                {guideSubs.map((submission) => (
                                    <Card key={submission.id} className="bg-slate-50 border-slate-200">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {format(new Date(submission.created_date), 'dd/MM/yyyy HH:mm', { locale: he })}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                                        <ChevronRight className="h-3 w-3" />
                                                        <span>{submission.hierarchy_path}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <h5 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                    <Info className="h-4 w-4 text-indigo-500" />
                                                    תשובות התלמיד:
                                                </h5>
                                                <div className="bg-white rounded-lg p-4 space-y-3 border border-slate-200">
                                                    {Object.entries(submission.form_data).map(([key, value]) => (
                                                        <div key={key} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                                                            <dt className="text-xs font-medium text-slate-500 mb-1">
                                                                {key}:
                                                            </dt>
                                                            <dd className="text-sm text-slate-800 whitespace-pre-wrap">
                                                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                                                            </dd>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}