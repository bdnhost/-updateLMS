import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Clock,
  MapPin,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  MessageSquare,
  Eye,
  MessageCircle,
  Share2,
  Globe } from
'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger } from
"@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';

const courseColors = [
'from-violet-600 via-purple-600 to-fuchsia-600',
'from-blue-600 via-cyan-600 to-teal-600',
'from-pink-600 via-rose-600 to-red-600',
'from-orange-600 via-amber-600 to-yellow-600',
'from-emerald-600 via-green-600 to-lime-600',
'from-indigo-600 via-blue-600 to-sky-600'];


export default function CourseCard({ course, studentsCount, onEdit, onDelete, onArchive, onSendSMS, onTogglePublic, index }) {
  const colorClass = course.color || courseColors[index % courseColors.length];

  return (
    <Card
      className="overflow-hidden border-2 border-transparent hover:border-purple-200 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group bg-white/90 backdrop-blur-sm cursor-pointer"
      onClick={(e) => {
        // Prevent navigation if clicking dropdown trigger
        if (e.target.closest('button')) return;
        window.location.href = createPageUrl('CourseProfile') + `?id=${course.id}`;
      }}>

      <div className={`h-24 bg-gradient-to-r ${colorClass} relative shadow-lg`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-3 left-4">
          <Badge className="bg-white/20 text-white border-0">
            {course.code}
          </Badge>
        </div>
        {course.logo_url &&
        <div className="absolute top-2 right-2 h-16 w-16 bg-white rounded-lg shadow-md flex items-center justify-center p-1">
                <img src={course.logo_url} alt="Logo" className="w-full h-full object-contain" />
            </div>
        }
        <div className="absolute top-2 left-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20">

                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.location.href = createPageUrl('CourseProfile') + `?id=${course.id}`}>
                <Eye className="h-4 w-4 ml-2" />
                צפייה בקורס
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`${window.location.origin}${createPageUrl('PublicView')}?type=course&id=${course.id}`, '_blank')}>
                <Share2 className="h-4 w-4 ml-2" />
                דף ציבורי
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEdit(course);
              }}>
                <Edit className="h-4 w-4 ml-2" />
                עריכה
              </DropdownMenuItem>
              {onSendSMS &&
              <DropdownMenuItem onClick={() => onSendSMS(course)}>
                  <MessageSquare className="h-4 w-4 ml-2" />
                  שלח תזכורת SMS
                </DropdownMenuItem>
              }
              <DropdownMenuItem onClick={() => onArchive(course)}>
                <Archive className="h-4 w-4 ml-2" />
                {course.status === 'archived' ? 'הפעלה' : 'ארכיון'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(course);
                }}
                className="text-red-600 focus:text-red-600">

                <Trash2 className="h-4 w-4 ml-2" />
                מחיקה
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-1">
          {course.name}
        </h3>
        
        <div className="space-y-2 text-sm text-slate-500 mb-4">
          {course.institution &&
          <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{course.institution}</span>
            </div>
          }
          {course.day_of_week && course.start_time &&
          <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{course.day_of_week}, {course.start_time}</span>
            </div>
          }
          {course.weekly_hours &&
          <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{course.weekly_hours} שעות שבועיות</span>
            </div>
          }
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            {course.whatsapp_group_link &&
            <a
              href={course.whatsapp_group_link}
              target="_blank"
              rel="noopener noreferrer"
              className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-200 transition-colors mr-1"
              title="הצטרפות לקבוצת וואטסאפ"
              onClick={(e) => e.stopPropagation()}>

                <MessageCircle className="h-3 w-3" />
              </a>
            }
            <Users className="h-4 w-4" />
            <span>{studentsCount} תלמידים</span>
          </div>
          <div className="flex items-center gap-2">
            {course.allow_self_registration &&
            <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <div className="bg-purple-100 text-purple-600 p-1 rounded-full">
                                <Globe className="w-3 h-3" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>פתוח לרישום עצמי</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            }
            {onTogglePublic && (
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-6 w-6 -ml-1 mr-1 transition-colors ${course.is_public ? 'text-blue-500 hover:text-blue-600 bg-blue-50' : 'text-slate-300 hover:text-blue-500'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onTogglePublic(course);
                    }}
                    title={course.is_public ? "קורס ציבורי - לחץ להפוך לפרטי" : "קורס פרטי - לחץ להפוך לציבורי"}
                >
                    <Globe className="h-4 w-4" />
                </Button>
            )}
            <Badge variant={course.status === 'active' ? 'default' : 'secondary'} className="bg-zinc-700 text-primary-foreground px-2.5 py-0.5 text-xs font-semibold rounded-md inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent shadow hover:bg-primary/80">
                {course.status === 'active' ? 'פעיל' : 'ארכיון'}
            </Badge>
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50 -ml-1 mr-1"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(course);
                }}
                title="מחיקת קורס"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>);

}