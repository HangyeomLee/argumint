'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import DebateCard from '@/app/components/debate/DebateCard';
import PostList from '@/app/components/debate/PostList';
import ArgumentComposer from '@/app/components/debate/ArgumentComposer';
import Scoreboard from '@/app/components/debate/Scoreboard';
import GraphView from './GraphView';
import { useWebSocket } from '@/hooks/useWebSocket';
import { PostRead } from '@/types/post';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LayoutDashboard, BarChart3, MessageSquare, Zap, Loader2, Plus, X, Activity, Trophy, TrendingUp } from 'lucide-react';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileCard from '@/app/components/ProfileCard';

export default function DashboardPage() {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const scrollToId = searchParams.get('scrollTo');
    
    const [posts, setPosts] = useState<PostRead[]>([]);
    const [view, setView] = useState<'feed' | 'graph'>('feed');
    const [scoreboard, setScoreboard] = useState({ pro_score: 0, con_score: 0, pro_count: 0, con_count: 0 });
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [replyToId, setReplyToId] = useState<number | null>(null);
    const [activities, setActivities] = useState<any[]>([]);

    const { data: debate, isLoading: isDebateLoading } = useQuery({
        queryKey: ['activeDebate'],
        queryFn: async () => {
            const res = await api.get('/debates/active');
            return res.data;
        }
    });

    const { data: participation } = useQuery({
        queryKey: ['participation', debate?.id],
        queryFn: async () => {
            if (!debate?.id) return null;
            try {
                const res = await api.get(`/debates/${debate.id}/participation`);
                return res.data;
            } catch (e) {
                return null;
            }
        },
        enabled: !!debate?.id
    });

    const { data: initialPosts, isLoading: isPostsLoading } = useQuery({
        queryKey: ['posts', debate?.id],
        queryFn: async () => {
            const res = await api.get(`/debates/${debate.id}/posts`);
            return res.data;
        },
        enabled: !!debate?.id
    });

    const { data: leaderboard } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            const res = await api.get('/users/leaderboard');
            return res.data;
        }
    });

    const { data: initialScoreboard } = useQuery({
        queryKey: ['scoreboard', debate?.id],
        queryFn: async () => {
            const res = await api.get(`/debates/${debate.id}/scoreboard`);
            return res.data;
        },
        enabled: !!debate?.id
    });

    useEffect(() => {
        if (initialPosts) setPosts(initialPosts);
    }, [initialPosts]);

    useEffect(() => {
        if (initialScoreboard) setScoreboard(initialScoreboard);
    }, [initialScoreboard]);

    // Handle initial scroll from notification
    useEffect(() => {
        if (!isPostsLoading && scrollToId && posts.length > 0) {
            const timer = setTimeout(() => {
                const element = document.getElementById(`post-${scrollToId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('ring-2', 'ring-brand-500', 'ring-offset-4', 'dark:ring-offset-zinc-950', 'transition-all');
                    setTimeout(() => {
                        element.classList.remove('ring-2', 'ring-brand-500', 'ring-offset-4', 'dark:ring-offset-zinc-950');
                    }, 3000);
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isPostsLoading, scrollToId, posts]);

    const onWebSocketEvent = useCallback((event: any) => {
        if (event.type === 'post_created') {
            setPosts(prev => {
                if (prev.some(p => p.id === event.payload.id)) return prev;
                return [...prev, event.payload];
            });
            setActivities(prev => [{ username: event.payload.username, action: 'posted', target: 'an argument', id: Date.now() }, ...prev].slice(0, 10));
        } else if (event.type === 'post_voted') {
            setPosts(prev => prev.map(p => 
                p.id === event.payload.post_id 
                    ? { ...p, upvotes: event.payload.upvotes, downvotes: event.payload.downvotes }
                    : p
            ));
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        } else if (event.type === 'scoreboard_updated') {
            setScoreboard(event.payload);
        } else if (event.type === 'live_activity') {
            setActivities(prev => [{ ...event.payload, id: Date.now() }, ...prev].slice(0, 10));
        }
    }, [queryClient]);

    useWebSocket(debate?.id, onWebSocketEvent);

    const postMutation = useMutation({
        mutationFn: async (data: any) => {
            return api.post(`/debates/${debate.id}/posts`, data);
        },
        onSuccess: () => {
            setIsComposerOpen(false);
            setReplyToId(null);
        }
    });

    const voteMutation = useMutation({
        mutationFn: async ({ postId, value }: { postId: number, value: number }) => {
            return api.post(`/debates/${debate.id}/posts/${postId}/vote`, null, {
                params: { value }
            });
        },
        onMutate: async ({ postId, value }) => {
            setPosts(prev => prev.map(p => {
                if (p.id === postId) {
                    const oldVote = p.user_vote || 0;
                    const newVote = oldVote === value ? 0 : value;
                    let upDiff = 0; let downDiff = 0;
                    if (oldVote === 1) upDiff--;
                    if (oldVote === -1) downDiff--;
                    if (newVote === 1) upDiff++;
                    if (newVote === -1) downDiff++;
                    return { ...p, user_vote: newVote, upvotes: p.upvotes + upDiff, downvotes: p.downvotes + downDiff };
                }
                return p;
            }));
        },
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
            queryClient.invalidateQueries({ queryKey: ['me'] });
        }
    });

    const joinMutation = useMutation({
        mutationFn: async (side: 'PRO' | 'CON') => {
            return api.post(`/debates/${debate.id}/join`, null, {
                params: { side }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['participation'] });
        }
    });

    if (isDebateLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
                <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">Entering the Arena...</p>
            </div>
        );
    }

    if (!debate) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4">
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-4xl">😴</div>
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">The Arena is Dormant</h2>
                    <p className="text-zinc-500 font-medium">No active debate today. Check back soon for the next battle of ideas.</p>
                </div>
                <Link href="/history">
                    <Button variant="outline">View Previous Battles</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    
                    <div className="lg:col-span-8">
                        <DebateCard debate={debate} onJoin={(side) => joinMutation.mutate(side)} currentSide={participation?.side} />
                        <Scoreboard proScore={scoreboard.pro_score} conScore={scoreboard.con_score} proCount={scoreboard.pro_count} conCount={scoreboard.con_count} endTime={debate?.end_time} />

                        {participation && (
                            <div className="mt-8">
                                <div className="flex items-center justify-between mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                    <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shadow-inner">
                                        <button onClick={() => setView('feed')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'feed' ? 'bg-white dark:bg-zinc-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-zinc-500 hover:text-zinc-700'}`}>
                                            <MessageSquare className="w-3.5 h-3.5" /> Feed
                                        </button>
                                        <button onClick={() => setView('graph')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'graph' ? 'bg-white dark:bg-zinc-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-zinc-500 hover:text-zinc-700'}`}>
                                            <BarChart3 className="w-3.5 h-3.5" /> Graph
                                        </button>
                                    </div>
                                    <Button size="sm" onClick={() => setIsComposerOpen(true)} className="h-10 rounded-xl px-4 gap-2">
                                        <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Post Argument</span>
                                    </Button>
                                </div>

                                {isPostsLoading ? (
                                    <div className="py-20 text-center flex flex-col items-center gap-4">
                                        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Equipping arguments...</p>
                                    </div>
                                ) : (
                                    view === 'feed' ? (
                                        <PostList posts={posts} onVote={(postId, value) => voteMutation.mutate({ postId, value })} onReply={(data) => { setReplyToId(data.parent_post_id); setIsComposerOpen(true); }} isSubmitting={postMutation.isPending} />
                                    ) : (
                                        <GraphView posts={posts} />
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        <ProfileCard />
                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Activity className="w-4 h-4 text-brand-600" />
                                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">Live Activity</h4>
                            </div>
                            <div className="space-y-4">
                                <AnimatePresence initial={false}>
                                    {activities.length === 0 ? <p className="text-[10px] font-bold text-zinc-400 uppercase italic">Waiting for combat...</p> : activities.map((act) => (
                                        <motion.div key={act.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} className="flex items-start gap-3 pb-3 border-b border-zinc-50 dark:border-zinc-800 last:border-0">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0"></div>
                                            <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 leading-tight">
                                                <span className="font-black text-zinc-900 dark:text-white uppercase">{act.username}</span> {act.action} {act.target}
                                            </p>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </Card>
                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">Elite Warriors</h4>
                            </div>
                            <div className="space-y-4">
                                {leaderboard?.slice(0, 5).map((user: any, index: number) => (
                                    <div key={user.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-zinc-300 w-4">#{index + 1}</span>
                                            <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-tight">{user.username}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-brand-600 tabular-nums">{user.total_score} pts</span>
                                    </div>
                                ))}
                            </div>
                            <Link href="/leaderboard"><Button variant="ghost" size="sm" className="w-full mt-6 text-[10px] h-8 rounded-lg">View All Rankings</Button></Link>
                        </Card>
                        <Card className="p-6 bg-brand-600 text-white border-none">
                            <TrendingUp className="w-6 h-6 mb-4 text-brand-200" />
                            <h4 className="text-sm font-black uppercase tracking-widest mb-2 italic">Pro Tip</h4>
                            <p className="text-[11px] text-brand-100 font-medium leading-relaxed">High-quality rebuttals earn you 3x more reputation than simple arguments. Strike where the logic is weak.</p>
                        </Card>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isComposerOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsComposerOpen(false)} className="absolute inset-0 bg-zinc-950/20 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-lg relative z-10">
                            <div className="flex justify-end mb-2">
                                <button onClick={() => { setIsComposerOpen(false); setReplyToId(null); }} className="p-2 bg-white dark:bg-zinc-900 rounded-full shadow-lg hover:scale-110 transition-transform"><X className="w-5 h-5 text-zinc-500" /></button>
                            </div>
                            <ArgumentComposer parentId={replyToId} onSubmit={(data) => postMutation.mutate(data)} onCancel={() => { setIsComposerOpen(false); setReplyToId(null); }} isSubmitting={postMutation.isPending} autoFocus />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
