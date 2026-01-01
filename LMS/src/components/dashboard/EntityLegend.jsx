import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
    GraduationCap, 
    Users, 
    Calendar, 
    FileText, 
    FolderOpen,
    MessageSquare,
    Bell
} from 'lucide-react';

const ENTITY_TYPES = [
    { 
        label: 'קורסים', 
        icon: GraduationCap, 
        color: 'bg-violet-100 text-violet-700', 
        link: 'Courses',
        description: 'ניהול קורסים וסילבוסים'
    },
    { 
        label: 'תלמידים', 
        icon: Users, 
        color: 'bg-blue-100 text-blue-700', 
        link: 'Students',
        description: 'כרטיסי תלמיד ומידע'
    },
    { 
        label: 'מפגשים', 
        icon: Calendar, 
        color: 'bg-indigo-100 text-indigo-700', 
        link: 'Sessions',
        description: 'לוח שנה ומפגשים'
    },
    { 
        label: 'מטלות', 
        icon: FileText, 
        color: 'bg-emerald-100 text-emerald-700', 
        link: 'Assignments',
        description: 'הגשות וציונים'
    },
    { 
        label: 'חומרים', 
        icon: FolderOpen, 
        color: 'bg-amber-100 text-amber-700', 
        link: 'Materials',
        description: 'מאגר חומרי לימוד'
    },
    { 
        label: 'הודעות', 
        icon: MessageSquare, 
        color: 'bg-rose-100 text-rose-700', 
        link: 'Messages',
        description: 'תקשורת עם תלמידים'
    }
];

export default function EntityLegend() {
    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <div className="p-2 bg-slate-100 rounded-lg">
                        <GraduationCap className="w-5 h-5 text-slate-600" />
                    </div>
                    ניווט מהיר ומקרא
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {ENTITY_TYPES.map((item) => (
                        <Link 
                            key={item.label} 
                            to={createPageUrl(item.link)}
                            className="flex flex-col items-center justify-center p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group text-center gap-2"
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${item.color}`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="font-bold text-slate-700">{item.label}</div>
                                <div className="text-[10px] text-slate-400 hidden lg:block mt-1">{item.description}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}