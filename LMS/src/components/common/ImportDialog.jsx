import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileSpreadsheet, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Download,
  XCircle,
  Sparkles,
  Wand2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ENTITY_SCHEMAS = {
  Student: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        description: "List of students. Extract rows even if headers are in Hebrew.",
        items: {
          type: 'object',
          properties: {
            full_name: { type: 'string', description: "Student Name (שם מלא)" },
            id_number: { type: 'string', description: "ID Number (ת.ז)" },
            email: { type: 'string', description: "Email" },
            phone: { type: 'string', description: "Phone" },
            department: { type: 'string', description: "Department" },
            course_name: { type: 'string', description: "Course Name (שם הקורס)" },
            notes: { type: 'string', description: "Notes" }
          },
          required: ['full_name']
        }
      }
    }
  },
  Material: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        description: "List of materials.",
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: "Title (כותרת)" },
            description: { type: 'string' },
            course_name: { type: 'string', description: "Course Name" },
            type: { type: 'string', enum: ['presentation', 'document', 'video', 'link', 'other', 'lexicon'] },
            week_number: { type: 'integer' },
            file_url: { type: 'string' },
            audio_script: { type: 'string', description: "Audio Script for Voice Guide (טקסט לקריינות)" },
            media_prompt: { type: 'string', description: "Media Prompt for AI Image (פרומפט לתמונה באנגלית)" }
          },
          required: ['title']
        }
      }
    }
  },
  Assignment: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        description: "List of assignments.",
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: "Title (כותרת)" },
            description: { type: 'string', description: "Description (תיאור)" },
            type: { type: 'string', enum: ['assignment', 'quiz', 'exam', 'project'], description: "Type (סוג - assignment/quiz/exam/project)" },
            due_date: { type: 'string', description: "Due Date (YYYY-MM-DD)" },
            course_name: { type: 'string', description: "Course Name" },
            weight: { type: 'number', description: "Weight (משקל)" },
            max_score: { type: 'number', description: "Max Score (ציון מקסימלי)" },
            video_url: { type: 'string', description: "Video URL (YouTube)" },
            key_concepts: { type: 'string', description: "Key Concepts (separated by |)" },
            resource_links: { type: 'string', description: "Resource Links (separated by |)" },
            audio_script: { type: 'string', description: "Audio Script for Voice Guide (טקסט לקריינות)" },
            media_prompt: { type: 'string', description: "Media Prompt for AI Image (פרומפט לתמונה באנגלית)" }
          },
          required: ['title']
        }
      }
    }
  },
  Course: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        description: "List of courses with full details including AI-generated media.",
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: "Course Name (שם הקורס) *" },
            code: { type: 'string', description: "Code (קוד קורס) *" },
            description: { type: 'string', description: "Description (תיאור)" },
            institution: { type: 'string', description: "Institution (מוסד)" },
            semester: { type: 'string', enum: ['סמסטר א', 'סמסטר ב', 'סמסטר קיץ', 'שנתי'], description: "Semester (סמסטר)" },
            year: { type: 'string', description: "Year (שנה)" },
            start_date: { type: 'string', description: "Start Date (תאריך התחלה YYYY-MM-DD) *" },
            total_sessions: { type: 'number', description: "Total Sessions (מספר מפגשים) *" },
            total_hours: { type: 'number', description: "Total Hours (סה״כ שעות קורס) *" },
            weekly_hours: { type: 'number', description: "Weekly Hours (שעות שבועיות)" },
            day_of_week: { type: 'string', enum: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'], description: "Day of Week (יום בשבוע)" },
            start_time: { type: 'string', description: "Start Time (שעת התחלה HH:MM)" },
            end_time: { type: 'string', description: "End Time (שעת סיום HH:MM)" },
            room: { type: 'string', description: "Room/Location (חדר/מיקום)" },
            attendance_threshold: { type: 'number', description: "Attendance Threshold (סף נוכחות באחוזים)" },
            color: { type: 'string', description: "Color (צבע לתצוגה)" },
            logo_url: { type: 'string', description: "Logo URL (קישור ללוגו)" },
            audio_script: { type: 'string', description: "Audio Script for Voice Guide (טקסט לקריינות)" },
            media_prompt: { type: 'string', description: "Media Prompt for AI Image Generation (פרומפט ליצירת תמונה)" },
            allow_self_registration: { type: 'boolean', description: "Allow Self Registration (אפשר רישום עצמי - true/false)" },
            is_public: { type: 'boolean', description: "Is Public (קורס ציבורי - true/false)" },
            auto_create_zoom: { type: 'boolean', description: "Auto Create Zoom (יצירה אוטומטית של Zoom - true/false)" }
          },
          required: ['name', 'code', 'start_date', 'total_sessions', 'total_hours']
        }
      }
    }
  },
  NotificationTemplate: {
    type: 'object',
    properties: {
        items: {
            type: 'array',
            description: "List of notification templates.",
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: "Template Name (שם התבנית)" },
                    content_template: { type: 'string', description: "Content (תוכן)" },
                    trigger_type: { type: 'string', enum: ['manual', 'pre_session', 'post_session', 'grade_published', 'attendance_alert', 'course_welcome'], description: "Trigger Type (סוג טריגר)" },
                    description: { type: 'string', description: "Description" }
                },
                required: ['name', 'content_template']
            }
        }
    }
  }
};

