import { WebSocketServer } from "ws";
import ServerManager from "./ServerManager.js";

/// Integrate HTTPS protocols

const port = 8080;
const server = new WebSocketServer({ port: port });
const serverManager = new ServerManager( server );

process.on('SIGINT', ( ) => { serverManager.shutdown( ); })
process.on('SIGTERM', ( ) => { serverManager.shutdown( ); })
