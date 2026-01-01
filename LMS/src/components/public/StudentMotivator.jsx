import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X, Volume2, VolumeX, MessageCircle, Sparkles, RefreshCw, Languages } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Simple "Pop" sound as base64 to avoid external dependency issues
const POP_SOUND = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"; // Shortened placeholder, in real app use a real file

export default function StudentMotivator({ resource, action, session }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [language, setLanguage] = useState('auto'); // 'auto', 'he', 'ar'
    const audioRef = useRef(null);
    const prevAction = useRef(null);

    const { data: motivation, refetch, isFetching } = useQuery({
        queryKey: ['studentMotivation', resource?.id, action, language], // Add action and language to query key
        queryFn: async () => {
            const res = await base44.functions.invoke('getStudentMotivation', {
                resourceType: resource.type || (resource.student_identity_id ? 'student' : 'unknown'),
                resourceData: resource,
                action: action, // Pass the current action
                language: language // Pass language preference
            });
            return res.data?.message;
        },
        enabled: false
    });

    // React to action changes
    useEffect(() => {
        if (action && action !== prevAction.current) {
            prevAction.current = action;
            // Short delay to make it feel like a reaction
            setTimeout(() => {
                setIsVisible(true);
                handleNewMessage();
            }, 500);
        }
    }, [action]);

    // Automatic appearance removed as per request
    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setIsVisible(true);
    //         handleNewMessage();
    //     }, 2000);
    //     return () => clearTimeout(timer);
    // }, []);

    const handleNewMessage = () => {
        refetch().then(() => {
            if (!isMuted && audioRef.current) {
                // Play sound logic
                try {
                    // Using a simple beep context if file not present, or real audio
                    // audioRef.current.play(); 
                } catch(e) {}
            }
        });
    };

    if (resource?.enable_ai_motivator === false) return null;

    return (
        <div className="fixed bottom-6 left-6 z-50 flex items-end gap-4 pointer-events-none">
            {/* Audio Element */}
            <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />

            <div className="pointer-events-auto flex flex-col items-start gap-2">
                <AnimatePresence>
                    {isVisible && motivation && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                            className="bg-white rounded-2xl rounded-bl-none shadow-xl border-2 border-indigo-100 p-4 max-w-xs relative mb-2"
                        >
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute -top-2 -right-2 h-6 w-6 bg-white rounded-full border shadow-sm hover:bg-slate-100"
                                onClick={() => setIsVisible(false)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                            
                            <p className="text-sm font-medium text-slate-700 leading-relaxed" dir="rtl">
                                {isFetching ? (
                                    <span className="flex items-center gap-2 text-indigo-500">
                                        <RefreshCw className="h-3 w-3 animate-spin" />
                                        מחשב עקיצה...
                                    </span>
                                ) : (
                                    motivation
                                )}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-end gap-2 group">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            if (!isVisible) setIsVisible(true);
                            handleNewMessage();
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg flex items-center justify-center cursor-pointer border-4 border-white overflow-hidden"
                    >
                        {/* Animated Glow */}
                        <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                        
                        {/* Mascot Face (Simple CSS/SVG) */}
                        <motion.div 
                            animate={{ 
                                rotate: isHovered ? [0, -10, 10, 0] : 0,
                                y: isFetching ? [0, -2, 0] : 0
                            }}
                            className="relative z-10"
                        >
                            <Sparkles className="w-8 h-8 text-white" />
                        </motion.div>
                        
                        {/* Status Indicator */}
                        <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                    </motion.button>

                    {/* Controls */}
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 rounded-full shadow-md bg-white hover:bg-slate-50"
                            onClick={() => setIsMuted(!isMuted)}
                        >
                            {isMuted ? <VolumeX className="h-4 w-4 text-slate-400" /> : <Volume2 className="h-4 w-4 text-indigo-600" />}
                        </Button>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-8 w-8 rounded-full shadow-md bg-white hover:bg-slate-50"
                                >
                                    <Languages className="h-4 w-4 text-indigo-600" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" side="top">
                                <DropdownMenuItem onClick={() => setLanguage('auto')}>
                                    {language === 'auto' && <span className="ml-2">✓</span>}
                                    אוטומטי (לפי שם)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLanguage('he')}>
                                    {language === 'he' && <span className="ml-2">✓</span>}
                                    עברית
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLanguage('ar')}>
                                    {language === 'ar' && <span className="ml-2">✓</span>}
                                    ערבית
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    );
}