export default function ImportDialog({ 
  open, 
  onClose, 
  entityName, 
  courses, 
  organizationId, 
  onImportComplete,
  templateData,
  schemaDescription,
  entityDisplayMap // map english fields to hebrew for errors/success
}) {
  const [file, setFile] = useState(null);
  const [textData, setTextData] = useState('');
  const [importMethod, setImportMethod] = useState('file'); // 'file' or 'text'
  const [courseId, setCourseId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isSmartParsing, setIsSmartParsing] = useState(false);

  const activeCourses = courses?.filter(c => c.status === 'active') || [];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleClose = () => {
    setFile(null);
    setTextData('');
    setCourseId('');
    setResult(null);
    onClose();
  };

  const downloadTemplate = () => {
    if (!templateData) return;
    
    // Add BOM for Excel Hebrew support
    const blob = new Blob(['\ufeff' + templateData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `import_template_${entityName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper to robustly find values handling fuzzy keys (like "שם מלא*")
  const getValue = (obj, ...keys) => {
    if (!obj) return undefined;
    
    // 1. Try exact match
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key];
    }

    // 2. Try normalized match (remove special chars/spaces)
    // This handles cases like "שם מלא*" matching "שם מלא"
    const normalize = (str) => str ? str.toString().replace(/[^\w\u0590-\u05FF]/g, '').toLowerCase() : '';
    const normalizedObjKeys = Object.keys(obj).reduce((acc, k) => {
      acc[normalize(k)] = obj[k];
      return acc;
    }, {});

    for (const key of keys) {
      const val = normalizedObjKeys[normalize(key)];
      if (val !== undefined && val !== null && val !== '') return val;
    }
    
    return undefined;
  };

  // Client-side parser for pasted text
  const parseTextToItems = (text) => {
    const rawLines = text.trim().split(/[\r\n]+/);
    if (rawLines.length === 0) return [];

    // Detect delimiter
    const firstLine = rawLines[0];
    let delimiter = ',';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes(';') && (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) delimiter = ';';

    // Helper to split row handling quotes
    const splitRow = (row) => {
        if (delimiter === '\t') return row.split('\t').map(c => c.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        
        // CSV regex split
        const matches = [];
        let match;
        const regex = new RegExp(`(?:^|${delimiter})(\"(?:[^\"]|\"\")*\"|[^${delimiter}]*)`, 'g');
        while ((match = regex.exec(row)) !== null) {
            let val = match[1];
            if (val.startsWith(delimiter)) val = val.substring(1); // Should not happen with this regex logic usually but checking
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.slice(1, -1).replace(/""/g, '"');
            }
            matches.push(val.trim());
        }
        // Fallback for simple split if regex fails or returns empty (edge cases)
        if (matches.length === 0) return row.split(delimiter).map(c => c.trim());
        return matches;
    };

    const headers = splitRow(firstLine);
    const dataLines = rawLines.slice(1);

    return dataLines.map(line => {
        const values = splitRow(line);
        const obj = {};
        headers.forEach((header, index) => {
            // Keep original header (with *) as key for proper mapping later
            const cleanHeader = header.trim();
            if (cleanHeader) {
                obj[cleanHeader] = values[index] || '';
            }
        });
        return obj;
    });
  };

  const handleSmartParse = async () => {
      if (!textData.trim()) return;
      
      if (!organizationId && ['NotificationTemplate', 'Student', 'Assignment', 'Material', 'Course'].includes(entityName)) {
          setResult({ success: false, message: 'שגיאת מערכת: לא נמצא מזהה ארגון. יש לוודא שאתה מחובר לארגון.', details: [] });
          return;
      }

      setIsSmartParsing(true);
      setIsLoading(true);
      setResult(null);

      try {
          const response = await base44.functions.invoke('smartParseImport', {
              text: textData,
              entityName,
              organizationId
          });

          if (response.data?.items) {
             // Continue to process logic with these items
             await processItems(response.data.items);
          } else {
             setResult({ success: false, message: 'הפענוח נכשל: ' + (response.data?.error || 'Unknown error'), details: [] });
             setIsLoading(false);
          }
      } catch (error) {
          console.error("Smart Parse Error:", error);
          setResult({ success: false, message: 'שגיאה בפענוח', details: [] });
          setIsLoading(false);
      } finally {
          setIsSmartParsing(false);
      }
  };

  const processItems = async (items) => {
      if (!Array.isArray(items) || items.length === 0) {
        setResult({ success: false, message: 'לא נמצאו נתונים תקינים בקובץ', details: [] });
        setIsLoading(false);
        return;
      }

      const itemsToCreate = [];
      const errors = [];

      items.forEach((item, index) => {
        const rowNum = index + 1;
        // Generic cleanup
        Object.keys(item).forEach(key => (item[key] === null || item[key] === '') && delete item[key]);

        // Course Mapping Logic
        let targetCourseId = courseId;
        const courseName = getValue(item, 'course_name', 'course', 'שם קורס', 'קורס');
        
        if (courseName) {
          const normalizedInput = courseName.toString().trim().toLowerCase();
          const foundCourse = activeCourses.find(c => 
            c.name.trim().toLowerCase() === normalizedInput ||
            c.code.trim().toLowerCase() === normalizedInput
          );
          if (foundCourse) {
            targetCourseId = foundCourse.id;
          }
        }

        let processedItem = { ...item };
        let itemError = null;

        // Cleanup helper fields (fuzzy match keys)
        Object.keys(processedItem).forEach(key => {
            const normalized = key.replace(/[^\w\u0590-\u05FF]/g, '');
            if (['coursename', 'course', 'שםקורס', 'קורס'].includes(normalized)) {
                delete processedItem[key];
            }
        });

        // Add System Fields
        processedItem.organization_id = organizationId;
        if (targetCourseId) {
            processedItem.course_id = targetCourseId;
            processedItem.course_ids = [targetCourseId];
        }

        // Validation Logic
        if (entityName === 'Student') {
            const fullName = getValue(item, 'full_name', 'name', 'שם מלא', 'שם');
            
            if (!fullName) {
                itemError = "חסר שם מלא";
            } else {
                processedItem.full_name = fullName;
                processedItem.id_number = getValue(item, 'id_number', 'id', 'תעודת זהות', 'ת.ז', 'תז');
                processedItem.email = getValue(item, 'email', 'אימייל', 'דואר אלקטרוני');
                processedItem.phone = getValue(item, 'phone', 'טלפון', 'נייד', 'סלולרי');
                processedItem.department = getValue(item, 'department', 'מחלקה', 'חוג');
                processedItem.notes = getValue(item, 'notes', 'הערות');
                processedItem.status = 'active';

                if (!processedItem.course_id) itemError = "לא נמצא קורס מתאים (יש לבחור קורס או לציין בקובץ)";
            }
        } 
        else if (entityName === 'Material') {
            const title = getValue(item, 'title', 'name', 'כותרת*', 'כותרת', 'שם');
            
            if (!title || title.trim().length === 0) {
                itemError = "חסרה כותרת";
            } else {
                processedItem.title = title;
                processedItem.type = getValue(item, 'type', 'סוג', 'סוג (document/presentation/lexicon/video/link)', 'סוג (document/presentation/video/link)') || 'document'; 
                processedItem.description = getValue(item, 'description', 'תיאור');
                processedItem.topic = getValue(item, 'topic', 'נושא');
                const weekNum = getValue(item, 'week_number', 'week', 'מספר שבוע', 'שבוע');
                processedItem.week_number = weekNum ? parseInt(weekNum) : null;
                processedItem.file_url = getValue(item, 'file_url', 'url', 'link', 'קישור');
                processedItem.audio_script = getValue(item, 'audio_script', 'טקסט לקריינות', 'תמליל');
                processedItem.media_prompt = getValue(item, 'media_prompt', 'פרומפט לתמונה', 'פרומפט');
                
                // Allow import without course if a default is selected
                // The warning will still show if both are missing
            }
        }
        else if (entityName === 'Assignment') {
            const title = getValue(item, 'title', 'name', 'כותרת', 'שם המטלה', 'שם');
            
            if (!title) {
                itemError = "חסרה כותרת";
            } else {
                processedItem.title = title;
                processedItem.description = getValue(item, 'description', 'תיאור', 'הנחיות');
                processedItem.type = getValue(item, 'type', 'סוג') || 'assignment';
                processedItem.due_date = getValue(item, 'due_date', 'date', 'תאריך הגשה', 'תאריך', 'תאריך הגשה (YYYY-MM-DD)');
                processedItem.weight = getValue(item, 'weight', 'משקל', 'משקל (%)');
                processedItem.max_score = getValue(item, 'max_score', 'score', 'ציון מקסימלי', 'ניקוד');
                processedItem.video_url = getValue(item, 'video_url', 'video', 'וידאו', 'קישור לסרטון');
                processedItem.audio_script = getValue(item, 'audio_script', 'טקסט לקריינות', 'תמליל');
                processedItem.media_prompt = getValue(item, 'media_prompt', 'פרומפט לתמונה', 'פרומפט');

                // Handle array fields (split by | or ;)
                const conceptsStr = getValue(item, 'key_concepts', 'concepts', 'מושגים', 'מושגי מפתח');
                if (conceptsStr) {
                    processedItem.key_concepts = Array.isArray(conceptsStr) ? conceptsStr : conceptsStr.toString().split(/[|;]/).map(s => s.trim()).filter(Boolean);
                }

                const linksStr = getValue(item, 'resource_links', 'links', 'קישורים', 'מקורות');
                if (linksStr) {
                    processedItem.resource_links = Array.isArray(linksStr) ? linksStr : linksStr.toString().split(/[|;]/).map(s => s.trim()).filter(Boolean);
                }

                processedItem.status = 'open';

                if (!processedItem.course_id) itemError = "לא נמצא קורס מתאים";
            }
        }
        else if (entityName === 'Course') {
            const name = getValue(item, 'name', 'שם הקורס', 'שם');
            const startDate = getValue(item, 'start_date', 'תאריך התחלה', 'תאריך');
            const totalSessions = getValue(item, 'total_sessions', 'מספר מפגשים', 'מפגשים');
            const totalHours = getValue(item, 'total_hours', 'שעות', 'שעות לימוד', 'סה״כ שעות');
            
            if (!name) {
                itemError = "חסר שם קורס";
            } else if (!startDate) {
                itemError = "חסר תאריך התחלה";
            } else if (!totalSessions) {
                itemError = "חסר מספר מפגשים";
            } else if (!totalHours) {
                itemError = "חסר סה״כ שעות";
            } else {
                processedItem.name = name;
                processedItem.code = getValue(item, 'code', 'קוד', 'קוד קורס') || name.substring(0, 10);
                processedItem.description = getValue(item, 'description', 'תיאור');
                processedItem.institution = getValue(item, 'institution', 'מוסד');
                processedItem.semester = getValue(item, 'semester', 'סמסטר');
                processedItem.year = getValue(item, 'year', 'שנה');
                processedItem.start_date = startDate;
                processedItem.total_sessions = parseInt(totalSessions);
                processedItem.total_hours = parseFloat(totalHours);
                processedItem.weekly_hours = getValue(item, 'weekly_hours', 'שעות שבועיות');
                processedItem.day_of_week = getValue(item, 'day_of_week', 'יום', 'יום בשבוע');
                processedItem.start_time = getValue(item, 'start_time', 'שעת התחלה', 'התחלה');
                processedItem.end_time = getValue(item, 'end_time', 'שעת סיום', 'סיום');
                processedItem.room = getValue(item, 'room', 'מיקום', 'חדר', 'כיתה');
                processedItem.attendance_threshold = getValue(item, 'attendance_threshold', 'סף נוכחות') || 80;
                processedItem.color = getValue(item, 'color', 'צבע');
                processedItem.logo_url = getValue(item, 'logo_url', 'לוגו', 'קישור ללוגו');
                processedItem.audio_script = getValue(item, 'audio_script', 'טקסט לקריינות', 'תמליל');
                processedItem.media_prompt = getValue(item, 'media_prompt', 'פרומפט לתמונה', 'פרומפט');
                
                // Boolean fields - handle text values
                const selfReg = getValue(item, 'allow_self_registration', 'רישום עצמי', 'אפשר רישום');
                processedItem.allow_self_registration = selfReg === true || selfReg === 'true' || selfReg === 'כן' || selfReg === '1';
                
                const isPublic = getValue(item, 'is_public', 'ציבורי', 'קורס ציבורי');
                processedItem.is_public = isPublic === true || isPublic === 'true' || isPublic === 'כן' || isPublic === '1';
                
                const autoZoom = getValue(item, 'auto_create_zoom', 'Zoom אוטומטי', 'יצירת Zoom');
                processedItem.auto_create_zoom = autoZoom === true || autoZoom === 'true' || autoZoom === 'כן' || autoZoom === '1';
                
                processedItem.status = 'active';
            }
        }
        else if (entityName === 'NotificationTemplate') {
            const name = getValue(item, 'name', 'שם התבנית', 'שם');
            const content = getValue(item, 'content_template', 'תוכן', 'הודעה');
            
            if (!name) {
                itemError = "חסר שם תבנית";
            } else if (!content) {
                itemError = "חסר תוכן הודעה";
            } else {
                processedItem.name = name;
                processedItem.content_template = content;
                processedItem.trigger_type = getValue(item, 'trigger_type', 'סוג טריגר', 'טריגר') || 'manual';
                processedItem.description = getValue(item, 'description', 'תיאור');
                processedItem.channel = 'whatsapp'; // Default for now
                processedItem.is_active = true;
            }
        }

        if (itemError) {
            const identifier = item.full_name || item.title || item.name || `שורה ${rowNum}`;
            errors.push({ row: rowNum, identifier, error: itemError });
        } else {
            itemsToCreate.push(processedItem);
        }
      });

      if (itemsToCreate.length === 0) {
         setResult({ 
             success: false, 
             message: 'לא נמצאו פריטים תקינים לייבוא',
             details: errors
         });
         setIsLoading(false);
         return;
      }

      // 5. Bulk Create
      if (base44.entities[entityName]) {
          try {
              await base44.entities[entityName].bulkCreate(itemsToCreate);
              
              // Post-create actions
              if (entityName === 'Assignment') {
                  try {
                      const events = itemsToCreate
                          .filter(a => a.due_date && a.course_id)
                          .map(a => ({
                              organization_id: organizationId,
                              course_id: a.course_id,
                              title: `הגשה: ${a.title}`,
                              description: `מועד אחרון להגשת מטלה: ${a.title}`,
                              date: a.due_date,
                              start_time: '23:59',
                              end_time: '23:59',
                              type: 'deadline',
                              location: 'מקוון'
                          }));
                      if (events.length > 0) {
                          await base44.entities.CalendarEvent.bulkCreate(events);
                      }
                  } catch (e) {
                      console.error("Failed to sync assignments to calendar", e);
                  }
              }

              setResult({ 
                success: true, 
                message: `ייבוא הושלם: ${itemsToCreate.length} הצליחו, ${errors.length} נכשלו`,
                details: errors,
                createdCount: itemsToCreate.length
              });
              onImportComplete?.();
          } catch (error) {
             setResult({ success: false, message: 'שגיאה בשמירת הנתונים', details: [{ type: 'error', text: error.message }] });
          }
      } else {
          setResult({ success: false, message: `שגיאת מערכת: ישות ${entityName} לא קיימת`, details: [] });
      }
      setIsLoading(false);
  };

  const handleImport = async () => {
    if (!organizationId && ['NotificationTemplate', 'Student', 'Assignment', 'Material', 'Course'].includes(entityName)) {
        setResult({ success: false, message: 'שגיאת מערכת: לא נמצא מזהה ארגון. יש לוודא שאתה מחובר לארגון.', details: [] });
        return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      let items = [];

      if (importMethod === 'text') {
        // Client-side parsing for text
        if (!textData.trim()) {
            setIsLoading(false);
            return;
        }
        items = parseTextToItems(textData);
      } else {
        // Server-side extraction for files (XLSX, etc)
        if (!file) {
            setIsLoading(false);
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
          setResult({ success: false, message: 'הקובץ גדול מדי (מקסימום 5MB)', details: [] });
          setIsLoading(false);
          return;
        }

        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        const schema = ENTITY_SCHEMAS[entityName] || {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                description: schemaDescription,
                items: { type: 'object', additionalProperties: true } 
              }
            }
        };

        const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
            file_url,
            json_schema: schema
        });

        if (extractResult.status === 'error') {
            setResult({ success: false, message: 'שגיאה בפענוח הקובץ', details: [{ type: 'error', text: extractResult.details }] });
            setIsLoading(false);
            return;
        }

        items = extractResult.output?.items || (Array.isArray(extractResult.output) ? extractResult.output : []);
      }
      
      await processItems(items);

    } catch (error) {
      console.error("Import Error:", error);
      setResult({ success: false, message: 'שגיאה בתהליך הייבוא', details: [{ type: 'error', text: error.message }] });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle dir="rtl">ייבוא נתונים - {entityDisplayMap?.[entityName] || entityName}</DialogTitle>
          <DialogDescription dir="rtl">
            העלה קובץ או הדבק נתונים לייבוא מרוכז
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          
          <div className="bg-slate-50 p-4 rounded-lg text-sm border border-slate-200">
             <p className="font-semibold mb-2">הנחיות לייבוא:</p>
             <ul className="list-disc list-inside space-y-1 text-slate-600">
                 {activeCourses.length > 0 && <li>ניתן לבחור קורס ברירת מחדל לכל השורות</li>}
                 <li>או לציין עמודה <strong>"שם הקורס"</strong> בקובץ לכל שורה</li>
                 <li>השורות חייבות לכלול את שדות החובה המסומנים בכוכבית בקובץ הדוגמה</li>
             </ul>
          </div>

          {activeCourses.length > 0 && (
            <div className="space-y-2">
              <Label>קורס ברירת מחדל (מומלץ)</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר קורס לשיוך (אופציונלי)" />
                </SelectTrigger>
                <SelectContent>
                  {activeCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">שם קורס בקובץ יקבל עדיפות על בחירה זו.</p>
            </div>
          )}

          <Tabs value={importMethod} onValueChange={setImportMethod} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="file">העלאת קובץ</TabsTrigger>
              <TabsTrigger value="text">הדבקת טקסט</TabsTrigger>
            </TabsList>
            
            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label>קובץ (CSV / Excel)</Label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {file ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                        <span className="text-slate-700">{file.name}</span>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                        <p className="text-slate-600">לחץ לבחירת קובץ</p>
                        <p className="text-sm text-slate-400 mt-1">CSV, XLSX, XLS</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label>הדבק תוכן (Excel / CSV או טקסט חופשי)</Label>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleSmartParse}
                        disabled={!textData.trim() || isLoading}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                        {isSmartParsing ? (
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        ) : (
                            <Wand2 className="w-4 h-4 ml-2" />
                        )}
                        פענוח חכם (AI)
                    </Button>
                </div>
                <Textarea
                  placeholder="הדבק כאן טבלה, רשימה או טקסט חופשי..."
                  value={textData}
                  onChange={(e) => setTextData(e.target.value)}
                  className="min-h-[150px] font-mono text-sm"
                />
                <p className="text-xs text-slate-500">
                    טיפ: השתמש ב"פענוח חכם" כדי להמיר טקסט לא מובנה לרשומות בצורה אוטומטית.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="w-full"
          >
            <Download className="h-4 w-4 ml-2" />
            הורד תבנית Excel לדוגמה
          </Button>

          {result && (
            <div className="space-y-3">
              <div className={`p-4 rounded-lg flex items-start gap-3 ${
                result.success ? 'bg-emerald-50' : 'bg-red-50'
              }`}>
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                    <p className={`font-medium ${result.success ? 'text-emerald-700' : 'text-red-700'}`}>
                      {result.message}
                    </p>
                </div>
              </div>

              {/* Detailed Error Report */}
              {result.details && result.details.length > 0 && (
                <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                  <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-500">
                    פירוט שגיאות ({result.details.length})
                  </div>
                  <div className="max-h-40 overflow-y-auto p-2 space-y-1">
                    {result.details.map((err, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-600 p-1 hover:bg-slate-100 rounded">
                        <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <span>
                          {err.row ? <strong>שורה {err.row}: </strong> : ''}
                          {err.identifier ? <span className="font-medium">{err.identifier} - </span> : ''}
                          {err.error || err.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button variant="outline" onClick={handleClose} className="bg-slate-700 hover:bg-slate-800 text-white border-slate-600">
              {result?.success ? 'סגור' : 'ביטול'}
            </Button>
            {!result?.success && (
              <Button 
                onClick={handleImport} 
                disabled={(importMethod === 'file' ? !file : !textData.trim()) || isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isLoading && <Loader2 className="h-4 w-4 ms-2 animate-spin" />}
                ייבוא נתונים
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}