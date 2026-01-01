import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
    ImageIcon, 
    Wand2, 
    Loader2, 
    Download, 
    ExternalLink, 
    RefreshCw, 
    Zap,
    PlayCircle,
    CheckCircle2,
    AlertCircle,
    Server,
    FileCode,
    Mic,
    FileText,
    Calendar
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import AudioPlayer from '@/components/common/AudioPlayer';

export default function CourseMediaGallery({ course, sessions, assignments, materials }) {
    const [testPrompt, setTestPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [activeTab, setActiveTab] = useState('gallery');
    const [isSyncing, setIsSyncing] = useState(false);
    const queryClient = base44.useQueryClient ? base44.useQueryClient() : null; // Safe fallback or import hook

    const handleManualSync = async () => {
        setIsSyncing(true);
        try {
            const promises = [];

            // 1. Sync Course
            if (course.id) {
                promises.push(base44.functions.invoke('mediaSync', {
                    action: 'cpanel_sync',
                    entityType: 'course',
                    entityId: course.id
                }));
            }

            // 2. Sync Sessions
            if (sessions && sessions.length > 0) {
                promises.push(base44.functions.invoke('mediaSync', {
                    action: 'cpanel_sync',
                    entityType: 'session',
                    ids: sessions.map(s => s.id)
                }));
            }

            // 3. Sync Assignments
            if (assignments && assignments.length > 0) {
                promises.push(base44.functions.invoke('mediaSync', {
                    action: 'cpanel_sync',
                    entityType: 'assignment',
                    ids: assignments.map(a => a.id)
                }));
            }

            // 4. Sync Materials
            if (materials && materials.length > 0) {
                promises.push(base44.functions.invoke('mediaSync', {
                    action: 'cpanel_sync',
                    entityType: 'material',
                    ids: materials.map(m => m.id)
                }));
            }

            const results = await Promise.all(promises);

            // Aggregate results
            const totalProcessed = results.reduce((acc, res) => acc + (res.data?.processed || 0), 0);
            const errors = results.filter(res => !res.data?.success);

            if (errors.length === 0) {
                toast.success(`סנכרון מלא הושלם: ${totalProcessed} פריטים עודכנו.`);
                queryClient.invalidateQueries({ queryKey: ['course', course.id] });
                queryClient.invalidateQueries({ queryKey: ['courseSessions', course.id] });
                queryClient.invalidateQueries({ queryKey: ['courseAssignments', course.id] });
                queryClient.invalidateQueries({ queryKey: ['courseMaterials', course.id] });
            } else {
                toast.warning(`סנכרון הושלם חלקית. ${totalProcessed} עודכנו, אך היו שגיאות.`);
            }
        } catch (e) {
            console.error(e);
            toast.error('שגיאה בסנכרון');
        } finally {
            setIsSyncing(false);
        }
    };

    // Aggregate all media (visual + audio)
    const allMedia = [
        ...(course.media_url ? [{
            id: 'course_main',
            mediaType: 'image',
            type: 'Course',
            title: 'תמונת נושא הקורס',
            url: course.media_url,
            prompt: course.media_prompt,
            entityId: course.id,
            createdDate: course.created_date
        }] : []),
        ...(course.audio_url ? [{
            id: 'course_audio',
            mediaType: 'audio',
            type: 'Course',
            title: 'הנחיה קולית לקורס',
            url: course.audio_url,
            script: course.audio_script,
            entityId: course.id,
            createdDate: course.created_date
        }] : []),
        ...(sessions || []).filter(s => s.media_url).map(s => ({
            id: `${s.id}_media`,
            mediaType: 'image',
            type: 'Session',
            title: `מפגש ${s.session_number}: ${s.title}`,
            url: s.media_url,
            prompt: s.media_prompt,
            entityId: s.id,
            createdDate: s.created_date
        })),
        ...(sessions || []).filter(s => s.audio_url).map(s => ({
            id: `${s.id}_audio`,
            mediaType: 'audio',
            type: 'Session',
            title: `הנחיה קולית - מפגש ${s.session_number}: ${s.title}`,
            url: s.audio_url,
            script: s.audio_script,
            entityId: s.id,
            createdDate: s.created_date
        })),
        ...(assignments || []).filter(a => a.media_url).map(a => ({
            id: `${a.id}_media`,
            mediaType: 'image',
            type: 'Assignment',
            title: `מטלה: ${a.title}`,
            url: a.media_url,
            prompt: a.media_prompt,
            entityId: a.id,
            createdDate: a.created_date
        })),
        ...(assignments || []).filter(a => a.audio_url).map(a => ({
            id: `${a.id}_audio`,
            mediaType: 'audio',
            type: 'Assignment',
            title: `הנחיה קולית - מטלה: ${a.title}`,
            url: a.audio_url,
            script: a.audio_script,
            entityId: a.id,
            createdDate: a.created_date
        })),
        ...(materials || []).filter(m => m.media_url).map(m => ({
            id: `${m.id}_media`,
            mediaType: 'image',
            type: 'Material',
            title: `חומר לימוד: ${m.title}`,
            url: m.media_url,
            prompt: m.media_prompt,
            entityId: m.id,
            createdDate: m.created_date
        })),
        ...(materials || []).filter(m => m.audio_url).map(m => ({
            id: `${m.id}_audio`,
            mediaType: 'audio',
            type: 'Material',
            title: `הנחיה קולית - חומר: ${m.title}`,
            url: m.audio_url,
            script: m.audio_script,
            entityId: m.id,
            createdDate: m.created_date
        }))
    ];

    const handleTestGeneration = async () => {
        setIsGenerating(true);
        setTestResult(null);
        
        try {
            const startTime = Date.now();
            
            // 1. Push Request to cPanel Queue (Infrastructure Test)
            const res = await base44.functions.invoke('mediaSync', {
                action: 'test_connection',
                customPrompt: testPrompt || "Test Infrastructure Probe",
            });
            
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);

            if (res.data?.success) {
                // Initial success - request queued
                const initialResult = {
                    success: true,
                    url: null,
                    duration,
                    details: `התשתית תקינה! (media4u).\n${res.data.details}\nהבקשה נרשמה בתור (Inbox). ממתין לתוצאה...`
                };
                setTestResult(initialResult);
                toast.success(`בדיקת התשתית עברה בהצלחה. ממתין לתמונה...`);

                // 2. Poll for the expected image
                // Path logic matches media_worker V4: outputs/course_gen/task_test/media_test.png
                // Note: CPANEL_HOST is usually bdnhost.net based on context
                const targetUrl = `https://bdnhost.net/voice4u/outputs/course_gen/task_test/media_test.png?t=${Date.now()}`;
                
                let attempts = 0;
                const maxAttempts = 20; // 20 * 3s = 60 seconds
                
                const pollImage = setInterval(async () => {
                    attempts++;
                    try {
                        const check = await fetch(targetUrl, { method: 'HEAD' });
                        if (check.ok) {
                            clearInterval(pollImage);
                            setTestResult(prev => ({
                                ...prev,
                                url: targetUrl,
                                details: prev.details + `\n✅ התמונה נוצרה בהצלחה בשרת!`
                            }));
                            toast.success('התמונה נוצרה והיא זמינה!');
                            setIsGenerating(false); // Stop loader only when done
                        }
                    } catch (e) { console.log("Polling...", e); }

                    if (attempts >= maxAttempts) {
                        clearInterval(pollImage);
                        setIsGenerating(false);
                        toast.error('זמן ההמתנה עבר. ייתכן והתמונה עדיין מעובדת.');
                    }
                }, 3000);

            } else {
                setTestResult({
                    success: false,
                    error: res.data?.error || 'שגיאה בבדיקת התשתית',
                    duration
                });
                toast.error('בדיקת התשתית נכשלה');
                setIsGenerating(false);
            }
        } catch (e) {
            console.error(e);
            setTestResult({
                success: false,
                error: e.message,
                duration: 0
            });
            toast.error('תקלה בתקשורת');
            setIsGenerating(false);
        }
    };

    const handleDownloadWorker = async () => {
        try {
            const res = await base44.functions.invoke('downloadMediaWorker');
            const blob = new Blob([res.data], { type: 'text/x-python' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'media_worker.py';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('סקריפט השרת ירד בהצלחה');
        } catch (e) {
            console.error(e);
            toast.error('שגיאה בהורדת הסקריפט');
        }
    };

    const handleUpdateWorker = async () => {
        const toastId = toast.loading("מעדכן סקריפט בשרת...");
        try {
            const res = await base44.functions.invoke('mediaSync', { action: 'update_worker_code' });
            if (res.data?.success) {
                toast.success("הסקריפט עודכן בהצלחה בשרת! (Fallback Enabled)", { id: toastId });
            } else {
                toast.error("שגיאה בעדכון: " + (res.data?.error || "Unknown"), { id: toastId });
            }
        } catch (e) {
            console.error(e);
            toast.error("שגיאת תקשורת", { id: toastId });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">מדיה וויזואלית</h2>
                    <p className="text-slate-500">ניהול וצפייה בכל התכנים הויזואליים בקורס</p>
                </div>
                <div className="bg-slate-100 p-1 rounded-lg flex">
                    <Button 
                        variant={activeTab === 'gallery' ? 'white' : 'ghost'}
                        onClick={() => setActiveTab('gallery')}
                        size="sm"
                        className={activeTab === 'gallery' ? 'bg-white shadow-sm' : ''}
                    >
                        <ImageIcon className="w-4 h-4 ml-2" />
                        גלריה ({allMedia.length})
                    </Button>
                    <Button 
                        variant="ghost"
                        size="sm"
                        onClick={handleManualSync}
                        disabled={isSyncing}
                        className="text-slate-500 hover:text-indigo-600"
                        title="סנכרן מדיה מהשרת ידנית"
                    >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button 
                        variant={activeTab === 'lab' ? 'white' : 'ghost'}
                        onClick={() => setActiveTab('lab')}
                        size="sm"
                        className={activeTab === 'lab' ? 'bg-white shadow-sm text-indigo-600' : ''}
                    >
                        <Wand2 className="w-4 h-4 ml-2" />
                        מעבדת ניסוי (Test Lab)
                    </Button>
                </div>
            </div>

            {activeTab === 'gallery' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allMedia.map((item) => (
                        <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                            {item.mediaType === 'audio' ? (
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 border-b border-indigo-100">
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="p-4 bg-indigo-100 rounded-full">
                                            <Mic className="w-8 h-8 text-indigo-600" />
                                        </div>
                                    </div>
                                    <AudioPlayer src={item.url} title={item.title} minimal />
                                    <Badge className="absolute top-2 right-2 bg-white/90 text-slate-800 hover:bg-white border-0 shadow-sm backdrop-blur-sm">
                                        {item.type}
                                    </Badge>
                                </div>
                            ) : (
                                <div className="relative aspect-video bg-slate-100">
                                    <img 
                                        src={item.url} 
                                        alt={item.title} 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <Button asChild variant="secondary" size="sm">
                                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="w-4 h-4 ml-2" />
                                                הגדל
                                            </a>
                                        </Button>
                                    </div>
                                    <Badge className="absolute top-2 right-2 bg-white/90 text-slate-800 hover:bg-white border-0 shadow-sm backdrop-blur-sm">
                                        {item.type}
                                    </Badge>
                                </div>
                            )}
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-slate-800 mb-1 truncate" title={item.title}>
                                    {item.title}
                                </h3>
                                {item.createdDate && (
                                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(item.createdDate), 'dd/MM/yyyy HH:mm', { locale: he })}
                                    </div>
                                )}
                                {item.prompt && (
                                    <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 mt-2 line-clamp-2" title={item.prompt}>
                                        <span className="font-semibold">Prompt:</span> {item.prompt}
                                    </div>
                                )}
                                {item.script && (
                                    <details className="text-xs text-slate-500 mt-2">
                                        <summary className="cursor-pointer font-semibold hover:text-indigo-600 transition-colors flex items-center gap-1">
                                            <FileText className="w-3 h-3" />
                                            תמליל
                                        </summary>
                                        <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-100 text-slate-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                                            {item.script}
                                        </div>
                                    </details>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                    
                    {allMedia.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-200">
                            <ImageIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-slate-600">אין מדיה בקורס זה</h3>
                            <p className="text-slate-400 text-sm">השתמש בכפתורי "הפק מדיה" או "הפק אודיו" בתוך המפגשים או המטלות כדי ליצור תוכן.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'lab' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="border-indigo-100 shadow-md">
                        <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100">
                            <CardTitle className="flex items-center gap-2 text-indigo-900">
                                <Zap className="w-5 h-5 text-indigo-600" />
                                ניסוי הפקת מדיה (System Test)
                            </CardTitle>
                            <CardDescription>
                                בדיקת תהליך ה-E2E: שליחה ל-AI, קבלת תמונה, הורדה, שמירה באחסון והצגה.
                                <br/>
                                <span className="text-xs text-indigo-600 font-medium">הערה: תוצאת הניסוי לא נשמרת במסד הנתונים של הקורס.</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                                <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-2">
                                    <Server className="w-4 h-4 text-indigo-600" />
                                    הגדרת צד-שרת
                                </h4>
                                <p className="text-xs text-slate-600 mb-3">
                                    יש להריץ את סקריפט ה-Worker על שרת ה-cPanel כדי לעבד את הבקשות מתיקיית ה-Inbox.
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleDownloadWorker}
                                        className="w-full bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                    >
                                        <FileCode className="w-4 h-4 ml-2" />
                                        הורד סקריפט
                                    </Button>
                                    <Button 
                                        variant="default" 
                                        size="sm" 
                                        onClick={handleUpdateWorker}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                        <RefreshCw className="w-4 h-4 ml-2" />
                                        עדכן בשרת (Deploy)
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>פרומפט לניסוי (באנגלית)</Label>
                                <div className="relative">
                                    <Textarea 
                                        value={testPrompt}
                                        onChange={(e) => setTestPrompt(e.target.value)}
                                        placeholder="E.g., A futuristic classroom with holographic displays, digital art style"
                                        className="min-h-[100px] pr-10 font-mono text-sm"
                                        dir="ltr"
                                    />
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="absolute top-2 right-2 text-slate-400 hover:text-indigo-600"
                                        onClick={() => setTestPrompt("A modern, clean infographic showing the solar system planets, educational style, white background")}
                                        title="הכנס דוגמה"
                                    >
                                        <Wand2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <Button 
                                onClick={handleTestGeneration} 
                                disabled={isGenerating || !testPrompt}
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        מבצע ניסוי מערכת...
                                    </>
                                ) : (
                                    <>
                                        <PlayCircle className="w-4 h-4 mr-2" />
                                        הרץ ניסוי (Generate & Save)
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        {testResult ? (
                            <Card className={`border ${testResult.success ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
                                <CardHeader>
                                    <CardTitle className={`text-lg flex items-center gap-2 ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                        {testResult.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                        {testResult.success ? 'הניסוי עבר בהצלחה' : 'הניסוי נכשל'}
                                    </CardTitle>
                                    <CardDescription>
                                        זמן ביצוע: {testResult.duration} שניות
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-sm">
                                        <span className="font-semibold block mb-1">לוג המערכת:</span>
                                        <p className="font-mono text-xs bg-white p-2 rounded border border-slate-200">
                                            {testResult.details || testResult.error}
                                        </p>
                                    </div>

                                    {testResult.success && testResult.url && (
                                        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                                            <div className="p-2 bg-slate-50 border-b border-slate-100 text-xs font-medium text-slate-500 text-center">
                                                תוצאה מהאחסון הפנימי
                                            </div>
                                            <img 
                                                src={testResult.url} 
                                                alt="Test Result" 
                                                className="w-full h-auto object-cover max-h-[300px]"
                                            />
                                            <div className="p-3 flex justify-end">
                                                <Button asChild variant="outline" size="sm" className="text-xs">
                                                    <a href={testResult.url} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="w-3 h-3 mr-2" />
                                                        פתח קישור ישיר לקובץ
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="h-full flex items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400">
                                <div className="text-center">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                    <p>תוצאות הניסוי יופיעו כאן</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}