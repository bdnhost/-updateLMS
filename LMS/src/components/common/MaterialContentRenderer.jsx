import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Lightbulb, ArrowLeft, BookOpen, Quote } from 'lucide-react';

export const MaterialContent = ({ resource }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const audioRef = useRef(null);

    // Reset slide when resource changes
    useEffect(() => {
        setCurrentSlide(0);
    }, [resource?.id]);

    if (!resource?.generated_content) {
        return null;
    }

    const contentType = resource.generated_content.slides ? 'presentation' : resource.generated_content.html_content ? 'document' : null;
    
    if (!contentType) {
        return null;
    }

    if (contentType === 'document') {
        return (
            <div className="flex flex-col gap-6">
                <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-100 shadow-sm leading-relaxed text-right relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                    
                    <div className="mb-8 flex items-center gap-3 text-violet-600">
                        <BookOpen className="w-6 h-6" />
                        <span className="text-sm font-bold uppercase tracking-wider">מדריך למידה</span>
                    </div>

                    <div 
                        className="prose max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-indigo-700" 
                        dir="rtl"
                        dangerouslySetInnerHTML={{ __html: resource.generated_content.html_content }} 
                    />

                    <div className="mt-12 bg-amber-50 border-r-4 border-amber-400 p-6 rounded-l-lg relative">
                        <Quote className="absolute top-4 left-4 w-8 h-8 text-amber-200" />
                        <h4 className="text-amber-800 font-bold text-lg mb-2 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5" />
                            הידעת? נקודה למחשבה
                        </h4>
                        <p className="text-amber-900/80 text-sm leading-relaxed pl-10">
                            {resource.description ? 
                                `הנושא "${resource.title}" הוא אבן יסוד בהבנת החומר בקורס. נסו לחשוב כיצד הוא מתחבר לידע הקודם שלכם?` :
                                "שים לב למושגים המרכזיים שהוזכרו. הם ישמשו אותך במטלות הבאות."
                            }
                        </p>
                    </div>
                </div>

                <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-1">סיימת לקרוא? מצוין!</h3>
                        <p className="text-indigo-200 text-sm">השלב הבא מחכה לך. בוא נתרגל את מה שלמדנו.</p>
                    </div>
                    <Button 
                        size="lg" 
                        className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold shadow-lg relative z-10 whitespace-nowrap"
                        onClick={() => {
                            const relatedAssignment = resource.related_assignment_id || (resource.assignments && resource.assignments[0]);
                            if (relatedAssignment) {
                                window.location.href = `?type=assignment&id=${relatedAssignment.id || relatedAssignment}`;
                            } else if (resource.course_id && resource.session_id) {
                                window.location.href = `?type=session&id=${resource.session_id}`;
                            } else if (resource.course_id) {
                                window.location.href = `?type=course&id=${resource.course_id}`;
                            } else {
                                const closeBtn = document.querySelector('[data-close-dialog]');
                                if(closeBtn) closeBtn.click();
                            }
                        }}
                    >
                        המשך לשלב הבא
                        <ArrowLeft className="mr-2 w-5 h-5" />
                    </Button>
                </div>
            </div>
        );
    }

    if (contentType === 'presentation' && resource.generated_content.slides?.length > 0) {
        const slide = resource.generated_content.slides[currentSlide];
        return (
            <div className="mt-4 md:mt-8 bg-slate-900 text-white rounded-2xl overflow-hidden aspect-[16/9] flex flex-col relative shadow-2xl ring-1 ring-slate-900/10 transition-all duration-500" dir="rtl">
                <div className="flex-1 p-6 md:p-16 flex flex-col justify-center items-center text-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent" />
                    
                    <div className="relative z-10 w-full max-w-4xl mx-auto">
                        <h3 className="text-2xl md:text-5xl font-bold mb-6 md:mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 leading-tight drop-shadow-sm">
                            {slide.title}
                        </h3>
                        <div className="text-base md:text-2xl text-slate-300 text-right inline-block max-w-3xl leading-relaxed bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-white/5">
                            <ul className="space-y-3 md:space-y-4">
                                {slide.bullets?.map((bullet, idx) => (
                                    <li key={idx} className="flex items-start gap-3 slide-in-bottom animate-in duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                                        <span className="text-indigo-400 mt-1.5">•</span>
                                        <span>{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-950/80 p-3 md:p-4 flex justify-between items-center backdrop-blur-md border-t border-white/5">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-white hover:bg-white/10 hover:text-white"
                        onClick={() => setCurrentSlide(prev => Math.min(resource.generated_content.slides.length - 1, prev + 1))}
                        disabled={currentSlide === resource.generated_content.slides.length - 1}
                    >
                        <ChevronRight className="ml-2 h-4 w-4" /> הבא
                    </Button>
                    <div className="flex flex-col items-center">
                        <div className="flex gap-1 mb-1">
                            {resource.generated_content.slides.map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === currentSlide ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-700 hover:bg-slate-600'}`}
                                    onClick={() => setCurrentSlide(i)}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                            {currentSlide + 1} / {resource.generated_content.slides.length}
                        </span>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-white hover:bg-white/10 hover:text-white"
                        onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                        disabled={currentSlide === 0}
                    >
                        הקודם <ChevronLeft className="mr-2 h-4 w-4" />
                    </Button>
                </div>

                {resource.audio_url && (
                    <audio 
                        ref={audioRef} 
                        src={resource.audio_url} 
                        controls 
                        className="w-full bg-slate-800 p-2" 
                    />
                )}
            </div>
        );
    }
    
    return null;
};