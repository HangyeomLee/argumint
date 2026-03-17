'use client';
import { PostRead } from '@/types/post';
import { Card } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { ChevronUp, ChevronDown, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getTier } from '@/lib/tiers';
import TierIcon from '../TierIcon';

/**
 * Props for the PostCard component.
 */
interface PostCardProps {
    /** The post data to display. */
    post: PostRead;
    /** Callback function to handle voting on a post. */
    onVote: (postId: number, value: number) => void;
    /** Callback function to handle initiating a reply to a post. */
    onReply: (postId: number) => void;
    /** Indicates if the card is displaying a rebuttal (influences styling). */
    isRebuttal?: boolean;
}

/**
 * Renders a single post within a debate, including its content, author, voting controls, and a reply option.
 * Displays different styles for 'PRO' and 'CON' sides, and for rebuttals.
 */
export default function PostCard({ post, onVote, onReply, isRebuttal = false }: PostCardProps) {
    const isPro = post.side === 'PRO';
    // Calculate post score based on upvotes and downvotes.
    const score = post.upvotes - post.downvotes;
    // Get the author's tier based on their score.
    const tier = getTier(post.author_score || 0);
    
    return (
        <div id={`post-${post.id}`} className={`flex gap-2 sm:gap-4 mb-4 ${isRebuttal ? 'ml-6 sm:ml-12' : ''}`}>
            {/* Reddit-style Vote Column */}
            <div className="flex flex-col items-center gap-1 mt-2">
                {/* Upvote button */}
                <button 
                    onClick={() => onVote(post.id, 1)}
                    className={`p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${post.user_vote === 1 ? 'text-brand-600' : 'text-zinc-400'}`}
                    aria-label="Upvote post"
                >
                    <ChevronUp className={`w-6 h-6 ${post.user_vote === 1 ? 'fill-current' : ''}`} />
                </button>
                {/* Display current post score, formatted for large numbers */}
                <span className={`text-xs font-black tabular-nums ${score > 0 ? 'text-brand-600' : score < 0 ? 'text-oppose-main' : 'text-zinc-500'}`}>
                    {score > 999 ? (score / 1000).toFixed(1) + 'k' : score}
                </span>
                {/* Downvote button */}
                <button 
                    onClick={() => onVote(post.id, -1)}
                    className={`p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${post.user_vote === -1 ? 'text-oppose-main' : 'text-zinc-400'}`}
                    aria-label="Downvote post"
                >
                    <ChevronDown className={`w-6 h-6 ${post.user_vote === -1 ? 'fill-current' : ''}`} />
                </button>
            </div>

            <Card 
                className={`flex-1 relative overflow-hidden transition-all duration-300 border-none shadow-sm ${
                    isPro 
                        ? 'bg-support-light/20 dark:bg-support-main/5' // Styling for 'PRO' side posts
                        : 'bg-oppose-light/20 dark:bg-oppose-main/5' // Styling for 'CON' side posts
                }`}
                padding="sm"
            >
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        {/* Author's tier icon */}
                        <div className="scale-75 -ml-1">
                            <TierIcon tier={tier} size="sm" />
                        </div>
                        
                        <div>
                            {/* Author's username */}
                            <div className="text-xs font-black tracking-tight text-zinc-900 dark:text-white uppercase flex items-center gap-1">
                                {post.username}
                            </div>
                            {/* Author's tier name and post creation time */}
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                {tier.name} • {formatDistanceToNow(new Date(post.created_at))} ago
                            </div>
                        </div>
                    </div>
                    {/* Badge indicating the post's side (PRO or CON) */}
                    <Badge variant={isPro ? 'support' : 'oppose'} className="text-[8px] px-1.5 py-0">
                        {isPro ? 'Support' : 'Oppose'}
                    </Badge>
                </div>

                {/* Display post title if available */}
                {post.title && (
                    <h4 className="text-base font-black tracking-tight text-zinc-900 dark:text-white mb-1 uppercase leading-tight">
                        {post.title}
                    </h4>
                )}
                
                {/* Post content */}
                <p className="text-zinc-600 dark:text-zinc-300 text-sm font-medium leading-relaxed whitespace-pre-wrap mb-4">
                    {post.content}
                </p>
                
                <div className="flex gap-4 items-center">
                    {/* Button to reply/rebut to this post */}
                    <button 
                        onClick={() => onReply(post.id)}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-brand-600 transition-colors"
                        aria-label="Rebut this argument"
                    >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Rebut
                    </button>
                </div>
            </Card>
        </div>
    );
}
