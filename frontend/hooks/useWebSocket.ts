import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage a WebSocket connection for a debate.
 * It handles connecting, receiving messages, and automatically reconnecting on disconnection.
 *
 * @param debateId The ID of the debate to connect to. The connection is only established if the ID is provided.
 * @param onEvent Callback function that is triggered when a message is received from the WebSocket.
 * @returns The WebSocket instance, or null if not connected.
 */
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
            // Clear any existing reconnect timeout upon successful connection
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
            // Attempt to reconnect after 3 seconds
            reconnectTimeout.current = setTimeout(() => {
                connect();
            }, 3000);
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            // Closing the socket will trigger the onclose event, which handles reconnection.
            ws.close();
        };
    };

    useEffect(() => {
        connect();

        // Cleanup function to close the WebSocket connection when the component unmounts
        return () => {
            if (socket.current) {
                // Prevent onclose from triggering reconnection during cleanup
                socket.current.onclose = null; 
                socket.current.close();
            }
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
        };
    }, [debateId, onEvent]);

    return socket.current;
}
