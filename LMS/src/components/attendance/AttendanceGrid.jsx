import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Check,
  X,
  Clock,
  CalendarOff,
  MessageSquare } from
'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger } from
'@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger } from
'@/components/ui/popover';

const statusConfig = {
  present: { icon: Check, color: 'bg-emerald-500', label: 'נוכח', bgLight: 'bg-emerald-100' },
  absent: { icon: X, color: 'bg-red-500', label: 'נעדר', bgLight: 'bg-red-100' },
  late: { icon: Clock, color: 'bg-orange-500', label: 'איחור', bgLight: 'bg-orange-100' },
  excused: { icon: CalendarOff, color: 'bg-violet-500', label: 'חופש מאושר', bgLight: 'bg-violet-100' }
};

export default function AttendanceGrid({
  students,
  attendanceMap,
  onStatusChange,
  onNoteChange,
  isLoading
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center gap-4 flex-wrap">
        <span className="text-sm text-slate-500">מקרא:</span>
        {Object.entries(statusConfig).map(([key, config]) =>
        <div key={key} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${config.color}`} />
            <span className="text-sm text-slate-600">{config.label}</span>
          </div>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {students.map((student) => {
          const currentStatus = attendanceMap[student.id]?.status;
          const currentNote = attendanceMap[student.id]?.notes || '';

          return (
            <div
              key={student.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">

              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">{student.full_name}</p>
                {student.id_number &&
                <p className="text-sm text-slate-600">{student.id_number}</p>
                }
              </div>

              <div className="flex items-center gap-2">
                <TooltipProvider>
                  {Object.entries(statusConfig).map(([status, config]) => {
                    const Icon = config.icon;
                    const isSelected = currentStatus === status;

                    return (
                      <Tooltip key={status}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-10 w-10 rounded-full transition-all ${
                            isSelected ?
                            `${config.color} text-white hover:${config.color}` :
                            `${config.bgLight} text-slate-600 hover:${config.bgLight}`}`
                            }
                            onClick={() => onStatusChange(student.id, status)}
                            disabled={isLoading}>

                            <Icon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{config.label}</p>
                        </TooltipContent>
                      </Tooltip>);

                  })}
                </TooltipProvider>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-10 w-10 rounded-full ${currentNote ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>

                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64" align="end">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">הערה</label>
                      <Input
                        placeholder="הוסף הערה..."
                        value={currentNote}
                        onChange={(e) => onNoteChange(student.id, e.target.value)} />

                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>);

        })}
      </div>
    </div>);

}