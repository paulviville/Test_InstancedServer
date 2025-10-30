import { WebSocketServer } from "ws";
import Commands from "./Test_Network/Commands.js";
import UsersManager from "./UsersManager.js";
import InstancesManger from "./InstancesManager.js";
import Messages from "./Test_Network/Messages.js";

export default class ServerManager {
	#server;
	#serverId = Commands.SERVER_ID;
	#usersManager = new UsersManager( );
	#instancesManager = new InstancesManger( );

	#commandsHandlers = {
		[ Commands.INSTANCE_NEW ]: this.#commandInstanceNew.bind( this ),
		[ Commands.INSTANCE_JOIN ]: this.#commandInstanceJoin.bind( this ),
		[ Commands.INSTANCE_LEAVE ]: this.#commandInstanceLeave.bind( this ),
	}

	constructor ( port ) {
        console.log( `ServerManager - constructor (${port})` );

		this.#server = new WebSocketServer({ port });
		this.#server.on( "listening", this.#handleServerListening.bind(this) );
		this.#server.on( "connection", this.#handleServerConnection.bind(this) );
		this.#server.on( "close", this.#handleServerClose.bind(this) );
		this.#server.on( "error", this.#handleServerError.bind(this) );
	}

	#handleServerConnection ( socket ) {
        console.log( `ServerManager - #handleServerConnection` );
		
		this.#handleNewUser( socket );
	}

	#handleServerListening ( ) {
        console.log( `ServerManager - #handleServerListening` );
		
	}

	#handleServerError ( ) {
        console.log( `ServerManager - #handleServerError` );

	}

	#handleServerClose ( ) {
        console.log( `ServerManager - #handleServerClose` );

	}

	#handleSocketClose ( userId ) {
        console.log( `ServerManager - #handleSocketClose ${userId}` );

		this.#usersManager.removeUser( userId );
	}

	#handleMessage ( userId, message ) {
        console.log( `ServerManager - #handleMessage ${userId}` );

		const messageData = JSON.parse(message);
		console.log(message)
		console.log(messageData)

		const handlerFunction = this.#commandsHandlers[messageData.command];
		if ( handlerFunction ) {
			handlerFunction(userId, messageData);
		}
		else {
			console.log(`Unknown command ${userId} ${messageData.command}`);
		}		
	}

	#handleShutdown ( ) {
        console.log( `ServerManager - #handleShutdown` );

		this.#server.clients.forEach( ( client ) => {
			client.terminate( );
		});
	}

	shutdown ( ) {
        console.log( `ServerManager - shutdown` );

		this.#server.close( );
		this.#handleShutdown( );
	}

	/// handle exclusion set
	#broadcast ( message = { }, excludedId = undefined ) {
		for ( const userId of this.#usersManager.users( ) ) {
			if( excludedId !== undefined && client == excludedId ) 
				continue;

			this.#usersManager.sockets[ userId ].send( message );
		}
	}

	#instanceBroadcast ( message, instance, excludedId = undefined) {

	}

	#handleNewUser ( socket ) {
        console.log( `ServerManager - #handleNewUser` );

		const userId = this.#usersManager.addUser( );
		this.#usersManager.sockets[ userId ] = socket;

		socket.on( `message`, this.#handleMessage.bind( this, userId ));
		socket.on( `close`, this.#handleSocketClose.bind( this, userId ));

		socket.send( Messages.setUser( userId ) );

		// console.log( this.#instancesManager.instancesData );
		const instancesList = this.#instancesManager.instancesData;
		console.log( instancesList );
		socket.send( Messages.instancesList( instancesList ) );
	}

	#commandInstanceNew ( senderId, data ) {
        console.log( `ServerManager - #commandInstanceNew ${ senderId }` );

		this.#instancesManager.newInstance( data.instanceName );

		const instancesList = this.#instancesManager.instancesData;
		this.#broadcast( Messages.instancesList( instancesList ) );
	}

	#commandInstanceJoin ( senderId, data ) {
        console.log( `ServerManager - #commandInstanceJoin ${ senderId }` );

		const instanceName = data.instanceName;
		console.log( instanceName );
		const instanceId = this.#instancesManager.getInstance( instanceName );
		console.log(instanceId);

		this.#instancesManager.addUser( instanceId, senderId );

		console.log(this.#instancesManager.instanceUsers(instanceId));
		/// send files ?
		/// check if user has files ?
		/// broadcast new user to users already in instance
	}

	#commandInstanceLeave ( senderId, data ) {
        console.log( `ServerManager - #commandInstanceLeave ${ senderId }` );

		const instanceName = data.instanceName;
		console.log( instanceName );
		const instanceId = this.#instancesManager.getInstance( instanceName );
		console.log(instanceId);

		this.#instancesManager.removeUser( instanceId, senderId );

		console.log(this.#instancesManager.instanceUsers(instanceId));
		/// broadcast remove user to users already in instance

	}
}