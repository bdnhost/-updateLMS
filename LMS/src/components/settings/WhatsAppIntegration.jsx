import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RefreshCw, Smartphone, CheckCircle2, AlertCircle, Trash2, ShieldAlert, Download, Terminal, FolderOpen, FileText, BookOpen, Code, Copy, Activity, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import WhatsAppDiagnostics from './WhatsAppDiagnostics';
import BridgeSetupGuide from './BridgeSetupGuide';

export default function WhatsAppIntegration() {
    const [scriptCode, setScriptCode] = useState('');
    const [isLoadingCode, setIsLoadingCode] = useState(false);

    const fetchScriptCode = async () => {
        setIsLoadingCode(true);
        try {
            // Add timestamp to prevent caching
            const response = await base44.functions.invoke('downloadBridgeScript', { _t: Date.now() });
            setScriptCode(response.data);
        } catch (error) {
            console.error(error);
            toast.error('שגיאה בטעינת הקוד');
        } finally {
            setIsLoadingCode(false);
        }
    };

    const copyCodeToClipboard = () => {
        navigator.clipboard.writeText(scriptCode);
        toast.success('הקוד הועתק ללוח');
    };
    
    const downloadUserManual = async () => {
        try {
            const response = await base44.functions.invoke('downloadUserManual');
            const blob = new Blob([response.data], { type: 'text/html' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'EduManage_User_Guide.html';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            toast.success('המדריך למשתמש הורד בהצלחה');
        } catch (error) {
            console.error(error);
            toast.error('שגיאה בהורדת המדריך');
        }
    };
    
    const queryClient = useQueryClient();
    
    // Fetch settings directly
    const { data: settings, isLoading } = useQuery({
        queryKey: ['whatsappSettings'],
        queryFn: () => base44.entities.AppSetting.list({ limit: 100 }), 
        refetchInterval: 3000
    });

    const getSetting = (key) => settings?.find(s => s.key === key)?.value;
    
    const status = getSetting('whatsapp_status') || 'DISCONNECTED';
    const failureReason = getSetting('whatsapp_status_reason');
    const qrCodeData = getSetting('whatsapp_qr_code');
    const lastHeartbeat = getSetting('whatsapp_last_heartbeat');

    const isStale = status === 'CONNECTED' && lastHeartbeat && (Date.now() - new Date(lastHeartbeat).getTime() > 1000 * 60 * 5); // 5 mins stale

    const downloadBridgeScript = async () => {
        try {
            const response = await base44.functions.invoke('downloadBridgeScript');
            
            const blob = new Blob([response.data], { type: 'application/javascript' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'academy4u-bridge-v3.2.6.js';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            
            toast.success('הורדת הקובץ החלה');
        } catch (error) {
            console.error(error);
            toast.error('שגיאה בהורדת הקובץ');
        }
    };

    const downloadGuide = async () => {
        try {
            const response = await base44.functions.invoke('downloadBridgeGuide');
            const blob = new Blob([response.data], { type: 'text/markdown' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'academy4u-bridge-guide.md';
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

    const resetConnectionMutation = useMutation({
        mutationFn: () => base44.functions.invoke('resetWhatsAppConnection'),
        onSuccess: () => {
            queryClient.invalidateQueries(['whatsappSettings']);
            toast.success('החיבור אופס בהצלחה');
        },
        onError: () => toast.error('שגיאה באיפוס החיבור')
    });

    const getStatusBadge = () => {
        switch (status) {
            case 'CONNECTED':
                return <Badge className="bg-green-600 hover:bg-green-700">מחובר</Badge>;
            case 'AUTH_FAILED':
                return <Badge variant="destructive">שגיאת אימות</Badge>;
            case 'STOPPED':
                return <Badge variant="outline" className="text-slate-500 border-slate-300 bg-slate-100">גשר כבוי</Badge>;
            default: 
                return <Badge variant="secondary">מנותק</Badge>;
        }
    };

    return (
        <Card className={`border-t-4 shadow-sm ${status === 'CONNECTED' ? 'border-t-green-500' : status === 'AUTH_FAILED' ? 'border-t-red-500' : 'border-t-slate-400'}`}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Smartphone className={`w-5 h-5 ${status === 'CONNECTED' ? 'text-green-600' : 'text-slate-500'}`} />
                            חיבור WhatsApp Web
                        </CardTitle>
                        <CardDescription>
                            סנכרון הודעות קבוצתיות ופרטיות באמצעות גשר מקומי
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                        {getStatusBadge()}
                    </div>
                </div>
                {failureReason && (
                    <div className="mt-2 bg-red-50 text-red-700 p-2 rounded-md text-sm flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                            <span className="font-bold">שגיאה: </span>
                            {failureReason}
                            <p className="text-xs mt-1 opacity-80">נסה למחוק את תיקיית .wwebjs_auth בשרת הגשר ולהפעיל מחדש.</p>
                        </div>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="connection" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                        <TabsTrigger value="connection">סטטוס וחיבור</TabsTrigger>
                        <TabsTrigger value="diagnostics">
                            <Activity className="w-4 h-4 ml-1" />
                            אבחון
                        </TabsTrigger>
                        <TabsTrigger value="setup">
                            <Wrench className="w-4 h-4 ml-1" />
                            מדריך
                        </TabsTrigger>
                        <TabsTrigger value="code" onClick={() => !scriptCode && fetchScriptCode()}>קוד מקור</TabsTrigger>
                    </TabsList>

                    <TabsContent value="connection">
                         <div className="flex justify-end gap-2 mb-4">
                             <Button variant="outline" size="sm" onClick={downloadGuide} className="gap-2 border-slate-300">
                                <FileText className="w-4 h-4" />
                                מדריך התקנה (Bridge)
                            </Button>
                             <Button variant="outline" size="sm" onClick={downloadUserManual} className="gap-2 border-slate-300 bg-slate-50">
                                <BookOpen className="w-4 h-4" />
                                מדריך למשתמש (HTML)
                            </Button>
                             <Button variant="outline" size="sm" onClick={downloadBridgeScript} className="gap-2 border-slate-300">
                                <Download className="w-4 h-4" />
                                הורד סקריפט התקנה (v3.2.6)
                            </Button>
                        </div>
                        <span className="text-[10px] text-slate-400">עודכן לאחרונה: 17/12/2025 (v3.2.6 Stability)</span>

                        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-6">
                            {/* QR Area */}
                            <div className="relative group">
                                <div className="w-64 h-64 bg-white p-4 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center">
                                    {status === 'CONNECTED' ? (
                                        <div className="text-center text-green-600">
                                           {isStale ? (
                                               <div className="text-orange-500">
                                                   <AlertCircle className="w-16 h-16 mx-auto mb-2" />
                                                   <p className="font-bold">נראה שהחיבור התנתק</p>
                                                   <p className="text-sm">לא התקבל אות חיים ב-5 הדקות האחרונות</p>
                                               </div>
                                           ) : (
                                               <>
                                                   <CheckCircle2 className="w-16 h-16 mx-auto mb-2" />
                                                   <p className="font-bold">המכשיר מחובר ומסונכרן!</p>
                                               </>
                                           )}
                                        </div>
                                    ) : qrCodeData ? (
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}`} 
                                            alt="Scan QR" 
                                            className="w-full h-full object-contain" 
                                            title="Scan this QR code with WhatsApp"
                                        />
                                    ) : (
                                        <div className="text-center text-slate-400">
                                            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                                            <p>ממתין ל-QR Code...</p>
                                            <p className="text-xs mt-1 opacity-70">ודא שתוכנת הגשר פועלת</p>
                                        </div>
                                    )}
                                </div>
                                
                                {status !== 'CONNECTED' && (
                                    <div className="mt-4 text-center">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => resetConnectionMutation.mutate()}
                                            disabled={resetConnectionMutation.isPending}
                                            className="text-xs gap-2"
                                        >
                                            {resetConnectionMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                            רענן QR / אפס חיבור
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Instructions */}
                            <div className="space-y-4 max-w-sm">
                                 {status === 'CONNECTED' ? (
                                     <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                         <h4 className="font-bold text-green-800 mb-2">החיבור פעיל!</h4>
                                         <p className="text-sm text-green-700 mb-4">
                                             ההודעות מסתנכרנות כעת בזמן אמת.
                                         </p>
                                         <Button 
                                            variant="destructive" 
                                            size="sm" 
                                            className="w-full bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:text-red-700 shadow-sm"
                                            onClick={() => resetConnectionMutation.mutate()}
                                         >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            {isStale ? 'אפס חיבור תקוע' : 'נתק ואפס חיבור'}
                                         </Button>
                                         {isStale && (
                                             <p className="text-xs text-orange-600 mt-2 text-center">
                                                 המערכת מזהה שהגשר לא פעיל. לחץ על הכפתור כדי לאפס ולקבל קוד סריקה חדש.
                                             </p>
                                         )}
                                     </div>
                                 ) : (
                                    <>
                                        <h4 className="font-bold text-slate-800">הוראות חיבור:</h4>
                                        <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
                                            <li>ודא שתוכנת ה-Bridge רצה במחשב שלך</li>
                                            <li>פתח את WhatsApp בטלפון</li>
                                            <li>בחר <strong>מכשירים מקושרים</strong> {'>'} <strong>קישור מכשיר</strong></li>
                                            <li>סרוק את הברקוד המוצג משמאל</li>
                                        </ol>
                                        
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-bold text-slate-800 text-sm">כיצד להתקין את הגשר?</h4>
                                            </div>
                                            <div className="bg-slate-900 text-slate-200 p-3 rounded-lg text-xs font-mono overflow-x-auto space-y-2 dir-ltr text-left">
                                                <div className="flex gap-2">
                                                    <span className="text-slate-500">$</span>
                                                    <span>npm install whatsapp-web.js qrcode-terminal axios</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-slate-500">$</span>
                                                    <span className="text-yellow-400"># הנח את הקובץ שהורדת בתיקייה</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-slate-500">$</span>
                                                    <span>node academy4u-bridge-v3.2.4.js</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2">
                                                * נדרש Node.js מותקן במחשב המארח
                                            </p>
                                        </div>
                                    </>
                                 )}
                                
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-4 text-xs">
                                    <p className="text-blue-800 font-medium mb-1">סטטוס טכני:</p>
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-blue-600">
                                        <span>Bridge:</span>
                                        <span className={status === 'CONNECTED' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                            {status === 'CONNECTED' ? 'מחובר' : status === 'STOPPED' ? 'כבוי' : 'מנותק'}
                                        </span>
                                        <span>QR עדכני:</span>
                                        <span>{qrCodeData ? 'כן' : 'לא'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="diagnostics">
                        <WhatsAppDiagnostics />
                    </TabsContent>

                    <TabsContent value="setup">
                        <BridgeSetupGuide />
                    </TabsContent>

                    <TabsContent value="code">
                        <div className="relative">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                                <div>
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <Code className="w-5 h-5" />
                                        קוד המקור (academy4u-bridge-v3.2.6.js)
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        הקוד להלן נוצר אוטומטית עם הכתובות הייחודיות של הארגון שלך.
                                    </p>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button variant="outline" size="sm" onClick={fetchScriptCode} disabled={isLoadingCode} className="flex-1 sm:flex-none">
                                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingCode ? 'animate-spin' : ''}`} />
                                        רענן
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={downloadBridgeScript} className="flex-1 sm:flex-none border-slate-300">
                                        <Download className="w-4 h-4 mr-2" />
                                        הורד קובץ
                                    </Button>
                                    <Button variant="default" size="sm" onClick={copyCodeToClipboard} disabled={!scriptCode} className="flex-1 sm:flex-none bg-violet-600 hover:bg-violet-700">
                                        <Copy className="w-4 h-4 mr-2" />
                                        העתק
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-slate-800">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                    </div>
                                    <span className="text-xs text-slate-400 font-mono ml-2">academy4u-bridge-v3.2.6.js</span>
                                </div>
                                <div className="relative">
                                    {isLoadingCode ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                            <p>טוען את הקוד...</p>
                                        </div>
                                    ) : (
                                        <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[600px] custom-scrollbar dir-ltr text-left">
                                            <code>{scriptCode || 'לחץ על "רענן קוד" כדי לטעון את הקובץ'}</code>
                                        </pre>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                                <p className="font-bold flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    שים לב!
                                </p>
                                <p className="mt-1">
                                    קוד זה מכיל מפתחות גישה (API Keys) ייחודיים עבור הארגון שלך. 
                                    אל תשתף את הקוד עם אף אחד מחוץ לארגון.
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}