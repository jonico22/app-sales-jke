import { io } from "socket.io-client";
import msgpackParser from "socket.io-msgpack-parser";

const SOCKET_URL = import.meta.env.VITE_API_URL_SOCKET;

// Singleton instance
export const socket = io(SOCKET_URL, {
    autoConnect: false,
    parser: msgpackParser,
    transports: ["websocket"]
});

export const connectSocket = (businessId: string) => {
    if (businessId && !socket.connected) {
        // Disconnect first to ensure clean state if reconnecting with new ID
        if (socket.connected) socket.disconnect();

        socket.io.opts.query = { businessId };
        socket.connect();

        socket.on('connection_success', (data) => {
            console.log('[Socket] Connection successful:', data);
        });
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
        console.log('[Socket] Disconnected');
    }
};