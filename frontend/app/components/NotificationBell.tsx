'use client';
import { useState } from 'react';
import { Bell, MessageCircle, ThumbsUp } from 'lucide-react';
import api from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/Card';
import { formatDistanceToNow } from 'date-fns';
import { useRouter, usePathname } from 'next/navigation';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();
    const pathname = usePathname();

    const { data: notifications } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await api.get('/users/notifications');
            return res.data;
        },
        refetchInterval: 10000 
    });

    const unreadCount = notifications?.filter((n: any) => !n.is_read).length || 0;

    const markReadMutation = useMutation({
        mutationFn: async () => {
            return api.post('/users/notifications/read');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const handleToggle = () => {
        if (!isOpen && unreadCount > 0) {
            markReadMutation.mutate();
        }
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = (postId: number) => {
        setIsOpen(false);
        if (pathname !== '/dashboard') {
            router.push(`/dashboard?scrollTo=${postId}`);
        } else {
            const element = document.getElementById(`post-${postId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add a temporary highlight ring
                element.classList.add('ring-2', 'ring-brand-500', 'ring-offset-4', 'dark:ring-offset-zinc-950', 'transition-all');
                setTimeout(() => {
                    element.classList.remove('ring-2', 'ring-brand-500', 'ring-offset-4', 'dark:ring-offset-zinc-950');
                }, 3000);
            }
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={handleToggle}
                className="p-2 text-zinc-500 hover:text-brand-600 transition-colors relative"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-zinc-950"></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 z-50 origin-top-right"
                        >
                            <Card className="p-0 shadow-premium border-brand-100 overflow-hidden">
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">Alerts</h4>
                                    <span className="text-[8px] font-bold text-zinc-400 uppercase">{unreadCount} New</span>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {!notifications || notifications.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase italic">No signals yet</p>
                                        </div>
                                    ) : (
                                        notifications.map((n: any) => (
                                            <div 
                                                key={n.id} 
                                                onClick={() => handleNotificationClick(n.post_id)}
                                                className={`p-4 border-b border-zinc-50 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${!n.is_read ? 'bg-brand-50/30' : ''}`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`p-1.5 rounded-lg h-fit ${n.type === 'reply' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                                                        {n.type === 'reply' ? <MessageCircle className="w-3 h-3" /> : <ThumbsUp className="w-3 h-3" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 leading-tight">
                                                            <span className="font-black text-zinc-900 dark:text-white uppercase mr-1">{n.sender_username}</span>
                                                            {n.type === 'reply' ? 'rebutted your argument' : 'upvoted your logic'}
                                                        </p>
                                                        <span className="text-[8px] font-bold text-zinc-400 uppercase mt-1 block">
                                                            {formatDistanceToNow(new Date(n.created_at))} ago
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
