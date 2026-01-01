import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isToday, isTomorrow } from 'date-fns';
import { he } from 'date-fns/locale';
import { Calendar, Clock, MapPin } from 'lucide-react';

const eventTypeLabels = {
  lesson: 'שיעור',
  exam: 'מבחן',
  deadline: 'הגשה',
  event: 'אירוע',
  holiday: 'חופשה',
};

const eventTypeColors = {
  lesson: 'bg-blue-100 text-blue-700',
  exam: 'bg-red-100 text-red-700',
  deadline: 'bg-orange-100 text-orange-700',
  event: 'bg-violet-100 text-violet-700',
  holiday: 'bg-emerald-100 text-emerald-700',
};

export default function UpcomingEvents({ events, courses }) {
  const getCourseName = (courseId) => {
      return courses?.find(c => c.id === courseId)?.name || '';
  };

  const getDateLabel = (date) => {
    if (isToday(new Date(date))) return 'היום';
    if (isTomorrow(new Date(date))) return 'מחר';
    return format(new Date(date), 'EEEE, d בMMMM', { locale: he });
  };

  if (!events || events.length === 0) {
    return (
      <Card className="p-6 bg-white border-0 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">אירועים קרובים</h3>
        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
          <Calendar className="h-12 w-12 mb-3" />
          <p>אין אירועים קרובים</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-0 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">אירועים קרובים</h3>
      <div className="space-y-3">
        {events.slice(0, 5).map((event) => (
          <Link 
            key={event.id} 
            to={event.course_id ? `${createPageUrl('CourseProfile')}?id=${event.course_id}` : createPageUrl('Calendar')}
            className="block"
          >
              <div className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                  <div className="flex gap-2">
                    {event.course_id && courses && (
                        <Badge variant="outline" className="text-xs bg-white text-slate-600 border-slate-200">
                            {getCourseName(event.course_id)}
                        </Badge>
                    )}
                    <Badge className={eventTypeColors[event.type]}>
                        {eventTypeLabels[event.type]}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {getDateLabel(event.date)}
                  </span>
                  {event.start_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {event.start_time}
                    </span>
                  )}
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </span>
                  )}
                </div>
              </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}