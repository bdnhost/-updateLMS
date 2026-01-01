import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Clock, CheckCircle2, User, Calendar } from 'lucide-react';
import { format, isValid } from 'date-fns';

export default function SubmissionDetailsDialog({ open, onClose, submission, assignment }) {
    if (!submission || !assignment) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return isValid(d) ? format(d, 'dd/MM/yyyy HH:mm') : '-';
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl h-[90vh] md:max-h-[85vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-4 border-b bg-slate-50 shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-600" />
                                פרטי הגשה: {assignment.title}
                            </DialogTitle>
                            <DialogDescription className="mt-1 flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                הוגש בתאריך: {formatDate(submission.submission_date || submission.created_date)}
                            </DialogDescription>
                        </div>
                        <Badge variant={submission.score ? 'outline' : 'secondary'} className={submission.score ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                            {submission.score ? `ציון: ${submission.score}` : 'ממתין לבדיקה'}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="space-y-6 pb-6">
                        
                        {/* Project Progress History */}
                        {submission.submission_data?.project_progress?.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-semibold text-slate-800 flex items-center gap-2 border-b pb-2">
                                    <Clock className="w-4 h-4 text-indigo-600" />
                                    היסטוריית שלבים בפרויקט
                                </h4>
                                <div className="space-y-3">
                                    {submission.submission_data.project_progress.map((step, idx) => (
                                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="font-bold text-slate-700 text-sm">
                                                    שלב {step.step_index !== undefined ? step.step_index + 1 : '?'}
                                                </span>
                                                <span className="text-xs text-slate-400 bg-white px-2 py-1 rounded-full border">
                                                    {formatDate(step.date)}
                                                </span>
                                            </div>
                                            {step.content && (
                                                <div className="bg-white p-3 rounded-lg border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap mb-3">
                                                    {step.content}
                                                </div>
                                            )}
                                            {step.file_url && (
                                                <Button variant="outline" size="sm" asChild className="w-full justify-start h-auto py-2">
                                                    <a href={step.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                        <Download className="w-3 h-3 text-blue-600" />
                                                        <span className="text-blue-600">קובץ מצורף לשלב</span>
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Standard Content (if not project or latest) */}
                        {submission.submission_content && !submission.submission_data?.project_progress && (
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 border-b pb-2">
                                    <FileText className="w-4 h-4 text-indigo-600" />
                                    תוכן ההגשה
                                </h4>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {submission.submission_content}
                                </div>
                            </div>
                        )}

                        {/* Standard File (if not project or latest) */}
                        {submission.file_url && !submission.submission_data?.project_progress && (
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-2 border-b pb-2">קבצים מצורפים</h4>
                                <Button variant="outline" asChild className="h-auto py-3 px-4 w-full justify-start bg-slate-50 hover:bg-slate-100">
                                    <a href={submission.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Download className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium text-slate-700">הורדת קובץ הגשה</div>
                                            <div className="text-xs text-slate-400">לחץ לפתיחה</div>
                                        </div>
                                    </a>
                                </Button>
                            </div>
                        )}

                        {/* Feedback Section */}
                        {submission.feedback && (
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    משוב מהמרצה
                                </h4>
                                <p className="text-indigo-800 text-sm whitespace-pre-wrap">
                                    {submission.feedback}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="p-4 border-t bg-slate-50 flex justify-end shrink-0">
                    <Button onClick={onClose} variant="outline">סגור</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}