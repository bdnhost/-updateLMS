import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, ArrowLeft, Globe, School, Building2, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import EmbedCodeDialog from '@/components/common/EmbedCodeDialog';

export default function PublicCoursesTeaser() {
    const [embedCourse, setEmbedCourse] = useState(null);

    const { data: publicCoursesData, isLoading } = useQuery({
        queryKey: ['publicCoursesWithOrgs'],
        queryFn: async () => {
            const courses = await base44.entities.Course.filter({ is_public: true }, '-created_date', 6);
            
            // Fetch organization details for each course
            const orgIds = [...new Set(courses.map(c => c.organization_id))];
            const orgs = await Promise.all(
                orgIds.map(id => base44.entities.Organization.get(id).catch(() => null))
            );
            
            const orgMap = {};
            orgs.forEach(org => {
                if (org) orgMap[org.id] = org;
            });
            
            return courses.map(course => ({
                ...course,
                organization: orgMap[course.organization_id]
            }));
        },
        staleTime: 60000
    });

    if (isLoading || !publicCoursesData || publicCoursesData.length === 0) {
        return null;
    }

    return (
        <>
        <section className="py-20 bg-slate-50 border-y border-slate-200">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                            <Globe className="w-4 h-4" />
                            למידה חופשית ופתוחה
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            קורסים ציבוריים להעשרה
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            גלה עולם של ידע עם קורסים הפתוחים לקהל הרחב.
                            <br />
                            <span className="font-semibold text-blue-700">ארגוני פרו?</span> גם אתם יכולים ליצור ולשתף קורסים ציבוריים, להגדיל את החשיפה שלכם ולתרום לקהילה.
                        </p>
                    </div>
                    {/* <Button variant="outline" className="gap-2 hidden md:flex">
                        לכל הקורסים הציבוריים
                        <ArrowLeft className="w-4 h-4" />
                    </Button> */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {publicCoursesData.map((course, idx) => (
                        <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200">
                            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        {course.logo_url ? (
                                            <img src={course.logo_url} alt="Logo" className="w-12 h-12 object-contain rounded-lg bg-slate-50 p-1 border" />
                                        ) : (
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                                <GraduationCap className="w-6 h-6" />
                                            </div>
                                        )}
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                                            {course.code}
                                        </Badge>
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                    {course.name}
                                </h3>
                                
                                <p className="text-slate-500 text-sm line-clamp-2 min-h-[2.5rem]">
                                    {course.description || 'קורס העשרה פתוח לקהל הרחב בנושאים מגוונים.'}
                                </p>

                                {course.organization && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                                        {course.organization.logo_url ? (
                                            <img src={course.organization.logo_url} alt="Org Logo" className="w-5 h-5 object-contain rounded" />
                                        ) : (
                                            <School className="w-4 h-4 text-slate-400" />
                                        )}
                                        <span className="text-xs font-medium text-slate-600">
                                            {course.organization.name}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 h-8 px-2"
                                        onClick={() => setEmbedCourse(course)}
                                    >
                                        <Code2 className="w-3 h-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-1" asChild>
                                        <a href={`${window.location.origin}${createPageUrl('PublicView')}?type=course&id=${course.id}`} target="_blank" rel="noopener noreferrer">
                                            צפה בקורס
                                            <ArrowLeft className="w-3 h-3 mr-1" />
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                
                <div className="mt-12 bg-indigo-900 rounded-2xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10 text-white max-w-2xl">
                        <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
                            <School className="w-6 h-6 text-yellow-400" />
                            רוצים לפתוח קורס ציבורי משלכם?
                        </h3>
                        <p className="text-indigo-200">
                            מנויי פרו וארגונים יכולים ליצור קורסים ציבוריים, לשתף ידע ולבנות קהילה לומדת. הצטרפו למהפכת הידע החופשי!
                        </p>
                    </div>
                    <Button size="lg" className="bg-white text-indigo-900 hover:bg-indigo-50 shadow-xl relative z-10 whitespace-nowrap" asChild>
                        <Link to={createPageUrl('Demo')}>
                            שדרג לפרו
                        </Link>
                    </Button>
                </div>
            </div>
        </section>

        {embedCourse && (
            <EmbedCodeDialog
                open={!!embedCourse}
                onClose={() => setEmbedCourse(null)}
                embedUrl={`${window.location.origin}${createPageUrl('PublicView')}?type=course&id=${embedCourse.id}`}
                title={`הטמעת ${embedCourse.name}`}
            />
        )}
        </>
    );
}