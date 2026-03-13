import { useEffect, useRef } from 'react';

export function useWebSocket(debateId: number | undefined, onEvent: (event: any) => void) {
    const socket = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!debateId) return;

        const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
        const ws = new WebSocket(`${wsBaseUrl}/debates/${debateId}`);
        socket.current = ws;

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            onEvent(data);
        };

        return () => {
            ws.close();
        };
    }, [debateId, onEvent]);

    return socket.current;
}
