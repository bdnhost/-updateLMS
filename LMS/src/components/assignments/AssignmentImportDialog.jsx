import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Download, Upload, FileSpreadsheet, CheckCircle2, Loader2, Clipboard, FileText, Wand2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AssignmentImportDialog({ courseId, courses, organizationId, onImportSuccess, trigger }) {
    const [open, setOpen] = useState(false);
    const [importType, setImportType] = useState('assignment'); // assignment, exam, project
    const [inputMethod, setInputMethod] = useState('template'); // 'template', 'file', 'text'
    const [file, setFile] = useState(null);
    const [pastedText, setPastedText] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState(courseId || '');

    useEffect(() => {
        if (courseId) setSelectedCourseId(courseId);
    }, [courseId]);

    const handleDownloadTemplate = () => {
        let templateContent = '';
        
        if (importType === 'assignment') {
            templateContent = `כותרת*,תיאור,תאריך הגשה (YYYY-MM-DD)*,משקל (%),ציון מקסימלי,מושגי מפתח (מופרדים ב-|),קישורים (מופרדים ב-|),קישור YouTube,פרומפט תמונה (אנגלית),תמליל קריינות (עברית)
מטלת בית - פתרון בעיות,פתרו את התרגילים המצורפים בדף 45-50 והגישו דרך המערכת,2025-02-15,15,100,אלגוריתם|מורכבות זמן|רקורסיה,https://example.com/guide1|https://example.com/guide2,https://youtube.com/watch?v=abc123,A student solving complex math problems on whiteboard colorful markers vibrant classroom 8k photorealistic,[excited] הנה המטלה הראשונה שלכם! [pauses] קחו את הזמן... תעבדו בשקט. [thoughtful] זכרו - הטעויות הן חלק מהלמידה. בהצלחה!
תרגיל מעשי - קוד בפייתון,כתבו סקריפט שמחשב ממוצע ציונים ומציג גרף,2025-03-01,20,100,Python|Lists|Functions,https://python-guide.com,,A python code editor with colorful syntax highlighting dark theme professional developer workspace 4k,[thoughtful] התרגול הזה יעזור לכם להבין איך עובדים עם נתונים בפועל... תנסו לבד לפני שתסתכלו בפתרון.`;
        } else if (importType === 'quiz') {
            templateContent = `כותרת*,תיאור,תאריך הגשה (YYYY-MM-DD)*,משקל (%),ציון מקסימלי,פרומפט תמונה,תמליל קריינות
בוחן - פרק ראשון,בדיקת הבנה של החומר שנלמד בשבועות 1-3,2025-02-20,10,100,A quiz interface on modern tablet with checkmarks and progress bar clean design 4k,[thoughtful] בוחן קצר לבדיקת הבנה... [pauses] אל תלחצו! זה רק כדי לראות איפה אתם עומדים.
בוחן מהיר - יסודות,10 שאלות רב ברירה על היסודות,2025-03-05,5,100,Students taking digital quiz on laptops focused concentration professional setting 8k,[excited] בוחן מהיר! 10 שאלות בלבד. קראו כל שאלה בעיון... ובטח תצליחו!`;
        } else if (importType === 'exam') {
            templateContent = `כותרת*,תיאור,תאריך הגשה (YYYY-MM-DD)*,משקל (%),ציון מקסימלי,פרומפט תמונה,תמליל קריינות
מבחן אמצע - חומר מצטבר,מבחן מקיף על כל החומר שנלמד עד כה (פרקים 1-5),2025-03-15,30,100,Formal exam hall with students writing academic achievement symbols professional 8k cinematic,[thoughtful] המבחן הזה בודק את כל מה שלמדנו עד עכשיו. [pauses] הכינו היטב... תרגלו את כל החומר. [excited] אתם יכולים!
מבחן סופי - כל הקורס,מבחן סיום הכולל את כל נושאי הקורס,2025-04-01,40,100,Certificate of excellence with golden seal academic colors professional design 4k,[excited] המבחן הגדול! [pauses] זה הזמן להראות מה למדתם. תנו את הכל... ובהצלחה רבה!`;
        } else if (importType === 'project') {
            templateContent = `כותרת*,תיאור,תאריך הגשה סופי (YYYY-MM-DD)*,משקל (%),ציון מקסימלי,הנחיות כלליות,פרומפט תמונה,תמליל קריינות
פרויקט גמר - מערכת ניהול,בנו מערכת מלאה לניהול משימות עם ממשק משתמש ובסיס נתונים,2025-04-15,35,100,הפרויקט יכלול: UI מעוצב + Backend API + DB + תיעוד מלא. העבודה בצוותים של 3-4 סטודנטים.,Team of developers collaborating on project with laptops whiteboards and post-it notes creative workspace 8k,[excited] הפרויקט הגדול שלכם! [pauses] זו ההזדמנות ליישם את כל מה שלמדנו. [thoughtful] עבדו בצוות... תכננו טוב... ותיהנו מהתהליך!
פרויקט מחקר - ניתוח נתונים,נתחו מערך נתונים אמיתי והציגו ממצאים ומסקנות,2025-04-20,30,100,הפרויקט כולל: איסוף נתונים + ניתוח סטטיסטי + ויזואליזציות + מצגת סיכום.,Researchers analyzing data on multiple screens with charts and graphs modern office professional 4k,[thoughtful] מחקר אמיתי... [pauses] זה המקום שבו הכל מתחבר. אספו נתונים באיכות... נתחו בעומק... והציגו באופן מרשים.`;
        }

        const blob = new Blob(['\ufeff' + templateContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `import_template_${importType}_hebrew.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleImport = async () => {
        if (inputMethod === 'file' && !file) return;
        if (inputMethod === 'text' && !pastedText.trim()) return;
        if (!selectedCourseId) {
            toast.error('יש לבחור קורס ליבוא');
            return;
        }

        setIsUploading(true);

        try {
            let payload = {
                courseId: selectedCourseId,
                type: importType
            };

            if (inputMethod === 'file') {
                // 1. Upload file
                const uploadRes = await base44.integrations.Core.UploadFile({ file: file });
                payload.fileUrl = uploadRes.file_url;
            } else {
                // Use pasted text
                payload.csvContent = pastedText;
            }
            
            // 2. Process import
            const res = await base44.functions.invoke('importAssignments', payload);

            if (res.data?.success) {
                toast.success(`יבוא הושלם בהצלחה: ${res.data.count} מטלות נוצרו`);
                setOpen(false);
                setFile(null);
                setPastedText('');
                if (onImportSuccess) onImportSuccess();
            } else {
                toast.error('שגיאה ביבוא הנתונים: ' + (res.data?.error || 'Unknown error'));
            }
        } catch (error) {
            console.error(error);
            toast.error('שגיאת תקשורת בתהליך היבוא');
        } finally {
            setIsUploading(false);
        }
    };

    const activeCourses = courses?.filter(c => c.status === 'active') || [];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2">
                        <Upload className="w-4 h-4" />
                        יבוא מטלות
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>ייבוא מטלות מתקדם</DialogTitle>
                    <DialogDescription>
                        ייבוא המוני של מטלות עם תמיכה מלאה במדיה AI, קריינות ותוכן עשיר. תומך בכל הסוגים: מטלות, בוחנים, מבחנים ופרויקטים.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Course Selection (if not pre-selected) */}
                    {!courseId && (
                         <div className="space-y-2">
                            <Label>קורס יעד</Label>
                            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="בחר קורס..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeCourses.map(course => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Type Selection */}
                    <div className="space-y-2">
                        <Label>סוג תוכן ליבוא</Label>
                        <Select value={importType} onValueChange={setImportType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="assignment">מטלות רגילות</SelectItem>
                                <SelectItem value="exam">מבחנים ושאלונים</SelectItem>
                                <SelectItem value="project">פרויקטים ושלבים</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Template Info Card */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2.5 bg-white rounded-lg shadow-sm text-indigo-600">
                                <Wand2 className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 mb-1">תבנית מתקדמת עם AI</h4>
                                <p className="text-sm text-slate-600">
                                    כל תבנית כוללת דוגמאות מלאות לשדות: כותרת, תיאור, מושגים, 
                                    פרומפט לתמונת AI ותמליל לקריינות עברית.
                                </p>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleDownloadTemplate} 
                            className="w-full bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700 gap-2"
                        >
                            <Download className="w-4 h-4" />
                            הורד תבנית {importType === 'quiz' ? 'בוחנים' : importType === 'exam' ? 'מבחנים' : importType === 'project' ? 'פרויקטים' : 'מטלות'}
                        </Button>
                    </div>

                    {/* Input Method */}
                    <div className="space-y-2">
                        <Label>הזנת נתונים</Label>
                        <Tabs value={inputMethod} onValueChange={setInputMethod} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="template">
                                    <FileText className="w-4 h-4 mr-2" />
                                    תבנית
                                </TabsTrigger>
                                <TabsTrigger value="file">
                                    <Upload className="w-4 h-4 mr-2" />
                                    קובץ
                                </TabsTrigger>
                                <TabsTrigger value="text">
                                    <Clipboard className="w-4 h-4 mr-2" />
                                    הדבק
                                </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="template" className="mt-4">
                                <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-6 space-y-4">
                                    <div className="text-center">
                                        <FileSpreadsheet className="w-12 h-12 mx-auto text-indigo-500 mb-3" />
                                        <h4 className="font-semibold text-slate-800 mb-1">תבניות מוכנות לשימוש</h4>
                                        <p className="text-sm text-slate-500">
                                            הורד תבנית Excel/CSV עם דוגמאות מלאות, ערוך אותה ויבא חזרה
                                        </p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        {['assignment', 'quiz', 'exam', 'project'].map(type => (
                                            <Button
                                                key={type}
                                                variant="outline"
                                                className="h-auto py-3 flex-col gap-2 hover:bg-indigo-50 hover:border-indigo-300"
                                                onClick={() => {
                                                    setImportType(type);
                                                    setTimeout(handleDownloadTemplate, 100);
                                                }}
                                            >
                                                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                                                <span className="text-sm font-medium">
                                                    {type === 'assignment' ? 'מטלות' : type === 'quiz' ? 'בוחנים' : type === 'exam' ? 'מבחנים' : 'פרויקטים'}
                                                </span>
                                            </Button>
                                        ))}
                                    </div>
                                    
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-700">
                                        <strong>💡 טיפ:</strong> כל תבנית מכילה שדות AI מתקדמים (תמליל קריינות + פרומפט תמונה) שיעשירו את המטלות שלך אוטומטית!
                                    </div>
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="file" className="mt-4">
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative">
                                    <Input 
                                        type="file" 
                                        accept=".csv" 
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {file ? (
                                        <div className="flex flex-col items-center gap-2 text-indigo-600">
                                            <CheckCircle2 className="w-8 h-8" />
                                            <span className="font-medium">{file.name}</span>
                                            <span className="text-xs text-slate-400">מוכן ליבוא</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <Upload className="w-8 h-8" />
                                            <span className="text-sm">גרור לכאן קובץ CSV או לחץ לבחירה</span>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="text" className="mt-4">
                                <Textarea 
                                    value={pastedText}
                                    onChange={(e) => setPastedText(e.target.value)}
                                    placeholder="הדבק כאן את תוכן ה-CSV (למשל: כותרת,תאריך...)"
                                    className="min-h-[200px] font-mono text-xs p-4"
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    * הקפד להעתיק את הכותרות והנתונים במדויק מתוך קובץ האקסל/CSV.
                                </p>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
                    {inputMethod !== 'template' && (
                        <Button 
                            onClick={handleImport} 
                            disabled={(inputMethod === 'file' && !file) || (inputMethod === 'text' && !pastedText) || !selectedCourseId || isUploading}
                            className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                        >
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            {isUploading ? 'מעבד נתונים...' : 'בצע ייבוא'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}