import React, { useState } from 'react';
import { 
    Calendar, CheckCircle2, Clock, 
    BookOpen, Video, FileText, 
    HelpCircle, Layout, ArrowLeft, ArrowRight,
    Save, Plus, ImageIcon, Palette
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const STEPS = [
    { id: 'details', title: 'פרטי המפגש', icon: Calendar },
    { id: 'prep', title: 'הכנה מוקדמת', icon: BookOpen },
    { id: 'in_class', title: 'מהלך השיעור', icon: Layout },
    { id: 'audio', title: 'הנחיה קולית', icon: Mic },
    { id: 'post_class', title: 'מטלות וסיכום', icon: CheckCircle2 }
];
import { Mic, Wand2, PlayCircle, Loader2 } from 'lucide-react';
import AudioPlayer from '@/components/common/AudioPlayer';
import AIStudioPanel from '@/components/assignments/AIStudioPanel';

export default function SessionWizard({ open, onClose, courseId, onSuccess }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [data, setData] = useState({
        // Step 1: Details
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        description: '',
        
        // Step 2: Prep (Pre-class)
        hasPrep: false,
        prepVideoUrl: '',
        prepReadingUrl: '',
        prepQuizTitle: '',
        
        // Step 3: In Class
        hasInteractive: false,
        presentationUrl: '',
        
        // Step 4: Post Class (Assignments)
        hasHomework: false,
        homeworkTitle: '',
        homeworkDueDate: '',

        // Step 3.5: Audio
        audioScript: '',
        audioUrl: '',
        
        // Media
        mediaPrompt: '',
        mediaUrl: ''
    });

    const [isGeneratingScript, setIsGeneratingScript] = useState(false);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [isGeneratingMedia, setIsGeneratingMedia] = useState(false);

    const generateScript = async () => {
        if (!data.title) return toast.error('יש להזין נושא למפגש');
        setIsGeneratingScript(true);
        try {
            const res = await base44.functions.invoke('generateAudioGuide', {
                entityType: 'session',
                action: 'generate_script',
                contextData: { title: data.title, description: data.description, extra: data.location }
            });
            if (res.data?.script) {
                setData(prev => ({ ...prev, audioScript: res.data.script }));
                toast.success('תמליל נוצר!');
            }
        } catch(e) { toast.error('שגיאה ביצירת תמליל'); }
        finally { setIsGeneratingScript(false); }
    };

    const generateAudio = async () => {
        if (!data.audioScript) return toast.error('אין תמליל');
        
        // Note: For new sessions (wizard), we can't use cPanel sync until saved
        // So we keep the direct generation for wizard (pre-save)
        setIsGeneratingAudio(true);
        const toastId = toast.loading('מפיק אודיו באמצעות AI...');
        try {
            const res = await base44.functions.invoke('generateAudioGuide', {
                entityType: 'session',
                action: 'generate_audio',
                customScript: data.audioScript,
                skipUpdate: true,
                contextData: { title: data.title }
            });
            if (res.data?.success) {
                setData(prev => ({ ...prev, audioUrl: res.data.audio_url }));
                toast.success('אודיו הופק בהצלחה!', { id: toastId });
            } else {
                toast.error('שגיאה בהפקה: ' + (res.data?.error || 'Unknown error'), { id: toastId });
            }
        } catch(e) { 
            console.error(e);
            toast.error('תקלה בהפקת אודיו', { id: toastId }); 
        } finally { 
            setIsGeneratingAudio(false); 
        }
    };

    const suggestPrompt = async () => {
        if (!data.title) return toast.error('יש להזין נושא למפגש');
        setIsGeneratingPrompt(true);
        try {
            const res = await base44.functions.invoke('generateVisualMedia', {
                entityType: 'session',
                action: 'suggest_prompt',
                contextData: {
                    title: data.title,
                    description: data.description,
                    customInstructions: 'Create an educational session cover image that represents the lesson topic. Use relevant symbols, icons, diagrams, and visual metaphors. Professional academic style with vibrant educational colors. The image should inspire learning and curiosity. NO TEXT OR LETTERS. Focus on visual representation of the subject matter. 4k quality.'
                }
            });
            if (res.data?.prompt) {
                setData(prev => ({ ...prev, mediaPrompt: res.data.prompt }));
                toast.success('פרומפט נוצר!');
            }
        } catch(e) { toast.error('שגיאה ביצירת פרומפט'); }
        finally { setIsGeneratingPrompt(false); }
    };

    const generateMedia = async () => {
        if (!data.mediaPrompt) return toast.error('אין פרומפט');
        setIsGeneratingMedia(true);
        try {
            const res = await base44.functions.invoke('generateVisualMedia', {
                entityType: 'session',
                action: 'generate_image',
                customPrompt: data.mediaPrompt
            });
            if (res.data?.success) {
                setData(prev => ({ ...prev, mediaUrl: res.data.media_url }));
                toast.success('תמונה נוצרה!');
            }
        } catch(e) { toast.error('שגיאה ביצירת תמונה'); }
        finally { setIsGeneratingMedia(false); }
    };

    const queryClient = useQueryClient();

    const createSessionMutation = useMutation({
        mutationFn: async (sessionData) => {
            // 1. Create Session
            const session = await base44.entities.CourseSession.create({
                course_id: courseId,
                organization_id: (await base44.auth.me()).organization_id,
                session_number: 999, // Backend or logic should auto-increment
                title: sessionData.title,
                date: sessionData.date,
                start_time: sessionData.startTime,
                end_time: sessionData.endTime,
                location: sessionData.location,
                description: sessionData.description,
                presentation_url: sessionData.presentationUrl,
                audio_url: sessionData.audioUrl,
                audio_script: sessionData.audioScript,
                media_url: sessionData.mediaUrl,
                media_prompt: sessionData.mediaPrompt,
                status: 'planned'
            });

            // 1.1 Create Calendar Event for the session
            await base44.entities.CalendarEvent.create({
                course_id: courseId,
                organization_id: session.organization_id,
                session_id: session.id,
                title: sessionData.title,
                description: sessionData.description,
                date: sessionData.date,
                start_time: sessionData.startTime,
                end_time: sessionData.endTime,
                location: sessionData.location,
                type: 'lesson'
            });

            // 2. Create Prep Materials (if any)
            if (sessionData.hasPrep) {
                if (sessionData.prepVideoUrl) {
                    await base44.entities.Material.create({
                        course_id: courseId,
                        organization_id: session.organization_id,
                        session_id: session.id,
                        title: 'סרטון הכנה',
                        type: 'video',
                        file_url: sessionData.prepVideoUrl,
                        is_published: true
                    });
                }
                if (sessionData.prepReadingUrl) {
                    await base44.entities.Material.create({
                        course_id: courseId,
                        organization_id: session.organization_id,
                        session_id: session.id,
                        title: 'חומר קריאה',
                        type: 'document',
                        file_url: sessionData.prepReadingUrl,
                        is_published: true
                    });
                }
            }

            // 3. Create Homework Assignment (if any)
            if (sessionData.hasHomework && sessionData.homeworkTitle) {
                await base44.entities.Assignment.create({
                    course_id: courseId,
                    organization_id: session.organization_id,
                    session_id: session.id,
                    title: sessionData.homeworkTitle,
                    description: 'מטלת בית שנוצרה באשף המפגשים',
                    due_date: sessionData.homeworkDueDate,
                    type: 'assignment',
                    status: 'open'
                });
            }

            return session;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sessions', courseId]);
            toast.success('המפגש והתכנים נוצרו בהצלחה!');
            onSuccess?.();
            onClose();
            setCurrentStep(0);
            setData({}); // Reset form
        },
        onError: () => toast.error('שגיאה ביצירת המפגש')
    });

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            createSessionMutation.mutate(data);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Details
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <Label>נושא המפגש</Label>
                            <Input 
                                value={data.title} 
                                onChange={e => setData({...data, title: e.target.value})}
                                placeholder="לדוגמה: מבוא לתכנות מונחה עצמים"
                                autoFocus
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>תאריך</Label>
                                <Input 
                                    type="date" 
                                    value={data.date} 
                                    onChange={e => setData({...data, date: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>מיקום / חדר</Label>
                                <Input 
                                    value={data.location} 
                                    onChange={e => setData({...data, location: e.target.value})}
                                    placeholder="חדר 301 / Zoom"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>שעת התחלה</Label>
                                <Input 
                                    type="time" 
                                    value={data.startTime} 
                                    onChange={e => setData({...data, startTime: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>שעת סיום</Label>
                                <Input 
                                    type="time" 
                                    value={data.endTime} 
                                    onChange={e => setData({...data, endTime: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>תיאור קצר (סילבוס)</Label>
                            <Textarea 
                                value={data.description} 
                                onChange={e => setData({...data, description: e.target.value})}
                                placeholder="מה נלמד בשיעור זה?"
                                className="h-20"
                            />
                        </div>
                    </div>
                );
            
            case 1: // Prep Materials
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                            <div className="space-y-1">
                                <h4 className="font-medium text-indigo-900">האם יש חומרי הכנה?</h4>
                                <p className="text-sm text-indigo-700">סרטונים, קריאה או שאלון מקדים לשיעור</p>
                            </div>
                            <Switch 
                                checked={data.hasPrep}
                                onCheckedChange={checked => setData({...data, hasPrep: checked})}
                            />
                        </div>

                        {data.hasPrep && (
                            <div className="space-y-4 pr-4 border-r-2 border-indigo-100">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Video className="w-4 h-4 text-slate-500" />
                                        קישור לסרטון הכנה (YouTube)
                                    </Label>
                                    <Input 
                                        value={data.prepVideoUrl} 
                                        onChange={e => setData({...data, prepVideoUrl: e.target.value})}
                                        placeholder="https://youtube.com/..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-slate-500" />
                                        קישור למאמר / חומר קריאה
                                    </Label>
                                    <Input 
                                        value={data.prepReadingUrl} 
                                        onChange={e => setData({...data, prepReadingUrl: e.target.value})}
                                        placeholder="PDF URL or Article Link"
                                    />
                                </div>
                                <div className="p-3 bg-amber-50 rounded border border-amber-100 text-amber-800 text-sm flex gap-2">
                                    <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>טיפ: חומרי ההכנה יפורסמו לסטודנטים באופן אוטומטי לפני המפגש</span>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 2: // In Class
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                         <div className="space-y-4">
                            <Label className="flex items-center gap-2 text-lg font-medium">
                                <Layout className="w-5 h-5 text-indigo-600" />
                                תכני השיעור עצמו
                            </Label>
                            
                            <div className="space-y-2">
                                <Label>קישור למצגת השיעור</Label>
                                <Input 
                                    value={data.presentationUrl} 
                                    onChange={e => setData({...data, presentationUrl: e.target.value})}
                                    placeholder="קישור ל-Google Slides או PDF"
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                                <div className="space-y-1">
                                    <h4 className="font-medium text-slate-900">פעילות אינטראקטיבית בכיתה?</h4>
                                    <p className="text-sm text-slate-500">האם מתוכנן חידון Kahoot או מטלה בזמן אמת?</p>
                                </div>
                                <Switch 
                                    checked={data.hasInteractive}
                                    onCheckedChange={checked => setData({...data, hasInteractive: checked})}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 3: // Audio & Media Guide
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <AIStudioPanel
                            audioScript={data.audioScript}
                            onAudioScriptChange={(val) => setData({...data, audioScript: val})}
                            voiceId={data.voiceId}
                            onVoiceIdChange={(val) => setData({...data, voiceId: val})}
                            stability={data.stability || 0.5}
                            onStabilityChange={(val) => setData({...data, stability: val})}
                            audioUrl={data.audioUrl}
                            onAudioGenerate={generateAudio}
                            isGeneratingAudio={isGeneratingAudio}
                            onScriptGenerate={generateScript}
                            isGeneratingScript={isGeneratingScript}
                            mediaPrompt={data.mediaPrompt}
                            onMediaPromptChange={(val) => setData({...data, mediaPrompt: val})}
                            mediaUrl={data.mediaUrl}
                            onMediaGenerate={generateMedia}
                            isGeneratingMedia={isGeneratingMedia}
                            onPromptSuggest={suggestPrompt}
                            isGeneratingPrompt={isGeneratingPrompt}
                            onMediaClear={() => setData({...data, mediaUrl: ''})}
                            entityId={null}
                        />
                    </div>
                );

            case 4: // Post Class
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                            <div className="space-y-1">
                                <h4 className="font-medium text-green-900">הקצאת שיעורי בית?</h4>
                                <p className="text-sm text-green-700">מטלה לביצוע לאחר השיעור</p>
                            </div>
                            <Switch 
                                checked={data.hasHomework}
                                onCheckedChange={checked => setData({...data, hasHomework: checked})}
                            />
                        </div>

                        {data.hasHomework && (
                            <div className="space-y-4 pr-4 border-r-2 border-green-100">
                                <div className="space-y-2">
                                    <Label>כותרת המטלה</Label>
                                    <Input 
                                        value={data.homeworkTitle} 
                                        onChange={e => setData({...data, homeworkTitle: e.target.value})}
                                        placeholder="לדוגמה: תרגיל בית 1 - מחלקות ואובייקטים"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>תאריך הגשה</Label>
                                    <Input 
                                        type="date"
                                        value={data.homeworkDueDate} 
                                        onChange={e => setData({...data, homeworkDueDate: e.target.value})}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mt-8 p-4 bg-slate-100 rounded-lg">
                            <h4 className="font-bold text-slate-800 mb-2">סיכום יצירה:</h4>
                            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                <li>מפגש: <strong>{data.title || '(ללא שם)'}</strong></li>
                                <li>תאריך: {data.date || 'לא נקבע'}</li>
                                {data.hasPrep && <li>כולל חומרי הכנה מוקדמת</li>}
                                {data.hasHomework && <li>כולל מטלת בית</li>}
                            </ul>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl min-h-[500px] flex flex-col p-0 overflow-hidden">
                <div className="bg-slate-50 border-b p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Plus className="w-6 h-6 text-indigo-600" />
                            אשף יצירת מפגש חדש
                        </DialogTitle>
                        <DialogDescription>
                            הגדר את המפגש, חומרי ההכנה והמטלות בתהליך מובנה
                        </DialogDescription>
                    </DialogHeader>
                    
                    {/* Stepper */}
                    <div className="flex justify-between mt-8 px-4 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -z-10 transform -translate-y-1/2 mx-8" />
                        
                        {STEPS.map((step, idx) => {
                            const isActive = idx === currentStep;
                            const isCompleted = idx < currentStep;
                            
                            return (
                                <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-50 px-2 z-10">
                                    <div 
                                        className={`
                                            w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2
                                            ${isActive ? 'bg-indigo-600 border-indigo-600 text-white scale-110 shadow-lg' : 
                                              isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                                              'bg-white border-slate-300 text-slate-400'}
                                        `}
                                    >
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-xs font-medium ${isActive ? 'text-indigo-700' : 'text-slate-500'}`}>
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 p-8 overflow-y-auto">
                    {renderStepContent()}
                </div>

                <div className="p-6 border-t bg-slate-50 flex justify-between items-center">
                    <Button 
                        variant="ghost" 
                        onClick={handleBack} 
                        disabled={currentStep === 0}
                        className="gap-2"
                    >
                        <ArrowRight className="w-4 h-4" /> הקודם
                    </Button>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>ביטול</Button>
                        <Button 
                            onClick={handleNext}
                            disabled={currentStep === 0 && !data.title} // Basic validation
                            className={currentStep === STEPS.length - 1 ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"}
                        >
                            {currentStep === STEPS.length - 1 ? (
                                <>
                                    {createSessionMutation.isPending ? 'יוצר...' : 'סיים ושמור'} 
                                    <Save className="w-4 h-4 mr-2" />
                                </>
                            ) : (
                                <>
                                    הבא <ArrowLeft className="w-4 h-4 mr-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}