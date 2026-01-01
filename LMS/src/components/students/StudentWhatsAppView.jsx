import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Phone, Search, Link as LinkIcon, Loader2, CheckCircle, AlertCircle, User, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function StudentWhatsAppView({ student }) {
    const queryClient = useQueryClient();
    const isLinked = !!student.whatsapp_chat_id;

    // 1. Fetch messages for this student (linked or auto-matched)
    const { data: messages, isLoading: isLoadingMessages } = useQuery({
        queryKey: ['wa_student_messages', student.id],
        queryFn: () => base44.entities.WhatsAppMessage.filter({ student_id: student.id }), 
        refetchInterval: 5000
    });

    const [messageText, setMessageText] = useState('');
    const [isSending, setIsSending] = useState(false);

    // 2. Fetch unlinked chats for manual linking
    const { data: unlinkedChats, isLoading: isLoadingChats } = useQuery({
        queryKey: ['wa_unlinked_chats'],
        queryFn: async () => {
            // Fetch recent messages that are NOT groups
            const msgs = await base44.entities.WhatsAppMessage.filter({ is_group: false });
            
            const chatsMap = new Map();
            msgs.forEach(msg => {
                const chatId = msg.is_from_me ? msg.recipient_number : msg.sender_number;
                
                // Skip if already linked (optimization: client side check, but ideally backend filters)
                
                if (!chatsMap.has(chatId)) {
                    // Prioritize chat_name, then sender_name, then formatted ID
                    let displayName = msg.chat_name;
                    if (!displayName) {
                       displayName = msg.sender_name || chatId.replace('@c.us','').replace('@newsletter', ' (ערוץ)');
                    }

                    chatsMap.set(chatId, {
                        id: chatId,
                        name: displayName, 
                        lastMessage: msg,
                        count: 1
                    });
                } else {
                    const c = chatsMap.get(chatId);
                    c.count++;
                    if (msg.timestamp > c.lastMessage.timestamp) {
                        c.lastMessage = msg;
                    }
                }
            });
            return Array.from(chatsMap.values());
        },
        enabled: !isLinked
    });

    const linkStudentMutation = useMutation({
        mutationFn: (chatId) => base44.functions.invoke('linkStudentToChat', {
            studentId: student.id,
            chatId: chatId
        }),
        onSuccess: (data) => {
            toast.success('התלמיד חוב בהצלחה לצ\'אט', {
                description: `סונכרנו ${data.data.matched_messages} הודעות עבר`
            });
            queryClient.invalidateQueries(['student', student.id]);
            queryClient.invalidateQueries(['wa_student_messages']);
             // Reload to refresh student prop state from parent if needed, or rely on cache
             setTimeout(() => window.location.reload(), 1000);
        },
        onError: () => toast.error('שגיאה בחיבור התלמיד')
    });

    const sendMessageMutation = useMutation({
        mutationFn: (data) => base44.functions.invoke('sendWhatsApp', {
            chatId: data.chatId,
            body: data.body,
            studentId: student.id,
            isGroup: false
        }),
        onSuccess: () => {
            setMessageText('');
            setIsSending(false);
            queryClient.invalidateQueries(['wa_student_messages']);
            toast.success('ההודעה נשלחה לתור', { duration: 2000 });
        },
        onError: () => {
            setIsSending(false);
            toast.error('שגיאה בשליחת ההודעה');
        }
    });

    const handleSendMessage = () => {
        const targetChat = student.whatsapp_chat_id || (student.phone ? `${student.phone.replace(/[^0-9]/g, '').replace(/^0/, '972')}@c.us` : null);
        
        if (!targetChat || !messageText.trim()) return;
        
        setIsSending(true);
        sendMessageMutation.mutate({
            chatId: targetChat,
            body: messageText
        });
    };

    if (!student.phone && !isLinked) {
        return (
            <div className="text-center py-12 text-slate-500">
                <Phone className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>לא מוגדר מספר טלפון לתלמיד זה ולא בוצע קישור ידני</p>
            </div>
        );
    }

    // Filter messages if using query
    const displayMessages = messages || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[550px]">
            
            {/* Sidebar - Info / Linking */}
            <Card className="col-span-1 border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-700 mb-2">
                        {isLinked ? 'פרטי חיבור' : 'חיבור לצ\'אט'}
                    </h3>
                    {isLinked ? (
                        <div className="text-sm text-slate-600">
                             <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>מחובר ל-WhatsApp</span>
                             </div>
                             <p className="text-xs text-slate-400 break-all">{student.whatsapp_chat_id}</p>
                             <div className="mt-3 text-xs bg-white p-2 rounded border">
                                <p className="font-bold mb-1">מספר טלפון במערכת:</p>
                                <p>{student.phone || '-'}</p>
                             </div>
                        </div>
                    ) : (
                        <div className="text-sm text-slate-600">
                            <p className="mb-2">טרם בוצע קישור ידני.</p>
                            <p className="text-xs text-slate-500">
                                המערכת מנסה להתאים לפי טלפון ({student.phone}), אך ניתן לקשר ידנית לצ'אט ספציפי למטה.
                            </p>
                        </div>
                    )}
                </div>

                <ScrollArea className="flex-1 p-3">
                    {!isLinked && (
                        <div className="space-y-2">
                             <div className="text-xs font-bold text-slate-400 mb-2 uppercase">צ'אטים אחרונים שאינם מקושרים</div>
                            {isLoadingChats ? (
                                <div className="text-center py-4"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400"/></div>
                            ) : unlinkedChats?.length > 0 ? (
                                unlinkedChats.map(chat => (
                                    <div 
                                        key={chat.id}
                                        className="bg-white border hover:border-emerald-300 p-3 rounded-lg cursor-pointer transition-colors shadow-sm"
                                        onClick={() => {
                                            if (confirm(`האם לקשר את התלמיד לצ'אט עם ${chat.name}?`)) {
                                                linkStudentMutation.mutate(chat.id);
                                            }
                                        }}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <Avatar className="w-6 h-6">
                                                    <AvatarFallback className="text-[10px] bg-slate-100"><User/></AvatarFallback>
                                                </Avatar>
                                                <h4 className="font-bold text-slate-800 text-sm truncate dir-auto text-right w-full">{chat.name}</h4>
                                            </div>
                                            {linkStudentMutation.isPending && <Loader2 className="w-3 h-3 animate-spin"/>}
                                        </div>
                                        <div className="flex justify-between items-end mt-2">
                                            <p className="text-xs text-slate-500 line-clamp-1 flex-1 ml-2">
                                                {chat.lastMessage.body}
                                            </p>
                                            <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shrink-0">
                                                <LinkIcon className="w-3 h-3 mr-1" />
                                                קשר
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-400">
                                    <p>לא נמצאו צ'אטים פרטיים לא משויכים.</p>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </Card>

            {/* Chat View */}
            <Card className="col-span-1 lg:col-span-2 flex flex-col border-slate-200 bg-[#e5ded8] overflow-hidden">
                 {/* Header */}
                 <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                            <MessageCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">{student.full_name}</h3>
                            <p className="text-xs text-slate-500">{student.phone}</p>
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {/* Placeholder */}
                        {(!displayMessages || displayMessages.length === 0) && (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-500 bg-white/60 rounded-xl p-6 mx-auto max-w-sm mt-10 backdrop-blur-sm">
                                <MessageCircle className="h-10 w-10 mb-3 opacity-30" />
                                <p className="font-medium">אין הודעות מסונכרנות</p>
                                <p className="text-xs mt-1 opacity-70 text-center">
                                    הודעות ישירות (פרטיות) שישלחו לתלמיד זה יופיעו כאן אוטומטית אם הטלפון תואם, או לאחר ביצוע קישור ידני.
                                </p>
                            </div>
                        )}

                        {displayMessages?.sort((a,b) => a.timestamp - b.timestamp).map((msg) => (
                            <div key={msg.id} className={`flex ${msg.is_from_me ? 'justify-start' : 'justify-end'} group relative`}>
                                <div className={`max-w-[75%] rounded-lg p-3 shadow-sm text-sm relative ${
                                    msg.is_from_me ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none' : 'bg-white text-slate-900 rounded-tl-none'
                                } ${msg.is_group ? 'border-2 border-slate-100' : ''}`}>
                                    
                                    {msg.is_group && (
                                        <div className="absolute -top-2 right-2 bg-slate-200 text-slate-600 text-[9px] px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                            <span>קבוצה</span>
                                        </div>
                                    )}

                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(msg.timestamp * 1000).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                        </span>
                                        {msg.status === 'pending' && <span className="text-[9px] text-slate-400">🕒</span>}
                                        {msg.status === 'processing' && <span className="text-[9px] text-slate-400">🚀</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-slate-200">
                    <div className="flex gap-2 items-end">
                        <Input
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="כתוב הודעה..."
                            className="min-h-[44px] bg-slate-50"
                            disabled={!isLinked && !student.phone}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                        />
                        <Button 
                            onClick={handleSendMessage}
                            disabled={(!isLinked && !student.phone) || !messageText.trim() || isSending}
                            className="bg-emerald-600 hover:bg-emerald-700 h-[44px] w-[44px] p-0 shrink-0"
                        >
                            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 rtl:rotate-180" />}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}