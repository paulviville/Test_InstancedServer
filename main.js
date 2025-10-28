import { WebSocketServer, WebSocket } from "ws";

const server = new WebSocketServer({ port: 8080 });

server.on('connection', (socket) => {
    console.log('A new client connected.');

    // Handle incoming messages
    socket.on('message', (message) => {
        console.log(`Received: ${message}`);
        
        // Broadcast the message to all connected clients
        server.clients.forEach((client) => {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    socket.on('close', () => {
        console.log('Client disconnected.');
    });
});