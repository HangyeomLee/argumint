'use client';
import { Badge } from '@/app/components/ui/Badge';
import { Clock } from 'lucide-react'; // TrendingUp, TrendingDown, Zap are not used. Should be removed later.
import { useState, useEffect } from 'react';
import { intervalToDuration } from 'date-fns';

/**
 * Props for the Scoreboard component.
 */
interface ScoreboardProps {
    /** The current score for the 'PRO' side. */
    proScore: number;
    /** The current score for the 'CON' side. */
    conScore: number;
    /** The number of participants on the 'PRO' side. */
    proCount: number;
    /** The number of participants on the 'CON' side. */
    conCount: number;
    /** Optional: The end time of the debate as an ISO string, used for the countdown timer. */
    endTime?: string;
}

/**
 * Displays the current state of a debate, including scores for PRO and CON sides,
 * a countdown timer (if an end time is provided), and a status message based on score differences.
 */
export default function Scoreboard({ proScore, conScore, proCount, conCount, endTime }: ScoreboardProps) {
    const [timeLeft, setTimeLeft] = useState<string>('00:00:00');
    // Calculate total score, ensuring it's at least 1 to avoid division by zero.
    const totalScore = Math.max(1, proScore + conScore);
    // Calculate width percentages for PRO and CON score bars.
    const proWidth = Math.max(0, (proScore / totalScore) * 100);
    const conWidth = Math.max(0, (conScore / totalScore) * 100);

    // Effect for the countdown timer.
    useEffect(() => {
        if (!endTime) return;
        
        const timer = setInterval(() => {
            const now = new Date();
            const end = new Date(endTime);
            
            if (now >= end) {
                // Debate has concluded.
                setTimeLeft('CONCLUDED');
                clearInterval(timer);
            } else {
                // Calculate remaining duration and format it.
                const duration = intervalToDuration({ start: now, end });
                const h = String(duration.hours || 0).padStart(2, '0');
                const m = String(duration.minutes || 0).padStart(2, '0');
                const s = String(duration.seconds || 0).padStart(2, '0');
                setTimeLeft(`${h}:${m}:${s}`);
            }
        }, 1000); // Update every second.

        // Cleanup function to clear the interval when the component unmounts or endTime changes.
        return () => clearInterval(timer);
    }, [endTime]); // Re-run effect if endTime changes.

    /**
     * Determines a status message based on the current score difference.
     * @returns {string} A message indicating the debate's current momentum.
     */
    const getStatusMessage = () => {
        if (proScore > conScore * 1.5) return "PRO IS DOMINATING";
        if (conScore > proScore * 1.5) return "CON IS DOMINATING";
        // If scores are within 10% of total score, it's a "DEAD HEAT".
        if (Math.abs(proScore - conScore) < totalScore * 0.1) return "DEAD HEAT";
        return "BATTLE INTENSIFYING";
    };

    return (
        <div className="mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-y border-zinc-100 dark:border-zinc-800 py-6">
                
                {/* Debate Status Message */}
                <div className="flex-1 text-center md:text-left">
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-1">Status</div>
                    <h3 className="text-xl font-black uppercase italic text-brand-600 dark:text-brand-400 leading-none">
                        {getStatusMessage()}
                    </h3>
                </div>

                {/* Countdown Timer - Central display piece */}
                <div className="flex flex-col items-center px-8 border-x border-zinc-100 dark:border-zinc-800">
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-1">Time Left</div>
                    <div className="text-4xl md:text-5xl font-black tabular-nums text-zinc-900 dark:text-white tracking-tighter flex items-center gap-3">
                        <Clock className="w-8 h-8 text-zinc-900 dark:text-white" />
                        {timeLeft}
                    </div>
                </div>

                {/* Global Momentum (PRO vs CON percentage) */}
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
            
            {/* Score Visualization Bar */}
            <div className="relative">
                <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex shadow-inner">
                    {/* PRO side score bar */}
                    <div 
                        className="h-full bg-support-main transition-all duration-1000 ease-out relative" 
                        style={{ width: `${proWidth}%` }}
                    >
                        {/* Animated glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-pulse"></div>
                    </div>
                    {/* CON side score bar */}
                    <div 
                        className="h-full bg-oppose-main transition-all duration-1000 ease-out relative" 
                        style={{ width: `${conWidth}%` }}
                    >
                        {/* Animated glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/20 animate-pulse"></div>
                    </div>
                </div>
                {/* Center divider marker */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-1 bg-white dark:bg-zinc-950 z-10 shadow-sm"></div>
            </div>
        </div>
    );
}
