import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Key, Globe, User, Lock, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function SMSConfig() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    sms_provider_url: '',
    sms_provider_key: '',
    sms_provider_user: '',
    sms_provider_password: '',
    sms_sender_name: ''
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: organization, isLoading } = useQuery({
    queryKey: ['myOrganization', user?.organization_id],
    queryFn: () => user?.organization_id ? base44.entities.Organization.get(user.organization_id) : null,
    enabled: !!user?.organization_id
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        sms_provider_url: organization.sms_provider_url || '',
        sms_provider_key: organization.sms_provider_key || '',
        sms_provider_user: organization.sms_provider_user || '',
        sms_provider_password: organization.sms_provider_password || '',
        sms_sender_name: organization.sms_sender_name || ''
      });
    }
  }, [organization]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Organization.update(organization.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrganization'] });
      toast.success('הגדרות SMS עודכנו בהצלחה');
    },
    onError: (error) => {
      toast.error('שגיאה בעדכון ההגדרות: ' + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!organization) return;
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-violet-600" /></div>;
  }

  if (!organization) {
    return <div className="p-8 text-center text-slate-500">לא נמצא ארגון מקושר למשתמש זה.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>הגדרות ספק SMS</CardTitle>
        <CardDescription>
          הגדר את פרטי החיבור לספק ה-SMS (SMS4Free). הגדרות אלו יגברו על הגדרות ברירת המחדל של המערכת.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sms_provider_user">שם משתמש (API User)</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="sms_provider_user"
                  value={formData.sms_provider_user}
                  onChange={(e) => setFormData({...formData, sms_provider_user: e.target.value})}
                  className="pr-10"
                  placeholder="הזן שם משתמש"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sms_provider_password">סיסמה (API Password)</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="sms_provider_password"
                  type="password"
                  value={formData.sms_provider_password}
                  onChange={(e) => setFormData({...formData, sms_provider_password: e.target.value})}
                  className="pr-10"
                  placeholder="הזן סיסמה"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="sms_provider_key">מפתח API (API Key)</Label>
              <div className="relative">
                <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="sms_provider_key"
                  type="password"
                  value={formData.sms_provider_key}
                  onChange={(e) => setFormData({...formData, sms_provider_key: e.target.value})}
                  className="pr-10"
                  placeholder="הזן מפתח API"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="sms_provider_url">כתובת API URL</Label>
              <div className="relative">
                <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="sms_provider_url"
                  value={formData.sms_provider_url}
                  onChange={(e) => setFormData({...formData, sms_provider_url: e.target.value})}
                  className="pr-10"
                  placeholder="https://api.sms4free.co.il/ApiSMS/v2/SendSMS"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sms_sender_name">שם שולח (Sender Name)</Label>
              <div className="relative">
                <MessageSquare className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="sms_sender_name"
                  value={formData.sms_sender_name}
                  onChange={(e) => setFormData({...formData, sms_sender_name: e.target.value})}
                  className="pr-10"
                  placeholder="EduManage"
                  maxLength={11}
                />
              </div>
              <p className="text-xs text-slate-500">באנגלית בלבד (אותיות ומספרים), עד 11 תווים. רווחים ותווים מיוחדים יוסרו אוטומטית.</p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={updateMutation.isPending} className="bg-violet-600 hover:bg-violet-700">
              {updateMutation.isPending && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              <Save className="h-4 w-4 ml-2" />
              שמור הגדרות
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}