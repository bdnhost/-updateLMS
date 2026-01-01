import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Lightbulb, 
    Target, 
    BrainCircuit, 
    CheckCircle2, 
    ChevronLeft, 
    Play, 
    BookOpen, 
    PenTool,
    Clock,
    X,
    MessageCircle,
    Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { getPedagogicalPrompt } from '@/components/public/pedagogicalPrompts';

const INTENT_OPTIONS = [
    "להבין את הרעיון הכללי",
    "לדעת ליישם בפועל",
    "להיות מוכן למבחן",
    "לסיים את המשימה"
];

const REFLECTION_QUESTIONS = [
    "מה הבנתי טוב יותר ממה שציפיתי?",
    "מה עדיין לא לגמרי ברור לי?",
    "מה אעשה אחרת בלמידה הבאה?"
];

export default function SelfLearningWizard({ resource, studentId }) {
    const [isOpen, setIsOpen] = useState(false); // Minimized/Maximized state
    const [stage, setStage] = useState('init'); // init, intent, prior, active, reflection, done
    const [logId, setLogId] = useState(null);
    const [intent, setIntent] = useState('');
    const [priorKnowledge, setPriorKnowledge] = useState(3);
    const [reflection, setReflection] = useState({});
    const [currentTip, setCurrentTip] = useState(null);
    const [postKnowledge, setPostKnowledge] = useState(3);

    // Initial load check
    useEffect(() => {
        if (!resource || !studentId) return;
        checkExistingLog();
    }, [resource?.id, studentId]);

    // Timed Nudges & Contextual Tips
    useEffect(() => {
        if (stage !== 'active') return;

        const resourceType = resource.type || 'generic';
        
        // Map resource type to pedagogical context
        let contextId = 'reading_content'; // default
        let Icon = BookOpen;

        if (['video', 'recording'].includes(resourceType)) {
            contextId = 'video_learning';
            Icon = Play;
        } else if (['assignment', 'quiz', 'exam'].includes(resourceType)) {
            contextId = 'exercise_attempt';
            Icon = BrainCircuit;
        }

        // Show random tip every few minutes
        const interval = setInterval(() => {
            const prompt = getPedagogicalPrompt(contextId); // Random tone by default
            
            if (prompt) {
                setCurrentTip({ 
                    icon: Icon, 
                    text: prompt.message,
                    tone: prompt.tone
                });
                // Auto hide tip after 10 seconds
                setTimeout(() => setCurrentTip(null), 10000);
            }
        }, 1000 * 60 * 3); // Every 3 minutes

        return () => clearInterval(interval);
    }, [stage, resource]);

    const checkExistingLog = async () => {
        try {
            // Check local storage or DB if we already started this session
            // For public view without robust auth, we rely on local state mostly, 
            // but let's try to fetch last log for this resource/student if possible
            if (studentId) {
                const logs = await base44.entities.LearningJourneyLog.filter({
                    student_id: studentId,
                    resource_id: resource.id
                });
                
                if (logs && logs.length > 0) {
                    const lastLog = logs[logs.length - 1];
                    setLogId(lastLog.id);
                    if (lastLog.status === 'completed') {
                        setStage('done');
                    } else {
                        setStage('active');
                        setIsOpen(false); // Start minimized if returning
                    }
                } else {
                    // New session
                    setStage('intent');
                    setIsOpen(true);
                }
            } else {
                 setStage('intent');
                 setIsOpen(true);
            }
        } catch (e) {
            console.error("Failed to check logs", e);
            setStage('intent');
            setIsOpen(true);
        }
    };

    const handleSaveIntent = async () => {
        if (!intent) return;
        
        try {
            if (studentId) {
                const newLog = await base44.entities.LearningJourneyLog.create({
                    student_id: studentId,
                    resource_id: resource.id,
                    resource_type: resource.type || 'unknown',
                    learning_intent: intent,
                    status: 'in_progress'
                });
                setLogId(newLog.id);
            }
            setStage('prior');
        } catch (e) {
            console.error("Failed to save intent", e);
            setStage('prior'); // Proceed anyway
        }
    };

    const handleSavePrior = async () => {
        try {
            if (logId) {
                await base44.entities.LearningJourneyLog.update(logId, {
                    prior_knowledge_level: parseInt(priorKnowledge)
                });
            }
            setStage('active');
            setIsOpen(false); // Minimize to let user work
            toast.success("מעולה! המערכת תלווה אותך ברקע.");
        } catch (e) {
            console.error("Failed to save prior", e);
            setStage('active');
            setIsOpen(false);
        }
    };

    const handleFinishReflection = async () => {
        try {
            if (logId) {
                await base44.entities.LearningJourneyLog.update(logId, {
                    reflection_answers: reflection,
                    post_knowledge_level: parseInt(postKnowledge),
                    status: 'completed'
                });
            }
            setStage('done');
            toast.success("כל הכבוד! סיימת את יחידת הלימוד.");
        } catch (e) {
            console.error("Failed to save reflection", e);
             setStage('done');
        }
    };

    // --- Renders ---

    if (stage === 'init') return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 font-['Heebo']" dir="rtl">
            <AnimatePresence>
                {/* Minimized Bubble */}
                {!isOpen && stage !== 'done' && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                    >
                        <Button 
                            onClick={() => setIsOpen(true)}
                            className="rounded-full w-14 h-14 bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg hover:shadow-xl flex items-center justify-center relative overflow-hidden group"
                        >
                            <BrainCircuit className="w-8 h-8 text-white" />
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </Button>
                        {/* Contextual Tip Bubble */}
                        {currentTip && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, x: 10 }}
                                animate={{ opacity: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute bottom-16 left-0 w-64 bg-white p-4 rounded-xl shadow-xl border-r-4 border-violet-500 text-sm"
                            >
                                <div className="flex gap-3">
                                    <div className="bg-violet-100 p-2 rounded-full h-fit">
                                        <currentTip.icon className="w-4 h-4 text-violet-600" />
                                    </div>
                                    <p className="text-slate-700">{currentTip.text}</p>
                                </div>
                                <button 
                                    onClick={() => setCurrentTip(null)}
                                    className="absolute top-1 left-1 text-slate-300 hover:text-slate-500"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* Main Wizard Card */}
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="w-[90vw] md:w-[400px]"
                    >
                        <Card className="shadow-2xl border-0 overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <BrainCircuit className="w-5 h-5" />
                                    <span className="font-bold">המלווה החכם שלך</span>
                                </div>
                                {stage === 'active' && (
                                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 h-8 w-8">
                                        <ChevronLeft className="w-5 h-5" />
                                    </Button>
                                )}
                            </div>

                            <div className="p-6 bg-white min-h-[300px] flex flex-col">
                                
                                {/* STAGE 1: INTENT */}
                                {stage === 'intent' && (
                                    <div className="space-y-6 flex-1">
                                        <div className="text-center space-y-2">
                                            <Target className="w-12 h-12 text-violet-500 mx-auto bg-violet-50 p-2 rounded-full" />
                                            <h3 className="text-xl font-bold text-slate-800">לפני שמתחילים...</h3>
                                            <p className="text-slate-500 text-sm">
                                                {getPedagogicalPrompt('pre_task_entry')?.message || "הגדרת מטרה ברורה עוזרת למוח להתמקד."}
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <Label>מה היית רוצה להשיג במשימה זו?</Label>
                                            <RadioGroup value={intent} onValueChange={setIntent} className="space-y-2">
                                                {INTENT_OPTIONS.map((opt) => (
                                                    <div key={opt} className={`flex items-center space-x-2 space-x-reverse p-3 rounded-lg border cursor-pointer transition-all ${intent === opt ? 'border-violet-600 bg-violet-50' : 'border-slate-200 hover:border-violet-300'}`}>
                                                        <RadioGroupItem value={opt} id={opt} />
                                                        <Label htmlFor={opt} className="cursor-pointer flex-1">{opt}</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                        <div className="pt-4 mt-auto">
                                            <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={handleSaveIntent} disabled={!intent}>
                                                המשך לשלב הבא
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* STAGE 2: PRIOR KNOWLEDGE */}
                                {stage === 'prior' && (
                                    <div className="space-y-6 flex-1 text-center">
                                        <div className="space-y-2">
                                            <Lightbulb className="w-12 h-12 text-amber-500 mx-auto bg-amber-50 p-2 rounded-full" />
                                            <h3 className="text-xl font-bold text-slate-800">מה נקודת הפתיחה שלך?</h3>
                                            <p className="text-slate-500 text-sm">
                                                {getPedagogicalPrompt('prior_knowledge_check')?.message || "עד כמה הנושא הזה מוכר לך כרגע?"}
                                            </p>
                                        </div>

                                        <div className="py-6">
                                            <div className="flex justify-between items-end mb-4 px-2">
                                                <span className="text-xs text-slate-400">לא מכיר בכלל</span>
                                                <span className="text-2xl font-bold text-violet-600">{priorKnowledge}</span>
                                                <span className="text-xs text-slate-400">שולט בחומר</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="1" 
                                                max="5" 
                                                step="1"
                                                value={priorKnowledge}
                                                onChange={(e) => setPriorKnowledge(parseInt(e.target.value))}
                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                                            />
                                            <div className="flex justify-between mt-2 text-xs text-slate-300">
                                                <span>1</span>
                                                <span>2</span>
                                                <span>3</span>
                                                <span>4</span>
                                                <span>5</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 mt-auto">
                                            <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={handleSavePrior}>
                                                התחל למידה
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* STAGE 3: ACTIVE (Menu) */}
                                {stage === 'active' && (
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-violet-600">
                                                {priorKnowledge}
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">ידע התחלתי</p>
                                                <p className="font-medium text-sm text-slate-800 truncate w-48">{intent}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-bold text-slate-700 text-sm">כלים ללמידה:</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 items-center justify-center bg-slate-50 hover:bg-violet-50 hover:text-violet-600 border-slate-200" onClick={() => toast("✍️ נסה לעצור כל 10 דקות ולכתוב סיכום קצר של מה שלמדת.")}>
                                                    <PenTool className="w-5 h-5" />
                                                    <span className="text-xs">טיפ לסיכום</span>
                                                </Button>
                                                <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 items-center justify-center bg-slate-50 hover:bg-violet-50 hover:text-violet-600 border-slate-200" onClick={() => toast("🗣️ נסה להסביר את המושג בקול רם, כאילו אתה מלמד מישהו אחר.")}>
                                                    <MessageCircle className="w-5 h-5" />
                                                    <span className="text-xs">הסבר עצמי</span>
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-6">
                                            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setStage('reflection')}>
                                                <CheckCircle2 className="w-4 h-4 ml-2" />
                                                סיימתי את המשימה
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* STAGE 4: REFLECTION */}
                                {stage === 'reflection' && (
                                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[60vh]">
                                        <div className="text-center space-y-1">
                                            <Star className="w-10 h-10 text-yellow-500 mx-auto" />
                                            <h3 className="text-lg font-bold text-slate-800">רגע של חשיבה</h3>
                                            <p className="text-slate-500 text-xs">
                                                {getPedagogicalPrompt('post_task_reflection')?.message || "עיבוד המידע הוא החלק החשוב בלמידה."}
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm">איך היית מדרג את ההבנה שלך עכשיו? (התחלת ב-{priorKnowledge})</Label>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-bold text-slate-400">1</span>
                                                    <input 
                                                        type="range" min="1" max="5" step="1"
                                                        value={postKnowledge}
                                                        onChange={(e) => setPostKnowledge(parseInt(e.target.value))}
                                                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                                    />
                                                    <span className="font-bold text-green-600 text-xl">{postKnowledge}</span>
                                                </div>
                                            </div>

                                            {REFLECTION_QUESTIONS.map((q, idx) => (
                                                <div key={idx} className="space-y-1.5">
                                                    <Label className="text-xs text-slate-600">{q}</Label>
                                                    <Textarea 
                                                        className="h-16 text-sm resize-none bg-slate-50" 
                                                        placeholder="התשובה שלך..."
                                                        value={reflection[idx] || ''}
                                                        onChange={(e) => setReflection(prev => ({ ...prev, [idx]: e.target.value }))}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-2">
                                            <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg" onClick={handleFinishReflection}>
                                                סיים ושמור תובנות
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* STAGE 5: DONE */}
                                {stage === 'done' && (
                                    <div className="text-center space-y-6 py-8 flex-1 flex flex-col items-center justify-center">
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-800">כל הכבוד!</h3>
                                            <p className="text-slate-500 mt-2">השלמת מחזור למידה מלא.</p>
                                        </div>
                                        {postKnowledge > priorKnowledge && (
                                            <div className="bg-violet-50 text-violet-700 px-4 py-2 rounded-full text-sm font-medium">
                                                📈 השיפור שלך: {postKnowledge - priorKnowledge} נקודות בדירוג
                                            </div>
                                        )}
                                        <Button variant="outline" onClick={() => setIsOpen(false)}>סגור</Button>
                                    </div>
                                )}

                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}