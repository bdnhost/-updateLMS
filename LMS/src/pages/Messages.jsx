import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import {
  Plus,
  Search,
  MessageSquare,
  Send,
  Mail,
  Users,
  Loader2,
  CheckCircle,
  Phone,
  FileText,
  Link as LinkIcon,
  BookOpen,
  Variable,
  Sparkles } from
'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { createPageUrl } from '@/utils';
import { formatIsraelDate } from '@/components/utils/dateUtils';
import { Link } from 'react-router-dom';

export default function Messages() {
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    type: 'email'
  });
  const [sending, setSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Pre-select course from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const courseIdParam = params.get('courseId');
    if (courseIdParam) {
      setSelectedCourse(courseIdParam);
      setFormOpen(true);
    }
  }, []);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch current student record if user is not admin
  const { data: currentStudent } = useQuery({
    queryKey: ['currentStudent', user?.email],
    queryFn: async () => {
      const res = await base44.entities.Student.filter({ email: user?.email });
      return res[0];
    },
    enabled: !!user?.email && user?.role !== 'admin'
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', user?.organization_id, user?.role, currentStudent],
    queryFn: async () => {
      const all = await base44.entities.Message.filter({ organization_id: user?.organization_id });
      if (user?.role === 'admin') return all;

      if (currentStudent) {
        return all.filter((m) => m.student_ids && m.student_ids.includes(currentStudent.id));
      }
      return [];
    },
    enabled: !!user?.organization_id && (user?.role === 'admin' || !!currentStudent)
  });

  const { data: courses } = useQuery({
    queryKey: ['courses', user?.organization_id],
    queryFn: () => base44.entities.Course.filter({ organization_id: user?.organization_id }),
    enabled: !!user?.organization_id
  });

  const { data: students } = useQuery({
    queryKey: ['students', user?.organization_id],
    queryFn: () => base44.entities.Student.filter({ organization_id: user?.organization_id }, undefined, 1000),
    enabled: !!user?.organization_id
  });

  const { data: assignments } = useQuery({
    queryKey: ['assignments', user?.organization_id],
    queryFn: () => base44.entities.Assignment.filter({ organization_id: user?.organization_id }),
    enabled: !!user?.organization_id
  });

  const { data: materials } = useQuery({
    queryKey: ['materials', user?.organization_id],
    queryFn: () => base44.entities.Material.filter({ organization_id: user?.organization_id }),
    enabled: !!user?.organization_id
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

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create({ ...data, organization_id: user?.organization_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });

  const courseStudents = useMemo(() => {
    if (!selectedCourse || !students) return [];
    return students.filter((s) => s.course_id === selectedCourse && s.status === 'active');
  }, [students, selectedCourse]);

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedStudents(courseStudents.map((s) => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId, checked) => {
    if (checked) {
      setSelectedStudents((prev) => [...prev, studentId]);
    } else {
      setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
      setSelectAll(false);
    }
  };

  const resetForm = () => {
    setNewMessage({
      subject: '',
      content: '',
      type: 'email'
    });
    setSelectedCourse('');
    setSelectedStudents([]);
    setSelectAll(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.subject || !newMessage.content || selectedStudents.length === 0) {
      toast.error('נא למלא את כל השדות ולבחור נמענים');
      return;
    }

    setSending(true);

    try {
      let sentCount = 0;

      // Handle SMS Sending
      if (newMessage.type === 'sms') {
        // Send student IDs to allow backend to fetch details and handle personalization
        const response = await base44.functions.invoke('sendSMS', {
          student_ids: selectedStudents,
          message: newMessage.content,
          origin: window.location.origin,
          course_id: selectedCourse
        });

        if (response.data.recipientCount === 0 && response.data.details?.length > 0) {
          // Try to find a meaningful error
          const errorDetail = response.data.details.find((d) => d.status !== 'success');
          throw new Error(errorDetail?.error ? `שגיאה בשליחה: ${errorDetail.error}` : 'שגיאה בשליחת SMS');
        }
        sentCount = response.data.recipientCount;
      }
      // Handle Email Sending
      else if (newMessage.type === 'email') {
        const response = await base44.functions.invoke('sendCourseMessage', {
          student_ids: selectedStudents,
          subject: newMessage.subject,
          content: newMessage.content,
          organization_id: user.organization_id,
          origin: window.location.origin,
          course_id: selectedCourse
        });
        sentCount = response.data.count;
      }

      // Backend now handles logging to avoid duplicates and ensure consistency
      // Trigger refresh of messages list
      queryClient.invalidateQueries({ queryKey: ['messages'] });

      toast.success(`ההודעה נשלחה ל-${sentCount} תלמידים`);
      setFormOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'שגיאה בשליחת ההודעה');
    } finally {
      setSending(false);
    }
  };

  const handleTemplateChange = (templateId) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setNewMessage((prev) => ({
        ...prev,
        subject: template.name, // Use name as subject default
        content: template.content_template
      }));
      setSelectedTemplate(templateId);
    }
  };

  const addAttachment = (type, id) => {
    let item;
    let urlType;
    if (type === 'assignment') {
      item = assignments.find((a) => a.id === id);
      urlType = 'assignment';
    } else {
      item = materials.find((m) => m.id === id);
      urlType = 'material';
    }

    if (!item) return;

    const publicUrl = `${window.location.origin}${createPageUrl('PublicView')}?type=${urlType}&id=${id}`;
    const linkText = `\n\nקישור ל${type === 'assignment' ? 'מטלה' : 'חומר לימוד'}: ${item.title}\n${publicUrl}`;

    setNewMessage((prev) => ({
      ...prev,
      content: prev.content + linkText
    }));
    toast.success('קישור צורף לתוכן ההודעה');
  };

  const addVariable = (variable, label) => {
    setNewMessage((prev) => ({
      ...prev,
      content: prev.content + (prev.content.endsWith(' ') ? '' : ' ') + variable
    }));
    toast.success(`משתנה ${label} נוסף`);
  };

  const getCourseName = (courseId) => {
    return courses?.find((c) => c.id === courseId)?.name || '';
  };

  const filteredMessages = useMemo(() => {
    return messages?.filter((message) => {
      const matchesSearch = message.subject.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    }).sort((a, b) => new Date(b.created_date) - new Date(a.created_date)) || [];
  }, [messages, search]);

  const activeCourses = courses?.filter((c) => c.status === 'active') || [];

  const formatMessageContent = (content, message) => {
    if (!content) return '';
    let formatted = content;

    // Resolve Course
    const course = courses?.find((c) => c.id === message.course_id);
    if (course) {
      formatted = formatted.replace(/{{\s*course_name\s*}}/g, course.name);
    } else {
      formatted = formatted.replace(/{{\s*course_name\s*}}/g, 'שם הקורס');
    }

    // Resolve Student - for multi-recipient messages, show generic placeholders
    if (message.student_ids?.length === 1) {
      const student = students?.find((s) => s.id === message.student_ids[0]);
      if (student) {
        formatted = formatted.replace(/{{\s*student_name\s*}}/g, student.full_name);
        formatted = formatted.replace(/{{\s*student_id\s*}}/g, student.id || '');
        const link = `${window.location.origin}${createPageUrl('PublicView')}?type=student&id=${student.id}`;
        formatted = formatted.replace(/{{\s*student_public_link\s*}}/g, link);
      }
    } else if (message.student_ids?.length > 1) {
      // For bulk messages, show generic placeholders
      formatted = formatted.replace(/{{\s*student_name\s*}}/g, '[שם התלמיד]');
      formatted = formatted.replace(/{{\s*student_id\s*}}/g, '[מזהה]');
      formatted = formatted.replace(/{{\s*student_public_link\s*}}/g, '[קישור אישי]');
    }

    // Remove {{content}} placeholder (recursive placeholder issue)
    formatted = formatted.replace(/{{\s*content\s*}}/g, '');

    return formatted;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">הודעות</h1>
          <p className="text-slate-500 mt-1">שליחת הודעות לתלמידים</p>
        </div>
        <div className="flex gap-2">
            <Link to="/Settings?tab=templates">
                <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    ניהול תבניות
                </Button>
            </Link>
            <Button onClick={() => {resetForm();setFormOpen(true);}} className="bg-pink-800 text-primary-foreground px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 h-9">
              <Plus className="h-4 w-4 ml-2" />
              הודעה חדשה
            </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="חיפוש הודעה..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10" />

        </div>
      </div>

      {/* Messages List */}
      {isLoading ?
      <div className="space-y-4">
          {[1, 2, 3].map((i) =>
        <Skeleton key={i} className="h-24 w-full" />
        )}
        </div> :
      filteredMessages.length === 0 ?
      <Card className="p-16 text-center">
          <MessageSquare className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">
            {search ? 'לא נמצאו הודעות' : 'אין הודעות עדיין'}
          </h3>
          <p className="text-slate-400 mb-4">
            {search ? 'נסה לשנות את החיפוש' : 'שלח את ההודעה הראשונה שלך'}
          </p>
          {!search &&
        <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              הודעה חדשה
            </Button>
        }
        </Card> :

      <div className="space-y-4">
          {filteredMessages.map((message) =>
        <Card key={message.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${message.type === 'email' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                  {message.type === 'email' ? <Mail className="h-5 w-5 text-blue-600" /> :
              message.type === 'sms' ? <Phone className="h-5 w-5 text-green-600" /> :
              <MessageSquare className="h-5 w-5 text-slate-600" />
              }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                        {message.direction === 'inbound' ?
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                הודעה נכנסת
                            </Badge> :

                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                הודעה יוצאת
                            </Badge>
                  }
                        <h3 className="font-semibold text-slate-800">{message.subject}</h3>
                    </div>
                    {message.is_sent &&
                <Badge className="bg-emerald-100 text-emerald-700">
                        <CheckCircle className="h-3 w-3 ml-1" />
                        {message.direction === 'inbound' ? 'התקבל' : 'נשלח'}
                      </Badge>
                }
                  </div>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-2 whitespace-pre-wrap">
                    {formatMessageContent(message.content, message)}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <Badge variant="outline">
                      {getCourseName(message.course_id)}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {message.student_ids?.length || 0} נמענים
                    </span>
                    <span>
                      {formatIsraelDate(message.created_date)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
        )}
        </div>
      }

      {/* New Message Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>הודעה חדשה</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>קורס *</Label>
                <Select
                  value={selectedCourse}
                  onValueChange={(value) => {
                    setSelectedCourse(value);
                    setSelectedStudents([]);
                    setSelectAll(false);
                  }}>

                  <SelectTrigger>
                    <SelectValue placeholder="בחר קורס" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCourses.map((course) =>
                    <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>סוג שליחה</Label>
                <Select
                  value={newMessage.type}
                  onValueChange={(value) => setNewMessage((prev) => ({ ...prev, type: value }))}>

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">אימייל</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="internal">פנימי בלבד</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
                <Label>תבנית הודעה</Label>
                <Select
                value={selectedTemplate}
                onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר תבנית מוכנה..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates?.map((t) =>
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  )}
                  </SelectContent>
                </Select>
            </div>

            {selectedCourse &&
            <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>צרף מטלה</Label>
                        <Select onValueChange={(val) => addAttachment('assignment', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="בחר מטלה..." />
                            </SelectTrigger>
                            <SelectContent>
                                {assignments?.filter((a) => a.course_id === selectedCourse).map((a) =>
                    <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                    )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>צרף חומר לימוד</Label>
                         <Select onValueChange={(val) => addAttachment('material', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="בחר חומר..." />
                            </SelectTrigger>
                            <SelectContent>
                                {materials?.filter((m) => m.course_id === selectedCourse).map((m) =>
                    <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                    )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            }

            <div className="flex gap-2 mb-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                            <Variable className="h-4 w-4" />
                            הוסף משתנה
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => addVariable('{{student_name}}', 'שם תלמיד')}>
                            שם התלמיד {'{{student_name}}'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addVariable('{{course_name}}', 'שם הקורס')}>
                            שם הקורס {'{{course_name}}'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 text-violet-600 border-violet-200 hover:bg-violet-50">
                            <LinkIcon className="h-4 w-4" />
                            הוסף קישור חכם
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => addVariable('{{student_public_link}}', 'קישור חכם (אזור אישי)')}>
                            <Sparkles className="w-3 h-3 mr-2 text-violet-500" />
                            קישור לפורטל תלמיד
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                    const link = `${window.location.origin}${createPageUrl('PublicView')}?type=course&id=${selectedCourse}`;
                    setNewMessage((prev) => ({ ...prev, content: prev.content + ' ' + link }));
                  }}>
                           <LinkIcon className="w-3 h-3 mr-2" />
                           קישור לדף הקורס
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {selectedCourse &&
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>נמענים *</Label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll} />

                    <span className="text-sm text-slate-600">בחר הכל</span>
                  </div>
                </div>
                <div className="border rounded-lg max-h-40 overflow-y-auto p-2 space-y-1">
                  {courseStudents.length === 0 ?
                <p className="text-sm text-slate-400 text-center py-2">
                      אין תלמידים בקורס זה
                    </p> :

                courseStudents.map((student) =>
                <div key={student.id} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded">
                        <Checkbox
                    checked={selectedStudents.includes(student.id)}
                    onCheckedChange={(checked) => handleSelectStudent(student.id, checked)} />

                        <span className="text-sm">{student.full_name}</span>
                        {student.email &&
                  <span className="text-xs text-slate-400">({student.email})</span>
                  }
                      </div>
                )
                }
                </div>
                <p className="text-sm text-slate-500">
                  נבחרו {selectedStudents.length} מתוך {courseStudents.length} תלמידים
                </p>
              </div>
            }

            {newMessage.type !== 'sms' &&
            <div className="space-y-2">
                <Label>נושא *</Label>
                <Input
                value={newMessage.subject}
                onChange={(e) => setNewMessage((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="נושא ההודעה" />
                </div>
            }

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>תוכן *</Label>
                {newMessage.type === 'sms' &&
                <span className={`text-xs ${newMessage.content.length > 70 ? 'text-orange-500 font-medium' : 'text-slate-400'}`}>
                        {newMessage.content.length} תווים ({Math.ceil(newMessage.content.length / 70)} הודעות)
                    </span>
                }
              </div>
              <Textarea
                value={newMessage.content}
                onChange={(e) => setNewMessage((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="תוכן ההודעה..."
                rows={6} />

            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                ביטול
              </Button>
              <Button onClick={handleSendMessage} disabled={sending} className="bg-indigo-700 text-primary-foreground px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 h-9">
                {sending ?
                <Loader2 className="h-4 w-4 ml-2 animate-spin" /> :

                <Send className="h-4 w-4 ml-2" />
                }
                שליחה
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>);

}