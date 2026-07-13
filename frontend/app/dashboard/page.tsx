'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import DebateCard from '@/app/components/debate/DebateCard';
import PostList from '@/app/components/debate/PostList';
import ArgumentComposer from '@/app/components/debate/ArgumentComposer';
import Scoreboard from '@/app/components/debate/Scoreboard';
import { useDebateRealtime } from '@/hooks/useDebateRealtime';
import { PostRead } from '@/types/post';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LayoutDashboard, BarChart3, MessageSquare, Loader2, Plus, X, Activity, Trophy, TrendingUp } from 'lucide-react';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileCard from '@/app/components/ProfileCard';

const GraphView = dynamic(() => import('./GraphView'), { 
    ssr: false,
    loading: () => (
        <div className="py-20 text-center flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Rendering combat map...</p>
        </div>
    )
});

/**
 * Main content component for the dashboard.
 * Handles fetching debate data, posts, scoreboard, user participation, and real-time updates via WebSockets.
 * Manages UI state for argument composition, view toggling (feed/graph), and notifications.
 */
function DashboardContent() {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    // Get a post ID from URL parameters for scrolling into view (e.g., from a notification click).
    const scrollToId = searchParams.get('scrollTo');
    // Optional debate ID for browsing an archived battle (from the History page).
    const archiveId = searchParams.get('debate');
    
    // State to hold the list of posts in the current debate.
    const [posts, setPosts] = useState<PostRead[]>([]);
    // State to toggle between 'feed' (list of posts) and 'graph' (visualization) views.
    const [view, setView] = useState<'feed' | 'graph'>('feed');
    // State to hold the current scoreboard data (PRO/CON scores and participant counts).
    const [scoreboard, setScoreboard] = useState({ pro_score: 0, con_score: 0, pro_count: 0, con_count: 0 });
    // State to control the visibility of the argument composer modal.
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    // State to store the ID of the post being replied to, if any.
    const [replyToId, setReplyToId] = useState<number | null>(null);
    // State to store recent live activities in the debate.
    const [activities, setActivities] = useState<any[]>([]);

    // Fetches the currently active debate, or a specific archived one when
    // arriving from the History page (?debate=<id>).
    const { data: debate, isLoading: isDebateLoading } = useQuery({
        queryKey: ['activeDebate', archiveId],
        queryFn: async () => {
            const res = await api.get(archiveId ? `/debates/${archiveId}` : '/debates/active');
            return res.data;
        }
    });
    const isArchived = !!debate && debate.status !== 'active';

    // Fetches the current user's participation status in the active debate.
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

    // Fetches the initial list of posts for the active debate.
    const { data: initialPosts, isLoading: isPostsLoading } = useQuery({
        queryKey: ['posts', debate?.id],
        queryFn: async () => {
            const res = await api.get(`/debates/${debate.id}/posts`);
            return res.data;
        },
        enabled: !!debate?.id
    });

    // Fetches the global leaderboard data.
    const { data: leaderboard } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            const res = await api.get('/users/leaderboard');
            return res.data;
        }
    });

    // Fetches the initial scoreboard data for the active debate.
    const { data: initialScoreboard } = useQuery({
        queryKey: ['scoreboard', debate?.id],
        queryFn: async () => {
            const res = await api.get(`/debates/${debate.id}/scoreboard`);
            return res.data;
        },
        enabled: !!debate?.id
    });

    // Update posts state when initialPosts data changes.
    useEffect(() => {
        if (initialPosts) setPosts(initialPosts);
    }, [initialPosts]);

    // Update scoreboard state when initialScoreboard data changes.
    useEffect(() => {
        if (initialScoreboard) setScoreboard(initialScoreboard);
    }, [initialScoreboard]);

    // Handles initial scroll to a specific post (e.g., from a notification link).
    useEffect(() => {
        if (!isPostsLoading && scrollToId && posts.length > 0) {
            const timer = setTimeout(() => {
                const element = document.getElementById(`post-${scrollToId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Add a temporary highlight to the scrolled element.
                    element.classList.add('ring-2', 'ring-brand-500', 'ring-offset-4', 'dark:ring-offset-zinc-950', 'transition-all');
                    setTimeout(() => {
                        element.classList.remove('ring-2', 'ring-brand-500', 'ring-offset-4', 'dark:ring-offset-zinc-950');
                    }, 3000);
                }
            }, 500); // Small delay to ensure rendering is complete.
            return () => clearTimeout(timer); // Cleanup timer.
        }
    }, [isPostsLoading, scrollToId, posts]);

    /**
     * Callback function to handle various real-time events received from the WebSocket.
     * Updates local state (`posts`, `activities`, `scoreboard`) based on the event type.
     * @param {any} event - The WebSocket event object.
     */
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

    // Subscribe to Supabase Realtime for live updates.
    useDebateRealtime(debate?.id, onWebSocketEvent);

    // Mutation for submitting new arguments or rebuttals.
    const postMutation = useMutation({
        mutationFn: async (data: any) => {
            return api.post(`/debates/${debate.id}/posts`, data);
        },
        onSuccess: () => {
            setIsComposerOpen(false);
            setReplyToId(null);
        }
    });

    // Mutation for voting on a post. Includes optimistic UI update.
    const voteMutation = useMutation({
        mutationFn: async ({ postId, value }: { postId: number, value: number }) => {
            return api.post(`/debates/${debate.id}/posts/${postId}/vote`, null, {
                params: { value }
            });
        },
        onMutate: async ({ postId, value }) => {
            // Optimistically update the post's vote count and user's vote.
            setPosts(prev => prev.map(p => {
                if (p.id === postId) {
                    const oldVote = p.user_vote || 0;
                    const newVote = oldVote === value ? 0 : value; // Toggle vote
                    
                    let upDiff = 0; 
                    let downDiff = 0;

                    // Adjust upvote/downvote counts based on old and new votes.
                    if (oldVote === 1) upDiff--; // User is unvoting an upvote
                    if (oldVote === -1) downDiff--; // User is unvoting a downvote
                    if (newVote === 1) upDiff++; // User is upvoting
                    if (newVote === -1) downDiff++; // User is downvoting

                    return { ...p, user_vote: newVote, upvotes: p.upvotes + upDiff, downvotes: p.downvotes + downDiff };
                }
                return p;
            }));
        },
        onSuccess: (res, variables) => {
            // Invalidate queries to refetch leaderboard and user's own data after voting.
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
            queryClient.invalidateQueries({ queryKey: ['me'] });
        }
    });

    // Mutation for a user to join a side in the debate.
    const joinMutation = useMutation({
        mutationFn: async (side: 'PRO' | 'CON') => {
            return api.post(`/debates/${debate.id}/join`, null, {
                params: { side }
            });
        },
        onSuccess: () => {
            // Invalidate participation query to reflect the user's new side.
            queryClient.invalidateQueries({ queryKey: ['participation'] });
            queryClient.invalidateQueries({ queryKey: ['me'] }); // Also refetch user data (might affect profile card)
        }
    });

    // Display loading state for the main debate data.
    if (isDebateLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
                <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">Entering the Arena...</p>
            </div>
        );
    }

    // Display message if no active debate is found.
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
                    
                    {/* Main debate content area (Debate Card, Scoreboard, Posts/Graph View) */}
                    <div className="lg:col-span-8">
                        <DebateCard debate={debate} onJoin={(side) => joinMutation.mutate(side)} currentSide={participation?.side} archived={isArchived} />
                        <Scoreboard proScore={scoreboard.pro_score} conScore={scoreboard.con_score} proCount={scoreboard.pro_count} conCount={scoreboard.con_count} endTime={debate?.end_time} />

                        {/* Posts are visible to participants, and read-only for archived debates */}
                        {(participation || isArchived) && (
                            <div className="mt-8">
                                <div className="flex items-center justify-between mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                    {/* View toggle buttons (Feed/Graph) */}
                                    <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shadow-inner">
                                        <button onClick={() => setView('feed')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'feed' ? 'bg-white dark:bg-zinc-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-zinc-500 hover:text-zinc-700'}`}>
                                            <MessageSquare className="w-3.5 h-3.5" /> Feed
                                        </button>
                                        <button onClick={() => setView('graph')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'graph' ? 'bg-white dark:bg-zinc-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-zinc-500 hover:text-zinc-700'}`}>
                                            <BarChart3 className="w-3.5 h-3.5" /> Graph
                                        </button>
                                    </div>
                                    {/* Button to open argument composer (hidden for archived debates) */}
                                    {!isArchived && (
                                        <Button size="sm" onClick={() => setIsComposerOpen(true)} className="h-10 rounded-xl px-4 gap-2">
                                            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Post Argument</span>
                                        </Button>
                                    )}
                                </div>

                                {/* Conditional rendering for post list or graph view */}
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

                    {/* Sidebar content (Profile Card, Live Activity, Leaderboard, Pro Tip) */}
                    <div className="lg:col-span-4 space-y-8">
                        <ProfileCard />
                        {/* Live Activity Feed Card */}
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
                        {/* Elite Warriors Leaderboard Card */}
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
                        {/* Pro Tip Card */}
                        <Card className="p-6 bg-brand-600 text-white border-none">
                            <TrendingUp className="w-6 h-6 mb-4 text-brand-200" />
                            <h4 className="text-sm font-black uppercase tracking-widest mb-2 italic">Pro Tip</h4>
                            <p className="text-[11px] text-brand-100 font-medium leading-relaxed">High-quality rebuttals earn you 3x more reputation than simple arguments. Strike where the logic is weak.</p>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Argument Composer Modal */}
            {/* Argument Composer Modal */}
            <AnimatePresence>
                {isComposerOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Overlay backdrop */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsComposerOpen(false)} className="absolute inset-0 bg-zinc-950/20 backdrop-blur-sm" />
                        {/* Composer content */}
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-lg relative z-10">
                            <div className="flex justify-end mb-2">
                                {/* Close button for the composer */}
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

/**
 * Entry point for the Dashboard page.
 * Wraps the DashboardContent with a Suspense fallback for initial loading states.
 */
export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
                <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">Loading Arena...</p>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
