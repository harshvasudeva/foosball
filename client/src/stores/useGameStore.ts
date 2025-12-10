import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface GameState {
    socket: Socket | null;
    roomId: string | null;
    role: 'host' | 'guest' | null;
    status: 'menu' | 'lobby' | 'playing';
    playerCount: number;
    score: { home: number, away: number };
    isConnected: boolean;
    connect: () => void;
    createRoom: () => void;
    joinRoom: (roomId: string) => void;
    leaveRoom: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    socket: null,
    roomId: null,
    role: null,
    status: 'menu',
    playerCount: 0,
    score: { home: 0, away: 0 },
    isConnected: false,



    connect: () => {
        if (get().socket) return;
        const socket = io('http://localhost:3001');

        socket.on('connect', () => {
            console.log('Connected to server', socket.id);
            set({ isConnected: true });
        });

        socket.on('disconnect', () => {
            console.log('Disconnected');
            set({ isConnected: false });
        });

        socket.on('room_created', ({ roomId, role }) => {
            set({ roomId, role, status: 'lobby', playerCount: 1 });
        });

        socket.on('room_joined', ({ roomId, role }) => {
            set({ roomId, role, status: 'lobby', playerCount: 2 });
        });

        socket.on('player_joined', ({ playerCount }) => {
            set({ playerCount });
        });

        socket.on('game_start', () => {
            set({ status: 'playing', score: { home: 0, away: 0 } });
        });

        socket.on('score_update', (score) => {
            set({ score });
        });

        socket.on('player_left', () => {
            set({ playerCount: 1 }); // Assuming one left, back to 1
        });

        set({ socket });
    },

    createRoom: () => {
        get().socket?.emit('create_room');
    },

    joinRoom: (roomId) => {
        get().socket?.emit('join_room', roomId);
    },

    leaveRoom: () => {
        // Implement leave logic
        set({ roomId: null, role: null, status: 'menu' });
    },
}));
