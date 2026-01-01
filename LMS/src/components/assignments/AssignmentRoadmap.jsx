import React from 'react';
import { CheckCircle2, Circle, Clock, FileText, Trophy, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AssignmentRoadmap({ status, grade, dueDate }) {
    // Determine current step based on status and grade
    // Steps: 
    // 1. Assigned (Always active)
    // 2. In Progress (Active if open/viewed)
    // 3. Submitted (Active if submitted)
    // 4. Graded (Active if score exists)

    let currentStep = 1;
    if (status === 'submitted' || status === 'late') currentStep = 3;
    if (grade !== null && grade !== undefined) currentStep = 4;

    const steps = [
        { id: 1, label: 'פורסמה', icon: FileText },
        { id: 2, label: 'בעבודה', icon: Clock },
        { id: 3, label: 'הוגשה', icon: CheckCircle2 },
        { id: 4, label: 'נבדקה', icon: Trophy },
    ];

    return (
        <div className="w-full py-6 px-4">
            <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto">
                {/* Connecting Line */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-100 -z-10 rounded-full" />
                <div 
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 h-1 bg-indigo-100 -z-10 rounded-full transition-all duration-1000" 
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step) => {
                    const isActive = step.id <= currentStep;
                    const isCompleted = step.id < currentStep;
                    const isLast = step.id === currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 relative group">
                            <div 
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10",
                                    isActive 
                                        ? "bg-white border-indigo-600 text-indigo-600 shadow-md scale-110" 
                                        : "bg-slate-50 border-slate-200 text-slate-300"
                                )}
                            >
                                <step.icon className="w-4 h-4" />
                            </div>
                            <span 
                                className={cn(
                                    "text-xs font-medium absolute -bottom-6 w-20 text-center transition-colors",
                                    isActive ? "text-indigo-900 font-bold" : "text-slate-400"
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}