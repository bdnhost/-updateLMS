import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
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

export default function SystemConfig() {
  const queryClient = useQueryClient();
  const SETTING_KEY = 'email_on_purchase_success';

  const { data: settings, isLoading } = useQuery({
    queryKey: ['appSettings'],
    queryFn: () => base44.entities.AppSetting.list()
  });

  const emailSetting = settings?.find(s => s.key === SETTING_KEY);
  const isEnabled = emailSetting?.value === 'true';

  const updateSettingMutation = useMutation({
    mutationFn: async (newValue) => {
      if (emailSetting) {
        return base44.entities.AppSetting.update(emailSetting.id, {
          value: String(newValue)
        });
      } else {
        return base44.entities.AppSetting.create({
          key: SETTING_KEY,
          value: String(newValue),
          description: 'Send email confirmation on successful purchase',
          is_secret: false
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appSettings'] });
      toast.success('הגדרות מערכת עודכנו בהצלחה');
    },
    onError: (error) => {
      toast.error('שגיאה בעדכון ההגדרות: ' + error.message);
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
        localStorage.removeItem('activeTab');
        toast.success('זיכרון המטמון (Cache) נוקה בהצלחה');
        setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
        toast.error('שגיאה בניקוי המטמון');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-violet-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>הגדרות מערכת</CardTitle>
          <CardDescription>
            הגדרות כלליות להתנהגות המערכת
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-4 space-x-reverse p-4 border rounded-lg bg-slate-50">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <Label htmlFor="email-on-purchase" className="text-base font-medium">
                  אימייל אישור רכישה
                </Label>
                <p className="text-sm text-slate-500">
                  שלח אוטומטית הודעת אימייל למשתמש לאחר רכישת חבילה מוצלחת
                </p>
              </div>
            </div>
            <Switch
              id="email-on-purchase"
              checked={isEnabled}
              onCheckedChange={(checked) => updateSettingMutation.mutate(checked)}
              disabled={updateSettingMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}