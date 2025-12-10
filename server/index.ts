import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


interface Room {
    id: string;
    players: string[];
    ready: Record<string, boolean>;
}

const rooms: Record<string, Room> = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create_room', () => {
        const roomId = Math.random().toString(36).substring(7).toUpperCase();
        rooms[roomId] = {
            id: roomId,
            players: [socket.id],
            ready: { [socket.id]: false }
        };
        socket.join(roomId);
        socket.emit('room_created', { roomId, role: 'host' });
        console.log(`Room ${roomId} created by ${socket.id}`);
    });

    socket.on('join_room', (roomId: string) => {
        const room = rooms[roomId];
        if (room && room.players.length < 2) {
            room.players.push(socket.id);
            room.ready[socket.id] = false;
            socket.join(roomId);

            socket.emit('room_joined', { roomId, role: 'guest' });
            io.to(roomId).emit('player_joined', { playerCount: room.players.length });
            io.to(roomId).emit('game_start');

            console.log(`${socket.id} joined room ${roomId}`);
        } else {
            socket.emit('error', 'Room full or not found');
        }
    });

    socket.on('input_change', (data: { roomId: string, inputs: any }) => {
        socket.to(data.roomId).emit('input_update', { playerId: socket.id, inputs: data.inputs, timestamp: Date.now() });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Cleanup rooms
        for (const roomId in rooms) {
            const room = rooms[roomId];
            if (room.players.includes(socket.id)) {
                room.players = room.players.filter(id => id !== socket.id);
                io.to(roomId).emit('player_left');
                if (room.players.length === 0) {
                    delete rooms[roomId];
                }
            }
        }
    });
});


const PORT = 3001; // 3000 might be taken or common, using 3001 to be safe
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
