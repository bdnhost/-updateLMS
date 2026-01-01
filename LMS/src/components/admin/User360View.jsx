import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from
'@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  User, Building, CreditCard, Activity, Shield,
  LogIn, History, AlertTriangle, CheckCircle2,
  Smartphone, MapPin, Clock, GraduationCap, FileText,
  Users, FolderOpen, Calendar } from
'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function User360View({ user, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');

  // Fetch Organization
  const { data: organization } = useQuery({
    queryKey: ['organization', user?.organization_id],
    queryFn: () => base44.entities.Organization.get(user.organization_id),
    enabled: !!user?.organization_id
  });

  // Fetch Plan
  const { data: plan } = useQuery({
    queryKey: ['plan', organization?.plan_id],
    queryFn: () => base44.entities.SubscriptionPlan.get(organization.plan_id),
    enabled: !!organization?.plan_id
  });

  // Fetch Audit Logs
  const { data: auditLogs } = useQuery({
    queryKey: ['auditLogs', user?.id],
    queryFn: () => base44.entities.AuditLog.filter({ actor_id: user?.id }, '-created_date', 20),
    enabled: !!user?.id
  });

  // Fetch Payments
  const { data: payments } = useQuery({
    queryKey: ['payments', organization?.id],
    queryFn: () => base44.entities.Payment.filter({ organization_id: organization?.id }, '-date'),
    enabled: !!organization?.id
  });

  // Fetch User Created Resources
  const { data: userCourses } = useQuery({
    queryKey: ['userCourses', user?.email],
    queryFn: () => base44.entities.Course.filter({ created_by: user.email }, '-created_date'),
    enabled: !!user?.email && isOpen
  });

  const { data: userSessions } = useQuery({
    queryKey: ['userSessions', user?.email],
    queryFn: () => base44.entities.CourseSession.filter({ created_by: user.email }, '-created_date', 100),
    enabled: !!user?.email && isOpen
  });

  const { data: userAssignments } = useQuery({
    queryKey: ['userAssignments', user?.email],
    queryFn: () => base44.entities.Assignment.filter({ created_by: user.email }, '-created_date'),
    enabled: !!user?.email && isOpen
  });

  const { data: userStudents } = useQuery({
    queryKey: ['userStudents', user?.email],
    queryFn: () => base44.entities.Student.filter({ created_by: user.email }, '-created_date'),
    enabled: !!user?.email && isOpen
  });

  const { data: userMaterials } = useQuery({
    queryKey: ['userMaterials', user?.email],
    queryFn: () => base44.entities.Material.filter({ created_by: user.email }, '-created_date', 100),
    enabled: !!user?.email && isOpen
  });

  // Update Notes Mutation
  const updateNotesMutation = useMutation({
    mutationFn: (newNotes) => base44.entities.Organization.update(organization.id, { internal_notes: newNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', user?.organization_id] });
      toast.success('הערות עודכנו בהצלחה');
    }
  });

  // Load notes when organization loads
  React.useEffect(() => {
    if (organization?.internal_notes) {
      setNotes(organization.internal_notes);
    }
  }, [organization]);

  const handleImpersonate = () => {
    // In a real app, this would swap tokens
    // base44.auth.impersonate(user.id);
    toast.info(`התחברות כ-${user.full_name} (סימולציה)`);
    // Create an audit log for this action
    base44.entities.AuditLog.create({
      action: 'impersonate',
      actor_id: 'admin', // Placeholder
      actor_name: 'Admin',
      target_resource: `User:${user.id}`,
      details: 'Admin started impersonation session',
      ip_address: '127.0.0.1'
    });
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-500">
                    {user.avatar_url ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-full object-cover" /> : user.full_name?.[0]}
                </div>
                <div>
                    <DialogTitle className="text-2xl">{user.full_name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2">
                        <span>{user.email}</span>
                        <span>•</span>
                        <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                            {user.status || 'Active'}
                        </Badge>
                    </DialogDescription>
                </div>
            </div>
            <Button variant="outline" className="gap-2 text-violet-600 border-violet-200 hover:bg-violet-50" onClick={handleImpersonate}>
                <LogIn className="w-4 h-4" />
                התחבר כמשתמש
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:bg-transparent">
                    <User className="w-4 h-4 mr-2" /> סקירה כללית
                </TabsTrigger>
                <TabsTrigger value="subscription" className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:bg-transparent">
                    <CreditCard className="w-4 h-4 mr-2" /> מנוי וחיובים
                </TabsTrigger>
                <TabsTrigger value="usage" className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:bg-transparent">
                    <Activity className="w-4 h-4 mr-2" /> שימוש ומשאבים
                </TabsTrigger>
                <TabsTrigger value="audit" className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:bg-transparent">
                    <History className="w-4 h-4 mr-2" /> לוג פעילות
                </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 p-6">
                <TabsContent value="overview" className="space-y-6 mt-0">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2"><User className="w-4 h-4" /> פרטים אישיים</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-500">טלפון</p>
                                    <p>{user.phone || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">תפקיד</p>
                                    <p>{user.job_title || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">הצטרף בתאריך</p>
                                    <p>{format(new Date(user.created_date), 'dd/MM/yyyy')}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">כניסה אחרונה</p>
                                    <p>{user.last_login ? format(new Date(user.last_login), 'dd/MM/yyyy HH:mm') : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">IP אחרון</p>
                                    <p>{user.last_ip || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2"><Building className="w-4 h-4" /> פרטי ארגון</h3>
                            {organization ?
                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500">שם הארגון</p>
                                        <p>{organization.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">אימייל לחיוב</p>
                                        <p>{organization.billing_email}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">כתובת</p>
                                        <p>{organization.address || '-'}</p>
                                    </div>
                                </div> :

                  <p className="text-slate-500">לא משויך לארגון</p>
                  }
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2"><Shield className="w-4 h-4" /> הערות פנימיות (Admin Only)</h3>
                        <div className="flex gap-2">
                            <Textarea
                    placeholder="הוסף הערות לצוות הניהול..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-yellow-50 border-yellow-200" />

                            <Button
                    className="self-end"
                    onClick={() => updateNotesMutation.mutate(notes)}
                    disabled={updateNotesMutation.isPending}>

                                שמור
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="subscription" className="space-y-6 mt-0">
                    {organization && plan ?
              <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                <div>
                                    <p className="text-sm text-slate-500">תוכנית נוכחית</p>
                                    <h3 className="text-xl font-bold text-violet-700">{plan.name}</h3>
                                    <p className="text-sm text-slate-500">{plan.price}₪ / {plan.period}</p>
                                </div>
                                <div className="text-left">
                                    <Badge variant={organization.subscription_status === 'active' ? 'default' : 'destructive'} className="bg-green-700 text-primary-foreground px-2.5 py-0.5 text-xs font-semibold rounded-md inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent shadow hover:bg-primary/80">
                                        {organization.subscription_status}
                                    </Badge>
                                    {organization.current_period_end &&
                    <p className="text-xs text-slate-500 mt-1">
                                            בתוקף עד: {format(new Date(organization.current_period_end), 'dd/MM/yyyy')}
                                        </p>
                    }
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" className="w-full" asChild>
                                    <a href={`/Settings?tab=billing`} target="_blank">
                                        <CreditCard className="w-4 h-4 mr-2" /> צפה בפורטל חיובים
                                    </a>
                                </Button>
                                <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                                    ביטול מנוי
                                </Button>
                            </div>

                            {/* Payment History */}
                            <div className="mt-6">
                                <h4 className="font-semibold mb-4 flex items-center gap-2">
                                    <History className="w-4 h-4" /> היסטוריית תשלומים
                                </h4>
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="bg-slate-50 p-3 grid grid-cols-4 gap-4 text-xs font-medium text-slate-500 border-b">
                                        <div>תאריך</div>
                                        <div>סכום</div>
                                        <div>תיאור</div>
                                        <div className="text-left">סטטוס</div>
                                    </div>
                                    <div className="divide-y max-h-60 overflow-y-auto">
                                        {payments?.map(payment => (
                                            <div key={payment.id} className="p-3 grid grid-cols-4 gap-4 text-sm hover:bg-slate-50">
                                                <div>{format(new Date(payment.date), 'dd/MM/yyyy')}</div>
                                                <div className="font-medium">₪{payment.amount}</div>
                                                <div className="truncate" title={payment.description}>{payment.description}</div>
                                                <div className="text-left">
                                                    <Badge variant={payment.status === 'succeeded' ? 'outline' : 'secondary'} className={payment.status === 'succeeded' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                                                        {payment.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                        {(!payments || payments.length === 0) && (
                                            <div className="p-4 text-center text-slate-500 text-sm">
                                                אין היסטוריית תשלומים
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div> :

              <div className="text-center py-10 text-slate-500">
                            אין מידע על מנוי פעיל
                        </div>
              }
                </TabsContent>

                <TabsContent value="usage" className="space-y-6 mt-0">
                    <div className="space-y-6">
                        {/* SMS Usage */}
                        {organization && plan && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium flex items-center gap-2">
                                        <Smartphone className="w-4 h-4" /> חבילת SMS
                                    </span>
                                    <span className="text-slate-500">
                                        {organization.sms_usage} / {plan.max_sms || '∞'}
                                    </span>
                                </div>
                                <Progress value={Math.min((organization.sms_usage || 0) / (plan.max_sms || 1) * 100, 100)} className="h-3" />
                                <p className="text-xs text-slate-500">
                                    מתאפס ב: {organization.sms_reset_date ? format(new Date(organization.sms_reset_date), 'dd/MM/yyyy') : '-'}
                                </p>
                            </div>
                        )}

                        {/* Created Resources Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded-lg bg-violet-50 border-violet-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <GraduationCap className="w-5 h-5 text-violet-600" />
                                    <p className="text-sm font-medium text-violet-900">קורסים</p>
                                </div>
                                <p className="text-3xl font-bold text-violet-700">{userCourses?.length || 0}</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    <p className="text-sm font-medium text-blue-900">מפגשים</p>
                                </div>
                                <p className="text-3xl font-bold text-blue-700">{userSessions?.length || 0}</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-5 h-5 text-amber-600" />
                                    <p className="text-sm font-medium text-amber-900">מטלות</p>
                                </div>
                                <p className="text-3xl font-bold text-amber-700">{userAssignments?.length || 0}</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-emerald-50 border-emerald-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-5 h-5 text-emerald-600" />
                                    <p className="text-sm font-medium text-emerald-900">תלמידים</p>
                                </div>
                                <p className="text-3xl font-bold text-emerald-700">{userStudents?.length || 0}</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-indigo-50 border-indigo-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <FolderOpen className="w-5 h-5 text-indigo-600" />
                                    <p className="text-sm font-medium text-indigo-900">חומרי לימוד</p>
                                </div>
                                <p className="text-3xl font-bold text-indigo-700">{userMaterials?.length || 0}</p>
                            </div>
                        </div>

                        {/* Detailed Resources Lists */}
                        <div className="space-y-4">
                            {/* Courses List */}
                            {userCourses && userCourses.length > 0 && (
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="bg-violet-50 p-3 font-semibold text-sm flex items-center gap-2 border-b">
                                        <GraduationCap className="w-4 h-4 text-violet-600" />
                                        קורסים שנוצרו ({userCourses.length})
                                    </div>
                                    <div className="divide-y max-h-48 overflow-y-auto">
                                        {userCourses.slice(0, 10).map(course => (
                                            <div key={course.id} className="p-3 hover:bg-slate-50 flex justify-between items-center text-sm">
                                                <div>
                                                    <p className="font-medium">{course.name}</p>
                                                    <p className="text-xs text-slate-500">{course.code}</p>
                                                </div>
                                                <p className="text-xs text-slate-400">{format(new Date(course.created_date), 'dd/MM/yyyy')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Assignments List */}
                            {userAssignments && userAssignments.length > 0 && (
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="bg-amber-50 p-3 font-semibold text-sm flex items-center gap-2 border-b">
                                        <FileText className="w-4 h-4 text-amber-600" />
                                        מטלות שנוצרו ({userAssignments.length})
                                    </div>
                                    <div className="divide-y max-h-48 overflow-y-auto">
                                        {userAssignments.slice(0, 10).map(assignment => (
                                            <div key={assignment.id} className="p-3 hover:bg-slate-50 flex justify-between items-center text-sm">
                                                <div>
                                                    <p className="font-medium">{assignment.title}</p>
                                                    <p className="text-xs text-slate-500">{assignment.type}</p>
                                                </div>
                                                <p className="text-xs text-slate-400">{format(new Date(assignment.created_date), 'dd/MM/yyyy')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Students List */}
                            {userStudents && userStudents.length > 0 && (
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="bg-emerald-50 p-3 font-semibold text-sm flex items-center gap-2 border-b">
                                        <Users className="w-4 h-4 text-emerald-600" />
                                        תלמידים שנוצרו ({userStudents.length})
                                    </div>
                                    <div className="divide-y max-h-48 overflow-y-auto">
                                        {userStudents.slice(0, 10).map(student => (
                                            <div key={student.id} className="p-3 hover:bg-slate-50 flex justify-between items-center text-sm">
                                                <div>
                                                    <p className="font-medium">{student.full_name}</p>
                                                    <p className="text-xs text-slate-500">{student.email}</p>
                                                </div>
                                                <p className="text-xs text-slate-400">{format(new Date(student.created_date), 'dd/MM/yyyy')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="audit" className="space-y-4 mt-0">
                    <div className="border rounded-md">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="p-2 text-right">פעולה</th>
                                    <th className="p-2 text-right">משאב</th>
                                    <th className="p-2 text-right">IP</th>
                                    <th className="p-2 text-right">תאריך</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs?.map((log) =>
                    <tr key={log.id} className="border-b last:border-0 hover:bg-slate-50">
                                        <td className="p-2">{log.action}</td>
                                        <td className="p-2 text-slate-500">{log.target_resource}</td>
                                        <td className="p-2 text-mono text-xs">{log.ip_address}</td>
                                        <td className="p-2 text-slate-500">
                                            {format(new Date(log.created_date), 'dd/MM/yyyy HH:mm')}
                                        </td>
                                    </tr>
                    )}
                                {!auditLogs?.length &&
                    <tr>
                                        <td colSpan={4} className="p-4 text-center text-slate-500">
                                            אין פעילות מתועדת
                                        </td>
                                    </tr>
                    }
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
            </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>);

}