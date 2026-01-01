import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building, CreditCard, User, Save, CheckCircle2, Key, Code2, Upload, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import BillingTab from '@/components/settings/BillingTab';
import SystemSettingsTab from '@/components/settings/SystemSettingsTab';
import WhatsAppIntegration from '@/components/settings/WhatsAppIntegration';
import NotificationTemplatesManager from '@/components/settings/NotificationTemplatesManager';
import ApiAccessTab from '@/components/settings/ApiAccessTab';
import PlanGuard from '@/components/common/PlanGuard';
import { FEATURES, PERMISSIONS } from '@/components/common/planPermissions';
import EmbedCodeDialog from '@/components/common/EmbedCodeDialog';
import { createPageUrl } from '@/utils';

export default function Settings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  // Fetch current user
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch organization and plan
  const { data: orgData, isLoading: orgLoading } = useQuery({
    queryKey: ['myOrganizationWithPlan', user?.id, user?.organization_id],
    queryFn: async () => {
      if (!user) return null;
      
      let org = null;
      // Prefer organization_id, fallback to created_by
      if (user.organization_id) {
        try {
            org = await base44.entities.Organization.get(user.organization_id);
        } catch (e) { console.error("Org not found", e); }
      } 
      
      if (!org) {
        const orgs = await base44.entities.Organization.filter({ created_by: user.email }, '-created_date', 1);
        if (orgs && orgs.length > 0) {
            org = orgs[0];
            // Auto-heal here too if needed
            if (user.organization_id !== org.id) {
                base44.auth.updateMe({ organization_id: org.id });
                queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            }
        }
      }

      // If still no org, create one automatically
      if (!org && user.email) {
        try {
          console.log("Auto-creating organization for user", user.email);
          org = await base44.entities.Organization.create({
            name: user.full_name || user.email.split('@')[0],
            billing_email: user.email,
            subscription_status: 'trial'
          });
          await base44.auth.updateMe({ organization_id: org.id });
          queryClient.invalidateQueries({ queryKey: ['currentUser'] });
          queryClient.invalidateQueries({ queryKey: ['layoutOrgData'] });
        } catch (e) {
          console.error("Error creating organization", e);
        }
      }

      let plan = null;
      if (org?.plan_id) {
        try {
            const plans = await base44.entities.SubscriptionPlan.list(); 
            plan = plans.find(p => p.id === org.plan_id);
        } catch (e) { console.error('Failed to fetch plan', e); }
      }

      return { organization: org, plan };
    },
    enabled: !!user,
    retry: 3
  });

  const organization = orgData?.organization;
  const plan = orgData?.plan;

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('הפרופיל עודכן בהצלחה');
    }
  });

  const createOrgMutation = useMutation({
    mutationFn: (data) => base44.entities.Organization.create(data),
    onSuccess: async (newOrg) => {
      // Link user to new org
      await base44.auth.updateMe({ organization_id: newOrg.id });
      queryClient.invalidateQueries({ queryKey: ['myOrganization'] });
      queryClient.invalidateQueries({ queryKey: ['myOrganizationWithPlan'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('העסק נוצר בהצלחה');
    }
  });

  const updateOrgMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Organization.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrganization'] });
      queryClient.invalidateQueries({ queryKey: ['myOrganizationWithPlan'] });
      toast.success('פרטי העסק עודכנו');
    }
  });

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    job_title: ''
  });

  const [orgForm, setOrgForm] = useState({
    name: '',
    billing_email: '',
    phone: '',
    address: '',
    sms_sender_name: '',
    email_sender_name: '',
    description: '',
    website: '',
    enable_ai_motivator: true,
    logo_url: ''
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        job_title: user.job_title || ''
      });
      if (!organization && !orgForm.billing_email) {
        setOrgForm((prev) => ({ ...prev, billing_email: user.email }));
      }
    }
  }, [user]);

  useEffect(() => {
    if (organization) {
      setOrgForm({
        name: organization.name || '',
        billing_email: organization.billing_email || '',
        phone: organization.phone || '',
        address: organization.address || '',
        sms_sender_name: organization.sms_sender_name || '',
        email_sender_name: organization.email_sender_name || '',
        description: organization.description || '',
        website: organization.website || '',
        enable_ai_motivator: organization.enable_ai_motivator !== undefined ? organization.enable_ai_motivator : true,
        logo_url: organization.logo_url || ''
      });
    }
  }, [organization]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setOrgForm({ ...orgForm, logo_url: file_url });
      toast.success('הלוגו הועלה בהצלחה');
    } catch (error) {
      toast.error('שגיאה בהעלאת הלוגו');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handleOrgSubmit = (e) => {
    e.preventDefault();
    if (organization) {
      updateOrgMutation.mutate({ id: organization.id, data: orgForm });
    } else {
      createOrgMutation.mutate({ ...orgForm, billing_email: orgForm.billing_email || user.email });
    }
  };

  if (userLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">הגדרות</h1>
        <p className="text-slate-500">ניהול פרופיל, עסק ותשלומים</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            פרופיל
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            עסק
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            מנוי וחיוב
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex-1 min-w-[100px]">
             אינטגרציות
          </TabsTrigger>
          <TabsTrigger value="api" className="flex-1 min-w-[100px]">
             API ופיתוח
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex-1 min-w-[100px]">
             תבניות הודעה
          </TabsTrigger>
          {user?.role === 'admin' &&
          <TabsTrigger value="system" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              הגדרות מערכת
            </TabsTrigger>
          }
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>פרטים אישיים</CardTitle>
              <CardDescription>עדכן את הפרטים האישיים שלך במערכת</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-xl">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.avatar_url} />
                    <AvatarFallback className="text-xl bg-violet-100 text-violet-700">
                      {user?.full_name?.charAt(0) || user?.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="font-medium">{user?.email}</h3>
                    <Badge variant="outline" className="bg-slate-50">{user?.role === 'admin' ? 'מנהל מערכת' : 'משתמש'}</Badge>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>שם מלא</Label>
                    <Input
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} />

                  </div>
                  <div className="space-y-2">
                    <Label>תפקיד</Label>
                    <Input
                      value={profileForm.job_title}
                      onChange={(e) => setProfileForm({ ...profileForm, job_title: e.target.value })}
                      placeholder="לדוגמה: מנהל בית ספר" />

                  </div>
                  <div className="space-y-2">
                    <Label>טלפון</Label>
                    <Input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />

                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button type="submit" disabled={updateProfileMutation.isPending} className="bg-purple-700 text-primary-foreground px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 h-9">
                    {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    שמור שינויים
                  </Button>

                  <Button 
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      if (window.confirm('האם אתה בטוח שברצונך למחוק את חשבונך? פעולה זו אינה הפיכה ותמחק את כל הנתונים שלך מהמערכת.')) {
                        base44.auth.updateMe({ status: 'deleted' }).then(() => {
                          toast.success('החשבון נמחק בהצלחה');
                          setTimeout(() => base44.auth.logout('/'), 2000);
                        }).catch(() => toast.error('שגיאה במחיקת החשבון'));
                      }
                    }}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    מחק חשבון
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>פרטי העסק</CardTitle>
              <CardDescription>הגדרות המוסד הלימודי או העסק שלך</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOrgSubmit} className="space-y-6 max-w-xl">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>שם העסק / המרצה *</Label>
                    <Input
                      required
                      value={orgForm.name}
                      onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                      placeholder="לדוגמה: תיכון דרור" />

                  </div>

                  <div className="space-y-2">
                    <Label>לוגו העסק</Label>
                    <div className="flex items-center gap-4">
                      {orgForm.logo_url && (
                        <div className="relative w-20 h-20 border-2 border-slate-200 rounded-lg overflow-hidden bg-white">
                          <img src={orgForm.logo_url} alt="Logo" className="w-full h-full object-contain" />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="absolute top-0 left-0 h-6 w-6 bg-red-500 hover:bg-red-600 text-white rounded-bl-lg"
                            onClick={() => setOrgForm({ ...orgForm, logo_url: '' })}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label htmlFor="logo-upload">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={uploadingLogo}
                            className="gap-2 cursor-pointer"
                            asChild
                          >
                            <span>
                              {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                              {orgForm.logo_url ? 'החלף לוגו' : 'העלה לוגו'}
                            </span>
                          </Button>
                        </label>
                        <p className="text-xs text-slate-500 mt-1">הלוגו יופיע בדפי הדפסה ובדף הציבורי של העסק</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>אימייל לחיוב (PayPal) *</Label>
                    <Input
                      required
                      type="email"
                      value={orgForm.billing_email}
                      onChange={(e) => setOrgForm({ ...orgForm, billing_email: e.target.value })}
                      placeholder="billing@example.com" />

                    <p className="text-xs text-slate-500">כתובת זו תשמש לזיהוי חשבון ה-PayPal שלך באופן אוטומטי</p>
                  </div>
                  <div className="space-y-2">
                    <Label>טלפון</Label>
                    <Input
                      value={orgForm.phone}
                      onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })} />

                  </div>
                  <div className="space-y-2">
                    <Label>כתובת</Label>
                    <Input
                      value={orgForm.address}
                      onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <Label>אתר אינטרנט</Label>
                    <Input
                      value={orgForm.website}
                      onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })} 
                      placeholder="https://www.myschool.co.il"
                      dir="ltr"
                      className="text-left"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>אודות העסק</Label>
                    <Textarea
                      value={orgForm.description}
                      onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })}
                      placeholder="תיאור קצר על המוסד הלימודי / החברה..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>שם שולח SMS</Label>
                      <Input
                        value={orgForm.sms_sender_name}
                        onChange={(e) => setOrgForm({ ...orgForm, sms_sender_name: e.target.value })}
                        placeholder="עד 11 תווים באנגלית"
                        maxLength={11} />

                      <p className="text-xs text-slate-500">יופיע כשם השולח בהודעות SMS (אותיות אנגליות ומספרים בלבד)</p>
                    </div>
                    <div className="space-y-2">
                      <Label>שם שולח אימייל</Label>
                      <Input
                        value={orgForm.email_sender_name}
                        onChange={(e) => setOrgForm({ ...orgForm, email_sender_name: e.target.value })}
                        placeholder="שם שיופיע במייל" />

                      <p className="text-xs text-slate-500">יופיע כשם השולח בהודעות אימייל (ברירת מחדל: שם העסק)</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <Switch
                      id="ai-motivator"
                      checked={orgForm.enable_ai_motivator}
                      onCheckedChange={(checked) => setOrgForm({ ...orgForm, enable_ai_motivator: checked })} />

                      <div className="space-y-1 mr-4">
                          <Label htmlFor="ai-motivator" className="font-medium cursor-pointer">מוטיבטור AI לתלמידים</Label>
                          <p className="text-xs text-slate-500">אפשר לדמות וירטואלית לעודד תלמידים ולספק משוב חיובי בפורטל הציונים</p>
                      </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={createOrgMutation.isPending || updateOrgMutation.isPending} className="bg-fuchsia-700 text-primary-foreground px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 h-9">
                    {(createOrgMutation.isPending || updateOrgMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Building className="mr-2 h-4 w-4" />
                    {organization ? 'עדכן פרטי עסק' : 'צור פרופיל עסקי חדש'}
                  </Button>
                  
                  {organization && (
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setShowEmbedDialog(true)}
                      className="gap-2"
                    >
                      <Code2 className="h-4 w-4" />
                      קוד הטמעה לדף עסק
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <BillingTab organization={organization} isLoading={orgLoading} />
        </TabsContent>

        <TabsContent value="whatsapp">
            <div className="space-y-6">
                <PlanGuard 
                    plan={plan} 
                    feature={FEATURES.WHATSAPP} 
                    requiredLevel={PERMISSIONS.READ_ONLY}
                    fallbackMessage="חיבור WhatsApp זמין בחבילות המתקדמות בלבד. שדרגו עכשיו כדי ליהנות מתקשורת אוטומטית עם התלמידים."
                >
                    <WhatsAppIntegration />
                </PlanGuard>
            </div>
        </TabsContent>

        <TabsContent value="api">
            <ApiAccessTab />
        </TabsContent>

        <TabsContent value="templates">
            <div className="space-y-6">
                <NotificationTemplatesManager />
            </div>
        </TabsContent>

        {/* System Settings Tab (Admin Only) */}
        {user?.role === 'admin' &&
        <TabsContent value="system">
            <SystemSettingsTab />
          </TabsContent>
        }
      </Tabs>

      {organization && showEmbedDialog && (
        <EmbedCodeDialog
          open={showEmbedDialog}
          onClose={() => setShowEmbedDialog(false)}
          embedUrl={`${window.location.origin}${createPageUrl('PublicView')}?type=school&id=${organization.id}`}
          title={`הטמעת דף עסק: ${organization.name}`}
        />
      )}
    </div>);

}