import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Code, Terminal } from 'lucide-react';

export default function BridgeSetupGuide() {
    return (
        <Card className="border-blue-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-600" />
                    מדריך התקנת הגשר המעודכן
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>חשוב!</strong> הגשר הישן לא שולח heartbeat ולא מושך הודעות יוצאות. 
                        יש להריץ את הגרסה המעודכנת המצורפת להלן.
                    </AlertDescription>
                </Alert>

                <div className="space-y-3">
                    <h4 className="font-semibold text-sm">דרישות מערכת:</h4>
                    <div className="bg-slate-50 p-3 rounded-lg border space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span>Node.js מותקן (גרסה 16+)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span>חיבור אינטרנט יציב</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span>WhatsApp מחובר לטלפון</span>
                        </div>
                    </div>

                    <h4 className="font-semibold text-sm mt-4">שלבי התקנה:</h4>
                    <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs space-y-3">
                        <div>
                            <div className="text-slate-500 mb-1"># 1. התקן תלויות</div>
                            <div className="bg-slate-800 p-2 rounded">
                                npm install whatsapp-web.js qrcode-terminal axios
                            </div>
                        </div>
                        
                        <div>
                            <div className="text-slate-500 mb-1"># 2. הורד את הקובץ המעודכן מהטאב "קוד מקור"</div>
                        </div>

                        <div>
                            <div className="text-slate-500 mb-1"># 3. הרץ את הגשר</div>
                            <div className="bg-slate-800 p-2 rounded">
                                node academy4u-bridge-v3.2.6.js
                            </div>
                        </div>
                    </div>

                    <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            <strong>מה הגשר המעודכן עושה?</strong>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                                <li>שולח heartbeat כל 30 שניות (מעדכן "Bridge: מחובר")</li>
                                <li>מושך הודעות יוצאות כל 5 שניות ושולח אותן</li>
                                <li>מסנכרן הודעות נכנסות בזמן אמת</li>
                                <li>מעדכן סטטוסים (נשלח/נקרא/נכשל)</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                        <p className="font-bold text-amber-800 mb-2">💡 אם הגשר מופעל אבל הודעות לא נשלחות:</p>
                        <ol className="list-decimal list-inside space-y-1 text-amber-700">
                            <li>ודא שאתה משתמש בגרסה 3.2.6 ומעלה</li>
                            <li>בדוק ב-console של הגשר שאין שגיאות</li>
                            <li>וודא שהגשר רואה "Polling outgoing messages..." כל 5 שניות</li>
                            <li>בדוק בטאב "אבחון" שהסטטוס הוא CONNECTED</li>
                        </ol>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}