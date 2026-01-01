import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

export default function RubricGrader({ rubric, criteria, grades, onChange }) {
    // grades is an object: { [criterionId]: { points, feedback } }
    
    const handleChange = (criterionId, field, value) => {
        const currentGrade = grades[criterionId] || { points: 0, feedback: '' };
        onChange({
            ...grades,
            [criterionId]: { ...currentGrade, [field]: value }
        });
    };

    const totalPoints = Object.values(grades).reduce((sum, g) => sum + (Number(g.points) || 0), 0);
    const maxPoints = criteria.reduce((sum, c) => sum + (Number(c.max_points) || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg">
                <h4 className="font-semibold text-slate-800">מחוון הערכה: {rubric.name}</h4>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">ציון משוקלל:</span>
                    <Badge variant="outline" className="bg-white text-lg font-bold px-3">
                        {totalPoints} / {maxPoints}
                    </Badge>
                </div>
            </div>

            <div className="space-y-6">
                {criteria.map((criterion) => {
                    const grade = grades[criterion.id] || { points: 0, feedback: '' };
                    
                    return (
                        <div key={criterion.id} className="border rounded-lg p-4 bg-white shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h5 className="font-medium text-slate-900">{criterion.title}</h5>
                                    {criterion.description && (
                                        <p className="text-sm text-slate-500 mt-1">{criterion.description}</p>
                                    )}
                                </div>
                                <div className="text-sm font-bold text-slate-400">
                                    {grade.points} / {criterion.max_points}
                                </div>
                            </div>

                            <div className="space-y-4 mt-4">
                                <div className="flex items-center gap-4">
                                    <Slider
                                        value={[Number(grade.points)]}
                                        max={criterion.max_points}
                                        step={1}
                                        onValueChange={(vals) => handleChange(criterion.id, 'points', vals[0])}
                                        className="flex-1"
                                    />
                                    <Input 
                                        type="number" 
                                        value={grade.points} 
                                        onChange={(e) => handleChange(criterion.id, 'points', Math.min(Number(e.target.value), criterion.max_points))}
                                        className="w-20 text-center"
                                        min={0}
                                        max={criterion.max_points}
                                    />
                                </div>
                                <Textarea
                                    value={grade.feedback}
                                    onChange={(e) => handleChange(criterion.id, 'feedback', e.target.value)}
                                    placeholder="הערות לקריטריון זה..."
                                    className="h-20 text-sm bg-slate-50"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}