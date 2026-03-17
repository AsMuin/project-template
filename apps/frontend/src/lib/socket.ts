import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

function getSocket(): Socket {
    if (!socket) {
        socket = io(window.location.origin, {
            path: '/socket.io',
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('🔌 Socket connected:', socket?.id);
        });

        socket.on('disconnect', () => {
            console.log('🔌 Socket disconnected');
        });

        socket.on('connect_error', error => {
            console.error('🔌 Socket connection error:', error);
        });
    }

    return socket;
}

function disconnectSocket(): void {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

export { getSocket, disconnectSocket };
