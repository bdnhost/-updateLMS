import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Loader2, FileText, Video, Link as LinkIcon, Presentation, File, Download,
  ExternalLink, Calendar, Clock, AlertCircle, GraduationCap, Users, BookOpen,
  Bell, Mic, ChevronLeft, ChevronRight, UserPlus, UserCircle2, Copy, Target,
  Mail, Headphones, Eye
} from 'lucide-react';
import InteractiveAssignmentView from '@/components/public/InteractiveAssignmentView';
import PublicStudentView from '@/components/public/PublicStudentView';
import PublicSessionView from '@/components/public/PublicSessionView';
import PublicSchoolView from '@/components/public/PublicSchoolView';
import StudentMotivator from '@/components/public/StudentMotivator';
import PublicMenu from '@/components/public/PublicMenu';
import PublicBreadcrumbs from '@/components/public/PublicBreadcrumbs';
import PublicClock from '@/components/public/PublicClock';
import SelfLearningWizard from '@/components/public/SelfLearningWizard';
import AudioPlayer from '@/components/common/AudioPlayer';
import CourseRegistrationDialog from '@/components/public/CourseRegistrationDialog';
import StudentLoginDialog from '@/components/landing/StudentLoginDialog';
import { MaterialContent as MaterialContentRenderer } from '@/components/common/MaterialContentRenderer';

const typeIcons = {
  presentation: Presentation,
  document: FileText,
  video: Video,
  link: LinkIcon,
  other: File,
  assignment: FileText,
  course: GraduationCap,
  student: Users
};

