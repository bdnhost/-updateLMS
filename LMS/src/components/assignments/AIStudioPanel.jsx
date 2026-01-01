import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Mic, Wand2, PlayCircle, Loader2, ImageIcon, Palette, Trash2, Sparkles, Info, Smile, MessageSquare, Zap, Heart, Volume2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AudioPlayer from '@/components/common/AudioPlayer';
import { AIPermissionGuard, useAIPermission } from '@/components/common/AIPermissionGuard';
import { Badge } from '@/components/ui/badge';

const VOICE_OPTIONS = [
    { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria (אנגלית)', description: 'קול נשי, ברור ואנרגטי', premium: false },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Liam (אנגלית)', description: 'קול גברי, מקצועי ונעים', premium: false },
    { id: 'custom', name: '🎤 קול משובט אישי', description: 'השתמש בקול המרצה (פרימיום)', premium: true }
];

const EMOTION_TAGS = [
    { tag: '[excited]', label: 'נלהב', icon: Sparkles, color: 'text-yellow-600', desc: 'אנרגיה וחדות' },
    { tag: '[whispers]', label: 'לוחש', icon: MessageSquare, color: 'text-blue-600', desc: 'שקט ואינטימי' },
    { tag: '[pauses]', label: 'עצירה', icon: Zap, color: 'text-purple-600', desc: 'הפסקה דרמטית' },
    { tag: '[thoughtful]', label: 'מהורהר', icon: Info, color: 'text-indigo-600', desc: 'מחשבתי ורציני' },
    { tag: '[laughs]', label: 'צוחק', icon: Smile, color: 'text-pink-600', desc: 'עליז ומשעשע' },
    { tag: '[shouts]', label: 'קורא', icon: Volume2, color: 'text-red-600', desc: 'רם ודגשי' }
];

