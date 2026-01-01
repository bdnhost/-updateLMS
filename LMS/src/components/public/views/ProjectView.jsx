import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Clock, ChevronDown, ChevronUp, Lock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// Progress Compass Component
const MilestoneCompass = ({ milestones, activeIndex, onStepClick }) => {
    return (
        <div className="w-full py-6 px-2 overflow-x-auto">
            <div className="flex justify-between items-center relative min-w-[300px]">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -z-10 -translate-y-1/2 rounded-full" />
                <div 
                    className="absolute top-1/2 right-0 h-1 bg-indigo-100 -z-10 -translate-y-1/2 rounded-full transition-all duration-500" 
                    style={{ width: `${(activeIndex / (milestones.length - 1)) * 100}%` }}
                />

                {milestones.map((milestone, index) => {
                    const status = index < activeIndex ? 'completed' : index === activeIndex ? 'active' : 'future';
                    
                    return (
                        <div 
                            key={milestone.id} 
                            className="flex flex-col items-center gap-2 cursor-pointer group"
                            onClick={() => onStepClick(index)}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 relative bg-white z-10",
                                status === 'completed' && "border-green-500 text-green-600 bg-green-50",
                                status === 'active' && "border-indigo-600 text-indigo-600 shadow-[0_0_0_4px_rgba(99,102,241,0.2)] scale-110",
                                status === 'future' && "border-slate-200 text-slate-300"
                            )}>
                                {status === 'completed' ? (
                                    <CheckCircle2 className="w-6 h-6" />
                                ) : (
                                    <span className="text-sm font-bold">{index + 1}</span>
                                )}
                            </div>
                            
                            <div className={cn(
                                "text-xs font-medium max-w-[80px] text-center transition-colors duration-300 hidden md:block",
                                status === 'active' ? "text-indigo-700 font-bold" : "text-slate-500"
                            )}>
                                {milestone.title}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default function ProjectView({ resource, contentData, onSubmit, isSubmitting }) {
    // Ensure milestones is an array
    const rawMilestones = contentData?.milestones;
    const milestones = Array.isArray(rawMilestones) ? rawMilestones : [];
    
    const guidelines = contentData?.guidelines || '';
    const [activeMilestone, setActiveMilestone] = useState(0);
    const [submissionText, setSubmissionText] = useState('');
    const [expandedMilestones, setExpandedMilestones] = useState([0]);
    const [uploadedFileUrl, setUploadedFileUrl] = useState('');
    const [isFileUploading, setIsFileUploading] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsFileUploading(true);
        try {
            const res = await base44.integrations.Core.UploadFile({ file });
            setUploadedFileUrl(res.file_url);
            toast.success('הקובץ הועלה בהצלחה');
        } catch (error) {
            console.error(error);
            toast.error('שגיאה בהעלאת הקובץ');
        } finally {
            setIsFileUploading(false);
        }
    };

    const handleSubmit = () => {
        const isLastStep = activeMilestone === milestones.length - 1;
        
        onSubmit({
            content: submissionText,
            file_url: uploadedFileUrl,
            current_milestone_index: activeMilestone,
            is_final_submission: isLastStep
        });

        // Optimistically move to next if not last
        if (!isLastStep) {
            setActiveMilestone(prev => prev + 1);
            setExpandedMilestones(prev => [...prev, activeMilestone + 1]);
            setSubmissionText(''); // Clear text for next step
            setUploadedFileUrl(''); // Clear file
        }
    };

    const toggleExpand = (index) => {
        setExpandedMilestones(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const handleCompassClick = (index) => {
        // Allow clicking only if previously unlocked or next
        if (index <= activeMilestone) {
            if (!expandedMilestones.includes(index)) {
                setExpandedMilestones(prev => [...prev, index]);
            }
            // Optional: scroll to item
            const element = document.getElementById(`milestone-${index}`);
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <div className="space-y-8">
            {/* Guidelines Banner */}
            {guidelines && (
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-800">
                    <span className="font-bold block mb-1">הנחיות כלליות:</span>
                    {guidelines}
                </div>
            )}

            {/* Visual Compass */}
            <MilestoneCompass 
                milestones={milestones} 
                activeIndex={activeMilestone} 
                onStepClick={handleCompassClick}
            />

            {/* Milestones List */}
            <div className="space-y-4">
                {milestones.map((milestone, index) => {
                    const isActive = index === activeMilestone;
                    const isCompleted = index < activeMilestone;
                    const isFuture = index > activeMilestone;
                    const isExpanded = expandedMilestones.includes(index) || isActive;

                    return (
                        <Card 
                            key={milestone.id} 
                            id={`milestone-${index}`}
                            className={cn(
                                "transition-all duration-300 border-l-4",
                                isActive ? "border-l-indigo-500 shadow-md ring-1 ring-indigo-500/20" : 
                                isCompleted ? "border-l-green-500 opacity-90" : 
                                "border-l-slate-200 opacity-70 bg-slate-50"
                            )}
                        >
                            <CardHeader 
                                className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => toggleExpand(index)}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                            isActive ? "bg-indigo-100 text-indigo-700" :
                                            isCompleted ? "bg-green-100 text-green-700" :
                                            "bg-slate-200 text-slate-500"
                                        )}>
                                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                                        </div>
                                        <CardTitle className={cn("text-base", isActive && "text-indigo-700")}>
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

                                        {/* Input Area - Only for Active Step */}
                                        {isActive && (
                                            <div className="mt-4 pt-4 border-t border-indigo-100 bg-indigo-50/30 rounded-lg p-4">
                                                <Label className="text-indigo-900 mb-2 block">
                                                    הגשת תוצרים לשלב {index + 1}
                                                </Label>
                                                <Textarea 
                                                    value={submissionText}
                                                    onChange={(e) => setSubmissionText(e.target.value)}
                                                    placeholder="הוסף טקסט, קישורים או הערות לשלב זה..."
                                                    className="min-h-[120px] bg-white border-indigo-200 focus-visible:ring-indigo-500 mb-3"
                                                    disabled={isSubmitting}
                                                />
                                                
                                                <div className="mb-4">
                                                    <Label className="text-indigo-900 mb-1 block text-xs">
                                                        צרף קובץ (אופציונלי)
                                                    </Label>
                                                    <div className="flex items-center gap-2">
                                                        <Input 
                                                            type="file" 
                                                            onChange={handleFileUpload}
                                                            disabled={isFileUploading || isSubmitting}
                                                            className="bg-white border-indigo-200 h-9"
                                                        />
                                                        {isFileUploading && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
                                                    </div>
                                                    {uploadedFileUrl && (
                                                        <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            קובץ מצורף מוכן לשליחה
                                                        </div>
                                                    )}
                                                </div>

                                                <Button 
                                                    onClick={handleSubmit} 
                                                    className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                                                    disabled={isFileUploading || isSubmitting}
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin ml-2" />
                                                            שולח...
                                                        </>
                                                    ) : (
                                                        index === milestones.length - 1 ? 'הגש פרויקט וסיים' : 'הגש שלב זה והתקדם'
                                                    )}
                                                </Button>
                                            </div>
                                        )}

                                        {isFuture && (
                                            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 italic">
                                                <Lock className="w-3 h-3" />
                                                שלב זה יהיה זמין לאחר סיום השלבים הקודמים
                                            </div>
                                        )}
                                        
                                        {isCompleted && (
                                            <div className="mt-2 flex items-center gap-2 text-xs text-green-600 font-medium bg-green-50 p-2 rounded w-fit">
                                                <CheckCircle2 className="w-3 h-3" />
                                                שלב זה הושלם
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