import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical, CheckCircle2, Circle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function ExamBuilder({ value, onChange }) {
    // value is { questions: [] }
    const questions = Array.isArray(value?.questions) ? value.questions : [];

    const addQuestion = (type) => {
        const newQuestion = {
            id: crypto.randomUUID(),
            type, // 'multiple_choice' | 'open'
            text: '',
            options: type === 'multiple_choice' ? ['', '', '', ''] : [],
            correctAnswer: type === 'multiple_choice' ? 0 : null,
            points: 10
        };
        onChange({ ...value, questions: [...questions, newQuestion] });
    };

    const updateQuestion = (index, updates) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], ...updates };
        onChange({ ...value, questions: newQuestions });
    };

    const removeQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        onChange({ ...value, questions: newQuestions });
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(questions);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        onChange({ ...value, questions: items });
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 justify-center">
                <Button onClick={() => addQuestion('multiple_choice')} variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    שאלה אמריקאית
                </Button>
                <Button onClick={() => addQuestion('open')} variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    שאלה פתוחה
                </Button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="questions">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                            {questions.map((q, index) => (
                                <Draggable key={q.id} draggableId={q.id} index={index}>
                                    {(provided) => (
                                        <Card 
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="relative group border-slate-200"
                                        >
                                            <div 
                                                {...provided.dragHandleProps}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing p-2"
                                            >
                                                <GripVertical className="w-5 h-5" />
                                            </div>
                                            <CardContent className="p-4 pl-12 space-y-4">
                                                <div className="flex gap-4 items-start">
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <Label>שאלה {index + 1} ({q.type === 'multiple_choice' ? 'אמריקאית' : 'פתוחה'})</Label>
                                                            <div className="flex items-center gap-2">
                                                                <Input 
                                                                    type="number" 
                                                                    className="w-20 h-8" 
                                                                    placeholder="נק'"
                                                                    value={q.points}
                                                                    onChange={(e) => updateQuestion(index, { points: Number(e.target.value) })}
                                                                />
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    onClick={() => removeQuestion(index)}
                                                                    className="text-red-400 hover:text-red-600 h-8 w-8"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <Textarea 
                                                            value={q.text} 
                                                            onChange={(e) => updateQuestion(index, { text: e.target.value })}
                                                            placeholder="הקלד את השאלה כאן..."
                                                            className="min-h-[60px]"
                                                        />
                                                    </div>
                                                </div>

                                                {q.type === 'multiple_choice' && (
                                                    <div className="space-y-2 pr-4 border-r-2 border-slate-100 mr-2">
                                                        {q.options.map((opt, optIndex) => (
                                                            <div key={optIndex} className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateQuestion(index, { correctAnswer: optIndex })}
                                                                    className={`shrink-0 ${q.correctAnswer === optIndex ? 'text-green-600' : 'text-slate-300 hover:text-slate-400'}`}
                                                                >
                                                                    {q.correctAnswer === optIndex ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                                                </button>
                                                                <Input 
                                                                    value={opt}
                                                                    onChange={(e) => {
                                                                        const newOptions = [...q.options];
                                                                        newOptions[optIndex] = e.target.value;
                                                                        updateQuestion(index, { options: newOptions });
                                                                    }}
                                                                    placeholder={`אפשרות ${optIndex + 1}`}
                                                                    className={`h-9 ${q.correctAnswer === optIndex ? 'border-green-200 bg-green-50' : ''}`}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            
            {questions.length === 0 && (
                <div className="text-center py-8 text-slate-400 border-2 border-dashed rounded-xl">
                    לא נוספו שאלות עדיין
                </div>
            )}
        </div>
    );
}