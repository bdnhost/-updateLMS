import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, AlertCircle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function RubricBuilder({ value, onChange }) {
    // value is array of criteria: [{ title, description, max_points }]
    const [criteria, setCriteria] = useState(value || []);

    useEffect(() => {
        setCriteria(value || []);
    }, [value]);

    const handleAdd = () => {
        const newCriteria = [
            ...criteria,
            { id: Date.now().toString(), title: '', description: '', max_points: 10 }
        ];
        update(newCriteria);
    };

    const handleDelete = (index) => {
        const newCriteria = criteria.filter((_, i) => i !== index);
        update(newCriteria);
    };

    const handleChange = (index, field, val) => {
        const newCriteria = [...criteria];
        newCriteria[index] = { ...newCriteria[index], [field]: val };
        update(newCriteria);
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(criteria);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        update(items);
    };

    const update = (newCriteria) => {
        setCriteria(newCriteria);
        onChange(newCriteria);
    };

    const totalPoints = criteria.reduce((sum, c) => sum + (Number(c.max_points) || 0), 0);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-slate-700">
                    קריטריונים להערכה
                </div>
                <div className={`text-sm font-bold ${totalPoints !== 100 ? 'text-orange-500' : 'text-green-600'}`}>
                    סה"כ נקודות: {totalPoints}
                </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="rubric-list">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                            {criteria.map((criterion, index) => (
                                <Draggable key={criterion.id || index} draggableId={criterion.id?.toString() || index.toString()} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="bg-white border rounded-lg p-3 shadow-sm group"
                                        >
                                            <div className="flex gap-3">
                                                <div {...provided.dragHandleProps} className="mt-2 text-slate-400 cursor-grab active:cursor-grabbing">
                                                    <GripVertical className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex gap-3">
                                                        <div className="flex-1">
                                                            <Input
                                                                value={criterion.title}
                                                                onChange={(e) => handleChange(index, 'title', e.target.value)}
                                                                placeholder="שם הקריטריון (למשל: איכות הכתיבה)"
                                                                className="h-9 font-medium"
                                                            />
                                                        </div>
                                                        <div className="w-24">
                                                            <Input
                                                                type="number"
                                                                value={criterion.max_points}
                                                                onChange={(e) => handleChange(index, 'max_points', Number(e.target.value))}
                                                                placeholder="נקודות"
                                                                className="h-9"
                                                            />
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(index)}
                                                            className="h-9 w-9 text-slate-400 hover:text-red-500"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    <Textarea
                                                        value={criterion.description}
                                                        onChange={(e) => handleChange(index, 'description', e.target.value)}
                                                        placeholder="תיאור הציפיות מהתלמיד..."
                                                        className="text-sm min-h-[60px] resize-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {criteria.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed rounded-lg bg-slate-50 text-slate-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>עדיין לא הוגדרו קריטריונים</p>
                </div>
            )}

            <Button
                type="button"
                variant="outline"
                onClick={handleAdd}
                className="w-full border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            >
                <Plus className="w-4 h-4 mr-2" />
                הוסף קריטריון
            </Button>
        </div>
    );
}