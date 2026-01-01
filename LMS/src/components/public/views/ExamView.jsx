import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Clock, Trophy } from 'lucide-react';
import { toast } from 'sonner';

export default function ExamView({ resource, contentData, onSubmit, isSubmitted }) {
    // Ensure questions is always an array and normalize fields
    const questions = React.useMemo(() => {
        let q = contentData?.questions;
        
        // 1. Handle stringified JSON
        if (typeof q === 'string') {
            try {
                q = JSON.parse(q);
            } catch {
                q = [];
            }
        }
        
        // 2. Handle wrapper object case: { questions: [...] }
        if (q && !Array.isArray(q) && typeof q === 'object' && Array.isArray(q.questions)) {
            q = q.questions;
        }

        if (!Array.isArray(q)) return [];
        
        // 3. Normalize fields (handle 'question' vs 'text', 'correct' vs 'correctAnswer')
        return q.map((item, idx) => ({
            ...item,
            id: item.id || `q-${idx}-${Math.random().toString(36).substr(2, 5)}`,
            text: item.text || item.question || 'שאלה ללא טקסט',
            correctAnswer: item.correctAnswer !== undefined ? item.correctAnswer : item.correct,
            type: item.type || 'multiple_choice',
            points: Number(item.points) || 0,
            options: Array.isArray(item.options) ? item.options : []
        }));
    }, [contentData]);

    const [answers, setAnswers] = useState({});

    const handleAnswer = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = () => {
        // Simple validation
        const unanswered = questions.filter(q => !answers[q.id]);
        if (unanswered.length > 0) {
            toast.warning(`שים לב: לא ענית על ${unanswered.length} שאלות`);
        }
        
        // Calculate score for auto-grading
        let autoScore = 0;
        let totalAutoPoints = 0;
        
        questions.forEach(q => {
            if (q.type === 'multiple_choice') {
                totalAutoPoints += q.points;
                if (answers[q.id] === q.correctAnswer) {
                    autoScore += q.points;
                }
            }
        });

        onSubmit({
            answers,
            auto_score: autoScore,
            total_auto_points: totalAutoPoints
        });
    };

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex items-center justify-between bg-indigo-50 p-3 md:p-4 rounded-xl border border-indigo-100">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-indigo-600" />
                        <span className="font-semibold text-indigo-900">{questions.length} שאלות</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-600" />
                        <span className="font-semibold text-indigo-900">ללא הגבלת זמן</span>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {questions.map((q, index) => (
                    <Card key={q.id} className="border-slate-200">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <h3 className="font-medium text-lg flex gap-2">
                                    <span className="text-slate-400 font-bold">{index + 1}.</span>
                                    {q.text}
                                </h3>
                                <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                    {q.points} נק'
                                </span>
                            </div>

                            {q.type === 'multiple_choice' ? (
                                <RadioGroup 
                                    value={answers[q.id]} 
                                    onValueChange={(val) => handleAnswer(q.id, Number(val))}
                                    className="space-y-3"
                                    disabled={isSubmitted}
                                >
                                    {q.options.map((opt, optIndex) => (
                                        <div key={optIndex} className="flex items-center space-x-2 space-x-reverse">
                                            <RadioGroupItem value={optIndex} id={`q${q.id}-opt${optIndex}`} />
                                            <Label 
                                                htmlFor={`q${q.id}-opt${optIndex}`}
                                                className="cursor-pointer flex-1 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
                                            >
                                                {opt}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            ) : (
                                <Textarea 
                                    value={answers[q.id] || ''}
                                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                                    placeholder="כתוב את תשובתך כאן..."
                                    className="min-h-[100px]"
                                    disabled={isSubmitted}
                                />
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {!isSubmitted && (
                <div className="sticky bottom-0 bg-white border-t p-4 flex justify-center shadow-lg -mx-4 -mb-4 md:-mx-8 md:-mb-8 z-10">
                    <Button 
                        size="lg" 
                        className="w-full max-w-md bg-indigo-600 hover:bg-indigo-700"
                        onClick={handleSubmit}
                    >
                        הגש מבחן
                    </Button>
                </div>
            )}
        </div>
    );
}