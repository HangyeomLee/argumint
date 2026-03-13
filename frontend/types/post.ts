export type PostSide = 'PRO' | 'CON';
export type PostType = 'argument' | 'rebuttal';

export interface PostRead {
    id: number;
    topic_id: number;
    user_id: number;
    parent_post_id: number | null;
    side: PostSide;
    type: PostType;
    title: string | null;
    content: string;
    created_at: string;
    updated_at: string;
    like_count: number;
    username?: string;
}
