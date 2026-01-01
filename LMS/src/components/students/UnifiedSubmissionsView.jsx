import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, BookOpen, Calendar, Award, MessageSquare, Save, Eye, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function UnifiedSubmissionsView({ studentId, assignments, grades }) {
    const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [score, setScore] = useState('');
    const [feedback, setFeedback] = useState('');
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [viewingSubmission, setViewingSubmission] = useState(null);

    const queryClient = useQueryClient();

    // Fetch guide submissions
    const { data: guideSubmissions, isLoading: guidesLoading } = useQuery({
        queryKey: ['guideSubmissions', studentId],
        queryFn: () => base44.entities.GuideSubmission.filter({ student_id: studentId }),
        enabled: !!studentId
    });

    // Update guide score mutation
    const updateScoreMutation = useMutation({
        mutationFn: async ({ guide_submission_id, manual_score, feedback }) => {
            const response = await base44.functions.invoke('updateGuideSubmissionScore', {
                guide_submission_id,
                manual_score,
                feedback
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guideSubmissions', studentId] });
            queryClient.invalidateQueries({ queryKey: ['student', studentId] });
            toast.success('הציון עודכן בהצלחה וממוצע הציונים חושב מחדש');
            setScoreDialogOpen(false);
            setSelectedSubmission(null);
            setScore('');
            setFeedback('');
        },
        onError: (error) => {
            toast.error('שגיאה בעדכון הציון: ' + error.message);
        }
    });

    const handleOpenScoreDialog = (submission) => {
        setSelectedSubmission(submission);
        setScore(submission.manual_score?.toString() || '');
        setFeedback(submission.feedback || '');
        setScoreDialogOpen(true);
    };

    const handleSaveScore = () => {
        if (!selectedSubmission) return;
        
        const numericScore = score ? parseFloat(score) : null;
        if (numericScore !== null && (numericScore < 0 || numericScore > 100)) {
            toast.error('הציון חייב להיות בין 0 ל-100');
            return;
        }

        updateScoreMutation.mutate({
            guide_submission_id: selectedSubmission.id,
            manual_score: numericScore,
            feedback: feedback
        });
    };

    const handleViewSubmission = (submission) => {
        setViewingSubmission(submission);
        setViewDialogOpen(true);
    };

    // Group guide submissions by guide name
    const groupedGuides = React.useMemo(() => {
        if (!guideSubmissions) return {};
        return guideSubmissions.reduce((acc, submission) => {
            const key = submission.guide_name;
            if (!acc[key]) acc[key] = [];
            acc[key].push(submission);
            return acc;
        }, {});
    }, [guideSubmissions]);

    // Combine assignments with grades
    const assignmentsWithGrades = React.useMemo(() => {
        if (!assignments) return [];
        return assignments.map((assignment) => {
            const grade = grades?.find((g) => g.assignment_id === assignment.id);
            return { ...assignment, grade, type: 'assignment' };
        });
    }, [assignments, grades]);

    // Convert guide submissions to a similar format
    const guideItems = React.useMemo(() => {
        if (!guideSubmissions) return [];
        return guideSubmissions.map((submission) => ({
            ...submission,
            type: 'guide',
            title: submission.hierarchy_path || submission.guide_name,
            due_date: submission.created_date
        }));
    }, [guideSubmissions]);

    // Merge all items
    const allItems = [...assignmentsWithGrades, ...guideItems].sort((a, b) => 
        new Date(b.due_date || b.created_date) - new Date(a.due_date || a.created_date)
    );

    if (guidesLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2" dir="rtl">
                        <Award className="h-5 w-5 text-indigo-600" />
                        מטלות והגשות
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {allItems.length > 0 ? (
                            allItems.map((item) => (
                                <div key={item.id} className="flex flex-col p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant={item.type === 'guide' ? 'default' : 'secondary'} className={item.type === 'guide' ? 'bg-purple-100 text-purple-700' : ''}>
                                                    {item.type === 'guide' ? (
                                                        <>
                                                            <BookOpen className="w-3 h-3 mr-1" />
                                                            מדריך
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileText className="w-3 h-3 mr-1" />
                                                            מטלה
                                                        </>
                                                    )}
                                                </Badge>
                                            </div>
                                            <h4 className="font-semibold text-slate-800" dir="rtl">
                                                {item.type === 'assignment' ? (
                                                    <Link to={`${createPageUrl('AssignmentProfile')}?id=${item.id}`} className="hover:text-indigo-600 hover:underline transition-colors flex items-center gap-2">
                                                        {item.title}
                                                        <ExternalLink className="w-3 h-3 text-slate-400" />
                                                    </Link>
                                                ) : (
                                                    <span>{item.title}</span>
                                                )}
                                            </h4>
                                            <div className="flex gap-4 text-sm text-slate-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(item.due_date || item.created_date), 'dd/MM/yyyy')}
                                                </span>
                                                {item.type === 'assignment' && item.weight && (
                                                    <span>משקל: {item.weight}%</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            {item.type === 'guide' ? (
                                                <>
                                                    {item.manual_score !== null && item.manual_score !== undefined ? (
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-slate-800">{item.manual_score}</div>
                                                            <span className="text-xs text-slate-500">ציון</span>
                                                        </div>
                                                    ) : (
                                                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                                                            טרם דורג
                                                        </Badge>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewSubmission(item)}
                                                            className="text-xs h-8"
                                                        >
                                                            <Eye className="w-3 h-3 ml-1" />
                                                            צפה
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleOpenScoreDialog(item)}
                                                            className="text-xs h-8"
                                                        >
                                                            <Award className="w-3 h-3 ml-1" />
                                                            {item.manual_score ? 'ערוך ציון' : 'הזן ציון'}
                                                        </Button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    {item.grade ? (
                                                        <div className="text-center">
                                                            {item.grade.score !== undefined && item.grade.score !== null ? (
                                                                <>
                                                                    <div className="text-2xl font-bold text-slate-800">{item.grade.score}</div>
                                                                    <span className="text-xs text-emerald-600 font-medium">
                                                                        {item.grade.submission_status === 'submitted' ? 'הוגש' : 'טיוטה'}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <Badge className="bg-amber-100 text-amber-800 border-amber-200">ממתין לבדיקה</Badge>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <Badge variant="secondary">טרם הוגש</Badge>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {((item.type === 'guide' && item.feedback) || (item.type === 'assignment' && item.grade?.feedback)) && (
                                        <div className="mt-3 me-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-600" dir="rtl">
                                            <span className="font-semibold text-slate-700" dir="rtl">משוב: </span>
                                            <span dir="rtl" className="whitespace-pre-wrap">{item.type === 'guide' ? item.feedback : item.grade.feedback}</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-slate-500 py-8">אין מטלות או הגשות</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Score Dialog */}
            <Dialog open={scoreDialogOpen} onOpenChange={setScoreDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle dir="rtl">הזנת ציון והערכה</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        {selectedSubmission && (
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <p className="text-sm font-medium text-slate-700">{selectedSubmission.hierarchy_path || selectedSubmission.guide_name}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    הוגש: {format(new Date(selectedSubmission.created_date), 'dd/MM/yyyy HH:mm')}
                                </p>
                            </div>
                        )}
                        
                        <div>
                            <Label htmlFor="score">ציון (0-100)</Label>
                            <Input
                                id="score"
                                type="number"
                                min="0"
                                max="100"
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                placeholder="הזן ציון"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="feedback">משוב (אופציונלי)</Label>
                            <Textarea
                                id="feedback"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="הזן משוב למטלה..."
                                rows={4}
                                className="mt-1"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setScoreDialogOpen(false)} className="bg-slate-700 hover:bg-slate-800 text-white border-slate-600">
                                ביטול
                            </Button>
                            <Button onClick={handleSaveScore} disabled={updateScoreMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                {updateScoreMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 ms-2 animate-spin" />
                                        שומר...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 ms-2" />
                                        שמור
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Submission Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle dir="rtl">פרטי ההגשה</DialogTitle>
                    </DialogHeader>
                    {viewingSubmission && (
                        <div className="space-y-4 mt-4">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <p className="font-semibold text-slate-800">{viewingSubmission.hierarchy_path || viewingSubmission.guide_name}</p>
                                <p className="text-sm text-slate-500 mt-1">
                                    הוגש: {format(new Date(viewingSubmission.created_date), 'dd/MM/yyyy HH:mm')}
                                </p>
                            </div>

                            <div className="space-y-3" dir="rtl">
                                <h4 className="font-semibold text-slate-700" dir="rtl">תשובות התלמיד:</h4>
                                {viewingSubmission.form_data && Object.entries(viewingSubmission.form_data).map(([key, value]) => (
                                    <div key={key} className="p-3 bg-white rounded-lg border border-slate-200" dir="rtl">
                                        <p className="text-sm font-medium text-slate-600 mb-1" dir="rtl">{key}:</p>
                                        <p className="text-slate-800 whitespace-pre-wrap" dir="rtl">
                                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}