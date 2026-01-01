import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription } from
'@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Loader2,
  Send,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Sparkles,
  Users } from
'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

export default function UnifiedMessageDialog({ open, onClose, recipients = [], initialTab = 'email', initialContent = '', onSuccess, courseId }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState(initialContent || '');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState(null);

  // WhatsApp specific
  const [waMode, setWaMode] = useState('individual'); // 'individual' or 'group'

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: templates } = useQuery({
    queryKey: ['notificationTemplates', user?.organization_id],
    queryFn: () => {
      if (user?.organization_id) {
        return base44.entities.NotificationTemplate.filter({ organization_id: user.organization_id });
      }
      return base44.entities.NotificationTemplate.list({ limit: 100 });
    },
    enabled: !!user
  });

  // Filter templates based on active tab
  const filteredTemplates = templates?.filter((t) => {
      if (!t.channel || t.channel === 'internal') return true;
      if (activeTab === 'email') return t.channel === 'email';
      if (activeTab === 'sms') return t.channel === 'sms';
      if (activeTab === 'whatsapp') return t.channel === 'whatsapp';
      return false;
  });

  const handleTemplateChange = (templateId) => {
    const template = templates?.find((t) => t.id === templateId);
    if (template) {
      if (activeTab === 'email') setSubject(template.name);
      setContent(template.content_template);
    }
  };

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      setSubject('');
      setContent(initialContent || '');
      setResult(null);
      // Default WA mode based on recipients count and context
      if (recipients.length > 1 && courseId) {
          setWaMode('individual'); // Default to safe individual, user can switch to group
      }
    }
  }, [open]);

  const handleSend = async () => {
    if (activeTab === 'email' && (!subject || !content)) {
      toast.error('נא למלא נושא ותוכן');
      return;
    }
    if ((activeTab === 'sms' || activeTab === 'whatsapp') && !content) {
        toast.error('נא למלא תוכן הודעה');
        return;
    }

    if (!recipients || recipients.length === 0) {
      toast.error('אין נמענים להודעה');
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      let sentCount = 0;
      const studentIds = recipients.map((r) => r.id);

      // Determine effective course ID
      let effectiveCourseId = courseId;
      if (!effectiveCourseId && recipients.length > 0) {
          const firstCourse = recipients[0].course_id;
          if (firstCourse && recipients.every(r => r.course_id === firstCourse)) {
              effectiveCourseId = firstCourse;
          }
      }

      if (activeTab === 'sms') {
        // Validate that all recipients have phone numbers
        const recipientsWithPhone = recipients.filter(r => r.phone);
        if (recipientsWithPhone.length === 0) {
          throw new Error('אף אחד מהנמענים אין לו מספר טלפון');
        }
        if (recipientsWithPhone.length < recipients.length) {
          toast.warning(`${recipients.length - recipientsWithPhone.length} נמענים ללא מספר טלפון יידלגו`);
        }

        const response = await base44.functions.invoke('sendSMS', {
          student_ids: recipientsWithPhone.map(r => r.id),
          message: content,
          origin: window.location.origin,
          course_id: effectiveCourseId
        });
        
        if (response.data?.error) throw new Error(response.data.error);
        sentCount = response.data?.recipientCount || 0;
      } 
      else if (activeTab === 'email') {
        const response = await base44.functions.invoke('sendCourseMessage', {
          student_ids: studentIds,
          subject: subject,
          content: content,
          organization_id: user?.organization_id,
          origin: window.location.origin,
          course_id: effectiveCourseId
        });
        sentCount = response.data?.count || 0;
      }
      else if (activeTab === 'whatsapp') {
          // Check if we are sending to a course group or individuals
          if (waMode === 'group' && effectiveCourseId) {
               // Send to course group
               // First, fetch the course to get the chat ID
               const course = await base44.entities.Course.get(effectiveCourseId);
               if (!course.whatsapp_chat_id) {
                   throw new Error('הקורס אינו מקושר לקבוצת WhatsApp');
               }
               
               await base44.functions.invoke('sendWhatsApp', {
                   chatId: course.whatsapp_chat_id,
                   body: content,
                   courseId: effectiveCourseId,
                   isGroup: true
               });
               sentCount = recipients.length; // Assume everyone in group sees it
          } else {
               // Send to individuals
               // We'll loop or use a bulk function. Currently sendWhatsApp sends one message.
               // We should probably create a bulk function or loop here.
               // Let's loop for now as we don't have bulk WA function exposed yet.
               // Actually, sendWhatsApp is single.
               // Warning: This might be slow for many students.
               
               // Optimization: Create a bulk backend function later. For now, loop.
               const promises = recipients.map(async (student) => {
                   if (!student.phone && !student.whatsapp_chat_id) return;
                   
                   // Determine chat ID
                   const chatId = student.whatsapp_chat_id || (student.phone ? `${student.phone.replace(/[^0-9]/g, '').replace(/^0/, '972')}@c.us` : null);
                   if (!chatId) return;

                   await base44.functions.invoke('sendWhatsApp', {
                       chatId: chatId,
                       body: content,
                       studentId: student.id,
                       courseId: effectiveCourseId,
                       isGroup: false,
                       origin: window.location.origin
                   });
               });
               
               await Promise.all(promises);
               sentCount = promises.length;
          }
      }

      setResult({ success: true, count: sentCount });
      toast.success(`הודעה נשלחה בהצלחה`);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        if (open) onClose();
      }, 2000);

    } catch (error) {
      console.error(error);
      setResult({ success: false, error: error.message || 'שגיאה בשליחה' });
      toast.error(error.message || 'שגיאה בשליחה');
    } finally {
      setIsSending(false);
    }
  };

  const recipientNames = recipients.map((r) => r.full_name).join(', ');
  const displayNames = recipientNames.length > 50 ? recipientNames.substring(0, 50) + '...' : recipientNames;

  const insertLink = (linkType) => {
    let displayText = '';
    switch (linkType) {
      case 'student_portal': displayText = ` {{student_public_link}} `; break;
      case 'course_syllabus': displayText = ` {{public_course_link}} `; break;
      case 'student_name': displayText = ` {{student_name}} `; break;
      case 'course_name': displayText = ` {{course_name}} `; break;
      case 'student_id': displayText = ` {{student_id}} `; break;
    }
    setContent((prev) => prev + displayText);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] h-[600px] flex flex-col overflow-hidden rounded-xl">
        <DialogHeader>
          <DialogTitle>שליחת הודעה</DialogTitle>
          <DialogDescription>
            אל: {displayNames} ({recipients.length})
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                </TabsTrigger>
                <TabsTrigger value="sms" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> SMS
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email
                </TabsTrigger>
            </TabsList>

            <div className="flex-1 py-4 flex flex-col gap-4 overflow-y-auto">
                {/* Template & Options */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>תבנית</Label>
                        <Select onValueChange={handleTemplateChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="בחר תבנית..." />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredTemplates?.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {activeTab === 'whatsapp' && courseId && recipients.length > 1 && (
                        <div className="space-y-2">
                            <Label>יעד שילוח</Label>
                            <Select value={waMode} onValueChange={setWaMode}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="individual">אישי לכל תלמיד</SelectItem>
                                    <SelectItem value="group">לקבוצת הקורס</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {activeTab === 'email' && (
                    <div className="space-y-2">
                        <Label>נושא</Label>
                        <Input 
                            value={subject} 
                            onChange={(e) => setSubject(e.target.value)} 
                            placeholder="נושא ההודעה"
                        />
                    </div>
                )}

                <div className="space-y-2 flex-1 flex flex-col">
                    <div className="flex justify-between items-center">
                        <Label>תוכן ההודעה</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-violet-600">
                                    <LinkIcon className="w-3 h-3" /> משתנים דינמיים
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => insertLink('student_name')}>שם התלמיד</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => insertLink('student_id')}>מזהה התלמיד</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => insertLink('course_name')}>שם הקורס</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => insertLink('student_portal')}>קישור לפורטל</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => insertLink('course_syllabus')}>קישור לקורס</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Textarea 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                        placeholder="כתוב את ההודעה כאן..."
                        className="flex-1 min-h-[150px] resize-none"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>{content.length} תווים</span>
                        {activeTab === 'sms' && <span>~{Math.ceil(content.length / 70)} הודעות SMS</span>}
                    </div>
                </div>

                {result && (
                    <div className={`p-3 rounded-lg flex items-center gap-2 ${result.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {result.success ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        <p className="text-sm font-medium">
                            {result.success ? `נשלח בהצלחה!` : result.error}
                        </p>
                    </div>
                )}
            </div>
        </Tabs>

        <div className="flex justify-end gap-2 pt-2 border-t mt-auto">
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button 
            onClick={handleSend} 
            disabled={isSending}
            className="bg-violet-600 hover:bg-violet-700 text-white min-w-[100px]"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-2 rtl:rotate-180" />}
            {activeTab === 'whatsapp' ? 'שלח ל-WhatsApp' : activeTab === 'sms' ? 'שלח SMS' : 'שלח Email'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}