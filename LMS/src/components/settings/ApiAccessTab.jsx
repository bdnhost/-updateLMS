import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Copy, Eye, EyeOff, Terminal, ShieldCheck, Check, Download } from 'lucide-react';
import { toast } from 'sonner';
import ApiDocumentation from './ApiDocumentation';

export default function ApiAccessTab() {
  const queryClient = useQueryClient();
  const [showKey, setShowKey] = useState(false);
  
  // Fetch API Key
  const { data: apiKeySetting, isLoading } = useQuery({
    queryKey: ['systemApiKey'],
    queryFn: async () => {
        const res = await base44.entities.AppSetting.filter({ key: 'system_api_key' });
        return res?.[0];
    }
  });

  // Generate/Rotate Key
  const generateKeyMutation = useMutation({
    mutationFn: async () => {
        const newKey = 'sk_live_' + Array.from(crypto.getRandomValues(new Uint8Array(24)))
            .map(b => b.toString(16).padStart(2, '0')).join('');
            
        if (apiKeySetting) {
            await base44.entities.AppSetting.update(apiKeySetting.id, { value: newKey });
        } else {
            await base44.entities.AppSetting.create({
                key: 'system_api_key',
                value: newKey,
                description: 'System API Key for external access',
                is_secret: true
            });
        }
        return newKey;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['systemApiKey'] });
        toast.success('מפתח API חדש נוצר בהצלחה');
    }
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('הועתק ללוח');
  };

  const getApiUrl = () => {
      // Constructing the URL based on current window location for demo purposes
      // In production, this should be the actual function URL
      const appId = window.location.hostname.split('.')[0]; 
      return `https://${window.location.hostname}/api/apps/${appId}/functions/publicApi`;
      // Note: This is an estimation. The actual URL might differ based on deployment.
  };

  const downloadGuide = async () => {
        try {
            const response = await base44.functions.invoke('downloadApiGuide');
            const blob = new Blob([response.data], { type: 'text/markdown' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'EduManage_API_Guide.md';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            toast.success('המדריך הורד בהצלחה');
        } catch (error) {
            console.error(error);
            toast.error('שגיאה בהורדת המדריך');
        }
  };

  const exampleUrl = `https://${window.location.host}/api/apps/${window.location.pathname.split('/')[3] || 'YOUR_APP_ID'}/functions/publicApi`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
              <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-violet-600" />
                    ניהול גישת API
                  </CardTitle>
                  <CardDescription>
                    אפשר למערכות חיצוניות לגשת לנתוני הקורסים, המטלות והסילבוס בצורה מאובטחת.
                  </CardDescription>
              </div>
              <Button variant="outline" onClick={downloadGuide} className="gap-2">
                  <Download className="w-4 h-4" />
                  הורד מדריך מלא (MD)
              </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
            
            {/* API Key Section */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-800">מפתח גישה (API Key)</h3>
                        <p className="text-sm text-slate-500">
                            מפתח זה מעניק גישת קריאה מלאה לנתונים הציבוריים של הארגון. שמור עליו בסוד.
                        </p>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                            if(confirm('האם אתה בטוח? יצירת מפתח חדש תבטל את המפתח הקודם ותנתק מערכות קיימות.')) {
                                generateKeyMutation.mutate();
                            }
                        }}
                        disabled={generateKeyMutation.isPending}
                    >
                        {generateKeyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        צור מפתח חדש
                    </Button>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Input 
                            type={showKey ? "text" : "password"} 
                            value={apiKeySetting?.value || ''} 
                            readOnly 
                            className="font-mono bg-white pr-10"
                            placeholder="טרם נוצר מפתח"
                        />
                         <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-0.5 h-9 w-9 text-slate-400 hover:text-slate-600"
                            onClick={() => setShowKey(!showKey)}
                        >
                            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                    <Button variant="secondary" onClick={() => copyToClipboard(apiKeySetting?.value)}>
                        <Copy className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Documentation Section */}
            <div className="space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    תיעוד שימוש
                </h3>
                
                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-sm overflow-x-auto dir-ltr text-left">
                    <div className="mb-2 text-slate-500"># 1. Get All Courses</div>
                    <div className="mb-4">
                        <span className="text-purple-400">curl</span> -X GET \<br/>
                        &nbsp;&nbsp;'{exampleUrl}?resource=courses' \<br/>
                        &nbsp;&nbsp;-H 'x-api-key: {apiKeySetting?.value || 'YOUR_API_KEY'}'
                    </div>

                    <div className="mb-2 text-slate-500"># 2. Get Course Syllabus (Sessions)</div>
                    <div className="mb-4">
                        <span className="text-purple-400">curl</span> -X GET \<br/>
                        &nbsp;&nbsp;'{exampleUrl}?resource=sessions&course_id=COURSE_ID' \<br/>
                        &nbsp;&nbsp;-H 'x-api-key: {apiKeySetting?.value || 'YOUR_API_KEY'}'
                    </div>

                    <div className="mb-2 text-slate-500"># 3. Get Assignments</div>
                    <div>
                        <span className="text-purple-400">curl</span> -X GET \<br/>
                        &nbsp;&nbsp;'{exampleUrl}?resource=assignments&limit=10' \<br/>
                        &nbsp;&nbsp;-H 'x-api-key: {apiKeySetting?.value || 'YOUR_API_KEY'}'
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                        <h4 className="font-bold mb-2">משאבים נתמכים (Resources)</h4>
                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                            <li><code>courses</code> - רשימת קורסים</li>
                            <li><code>sessions</code> - סילבוס ומפגשים</li>
                            <li><code>assignments</code> - מטלות ומבחנים</li>
                            <li><code>materials</code> - חומרי לימוד</li>
                        </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h4 className="font-bold mb-2">פרמטרים (Query Params)</h4>
                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                            <li><code>id</code> - מזהה רשומה ספציפית</li>
                            <li><code>course_id</code> - סינון לפי קורס</li>
                            <li><code>limit</code> - הגבלת כמות (ברירת מחדל: 50)</li>
                            <li><code>skip</code> - דילוג לטובת דפדוף (Pagination)</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Comprehensive API Documentation Component */}
            <ApiDocumentation 
                apiKey={apiKeySetting?.value} 
                apiUrl={getApiUrl()} 
            />

        </CardContent>
      </Card>
    </div>
  );
}