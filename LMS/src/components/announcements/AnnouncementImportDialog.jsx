import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileSpreadsheet, CheckCircle2, Loader2, Clipboard, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AnnouncementImportDialog({ courses, onImportSuccess }) {
    const [open, setOpen] = useState(false);
    const [inputMethod, setInputMethod] = useState('file'); // 'file', 'text'
    const [file, setFile] = useState(null);
    const [pastedText, setPastedText] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [defaultCourseId, setDefaultCourseId] = useState('auto'); // 'auto' means try to use course_code from CSV

    const handleDownloadTemplate = () => {
        const headers = ['course_code', 'session_number', 'title', 'content', 'priority', 'expiration_date', 'is_pinned'];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "announcements_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleImport = async () => {
        if (inputMethod === 'file' && !file) return;
        if (inputMethod === 'text' && !pastedText.trim()) return;

        setIsUploading(true);

        try {
            let payload = {
                courseId: defaultCourseId === 'auto' ? null : defaultCourseId
            };

            if (inputMethod === 'file') {
                const uploadRes = await base44.integrations.Core.UploadFile({ file: file });
                payload.fileUrl = uploadRes.file_url;
            } else {
                payload.csvContent = pastedText;
            }
            
            const res = await base44.functions.invoke('importAnnouncements', payload);

            if (res.data?.success) {
                toast.success(`יבוא הושלם בהצלחה: ${res.data.count} הכרזות נוצרו`);
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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Upload className="w-4 h-4" />
                    יבוא הכרזות
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>יבוא הכרזות המוני</DialogTitle>
                    <DialogDescription>
                        ניתן לטעון קובץ המכיל עמודת course_code לשיוך אוטומטי, או לבחור קורס ברירת מחדל.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                     <div className="space-y-2">
                        <Label>קורס ברירת מחדל (במידה ולא צוין קוד קורס)</Label>
                        <Select value={defaultCourseId} onValueChange={setDefaultCourseId}>
                            <SelectTrigger>
                                <SelectValue placeholder="שיוך אוטומטי לפי קוד קורס" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="auto">-- שיוך אוטומטי לפי עמודת course_code --</SelectItem>
                                {courses?.map(course => (
                                    <SelectItem key={course.id} value={course.id}>
                                        {course.name} ({course.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                                <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-sm">הורדת תבנית</h4>
                                <p className="text-xs text-slate-500">כולל עמודות: course_code, title, content...</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2">
                            <Download className="w-4 h-4" />
                            הורד תבנית
                        </Button>
                    </div>

                    <Tabs value={inputMethod} onValueChange={setInputMethod} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="file">
                                <Upload className="w-4 h-4 mr-2" />
                                העלאת קובץ
                            </TabsTrigger>
                            <TabsTrigger value="text">
                                <Clipboard className="w-4 h-4 mr-2" />
                                הדבקה
                            </TabsTrigger>
                        </TabsList>
                        
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
                                placeholder="הדבק כאן תוכן CSV..."
                                className="min-h-[150px] font-mono text-xs"
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
                    <Button 
                        onClick={handleImport} 
                        disabled={(inputMethod === 'file' && !file) || (inputMethod === 'text' && !pastedText) || isUploading}
                        className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                    >
                        {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                        בצע יבוא
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}