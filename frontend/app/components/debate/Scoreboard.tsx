'use client';
import { Badge } from '@/app/components/ui/Badge';
import { Clock, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDuration, intervalToDuration } from 'date-fns';

interface ScoreboardProps {
    proScore: number;
    conScore: number;
    proCount: number;
    conCount: number;
    endTime?: string;
}

export default function Scoreboard({ proScore, conScore, proCount, conCount, endTime }: ScoreboardProps) {
    const [timeLeft, setTimeLeft] = useState<string>('00:00:00');
    const totalScore = Math.max(1, (proScore || 0) + (conScore || 0));
    const proWidth = Math.max(0, (proScore / totalScore) * 100);
    const conWidth = Math.max(0, (conScore / totalScore) * 100);

    useEffect(() => {
        if (!endTime) return;
        
        const timer = setInterval(() => {
            const now = new Date();
            const end = new Date(endTime);
            if (now >= end) {
                setTimeLeft('CONCLUDED');
                clearInterval(timer);
            } else {
                const duration = intervalToDuration({ start: now, end });
                const h = String(duration.hours || 0).padStart(2, '0');
                const m = String(duration.minutes || 0).padStart(2, '0');
                const s = String(duration.seconds || 0).padStart(2, '0');
                setTimeLeft(`${h}:${m}:${s}`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    const getStatusMessage = () => {
        if (proScore > conScore * 1.5) return "PRO IS DOMINATING";
        if (conScore > proScore * 1.5) return "CON IS DOMINATING";
        if (Math.abs(proScore - conScore) < totalScore * 0.1) return "DEAD HEAT";
        return "BATTLE INTENSIFYING";
    };

    return (
        <div className="mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-y border-zinc-100 dark:border-zinc-800 py-6">
                
                {/* Status Message */}
                <div className="flex-1 text-center md:text-left">
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-1">Status</div>
                    <h3 className="text-xl font-black uppercase italic text-brand-600 dark:text-brand-400 leading-none">
                        {getStatusMessage()}
                    </h3>
                </div>

                {/* BIG BOLD TIMER - CENTRAL PIECE */}
                <div className="flex flex-col items-center px-8 border-x border-zinc-100 dark:border-zinc-800">
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-1">Time Left</div>
                    <div className="text-4xl md:text-5xl font-black tabular-nums text-zinc-900 dark:text-white tracking-tighter flex items-center gap-3">
                        <Clock className="w-8 h-8 text-zinc-900 dark:text-white" />
                        {timeLeft}
                    </div>
                </div>

                {/* Global Momentum */}
                <div className="flex-1 flex justify-center md:justify-end gap-8">
                    <div className="text-center">
                        <div className="text-[10px] font-black text-support-text uppercase tracking-widest mb-1">PRO</div>
                        <div className="text-2xl font-black text-zinc-900 dark:text-white tabular-nums leading-none">{proWidth.toFixed(0)}%</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[10px] font-black text-oppose-text uppercase tracking-widest mb-1">CON</div>
                        <div className="text-2xl font-black text-zinc-900 dark:text-white tabular-nums leading-none">{conWidth.toFixed(0)}%</div>
                    </div>
                </div>
            </div>
            
            <div className="relative">
                <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex shadow-inner">
                    <div 
                        className="h-full bg-support-main transition-all duration-1000 ease-out relative" 
                        style={{ width: `${proWidth}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-pulse"></div>
                    </div>
                    <div 
                        className="h-full bg-oppose-main transition-all duration-1000 ease-out relative" 
                        style={{ width: `${conWidth}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/20 animate-pulse"></div>
                    </div>
                </div>
                {/* Center marker */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-1 bg-white dark:bg-zinc-950 z-10 shadow-sm"></div>
            </div>
        </div>
    );
}
