'use client';
import { PostRead } from '@/types/post';
import PostCard from './PostCard';


/**
 * Props for the PostList component.
 */
interface PostListProps {
    /** An array of posts to be displayed. */
    posts: PostRead[];
    /** Callback function to handle voting on a post. */
    onVote: (postId: number, value: number) => void;
    /** Callback function to handle replying to a post. Expects an object with `parent_post_id`. */
    onReply: (data: { parent_post_id: number }) => void;
    /** Indicates if a reply is currently being submitted, used to show loading states. */
    isSubmitting?: boolean;
}

/**
 * Renders a hierarchical list of posts, grouping replies under their parent posts.
 * Posts are sorted by their net score (upvotes - downvotes).
 */
export default function PostList({ posts, onVote, onReply, isSubmitting }: PostListProps) {
    // Group posts by their parent_post_id for hierarchical rendering.
    // Top-level posts have parent_post_id of null, grouped under key 0.
    const postsByParent = posts.reduce((acc, post) => {
        const pid = post.parent_post_id || 0; // Use 0 for top-level posts
        if (!acc[pid]) acc[pid] = [];
        acc[pid].push(post);
        return acc;
    }, {} as Record<number, PostRead[]>);

    /**
     * Recursively renders posts and their replies.
     * @param {number} parentId - The ID of the parent post, or 0 for top-level posts.
     * @param {number} depth - The current depth of recursion, used for styling (e.g., indentation).
     * @returns {JSX.Element[]} An array of PostCard components and their children.
     */
    const renderPosts = (parentId: number = 0, depth: number = 0) => {
        const currentPosts = postsByParent[parentId] || [];
        
        // Sort posts by net score (upvotes - downvotes) in descending order.
        const sortedPosts = [...currentPosts].sort((a, b) => 
            (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
        );

        return sortedPosts.map(post => (
            <div key={post.id} className="relative">
                <PostCard 
                    post={post} 
                    onVote={onVote} 
                    onReply={(id) => onReply({ parent_post_id: id })}
                    isRebuttal={depth > 0} // Mark as rebuttal if nested
                />
                
                {/* Recursively render replies to the current post */}
                {renderPosts(post.id, depth + 1)}
            </div>
        ));
    };

    // Display a message if there are no posts to show.
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
            {/* Start rendering posts from the top level (parentId = 0) */}
            {renderPosts(0)}
        </div>
    );
}
