'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { Trophy, Award, Star, Loader2, User } from 'lucide-react';
import { getTier } from '@/lib/tiers';

export default function LeaderboardPage() {
    const { data: users, isLoading } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            const res = await api.get('/users/leaderboard');
            return res.data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
                <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">Loading Rankings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="flex flex-col items-center text-center mb-16">
                <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl mb-6 shadow-xl shadow-amber-500/10">
                    <Trophy className="w-10 h-10 text-amber-600 fill-amber-600" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4 italic text-zinc-900 dark:text-white">
                    Global Rankings
                </h1>
                <p className="text-zinc-500 font-medium max-w-md">
                    The elite minds of the arena. Your score is a testament to your logical prowess.
                </p>
            </div>
            
            <div className="space-y-4">
                {users?.map((user: any, index: number) => {
                    const isTop3 = index < 3;
                    const tier = getTier(user.total_score);
                    const TierIcon = tier.icon;
                    
                    return (
                        <Card 
                            key={user.id} 
                            hover 
                            className={`flex items-center justify-between transition-all duration-300 ${
                                isTop3 ? 'border-brand-200 bg-white dark:bg-brand-900/5 py-6' : 'py-4 border-zinc-100 dark:border-zinc-800'
                            }`}
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 flex items-center justify-center rounded-xl font-black text-xl italic ${
                                    index === 0 ? 'bg-amber-100 text-amber-600 shadow-md shadow-amber-500/20' : 
                                    index === 1 ? 'bg-slate-100 text-slate-600' : 
                                    index === 2 ? 'bg-orange-100 text-orange-700' : 
                                    'text-zinc-400'
                                }`}>
                                    {index + 1}
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tier.bg} ${tier.color}`}>
                                        <TierIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-black tracking-tight text-zinc-900 dark:text-white uppercase leading-none mb-1">
                                            {user.username}
                                        </div>
                                        <div className={`text-[8px] font-black uppercase tracking-widest ${tier.color}`}>
                                            {tier.name}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-2xl font-black text-brand-600 dark:text-brand-400 tabular-nums leading-none mb-1">
                                    {user.total_score.toLocaleString()}
                                </div>
                                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                    Total Points
                                </div>
                            </div>
                        </Card>
                    );
                })}

                {(!users || users.length === 0) && (
                    <div className="py-20 text-center text-zinc-400 font-bold uppercase tracking-widest italic">
                        The rankings are being calculated...
                    </div>
                )}
            </div>
        </div>
    );
}
