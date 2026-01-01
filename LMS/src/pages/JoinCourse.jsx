import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import PublicClock from '@/components/public/PublicClock';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { GraduationCap, Loader2, CheckCircle2, UserPlus, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function JoinCourse() {
    const [step, setStep] = useState('form'); // form, success
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        idNumber: '',
        selectedCourses: []
    });

    const params = new URLSearchParams(window.location.search);
    const preSelectedCourseId = params.get('courseId');
    const orgId = params.get('org');

    // Fetch organization data
    const { data: organization } = useQuery({
        queryKey: ['organization', orgId],
        queryFn: async () => {
            const response = await base44.functions.invoke('getPublicResource', { type: 'organization', id: orgId });
            return response.data || null;
        },
        enabled: !!orgId
    });

    // Fetch active courses allowing self registration
    const { data: courses, isLoading: coursesLoading } = useQuery({
        queryKey: ['publicCourses', orgId],
        queryFn: async () => {
             const response = await base44.functions.invoke('getPublicResource', { type: 'active_courses', id: orgId });
             return response.data || [];
        },
        enabled: !!orgId
    });

    const registerMutation = useMutation({
        mutationFn: async (data) => {
            const response = await base44.functions.invoke('courseRegistration', {
                ...data,
                organizationId: orgId
            });
            if (response.data.error) throw new Error(response.data.error);
            return response.data;
        },
        onSuccess: () => {
            setStep('success');
            toast.success('ההרשמה בוצעה בהצלחה!');
        },
        onError: (err) => {
            toast.error('שגיאה בהרשמה: ' + err.message);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        let coursesToRegister = formData.selectedCourses;
        if (preSelectedCourseId && !coursesToRegister.includes(preSelectedCourseId)) {
            coursesToRegister = [...coursesToRegister, preSelectedCourseId];
        }

        if (coursesToRegister.length === 0) {
            toast.error('יש לבחור לפחות קורס אחד');
            return;
        }

        registerMutation.mutate({
            ...formData,
            courseIds: coursesToRegister
        });
    };

    const toggleCourse = (courseId) => {
        setFormData(prev => {
            const current = prev.selectedCourses;
            if (current.includes(courseId)) {
                return { ...prev, selectedCourses: current.filter(id => id !== courseId) };
            } else {
                return { ...prev, selectedCourses: [...current, courseId] };
            }
        });
    };

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center p-4" dir="rtl">
                 <Card className="w-full max-w-md shadow-xl border-0">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">ההרשמה הושלמה!</h2>
                        <p className="text-slate-600">
                            פרטייך נקלטו במערכת {organization?.name} בהצלחה. <br/>
                            צוות הקורס ייצור עמך קשר בקרוב עם פרטי הגישה.
                        </p>
                        {organization?.phone && (
                            <p className="text-sm text-slate-500 mt-2">
                                לשאלות: {organization.phone}
                            </p>
                        )}
                        <Button className="mt-6 w-full bg-violet-600 hover:bg-violet-700" onClick={() => window.location.reload()}>
                            רישום תלמיד נוסף
                        </Button>
                    </CardContent>
                 </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 flex flex-col items-center justify-center p-4 font-['Heebo']" dir="rtl">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&display=swap'); body { font-family: 'Heebo', sans-serif; }`}</style>
            
            <div className="absolute top-4 left-4">
                <PublicClock />
            </div>

            <div className="mb-8 text-center">
                {organization?.logo_url ? (
                    <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                        <img src={organization.logo_url} alt={organization.name} className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                )}
                <h1 className="text-3xl font-bold text-slate-900">{organization?.name || 'EduManage'}</h1>
                <p className="text-slate-500 mt-2">{organization?.welcome_message || 'פורטל הרישום לקורסים'}</p>
                
                {(organization?.phone || organization?.email || organization?.website) && (
                    <div className="flex flex-wrap gap-3 justify-center mt-4 text-sm text-slate-600">
                        {organization.phone && (
                            <a href={`tel:${organization.phone}`} className="flex items-center gap-1 hover:text-violet-600">
                                📞 {organization.phone}
                            </a>
                        )}
                        {organization.email && (
                            <a href={`mailto:${organization.email}`} className="flex items-center gap-1 hover:text-violet-600">
                                ✉️ {organization.email}
                            </a>
                        )}
                        {organization.website && (
                            <a href={organization.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-violet-600">
                                🌐 אתר האינטרנט
                            </a>
                        )}
                    </div>
                )}
            </div>

            <Card className="w-full max-w-lg shadow-xl border-0 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-violet-600" />
                        טופס רישום סטודנט
                    </CardTitle>
                    <CardDescription>
                        אנא מלא/י את הפרטים הבאים כדי להירשם לקורסים הפתוחים
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">שם מלא *</Label>
                                <Input 
                                    id="fullName" 
                                    required
                                    value={formData.fullName}
                                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                                    placeholder="ישראל ישראלי"
                                    className="bg-slate-50"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">אימייל *</Label>
                                    <Input 
                                        id="email" 
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        placeholder="student@example.com"
                                        className="bg-slate-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">טלפון נייד *</Label>
                                    <Input 
                                        id="phone" 
                                        required
                                        value={formData.phone}
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                        placeholder="050-0000000"
                                        className="bg-slate-50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="idNumber">תעודת זהות</Label>
                                <Input 
                                    id="idNumber" 
                                    value={formData.idNumber}
                                    onChange={e => setFormData({...formData, idNumber: e.target.value})}
                                    className="bg-slate-50"
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-2 pt-2 pb-2">
                            <Checkbox 
                                id="terms" 
                                required
                                onCheckedChange={(checked) => {
                                    // Custom validation logic could go here, but HTML5 required works well for checkbox
                                }}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label
                                    htmlFor="terms"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    אני מאשר/ת את <Link to={createPageUrl('Terms')} target="_blank" className="text-violet-600 underline">תנאי השימוש</Link> ואת <Link to={createPageUrl('Privacy')} target="_blank" className="text-violet-600 underline">מדיניות הפרטיות</Link>
                                </Label>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <Label className="text-base font-semibold flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-violet-600" />
                                קורסים זמינים לרישום
                            </Label>
                            
                            {coursesLoading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                                </div>
                            ) : courses && courses.length > 0 ? (
                                <div className="grid gap-3 max-h-60 overflow-y-auto pr-1">
                                    {courses.map(course => {
                                        const isSelected = formData.selectedCourses.includes(course.id) || preSelectedCourseId === course.id;
                                        const isPreSelected = preSelectedCourseId === course.id;
                                        
                                        return (
                                            <div 
                                                key={course.id}
                                                className={`
                                                    flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                                                    ${isSelected ? 'bg-violet-50 border-violet-200' : 'bg-white border-slate-200 hover:bg-slate-50'}
                                                `}
                                            >
                                                <Checkbox 
                                                    checked={isSelected}
                                                    onCheckedChange={() => !isPreSelected && toggleCourse(course.id)}
                                                    disabled={isPreSelected}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1" onClick={(e) => {
                                                    // Prevent triggering twice if clicking checkbox wrapper/label
                                                    e.stopPropagation();
                                                    if (!isPreSelected) toggleCourse(course.id);
                                                }}>
                                                    <div className="font-medium text-slate-800">{course.name}</div>
                                                    <div className="text-xs text-slate-500 flex gap-2 mt-1">
                                                        <span>{course.code}</span>
                                                        {course.start_date && <span>• מתחיל ב: {course.start_date}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-slate-500 bg-slate-50 rounded-lg text-sm border border-dashed">
                                    לא נמצאו קורסים פתוחים לרישום כעת.
                                </div>
                            )}
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full bg-violet-600 hover:bg-violet-700 h-11 text-lg"
                            disabled={registerMutation.isPending}
                        >
                            {registerMutation.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                "הירשם עכשיו"
                            )}
                        </Button>
                        
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}