import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Upload, FileJson, CheckCircle2, AlertCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function CourseImportDialog({ open, onClose, onSuccess }) {
    const [jsonContent, setJsonContent] = useState('');
    const [activeTab, setActiveTab] = useState('paste');
    const [parseError, setParseError] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    
    const queryClient = useQueryClient();

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target.result;
                setJsonContent(content);
                validateJson(content);
            } catch (err) {
                setParseError("שגיאה בקריאת הקובץ");
            }
        };
        reader.readAsText(file);
    };

    const validateJson = (content) => {
        try {
            const data = JSON.parse(content);
            if (!data.course) {
                throw new Error("מבנה לא תקין: חסר אובייקט 'course'");
            }
            setParsedData(data);
            setParseError(null);
            return true;
        } catch (e) {
            setParseError(e.message);
            setParsedData(null);
            return false;
        }
    };

    const handlePasteChange = (e) => {
        const content = e.target.value;
        setJsonContent(content);
        if (content.trim()) {
            validateJson(content);
        } else {
            setParsedData(null);
            setParseError(null);
        }
    };

    const importMutation = useMutation({
        mutationFn: async (data) => {
            const response = await base44.functions.invoke('importCoursePackage', { 
                data,
                options: { collisionStrategy: 'create_copy' }
            });
            
            console.log("Import response:", response);
            
            // Check for errors in response
            if (response.data?.error) {
                throw new Error(response.data.error);
            }
            
            if (response.data?.status === 'success') {
                return response.data;
            }
            
            throw new Error('תגובה לא צפויה מהשרת');
        },
        onSuccess: (result) => {
            const summary = result.summary || {};
            toast.success(`הקורס יובא בהצלחה! נוצרו: ${summary.sessions || 0} מפגשים, ${summary.assignments || 0} מטלות, ${summary.materials || 0} חומרים`);
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            if (onSuccess) onSuccess(result);
            handleClose();
        },
        onError: (err) => {
            console.error("Import failed:", err);
            const errorMsg = err.response?.data?.error || err.message || 'שגיאה לא ידועה';
            toast.error('שגיאה בייבוא הקורס: ' + errorMsg);
        }
    });

    const handleImport = () => {
        if (!parsedData) return;
        importMutation.mutate(parsedData);
    };

    const handleClose = () => {
        setJsonContent('');
        setParsedData(null);
        setParseError(null);
        onClose();
    };

    const generateSampleTemplate = () => {
        const template = {
            "_DOCUMENTATION": {
                "role": "You are a world-class pedagogical expert, curriculum designer, and learning experience architect.",
                "instruction": "Generate a comprehensive course package in strict JSON. Every entity MUST include 'media_prompt' (detailed English for DALL-E/Flux) and 'audio_script' (Hebrew with V3 Alpha tags).",
                "key_concepts": {
                    "temp_id": "Link assignments/materials to sessions using 's1', 's2', etc.",
                    "audio_v3_rules": "Use [excited], [thoughtful], [whispers], [pauses] and '...' for natural Hebrew breathing.",
                    "image_rules": "Prompts must be in English. Include style keywords: cinematic, 4k, minimalist, photorealistic.",
                    "audio_limits": "Max 2500 chars per audio_script. Split longer content into multiple materials.",
                    "media_quality": "All media_prompts should be in English, detailed, specify style/mood/lighting/angle.",
                    "hebrew_quality": "audio_script in fluent Hebrew with natural punctuation for pauses."
                }
            },
            "course": {
                "name": "שם הקורס בעברית שיווקית מושכת",
                "code": "COURSE-CODE-123",
                "description": "תיאור מפורט ומעמיק של הקורס: למה הוא חשוב? מה התלמידים ילמדו? איך זה ישנה אותם?",
                "institution": "שם המוסד האקדמי (אוניברסיטה/קולג'/מכללה)",
                "semester": "סמסטר א",
                "year": "2025",
                "start_date": "2025-03-01",
                "day_of_week": "שני",
                "start_time": "18:00",
                "end_time": "21:00",
                "total_sessions": 12,
                "total_hours": 48,
                "weekly_hours": 4,
                "room": "אולם 301 או 'למידה מרחוק'",
                "status": "active",
                "attendance_threshold": 80,
                "color": "from-violet-600 to-indigo-600",
                "allow_self_registration": true,
                "is_public": false,
                "auto_create_zoom": false,
                "logo_url": "https://example.com/course-logo.png",
                "media_prompt": "A professional wide 16:9 cinematic shot of modern university classroom with students collaborating, soft natural window lighting, clean minimalist design, photorealistic, 8k quality, muted blue and white color palette",
                "audio_script": "[excited] שלום וברוכים הבאים לקורס המדהים הזה! [pauses] אני המנטור הדיגיטלי שלכם... וביחד אנחנו הולכים ליצור פה משהו מיוחד. [thoughtful] הקורס הזה לא רק ילמד אתכם - הוא ישנה את הדרך שבה אתם חושבים. מוכנים להתחיל?"
            },
            "schedule": {
                "recurrence_type": "weekly",
                "days_of_week": ["Monday"],
                "start_time": "18:00",
                "end_time": "21:00",
                "start_date": "2025-03-01",
                "location": "מעבדה 1"
            },
            "sessions": [
                {
                    "temp_id": "s1",
                    "session_number": 1,
                    "title": "מפגש פתיחה - היכרות ויסודות",
                    "description": "במפגש זה נכיר את החומר הבסיסי, נבין את המבנה הכללי של הקורס, ונניח את היסודות למסע הלימודי שלנו.",
                    "objectives": "1. להבין את מטרות הקורס ומבנהו.\n2. להכיר את המושגים המרכזיים.\n3. לבנות מוטיבציה ללמידה עצמאית.",
                    "date": "2025-03-01",
                    "start_time": "18:00",
                    "end_time": "21:00",
                    "duration_hours": 3,
                    "location": "אולם 301",
                    "teacher_notes": "דגשים למרצה: צור אווירה חמה ומזמינה. הדגש את הרלוונטיות לעולם האמיתי. שלב דוגמאות מעשיות.",
                    "media_prompt": "A bright modern classroom filled with diverse students collaborating around a table, large windows with natural light, clean minimal aesthetic, soft blue and white tones, 8k photorealistic, inspiring and welcoming atmosphere",
                    "audio_script": "[excited] שלום לכולם וברוכים הבאים למפגש הראשון! [pauses] היום אנחנו מתחילים מסע מרתק שיביא אתכם לרמה חדשה לגמרי. [thoughtful] המפגש הראשון הוא תמיד הכי חשוב... כי פה נבנה את היסודות לכל השאר. אז קפיצה פנימה!"
                },
                {
                    "temp_id": "s2",
                    "session_number": 2,
                    "title": "העמקה ותרגול מעשי",
                    "description": "נעמיק בנושאים שלמדנו, נבצע תרגילים מעשיים ונוודא הבנה מלאה של החומר.",
                    "objectives": "1. לתרגל את החומר בפועל.\n2. לזהות אתגרים נפוצים.\n3. לפתח כלים לפתרון בעיות.",
                    "duration_hours": 3,
                    "teacher_notes": "שלב דוגמאות מהחיים. עודד שאלות. תן זמן לעבודה עצמאית.",
                    "media_prompt": "Students working on laptops in small groups, modern tech lab environment, collaborative energy, warm lighting, 8k detail, professional educational setting",
                    "audio_script": "[excited] מפגש שני - עכשיו זה נהיה מעניין! [pauses] היום אנחנו עוברים לשלב המעשי. [thoughtful] זכרו - טעויות זה חלק מהתהליך. תנסו, תשאלו, תתנסו... וזה בדיוק איך לומדים באמת."
                }
            ],
            "assignments": [
                {
                    "id": "task_week1",
                    "title": "מטלת פתיחה - מושגי יסוד",
                    "description": "במטלה זו תתבקשו להוכיח הבנה של מושגי היסוד שלמדנו במפגש הראשון. השלימו את התרגילים המצורפים והגישו תשובות מנומקות.",
                    "type": "assignment",
                    "session_temp_id": "s1",
                    "due_date": "2025-03-08",
                    "max_score": 100,
                    "weight": 15,
                    "video_url": "https://www.youtube.com/watch?v=EXAMPLE",
                    "key_concepts": [
                        { "term": "מושג מרכזי 1", "definition": "הסבר ברור ומדויק של המושג הראשון" },
                        { "term": "מושג מרכזי 2", "definition": "הסבר ברור ומדויק של המושג השני" }
                    ],
                    "resource_links": [
                        "https://example.com/resource1",
                        "https://example.com/resource2"
                    ],
                    "media_prompt": "A 3D isometric illustration of a student completing a checklist on a glowing digital tablet, vibrant purple and blue gradient background, modern minimalist style, floating UI elements, 4k quality",
                    "audio_script": "[excited] הנה המטלה הראשונה שלכם! [pauses] אני יודע שזה יכול להרגיש קצת מאתגר בהתחלה... אבל זה בדיוק הנקודה. [thoughtful] המטרה היא לא רק לענות נכון, אלא להבין למה התשובה נכונה. קחו את הזמן, תעבדו לאט ובמתינות... ואם משהו לא ברור, תמיד אפשר לשאול. בהצלחה!",
                    "rubric": {
                        "name": "רובריקת הערכה - מטלת יסוד",
                        "criteria": [
                            { "title": "הבנת החומר", "description": "הצגת הבנה מעמיקה של המושגים המרכזיים", "max_points": 40 },
                            { "title": "דיוק וביסוס", "description": "תשובות מדויקות ומבוססות על המקורות", "max_points": 30 },
                            { "title": "יצירתיות ויישום", "description": "יכולת ליישם את החומר באופן יצירתי ומקורי", "max_points": 30 }
                        ]
                    }
                },
                {
                    "id": "quiz_week2",
                    "title": "בוחן - בדיקת הבנה",
                    "description": "בוחן קצר לבדיקת הבנה של החומר שנלמד עד כה. 10 שאלות רב-ברירה.",
                    "type": "quiz",
                    "session_temp_id": "s2",
                    "due_date": "2025-03-15",
                    "max_score": 100,
                    "weight": 10,
                    "media_prompt": "A clean quiz interface on a modern tablet screen, checkmarks and progress indicators, soft gradient background, professional educational design, 4k",
                    "audio_script": "[thoughtful] בוחן קצר לבדיקת הבנה... אל תלחצו! [pauses] זה לא מבחן גורלי, רק דרך לראות איפה אתם עומדים. עשו את זה ברגוע, קראו היטב כל שאלה... ובטח תצליחו מצוין!"
                }
            ],
            "materials": [
                {
                    "title": "מצגת מבוא - שקופיות פתיחה",
                    "description": "מצגה מקיפה המסבירה את יסודות הקורס, מטרותיו והציפיות מהתלמידים.",
                    "type": "presentation",
                    "file_url": "https://example.com/intro-slides.pdf",
                    "session_temp_id": "s1",
                    "week_number": 1,
                    "topic": "מבוא ויסודות",
                    "media_prompt": "A sleek modern presentation slide deck cover with abstract geometric shapes, gradient from deep purple to electric blue, professional corporate style, 8k quality, clean typography space",
                    "audio_script": "[excited] הנה המצגת המרכזית שלנו! [pauses] עברו עליה לאט, קחו הפסקות... תנסו לחשוב איך כל שקופית מתקשרת לשקופית הבאה. [thoughtful] זה הבסיס לכל מה שיבוא אחר כך."
                },
                {
                    "title": "מילון מונחים - לקסיקון הקורס",
                    "description": "רשימה מלאה של כל המושגים המקצועיים בקורס עם הגדרות ברורות ודוגמאות.",
                    "type": "lexicon",
                    "file_url": "https://example.com/glossary.pdf",
                    "session_temp_id": "s1",
                    "week_number": 1,
                    "topic": "מילון מונחים",
                    "media_prompt": "An elegant open dictionary with golden illuminated letters floating above glowing pages, magical knowledge aesthetic, dark blue background with sparkles, cinematic lighting, 4k",
                    "audio_script": "[thoughtful] המילון הזה הוא חבר הכי טוב שלכם לאורך הקורס. [pauses] כל פעם שתתקלו במושג לא ברור - חזרו אליו. זה לא סתם רשימה, זה כלי עבודה חיוני."
                },
                {
                    "title": "מדריך למידה עצמאית",
                    "description": "מסמך עם טיפים והמלצות כיצד ללמוד את החומר בצורה יעילה ועצמאית.",
                    "type": "document",
                    "file_url": "https://example.com/study-guide.pdf",
                    "week_number": 1,
                    "topic": "אסטרטגיות למידה",
                    "media_prompt": "A student in a cozy study space with organized notes and laptop, warm desk lamp lighting, plants in background, calm and focused atmosphere, photorealistic 8k",
                    "audio_script": "[whispers] למידה עצמאית... זה אומר שאתם האחראים. [pauses] אבל אני כאן לעזור לכם. [excited] במדריך הזה תמצאו טכניקות מדהימות לשיפור הזיכרון, הבנה מעמיקה וניהול זמן חכם. השקיעו בו - זה משתלם!"
                },
                {
                    "title": "סרטון הסבר - הדגמה מעשית",
                    "description": "צפו בסרטון ההדרכה המלא לפני המפגש הבא.",
                    "type": "video",
                    "file_url": "https://www.youtube.com/watch?v=EXAMPLE_ID",
                    "session_temp_id": "s2",
                    "week_number": 2,
                    "topic": "הדגמה חיה",
                    "media_prompt": "A professional video player interface showing an educational tutorial, play button prominent, modern UI design, gradient blue background, 4k mockup",
                    "audio_script": "[excited] הסרטון הזה הוא פצצה! [pauses] אתם הולכים לראות איך עושים את זה בפועל, צעד אחרי צעד. [thoughtful] טיפ שלי: צפו פעמיים - פעם אחת להבנה כללית, ופעם שנייה תוך כדי תרגול."
                }
            ],
            "announcements": [
                {
                    "title": "ברוכים הבאים לקורס! 🎓",
                    "content": "שלום וברוכים הבאים!\n\nאנחנו שמחים לקבל אתכם לקורס המיוחד הזה.\n\nנקודות חשובות:\n• המפגש הראשון: [DATE]\n• נא להכין את החומרים המצורפים מראש\n• הצטרפו לקבוצת הווצאפ של הקורס\n\nבהצלחה!\nצוות ההוראה",
                    "priority": "urgent",
                    "is_pinned": true,
                    "session_temp_id": "s1"
                },
                {
                    "title": "תזכורת - מטלה לשבוע הבא",
                    "content": "הי,\n\nתזכורת ידידותית שהמטלה הראשונה צריכה להיות מוגשת עד יום רביעי בחצות.\n\nאם יש שאלות - פנו אלינו במייל או בקבוצת הווצאפ.\n\nבהצלחה!",
                    "priority": "normal",
                    "session_temp_id": "s1"
                }
            ],
            "_INSTRUCTIONS_FOR_LLM": {
                "structure_guide": "This template demonstrates ALL available features. Use it as reference when generating course packages.",
                "required_fields_course": ["name", "code", "start_date", "total_sessions", "total_hours"],
                "required_fields_session": ["session_number", "title"],
                "required_fields_assignment": ["title", "due_date"],
                "required_fields_material": ["title"],
                "ai_generation_tips": {
                    "media_prompts": "Always in English. Be specific about: style (photorealistic/illustration/3D), lighting, colors, mood, angle/composition.",
                    "audio_scripts": "Hebrew only. Use V3 Alpha tags: [excited], [thoughtful], [whispers], [pauses]. Add '...' for natural breathing. Max 2500 chars.",
                    "content_quality": "Think like a professor AND a marketer. Make it engaging, clear, and valuable."
                },
                "boolean_fields": "allow_self_registration, is_public, auto_create_zoom can be true/false",
                "linking": "Use temp_id in sessions (s1, s2, s3...) then reference via session_temp_id in assignments/materials",
                "full_example_flow": "1. Define course with all metadata. 2. Create sessions with learning objectives. 3. Link assignments to sessions. 4. Add materials (presentations/videos/lexicons). 5. Post announcements. 6. Generate ALL media_prompts and audio_scripts for rich experience."
            }
        };
        navigator.clipboard.writeText(JSON.stringify(template, null, 4));
        toast.success('תבנית מתקדמת (LLM-Ready) הועתקה ללוח');
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>ייבוא קורס מתקדם</DialogTitle>
                    <DialogDescription>
                        העלה קובץ JSON או הדבק את תוכן הקורס בפורמט המתאים.
                        הייבוא כולל: קורס, מפגשים, מטלות, חומרים והודעות.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={generateSampleTemplate} className="gap-2 text-xs">
                            <Copy className="w-3 h-3" />
                            העתק תבנית לדוגמה
                        </Button>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="paste">הדבקה</TabsTrigger>
                            <TabsTrigger value="file">העלאת קובץ</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="paste" className="space-y-4">
                            <div className="space-y-2">
                                <Label>הדבק JSON כאן</Label>
                                <Textarea 
                                    placeholder='{ "course": { ... }, "sessions": [...] }'
                                    className="font-mono text-xs h-64"
                                    value={jsonContent}
                                    onChange={handlePasteChange}
                                />
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="file" className="space-y-4">
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center space-y-4 bg-slate-50">
                                <div className="bg-white p-4 rounded-full w-fit mx-auto shadow-sm">
                                    <FileJson className="w-8 h-8 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-slate-900">גרור קובץ לכאן</h3>
                                    <p className="text-sm text-slate-500 mt-1">או לחץ לבחירה</p>
                                </div>
                                <Input 
                                    type="file" 
                                    accept=".json"
                                    className="hidden" 
                                    id="file-upload"
                                    onChange={handleFileUpload}
                                />
                                <Button asChild variant="secondary">
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <Upload className="w-4 h-4 mr-2" />
                                        בחר קובץ JSON
                                    </label>
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {parseError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>שגיאה בפורמט</AlertTitle>
                            <AlertDescription>{parseError}</AlertDescription>
                        </Alert>
                    )}

                    {parsedData && !parseError && (
                        <Alert className="bg-green-50 border-green-200 text-green-800">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle>הנתונים תקינים</AlertTitle>
                            <AlertDescription>
                                זוהה קורס: <strong>{parsedData.course.name}</strong>
                                <br />
                                <span className="text-xs opacity-80">
                                    כולל {parsedData.sessions?.length || 0} מפגשים, {parsedData.assignments?.length || 0} מטלות
                                </span>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>ביטול</Button>
                    <Button 
                        onClick={handleImport} 
                        disabled={!parsedData || !!parseError || importMutation.isPending}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {importMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        ייבא קורס
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}