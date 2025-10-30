// import { WebSocketServer, WebSocket } from "ws";

import ServerManager from "./ServerManager.js";

// const server = new WebSocketServer({ port: 8080 });

// server.on('connection', (socket) => {
//     console.log('A new client connected.');

//     // Handle incoming messages
//     socket.on('message', (message) => {
//         console.log(`Received: ${message}`);
        
//         // Broadcast the message to all connected clients
//         server.clients.forEach((client) => {
//             if (client !== socket && client.readyState === WebSocket.OPEN) {
//                 client.send(message);
//             }
//         });
//     });

//     socket.on('close', () => {
//         console.log('Client disconnected.');
//     });
// });

const port = 8080;
const server = new ServerManager( port );

process.on('SIGINT', ( ) => { server.shutdown( ); })
process.on('SIGTERM', ( ) => { server.shutdown( ); })
