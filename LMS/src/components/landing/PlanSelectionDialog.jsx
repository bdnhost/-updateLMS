import React, { useState } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
    CheckCircle2, 
    ArrowLeft, 
    ShieldCheck, 
    Rocket, 
    UserPlus, 
    CreditCard,
    BrainCircuit,
    MessageCircle,
    Image as ImageIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export default function PlanSelectionDialog({ plan, isOpen, onClose }) {
    const [agreed, setAgreed] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    if (!plan) return null;

    const handleContinue = () => {
        setIsRedirecting(true);
        // We redirect to login/signup, passing the plan ID as a parameter to handle after login
        // In a real app, this would redirect to a checkout page or the register page
        // For now, we simulate the flow to the dashboard/onboarding
        setTimeout(() => {
            base44.auth.redirectToLogin(createPageUrl('Dashboard') + `?onboarding=true&plan_id=${plan.id}`);
        }, 800);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white rounded-2xl border-0 shadow-2xl" dir="rtl">
                <div className="flex flex-col md:flex-row h-full">
                    {/* Left Side (Visuals) */}
                    <div className="bg-slate-900 text-white p-8 md:w-2/5 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-purple-900/40 z-0" />
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-500 rounded-full blur-[60px] opacity-40" />
                        
                        <div className="relative z-10">
                            <div className="bg-white/10 backdrop-blur-md w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-white/20 shadow-inner">
                                <Rocket className="w-6 h-6 text-violet-300" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">הצעד הבא שלך</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                אתה במרחק נגיעה משדרוג חווית ההוראה שלך. הצטרף למאות מורים שכבר בחרו ב-EduManage.
                            </p>
                        </div>

                        <div className="relative z-10 mt-8 space-y-6">
                            {/* Timeline */}
                            <div className="relative border-r-2 border-slate-700 pr-6 mr-3 space-y-8">
                                <div className="relative">
                                    <div className="absolute -right-[31px] top-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center border-4 border-slate-900">
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                    <p className="font-bold text-sm text-green-400">בחירת חבילה</p>
                                    <p className="text-xs text-slate-400">{plan.name}</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -right-[31px] top-0 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center border-4 border-slate-900 shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                                        <UserPlus className="w-3 h-3 text-white" />
                                    </div>
                                    <p className="font-bold text-sm text-white">יצירת חשבון</p>
                                    <p className="text-xs text-slate-400">פרטים אישיים</p>
                                </div>
                                <div className="relative opacity-50">
                                    <div className="absolute -right-[31px] top-0 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center border-4 border-slate-900">
                                        <CreditCard className="w-3 h-3 text-slate-400" />
                                    </div>
                                    <p className="font-bold text-sm text-slate-300">תשלום והתחלה</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side (Content) */}
                    <div className="p-8 md:w-3/5 flex flex-col">
                        <DialogHeader className="mb-6 text-right">
                            <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                בחירה מעולה!
                                <span className="text-2xl">🎉</span>
                            </DialogTitle>
                            <DialogDescription className="text-lg text-slate-600">
                                בחרת בתוכנית <span className="font-bold text-violet-700">{plan.name}</span>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1">
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6">
                                <p className="text-sm font-semibold text-slate-500 mb-3">מה כלול בחבילה?</p>
                                <div className="space-y-3">
                                    {plan.permissions?.ai_tools !== 'none' && (
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-violet-100 rounded-md">
                                                <BrainCircuit className="w-4 h-4 text-violet-600" />
                                            </div>
                                            <span className="text-sm text-slate-700">גישה לכלי AI {plan.permissions.ai_tools === 'advanced' ? 'מתקדמים' : 'בסיסיים'}</span>
                                        </div>
                                    )}
                                    {plan.permissions?.whatsapp !== 'none' && (
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-green-100 rounded-md">
                                                <MessageCircle className="w-4 h-4 text-green-600" />
                                            </div>
                                            <span className="text-sm text-slate-700">אינטגרציית WhatsApp {plan.permissions.whatsapp === 'full' ? 'מלאה' : 'לקריאה בלבד'}</span>
                                        </div>
                                    )}
                                    {plan.permissions?.branding && (
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-pink-100 rounded-md">
                                                <ImageIcon className="w-4 h-4 text-pink-600" />
                                            </div>
                                            <span className="text-sm text-slate-700">מיתוג אישי (לוגו וצבעים)</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-blue-100 rounded-md">
                                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="text-sm text-slate-700">14 ימי ניסיון חינם ללא התחייבות</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 mb-4">
                                <Checkbox 
                                    id="terms" 
                                    checked={agreed} 
                                    onCheckedChange={setAgreed}
                                    className="mt-1"
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="terms" className="text-sm font-medium leading-none cursor-pointer">
                                        אני מאשר/ת את תנאי השימוש
                                    </Label>
                                    <p className="text-xs text-slate-500">
                                        קראתי והסכמתי ל
                                        <Link to={createPageUrl('Terms')} target="_blank" className="text-violet-600 hover:underline px-1">תנאי השימוש</Link>
                                        ול
                                        <Link to={createPageUrl('Privacy')} target="_blank" className="text-violet-600 hover:underline px-1">מדיניות הפרטיות</Link>
                                        של המערכת.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="flex-col sm:justify-start gap-3 mt-auto">
                            <Button 
                                onClick={handleContinue} 
                                disabled={!agreed || isRedirecting}
                                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white h-11 text-base shadow-lg hover:shadow-violet-200 transition-all"
                            >
                                {isRedirecting ? 'מעביר לרישום...' : 'המשך ליצירת חשבון'}
                                {!isRedirecting && <ArrowLeft className="w-4 h-4 mr-2" />}
                            </Button>
                            <Button variant="ghost" onClick={onClose} className="w-full text-slate-400 hover:text-slate-600 h-9 text-sm">
                                ביטול וחזרה
                            </Button>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}