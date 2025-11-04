import Commands from "./Test_Network/Commands.js";
import UsersManager from "./UsersManager.js";
import InstancesManger from "./InstancesManager.js";
import Messages from "./Test_Network/Messages.js";

export default class ServerManager {
	#server;
	#serverId = Commands.SERVER_ID;
	#usersManager = new UsersManager( );
	#instancesManager = new InstancesManger( );
	#files = new Map( );

	#commandsHandlers = {
		[ Commands.INSTANCE_NEW ]: this.#commandInstanceNew.bind( this ),
		[ Commands.INSTANCE_JOIN ]: this.#commandInstanceJoin.bind( this ),
		[ Commands.INSTANCE_LEAVE ]: this.#commandInstanceLeave.bind( this ),
		[ Commands.TRANSFER_FILE ]: this.#commandTransferFile.bind( this ),
	}

	constructor ( server ) {
        console.log( `ServerManager - constructor` );

		this.#server = server;
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
		// console.log(message)
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

	// #message ( userId, message ) {
	// 	const socket = this.#usersManager.getSocket( userId );
	// 	socket.send( message )
	// }

	/// handle exclusion set
	#broadcast ( message = { }, excludedId = undefined ) {
		for ( const userId of this.#usersManager.users( ) ) {
			if( excludedId !== undefined && userId == excludedId ) 
				continue;

			this.#usersManager.sockets[ userId ].send( message );
		}
	}

	#instanceBroadcast ( message = { }, instance, excludedId = undefined) {
		for ( const userId of this.#instancesManager.instanceUsers( instance ) ) {
			if( excludedId !== undefined && userId == excludedId ) 
				continue;

			this.#usersManager.sockets[ userId ].send( message );
		}
	}

	#handleNewUser ( socket ) {
        console.log( `ServerManager - #handleNewUser` );

		const userId = this.#usersManager.addUser( );
		this.#usersManager.setSocket( userId, socket );

		socket.on( `message`, this.#handleMessage.bind( this, userId ));
		socket.on( `close`, this.#handleSocketClose.bind( this, userId ));

		socket.send( Messages.setUser( userId ) );

		const instancesList = this.#instancesManager.getInstancesData( [ "name" ] );
		console.log( instancesList );
		socket.send( Messages.instancesList( instancesList ) );
	}

	#commandInstanceNew ( senderId, data ) {
        console.log( `ServerManager - #commandInstanceNew ${ senderId }` );

		const instanceId = this.#instancesManager.newInstance( data.instanceName );
		const instanceName = this.#instancesManager.getInstanceName( instanceId ); /// quick fix for name collisions
		const socket = this.#usersManager.getSocket( senderId, instanceName );
		socket.send( Messages.newInstance( this.#serverId, data.ins) )

		const instancesList = this.#instancesManager.getInstancesData( [ "name" ] );

		this.#broadcast( Messages.instancesList( instancesList ) );
	}

	#commandInstanceJoin ( senderId, data ) {
        console.log( `ServerManager - #commandInstanceJoin ${ senderId }` );

		const instanceName = data.instanceName;
		const instanceId = this.#instancesManager.getInstance( instanceName );

		this.#instancesManager.addUser( instanceId, senderId );
		this.#usersManager.setInstance( senderId, instanceId );

		/// send files ?
		/// check if user has files ?

		this.#instanceBroadcast( Messages.newUser( senderId ), instanceId );
	}

	#commandInstanceLeave ( senderId, data ) {
        console.log( `ServerManager - #commandInstanceLeave ${ senderId }` );

		const instanceName = data.instanceName;
		const instanceId = this.#instancesManager.getInstance( instanceName );

		this.#instancesManager.removeUser( instanceId, senderId );
		this.#usersManager.setInstance( senderId, null );

		this.#instanceBroadcast( Messages.removeUser( senderId ), instanceId );
	}

	#commandTransferFile ( senderId, data ) {
        console.log( `ServerManager - #commandInstanceLeave ${ senderId }` );

		this.#files.set( data.fileName, data.file );
		console.log(this.#files);

		const instanceName = data.instanceName;
		let instanceId;
		if ( instanceName ) {
			instanceId = this.#instancesManager.getInstance( instanceName );
		} else {
			instanceId = this.#usersManager.getInstance( senderId );
		}

		if ( instanceId ) {
			this.#instancesManager.addFile( instanceId, data.fileName );
			console.log( instanceId );
		} else {
			/// error 
		}
		console.log(data.fileName);
		// this.#instanceBroadcast( Messages.removeUser( senderId ), instanceId );
	}


}