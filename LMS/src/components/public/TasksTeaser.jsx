import React, { useMemo } from 'react';
import { AlertCircle, Clock, CheckCircle2, ArrowLeft, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { differenceInDays, isPast, isFuture, isToday, parseISO } from 'date-fns';

export default function TasksTeaser({ assignments = [], grades = [], sessions = [], studentId }) {
    // Logic to filter and prioritize tasks
    const activeTasks = useMemo(() => {
        const now = new Date();
        
        return assignments.map(assignment => {
            // Check if submitted
            const submission = grades?.find(g => g.assignment_id === assignment.id);
            const isSubmitted = submission && (submission.submission_status === 'submitted' || submission.score !== undefined);
            
            if (isSubmitted) return null;

            // Dates
            const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
            const session = sessions?.find(s => s.id === assignment.session_id);
            const sessionDate = session?.date ? new Date(session.date) : null;
            
            let urgency = 'normal';
            let label = 'לביצוע';
            let color = 'bg-blue-50 text-blue-700 border-blue-200';
            let icon = Calendar;

            // Logic for urgency
            if (dueDate) {
                const daysUntilDue = differenceInDays(dueDate, now);
                
                if (isPast(dueDate) && !isToday(dueDate)) {
                    urgency = 'overdue';
                    label = 'באיחור';
                    color = 'bg-red-50 text-red-700 border-red-200';
                    icon = AlertCircle;
                } else if (isToday(dueDate)) {
                    urgency = 'urgent';
                    label = 'להגשה היום';
                    color = 'bg-orange-50 text-orange-700 border-orange-200';
                    icon = Clock;
                } else if (daysUntilDue <= 3) {
                    urgency = 'soon';
                    label = `נותרו ${daysUntilDue} ימים`;
                    color = 'bg-amber-50 text-amber-700 border-amber-200';
                    icon = Clock;
                }
            } else if (sessionDate) {
                // If no due date, infer from session
                if (isPast(sessionDate) && differenceInDays(now, sessionDate) < 7) {
                    urgency = 'recent_session';
                    label = 'ממפגש אחרון';
                    color = 'bg-purple-50 text-purple-700 border-purple-200';
                }
            }

            return {
                ...assignment,
                urgency,
                label,
                color,
                icon,
                dueDate
            };
        })
        .filter(Boolean) // Remove nulls (submitted tasks)
        .sort((a, b) => {
            // Sort by urgency: overdue > urgent > soon > normal
            const priority = { overdue: 0, urgent: 1, soon: 2, recent_session: 3, normal: 4 };
            return priority[a.urgency] - priority[b.urgency];
        });
    }, [assignments, grades, sessions]);

    if (activeTasks.length === 0) return null;

    // We only show the teaser if there are urgent/soon/overdue tasks
    const urgentTasks = activeTasks.filter(t => ['overdue', 'urgent', 'soon'].includes(t.urgency));
    
    if (urgentTasks.length === 0) return null;

    const topTask = urgentTasks[0];
    const otherCount = urgentTasks.length - 1;

    const Icon = topTask.icon;

    return (
        <div className="w-full max-w-3xl mx-auto mb-6 px-4 sm:px-0">
            <div className={`
                relative overflow-hidden rounded-xl border shadow-sm p-1
                bg-white
                ${topTask.urgency === 'overdue' ? 'border-red-200 shadow-red-100' : 
                  topTask.urgency === 'urgent' ? 'border-orange-200 shadow-orange-100' : 
                  'border-amber-200 shadow-amber-100'}
            `}>
                {/* Progress Strip Background */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 
                    ${topTask.urgency === 'overdue' ? 'bg-red-500' : 
                      topTask.urgency === 'urgent' ? 'bg-orange-500' : 
                      'bg-amber-500'}
                `} />

                <div className="flex items-center justify-between p-3 pl-4 pr-5">
                    <div className="flex items-center gap-4 overflow-hidden">
                        {/* Pulse Indicator for high urgency */}
                        {(topTask.urgency === 'overdue' || topTask.urgency === 'urgent') && (
                            <div className="relative flex h-3 w-3 shrink-0">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 
                                    ${topTask.urgency === 'overdue' ? 'bg-red-400' : 'bg-orange-400'}`} 
                                />
                                <span className={`relative inline-flex rounded-full h-3 w-3 
                                    ${topTask.urgency === 'overdue' ? 'bg-red-500' : 'bg-orange-500'}`} 
                                />
                            </div>
                        )}

                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-sm truncate">
                                    {topTask.title}
                                </span>
                                <Badge variant="outline" className={`text-[10px] h-5 px-1.5 ${topTask.color} border-0`}>
                                    {topTask.label}
                                </Badge>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                                {otherCount > 0 ? (
                                    <span>ועוד {otherCount} משימות שממתינות לתשומת לבך</span>
                                ) : (
                                    <span>זה הזמן להשלים את המשימה ולהתקדם בחומר!</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <Button 
                        size="sm" 
                        variant="ghost" 
                        className="shrink-0 gap-1 text-xs hover:bg-slate-100 text-slate-600 h-8"
                        onClick={() => {
                            window.location.href = `?type=assignment&id=${topTask.id}&student_id=${studentId || ''}`;
                        }}
                    >
                        <span>לביצוע</span>
                        <ArrowLeft className="w-3 h-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
}