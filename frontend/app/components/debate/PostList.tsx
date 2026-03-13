'use client';
import { PostRead } from '@/types/post';
import PostCard from './PostCard';
import ArgumentComposer from './ArgumentComposer';

interface PostListProps {
    posts: PostRead[];
    onVote: (postId: number, value: number) => void;
    onReply: (data: any) => void;
    isSubmitting?: boolean;
}

export default function PostList({ posts, onVote, onReply, isSubmitting }: PostListProps) {
    // Group posts by parent_id
    const postsByParent = posts.reduce((acc, post) => {
        const pid = post.parent_post_id || 0;
        if (!acc[pid]) acc[pid] = [];
        acc[pid].push(post);
        return acc;
    }, {} as Record<number, PostRead[]>);

    const renderPosts = (parentId: number = 0, depth: number = 0) => {
        const currentPosts = postsByParent[parentId] || [];
        
        // Sort by net votes (upvotes - downvotes)
        const sortedPosts = [...currentPosts].sort((a, b) => 
            (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
        );

        return sortedPosts.map(post => (
            <div key={post.id} className="relative">
                <PostCard 
                    post={post} 
                    onVote={onVote} 
                    onReply={(id) => onReply({ parent_post_id: id })} // Simplified for now
                    isRebuttal={depth > 0}
                />
                
                {renderPosts(post.id, depth + 1)}
            </div>
        ));
    };

    if (!posts || posts.length === 0) {
        return (
            <div className="py-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl opacity-50">⚔️</span>
                </div>
                <h4 className="text-lg font-black uppercase tracking-tighter text-zinc-400">The Arena is silent</h4>
                <p className="text-zinc-500 text-sm font-medium">Be the first to strike a blow.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 pb-20">
            {renderPosts(0)}
        </div>
    );
}
