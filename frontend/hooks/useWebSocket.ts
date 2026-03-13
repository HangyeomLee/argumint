import { useEffect, useRef } from 'react';

export function useWebSocket(debateId: number | undefined, onEvent: (event: any) => void) {
    const socket = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!debateId) return;

        const ws = new WebSocket(`ws://localhost:8000/ws/debates/${debateId}`);
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
