'use client';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';
import { Calendar, Info, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface DebateTopic {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    status: string;
}

interface DebateCardProps {
    debate: DebateTopic;
    onJoin: (side: 'PRO' | 'CON') => void;
    currentSide?: 'PRO' | 'CON';
}

export default function DebateCard({ debate, onJoin, currentSide }: DebateCardProps) {
    return (
        <div className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="primary" className="text-[10px]">Active Battle</Badge>
                <div className="flex items-center gap-1 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                    <Calendar className="w-3 h-3" />
                    Started {format(new Date(debate.start_time), 'MMM d, h:mm a')}
                </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-zinc-900 dark:text-white mb-4 leading-none uppercase italic">
                {debate.title}
            </h1>

            <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium leading-relaxed mb-8 max-w-2xl">
                {debate.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
                {!currentSide ? (
                    <div className="flex flex-wrap gap-3">
                        <Button 
                            variant="support"
                            size="sm"
                            onClick={() => onJoin('PRO')}
                            className="h-12 px-8 rounded-xl text-xs"
                        >
                            🛡️ Support
                        </Button>
                        <Button 
                            variant="oppose"
                            size="sm"
                            onClick={() => onJoin('CON')}
                            className="h-12 px-8 rounded-xl text-xs"
                        >
                            ⚔️ Oppose
                        </Button>
                    </div>
                ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Your Side:</span>
                        <Badge variant={currentSide === 'PRO' ? 'support' : 'oppose'} className="text-xs">
                            {currentSide === 'PRO' ? 'Supporting' : 'Opposing'}
                        </Badge>
                    </div>
                )}
            </div>
        </div>
    );
}
