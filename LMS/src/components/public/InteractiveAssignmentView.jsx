import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { 
  Calendar, Clock, Trophy, RotateCw, Download, ExternalLink, 
  ChevronLeft, ChevronRight, FileText, Youtube, PlayCircle, 
  Lightbulb, BookOpen, Link as LinkIcon, Send, CheckCircle2,
  Loader2, User, FileUp, ClipboardList, PenTool, Mic, Video, 
  Presentation, Sparkles, Zap, Target, Award
} from 'lucide-react';
import AudioPlayer from '@/components/common/AudioPlayer';
import ExamView from './views/ExamView';
import ProjectView from './views/ProjectView';
import ProjectSummaryView from './views/ProjectSummaryView';
import AssignmentRoadmap from '@/components/assignments/AssignmentRoadmap';

export default function InteractiveAssignmentView({ resource, onAction, studentId }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [submissionMode, setSubmissionMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionData, setSubmissionData] = useState({
      fullName: '',
      idNumber: '',
      content: '',
      markedConcepts: []
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [isFileUploading, setIsFileUploading] = useState(false);

  const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setIsFileUploading(true);
      try {
          const res = await base44.integrations.Core.UploadFile({ file });
          setUploadedFileUrl(res.file_url);
          toast.success('הקובץ הועלה בהצלחה');
      } catch (error) {
          console.error(error);
          toast.error('שגיאה בהעלאת הקובץ');
      } finally {
          setIsFileUploading(false);
      }
  };

  const handleSubmit = async (data = null) => {
      const isEvent = data && typeof data.preventDefault === 'function';
      if (isEvent) data.preventDefault();

      if (!submissionData.fullName || !submissionData.idNumber) {
          toast.error('נא למלא שם מלא ותעודת זהות');
          return;
      }

      const safeSubmissionData = isEvent ? {} : data;

      setIsSubmitting(true);
      try {
          const payload = {
              assignment_id: resource.id,
              id_number: submissionData.idNumber,
              full_name: submissionData.fullName,
              content: safeSubmissionData?.content || submissionData.content || (safeSubmissionData?.answers ? JSON.stringify(safeSubmissionData.answers) : ''),
              file_url: safeSubmissionData?.file_url || uploadedFileUrl,
              marked_concepts: submissionData.markedConcepts,
              submission_data: {
                  ...safeSubmissionData,
                  project_step_index: safeSubmissionData?.current_milestone_index,
                  is_project_submission: resource.type === 'project'
              }
          };

          const response = await base44.functions.invoke('submitPublicAssignment', payload);

          if (response.data?.success) {
              if (resource.type === 'project' && safeSubmissionData?.is_final_submission === false) {
                  toast.success('שלב הוגש בהצלחה! מתקדם לשלב הבא...');
              } else {
                  setIsSubmitted(true);
                  toast.success('המטלה הוגשה בהצלחה!');
                  if (onAction) onAction('submitted');
              }
          } else {
              toast.error('שגיאה בהגשת המטלה: ' + (response.data?.error || 'נסה שוב מאוחר יותר'));
          }
      } catch (error) {
          console.error(error);
          toast.error('שגיאת תקשורת');
      } finally {
          setIsSubmitting(false);
      }
  };

  const toggleConceptMark = (concept) => {
      setSubmissionData(prev => {
          const exists = prev.markedConcepts.includes(concept);
          return {
              ...prev,
              markedConcepts: exists 
                  ? prev.markedConcepts.filter(c => c !== concept)
                  : [...prev.markedConcepts, concept]
          };
      });
  };

  const youtubeData = useMemo(() => {
    const url = resource.video_url || resource.description || '';
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = (url || '').match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }, [resource.video_url, resource.description]);

  const content = useMemo(() => {
    let concepts = resource.key_concepts || [];
    let links = resource.resource_links || [];
    let introText = resource.description || '';

    if (concepts.length === 0 && links.length === 0 && introText) {
       if (youtubeData && !resource.video_url) {
          introText = introText.replace(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)[^\s]+/g, '');
       }

       const parsedConcepts = introText
         .split(/\n-|\n•|\n\*/)
         .map(s => s.trim())
         .filter(s => s.length > 0 && s.length < 200)
         .map(s => ({ term: s, definition: '' }));

       if (parsedConcepts.length > 1) {
          concepts = parsedConcepts;
          const splitIndex = introText.search(/\n-|\n•|\n\*/);
          if (splitIndex > -1) {
             introText = introText.substring(0, splitIndex);
          }
       }
       
       const urlRegex = /(https?:\/\/[^\s]+)/g;
       const parsedLinks = ((introText || '').match(urlRegex) || []).filter(url => !url.includes('youtube') && !url.includes('youtu.be'));
       if (parsedLinks.length > 0) links = parsedLinks;
    }

    const normalizedConcepts = concepts.map(c => 
        typeof c === 'string' ? { term: c, definition: '' } : c
    );

    return {
        intro: introText.trim(),
        concepts: normalizedConcepts,
        links: links
    };
  }, [resource, youtubeData]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'exam': return 'from-red-500 via-rose-500 to-pink-600';
      case 'quiz': return 'from-purple-500 via-violet-500 to-indigo-600';
      case 'project': return 'from-emerald-500 via-teal-500 to-cyan-600';
      default: return 'from-blue-500 via-indigo-500 to-purple-600';
    }
  };

  const bgGradient = getTypeColor(resource.type);
  const isExternalAssignment = resource.file_url && (resource.file_url.startsWith('http') || resource.type === 'link');

  const heroClassName = 'relative h-auto min-h-[250px] md:min-h-[300px] p-6 md:p-10 flex flex-col justify-between overflow-hidden shrink-0 ' + (resource.media_url ? 'bg-slate-900' : 'bg-gradient-to-br ' + bgGradient);
  const ctaClassName = 'relative overflow-hidden group px-12 py-8 rounded-full bg-gradient-to-r ' + bgGradient + ' shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-110 border-4 border-white/30';
  const mobileCtaClassName = 'w-full h-14 text-lg font-black shadow-xl bg-gradient-to-r ' + bgGradient + ' animate-pulse';

  return (
  <div dir="rtl">
  <div className="perspective-1000 w-full max-w-5xl mx-auto min-h-[600px] mb-24 md:mb-8">
      <motion.div
        className="relative w-full h-full preserve-3d transition-all duration-500"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* FRONT */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
        <Card className="w-full min-h-[600px] flex flex-col shadow-2xl border-0 bg-white rounded-3xl">
          <div className={heroClassName}>
            {resource.media_url ? (
                <>
                    <div className="absolute inset-0">
                        <img src={resource.media_url} alt={resource.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
                </>
            ) : (
                <>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }} />
                </>
            )}
            
            <div className="flex justify-between items-start relative z-10 text-right">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-white/25 backdrop-blur-md text-white border-0 hover:bg-white/35 text-base md:text-lg py-1.5 px-4 shadow-lg">
                  <Sparkles className="h-4 w-4 ml-1.5" />
                  {resource.type === 'exam' ? 'מבחן' : 
                   resource.type === 'quiz' ? 'בוחן' : 
                   resource.type === 'project' ? 'פרויקט' : 'מטלה'}
                </Badge>
                {resource.max_score && (
                  <Badge className="bg-amber-500/90 backdrop-blur-md text-white border-0 hover:bg-amber-600/90 shadow-lg flex items-center gap-1.5 px-3 py-1.5">
                    <Trophy className="w-4 h-4" />
                    {resource.max_score} נק'
                  </Badge>
                )}
              </div>
              
              {resource.course_logo_url && (
                  <div className="relative group">
                      <div className="absolute -inset-1 bg-white/30 rounded-2xl blur opacity-75 group-hover:opacity-100 transition" />
                      <div className="relative h-12 w-12 md:h-14 md:w-14 bg-white/95 backdrop-blur rounded-2xl p-2 shadow-xl">
                          <img src={resource.course_logo_url} alt="Course Logo" className="w-full h-full object-contain" onError={(e) => e.target.parentElement.style.display = 'none'} />
                      </div>
                  </div>
              )}
            </div>
            
            <div className="relative z-10 text-right mt-auto">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight drop-shadow-2xl">
                    {resource.title}
                </h1>
                {content.intro && (
                    <p className="text-white/90 line-clamp-2 text-sm md:text-lg leading-relaxed max-w-3xl">
                        {content.intro}
                    </p>
                )}
            </div>
          </div>

          <div className="flex-1 p-4 md:p-8 flex flex-col gap-4 md:gap-6 bg-gradient-to-br from-slate-50 via-purple-50/30 to-cyan-50/30 pb-20">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 border-2 border-white shadow-lg"
              >
                  <AssignmentRoadmap 
                      status={isSubmitted ? 'submitted' : resource.status === 'closed' ? 'submitted' : 'open'} 
                      grade={resource.student_grade} 
                  />
              </motion.div>

            {resource.description && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border-2 border-slate-200 shadow-lg"
              >
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg">
                          <FileText className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800">תיאור והנחיות</h3>
                  </div>
                  <div 
                    className="text-slate-700 leading-relaxed prose prose-slate max-w-none [&>*]:text-right"
                    dir="rtl"
                    dangerouslySetInnerHTML={{ __html: resource.description || '' }}
                  />
              </motion.div>
            )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="group bg-gradient-to-br from-white to-indigo-50 p-4 md:p-5 rounded-2xl border-2 border-indigo-100 shadow-md hover:shadow-xl transition-all hover:scale-105 hover:border-indigo-300"
            >
              <div className="flex items-center gap-4 text-right">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">תאריך הגשה</div>
                  <div className="font-black text-slate-800 text-lg md:text-xl">{resource.due_date}</div>
                </div>
              </div>
            </motion.div>
              
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="group bg-gradient-to-br from-white to-emerald-50 p-4 md:p-5 rounded-2xl border-2 border-emerald-100 shadow-md hover:shadow-xl transition-all hover:scale-105 hover:border-emerald-300"
            >
              <div className="flex items-center gap-4 text-right">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">סטטוס</div>
                  <div className="font-black text-slate-800 text-lg md:text-xl">
                    {resource.status === 'closed' ? 'סגור' : 'פתוח'}
                  </div>
                </div>
              </div>
            </motion.div>

            {resource.session && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="group bg-gradient-to-br from-white to-blue-50 p-4 md:p-5 rounded-2xl border-2 border-blue-100 shadow-md hover:shadow-xl transition-all hover:scale-105 hover:border-blue-300"
              >
                <div className="flex items-center gap-4 text-right">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform shrink-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">מפגש לימוד</div>
                    <div className="font-bold text-slate-800 text-sm md:text-base truncate">{resource.session.title}</div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="group bg-gradient-to-br from-white to-purple-50 p-4 md:p-5 rounded-2xl border-2 border-purple-100 shadow-md hover:shadow-xl transition-all hover:scale-105 hover:border-purple-300"
            >
              <div className="flex items-center gap-4 text-right">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-1">משקל בציון</div>
                  <div className="font-black text-slate-800 text-lg md:text-xl">{resource.weight || 0}%</div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mt-2"
          >
              {youtubeData && (
                  <Badge className="px-4 py-2 gap-2 text-red-600 bg-red-50 hover:bg-red-100 border-2 border-red-200 shadow-sm hover:shadow-md transition-all">
                      <Youtube className="w-4 h-4" />
                      וידאו מצורף
                  </Badge>
              )}
              {content.concepts.length > 0 && (
                  <Badge className="px-4 py-2 gap-2 text-amber-600 bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 shadow-sm hover:shadow-md transition-all">
                      <Lightbulb className="w-4 h-4" />
                      {content.concepts.length} מושגי מפתח
                  </Badge>
              )}
              {resource.related_materials && resource.related_materials.length > 0 && (
                  <Badge className="px-4 py-2 gap-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 shadow-sm hover:shadow-md transition-all">
                      <BookOpen className="w-4 h-4" />
                      {resource.related_materials.length} חומרי עזר
                  </Badge>
              )}
          </motion.div>

          <div className="hidden md:block sticky bottom-0 bg-white/95 backdrop-blur-xl p-8 border-t-2 border-slate-100 mt-auto shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.15)] rounded-t-3xl -mx-4 -mb-4 md:-mx-8 md:-mb-8 z-20">
              <div className="flex justify-center">
                  <Button 
                      onClick={() => {
                          setIsFlipped(true);
                          if (onAction) onAction('flipped_card');
                      }}
                      className={ctaClassName}
                  >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                      <div className="relative flex items-center gap-4 text-xl md:text-2xl font-black text-white tracking-wide">
                          <Zap className="h-7 w-7 animate-pulse" />
                          <span>כניסה ל{resource.type === 'exam' ? 'מבחן' : 'מטלה'}</span>
                          <div className="bg-white/25 rounded-full p-2 backdrop-blur-sm group-hover:rotate-180 transition-transform duration-700">
                              <RotateCw className="h-7 w-7" />
                          </div>
                      </div>
                  </Button>
              </div>
              <p className="text-center text-slate-500 text-sm mt-5 font-semibold tracking-wide">
                  <Target className="inline h-4 w-4 ml-1 text-indigo-500" />
                  לחץ לפרטים מלאים, צפייה בתוכן והגשה
              </p>
          </div>
          </div>
        </Card>
        </div>

        {/* BACK */}
        <div 
            className="absolute inset-0 w-full h-full"
            style={{ 
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
        >
            <Card className="w-full min-h-[600px] flex flex-col shadow-2xl border-0 bg-white rounded-3xl">
                 <div className="bg-gradient-to-r from-white via-indigo-50 to-purple-50 p-3 md:p-5 border-b-2 border-indigo-100 flex justify-between items-center sticky top-0 z-20 shadow-md backdrop-blur-sm">
                <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm md:text-lg text-right">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg">
                        <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <span className="hidden md:inline">מרחב למידה:</span>
                    <span className="font-black truncate max-w-[200px] md:max-w-none">{resource.title}</span>
                </h3>
                <div className="flex gap-2">
                    {!submissionMode && !isSubmitted && !isExternalAssignment && (
                        <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => {
                                setSubmissionMode(true);
                                if (onAction) onAction('started_submission');
                            }} 
                            className="hidden md:inline-flex bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all animate-pulse"
                        >
                            <Send className="ml-2 h-4 w-4" />
                            <span>הגשת {resource.type === 'exam' ? 'מבחן' : 'מטלה'}</span>
                        </Button>
                    )}
                    {submissionMode && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSubmissionMode(false)} 
                            className="text-slate-500 hover:bg-slate-100"
                        >
                            חזרה לתוכן
                        </Button>
                    )}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsFlipped(false)} 
                        className="hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                    >
                        <RotateCw className="ml-2 h-4 w-4" />
                        חזרה
                    </Button>
                </div>
             </div>

             <div className="flex-1 bg-gradient-to-br from-slate-50 via-purple-50/20 to-cyan-50/20 pb-20">
                
                {isSubmitted ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-700">
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          className="relative"
                        >
                            <div className="absolute inset-0 bg-green-400 rounded-full blur-3xl opacity-30 animate-pulse" />
                            <div className="relative w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-8 shadow-2xl">
                                <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={3} />
                            </div>
                        </motion.div>
                        <h2 className="text-4xl font-black text-slate-800 mb-3">הוגש בהצלחה!</h2>
                        <p className="text-slate-600 text-lg max-w-md mb-2">
                            תודה <span className="font-bold text-indigo-600">{submissionData.fullName}</span>
                        </p>
                        <p className="text-slate-500">הפרטים נקלטו במערכת ✨</p>
                        <div className="flex gap-3 mt-10">
                            <Button 
                                variant="outline" 
                                size="lg"
                                onClick={() => {
                                    setIsSubmitted(false);
                                    setSubmissionMode(false);
                                    setSubmissionData({ fullName: '', idNumber: '', content: '', markedConcepts: [] });
                                }}
                                className="border-2 hover:bg-slate-50"
                            >
                                חזרה לתוכן
                            </Button>
                            <Button 
                                size="lg"
                                onClick={() => {
                                    setIsSubmitted(false);
                                    setSubmissionMode(false);
                                    setSubmissionData({ fullName: '', idNumber: '', content: '', markedConcepts: [] });
                                    setIsFlipped(false);
                                }}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                            >
                                סיום ויציאה
                            </Button>
                        </div>
                    </div>
                ) : submissionMode ? (
                    <div className="p-6 md:p-8 max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500" dir="rtl">
                        <div className="text-center mb-8 text-right">
                            <h2 className="text-3xl font-black text-slate-800 flex items-center justify-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
                                    <Send className="w-6 h-6" />
                                </div>
                                הגשת {resource.type === 'exam' ? 'מבחן' : resource.type === 'project' ? 'פרויקט' : 'מטלה'}
                            </h2>
                            <p className="text-slate-500 mt-3 text-lg">הזדהה והשלם את ההגשה</p>
                        </div>

                        <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-2xl border-2 border-indigo-100 shadow-lg space-y-4 mb-6">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2 border-b-2 border-indigo-100 pb-3 text-right">
                                <User className="w-5 h-5 text-indigo-600" />
                                פרטי מגיש
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-right block font-semibold">שם מלא *</Label>
                                    <Input 
                                        id="fullName" 
                                        value={submissionData.fullName}
                                        onChange={(e) => setSubmissionData({...submissionData, fullName: e.target.value})}
                                        placeholder="ישראל ישראלי"
                                        required
                                        className="bg-white border-2 border-slate-200 focus:border-indigo-400 text-right"
                                        dir="rtl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="idNumber" className="text-right block font-semibold">תעודת זהות *</Label>
                                    <Input 
                                        id="idNumber" 
                                        value={submissionData.idNumber}
                                        onChange={(e) => setSubmissionData({...submissionData, idNumber: e.target.value})}
                                        placeholder="000000000"
                                        required
                                        className="bg-white border-2 border-slate-200 focus:border-indigo-400 text-right"
                                        dir="rtl"
                                    />
                                </div>
                            </div>
                        </div>

                        {(resource.type === 'exam' || resource.type === 'quiz') ? (
                            <ExamView 
                                resource={resource} 
                                contentData={resource.content_data}
                                onSubmit={handleSubmit}
                                isSubmitted={isSubmitting}
                            />
                        ) : resource.type === 'project' ? (
                            <ProjectView
                                resource={resource}
                                contentData={resource.content_data}
                                onSubmit={handleSubmit}
                                isSubmitting={isSubmitting}
                            />
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
                                <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border-2 border-slate-200 shadow-lg space-y-4">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2 border-b-2 border-slate-200 pb-3 text-right">
                                        <FileText className="w-5 h-5 text-indigo-600" />
                                        תוכן ההגשה
                                    </h3>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="content" className="text-right block font-semibold">תשובה / הערות</Label>
                                        <Textarea 
                                            id="content" 
                                            value={submissionData.content}
                                            onChange={(e) => setSubmissionData({...submissionData, content: e.target.value})}
                                            placeholder="כתוב כאן את תשובתך או הערות למרצה..."
                                            className="min-h-[150px] bg-white border-2 border-slate-200 focus:border-indigo-400 placeholder:text-slate-400 text-right"
                                            dir="rtl"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-right block font-semibold">צרף קובץ (אופציונלי)</Label>
                                        <div className="flex items-center gap-2">
                                            <Input 
                                                type="file" 
                                                onChange={handleFileUpload}
                                                disabled={isFileUploading}
                                                className="bg-white border-2 border-slate-200 cursor-pointer"
                                            />
                                            {isFileUploading && <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />}
                                        </div>
                                        {uploadedFileUrl && (
                                            <div className="text-sm text-green-600 flex items-center gap-2 bg-green-50 p-2 rounded-lg border border-green-200">
                                                <CheckCircle2 className="w-4 h-4" />
                                                קובץ מצורף מוכן לשליחה
                                            </div>
                                        )}
                                    </div>

                                    {content.concepts.length > 0 && (
                                        <div className="space-y-3 pt-4">
                                            <Label className="text-base font-bold text-right block">אישור מושגים נלמדים</Label>
                                            <p className="text-sm text-slate-500 text-right">סמן את המושגים שהבנת / השתמשת בהם במטלה:</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {content.concepts.map((conceptObj, idx) => {
                                                    const term = conceptObj.term || conceptObj;
                                                    return (
                                                        <div key={idx} className="flex items-start gap-3 p-4 rounded-xl border-2 border-slate-100 hover:bg-indigo-50 hover:border-indigo-200 transition-all">
                                                            <Checkbox 
                                                                checked={submissionData.markedConcepts.includes(term)}
                                                                onCheckedChange={() => toggleConceptMark(term)}
                                                                id={'concept-' + idx}
                                                                className="mt-1"
                                                            />
                                                            <label htmlFor={'concept-' + idx} className="text-sm cursor-pointer leading-tight select-none flex-1 text-right">
                                                                <span className="font-bold block text-slate-800">{term}</span>
                                                                {conceptObj.definition && <span className="text-xs text-slate-500 block mt-1.5 leading-relaxed">{conceptObj.definition}</span>}
                                                            </label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Button 
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }}
                                    className="hidden md:flex w-full h-14 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl items-center justify-center transition-all"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="ml-2 h-6 w-6 animate-spin" />
                                            שולח...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="ml-2 h-6 w-6" />
                                            שלח להגשה
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </div>
                ) : (
                    /* Content View */
                    <div className="p-4 md:p-6 space-y-6 md:space-y-8 text-right" dir="rtl">
                        
                        {resource.audio_url && (
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                              className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-200 shadow-lg"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg">
                                        <Mic className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800">הדרכה קולית</h3>
                                </div>
                                <AudioPlayer src={resource.audio_url} />
                                {resource.audio_transcript && (
                                    <details className="mt-4 cursor-pointer group">
                                        <summary className="font-semibold text-indigo-600 hover:text-indigo-700 transition select-none">
                                            תמלול הקלטה ↓
                                        </summary>
                                        <div className="mt-3 p-4 bg-white/80 rounded-lg border-2 border-indigo-100 text-slate-600 leading-relaxed">
                                            {resource.audio_transcript}
                                        </div>
                                    </details>
                                )}
                            </motion.div>
                        )}

                        {isExternalAssignment && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.15 }}
                              className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-3xl border-2 border-blue-200 shadow-xl text-center"
                            >
                                <div className="flex justify-center mb-6">
                                    <div className="p-5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl text-white shadow-2xl animate-bounce">
                                        <ExternalLink className="w-12 h-12" />
                                    </div>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-4">מטלה חיצונית</h3>
                                <p className="text-slate-600 mb-6 leading-relaxed max-w-md mx-auto">
                                    המטלה מתבצעת במערכת חיצונית. לחץ על הכפתור כדי לעבור לביצוע המשימה, ואז חזור כאן לאישור ההגשה.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        size="lg"
                                        onClick={() => {
                                            const base44StudentId = studentId ? btoa(studentId) : '';
                                            const base44AssignmentId = btoa(String(resource.id));
                                            const separator = resource.file_url.includes('?') ? '&' : '?';
                                            const finalUrl = resource.file_url + separator + 'base44StudentId=' + base44StudentId + '&base44AssignmentId=' + base44AssignmentId;
                                            window.open(finalUrl, '_blank');
                                            if (onAction) onAction('opened_external_link');
                                        }}
                                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-xl hover:shadow-2xl text-lg font-bold h-14"
                                    >
                                        <ExternalLink className="ml-2 h-6 w-6" />
                                        פתח מטלה חיצונית
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => {
                                            setSubmissionMode(true);
                                            if (onAction) onAction('confirming_external_completion');
                                        }}
                                        className="border-2 border-blue-300 hover:bg-blue-50 text-blue-700 font-bold h-14"
                                    >
                                        <CheckCircle2 className="ml-2 h-5 w-5" />
                                        סיימתי - אישור הגשה
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {youtubeData && (
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="rounded-2xl overflow-hidden border-4 border-red-200 shadow-2xl"
                            >
                                <div className="aspect-video w-full">
                                    <iframe
                                        src={'https://www.youtube.com/embed/' + youtubeData}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full"
                                        title="YouTube Video"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {content.concepts.length > 0 && (
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.25 }}
                              className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 md:p-8 rounded-2xl border-2 border-amber-200 shadow-lg"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl text-white shadow-lg">
                                        <Lightbulb className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800">מושגי מפתח</h3>
                                </div>
                                
                                <div className="relative preserve-3d">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeTab}
                                            initial={{ rotateY: 90, opacity: 0 }}
                                            animate={{ rotateY: 0, opacity: 1 }}
                                            exit={{ rotateY: -90, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="bg-white rounded-2xl shadow-xl border-2 border-amber-200 min-h-[250px] p-8 flex items-center justify-center cursor-pointer hover:shadow-2xl transition-shadow"
                                            onClick={() => {
                                                const card = document.getElementById('flashcard-' + activeTab);
                                                if (card) card.classList.toggle('rotate-y-180');
                                            }}
                                        >
                                            <div id={'flashcard-' + activeTab} className="w-full preserve-3d transition-transform duration-500">
                                                <div className="backface-hidden">
                                                    <div className="text-center">
                                                        <div className="inline-block px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full text-sm font-bold mb-6 shadow-lg">
                                                            מושג #{activeTab + 1}
                                                        </div>
                                                        <h4 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
                                                            {content.concepts[activeTab].term}
                                                        </h4>
                                                        {content.concepts[activeTab].definition && (
                                                            <p className="text-slate-400 mt-6 text-sm">לחץ להיפוך הכרטיס</p>
                                                        )}
                                                    </div>
                                                </div>
                                                {content.concepts[activeTab].definition && (
                                                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 flex items-center justify-center text-white">
                                                        <div className="text-center">
                                                            <div className="text-lg md:text-xl leading-relaxed">
                                                                {content.concepts[activeTab].definition}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                <div className="flex justify-between items-center mt-6">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
                                        disabled={activeTab === 0}
                                        className="border-2 border-amber-300 hover:bg-amber-50 disabled:opacity-30"
                                    >
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                        הקודם
                                    </Button>
                                    
                                    <div className="flex gap-2">
                                        {content.concepts.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveTab(idx)}
                                                className={'w-2.5 h-2.5 rounded-full transition-all ' + (idx === activeTab ? 'bg-amber-500 w-8' : 'bg-amber-200 hover:bg-amber-300')}
                                            />
                                        ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setActiveTab(Math.min(content.concepts.length - 1, activeTab + 1))}
                                        disabled={activeTab === content.concepts.length - 1}
                                        className="border-2 border-amber-300 hover:bg-amber-50 disabled:opacity-30"
                                    >
                                        הבא
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {resource.related_materials && resource.related_materials.length > 0 && (
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 md:p-8 rounded-2xl border-2 border-indigo-200 shadow-lg"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800">חומרי עזר</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {resource.related_materials.map((material, idx) => {
                                        const typeColors = {
                                            video: 'from-red-500 to-pink-600',
                                            presentation: 'from-orange-500 to-amber-600',
                                            document: 'from-indigo-500 to-purple-600',
                                            default: 'from-blue-500 to-cyan-600'
                                        };
                                        const typeIcons = {
                                            video: Video,
                                            presentation: Presentation,
                                            document: FileText,
                                            default: FileText
                                        };
                                        const gradient = typeColors[material.type] || typeColors.default;
                                        const IconComponent = typeIcons[material.type] || typeIcons.default;

                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => window.location.href = '/PublicView?type=material&id=' + material.id + (studentId ? '&student_id=' + studentId : '')}
                                                className="group bg-white p-5 rounded-xl border-2 border-slate-200 hover:border-indigo-300 shadow-md hover:shadow-xl transition-all cursor-pointer hover:scale-105"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={'p-3 bg-gradient-to-br rounded-lg text-white shadow-lg group-hover:scale-110 transition-transform shrink-0 ' + gradient}>
                                                        <IconComponent className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 text-right">
                                                        <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition truncate">
                                                            {material.title}
                                                        </h4>
                                                        {material.description && (
                                                            <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                                                                {material.description}
                                                            </p>
                                                        )}
                                                        <div className="mt-2">
                                                            <Badge className="text-xs bg-slate-100 text-slate-600 border-slate-200">
                                                                {material.type === 'video' ? 'וידאו' : 
                                                                 material.type === 'presentation' ? 'מצגת' : 
                                                                 material.type === 'document' ? 'מסמך' : 'קובץ'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {resource.type === 'project' && resource.content_data && (
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.35 }}
                            >
                                <ProjectSummaryView contentData={resource.content_data} />
                            </motion.div>
                        )}

                        {(resource.type === 'exam' || resource.type === 'quiz') && resource.content_data && resource.content_data.questions && (
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.35 }}
                              className="bg-gradient-to-br from-rose-50 to-pink-50 p-6 md:p-8 rounded-2xl border-2 border-rose-200 shadow-lg"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl text-white shadow-lg">
                                        <ClipboardList className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800">
                                        {resource.type === 'exam' ? 'שאלות המבחן' : 'שאלות הבוחן'}
                                    </h3>
                                </div>
                                
                                <div className="space-y-3">
                                    {resource.content_data.questions.map((q, idx) => (
                                        <div key={idx} className="bg-white p-5 rounded-xl border-2 border-rose-100 shadow-md">
                                            <div className="flex items-start gap-3 text-right">
                                                <div className="shrink-0 w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-slate-800 leading-relaxed">{q.question_text}</p>
                                                    {q.question_type === 'multiple_choice' && q.options && (
                                                        <div className="mt-3 space-y-2">
                                                            {q.options.map((opt, optIdx) => (
                                                                <div key={optIdx} className="text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                                                    {String.fromCharCode(65 + optIdx)}. {opt}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {content.links.length > 0 && (
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                              className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 md:p-8 rounded-2xl border-2 border-cyan-200 shadow-lg"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl text-white shadow-lg">
                                        <LinkIcon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800">קישורים רלוונטיים</h3>
                                </div>
                                
                                <div className="space-y-3">
                                    {content.links.map((link, idx) => (
                                        <a
                                            key={idx}
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group block bg-white p-4 rounded-xl border-2 border-cyan-100 hover:border-cyan-300 shadow-md hover:shadow-xl transition-all"
                                        >
                                            <div className="flex items-center gap-3 text-right">
                                                <ExternalLink className="w-5 h-5 text-cyan-600 group-hover:text-cyan-700 shrink-0" />
                                                <span className="text-cyan-600 group-hover:text-cyan-700 font-semibold break-all flex-1">
                                                    {link}
                                                </span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
             </div>
            </Card>
        </div>
      </motion.div>
    </div>

    <div className="md:hidden fixed bottom-[70px] left-0 right-0 p-4 bg-white/98 backdrop-blur-xl border-t-2 border-slate-200 z-30 flex gap-3 shadow-[0_-8px_16px_-1px_rgba(0,0,0,0.2)]">
            {!isFlipped ? (
                <Button className={mobileCtaClassName} onClick={() => { setIsFlipped(true); if(onAction) onAction('flipped_card'); }}>
                <Zap className="ml-2 h-6 w-6" />
                כניסה ל{resource.type === 'exam' ? 'מבחן' : 'מטלה'}
                <RotateCw className="mr-2 h-6 w-6" />
                </Button>
            ) : isSubmitted ? (
                <Button className="w-full h-14 font-bold bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl" onClick={() => { setIsSubmitted(false); setSubmissionMode(false); setIsFlipped(false); }}>
                <CheckCircle2 className="ml-2 h-5 w-5" />
                סיום ויציאה
                </Button>
            ) : submissionMode ? (
                <Button 
                    type="button"
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl" 
                    onClick={(e) => {
                        e.preventDefault();
                        handleSubmit(e);
                    }} 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <Loader2 className="animate-spin ml-2" /> : <Send className="ml-2" />}
                    שלח להגשה
                </Button>
            ) : !isExternalAssignment && (
                <Button className="w-full h-14 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl animate-pulse" onClick={() => { setSubmissionMode(true); if(onAction) onAction('started_submission'); }}>
                <Send className="ml-2 h-5 w-5" />
                הגש עכשיו
                </Button>
            )}
    </div>

    <style>{`
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backfaceVisibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .perspective-1000 { perspective: 1000px; }
        
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #6366f1, #8b5cf6);
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #4f46e5, #7c3aed);
        }
    `}</style>
    </div>
  );
}