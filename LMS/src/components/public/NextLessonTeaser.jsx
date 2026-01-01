import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { format, differenceInSeconds } from 'date-fns';
import { he } from 'date-fns/locale';

export default function NextLessonTeaser({ lesson, courseName }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

    useEffect(() => {
        if (!lesson || !lesson.date) return;

        const dateStr = `${lesson.date}T${lesson.start_time || '00:00'}`;
        const targetDate = new Date(dateStr);
        
        // Validate date
        if (isNaN(targetDate.getTime())) return;

        const updateTimer = () => {
            const now = new Date();
            const diff = differenceInSeconds(targetDate, now);

            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0 });
                return;
            }

            const days = Math.floor(diff / (3600 * 24));
            const hours = Math.floor((diff % (3600 * 24)) / 3600);
            const minutes = Math.floor((diff % 3600) / 60);

            setTimeLeft({ days, hours, minutes });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000); // Update every minute is enough for this design

        return () => clearInterval(interval);
    }, [lesson]);

    if (!lesson) return null;

    return (
        <div className="md:col-span-2 mb-4">
            <Card className="border-0 shadow-sm bg-white overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    {/* Left: Highlight Strip */}
                    <div className="w-full md:w-2 bg-indigo-600 h-2 md:h-auto" />
                    
                    <div className="flex-1 p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        
                        {/* Info Section */}
                        <div className="flex items-start gap-4 text-center md:text-right w-full md:w-auto">
                            <div className="hidden md:flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                                <span className="text-xs font-medium uppercase">מפגש</span>
                                <span className="text-xl font-bold">{lesson.lesson_number || '#'}</span>
                            </div>
                            
                            <div>
                                <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-0 font-normal">
                                        השיעור הקרוב
                                    </Badge>
                                    {courseName && (
                                        <>
                                            <span className="text-sm text-slate-400">|</span>
                                            <Badge variant="outline" className="border-indigo-100 text-indigo-600 bg-indigo-50">
                                                {courseName}
                                            </Badge>
                                        </>
                                    )}
                                    <span className="text-sm text-slate-400">|</span>
                                    <span className="text-sm text-slate-500 font-medium">
                                        {lesson.date && !isNaN(new Date(lesson.date).getTime()) 
                                            ? format(new Date(lesson.date), 'EEEE, d בMMMM', { locale: he })
                                            : lesson.date}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 leading-tight">
                                    {(lesson.title || 'שיעור ללא כותרת').replace(/^(?:(?:מפגש|שיעור)\s*\d+[:\s-]*)+/, '')}
                                </h3>
                                <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-500 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-indigo-500" />
                                        <span>{lesson.start_time}</span>
                                    </div>
                                    {lesson.location && (
                                        <>
                                            <span className="hidden sm:inline text-slate-300">•</span>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4 text-indigo-500" />
                                                <span>{lesson.location}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Countdown Section - Minimal */}
                        <div className="flex items-center gap-6 md:gap-8 border-t md:border-t-0 md:border-r border-slate-100 pt-4 md:pt-0 md:pr-8 w-full md:w-auto justify-center md:justify-end">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-slate-800 tabular-nums">
                                    {timeLeft.days}
                                </div>
                                <div className="text-xs text-slate-400 font-medium">ימים</div>
                            </div>
                            <div className="w-px h-8 bg-slate-200" />
                            <div className="text-center">
                                <div className="text-2xl font-bold text-slate-800 tabular-nums">
                                    {timeLeft.hours}
                                </div>
                                <div className="text-xs text-slate-400 font-medium">שעות</div>
                            </div>
                            <div className="w-px h-8 bg-slate-200" />
                            <div className="text-center">
                                <div className="text-2xl font-bold text-slate-800 tabular-nums">
                                    {timeLeft.minutes}
                                </div>
                                <div className="text-xs text-slate-400 font-medium">דקות</div>
                            </div>
                        </div>

                    </div>
                </div>
            </Card>
        </div>
    );
}