export default function PublicView() {
  const [params, setParams] = useState({ type: '', id: '', studentId: '' });
  const [currentAction, setCurrentAction] = useState(null);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [studentLoginOpen, setStudentLoginOpen] = useState(false);

  const handleUserAction = (action) => {
      setCurrentAction(action);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setParams({
      type: searchParams.get('type'),
      id: searchParams.get('id'),
      studentId: searchParams.get('student_id'),
      courseId: searchParams.get('course_id')
    });
  }, []);

  const { data: resource, isLoading, error } = useQuery({
    queryKey: ['publicResource', params.type, params.id, params.courseId],
    queryFn: async () => {
      if (!params.type || !params.id) return null;
      const response = await base44.functions.invoke('getPublicResource', { 
        type: params.type, 
        id: params.id,
        course_id: params.courseId
      });
      return response.data;
    },
    enabled: !!params.type && !!params.id
  });

  useEffect(() => {
    if (resource) {
      const title = resource.title || resource.name || 'EduManage';
      const orgName = resource.organization_name || 'EduManage';
      document.title = title + ' | ' + orgName;
    }
    return () => {
      document.title = 'EduManage';
    };
  }, [resource]);

  useEffect(() => {
    const effectiveStudentId = params.type === 'student' ? params.id : params.studentId;
    if (!effectiveStudentId || !params.type || !params.id) return;

    const browserSessionId = sessionStorage.getItem('edu_session_id') || Math.random().toString(36).substring(7);
    sessionStorage.setItem('edu_session_id', browserSessionId);

    base44.functions.invoke('updateStudentActivity', { 
        studentId: effectiveStudentId,
        resourceType: params.type,
        resourceId: params.id,
        action: 'view',
        sessionId: browserSessionId
    }).catch(console.error);

    const sendHeartbeat = () => {
        base44.functions.invoke('updateStudentActivity', { 
            studentId: effectiveStudentId,
            resourceType: params.type,
            resourceId: params.id,
            action: 'heartbeat',
            duration: 60,
            sessionId: browserSessionId
        }).catch(console.error);
    };

    const interval = setInterval(sendHeartbeat, 60000);
    return () => clearInterval(interval);
  }, [params.type, params.id, params.studentId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="p-8 text-center max-w-md w-full">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">התוכן לא נמצא</h2>
          <p className="text-slate-600">ייתכן שהקישור שגוי או שהתוכן הוסר.</p>
        </Card>
      </div>
    );
  }

  const Icon = typeIcons[resource.type] || File;
  const isAssignment = params.type === 'assignment';
  const isCourse = params.type === 'course';
  const isStudent = params.type === 'student';
  const isSession = params.type === 'session';
  const isSchool = params.type === 'school' || params.type === 'organization';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 pb-24 font-['Heebo'] overflow-x-hidden" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&display=swap');
        body { font-family: 'Heebo', sans-serif; text-align: right; }
        .prose { text-align: right; }
        p, h1, h2, h3, h4, h5, h6, span, div { text-align: right; }
        .ltr { text-align: left; }
      `}</style>

      <PublicMenu resource={resource} studentId={params.studentId} />

      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between mb-4">
            <a href="https://edu-manage.org/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                    <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 text-transparent bg-clip-text">EduManage</span>
            </a>
            {params.studentId ? (
                <Button
                    onClick={() => {
                        navigator.clipboard.writeText(params.studentId);
                    }}
                    size="sm"
                    variant="outline"
                    className="border-violet-200 text-violet-700 hover:bg-violet-50 gap-2"
                >
                    <UserCircle2 className="h-4 w-4" />
                    <span className="hidden sm:inline text-xs">מזהה: {params.studentId.substring(0, 8)}...</span>
                </Button>
            ) : (
                <Button
                    onClick={() => setStudentLoginOpen(true)}
                    size="sm"
                    variant="outline"
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                    <UserCircle2 className="h-4 w-4 ml-1" />
                    <span className="hidden sm:inline">כניסת תלמידים</span>
                </Button>
            )}
        </div>

        <div className="sticky top-0 z-40 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/60 border-b border-slate-200/50 -mx-4 px-4 py-3 shadow-sm transition-all duration-200">
        <div className="max-w-3xl mx-auto">
         <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <PublicBreadcrumbs resource={resource} className="mb-0" />
                <PublicClock className="hidden sm:flex text-xs py-1" />
            </div>
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                     {(isCourse ? resource.logo_url : (isSchool ? resource.logo_url : (resource.course_logo_url || resource.organization_logo))) && (
                         <img 
                           src={isCourse ? resource.logo_url : (isSchool ? resource.logo_url : (resource.course_logo_url || resource.organization_logo))} 
                           alt="Logo" 
                           className="h-8 w-8 object-contain rounded bg-white p-0.5 shadow-sm" 
                           onError={(e) => e.target.style.display = 'none'}
                         />
                     )}
                     <div>
                         <h1 className="text-lg font-bold text-slate-900 leading-tight line-clamp-1">{resource.organization_name || 'EduManage'}</h1>
                         {!isCourse && !isSchool && resource.course_name && (
                            <p className="text-xs text-slate-500 leading-none mt-0.5 line-clamp-1">{resource.course_name}</p>
                         )}
                     </div>
                </div>
                <PublicClock className="sm:hidden text-xs py-1" />
            </div>
         </div>
        </div>
        </div>

        {isAssignment ? (
          <InteractiveAssignmentView resource={resource} onAction={handleUserAction} studentId={params.studentId} />
        ) : isStudent ? (
          <PublicStudentView resource={resource} />
        ) : isSession ? (
          <PublicSessionView resource={resource} />
        ) : isSchool ? (
          <PublicSchoolView resource={resource} />
        ) : params.type === 'material' && resource.type === 'Material' ? (
          <Card className="overflow-hidden shadow-lg border-0">
            <div className={resource.media_url ? 'p-6 relative h-64 flex items-end text-white' : 'p-6 bg-gradient-to-br from-violet-600 to-purple-600 text-white'}>
              {resource.media_url ? (
                <>
                  <div className="absolute inset-0">
                    <img src={resource.media_url} alt={resource.title} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-lg">
                      <Icon className="h-12 w-12 text-white" />
                    </div>
                    <div>
                      <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 mb-2">חומר לימוד</Badge>
                      <h2 className="text-2xl font-bold" dir="rtl">{resource.title}</h2>
                      {resource.topic && <p className="text-white/80 mt-1">{resource.topic}</p>}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-lg">
                    <Icon className="h-12 w-12 text-white" />
                  </div>
                  <div>
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 mb-2">חומר לימוד</Badge>
                    <h2 className="text-2xl font-bold" dir="rtl">{resource.title}</h2>
                    {resource.topic && <p className="text-white/80 mt-1">{resource.topic}</p>}
                  </div>
                </div>
              )}
            </div>

            {resource.assignment_id && resource.assignment_title && (
              <div className="px-6 pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = '?type=assignment&id=' + resource.assignment_id}
                  className="gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                  חזרה למטלה: {resource.assignment_title}
                </Button>
              </div>
            )}

            <div className="p-6 md:p-8 space-y-6">
              {resource.description && (
                <div
                  className="text-slate-600 font-medium leading-relaxed prose prose-slate max-w-none"
                  dir="rtl"
                  dangerouslySetInnerHTML={{ __html: resource.description }}
                />
              )}

              {resource.audio_url && (
                <div className="mb-6">
                  <AudioPlayer src={resource.audio_url} title="הנחיה קולית" />
                </div>
              )}

              {/* Action Buttons - Moved to top for better visibility */}
              {resource.file_url && (
                <div className="flex gap-3 justify-end">
                  {(() => {
                    const url = resource.file_url.toLowerCase();
                    const isYouTube = url.match(/(youtube\.com|youtu\.be)/);
                    const isExternalLink = resource.type === 'link';

                    if (isYouTube) {
                      return (
                        <Button asChild className="bg-red-600 hover:bg-red-700 text-white shadow-lg">
                          <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 ml-2" />
                            פתח ב-YouTube
                          </a>
                        </Button>
                      );
                    }

                    if (isExternalLink) {
                      return (
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                          <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 ml-2" />
                            פתח קישור חיצוני
                          </a>
                        </Button>
                      );
                    }

                    return (
                      <>
                        <Button asChild variant="outline" className="border-2 border-slate-300">
                          <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 ml-2" />
                            פתח בחלון חדש
                          </a>
                        </Button>
                        <Button asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
                          <a href={resource.file_url} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 ml-2" />
                            הורד קובץ
                          </a>
                        </Button>
                      </>
                    );
                  })()}
                </div>
              )}

              {(() => {
                // Check if we have file_url first to determine priority
                if (resource.file_url) {
                  const url = resource.file_url.toLowerCase();
                  const isYouTube = url.match(/(youtube\.com|youtu\.be)/);
                  const isImage = url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
                  const isPDF = url.match(/\.pdf$/i);
                  const isHTML = url.match(/\.(html|htm)$/i);
                  const isVideo = url.match(/\.(mp4|webm|ogg|mov|avi)$/i);
                  const isLink = resource.type === 'link';

                  if (isYouTube) {
                    const videoUrl = resource.file_url.includes('watch?v=') 
                      ? resource.file_url.replace('watch?v=', 'embed/').split('&')[0]
                      : resource.file_url;
                    return (
                      <div className="w-full overflow-hidden rounded-lg border border-slate-200" style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}>
                        <iframe 
                          src={videoUrl}
                          className="w-full h-full"
                          allowFullScreen
                          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                        />
                      </div>
                    );
                  }

                  if (isImage) {
                    return <img src={resource.file_url} alt={resource.title} className="w-full rounded-lg shadow-lg" />;
                  }

                  if (isHTML) {
                    return (
                      <div className="overflow-visible rounded-lg border-2 border-indigo-200 shadow-xl" style={{ height: 'calc(100vh - 350px)', minHeight: '500px' }}>
                        <iframe
                          src={resource.file_url}
                          className="w-full h-full bg-white"
                          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                          title={resource.title}
                          style={{ border: 0 }}
                        />
                      </div>
                    );
                  }

                  if (isPDF) {
                    return (
                      <div className="overflow-hidden rounded-lg border border-slate-200" style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}>
                        <iframe src={resource.file_url} className="w-full h-full" />
                      </div>
                    );
                  }

                  if (isVideo) {
                    return <video src={resource.file_url} controls className="w-full rounded-lg shadow-lg" />;
                  }

                  if (isLink) {
                    return (
                      <div className="overflow-visible rounded-2xl border-2 border-blue-200 shadow-2xl" style={{ height: 'calc(100vh - 350px)', minHeight: '500px' }}>
                        <iframe
                          src={resource.file_url}
                          className="w-full h-full"
                          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                          title={resource.title}
                          style={{ border: 0 }}
                        />
                      </div>
                    );
                  }

                  return (
                    <div className="text-center py-16">
                      <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg px-8 py-6 text-lg h-auto">
                        <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-6 h-6 ml-3" />
                          פתח קישור
                        </a>
                      </Button>
                      <p className="text-xs text-slate-400 mt-6 max-w-md mx-auto break-all">{resource.file_url}</p>
                    </div>
                  );
                }

                // If no file_url but has generated_content
                if (resource.generated_content) {
                  return <MaterialContentRenderer resource={resource} />;
                }

                // No content available
                return <p className="text-center text-slate-400">אין תוכן זמין</p>;
              })()}
            </div>
          </Card>
        ) : isCourse ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden shadow-2xl border-0 rounded-3xl">
              <div className={resource.media_url ? 'relative overflow-hidden h-80 flex flex-col justify-end' : 'relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-10'}>
                {resource.media_url ? (
                  <>
                    <div className="absolute inset-0">
                      <img src={resource.media_url} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }} />
                    
                    <div className="relative z-10 p-8 md:p-10">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Badge className="bg-white/90 backdrop-blur-sm text-slate-800 border-0 mb-4 px-4 py-1.5 shadow-lg font-bold text-sm">
                          <GraduationCap className="h-4 w-4 ml-1" />
                          {resource.code}
                        </Badge>
                      </motion.div>
                      
                      <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl md:text-5xl font-black mb-3 text-white drop-shadow-2xl"
                      >
                        {resource.name}
                      </motion.h1>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap gap-3 text-white/95 text-sm mt-4"
                      >
                        {resource.institution && (
                          <span className="flex items-center gap-2 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 shadow-xl">
                            <GraduationCap className="h-4 w-4" />
                            {resource.institution}
                          </span>
                        )}
                        {resource.semester && (
                          <span className="flex items-center gap-2 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 shadow-xl">
                            <Calendar className="h-4 w-4" />
                            {resource.semester} {resource.year}
                          </span>
                        )}
                        {resource.audio_url && (
                          <span className="flex items-center gap-2 bg-indigo-500/90 backdrop-blur-xl px-4 py-2 rounded-full text-white border border-indigo-400/50 shadow-xl">
                            <Mic className="h-4 w-4" />
                            יש הנחיה קולית
                          </span>
                        )}
                      </motion.div>
                    </div>
                  </>
                ) : (
                  <div className="relative z-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }} />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative"
                    >
                      <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 mb-4 px-4 py-1.5 backdrop-blur-sm shadow-lg font-bold">
                        <GraduationCap className="h-4 w-4 ml-1" />
                        {resource.code}
                      </Badge>
                      <h1 className="text-4xl md:text-5xl font-black mb-3 text-white drop-shadow-lg">{resource.name}</h1>
                      <div className="flex flex-wrap gap-3 text-white/95 text-sm mt-4">
                        {resource.institution && (
                          <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                            <GraduationCap className="h-4 w-4" />
                            {resource.institution}
                          </span>
                        )}
                        {resource.semester && (
                          <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                            <Calendar className="h-4 w-4" />
                            {resource.semester} {resource.year}
                          </span>
                        )}
                        {resource.audio_url && (
                          <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-indigo-100 border border-indigo-200/20">
                            <Mic className="h-4 w-4" />
                            יש הנחיה קולית
                          </span>
                        )}
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>

              <div className="p-6 md:p-10 space-y-8">
                
                {resource.audio_url && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border-2 border-purple-200 shadow-lg"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white rounded-xl shadow-md">
                        <Headphones className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="font-black text-purple-900 text-lg">הנחיה קולית לקורס</span>
                    </div>
                    <AudioPlayer src={resource.audio_url} title="הנחיה קולית לקורס" />
                  </motion.div>
                )}

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {resource.day_of_week && (
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border-2 border-violet-200 shadow-lg hover:shadow-xl transition-all group">
                      <div className="p-3 bg-white rounded-xl shadow-md group-hover:scale-110 transition-transform">
                        <Clock className="h-8 w-8 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-violet-600 uppercase tracking-wider">זמני המפגשים</p>
                        <p className="font-black text-slate-900 text-lg">{resource.day_of_week}, {resource.start_time} - {resource.end_time}</p>
                      </div>
                    </div>
                  )}
                  
                  {resource.room && (
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border-2 border-pink-200 shadow-lg hover:shadow-xl transition-all group">
                      <div className="p-3 bg-white rounded-xl shadow-md group-hover:scale-110 transition-transform">
                        <File className="h-8 w-8 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-pink-600 uppercase tracking-wider">מיקום</p>
                        <p className="font-black text-slate-900 text-lg">{resource.room}</p>
                      </div>
                    </div>
                  )}
                  
                  {resource.start_date && (
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all group">
                      <div className="p-3 bg-white rounded-xl shadow-md group-hover:scale-110 transition-transform">
                        <Calendar className="h-8 w-8 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-amber-600 uppercase tracking-wider">תאריך התחלה</p>
                        <p className="font-black text-slate-900 text-lg">{resource.start_date}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-all group">
                    <div className="p-3 bg-white rounded-xl shadow-md group-hover:scale-110 transition-transform">
                      <Presentation className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider">היקף הקורס</p>
                      <p className="font-black text-slate-900 text-lg">{resource.total_hours} שעות ({resource.total_sessions} מפגשים)</p>
                    </div>
                  </div>
                </motion.div>

                {resource.announcements && resource.announcements.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Accordion type="single" collapsible className="w-full bg-white rounded-2xl border-2 border-orange-200 shadow-xl overflow-hidden">
                      <AccordionItem value="all-announcements" className="border-0">
                        <AccordionTrigger className="px-8 py-6 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all">
                          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-xl">
                              <Bell className="h-6 w-6 text-orange-600" />
                            </div>
                            הודעות חשובות ({resource.announcements.length})
                          </h3>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          <div className="space-y-4 pt-4">
                            {resource.announcements
                              .filter(a => !a.expiration_date || new Date(a.expiration_date) > new Date())
                              .sort((a, b) => {
                                if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
                                return new Date(b.created_date) - new Date(a.created_date);
                              })
                              .map((announcement, idx) => (
                                <motion.div 
                                  key={announcement.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.8 + idx * 0.1 }}
                                  className={announcement.is_pinned ? 'p-6 rounded-xl border-2 shadow-md bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300' : 'p-6 rounded-xl border-2 shadow-md bg-white border-slate-200'}
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {announcement.is_pinned && (
                                        <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md">
                                          נעוץ
                                        </Badge>
                                      )}
                                      <h4 className="font-black text-lg text-slate-900">{announcement.title}</h4>
                                    </div>
                                    <span className="text-sm text-slate-500 font-semibold whitespace-nowrap">
                                      {new Date(announcement.created_date).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}
                                    </span>
                                  </div>
                                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{announcement.content}</p>
                                </motion.div>
                              ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </motion.div>
                )}

                {resource.sessions && resource.sessions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-100 rounded-xl shadow-md">
                        <BookOpen className="h-6 w-6 text-indigo-600" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900">סילבוס ותוכנית לימודים</h3>
                    </div>
                    
                    <Accordion type="single" collapsible className="w-full bg-white rounded-2xl border-2 border-indigo-200 px-6 shadow-xl">
                      {resource.sessions.map((session) => (
                        <AccordionItem key={session.id} value={session.id} className="border-b-2 last:border-0 border-slate-100">
                          <AccordionTrigger className="hover:no-underline hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-xl px-4 py-4 -mx-4 transition-all">
                            <div className="flex items-center gap-4 text-right w-full">
                              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-lg shadow-lg">
                                {session.session_number}
                              </div>
                              <span className="font-bold text-lg text-slate-900 flex-1 text-right">{session.title}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4 px-4">
                            <div className="pr-16">
                              <div className="flex justify-end mb-4">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold"
                                  onClick={() => window.location.href = '?type=session&id=' + session.id}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  מעבר לדף מפגש מלא
                                </Button>
                              </div>
                              
                              {session.description && (
                                <p className="text-sm text-slate-700 mb-4 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-lg border-2 border-slate-100">
                                  {session.description}
                                </p>
                              )}
                              
                              {session.objectives && (
                                <div className="mb-4 flex items-start gap-3 text-sm bg-indigo-50 p-4 rounded-lg border-2 border-indigo-100">
                                  <Target className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-bold text-indigo-900 block mb-1">מטרות השיעור:</span>
                                    <span className="text-slate-700">{session.objectives}</span>
                                  </div>
                                </div>
                              )}

                              <div className="space-y-3 mt-4">
                                {resource.assignments?.filter(a => a.session_id === session.id).map(assignment => (
                                  <div 
                                    key={assignment.id} 
                                    className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer group" 
                                    onClick={() => window.location.href = '?type=assignment&id=' + assignment.id}
                                  >
                                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
                                      <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{assignment.title}</p>
                                      <div className="flex gap-2 text-xs text-slate-600 mt-1">
                                        <Badge variant="secondary" className="text-xs px-2 h-5 bg-indigo-100 text-indigo-700">
                                          {assignment.type === 'exam' ? 'מבחן' : assignment.type === 'quiz' ? 'בוחן' : 'מטלה'}
                                        </Badge>
                                        {assignment.due_date && <span className="font-semibold">הגשה: {assignment.due_date}</span>}
                                      </div>
                                    </div>
                                    <ChevronLeft className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                                  </div>
                                ))}

                                {resource.materials?.filter(m => m.session_id === session.id).map(material => {
                                  const materialTypeLabels = {
                                    presentation: 'מצגת',
                                    document: 'מסמך',
                                    video: 'וידאו',
                                    link: 'קישור',
                                    lexicon: 'לכסיקון',
                                    other: 'אחר'
                                  };
                                  
                                  return (
                                    <div 
                                      key={material.id} 
                                      className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-violet-200 hover:border-violet-400 hover:shadow-lg transition-all cursor-pointer group"
                                      onClick={() => window.location.href = '?type=material&id=' + material.id}
                                    >
                                      <div className="p-2 bg-violet-100 text-violet-600 rounded-lg group-hover:scale-110 transition-transform">
                                        {material.type === 'video' ? <Video className="w-5 h-5" /> : 
                                         material.type === 'presentation' ? <Presentation className="w-5 h-5" /> :
                                         material.type === 'link' ? <LinkIcon className="w-5 h-5" /> :
                                         <FileText className="w-5 h-5" />}
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-base font-bold text-slate-900 group-hover:text-violet-700 transition-colors">{material.title}</p>
                                        <p className="text-sm text-violet-600 font-semibold">{materialTypeLabels[material.type] || 'חומר לימוד'}</p>
                                      </div>
                                      <ChevronLeft className="w-5 h-5 text-violet-400 group-hover:text-violet-600 transition-colors" />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-violet-100 rounded-xl shadow-md">
                      <FileText className="h-6 w-6 text-violet-600" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">אודות הקורס</h3>
                  </div>
                  <div className="prose max-w-none text-slate-700 bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-2xl border-2 border-slate-200 shadow-lg leading-relaxed">
                    <p className="whitespace-pre-wrap text-lg">{resource.description || 'אין תיאור זמין'}</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="border-t-2 pt-8"
                >
                  {resource.allow_self_registration !== false && (
                    <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 rounded-2xl p-8 border-2 border-violet-300 mb-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-200/20 rounded-full blur-3xl -mr-32 -mt-32" />
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl -ml-24 -mb-24" />
                      
                      <div className="relative text-center space-y-6">
                        <div className="flex items-center justify-center gap-3 text-violet-700">
                          <div className="p-3 bg-white rounded-xl shadow-lg">
                            <UserPlus className="w-8 h-8" />
                          </div>
                          <h3 className="text-3xl font-black">מעוניין להצטרף לקורס?</h3>
                        </div>
                        <p className="text-lg text-slate-700 font-medium max-w-2xl mx-auto">
                          הרשם עכשיו וקבל גישה לכל החומרים, המטלות והתמיכה המקצועית
                        </p>
                        <Button 
                          size="lg" 
                          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-3xl transition-all px-10 py-7 text-xl font-black rounded-xl"
                          onClick={() => setRegistrationOpen(true)}
                        >
                          <UserPlus className="w-6 h-6 ml-3" />
                          הרשמה לקורס
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-slate-600 mb-6 text-center text-lg font-semibold">מעוניינים בפרטים נוספים?</p>
                  <div className="flex justify-center gap-4">
                    <Button 
                      variant="outline" 
                      className="border-2 border-violet-300 text-violet-700 hover:bg-violet-50 hover:border-violet-400 font-bold px-8 py-6 text-base shadow-md" 
                      onClick={() => window.location.href = 'mailto:' + (resource.billing_email || '')}
                    >
                      <Mail className="h-5 w-5 ml-2" />
                      צור קשר במייל
                    </Button>
                  </div>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <Card className="overflow-hidden shadow-lg border-0">
            <div className={
              resource.type === 'video' ? 'p-6 bg-gradient-to-br from-red-600 to-pink-600 text-white' :
              resource.type === 'presentation' ? 'p-6 bg-gradient-to-br from-orange-600 to-amber-600 text-white' :
              resource.type === 'link' ? 'p-6 bg-gradient-to-br from-blue-600 to-cyan-600 text-white' :
              'p-6 bg-gradient-to-br from-violet-600 to-purple-600 text-white'
            }>
              <div className="flex items-start gap-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-lg">
                  <Icon className="h-12 w-12 text-white" />
                </div>
                <div>
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 mb-2">חומר לימוד</Badge>
                  <h2 className="text-2xl font-bold" dir="rtl">{resource.title}</h2>
                  {resource.topic && <p className="text-white/80 mt-1">{resource.topic}</p>}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {resource.description && (
                <div className="prose max-w-none text-slate-600" dir="rtl">
                  <p className="whitespace-pre-wrap" dir="rtl">{resource.description}</p>
                </div>
              )}

              {resource.type === 'lexicon' && resource.generated_content?.key_concepts ? (
                  <div className="space-y-6">
                      <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                          <h3 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
                              <BookOpen className="w-6 h-6" />
                              לכסיקון מושגים
                          </h3>
                          <div className="grid gap-4 sm:grid-cols-2">
                              {resource.generated_content.key_concepts.map((concept, idx) => (
                                  <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-amber-200 hover:shadow-md transition-shadow">
                                      <h4 className="font-bold text-slate-800 mb-2">{concept.term}</h4>
                                      <p className="text-sm text-slate-600 leading-relaxed">{concept.definition}</p>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              ) : (
                  <MaterialContentRenderer resource={resource} />
              )}

              {resource.audio_url && resource.type !== 'presentation' && (
                  <div className="mb-6 animate-in slide-in-from-top-4 duration-500">
                      <AudioPlayer 
                          src={resource.audio_url} 
                          title={resource.audio_script ? "הנחיה קולית לחומר" : "דברי הסבר"} 
                      />
                      {resource.audio_script && (
                          <div className="mt-2 mr-2">
                              <details className="text-sm text-slate-500 cursor-pointer group">
                                  <summary className="list-none flex items-center gap-1 hover:text-indigo-600 transition-colors font-medium">
                                      <FileText className="w-3 h-3" />
                                      הצג תמליל
                                  </summary>
                                  <div className="mt-2 p-3 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-wrap text-xs border border-slate-100">
                                      {resource.audio_script}
                                  </div>
                              </details>
                          </div>
                      )}
                  </div>
              )}
            </div>
          </Card>
        )}

        <div className="text-center text-sm text-slate-400 flex items-center justify-center gap-2">
          <span>מוגש באמצעות</span>
          <a href="https://edu-manage.org/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center">
                  <GraduationCap className="h-3 w-3 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-violet-600 to-pink-600 text-transparent bg-clip-text">EduManage</span>
          </a>
        </div>
      </div>

      <StudentMotivator resource={resource} action={currentAction} />
      <SelfLearningWizard resource={resource} studentId={params.studentId} />

      {isCourse && (
        <CourseRegistrationDialog 
          course={resource} 
          open={registrationOpen} 
          onClose={() => setRegistrationOpen(false)} 
        />
      )}

      <StudentLoginDialog open={studentLoginOpen} onClose={() => setStudentLoginOpen(false)} />
    </div>
  );
}