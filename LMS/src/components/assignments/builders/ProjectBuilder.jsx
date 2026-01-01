import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Calendar as CalendarIcon, CheckSquare, Wand2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import MilestoneTemplatesDialog from '../MilestoneTemplatesDialog';

export default function ProjectBuilder({ value, onChange, finalDueDate }) {
    // value is { milestones: [], guidelines: '' }
    const milestones = Array.isArray(value?.milestones) ? value.milestones : [];
    const guidelines = value?.guidelines || '';
    const [templatesDialogOpen, setTemplatesDialogOpen] = useState(false);

    const addMilestone = () => {
        const newMilestone = {
            id: crypto.randomUUID(),
            title: '',
            description: '',
            dueDate: '',
            percentage: 0
        };
        onChange({ ...value, milestones: [...milestones, newMilestone] });
    };

    const updateMilestone = (index, updates) => {
        const newMilestones = [...milestones];
        newMilestones[index] = { ...newMilestones[index], ...updates };
        onChange({ ...value, milestones: newMilestones });
    };

    const removeMilestone = (index) => {
        const newMilestones = milestones.filter((_, i) => i !== index);
        onChange({ ...value, milestones: newMilestones });
    };

    const applyTemplate = (templateMilestones) => {
        onChange({ ...value, milestones: templateMilestones });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>הנחיות כלליות לפרויקט</Label>
                <Textarea 
                    value={guidelines}
                    onChange={(e) => onChange({ ...value, guidelines: e.target.value })}
                    placeholder="תאר את מטרות הפרויקט, תוצרים מצופים ודרישות כלליות..."
                    className="min-h-[100px]"
                />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">אבני דרך ושלבים</Label>
                    <div className="flex gap-2">
                        <Button 
                            onClick={() => setTemplatesDialogOpen(true)} 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 border-violet-200 text-violet-700 hover:bg-violet-50"
                        >
                            <Wand2 className="w-4 h-4" />
                            תבניות מוכנות
                        </Button>
                        <Button onClick={addMilestone} variant="outline" size="sm" className="gap-2">
                            <Plus className="w-4 h-4" />
                            הוסף שלב
                        </Button>
                    </div>
                </div>

                {milestones.map((milestone, index) => (
                    <Card key={milestone.id} className="border-slate-200">
                        <CardContent className="p-4 space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex-1 space-y-2">
                                            <Label>שם השלב</Label>
                                            <Input 
                                                value={milestone.title}
                                                onChange={(e) => updateMilestone(index, { title: e.target.value })}
                                                placeholder="לדוגמה: הגשת סקיצה ראשונית"
                                            />
                                        </div>
                                        <div className="w-32 space-y-2">
                                            <Label>משקל (%)</Label>
                                            <Input 
                                                type="number"
                                                value={milestone.percentage}
                                                onChange={(e) => updateMilestone(index, { percentage: Number(e.target.value) })}
                                                min="0"
                                                max="100"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>תיאור</Label>
                                        <Textarea 
                                            value={milestone.description}
                                            onChange={(e) => updateMilestone(index, { description: e.target.value })}
                                            placeholder="מה נדרש להגיש בשלב זה?"
                                            className="h-20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>תאריך יעד לשלב זה</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={`w-full justify-start text-right font-normal ${!milestone.dueDate && 'text-muted-foreground'}`}
                                                >
                                                    <CalendarIcon className="ml-2 h-4 w-4" />
                                                    {milestone.dueDate ? format(new Date(milestone.dueDate), 'dd/MM/yyyy') : 'בחר תאריך'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={milestone.dueDate ? new Date(milestone.dueDate) : undefined}
                                                    onSelect={(date) => updateMilestone(index, { dueDate: date ? format(date, 'yyyy-MM-dd') : '' })}
                                                    locale={he}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => removeMilestone(index)}
                                    className="text-red-400 hover:text-red-600 mt-8"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {milestones.length === 0 && (
                    <div className="text-center py-8 text-slate-400 border-2 border-dashed rounded-xl flex flex-col items-center gap-2">
                        <CheckSquare className="w-8 h-8 opacity-20" />
                        <p>לא הוגדרו אבני דרך</p>
                        <Button 
                            onClick={() => setTemplatesDialogOpen(true)}
                            variant="outline"
                            size="sm"
                            className="mt-2 gap-2 text-violet-600 border-violet-200 hover:bg-violet-50"
                        >
                            <Wand2 className="w-4 h-4" />
                            התחל עם תבנית מוכנה
                        </Button>
                    </div>
                )}
            </div>

            <MilestoneTemplatesDialog
                open={templatesDialogOpen}
                onClose={() => setTemplatesDialogOpen(false)}
                onApply={applyTemplate}
                finalDueDate={finalDueDate}
            />
        </div>
    );
}