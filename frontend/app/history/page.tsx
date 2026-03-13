'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { Card } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { History, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function HistoryPage() {
    const { data: debates, isLoading } = useQuery({
        queryKey: ['debateHistory'],
        queryFn: async () => {
            const res = await api.get('/debates/history');
            return res.data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
                <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">Restoring Archives...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="flex items-center gap-3 mb-12">
                <div className="p-2.5 bg-zinc-900 dark:bg-zinc-800 rounded-xl shadow-lg">
                    <History className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase text-zinc-900 dark:text-white leading-none italic">Archives</h2>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Previous Battles</p>
                </div>
            </div>
            
            <div className="grid gap-6">
                {!debates || debates.length === 0 ? (
                    <div className="bg-zinc-100/50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-20 text-center">
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">The archives are empty. Daily battles are yet to be archived.</p>
                    </div>
                ) : (
                    debates.map((debate: any) => (
                        <Card key={debate.id} hover className="group p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Concluded {format(new Date(debate.end_time), 'MMMM d, yyyy')}
                                </div>
                                <Badge variant="neutral">Archived</Badge>
                            </div>

                            <h2 className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic mb-3">
                                {debate.title}
                            </h2>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium line-clamp-2 mb-8 leading-relaxed">
                                {debate.description}
                            </p>
                            
                            <div className="flex justify-between items-center pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                <div className="flex gap-4">
                                    <div className="text-center">
                                        <div className="text-lg font-black text-zinc-900 dark:text-white leading-none mb-0.5 italic">128</div>
                                        <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Posts</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-black text-zinc-900 dark:text-white leading-none mb-0.5 italic">512</div>
                                        <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Likes</div>
                                    </div>
                                </div>
                                <Link href={`/dashboard?debate=${debate.id}`}>
                                    <Button variant="outline" size="sm" className="gap-2 rounded-xl group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-all">
                                        Explore Archive
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
