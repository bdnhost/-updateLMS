import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save, Eye, EyeOff, Trash2, RefreshCw, AlertTriangle, Server, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SystemSettingsTab() {
  const queryClient = useQueryClient();
  const [showSecret, setShowSecret] = useState(false);
  
  const { data: settings, isLoading } = useQuery({
    queryKey: ['appSettings'],
    queryFn: () => base44.entities.AppSetting.list(),
  });

  const [formState, setFormState] = useState({
    paypal_client_id: '',
    paypal_client_secret: '',
    paypal_mode: 'sandbox',
    zoom_account_id: '',
    zoom_client_id: '',
    zoom_client_secret: '',
    zoom_webhook_secret: '',
    cpanel_host: 'bdnhost.net',
    cpanel_username: '',
    cpanel_api_token: '',
    cpanel_root_path: 'bdnhost.net'
  });

  const cpanelTestMutation = useMutation({
    mutationFn: async () => {
        const res = await base44.functions.invoke('audioSync', { action: 'test_connection' });
        if (!res.data.success) throw new Error(res.data.error);
        return res.data;
    },
    onSuccess: (data) => toast.success(`חיבור cPanel תקין! (משתמש: ${data.user})`),
    onError: (err) => toast.error(`שגיאה בחיבור cPanel: ${err.message}`)
  });

  useEffect(() => {
    if (settings) {
      const getVal = (k) => settings.find(s => s.key === k)?.value || '';
      setFormState({
        paypal_client_id: getVal('paypal_client_id'),
        paypal_client_secret: getVal('paypal_client_secret'),
        paypal_mode: getVal('paypal_mode') || 'sandbox',
        zoom_account_id: getVal('zoom_account_id'),
        zoom_client_id: getVal('zoom_client_id'),
        zoom_client_secret: getVal('zoom_client_secret'),
        zoom_webhook_secret: getVal('zoom_webhook_secret'),
        cpanel_host: getVal('cpanel_host') || 'bdnhost.net',
        cpanel_username: getVal('cpanel_username'),
        cpanel_api_token: getVal('cpanel_api_token'),
        cpanel_root_path: getVal('cpanel_root_path') || 'bdnhost.net'
      });
    }
  }, [settings]);

  const saveSettingMutation = useMutation({
    mutationFn: async (updates) => {
      // We need to update each setting individually or create if not exists
      // Check existing to decide update vs create is redundant if we assume they exist from seed, 
      // but robust code handles it.
      
      const promises = Object.entries(updates).map(async ([key, value]) => {
        const existing = settings?.find(s => s.key === key);
        if (existing) {
          return base44.entities.AppSetting.update(existing.id, { value });
        } else {
          return base44.entities.AppSetting.create({ 
            key, 
            value, 
            description: key.replace(/_/g, ' '), 
            is_secret: key.includes('secret') 
          });
        }
      });
      
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appSettings'] });
      queryClient.invalidateQueries({ queryKey: ['paypalConfig'] }); // Refresh billing tab config
      toast.success('הגדרות המערכת נשמרו בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה בשמירת ההגדרות');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveSettingMutation.mutate(formState);
  };

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
        console.log("Testing connection with:", formState);
        const res = await base44.functions.invoke('paypal', { 
            action: 'testConnection',
            clientId: formState.paypal_client_id,
            clientSecret: formState.paypal_client_secret,
            mode: formState.paypal_mode
        });
        
        console.log("Test connection response:", res);

        if (!res.data.success) {
            const errorMsg = res.data.error || 'Unknown error';
            const details = res.data.details ? ` - ${res.data.details}` : '';
            throw new Error(errorMsg + details);
        }
        return res.data;
    },
    onSuccess: (data) => {
        toast.success(`חיבור תקין ל-PayPal (${data.mode})`);
        // Also show alert to be sure user sees it
        setTimeout(() => alert(`חיבור תקין ל-PayPal!\nמצב: ${data.mode}`), 100);
    },
    onError: (err) => {
        console.error("Test connection failed:", err);
        const msg = err.message || "שגיאה לא ידועה";
        toast.error(`שגיאה בחיבור: ${msg}`);
        // Fallback alert
        setTimeout(() => alert(`שגיאה בבדיקת החיבור:\n${msg}`), 100);
    }
  });

  const cleanupMutation = useMutation({
    mutationFn: () => base44.functions.invoke('cleanupSystem', { action: 'cleanup_deleted_items' }),
    onSuccess: (res) => {
        const count = res.data?.data?.deletedCount || 0;
        toast.success(`ניקוי הסתיים בהצלחה. נמחקו ${count} פריטים.`);
        queryClient.invalidateQueries();
    },
    onError: () => toast.error('שגיאה בתהליך הניקוי')
  });

  const handleClearCache = () => {
    try {
        queryClient.clear();
        localStorage.removeItem('activeTab'); // Clear specific UI states if needed
        // Avoid clearing Auth tokens if stored in LS
        toast.success('זיכרון המטמון (Cache) נוקה בהצלחה');
        setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
        toast.error('שגיאה בניקוי המטמון');
    }
  };

  if (isLoading) return <div className="p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-violet-600" /></div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            תחזוקת מערכת
          </CardTitle>
          <CardDescription>פעולות תחזוקה וניקוי נתונים - בצע בזהירות</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-100">
            <div className="space-y-1">
              <h4 className="font-medium text-red-900">ניקוי פריטים שנמחקו</h4>
              <p className="text-sm text-red-700">מחיקה סופית של קורסים בארכיון ותלמידים שנשרו. פעולה זו אינה הפיכה.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={cleanupMutation.isPending}>
                  {cleanupMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Trash2 className="h-4 w-4 ml-2" />}
                  נקה עכשיו
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                  <AlertDialogDescription>
                    פעולה זו תמחק לצמיתות את כל הקורסים שבסטטוס "ארכיון" ואת כל התלמידים שבסטטוס "נשר".
                    לא ניתן לשחזר נתונים אלו לאחר המחיקה.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ביטול</AlertDialogCancel>
                  <AlertDialogAction onClick={() => cleanupMutation.mutate()} className="bg-red-600 hover:bg-red-700">
                    מחק לצמיתות
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 border-slate-200">
            <div className="space-y-1">
              <h4 className="font-medium text-slate-900">ניקוי מטמון (Cache)</h4>
              <p className="text-sm text-slate-600">רענון הנתונים המקומיים וטעינה מחדש של המערכת. פותר בעיות תצוגה.</p>
            </div>
            <Button variant="outline" onClick={handleClearCache}>
              <RefreshCw className="h-4 w-4 ml-2" />
              נקה מטמון
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700">
             <Server className="h-5 w-5" />
             חיבור שרת ואחסון (cPanel)
          </CardTitle>
          <CardDescription>
              ניהול חיבור לשרת האחסון עבור סנכרון קבצי אודיו.
              ניתן להגדיר כאן את פרטי החיבור (cPanel) או להשתמש במשתני סביבה.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Host</Label>
                    <Input
                        value={formState.cpanel_host}
                        onChange={(e) => setFormState({ ...formState, cpanel_host: e.target.value })}
                        placeholder="bdnhost.net"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                        value={formState.cpanel_username}
                        onChange={(e) => setFormState({ ...formState, cpanel_username: e.target.value })}
                        placeholder="username"
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label>Root Directory (Relative to Home)</Label>
                    <Input
                        value={formState.cpanel_root_path}
                        onChange={(e) => setFormState({ ...formState, cpanel_root_path: e.target.value })}
                        placeholder="bdnhost.net (or public_html)"
                    />
                    <p className="text-[11px] text-slate-500">
                        נתיב התיקייה הראשית ביחס ל-Home Directory. בדרך כלל שם הדומיין (עבור Addon Domain) או public_html.
                    </p>
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label>API Token</Label>
                    <div className="relative">
                        <Input
                            type={showSecret ? "text" : "password"}
                            value={formState.cpanel_api_token}
                            onChange={(e) => setFormState({ ...formState, cpanel_api_token: e.target.value })}
                            placeholder="cPanel API Token"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-0.5 h-9 w-9 text-slate-400 hover:text-slate-600"
                            onClick={() => setShowSecret(!showSecret)}
                        >
                            {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-end mb-4">
                <Button onClick={() => saveSettingMutation.mutate(formState)} disabled={saveSettingMutation.isPending} variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                    {saveSettingMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    שמור הגדרות cPanel
                </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full text-indigo-600 shadow-sm">
                        <Server className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-indigo-900">סטטוס חיבור</h4>
                        <p className="text-sm text-indigo-700">בדוק האם המערכת מצליחה להתחבר ל-cPanel</p>
                    </div>
                </div>
                <Button 
                    variant="outline" 
                    className="bg-white hover:bg-indigo-100 text-indigo-700 border-indigo-200"
                    onClick={() => cpanelTestMutation.mutate()}
                    disabled={cpanelTestMutation.isPending}
                >
                    {cpanelTestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <RefreshCw className="w-4 h-4 ml-2" />}
                    בדוק חיבור כעת
                </Button>
            </div>
            {cpanelTestMutation.isError && (
                <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded text-sm">
                    <XCircle className="w-4 h-4" />
                    <span>נכשל: {cpanelTestMutation.error.message}</span>
                </div>
            )}
            {cpanelTestMutation.isSuccess && (
                <div className="mt-3 flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>החיבור תקין ומאומת!</span>
                </div>
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>הגדרות תשלום (PayPal)</CardTitle>
          <CardDescription>הגדרת מפתחות API לחיבור המערכת ל-PayPal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            <div className="space-y-2">
              <Label>PayPal Client ID</Label>
              <Input
                value={formState.paypal_client_id}
                onChange={(e) => setFormState({ ...formState, paypal_client_id: e.target.value })}
                placeholder="Ex: ASc..."
              />
            </div>

            <div className="space-y-2">
              <Label>PayPal Client Secret</Label>
              <div className="relative">
                <Input
                  type={showSecret ? "text" : "password"}
                  value={formState.paypal_client_secret}
                  onChange={(e) => setFormState({ ...formState, paypal_client_secret: e.target.value })}
                  placeholder="Ex: EDi..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-0.5 h-9 w-9 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>מצב מערכת (Mode)</Label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formState.paypal_mode}
                onChange={(e) => setFormState({ ...formState, paypal_mode: e.target.value })}
              >
                <option value="sandbox">Sandbox (בדיקות)</option>
                <option value="live">Live (ייצור)</option>
              </select>
            </div>

            <div className="flex gap-4">
                <Button type="submit" disabled={saveSettingMutation.isPending}>
                  {saveSettingMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  שמור הגדרות
                </Button>
                
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => testConnectionMutation.mutate()}
                    disabled={testConnectionMutation.isPending || saveSettingMutation.isPending}
                >
                    {testConnectionMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    בדוק חיבור
                </Button>
            </div>
            <div className="space-y-6 pt-6 border-t">
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                   <div className="bg-blue-500 rounded-full p-1 text-white">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M4.585 13.607l-2.79 2.325c-.354.295-.585.734-.585 1.222v2.247c0 .879.713 1.599 1.583 1.599h3.765c.316 0 .59-.146.77-.38.16-.207.256-.47.256-.757v-2.903c0-.986.779-1.8 1.761-1.841h.045c.995 0 1.808.807 1.808 1.803v2.941c0 .285.094.547.253.755.18.232.453.379.768.379h4.318c.879 0 1.599-.72 1.599-1.599v-2.247c0-.495-.238-.938-.601-1.233l-2.658-2.152c-.636-.514-1.393-.85-2.213-.85h-5.918c-.802 0-1.543.325-2.162.822zM21.576 6.64l-2.062-1.716c-.354-.294-.585-.734-.585-1.222V1.6c0-.88-.713-1.6-1.583-1.6h-3.765c-.316 0-.59.147-.77.381-.16.207-.256.469-.256.757v2.903c0 .985-.779 1.8-1.761 1.841h-.045c-.995 0-1.808-.807-1.808-1.803V.178c0-.285-.094-.547-.253-.755-.18-.232-.453-.379-.768-.379h-4.318C2.723-.956 2.003-.236 2.003.643v2.247c0 .495.238.938.601 1.233l2.658 2.152c.636.514 1.393.85 2.213.85h5.918c.802 0 1.543-.325 2.162-.822l2.79-2.325z"/></svg>
                   </div>
                   הגדרות Zoom
                </h3>
                <p className="text-sm text-slate-500">חיבור לחשבון הזום ליצירת שיעורים אוטומטית</p>
              </div>

              <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Zoom Account ID</Label>
                    <Input
                      value={formState.zoom_account_id}
                      onChange={(e) => setFormState({ ...formState, zoom_account_id: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Zoom Client ID</Label>
                        <Input
                          value={formState.zoom_client_id}
                          onChange={(e) => setFormState({ ...formState, zoom_client_id: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Zoom Client Secret</Label>
                        <div className="relative">
                            <Input
                              type={showSecret ? "text" : "password"}
                              value={formState.zoom_client_secret}
                              onChange={(e) => setFormState({ ...formState, zoom_client_secret: e.target.value })}
                            />
                        </div>
                      </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Zoom Webhook Secret Token</Label>
                    <Input
                      type={showSecret ? "text" : "password"}
                      value={formState.zoom_webhook_secret}
                      onChange={(e) => setFormState({ ...formState, zoom_webhook_secret: e.target.value })}
                    />
                  </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t">
                <Button type="submit" disabled={saveSettingMutation.isPending}>
                  {saveSettingMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  שמור הגדרות
                </Button>
                
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => testConnectionMutation.mutate()}
                    disabled={testConnectionMutation.isPending || saveSettingMutation.isPending}
                >
                    {testConnectionMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    בדוק חיבור
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}