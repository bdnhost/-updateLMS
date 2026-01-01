import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Dialog,
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Video,
  Link as LinkIcon,
  Presentation,
  File,
  Download,
  ExternalLink,
  X,
  Maximize2,
  Pencil,
  Book,
  Sparkles,
  Play,
  Eye,
  Calendar,
  Clock,
  Headphones
} from 'lucide-react';
import AudioPlayer from '@/components/common/AudioPlayer';
import { MaterialContent } from '@/components/common/MaterialContentRenderer';

const typeIcons = {
  presentation: Presentation,
  document: FileText,
  video: Video,
  link: LinkIcon,
  lexicon: Book,
  other: File
};

const typeLabels = {
  presentation: 'מצגת',
  document: 'מסמך',
  video: 'וידאו',
  link: 'קישור',
  other: 'אחר',
  lexicon: 'לקסיקון מושגים'
};

const typeGradients = {
  presentation: 'from-orange-500 to-amber-600',
  document: 'from-violet-500 to-purple-600',
  video: 'from-red-500 to-rose-600',
  link: 'from-blue-500 to-cyan-600',
  lexicon: 'from-amber-500 to-yellow-600',
  other: 'from-slate-500 to-gray-600'
};

const typeBgGradients = {
  presentation: 'from-orange-50 to-amber-50',
  document: 'from-violet-50 to-purple-50',
  video: 'from-red-50 to-rose-50',
  link: 'from-blue-50 to-cyan-50',
  lexicon: 'from-amber-50 to-yellow-50',
  other: 'from-slate-50 to-gray-50'
};

