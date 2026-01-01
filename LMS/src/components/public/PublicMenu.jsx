import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  Menu, 
  MessageCircle, 
  User, 
  Home, 
  Send,
  MoreVertical,
  School,
  Loader2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function PublicMenu({ resource, studentId }) {
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isSchoolInfoOpen, setIsSchoolInfoOpen] = useState(false);
    const [messageContent, setMessageContent] = useState('');
    const [senderContact, setSenderContact] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSendMessage = async () => {
        if (!messageContent.trim()) {
            toast.error('נא להזין תוכן להודעה');
            return;
        }

        setIsSending(true);
        try {
            // If we have a studentId (either from props or resource if it's a student view)
            // use it. Otherwise, this is an anonymous/external message.
            const effectiveStudentId = studentId || (resource.type === 'student' ? resource.id : null);

            const res = await base44.functions.invoke('sendPublicMessageToTeacher', {
                studentId: effectiveStudentId,
                resourceType: resource.type,
                resourceId: resource.id,
                message: messageContent,
                senderContact: senderContact
            });
            
            if (res.data?.success) {
                toast.success('ההודעה נשלחה בהצלחה');
                setIsContactOpen(false);
                setMessageContent('');
                setSenderContact('');
            } else {
                toast.error('שגיאה בשליחת ההודעה');
            }
        } catch (error) {
            console.error(error);
            toast.error('שגיאה בשליחת ההודעה');
        } finally {
            setIsSending(false);
        }
    };

    const navigateHome = () => {
        if (resource.course_id) {
            window.location.href = `?type=course&id=${resource.course_id}&student_id=${studentId || ''}`;
        } else if (resource.type === 'course') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const isStudentPage = resource.type === 'student';
    const isCoursePage = resource.type === 'course';

    return (
        <>
            {/* Desktop Floating Menu */}
            <div className="hidden md:block fixed top-4 left-4 z-50">
                <DropdownMenu dir="rtl">
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full shadow-md bg-white border-slate-200 hover:bg-slate-50">
                            <Menu className="h-5 w-5 text-slate-700" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>תפריט פעולות</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {studentId && !isStudentPage && (
                            <DropdownMenuItem onClick={() => window.location.href = `?type=student&id=${studentId}`}>
                                <User className="h-4 w-4 ml-2" />
                                לפורטל האישי שלי
                            </DropdownMenuItem>
                        )}

                        {(resource.course_id) && (
                             <DropdownMenuItem onClick={navigateHome}>
                                <Home className="h-4 w-4 ml-2" />
                                דף הקורס
                             </DropdownMenuItem>
                        )}

                        <DropdownMenuItem onClick={() => setIsContactOpen(true)}>
                            <MessageCircle className="h-4 w-4 ml-2" />
                            שלח הודעה למורה
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => window.location.href = `?type=school&id=${resource.organization_id || resource.id}`}>
                            <School className="h-4 w-4 ml-2" />
                            פרטי בית הספר
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Mobile Bottom Navigation Bar - App Feel */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 z-50 flex justify-around items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe min-h-[70px]">
                {/* Course / Home Button */}
                {(resource.course_id || isCoursePage) && (
                    <button 
                        onClick={navigateHome}
                        className={`flex flex-col items-center gap-1 transition-all p-2 rounded-xl ${isCoursePage ? 'text-violet-600 bg-violet-50' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Home className="h-6 w-6" strokeWidth={isCoursePage ? 3 : 2} />
                        <span className="text-[10px] font-bold">קורס</span>
                    </button>
                )}

                {/* Student Portal Button */}
                {studentId && (
                    <button 
                        onClick={() => !isStudentPage && (window.location.href = `?type=student&id=${studentId}`)}
                        className={`flex flex-col items-center gap-1 transition-all p-2 rounded-xl ${isStudentPage ? 'text-violet-600 bg-violet-50' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <User className="h-6 w-6" strokeWidth={isStudentPage ? 3 : 2} />
                        <span className="text-[10px] font-bold">אזור אישי</span>
                    </button>
                )}

                {/* Contact Teacher Button */}
                <button 
                    onClick={() => setIsContactOpen(true)}
                    className="flex flex-col items-center gap-1 text-slate-400 hover:text-violet-600 active:text-violet-700 transition-colors p-2 rounded-xl active:bg-slate-50"
                >
                    <MessageCircle className="h-6 w-6" strokeWidth={2} />
                    <span className="text-[10px] font-bold">הודעה</span>
                </button>
            </div>

            <Dialog open={isSchoolInfoOpen} onOpenChange={setIsSchoolInfoOpen}>
                <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto w-[90vw] rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <School className="h-5 w-5 text-indigo-600" />
                            פרטי בית הספר
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 text-center">
                        {resource.organization_logo && (
                            <img 
                                src={resource.organization_logo} 
                                alt="Logo" 
                                className="h-20 mx-auto object-contain mb-4" 
                            />
                        )}
                        <h3 className="text-xl font-bold text-slate-900">{resource.organization_name || 'שם הארגון'}</h3>
                        
                        <div className="space-y-4">
                            {resource.organization_description && (
                                <p className="text-sm text-slate-600 whitespace-pre-wrap px-4">
                                    {resource.organization_description}
                                </p>
                            )}

                            <div className="space-y-2 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                {(resource.organization_email || resource.billing_email) && (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="font-semibold">אימייל:</span>
                                        <a href={`mailto:${resource.organization_email || resource.billing_email}`} className="text-blue-600 hover:underline">
                                            {resource.organization_email || resource.billing_email}
                                        </a>
                                    </div>
                                )}
                                {(resource.organization_phone || resource.phone) && (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="font-semibold">טלפון:</span>
                                        <a href={`tel:${resource.organization_phone || resource.phone}`} className="text-blue-600 hover:underline">
                                            {resource.organization_phone || resource.phone}
                                        </a>
                                    </div>
                                )}
                                {(resource.organization_website) && (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="font-semibold">אתר:</span>
                                        <a href={resource.organization_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            {resource.organization_website.replace(/^https?:\/\//, '')}
                                        </a>
                                    </div>
                                )}
                                {(resource.organization_address || resource.address) && (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="font-semibold">כתובת:</span>
                                        <span>{resource.organization_address || resource.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsSchoolInfoOpen(false)}>סגור</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto w-[90vw] rounded-xl">
                    <DialogHeader>
                        <DialogTitle>שליחת הודעה למורה</DialogTitle>
                        <DialogDescription>
                            ההודעה תישלח למורה הקורס ולמזכירות.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>תוכן ההודעה</Label>
                            <Textarea 
                                placeholder="כתוב את הודעתך כאן..." 
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>פרטי קשר לחזרה (טלפון/אימייל)</Label>
                            <Input 
                                placeholder="איך לחזור אליך?" 
                                value={senderContact}
                                onChange={(e) => setSenderContact(e.target.value)}
                            />
                            <p className="text-xs text-slate-500">חובה למלא אם אינך מחובר כרגע</p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:justify-start flex-col sm:flex-row">
                        <Button onClick={handleSendMessage} disabled={isSending} className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700">
                            {isSending ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    שולח...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 ml-2" />
                                    שלח הודעה
                                </>
                            )}
                        </Button>
                        <Button variant="outline" onClick={() => setIsContactOpen(false)} className="w-full sm:w-auto mt-2 sm:mt-0">
                            ביטול
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}