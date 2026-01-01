import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  LayoutTemplate,
  Check,
  X,
  Lightbulb,
  Link as LinkIcon,
  Video
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function TemplateManager({ organizationId, onSelectTemplate }) {
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['assignmentTemplates', organizationId],
    queryFn: async () => {
        const [orgTemplates, globalTemplates] = await Promise.all([
            base44.entities.AssignmentTemplate.filter({ organization_id: organizationId }),
            base44.entities.AssignmentTemplate.filter({ is_global: true })
        ]);
        return [...(globalTemplates || []), ...(orgTemplates || [])];
    },
    enabled: !!organizationId
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AssignmentTemplate.create({ ...data, organization_id: organizationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignmentTemplates'] });
      setIsDialogOpen(false);
      setEditingTemplate(null);
      toast.success('תבנית נוצרה בהצלחה');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AssignmentTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignmentTemplates'] });
      setIsDialogOpen(false);
      setEditingTemplate(null);
      toast.success('תבנית עודכנה בהצלחה');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AssignmentTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignmentTemplates'] });
      toast.success('תבנית נמחקה');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      default_title: formData.get('default_title'),
      default_description: formData.get('default_description'),
      video_url: formData.get('video_url'),
      audio_url: formData.get('audio_url'),
      audio_script: formData.get('audio_script'),
      type: 'assignment', // For now, could be select
      max_score: Number(formData.get('max_score')) || 100,
      key_concepts: formData.get('key_concepts')?.split(',').map(s => s.trim()).filter(Boolean) || [],
      resource_links: formData.get('resource_links')?.split(',').map(s => s.trim()).filter(Boolean) || []
    };

    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEdit = (template) => {
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const openNew = () => {
    setEditingTemplate(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">תבניות מטלה</h2>
          <p className="text-slate-500">נהל תבניות מוכנות מראש ליצירה מהירה של מטלות</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 ml-2" />
          תבנית חדשה
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates?.map(template => (
          <Card key={template.id} className="group hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-1 mt-1">{template.description}</CardDescription>
                </div>
                <Badge variant={template.is_global ? "default" : "secondary"} className={template.is_global ? "bg-indigo-600" : "bg-slate-100"}>
                    <LayoutTemplate className="w-3 h-3 mr-1" />
                    {template.is_global ? 'גלובלי' : 'תבנית'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-3 text-sm text-slate-500 space-y-2">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">כותרת:</span>
                    {template.default_title || '-'}
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">מושגים:</span>
                    {template.key_concepts?.length || 0}
                </div>
                 <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">קישורים:</span>
                    {template.resource_links?.length || 0}
                </div>
            </CardContent>
            <CardFooter className="pt-3 border-t bg-slate-50/50 flex justify-between gap-2">
                {onSelectTemplate ? (
                    <Button size="sm" className="w-full" onClick={() => onSelectTemplate(template)}>
                        <Check className="w-4 h-4 ml-2" />
                        בחר תבנית
                    </Button>
                ) : (
                    <>
                        {!template.is_global && (
                            <>
                                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(template)}>
                                    <Edit className="w-3 h-3 ml-2" />
                                    עריכה
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => deleteMutation.mutate(template.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                        {template.is_global && (
                             <span className="text-xs text-slate-400 italic w-full text-center py-1">תבנית מערכת</span>
                        )}
                    </>
                )}
            </CardFooter>
          </Card>
        ))}
        {(!templates || templates.length === 0) && (
            <div className="col-span-full text-center py-12 border-2 border-dashed rounded-xl bg-slate-50 text-slate-400">
                <LayoutTemplate className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>אין תבניות זמינות</p>
                <Button variant="link" onClick={openNew}>צור את התבנית הראשונה</Button>
            </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'עריכת תבנית' : 'יצירת תבנית חדשה'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>שם התבנית *</Label>
                    <Input name="name" defaultValue={editingTemplate?.name} required placeholder='למשל: "סיכום סרטון"' />
                </div>
                <div className="space-y-2">
                    <Label>תיאור התבנית</Label>
                    <Input name="description" defaultValue={editingTemplate?.description} placeholder="מתי להשתמש בתבנית זו" />
                </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3 text-slate-700">תוכן ברירת מחדל למטלה</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>כותרת המטלה</Label>
                        <Input name="default_title" defaultValue={editingTemplate?.default_title} placeholder="כותרת שתופיע למטלה" />
                    </div>
                    <div className="space-y-2">
                        <Label>תיאור / הנחיות</Label>
                        <Textarea name="default_description" defaultValue={editingTemplate?.default_description} placeholder="הוראות לביצוע המטלה..." rows={3} />
                    </div>
                    <div className="space-y-2">
                         <Label className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            קישור לוידאו
                         </Label>
                        <Input name="video_url" defaultValue={editingTemplate?.video_url} dir="ltr" />
                    </div>
                    <div className="space-y-2">
                        <Label>תמליל אודיו (AI Script)</Label>
                        <Textarea name="audio_script" defaultValue={editingTemplate?.audio_script} placeholder="טקסט להקראה..." rows={2} />
                    </div>
                    <div className="space-y-2">
                        <Label>קישור לקובץ אודיו (MP3)</Label>
                        <Input name="audio_url" defaultValue={editingTemplate?.audio_url} dir="ltr" placeholder="https://..." />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                מושגי מפתח (מופרד בפסיק)
                            </Label>
                            <Input name="key_concepts" defaultValue={editingTemplate?.key_concepts?.join(', ')} placeholder="מושג 1, מושג 2..." />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <LinkIcon className="w-4 h-4" />
                                קישורים (מופרד בפסיק)
                            </Label>
                            <Input name="resource_links" defaultValue={editingTemplate?.resource_links?.join(', ')} placeholder="https://..." dir="ltr" />
                        </div>
                    </div>
                    <div className="space-y-2 w-1/3">
                        <Label>ציון מקסימלי</Label>
                        <Input type="number" name="max_score" defaultValue={editingTemplate?.max_score || 100} />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>ביטול</Button>
                <Button type="submit">{editingTemplate ? 'שמור שינויים' : 'צור תבנית'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}