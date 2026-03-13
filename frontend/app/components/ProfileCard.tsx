'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card } from './ui/Card';
import { getTier } from '@/lib/tiers';
import TierIcon from './TierIcon';

export default function ProfileCard() {
    const { data: user, isLoading } = useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const res = await api.get('/users/me');
            return res.data;
        }
    });

    if (isLoading || !user) return (
        <Card className="p-6 animate-pulse bg-zinc-50 dark:bg-zinc-900 border-none">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
                <div className="space-y-2">
                    <div className="w-24 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    <div className="w-16 h-2 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                </div>
            </div>
        </Card>
    );

    const tier = getTier(user.total_score);

    return (
        <Card className="p-6 border-none shadow-premium bg-white dark:bg-zinc-900 relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-6">
                <TierIcon tier={tier} size="md" />
                <div>
                    <h3 className="text-base font-black uppercase tracking-tight text-zinc-900 dark:text-white leading-none mb-1.5">
                        {user.username}
                    </h3>
                    <div className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                        <span className="text-zinc-400">Level {tier.level}</span>
                        <div className="h-1 w-1 rounded-full bg-zinc-300" />
                        <span className={tier.color.replace('text-white', 'text-brand-600')}>{tier.name}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-sm text-center">
                    <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Reputation</div>
                    <div className="text-xl font-black text-brand-600 tabular-nums leading-none">{user.total_score}</div>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-sm text-center">
                    <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Goal</div>
                    <div className="text-xl font-black text-zinc-900 dark:text-white tabular-nums leading-none">
                        {tier.nextPoints > 0 ? tier.nextPoints : 'MAX'}
                    </div>
                </div>
            </div>
        </Card>
    );
}
