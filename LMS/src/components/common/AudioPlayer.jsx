import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, Download, RefreshCw, AudioWaveform, Image } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AudioPlayer({ src, title, autoPlay = false, minimal = false, coverImage = null, transcript = null }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (autoPlay && audioRef.current) {
            audioRef.current.play().catch(e => console.log("Autoplay blocked", e));
        }
    }, [src, autoPlay]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const total = audioRef.current.duration;
            setProgress((current / total) * 100);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSliderChange = (value) => {
        if (audioRef.current) {
            const newTime = (value[0] / 100) * duration;
            audioRef.current.currentTime = newTime;
            setProgress(value[0]);
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!src) return null;

    if (minimal) {
        return (
            <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1.5 border border-slate-200">
                <audio 
                    ref={audioRef} 
                    src={src} 
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white"
                    onClick={togglePlay}
                >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </Button>
                <div className="flex flex-col min-w-[80px]">
                    <span className="text-xs font-medium text-slate-700">{title || 'הנחיה קולית'}</span>
                    <span className="text-[10px] text-slate-500">
                        {formatTime(audioRef.current?.currentTime || 0)} / {formatTime(duration)}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
            <audio 
                ref={audioRef} 
                src={src} 
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
            />
            
            {/* Cover Image (if provided) */}
            {coverImage && (
                <div className="relative w-full aspect-video bg-gradient-to-br from-indigo-100 to-purple-100">
                    <img 
                        src={coverImage} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 right-3 left-3">
                        <h4 className="font-bold text-white text-lg drop-shadow-lg">{title || 'הנחיה קולית'}</h4>
                    </div>
                </div>
            )}

            <div className="p-4">
                {!coverImage && (
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <AudioWaveform className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800 text-sm">{title || 'הנחיה קולית'}</h4>
                                <p className="text-xs text-slate-500">האזן להסבר המורה</p>
                            </div>
                        </div>
                        {duration > 0 && (
                            <Badge variant="outline" className="font-mono text-xs">
                                {formatTime(duration)}
                            </Badge>
                        )}
                    </div>
                )}

                <div className="space-y-3">
                    <Slider 
                        value={[progress]} 
                        max={100} 
                        step={1} 
                        onValueChange={handleSliderChange}
                        className="cursor-pointer"
                    />
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-10 w-10 rounded-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300"
                                onClick={togglePlay}
                            >
                                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                            </Button>
                            <span className="text-xs font-mono text-slate-500 w-12">
                                {formatTime(audioRef.current?.currentTime || 0)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={toggleMute}>
                                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </Button>
                            {transcript && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-slate-400 hover:text-slate-600"
                                    onClick={() => {
                                        const blob = new Blob([transcript], { type: 'text/plain' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = 'transcript.txt';
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    }}
                                    title="הורד תמליל"
                                >
                                    <Download className="w-4 h-4" />
                                </Button>
                            )}
                            <a href={src} download target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600" title="הורד אודיו">
                                    <Download className="w-4 h-4" />
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}