import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from
'@/components/ui/table';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle } from
"@/components/ui/alert-dialog";
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  Mail,
  Calendar,
  TrendingUp,
  Activity,
  GraduationCap,
  BookOpen,
  Filter,
  Download,
  ShieldAlert,
  RefreshCw,
  Loader2,
  Sparkles,
  CreditCard,
  Crown } from
'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import PlanManager from '@/components/admin/PlanManager';
import User360View from '@/components/admin/User360View';
import AuditLogTable from '@/components/admin/AuditLogTable';
import OrganizationList from '@/components/admin/OrganizationList';
import SMSConfig from '@/components/admin/SMSConfig';
import SystemConfig from '@/components/admin/SystemConfig';
import PublicResourcesMonitor from '@/components/admin/PublicResourcesMonitor';

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

  const queryClient = useQueryClient();

  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = currentUser?.role === 'admin';

  // Fetch all data (hooks must be called unconditionally)
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => base44.entities.User.list(null, 1000),
    enabled: isAdmin
  });

  const { data: organizations } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => base44.entities.Organization.list(null, 1000),
    enabled: isAdmin
  });

  const { data: courses } = useQuery({
    queryKey: ['all_courses_admin'],
    queryFn: () => base44.asServiceRole.entities.Course.list(null, 1000),
    enabled: isAdmin
  });

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: () => base44.entities.SubscriptionPlan.list(),
    enabled: isAdmin
  });

  const { data: students } = useQuery({
    queryKey: ['all_students_admin'],
    queryFn: () => base44.asServiceRole.entities.Student.list(null, 1000),
    enabled: isAdmin
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowEditDialog(false);
      toast.success('המשתמש עודכן בהצלחה');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id) => base44.entities.User.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteUser(null);
      toast.success('המשתמש נמחק');
    }
  });

  // NOW we can do early returns after all hooks
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">גישה מוגבלת</h2>
          <p className="text-slate-600 mb-4">אין לך הרשאות לצפות בדף זה. דף זה מיועד רק למשתמשי Admin.</p>
        </Card>
      </div>
    );
  }

  // Stats calculations
  const totalUsers = users?.length || 0;
  const adminUsers = users?.filter((u) => u.role === 'admin')?.length || 0;
  const regularUsers = totalUsers - adminUsers;
  const totalCourses = courses?.length || 0;
  const totalStudents = students?.length || 0;

  // Recent users (last 7 days)
  const recentUsers = users?.filter((u) => {
    const createdDate = new Date(u.created_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdDate > weekAgo;
  })?.length || 0;

  // Filter users
  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setShowEditDialog(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    updateUserMutation.mutate({
      id: editingUser.id,
      data: {
        role: editingUser.role,
        full_name: editingUser.full_name
      }
    });
  };

  const exportUsers = () => {
    const csvContent = [
    ['שם', 'אימייל', 'תפקיד', 'תאריך הרשמה'].join(','),
    ...filteredUsers.map((u) => [
    u.full_name,
    u.email,
    u.role === 'admin' ? 'מנהל' : 'משתמש',
    format(new Date(u.created_date), 'dd/MM/yyyy')].
    join(','))].
    join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users_export.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">ניהול מערכת</h1>
          <p className="text-slate-500 mt-1">דשבורד ניהול וסטטיסטיקות</p>
        </div>
        <Button onClick={exportUsers} className="bg-fuchsia-800 text-primary-foreground px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 h-9">
          <Download className="h-4 w-4 ml-2" />
          ייצוא משתמשים
        </Button>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-2">
          <TabsTrigger value="users">משתמשים וסטטיסטיקות</TabsTrigger>
          <TabsTrigger value="organizations">ארגונים</TabsTrigger>
          <TabsTrigger value="plans">תוכניות ומחירים</TabsTrigger>
          <TabsTrigger value="system">הגדרות מערכת</TabsTrigger>
          <TabsTrigger value="public">משאבים ציבוריים</TabsTrigger>
          <TabsTrigger value="audit">לוג אבטחה</TabsTrigger>
          <TabsTrigger value="sms">הגדרות SMS</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-800">{totalUsers}</p>
                  <p className="text-slate-500 text-sm">סה"כ משתמשים</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-100 rounded-xl">
                  <ShieldCheck className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-800">{adminUsers}</p>
                  <p className="text-slate-500 text-sm">מנהלים</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-800">+{recentUsers}</p>
                  <p className="text-slate-500 text-sm">משתמשים חדשים השבוע</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <BookOpen className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-800">{totalCourses}</p>
                  <p className="text-slate-500 text-sm">קורסים פעילים</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Activity Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">סטטיסטיקות מערכת</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <GraduationCap className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-slate-800">{totalStudents}</p>
                  <p className="text-sm text-slate-500">תלמידים רשומים</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <BookOpen className="h-8 w-8 mx-auto text-violet-600 mb-2" />
                  <p className="text-2xl font-bold text-slate-800">{totalCourses}</p>
                  <p className="text-sm text-slate-500">קורסים</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <Activity className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
                  <p className="text-2xl font-bold text-slate-800">{regularUsers}</p>
                  <p className="text-sm text-slate-500">משתמשים רגילים</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">התפלגות משתמשים</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">מנהלים</span>
                    <span className="text-sm font-medium">{adminUsers}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full"
                      style={{ width: `${totalUsers > 0 ? adminUsers / totalUsers * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">משתמשים</span>
                    <span className="text-sm font-medium">{regularUsers}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${totalUsers > 0 ? regularUsers / totalUsers * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Users Table */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="חיפוש לפי שם או אימייל..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10" />

                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 ml-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל התפקידים</SelectItem>
                    <SelectItem value="admin">מנהלים</SelectItem>
                    <SelectItem value="user">משתמשים</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-right">משתמש</TableHead>
                  <TableHead className="text-right">תפקיד</TableHead>
                  <TableHead className="text-right">חבילה וסטטוס</TableHead>
                  <TableHead className="text-right hidden md:table-cell">תאריך הרשמה</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                      לא נמצאו משתמשים
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const userOrg = organizations?.find(o => o.id === user.organization_id);
                    const userPlan = plans?.find(p => p.id === userOrg?.plan_id);
                    
                    return (
                      <TableRow key={user.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-medium">
                              {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{user.full_name || 'ללא שם'}</p>
                              <p className="text-sm text-slate-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={user.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}>
                            {user.role === 'admin' ? (
                              <><ShieldCheck className="h-3 w-3 ml-1" /> מנהל</>
                            ) : (
                              <><Users className="h-3 w-3 ml-1" /> משתמש</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {userOrg ? (
                            <div className="flex flex-col gap-2">
                              <Select
                                value={userOrg.plan_id || ''}
                                onValueChange={(value) => {
                                  base44.entities.Organization.update(userOrg.id, { plan_id: value })
                                    .then(() => {
                                      queryClient.invalidateQueries({ queryKey: ['organizations'] });
                                      toast.success('החבילה עודכנה');
                                    })
                                    .catch(() => toast.error('שגיאה'));
                                }}>
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="בחר חבילה" />
                                </SelectTrigger>
                                <SelectContent>
                                  {plans?.map(plan => (
                                    <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              <Select
                                value={userOrg.subscription_status || 'trial'}
                                onValueChange={(value) => {
                                  base44.entities.Organization.update(userOrg.id, { subscription_status: value })
                                    .then(() => {
                                      queryClient.invalidateQueries({ queryKey: ['organizations'] });
                                      toast.success('הסטטוס עודכן');
                                    })
                                    .catch(() => toast.error('שגיאה'));
                                }}>
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="trial">ניסיון</SelectItem>
                                  <SelectItem value="active">פעיל</SelectItem>
                                  <SelectItem value="past_due">באיחור</SelectItem>
                                  <SelectItem value="canceled">מבוטל</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">אין ארגון</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1 text-slate-500">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(user.created_date), 'dd/MM/yyyy', { locale: he })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Edit className="h-4 w-4 ml-2" />
                                עריכה
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setViewingUser(user)}>
                                <Shield className="h-4 w-4 ml-2" />
                                צפה בפרטים (360)
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteUser(user)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 ml-2" />
                                מחיקה
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <PlanManager />
        </TabsContent>

        <TabsContent value="organizations">
          <OrganizationList />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogTable />
        </TabsContent>

        <TabsContent value="sms">
          <SMSConfig />
        </TabsContent>

        <TabsContent value="system">
          <SystemConfig />
        </TabsContent>

        <TabsContent value="public">
          <PublicResourcesMonitor />
        </TabsContent>
      </Tabs>

      <User360View user={viewingUser} isOpen={!!viewingUser} onClose={() => setViewingUser(null)} />

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>עריכת משתמש</DialogTitle>
          </DialogHeader>
          {editingUser && (() => {
            const userOrg = organizations?.find(o => o.id === editingUser.organization_id);
            
            return (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">שם מלא</label>
                  <Input
                    value={editingUser.full_name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">אימייל</label>
                  <Input value={editingUser.email} disabled />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">תפקיד</label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">משתמש</SelectItem>
                      <SelectItem value="admin">מנהל</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {userOrg && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">חבילת מנוי</label>
                      <Select
                        value={userOrg.plan_id || ''}
                        onValueChange={(value) => {
                          base44.entities.Organization.update(userOrg.id, { plan_id: value })
                            .then(() => {
                              queryClient.invalidateQueries({ queryKey: ['organizations'] });
                              toast.success('החבילה עודכנה');
                            })
                            .catch(() => toast.error('שגיאה בעדכון החבילה'));
                        }}>
                        <SelectTrigger>
                          <SelectValue placeholder="בחר חבילה" />
                        </SelectTrigger>
                        <SelectContent>
                          {plans?.map(plan => (
                            <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">סטטוס מנוי</label>
                      <Select
                        value={userOrg.subscription_status || 'trial'}
                        onValueChange={(value) => {
                          base44.entities.Organization.update(userOrg.id, { subscription_status: value })
                            .then(() => {
                              queryClient.invalidateQueries({ queryKey: ['organizations'] });
                              toast.success('הסטטוס עודכן');
                            })
                            .catch(() => toast.error('שגיאה בעדכון הסטטוס'));
                        }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trial">ניסיון</SelectItem>
                          <SelectItem value="active">פעיל</SelectItem>
                          <SelectItem value="past_due">באיחור</SelectItem>
                          <SelectItem value="canceled">מבוטל</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    ביטול
                  </Button>
                  <Button onClick={handleUpdateUser} disabled={updateUserMutation.isPending}>
                    שמירה
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת משתמש</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק את המשתמש {deleteUser?.full_name || deleteUser?.email}?
              פעולה זו לא ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserMutation.mutate(deleteUser.id)}
              className="bg-red-600 hover:bg-red-700">

              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>);
}