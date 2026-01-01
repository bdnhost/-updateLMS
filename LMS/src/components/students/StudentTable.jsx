import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Edit,
  Trash2,
  Mail,
  Phone,
  MoreVertical,
  Eye,
  MessageSquare,
  Globe,
  UserPlus,
  Sparkles
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusLabels = {
  active: 'פעיל',
  inactive: 'לא פעיל',
  dropped: 'פרש',
  pending: 'ממתין',
};

const statusColors = {
  active: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200',
  inactive: 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border border-slate-200',
  dropped: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-200',
  pending: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200',
};

export default function StudentTable({
  students,
  courses,
  onEdit = () => {},
  onDelete = () => {},
  onView = () => {},
  onSendSMS = () => {},
  onSendEmail = () => {},
  onStatusChange = () => {},
  attendanceStats,
  selectedIds,
  onSelectionChange = () => {}
}) {
  const getCourseNames = (student) => {
    const ids = student.course_ids && student.course_ids.length > 0
      ? student.course_ids
      : [student.course_id];

    const names = ids
      .map(id => courses?.find(c => c.id === id)?.name)
      .filter(Boolean);

    if (names.length === 0) return '-';
    if (names.length === 1) return names[0];
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className="cursor-help underline decoration-dotted decoration-violet-400 text-violet-600 font-medium">
              {names.length} קורסים
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-900 text-white border-0">
            <p>{names.join(', ')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const getAttendancePercent = (studentId) => {
    const stats = attendanceStats?.[studentId];
    if (!stats || stats.total === 0) return null;
    return Math.round((stats.present / stats.total) * 100);
  };

  const isAllSelected = students.length > 0 && selectedIds?.length === students.length;

  const getOnlineStatus = (lastSeen) => {
    if (!lastSeen) return 'offline';
    const diff = (new Date() - new Date(lastSeen)) / 1000 / 60;
    if (diff < 5) return 'online';
    if (diff < 30) return 'idle';
    return 'offline';
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange(students.map(s => s.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (studentId, checked) => {
    if (checked) {
      onSelectionChange([...(selectedIds || []), studentId]);
    } else {
      onSelectionChange((selectedIds || []).filter(id => id !== studentId));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-slate-100">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-l from-violet-100 via-purple-50 to-indigo-50 border-b-2 border-violet-200">
            <TableHead className="w-16 ps-6">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
                className="border-2 border-violet-400 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600 w-5 h-5"
              />
            </TableHead>
            <TableHead className="text-start font-black text-slate-700">שם התלמיד</TableHead>
            <TableHead className="text-start font-black text-slate-700">קורס</TableHead>
            <TableHead className="text-start font-black text-slate-700 hidden md:table-cell">אימייל</TableHead>
            <TableHead className="text-start font-black text-slate-700 hidden lg:table-cell">טלפון</TableHead>
            <TableHead className="text-start font-black text-slate-700">נוכחות</TableHead>
            <TableHead className="text-start font-black text-slate-700">סטטוס</TableHead>
            <TableHead className="w-16 text-center font-black text-slate-700">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => {
            const attendancePercent = getAttendancePercent(student.id);
            const isSelected = selectedIds?.includes(student.id);

            return (
              <motion.tr
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`
                  border-b border-slate-100 cursor-pointer transition-all duration-300 group
                  ${isSelected
                    ? 'bg-gradient-to-l from-indigo-100 via-purple-100 to-violet-100 border-indigo-300 shadow-md'
                    : 'hover:bg-gradient-to-l hover:from-violet-50 hover:via-purple-50/50 hover:to-transparent hover:shadow-lg'
                  }
                `}
                onClick={(e) => {
                  if (e.target.closest('button') || e.target.closest('a') || e.target.closest('[role="checkbox"]')) return;
                  onView(student);
                }}
              >
                <TableCell className="ps-6">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectOne(student.id, checked)}
                    aria-label={`Select ${student.full_name}`}
                    className={`
                      border-2 transition-all duration-300 w-5 h-5 rounded-lg
                      ${isSelected
                        ? 'border-indigo-600 bg-indigo-600 shadow-lg shadow-indigo-200 scale-110'
                        : 'border-slate-300 hover:border-violet-500 hover:scale-105'
                      }
                    `}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-bold text-slate-800 flex items-center gap-2 group-hover:text-violet-900 transition-colors">
                    <div className="relative flex h-3 w-3">
                      {(() => {
                        const status = getOnlineStatus(student.last_seen);
                        if (status === 'online') return (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-emerald-600 border-0 font-bold">
                                <p>מחובר כעת</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                        if (status === 'idle') return (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400 shadow-md shadow-amber-200"></span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-amber-600 border-0 font-bold">
                                <p>היה מחובר לאחרונה</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                        return (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-slate-300"></span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-slate-600 border-0 font-bold">
                                <p>לא מחובר</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })()}
                    </div>
                    {student.full_name}
                    {student.registration_source === 'self_registration' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="bg-gradient-to-br from-purple-100 to-violet-100 text-purple-600 p-1 rounded-full shadow-sm">
                              <Globe className="w-3 h-3" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-purple-600 border-0 font-bold">
                            <p>נרשם עצמאית באתר</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {student.registration_source === 'manual' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="bg-slate-100 text-slate-400 p-1 rounded-full">
                              <UserPlus className="w-3 h-3" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-600 border-0 font-bold">
                            <p>הוסף ידנית ע"י מנהל</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  {student.id_number && (
                    <div className="text-sm text-slate-500 font-medium mt-0.5">ת.ז: {student.id_number}</div>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-slate-700 font-medium">{getCourseNames(student)}</span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {student.email ? (
                    <a
                      href={`mailto:${student.email}`}
                      className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2 font-medium transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Mail className="h-4 w-4" />
                      {student.email}
                    </a>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {student.phone ? (
                    <a
                      href={`tel:${student.phone}`}
                      className="text-slate-700 hover:text-violet-600 flex items-center gap-2 font-medium transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="h-4 w-4" />
                      {student.phone}
                    </a>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {attendancePercent !== null ? (
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${attendancePercent}%` }}
                          transition={{ duration: 0.5, delay: index * 0.02 }}
                          className={`h-full rounded-full shadow-md ${
                            attendancePercent >= 80
                              ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                              : attendancePercent >= 60
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                              : 'bg-gradient-to-r from-red-500 to-pink-500'
                          }`}
                        />
                      </div>
                      <span className={`text-sm font-bold ${
                        attendancePercent >= 80 ? 'text-emerald-600' :
                        attendancePercent >= 60 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {attendancePercent}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 font-medium">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Badge
                        className={`cursor-pointer font-bold shadow-sm hover:shadow-md transition-all ${
                          statusColors[student.status] || statusColors.active
                        }`}
                      >
                        {statusLabels[student.status] || statusLabels.active}
                      </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-2 border-slate-200 shadow-xl rounded-xl">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(student, 'active');
                        }}
                        className="font-medium"
                      >
                        <Sparkles className="h-4 w-4 me-2 text-emerald-600" />
                        סמן כפעיל
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(student, 'inactive');
                        }}
                        className="font-medium"
                      >
                        סמן כלא פעיל
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(student, 'dropped');
                        }}
                        className="font-medium"
                      >
                        סמן כפורש
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(student, 'pending');
                        }}
                        className="font-medium"
                      >
                        סמן כממתין
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 hover:bg-violet-100 hover:text-violet-700 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-2 border-slate-200 shadow-xl rounded-xl">
                      <DropdownMenuItem onClick={() => onView(student)} className="font-medium">
                        <Eye className="h-4 w-4 me-2 text-violet-600" />
                        צפייה בפרופיל
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSendEmail(student)} className="font-medium">
                        <Mail className="h-4 w-4 me-2 text-blue-600" />
                        שלח אימייל
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSendSMS(student)} className="font-medium">
                        <MessageSquare className="h-4 w-4 me-2 text-green-600" />
                        שלח SMS
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(student)} className="font-medium">
                        <Edit className="h-4 w-4 me-2 text-amber-600" />
                        עריכה
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(student)}
                        className="text-red-600 focus:text-red-700 font-bold"
                      >
                        <Trash2 className="h-4 w-4 me-2" />
                        מחיקה
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}