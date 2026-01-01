import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Search, Link as LinkIcon, AlertCircle, Loader2, CheckCircle, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function WhatsAppGroupView({ course }) {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);

    // Fetch messages based on linking status
    const isLinked = !!course.whatsapp_chat_id;

    // 1. If linked, fetch course messages
    const { data: courseMessages, isLoading: isLoadingMessages } = useQuery({
        queryKey: ['wa_course_messages', course.id],
        queryFn: () => base44.entities.WhatsAppMessage.filter({ course_id: course.id }),
        enabled: isLinked,
        refetchInterval: 5000 // Poll for new messages
    });

    // 2. If NOT linked, fetch available WhatsApp Chats (synced from bridge)
    const { data: unlinkedGroups, isLoading: isLoadingGroups } = useQuery({
        queryKey: ['wa_unlinked_groups'],
        queryFn: async () => {
            // Fetch groups from WhatsAppChat entity
            const chats = await base44.entities.WhatsAppChat.filter({ is_group: true });
            
            // Transform to display format
            return chats.map(chat => ({
                id: chat.wa_id,
                name: chat.name || chat.wa_id.split('@')[0],
                lastMessage: { body: chat.last_message_body || 'אין הודעות' },
                count: chat.participant_count || 0,
                timestamp: chat.timestamp
            })).sort((a, b) => b.timestamp - a.timestamp);
        },
        enabled: !isLinked,
        refetchInterval: 5000 
    });

    const linkCourseMutation = useMutation({
        mutationFn: (chatId) => base44.functions.invoke('linkCourseToGroup', {
            courseId: course.id,
            chatId: chatId
        }),
        onSuccess: (data) => {
            toast.success('הקורס חוב בהצלחה לקבוצה', {
                description: `סונכרנו ${data.data.matched_messages} הודעות עבר`
            });
            queryClient.invalidateQueries(['course', course.id]); // Refresh course to get whatsapp_chat_id
            queryClient.invalidateQueries(['wa_course_messages']);
             // We need to reload the page or force parent update because course prop is stale
             // For now, let's rely on parent query invalidation if possible, or just reload
             setTimeout(() => window.location.reload(), 1000);
        },
        onError: () => toast.error('שגיאה בחיבור הקורס לקבוצה')
    });

    const sendMessageMutation = useMutation({
        mutationFn: (data) => base44.functions.invoke('sendWhatsApp', {
            chatId: data.chatId,
            body: data.body,
            courseId: course.id,
            isGroup: data.isGroup
        }),
        onSuccess: () => {
            setSearchTerm('');
            setIsSending(false);
            // Invalidate to show the pending message immediately
            queryClient.invalidateQueries(['wa_course_messages']);
            toast.success('ההודעה נשלחה לתור', { duration: 2000 });
        },
        onError: () => {
            setIsSending(false);
            toast.error('שגיאה בשליחת ההודעה');
        }
    });

    // Determine what to display
    const messagesToDisplay = isLinked ? courseMessages : [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            
            {/* Sidebar / Info Panel */}
            <Card className="col-span-1 border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-700 mb-2">
                        {isLinked ? 'פרטי קבוצה' : 'חיבור קבוצה'}
                    </h3>
                    {isLinked ? (
                        <div className="text-sm text-slate-600">
                             <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>מחובר לקבוצת WhatsApp</span>
                             </div>
                             <p className="text-xs text-slate-400 break-all">{course.whatsapp_chat_id}</p>
                        </div>
                    ) : (
                        <div className="text-sm text-slate-600">
                            <p className="mb-2">הקורס טרם חובר לקבוצת WhatsApp.</p>
                            <p className="text-xs text-slate-500 mb-2">
                                המערכת מזהה קבוצות אוטומטית ברגע מתקבלת מהן הודעה.
                            </p>
                            <div className="bg-orange-50 p-2 rounded border border-orange-100 text-xs text-orange-800">
                                <strong>לא רואה את הקבוצה?</strong>
                                <br/>
                                שלח כעת הודעה כלשהי בקבוצה בוואטסאפ (מהנייד שלך), והיא תופיע כאן תוך שניות.
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <h4 className="font-bold text-slate-700 text-xs mb-2">או צור קבוצה חדשה:</h4>
                                <Button 
                                    variant="outline" 
                                    className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                    onClick={handleCreateGroup}
                                    disabled={isCreatingGroup}
                                >
                                    {isCreatingGroup ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4 mr-2" />}
                                    צור קבוצה לקורס זה
                                </Button>
                                <p className="text-[10px] text-slate-400 mt-1 text-center">הקבוצה תיווצר בטלפון שלך</p>
                            </div>
                        </div>
                    )}
                </div>

                <ScrollArea className="flex-1 p-3">
                    {!isLinked && (
                        <div className="space-y-2">
                            {isLoadingGroups ? (
                                <div className="text-center py-4"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400"/></div>
                            ) : unlinkedGroups?.length > 0 ? (
                                unlinkedGroups.map(group => (
                                    <div 
                                        key={group.id}
                                        className="bg-white border hover:border-emerald-300 p-3 rounded-lg cursor-pointer transition-colors shadow-sm"
                                        onClick={() => {
                                            if (confirm('האם אתה בטוח שברצונך לקשר את הקורס לקבוצה זו?')) {
                                                linkCourseMutation.mutate(group.id);
                                            }
                                        }}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-slate-800 text-sm truncate dir-ltr">{group.id.split('@')[0]}</h4>
                                            {linkCourseMutation.isPending && <Loader2 className="w-3 h-3 animate-spin"/>}
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <p className="text-xs text-slate-500 line-clamp-1">
                                                {group.lastMessage.body}
                                            </p>
                                            <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                                                <LinkIcon className="w-3 h-3 mr-1" />
                                                קשר
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-400">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>לא נמצאו קבוצות פעילות.</p>
                                    <p className="text-xs mt-2">שלח הודעה בקבוצה כדי שהיא תופיע כאן.</p>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </Card>

            {/* Chat View */}
            <Card className="col-span-1 lg:col-span-2 flex flex-col border-slate-200 overflow-hidden bg-[#e5ded8]">
                {/* Header */}
                <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-emerald-600 text-white">
                                <MessageCircle className="h-5 w-5" />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-bold text-slate-800">{course.name}</h3>
                            <p className="text-xs text-slate-500">
                                {isLinked ? 'מחובר ומסונכרן' : 'לא מחובר'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {/* Placeholder Messages if empty */}
                        {isLinked && (!messagesToDisplay || messagesToDisplay.length === 0) && (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-500 opacity-60">
                                <MessageCircle className="h-12 w-12 mb-2" />
                                <p>הקורס מחובר, אך טרם סונכרנו הודעות.</p>
                            </div>
                        )}

                        {!isLinked && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
                                <LinkIcon className="h-12 w-12 mb-2" />
                                <p>יש לקשר קבוצה כדי לצפות בהודעות</p>
                            </div>
                        )}

                        {/* Render Messages */}
                        {messagesToDisplay?.sort((a,b) => a.timestamp - b.timestamp).map((msg) => (
                            <div key={msg.id} className={`flex ${msg.is_from_me ? 'justify-start' : 'justify-end'} group relative`}>
                                <div className={`max-w-[75%] rounded-lg p-3 shadow-sm text-sm relative ${
                                    msg.is_from_me ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none' : 'bg-white text-slate-900 rounded-tl-none'
                                }`}>
                                    {!msg.is_from_me && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[11px] font-bold text-orange-600">
                                                {msg.sender_name || msg.sender_number}
                                            </span>
                                        </div>
                                    )}
                                    
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                                    
                                    <div className="text-[10px] text-right text-slate-400 mt-1 flex items-center justify-end gap-1">
                                        {format(new Date(msg.timestamp * 1000), 'HH:mm dd/MM')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* Send Input Area */}
                {isLinked && (
                    <div className="p-3 bg-white border-t border-slate-200">
                        <div className="flex gap-2 items-end">
                            <Input
                                value={searchTerm} // We reuse this state or create new one
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="כתוב הודעה לקבוצה..."
                                className="min-h-[44px] bg-slate-50"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (searchTerm.trim()) handleSendMessage();
                                    }
                                }}
                            />
                            <Button 
                                onClick={handleSendMessage}
                                disabled={!searchTerm.trim() || isSending}
                                className="bg-emerald-600 hover:bg-emerald-700 h-[44px] w-[44px] p-0 shrink-0"
                            >
                                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 rtl:rotate-180" />}
                            </Button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 mr-1">ההודעה תשלח לקבוצה בשם המערכת</p>
                    </div>
                )}

                {/* Unlinked Note */}
                {!isLinked && (
                    <div className="p-3 bg-slate-50 border-t text-center text-xs text-slate-500">
                        יש לקשר קבוצה כדי לשלוח הודעות
                    </div>
                )}
            </Card>
        </div>
    );

    function handleSendMessage() {
        if (!searchTerm.trim()) return;
        setIsSending(true);
        sendMessageMutation.mutate({
            chatId: course.whatsapp_chat_id,
            body: searchTerm,
            isGroup: true
        });
    }

    async function handleCreateGroup() {
        if (!confirm('האם ליצור קבוצת WhatsApp חדשה לקורס זה?\nהפעולה תשלח פקודה למכשיר הטלפון המחובר.')) return;
        
        setIsCreatingGroup(true);
        try {
            const response = await base44.functions.invoke('createWhatsAppGroup', {
                courseId: course.id,
                title: course.name.substring(0, 25),
                participants: []
            });
            
            if (response.data?.success) {
                toast.success('פקודת יצירת קבוצה נשלחה', { 
                    description: 'הקבוצה תופיע כאן תוך מספר שניות' 
                });
            } else {
                throw new Error(response.data?.error || 'Unknown error');
            }
        } catch (e) {
            console.error('Create group error:', e);
            toast.error('שגיאה ביצירת קבוצה: ' + e.message);
        } finally {
            setTimeout(() => setIsCreatingGroup(false), 2000);
        }
    }
}