export default function MaterialViewDialog({ material, open, onClose, onEdit }) {
  if (!material) return null;

  const Icon = typeIcons[material.type] || File;
  const typeLabel = typeLabels[material.type] || 'אחר';
  const typeGradient = typeGradients[material.type] || typeGradients.other;
  const typeBgGradient = typeBgGradients[material.type] || typeBgGradients.other;

  const isVideo = material.type === 'video' || (material.file_url?.match(/\.(mp4|webm|ogg)$/i));
  const isImage = material.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isPDF = material.file_url?.match(/\.pdf$/i);
  const isYoutube = material.file_url?.match(/(youtube\.com|youtu\.be)/);

  const getEmbedUrl = (url) => {
    if (!url) return null;
    try {
      if (url.includes('youtube.com/watch?v=')) {
        return url.replace('watch?v=', 'embed/').split('&')[0];
      }
      if (url.includes('youtu.be/')) {
        return url.replace('youtu.be/', 'youtube.com/embed/').split('?')[0];
      }
    } catch (e) {
      return url;
    }
    return url;
  };

  const { data: relatedAssignments } = useQuery({
    queryKey: ['materialRelatedAssignments', material?.id],
    queryFn: async () => {
      if (!material?.id || !material?.course_id) return [];
      const assignments = await base44.entities.Assignment.filter({ course_id: material.course_id });
      return assignments.filter((a) => a.related_material_ids && a.related_material_ids.includes(material.id));
    },
    enabled: !!material?.id
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden border-0 shadow-2xl bg-white rounded-3xl">
        
        {/* Hero Header with Gradient */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={'relative overflow-hidden border-b-2 shadow-lg bg-gradient-to-r ' + typeBgGradient}
        >
          {/* Animated Background Orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }} />
          
          <div className="relative px-8 py-6 flex items-start justify-between">
            <div className="flex items-start gap-6 flex-1">
              {/* Icon with Gradient */}
              <motion.div 
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={'p-5 rounded-2xl shadow-2xl bg-gradient-to-br ' + typeGradient}
              >
                <Icon className="h-12 w-12 text-white" />
              </motion.div>
              
              <div className="flex-1">
                {/* Badges */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap items-center gap-2 mb-3"
                >
                  <Badge className={'bg-white/90 backdrop-blur-sm text-slate-700 border-2 shadow-md font-bold px-3 py-1 border-' + typeGradient.split(' ')[0].replace('from-', '')}>
                    <Sparkles className="h-3 w-3 ml-1" />
                    {typeLabel}
                  </Badge>
                  {material.week_number && (
                    <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-200 shadow-sm px-3 py-1 font-bold">
                      <Calendar className="h-3 w-3 ml-1" />
                      שבוע {material.week_number}
                    </Badge>
                  )}
                  {material.topic && (
                    <Badge className="bg-indigo-500 text-white border-0 shadow-md px-3 py-1 font-bold">
                      {material.topic}
                    </Badge>
                  )}
                </motion.div>
                
                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <DialogTitle className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-2 flex items-center gap-3">
                    {material.title}
                  </DialogTitle>
                </motion.div>
                
                {/* Description */}
                {material.description && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-slate-700 mt-2 text-base leading-relaxed max-w-3xl whitespace-pre-wrap font-medium" 
                    dir="rtl"
                  >
                    {material.description}
                  </motion.p>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onEdit} 
                  className="rounded-full hover:bg-white/80 text-slate-600 hover:text-indigo-600 shadow-md backdrop-blur-sm bg-white/50 h-10 w-10"
                >
                  <Pencil className="h-5 w-5" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose} 
                className="rounded-full hover:bg-white/80 text-slate-600 hover:text-red-600 shadow-md backdrop-blur-sm bg-white/50 h-10 w-10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Audio Player Section */}
        {material.audio_url && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full bg-gradient-to-r from-purple-50 to-indigo-50 border-b-2 border-purple-100 p-5 shadow-inner"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Headphones className="h-4 w-4 text-purple-600" />
              </div>
              <span className="font-bold text-purple-900 text-sm">קריינות מוקלטת</span>
            </div>
            <AudioPlayer src={material.audio_url} title="קריינות (Narration)" />
            {material.audio_script && (
              <details className="mt-3 text-sm text-slate-600 cursor-pointer bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-purple-100 shadow-sm">
                <summary className="font-bold hover:text-purple-700 transition-colors">📝 הצג תמליל מלא</summary>
                <p className="mt-3 p-3 bg-white border-2 border-purple-100 rounded-lg whitespace-pre-wrap leading-relaxed">
                  {material.audio_script}
                </p>
              </details>
            )}
          </motion.div>
        )}

        {/* Main Content Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex-1 overflow-hidden relative bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6"
        >
          {material.generated_content ? (
            <div className="w-full h-full overflow-y-auto bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-6 custom-scrollbar">
              <MaterialContent resource={material} />
            </div>
          ) : material.file_url ? (
            <div className="w-full h-full bg-white rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden relative flex flex-col">
              {isYoutube ? (
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 bg-black/5 pointer-events-none z-10 rounded-2xl" />
                  <iframe
                    src={getEmbedUrl(material.file_url)}
                    className="w-full h-full rounded-2xl"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={material.title}
                  />
                </div>
              ) : material.type === 'link' ? (
                <iframe
                  src={material.file_url}
                  className="w-full h-full"
                  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                  title={material.title}
                />
              ) : isVideo ? (
                <video 
                  src={material.file_url} 
                  controls 
                  className="w-full h-full object-contain bg-black rounded-2xl" 
                />
              ) : isImage ? (
                <img 
                  src={material.file_url} 
                  alt={material.title} 
                  className="w-full h-full object-contain bg-slate-50" 
                />
              ) : isPDF ? (
                <iframe 
                  src={material.file_url} 
                  className="w-full h-full" 
                  title={material.title} 
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gradient-to-b from-white to-slate-50">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-8 shadow-xl border-4 border-white"
                  >
                    <Icon className="h-16 w-16 text-slate-400" />
                  </motion.div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3">
                    קובץ {typeLabel}
                  </h3>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                    לא ניתן להציג תצוגה מקדימה עבור סוג קובץ זה.
                    ניתן לפתוח אותו בחלון חדש או להוריד אותו למכשיר.
                  </p>
                  <Button 
                    asChild 
                    size="lg" 
                    className="shadow-xl hover:shadow-2xl transition-all bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 px-8 py-6 text-base font-bold"
                  >
                    <a 
                      href={material.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3"
                    >
                      <ExternalLink className="h-5 w-5" />
                      פתח בחלון חדש
                    </a>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-400">
              <File className="h-24 w-24 mx-auto mb-6 opacity-20" />
              <p className="text-lg font-semibold">אין תוכן מצורף להצגה</p>
            </div>
          )}
        </motion.div>

        {/* Related Assignments */}
        {relatedAssignments && relatedAssignments.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border-t-2 border-indigo-200 p-6 shadow-inner"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white rounded-lg shadow-md">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-sm font-black text-indigo-900 uppercase tracking-wider">
                מטלות קשורות לחומר זה ({relatedAssignments.length})
              </p>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3 custom-scrollbar">
              {relatedAssignments.map((assignment, idx) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + idx * 0.1 }}
                >
                  <Link
                    to={createPageUrl('AssignmentProfile') + '?id=' + assignment.id}
                    onClick={onClose}
                    className="bg-white p-5 rounded-xl border-2 border-indigo-200 shadow-lg hover:shadow-2xl hover:border-indigo-400 hover:-translate-y-1 transition-all min-w-[240px] group block"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-base text-slate-900 group-hover:text-indigo-700 line-clamp-2 flex-1 transition-colors">
                        {assignment.title}
                      </span>
                      <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 shrink-0 ml-2 mt-0.5" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-3 h-3" />
                      <span className="font-semibold">
                        {assignment.due_date ? 'הגשה: ' + assignment.due_date : 'ללא תאריך הגשה'}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border-t-2 border-slate-200 p-6 flex justify-between items-center shadow-2xl"
        >
          <div className="text-sm text-slate-500 font-semibold px-3 flex items-center gap-2">
            {material.course_name && (
              <>
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>קורס: {material.course_name}</span>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 font-bold shadow-md"
            >
              סגור
            </Button>
            {material.file_url && (
              <Button 
                asChild 
                className="bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-900 hover:to-black shadow-xl hover:shadow-2xl transition-all border-0 font-bold"
              >
                <a 
                  href={material.file_url} 
                  download 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  {isYoutube || material.type === 'link' ? (
                    <>
                      <ExternalLink className="h-4 w-4" />
                      פתח קישור
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      הורדת קובץ
                    </>
                  )}
                </a>
              </Button>
            )}
          </div>
        </motion.div>

      </DialogContent>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
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
    </Dialog>
  );
}