export default function AIStudioPanel({
    audioScript,
    onAudioScriptChange,
    voiceId,
    onVoiceIdChange,
    stability = 0.5,
    onStabilityChange,
    audioUrl,
    onAudioGenerate,
    isGeneratingAudio,
    onScriptGenerate,
    isGeneratingScript,
    mediaPrompt,
    onMediaPromptChange,
    mediaUrl,
    onMediaGenerate,
    isGeneratingMedia,
    onPromptSuggest,
    isGeneratingPrompt,
    onMediaClear,
    entityId,
    hideVoicePicker = false
}) {
    const { hasPremiumAI, hasStandardAI, hasBasicAI, aiLevel } = useAIPermission();

    const insertEmotionTag = (tag) => {
        const cursorPos = document.getElementById('audio-script-textarea')?.selectionStart || audioScript?.length || 0;
        const before = audioScript?.substring(0, cursorPos) || '';
        const after = audioScript?.substring(cursorPos) || '';
        onAudioScriptChange(before + ' ' + tag + ' ' + after);
    };

    return (
        <div className="space-y-6">
            {/* Visual Media Section */}
            <div className="bg-gradient-to-br from-fuchsia-50 to-pink-50 p-6 rounded-xl border border-fuchsia-100">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-white rounded-full shadow-sm text-fuchsia-600">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1" dir="rtl">
                        <h3 className="font-bold text-slate-800 text-lg mb-1">מדיה ויזואלית (AI)</h3>
                        <p className="text-slate-600 text-sm">
                            העשר את התוכן עם תמונה או אינפוגרפיקה שנוצרה ע"י בינה מלאכותית.
                        </p>
                        <p className="text-amber-600 text-xs mt-2 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            💡 שים לב: הפקת אודיו עשויה לייצר גם תמונה אם קיים פרומפט כאן. רוקן את השדה למניעת הפקת תמונה.
                        </p>
                        {aiLevel === 'none' && (
                            <Badge className="mt-2 bg-amber-500 hover:bg-amber-600 text-white">
                                זמין בחבילת פרו ומעלה
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-fuchsia-700 font-bold">פרומפט ליצירת תמונה (באנגלית)</Label>
                        <div className="flex gap-2">
                            <AIPermissionGuard requiredLevel="basic" featureName="שיפור פרומפט">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={onPromptSuggest}
                                    disabled={isGeneratingPrompt}
                                    className="h-7 text-xs bg-white border-fuchsia-200 text-fuchsia-700 hover:bg-fuchsia-50"
                                >
                                    {isGeneratingPrompt ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Wand2 className="w-3 h-3 mr-1" />}
                                    שפר פרומפט
                                </Button>
                            </AIPermissionGuard>
                            <AIPermissionGuard requiredLevel="standard" featureName="יצירת תמונה">
                                <Button 
                                    type="button" 
                                    size="sm"
                                    onClick={onMediaGenerate}
                                    disabled={isGeneratingMedia || !mediaPrompt}
                                    className="h-7 text-xs bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
                                >
                                    {isGeneratingMedia ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Palette className="w-3 h-3 mr-1" />}
                                    הפק תמונה
                                </Button>
                            </AIPermissionGuard>
                        </div>
                    </div>
                    <Textarea
                        value={mediaPrompt}
                        onChange={(e) => onMediaPromptChange(e.target.value)}
                        rows={2}
                        placeholder="Describe the image you want to create..."
                        dir="ltr"
                        className="bg-white font-mono text-sm border-fuchsia-200 focus:ring-fuchsia-500"
                        disabled={aiLevel === 'none'}
                    />
                    {mediaUrl && (
                        <div className="relative mt-2 bg-white p-2 rounded-lg border border-fuchsia-100 flex justify-center group">
                            <img src={mediaUrl} alt="Generated Media" className="max-h-64 rounded shadow-sm object-contain" />
                            <Button 
                                type="button"
                                variant="ghost" 
                                size="icon"
                                className="absolute top-2 right-2 text-red-500 bg-white/80 hover:bg-white hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={onMediaClear}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Audio Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-white rounded-full shadow-sm text-indigo-600">
                        <Mic className="w-6 h-6" />
                    </div>
                    <div className="flex-1" dir="rtl">
                        <h3 className="font-bold text-slate-800 text-lg mb-1">הנחיה קולית (AI)</h3>
                        <p className="text-slate-600 text-sm">
                            צור חווית למידה אישית עם הנחיה קולית המופקת ע"י בינה מלאכותית.
                        </p>
                        {aiLevel === 'none' && (
                            <Badge className="mt-2 bg-amber-500 hover:bg-amber-600 text-white">
                                זמין בחבילת פרו ומעלה
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Voice Picker */}
                    {!hideVoicePicker && (
                        <div className="space-y-2">
                            <Label className="text-indigo-700 font-bold flex items-center gap-2">
                                <Volume2 className="w-4 h-4" />
                                בחירת קול
                            </Label>
                            <Select 
                                value={voiceId || '9BWtsMINqrJLrRacOk9x'} 
                                onValueChange={onVoiceIdChange}
                                disabled={aiLevel === 'none'}
                            >
                                <SelectTrigger className="bg-white border-indigo-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {VOICE_OPTIONS.map((voice) => (
                                        <SelectItem 
                                            key={voice.id} 
                                            value={voice.id}
                                            disabled={voice.premium && !hasPremiumAI}
                                        >
                                            <div className="flex items-center justify-between w-full gap-3">
                                                <span className="font-medium">{voice.name}</span>
                                                <span className="text-xs text-slate-500">{voice.description}</span>
                                                {voice.premium && !hasPremiumAI && (
                                                    <Badge className="bg-amber-500 text-white text-[9px] px-1.5">פרימיום</Badge>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Stability Slider */}
                    {!hideVoicePicker && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-sm text-indigo-700">יציבות הקול</Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="w-3 h-3 text-slate-400 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent dir="rtl" className="max-w-xs">
                                            <p className="text-xs">0.0 = יצירתי ומגוון | 0.5 = מאוזן | 1.0 = יציב ועקבי</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Slider
                                value={[stability * 100]}
                                onValueChange={(val) => onStabilityChange(val[0] / 100)}
                                max={100}
                                step={5}
                                className="py-2"
                                disabled={aiLevel === 'none'}
                            />
                            <div className="flex justify-between text-[10px] text-slate-500">
                                <span>יצירתי</span>
                                <span className="font-bold">{stability?.toFixed(1) || '0.5'}</span>
                                <span>יציב</span>
                            </div>
                        </div>
                    )}

                    {/* Script Editor */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label className="text-indigo-700 font-bold">תמליל להקראה</Label>
                            <AIPermissionGuard requiredLevel="basic" featureName="יצירת תמליל אוטומטי">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={onScriptGenerate}
                                    disabled={isGeneratingScript}
                                    className="h-8 gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                >
                                    {isGeneratingScript ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                    הצע תמליל אוטומטי
                                </Button>
                            </AIPermissionGuard>
                        </div>
                        
                        {/* Emotion Tag Shortcuts */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {EMOTION_TAGS.map((emotion) => (
                                <TooltipProvider key={emotion.tag}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-6 px-2 text-xs border-indigo-100 hover:bg-indigo-50"
                                                onClick={() => insertEmotionTag(emotion.tag)}
                                                disabled={aiLevel === 'none'}
                                            >
                                                <emotion.icon className={`w-3 h-3 ${emotion.color}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent dir="rtl" className="text-xs">
                                            <div className="font-bold">{emotion.label}</div>
                                            <div className="text-slate-400">{emotion.desc}</div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>

                        <Textarea 
                            id="audio-script-textarea"
                            value={audioScript}
                            onChange={(e) => onAudioScriptChange(e.target.value)}
                            placeholder="כתוב כאן את מה שתרצה שהמורה הווירטואלי יאמר... השתמש בתגיות רגש כמו [excited] או [whispers]"
                            className="min-h-[140px] bg-white resize-none"
                            dir="rtl"
                            disabled={aiLevel === 'none'}
                        />
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Info className="w-3 h-3" />
                            <span>כתוב באופן טבעי, כמו שהיית מדבר. השתמש בסימני פיסוק ובתגיות רגש.</span>
                        </div>
                    </div>

                    {/* Audio Preview & Generate */}
                    <div className="flex justify-between items-center pt-4 border-t border-indigo-100">
                        <div className="flex-1">
                            {audioUrl && (
                                <div className="max-w-[300px]">
                                    <AudioPlayer 
                                        key={audioUrl} 
                                        src={audioUrl} 
                                        title="תצוגה מקדימה" 
                                        minimal 
                                    />
                                </div>
                            )}
                            {!entityId && (
                                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 inline-block mt-2">
                                    * שמור תחילה כדי להפיק אודיו
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <AIPermissionGuard requiredLevel="standard" featureName="הפקת אודיו AI">
                                <Button 
                                    type="button" 
                                    onClick={onAudioGenerate}
                                    disabled={isGeneratingAudio || !audioScript || !entityId}
                                    className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                                >
                                    {isGeneratingAudio ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            מפיק...
                                        </>
                                    ) : (
                                        <>
                                            <PlayCircle className="w-4 h-4 mr-2" />
                                            הפק אודיו
                                        </>
                                    )}
                                </Button>
                            </AIPermissionGuard>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Content Guidelines */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-lg border border-violet-200">
                <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2 text-sm">
                        <h4 className="font-bold text-violet-900">כללי זהב לתוכן AI איכותי:</h4>
                        <ul className="text-slate-700 space-y-1 text-xs pr-3">
                            <li className="flex items-start gap-2">
                                <span className="text-violet-600 font-bold">•</span>
                                <span><strong>אודיו:</strong> כתוב כמו שמדברים. השתמש בסימני פיסוק ובתגיות רגש.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-violet-600 font-bold">•</span>
                                <span><strong>תמונות:</strong> פרומפט באנגלית, תיאורי ומפורט. הימנע מבקשות לטקסט בתמונה.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-violet-600 font-bold">•</span>
                                <span><strong>איכות:</strong> ככל שתשקיע יותר במחשבה על התוכן, כך התוצאה תהיה מרשימה יותר.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function insertEmotionTag(tag) {
    // This is a helper that should be passed from parent
    // For now, it's defined in component scope above
}