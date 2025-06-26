// socket.ts
import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
// Replace with your server URL if different
const SERVER_URL = process.env.NODE_ENV === 'production' ? import.meta.env.VITE_SERVER_URL : 'http://localhost:5000'

const socket = io(SERVER_URL, {
    transports: ['websocket'],
    autoConnect: true,
});

// socket.on('connect', () => {
//     console.log('✅ Connected to server with ID:', socket.id);
// });

// socket.on('connect_error', (err) => {
//     console.error('❌ Connection error:', err.message);
// });

export default socket;