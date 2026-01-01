import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function PublicClock({ className = "" }) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={`flex items-center gap-2 text-sm text-slate-500 bg-white/50 border border-slate-200/50 shadow-sm px-3 py-1.5 rounded-full backdrop-blur-sm ${className}`}>
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span suppressHydrationWarning className="font-medium tabular-nums tracking-tight">
                {format(time, 'd בMMMM yyyy, HH:mm:ss', { locale: he })}
            </span>
        </div>
    );
}