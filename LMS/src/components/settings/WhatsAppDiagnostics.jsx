import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, Send, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function WhatsAppDiagnostics() {
    const { data: pendingMessages, isLoading: loadingPending, refetch: refetchPending } = useQuery({
        queryKey: ['whatsappPendingMessages'],
        queryFn: async () => {
            const messages = await base44.asServiceRole.entities.WhatsAppMessage.filter({ status: 'pending' }, '-created_date', 20);
            return messages;
        },
        refetchInterval: 5000
    });

    const { data: processingMessages, isLoading: loadingProcessing } = useQuery({
        queryKey: ['whatsappProcessingMessages'],
        queryFn: async () => {
            const messages = await base44.asServiceRole.entities.WhatsAppMessage.filter({ status: 'processing' }, '-created_date', 20);
            return messages;
        },
        refetchInterval: 5000
    });

    const { data: recentSent } = useQuery({
        queryKey: ['whatsappRecentSent'],
        queryFn: async () => {
            const messages = await base44.asServiceRole.entities.WhatsAppMessage.filter({ status: 'sent' }, '-created_date', 10);
            return messages;
        }
    });

    const { data: settings } = useQuery({
        queryKey: ['whatsappStatusCheck'],
        queryFn: () => base44.entities.AppSetting.list(),
        refetchInterval: 3000
    });

    const bridgeStatus = settings?.find(s => s.key === 'whatsapp_status')?.value || 'DISCONNECTED';
    const lastHeartbeat = settings?.find(s => s.key === 'whatsapp_last_heartbeat')?.value;

    const resetStuckMessages = async () => {
        try {
            const stuck = await base44.asServiceRole.entities.WhatsAppMessage.filter({ status: 'processing' });
            await Promise.all(stuck.map(msg => 
                base44.asServiceRole.entities.WhatsAppMessage.update(msg.id, { status: 'pending' })
            ));
            toast.success(`${stuck.length} הודעות תקועות אופסו ל-pending`);
            refetchPending();
        } catch (error) {
            toast.error('שגיאה באיפוס הודעות');
        }
    };

    return (
        <div className="space-y-4">
            <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                        אבחון מערכת WhatsApp
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Status Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-600">סטטוס הגשר</span>
                                <Badge className={bridgeStatus === 'CONNECTED' ? 'bg-green-600' : 'bg-red-600'}>
                                    {bridgeStatus}
                                </Badge>
                            </div>
                            {lastHeartbeat && (
                                <p className="text-xs text-slate-500">
                                    דופק אחרון: {new Date(lastHeartbeat).toLocaleTimeString('he-IL')}
                                </p>
                            )}
                        </div>

                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-600">ממתינות בתור</span>
                                <Badge className="bg-orange-600">
                                    {pendingMessages?.length || 0}
                                </Badge>
                            </div>
                            <p className="text-xs text-slate-500">הודעות שלא נשלחו עדיין</p>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-600">בתהליך שליחה</span>
                                <Badge className="bg-blue-600">
                                    {processingMessages?.length || 0}
                                </Badge>
                            </div>
                            <p className="text-xs text-slate-500">מעובדות על ידי הגשר</p>
                        </div>
                    </div>

                    {/* Diagnostics */}
                    {bridgeStatus !== 'CONNECTED' && (pendingMessages?.length > 0 || processingMessages?.length > 0) && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-red-900 mb-2">בעיה זוהתה!</h4>
                                    <p className="text-sm text-red-700 mb-3">
                                        יש {pendingMessages?.length || 0} הודעות בתור אך הגשר מנותק. 
                                        הודעות לא ישלחו עד שהגשר יתחבר מחדש.
                                    </p>
                                    <div className="space-y-2 text-sm text-red-800">
                                        <p className="font-medium">פעולות מומלצות:</p>
                                        <ol className="list-decimal list-inside space-y-1">
                                            <li>ודא שתוכנת הגשר (bridge) רצה במחשב שלך</li>
                                            <li>בדוק את ה-console של הגשר לשגיאות</li>
                                            <li>נסה להפעיל מחדש את תוכנת הגשר</li>
                                            <li>אם הבעיה נמשכת, לחץ על "אפס חיבור" בלשונית "סטטוס וחיבור"</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {processingMessages?.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-yellow-900 mb-2">הודעות תקועות ב-"מעבד"</h4>
                                    <p className="text-sm text-yellow-700 mb-3">
                                        יש {processingMessages.length} הודעות שסומנו כ-"מעבד" אך עדיין לא הושלמו.
                                        זה יכול לקרות אם הגשר התנתק באמצע שליחה.
                                    </p>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={resetStuckMessages}
                                        className="gap-2 bg-white hover:bg-yellow-50 border-yellow-300"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        החזר הודעות תקועות ל-pending
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {bridgeStatus === 'CONNECTED' && pendingMessages?.length === 0 && processingMessages?.length === 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <div>
                                <h4 className="font-bold text-green-900">הכל תקין!</h4>
                                <p className="text-sm text-green-700">הגשר מחובר ואין הודעות ממתינות</p>
                            </div>
                        </div>
                    )}

                    {/* Message Lists */}
                    <div className="space-y-4">
                        {pendingMessages?.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-orange-600" />
                                    הודעות ממתינות ({pendingMessages.length})
                                </h4>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {pendingMessages.map(msg => (
                                        <div key={msg.id} className="p-3 bg-white border rounded-lg text-sm">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-slate-700">{msg.recipient_number}</span>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(msg.created_date).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 text-xs line-clamp-2">{msg.body}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {recentSent?.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                    <Send className="w-4 h-4 text-green-600" />
                                    נשלחו לאחרונה ({recentSent.length})
                                </h4>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {recentSent.slice(0, 5).map(msg => (
                                        <div key={msg.id} className="p-3 bg-green-50 border border-green-100 rounded-lg text-sm">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-slate-700">{msg.recipient_number}</span>
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            </div>
                                            <p className="text-slate-600 text-xs line-clamp-1">{msg.body}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}