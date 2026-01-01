import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Save, Trash2, Copy, FileText, Link as LinkIcon, Smartphone, Mail, LayoutTemplate, Upload, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import ImportDialog from '@/components/common/ImportDialog';

export default function NotificationTemplatesManager() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [createChannel, setCreateChannel] = useState('email');

    const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

    const { data: templates, isLoading } = useQuery({
        queryKey: ['notificationTemplates', user?.organization_id],
        queryFn: async () => {
            if (!user?.organization_id) return [];
            return await base44.entities.NotificationTemplate.filter({ organization_id: user.organization_id });
        },
        enabled: !!user?.organization_id
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.NotificationTemplate.create({
            ...data,
            organization_id: user?.organization_id,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['notificationTemplates']);
            setIsCreateOpen(false);
            toast.success('התבנית נוצרה בהצלחה');
        },
        onError: () => toast.error('שגיאה ביצירת התבנית')
    });

    const updateMutation = useMutation({
        mutationFn: (data) => base44.entities.NotificationTemplate.update(editingTemplate.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['notificationTemplates']);
            setEditingTemplate(null);
            toast.success('התבנית עודכנה בהצלחה');
        },
        onError: () => toast.error('שגיאה בעדכון התבנית')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.NotificationTemplate.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['notificationTemplates']);
            toast.success('התבנית נמחקה');
        }
    });

    const seedMutation = useMutation({
        mutationFn: () => base44.functions.invoke('seedNotificationTemplates'),
        onSuccess: (res) => {
            const count = res.data?.created || 0;
            queryClient.invalidateQueries(['notificationTemplates']);
            toast.success(`נוצרו ${count} תבניות ברירת מחדל`);
        },
        onError: () => toast.error('שגיאה ביצירת תבניות')
    });

    return (
        <Card className="border-t-4 border-t-indigo-500 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <LayoutTemplate className="w-5 h-5 text-indigo-600" />
                        ניהול תבניות הודעה
                    </CardTitle>
                    <CardDescription>
                        מאגר תבניות לשימוש חוזר בכל ערוצי התקשורת (SMS, אימייל, וואטסאפ)
                    </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending} className="border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
                        {seedMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        טען תבניות מומלצות
                    </Button>
                    <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                        <Upload className="w-4 h-4 mr-2" />
                        ייבוא
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="w-4 h-4 mr-2" />
                                תבנית חדשה
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setCreateChannel('email'); setIsCreateOpen(true); }}>
                                <Mail className="w-4 h-4 mr-2" /> תבנית אימייל
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setCreateChannel('sms'); setIsCreateOpen(true); }}>
                                <Smartphone className="w-4 h-4 mr-2" /> תבנית SMS
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setCreateChannel('whatsapp'); setIsCreateOpen(true); }}>
                                <Smartphone className="w-4 h-4 mr-2" /> תבנית WhatsApp
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates?.map(template => (
                            <Card key={template.id} className="border hover:border-indigo-300 transition-colors flex flex-col">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="font-bold text-base text-slate-800 line-clamp-1" title={template.name}>{template.name}</div>
                                        <div className="flex gap-1 shrink-0">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-indigo-600" onClick={() => setEditingTemplate(template)}>
                                                <FileText className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600" onClick={() => {
                                                if(confirm('למחוק תבנית זו?')) deleteMutation.mutate(template.id);
                                            }}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {template.channel && (
                                            <Badge variant="secondary" className={`text-xs px-1.5 py-0 ${
                                                template.channel === 'email' ? 'bg-blue-100 text-blue-700' : 
                                                template.channel === 'sms' ? 'bg-green-100 text-green-700' : 
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                                {template.channel === 'email' ? <Mail className="w-3 h-3 mr-1" /> : template.channel === 'sms' ? <Smartphone className="w-3 h-3 mr-1" /> : null}
                                                {template.channel.toUpperCase()}
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className="text-xs px-1.5 py-0">{template.trigger_type}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="bg-slate-50 p-2 rounded border text-xs text-slate-600 font-mono h-24 overflow-hidden relative">
                                        {template.content_template}
                                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 to-transparent"></div>
                                    </div>
                                    {template.description && <p className="text-xs text-slate-400 mt-2 line-clamp-1">{template.description}</p>}
                                </CardContent>
                            </Card>
                        ))}
                        {(!templates || templates.length === 0) && (
                            <div className="col-span-full text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed">
                                <p>לא נמצאו תבניות. לחץ על "טען תבניות מומלצות" כדי להתחיל.</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            {/* Create/Edit Dialog */}
            <TemplateDialog 
                open={isCreateOpen || !!editingTemplate} 
                onOpenChange={(open) => {
                    if (!open) {
                        setIsCreateOpen(false);
                        setEditingTemplate(null);
                    }
                }}
                template={editingTemplate}
                defaultChannel={createChannel}
                onSubmit={(data) => {
                    if (editingTemplate) updateMutation.mutate(data);
                    else createMutation.mutate(data);
                }}
            />

            <ImportDialog 
                open={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                entityName="NotificationTemplate"
                organizationId={user?.organization_id}
                onImportComplete={() => queryClient.invalidateQueries(['notificationTemplates'])}
                templateData="שם התבנית*,תוכן*,תיאור,סוג טריגר
תזכורת שיעור,שלום {{student_name}} מחר מתקיים שיעור בקורס {{course_name}}.,תזכורת כללית לשיעור,manual"
                schemaDescription="Notification Templates. Fields: name, content_template, description, trigger_type (manual, course_welcome, etc)."
                entityDisplayMap={{'NotificationTemplate': 'תבניות הודעה'}}
            />
        </Card>
    );
}

function TemplateDialog({ open, onOpenChange, template, defaultChannel, onSubmit }) {
    const [formData, setFormData] = useState({
        name: '',
        channel: defaultChannel || 'email',
        trigger_type: 'manual',
        content_template: '',
        description: ''
    });

    React.useEffect(() => {
        if (template) {
            setFormData({
                name: template.name,
                channel: template.channel || 'whatsapp',
                trigger_type: template.trigger_type,
                content_template: template.content_template,
                description: template.description || ''
            });
        } else {
            setFormData({
                name: '',
                channel: defaultChannel || 'email',
                trigger_type: 'manual',
                content_template: 'שלום {{student_name}},\n\n',
                description: ''
            });
        }
    }, [template, open, defaultChannel]);

    const insertPlaceholder = (placeholder) => {
        setFormData(prev => ({
            ...prev,
            content_template: prev.content_template + placeholder
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{template ? 'עריכת תבנית' : 'תבנית חדשה'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                         <Label>שם התבנית</Label>
                         <Input 
                             value={formData.name} 
                             onChange={e => setFormData({...formData, name: e.target.value})}
                             placeholder="למשל: ברוכים הבאים לקורס"
                         />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>ערוץ שליחה</Label>
                            <Select 
                                value={formData.channel} 
                                onValueChange={val => setFormData({...formData, channel: val})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="בחר ערוץ שליחה" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                    <SelectItem value="sms">SMS</SelectItem>
                                    <SelectItem value="email">אימייל (HTML supported)</SelectItem>
                                    <SelectItem value="internal">פנימי</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>סוג טריגר</Label>
                            <Select 
                                value={formData.trigger_type} 
                                onValueChange={val => setFormData({...formData, trigger_type: val})}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manual">ידני (כללי)</SelectItem>
                                    <SelectItem value="course_welcome">פתיחת קורס</SelectItem>
                                    <SelectItem value="pre_session">תזכורת לפני שיעור</SelectItem>
                                    <SelectItem value="grade_published">פרסום ציון</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>תוכן ההודעה {formData.channel === 'email' && '(HTML)'}</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="secondary" className="cursor-pointer hover:bg-indigo-100" onClick={() => insertPlaceholder('{{student_name}}')}>שם תלמיד</Badge>
                            <Badge variant="secondary" className="cursor-pointer hover:bg-indigo-100" onClick={() => insertPlaceholder('{{course_name}}')}>שם קורס</Badge>
                            <Badge variant="secondary" className="cursor-pointer hover:bg-indigo-100" onClick={() => insertPlaceholder('{{link}}')}>🔗 קישור חכם</Badge>
                            <Badge variant="secondary" className="cursor-pointer hover:bg-amber-100" onClick={() => insertPlaceholder('{{session_date}}')}>תאריך שיעור</Badge>
                            <Badge variant="secondary" className="cursor-pointer hover:bg-amber-100" onClick={() => insertPlaceholder('{{session_time}}')}>שעה</Badge>
                        </div>
                        <Textarea 
                            value={formData.content_template} 
                            onChange={e => setFormData({...formData, content_template: e.target.value})}
                            className="min-h-[300px] font-mono text-sm"
                            dir="ltr"
                            placeholder={formData.channel === 'email' ? '<div>תוכן ה-HTML כאן...</div>' : 'תוכן ההודעה...'}
                        />
                        <p className="text-xs text-slate-500">
                            {formData.channel === 'email' ? 'ניתן להשתמש ב-HTML מלא לעיצוב המייל.' : 'הודעת טקסט רגילה.'}
                        </p>
                    </div>

                    <Button onClick={() => onSubmit(formData)} className="bg-indigo-600 hover:bg-indigo-700 w-full">
                        <Save className="w-4 h-4 mr-2" />
                        שמור תבנית
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}