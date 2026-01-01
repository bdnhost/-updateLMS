import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Wand2, Loader2, BookOpen, Home, Calendar as CalendarIcon, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AutoGenerateAssignmentsDialog({ courseId }) {
    const [open, setOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIndices, setSelectedIndices] = useState([]);
    const queryClient = useQueryClient();

    const generateMutation = useMutation({
        mutationFn: () => base44.functions.invoke('generateAutoAssignments', { courseId }),
        onSuccess: (response) => {
            const data = response.data?.assignments || [];
            setSuggestions(data);
            // Select all by default
            setSelectedIndices(data.map((_, i) => i));
            if (data.length === 0) {
                toast.info('לא נמצאו הצעות לתוכן. וודא שיש מפגשים בסיליבוס.');
            }
        },
        onError: () => toast.error('שגיאה ביצירת הצעות תוכן')
    });

    const createMutation = useMutation({
        mutationFn: (assignmentsToCreate) => base44.functions.invoke('bulkCreateAssignments', { 
            assignments: assignmentsToCreate 
        }),
        onSuccess: (data) => {
            toast.success(`נוצרו ${data.data?.count || 'בהצלחה'} מטלות חדשות`);
            queryClient.invalidateQueries(['assignments', courseId]);
            setOpen(false);
            setSuggestions([]);
        },
        onError: () => toast.error('שגיאה בשמירת המטלות')
    });

    const handleSave = () => {
        const toCreate = suggestions.filter((_, i) => selectedIndices.includes(i));
        if (toCreate.length === 0) return;
        
        // Remove helper fields before sending
        const cleanData = toCreate.map(({ category, session_number, estimated_minutes, ...rest }) => rest);
        createMutation.mutate(cleanData);
    };

    const toggleSelection = (index) => {
        setSelectedIndices(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-dashed border-violet-300 text-violet-700 bg-violet-50 hover:bg-violet-100">
                    <Wand2 className="w-4 h-4" />
                    הצע תוכן אוטומטי
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-violet-700">
                        <Wand2 className="w-5 h-5" />
                        מחולל מטלות אוטומטי
                    </DialogTitle>
                    <DialogDescription>
                        המערכת תסרוק את הסיליבוס ותציע 2 מטלות לכל מפגש (עבודת כיתה ושיעורי בית).
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden p-1">
                    {suggestions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 m-4">
                            {generateMutation.isPending ? (
                                <>
                                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-violet-500" />
                                    <p className="font-medium text-lg">מעבד את הסיליבוס...</p>
                                    <p className="text-sm">המכשף רוקח מטלות עבורך 🧙‍♂️</p>
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-10 h-10 mb-4 opacity-20" />
                                    <p className="font-medium">מוכן ליצירה?</p>
                                    <Button 
                                        onClick={() => generateMutation.mutate()} 
                                        className="mt-4 bg-violet-600 hover:bg-violet-700"
                                    >
                                        התחל יצירה
                                    </Button>
                                </>
                            )}
                        </div>
                    ) : (
                        <ScrollArea className="h-full pr-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {suggestions.map((item, index) => (
                                    <div 
                                        key={index} 
                                        className={`
                                            relative p-4 rounded-xl border transition-all cursor-pointer
                                            ${selectedIndices.includes(index) 
                                                ? 'border-violet-500 bg-violet-50/50 shadow-sm' 
                                                : 'border-slate-200 hover:border-violet-300 opacity-60'}
                                        `}
                                        onClick={() => toggleSelection(index)}
                                    >
                                        <div className="absolute top-4 right-4">
                                            <Checkbox 
                                                checked={selectedIndices.includes(index)}
                                                onCheckedChange={() => toggleSelection(index)}
                                            />
                                        </div>

                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant={item.category === 'Classwork' ? 'secondary' : 'outline'} className="mb-0">
                                                {item.category === 'Classwork' ? <BookOpen className="w-3 h-3 mr-1"/> : <Home className="w-3 h-3 mr-1"/>}
                                                {item.category === 'Classwork' ? 'עבודת כיתה' : 'שיעורי בית'}
                                            </Badge>
                                            <Badge variant="outline" className="text-slate-500 border-slate-200">
                                                מפגש {item.session_number}
                                            </Badge>
                                        </div>
                                        
                                        <h4 className="font-bold text-slate-800 pr-8 mb-1">{item.title.replace(`${item.category}: `, '')}</h4>
                                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">{item.description}</p>
                                        
                                        {item.due_date && (
                                            <div className="flex items-center text-xs text-slate-400 gap-1">
                                                <CalendarIcon className="w-3 h-3" />
                                                <span>תאריך יעד: {item.due_date}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <DialogFooter className="border-t pt-4 mt-2">
                    <div className="flex justify-between items-center w-full">
                        <div className="text-sm text-slate-500">
                            {suggestions.length > 0 && `נבחרו ${selectedIndices.length} מתוך ${suggestions.length}`}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setOpen(false)}>ביטול</Button>
                            {suggestions.length > 0 && (
                                <Button 
                                    onClick={handleSave} 
                                    disabled={createMutation.isPending || selectedIndices.length === 0}
                                    className="bg-violet-600 hover:bg-violet-700"
                                >
                                    {createMutation.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                                    <Save className="w-4 h-4 ml-2" />
                                    שמור {selectedIndices.length} מטלות
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}