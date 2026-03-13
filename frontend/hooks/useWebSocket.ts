import { useEffect, useRef } from 'react';

export function useWebSocket(debateId: number | undefined, onEvent: (event: any) => void) {
    const socket = useRef<WebSocket | null>(null);
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

    const connect = () => {
        if (!debateId) return;

        const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
        const wsUrl = `${wsBaseUrl}/debates/${debateId}`;
        console.log(`Connecting to WebSocket: ${wsUrl}`);
        
        const ws = new WebSocket(wsUrl);
        socket.current = ws;

        ws.onopen = () => {
            console.log('WebSocket Connected');
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
                reconnectTimeout.current = null;
            }
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onEvent(data);
            } catch (err) {
                console.error("Failed to parse WebSocket message:", err);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket Disconnected. Attempting to reconnect...');
            // 3초 후 재연결 시도
            reconnectTimeout.current = setTimeout(() => {
                connect();
            }, 3000);
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            ws.close();
        };
    };

    useEffect(() => {
        connect();

        return () => {
            if (socket.current) {
                socket.current.close();
            }
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
        };
    }, [debateId, onEvent]);

    return socket.current;
}
