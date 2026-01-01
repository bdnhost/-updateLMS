import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Phone, Mail, MapPin, Building, GraduationCap, ArrowRight, ExternalLink } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function PublicSchoolView({ resource }) {
    const {
        name,
        description,
        phone,
        address,
        billing_email: email, // Mapping from entity field
        website,
        logo_url,
        welcome_message,
        active_courses = [] // Assuming we fetch these
    } = resource;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl">
                <div className="h-48 bg-gradient-to-r from-violet-600 to-indigo-600"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6 text-center md:text-right">
                        <div className="p-2 bg-white rounded-2xl shadow-lg mb-4 md:mb-0 md:ml-6">
                            {logo_url || resource.created_by_picture ? (
                                <img 
                                    src={logo_url || resource.created_by_picture} 
                                    alt={name} 
                                    className="w-32 h-32 object-cover rounded-xl bg-white" 
                                />
                            ) : (
                                <div className="w-32 h-32 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300">
                                    <Building className="w-16 h-16" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 mb-2">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{name}</h1>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-slate-600 text-sm">
                                {address && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-violet-500" />
                                        <span>{address}</span>
                                    </div>
                                )}
                                {website && (
                                    <a 
                                        href={website} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="flex items-center gap-1.5 hover:text-violet-600 transition-colors"
                                    >
                                        <Globe className="w-4 h-4 text-violet-500" />
                                        <span>{website.replace(/^https?:\/\//, '')}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {welcome_message && (
                        <div className="bg-violet-50 border border-violet-100 rounded-xl p-6 text-center md:text-right">
                            <p className="text-violet-900 text-lg font-medium leading-relaxed">
                                "{welcome_message}"
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                    {description && (
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Building className="w-6 h-6 text-violet-600" />
                                אודות בית הספר
                            </h2>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                                <div className="prose max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {description}
                                </div>
                            </div>
                        </section>
                    )}

                    {active_courses.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <GraduationCap className="w-6 h-6 text-violet-600" />
                                קורסים פעילים
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                {active_courses.map(course => (
                                    <a 
                                        key={course.id} 
                                        href={`?type=course&id=${course.id}`}
                                        className="group bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center justify-between hover:shadow-md hover:border-violet-200 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-violet-50 rounded-lg flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
                                                <GraduationCap className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 group-hover:text-violet-700 transition-colors">{course.name}</h3>
                                                <p className="text-sm text-slate-500">קוד קורס: {course.code}</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-violet-500 group-hover:-translate-x-1 transition-all" />
                                    </a>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle>צור קשר</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {phone && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                    <div className="bg-white p-2 rounded-full shadow-sm text-violet-600">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500">טלפון</div>
                                        <a href={`tel:${phone}`} className="font-medium text-slate-900 hover:text-violet-600 dir-ltr block text-right">
                                            {phone}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {email && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                    <div className="bg-white p-2 rounded-full shadow-sm text-violet-600">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="text-xs text-slate-500">אימייל</div>
                                        <a href={`mailto:${email}`} className="font-medium text-slate-900 hover:text-violet-600 truncate block">
                                            {email}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {website && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                    <div className="bg-white p-2 rounded-full shadow-sm text-violet-600">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="text-xs text-slate-500">אתר אינטרנט</div>
                                        <a href={website} target="_blank" rel="noopener noreferrer" className="font-medium text-slate-900 hover:text-violet-600 truncate block">
                                            Visit Website
                                        </a>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}