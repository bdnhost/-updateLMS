import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar, Clock, MapPin, Video, Presentation, Mic, FileText, Download, ExternalLink, Bell, CheckSquare, Sparkles } from 'lucide-react';
import AudioPlayer from '@/components/common/AudioPlayer';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function PublicSessionView({ resource }) {
    const { 
        title, 
        session_number, 
        description, 
        objectives, 
        date, 
        start_time, 
        end_time, 
        location,
        video_conference_link,
        presentation_url,
        recording_url,
        materials = [],
        assignments = [],
        announcements = [],
        course_name,
        course_code
    } = resource;

    const formattedDate = useMemo(() => {
        if (!date) return null;
        const d = new Date(date);
        return !isNaN(d.getTime()) ? format(d, 'EEEE, d בMMMM yyyy', { locale: he }) : date;
    }, [date]);

    return (
        <div className="space-y-6" dir="rtl">
            {/* Hero Card */}
            <Card className="overflow-hidden border-0 shadow-2xl">
                <div className={`relative ${resource.media_url ? 'min-h-[300px] flex flex-col justify-end' : 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600'} p-8 md:p-12 text-white`}>
                    {/* Background Image */}
                    {resource.media_url && (
                        <>
                            <div className="absolute inset-0">
                                <img src={resource.media_url} alt={title} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
                        </>
                    )}
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="flex-1 text-right">
                            {/* Badges */}
                            <div className="flex items-center gap-2 mb-4 flex-wrap">
                                <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 backdrop-blur-md shadow-lg">
                                    <Sparkles className="h-3 w-3 ml-1" />
                                    {course_name} {course_code ? `(${course_code})` : ''}
                                </Badge>
                                <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 border-0 shadow-lg">
                                    מפגש {session_number}
                                </Badge>
                            </div>
                            
                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white drop-shadow-lg leading-tight">
                                {title}
                            </h1>
                            
                            {/* Meta Info */}
                            <div className="flex flex-wrap gap-3 text-white/95 text-sm">
                                {formattedDate && (
                                    <span className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-md hover:bg-black/50 transition-colors">
                                        <Calendar className="h-4 w-4" />
                                        {formattedDate}
                                    </span>
                                )}
                                {(start_time || end_time) && (
                                    <span className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-md hover:bg-black/50 transition-colors">
                                        <Clock className="h-4 w-4" />
                                        {start_time} - {end_time}
                                    </span>
                                )}
                                {location && (
                                    <span className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-md hover:bg-black/50 transition-colors">
                                        <MapPin className="h-4 w-4" />
                                        {location}
                                    </span>
                                )}
                                {resource.audio_url && (
                                    <span className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 backdrop-blur-md px-4 py-2 rounded-full text-white border border-white/20 shadow-lg animate-pulse">
                                        <Mic className="h-4 w-4" />
                                        הנחיה קולית
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* Course Logo */}
                        {resource.course_logo_url && (
                            <div className="hidden md:block relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
                                <div className="relative h-28 w-28 bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-3 shrink-0">
                                    <img src={resource.course_logo_url} alt="Course Logo" className="w-full h-full object-contain" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6 md:p-8 space-y-8">
                    {/* Quick Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Zoom Link */}
                        {video_conference_link ? (
                            <Button 
                                asChild 
                                className="group h-auto py-5 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-blue-700 border-2 border-blue-200 shadow-md hover:shadow-xl transition-all duration-300"
                            >
                                <a href={video_conference_link} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3">
                                    <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform">
                                        <Video className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <span className="font-semibold">שיעור אונליין</span>
                                    <span className="text-xs text-blue-600">Zoom Meeting</span>
                                </a>
                            </Button>
                        ) : (
                            <div className="h-auto py-5 bg-slate-50 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3">
                                <div className="p-3 bg-slate-100 rounded-xl">
                                    <Video className="h-6 w-6 opacity-50" />
                                </div>
                                <span className="text-sm font-medium">אין קישור אונליין</span>
                            </div>
                        )}

                        {/* Presentation */}
                        {presentation_url ? (
                            <Button 
                                asChild 
                                className="group h-auto py-5 bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 text-orange-700 border-2 border-orange-200 shadow-md hover:shadow-xl transition-all duration-300"
                            >
                                <a href={presentation_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3">
                                    <div className="p-3 bg-orange-100 rounded-xl group-hover:scale-110 transition-transform">
                                        <Presentation className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <span className="font-semibold">מצגת המפגש</span>
                                    <span className="text-xs text-orange-600">PowerPoint</span>
                                </a>
                            </Button>
                        ) : (
                            <div className="h-auto py-5 bg-slate-50 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3">
                                <div className="p-3 bg-slate-100 rounded-xl">
                                    <Presentation className="h-6 w-6 opacity-50" />
                                </div>
                                <span className="text-sm font-medium">אין מצגת זמינה</span>
                            </div>
                        )}

                        {/* Recording */}
                        {recording_url ? (
                            <Button 
                                asChild 
                                className="group h-auto py-5 bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-700 border-2 border-red-200 shadow-md hover:shadow-xl transition-all duration-300"
                            >
                                <a href={recording_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3">
                                    <div className="p-3 bg-red-100 rounded-xl group-hover:scale-110 transition-transform">
                                        <Mic className="h-6 w-6 text-red-600" />
                                    </div>
                                    <span className="font-semibold">הקלטת המפגש</span>
                                    <span className="text-xs text-red-600">Zoom Recording</span>
                                </a>
                            </Button>
                        ) : (
                            <div className="h-auto py-5 bg-slate-50 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3">
                                <div className="p-3 bg-slate-100 rounded-xl">
                                    <Mic className="h-6 w-6 opacity-50" />
                                </div>
                                <span className="text-sm font-medium">אין הקלטה</span>
                            </div>
                        )}
                    </div>

                    {/* Audio Player */}
                    {resource.audio_url && (
                        <div className="animate-in fade-in zoom-in duration-700 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-100 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Mic className="h-5 w-5 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-bold text-indigo-900">הנחיה קולית למפגש</h3>
                            </div>
                            <AudioPlayer 
                                src={resource.audio_url} 
                                title="פתיח המפגש" 
                            />
                        </div>
                    )}

                    {/* Description & Objectives */}
                    {(description || objectives) && (
                        <div className="space-y-6 text-right">
                            {description && (
                                <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-md hover:shadow-lg transition-shadow">
                                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                                        <div className="p-2 bg-violet-100 rounded-lg">
                                            <FileText className="h-5 w-5 text-violet-600" />
                                        </div>
                                        תקציר המפגש
                                    </h3>
                                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{description}</p>
                                </div>
                            )}
                            
                            {objectives && (
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border-2 border-emerald-100 shadow-md hover:shadow-lg transition-shadow">
                                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                            <CheckSquare className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        מטרות המפגש
                                    </h3>
                                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{objectives}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Accordion Sections */}
                    <Accordion type="multiple" defaultValue={['materials', 'assignments', 'announcements']} className="w-full space-y-4">
                        {/* Materials */}
                        {materials.length > 0 && (
                            <AccordionItem value="materials" className="border-0 bg-white rounded-2xl shadow-md overflow-hidden">
                                <AccordionTrigger className="hover:no-underline bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b-2 border-blue-100 hover:from-blue-100 hover:to-cyan-100 transition-all">
                                    <div className="flex items-center gap-3 text-lg font-bold text-slate-800">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Download className="h-5 w-5 text-blue-600" />
                                        </div>
                                       חומרי לימוד למפגש זה
                                        <Badge className="bg-blue-600 text-white border-0 shadow-md">{materials.length}</Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-6">
                                    <div className="grid gap-4">
                                        {materials.map(material => (
                                            <div 
                                                key={material.id} 
                                                onClick={() => window.location.href = `?type=material&id=${material.id}`}
                                                className="group flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
                                            >
                                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-200 group-hover:scale-110 transition-all shadow-md">
                                                    {material.type === 'link' ? <ExternalLink className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                                                </div>
                                                <div className="flex-1 text-right">
                                                    <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{material.title}</h4>
                                                    {material.description && <p className="text-sm text-slate-600 mt-1">{material.description}</p>}
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-100 transition-all" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(material.file_url, '_blank');
                                                    }}
                                                >
                                                    <Download className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )}

                        {/* Assignments */}
                        {assignments.length > 0 && (
                            <AccordionItem value="assignments" className="border-0 bg-white rounded-2xl shadow-md overflow-hidden">
                                <AccordionTrigger className="hover:no-underline bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b-2 border-indigo-100 hover:from-indigo-100 hover:to-purple-100 transition-all">
                                    <div className="flex items-center gap-3 text-lg font-bold text-slate-800">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <CheckSquare className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        מטלות למפגש זה
                                        <Badge className="bg-indigo-600 text-white border-0 shadow-md">{assignments.length}</Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-6">
                                    <div className="grid gap-4">
                                        {assignments.map(assignment => (
                                            <a 
                                                key={assignment.id}
                                                href={`?type=assignment&id=${assignment.id}`}
                                                className="group flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-indigo-50 border-2 border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-lg transition-all"
                                            >
                                                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl group-hover:bg-indigo-200 group-hover:scale-110 transition-all shadow-md">
                                                    <FileText className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1 text-right">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{assignment.title}</h4>
                                                        <Badge variant="outline" className="text-xs border-indigo-200 text-indigo-700">
                                                            {assignment.type === 'exam' ? 'מבחן' : assignment.type === 'quiz' ? 'בוחן' : 'מטלה'}
                                                        </Badge>
                                                        <Badge className="bg-indigo-100 text-indigo-700 border-0 text-[10px] px-2">
                                                            מטלת מפגש
                                                        </Badge>
                                                    </div>
                                                    {assignment.due_date && (
                                                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                                            <Clock className="h-3 w-3" />
                                                            הגשה עד: {assignment.due_date}
                                                        </div>
                                                    )}
                                                </div>
                                                <ExternalLink className="h-5 w-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )}

                        {/* Announcements */}
                        {announcements.length > 0 && (
                            <AccordionItem value="announcements" className="border-0 bg-white rounded-2xl shadow-md overflow-hidden">
                                <AccordionTrigger className="hover:no-underline bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b-2 border-orange-100 hover:from-orange-100 hover:to-amber-100 transition-all">
                                    <div className="flex items-center gap-3 text-lg font-bold text-slate-800">
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <Bell className="h-5 w-5 text-orange-600" />
                                        </div>
                                        הודעות חשובות
                                        <Badge className="bg-orange-600 text-white border-0 shadow-md">{announcements.length}</Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-6">
                                    <div className="space-y-4">
                                        {announcements.map(announcement => (
                                            <div key={announcement.id} className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-bold text-slate-900 text-lg">{announcement.title}</h4>
                                                    <Badge variant="outline" className="text-xs text-slate-500 border-slate-300">
                                                        {(() => {
                                                            const d = new Date(announcement.created_date);
                                                            return !isNaN(d.getTime()) ? format(d, 'dd/MM/yyyy HH:mm') : '-';
                                                        })()}
                                                    </Badge>
                                                </div>
                                                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{announcement.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )}
                    </Accordion>
                </div>
            </Card>
        </div>
    );
}