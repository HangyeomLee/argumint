'use client';
import { useEffect, useRef } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/browser';
import api from '@/lib/api';

export interface DebateEvent {
    type: 'post_created' | 'post_voted' | 'scoreboard_updated' | 'live_activity';
    payload: any;
}

/**
 * Subscribes to Supabase Realtime for a debate and translates Postgres
 * change events into the same event shapes the dashboard consumed over
 * the original WebSocket connection:
 *
 *  - INSERT on posts          -> post_created
 *  - UPDATE on posts          -> post_voted (+ scoreboard refresh)
 *  - INSERT on activities     -> live_activity
 *  - INSERT on participations -> scoreboard_updated
 */
export function useDebateRealtime(debateId: number | undefined, onEvent: (event: DebateEvent) => void) {
    // Keep the latest callback without resubscribing the channel on each render.
    const handler = useRef(onEvent);
    handler.current = onEvent;

    useEffect(() => {
        if (!debateId) return;
        const supabase = getSupabaseBrowser();

        const refreshScoreboard = async () => {
            try {
                const res = await api.get(`/debates/${debateId}/scoreboard`);
                handler.current({ type: 'scoreboard_updated', payload: res.data });
            } catch {
                // Non-fatal: the next event will retry.
            }
        };

        const channel = supabase
            .channel(`debate-${debateId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'posts', filter: `topic_id=eq.${debateId}` },
                (payload) => {
                    handler.current({ type: 'post_created', payload: { ...payload.new, user_vote: null } });
                },
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'posts', filter: `topic_id=eq.${debateId}` },
                (payload) => {
                    const post = payload.new as { id: number; upvotes: number; downvotes: number };
                    handler.current({
                        type: 'post_voted',
                        payload: { post_id: post.id, upvotes: post.upvotes, downvotes: post.downvotes },
                    });
                    refreshScoreboard();
                },
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'activities', filter: `topic_id=eq.${debateId}` },
                (payload) => {
                    const { username, action, target } = payload.new as any;
                    handler.current({ type: 'live_activity', payload: { username, action, target } });
                },
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'participations', filter: `topic_id=eq.${debateId}` },
                () => {
                    refreshScoreboard();
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [debateId]);
}
