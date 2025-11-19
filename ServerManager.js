import Commands from "./Test_Network/Commands.js";
import UsersManager from "./UsersManager.js";
import InstancesManger from "./InstancesManager.js";
import Messages from "./Test_Network/Messages.js";
import FilesManager from "./FilesManager.js";

import { NodeIO } from '@gltf-transform/core';
import { KHRDracoMeshCompression, EXTTextureWebP } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';

import fs from 'fs';
import path from 'path';

const io = new NodeIO()
	.registerExtensions([KHRDracoMeshCompression, EXTTextureWebP])
	.registerDependencies({
		'draco3d.decoder': await draco3d.createDecoderModule(),
		'draco3d.encoder': await draco3d.createEncoderModule(),
	});

export default class ServerManager {
	#server;
	#serverId = Commands.SERVER_ID;
	#usersManager = new UsersManager( );
	#instancesManager = new InstancesManger( );
	#filesManager = new FilesManager( );

	#commandsHandlers = {
		[ Commands.INSTANCE_NEW ]: this.#commandInstanceNew.bind( this ),
		[ Commands.INSTANCE_JOIN ]: this.#commandInstanceJoin.bind( this ),
		[ Commands.INSTANCE_LEAVE ]: this.#commandInstanceLeave.bind( this ),
		[ Commands.FILE_TRANSFER ]: this.#commandFileTransfer.bind( this ),
		[ Commands.FILE_REQUEST ]: this.#commandFileRequest.bind( this ),
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
		
		this.#filesManager.loadFiles( );
	}

	#handleServerError ( ) {
        console.log( `ServerManager - #handleServerError` );

	}

	#handleServerClose ( ) {
        console.log( `ServerManager - #handleServerClose` );

	}

	#handleSocketClose ( userId ) {
        console.log( `ServerManager - #handleSocketClose ${userId}` );

		const instanceId = this.#usersManager.getInstance( userId );
		if ( instanceId ) {
			this.#instancesManager.removeUser( instanceId, userId );
			this.#instanceBroadcast( Messages.removeUser( userId ), instanceId );
		}
		this.#usersManager.removeUser( userId );

	}

	#handleMessage ( userId, message ) {
        console.log( `ServerManager - #handleMessage ${userId}` );

		const messageData = JSON.parse(message);
		// console.log(message)
		// console.log(messageData)

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

	#send ( userId, message ) {
		const socket = this.#usersManager.getSocket( userId );
		socket.send( message )
	}

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
		const filesList = this.#filesManager.getFilesData( [ "name" ] );
		console.log( filesList );
		socket.send( Messages.filesList( filesList ) );
	}

	#commandInstanceNew ( senderId, data ) {
        console.log( `ServerManager - #commandInstanceNew ${ senderId }` );

		const instanceId = this.#instancesManager.newInstance( data.instanceName );
		const instanceName = this.#instancesManager.getInstanceName( instanceId ); /// quick fix for name collisions
		const socket = this.#usersManager.getSocket( senderId, instanceName );
		socket.send( Messages.newInstance( this.#serverId, data.instanceName ) )

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

	async #commandFileTransfer ( senderId, data ) {
        console.log( `ServerManager - #commandFileTransfer ${ senderId }` );

		// this.#files.set( data.fileName, data.file );
		// console.log(data)



		//////// NEEDS CLEAN UP
		const fileBuffer = Messages.decodeFile( data.file );
		console.log(fileBuffer)
		const document = await io.readBinary( new Uint8Array( fileBuffer ) );
		// console.log(file);
		const gltfData = (await io.writeJSON( document )).json;
		console.log( gltfData.nodes )
		////////

		/// Stores the raw array buffer
		this.#filesManager.addFile( data.fileName, fileBuffer, true );

		const filesList = this.#filesManager.getFilesData( [ "name" ] );
		console.log( filesList );
		// this.#broadcast( Messages.filesList( filesList ) );
	}

	#commandFileRequest ( senderId, data ) {
        console.log( `ServerManager - #commandFileRequest ${ senderId }` );
		
		console.log( data.fileName );
		const fileId = this.#filesManager.getFile( data.fileName );

		// this.#filesManager.addFile( data.fileName, data.file );
		
		const fileData = this.#filesManager.getFileData( fileId, [ "name", "contents" ] );
		this.#send( senderId, Messages.fileTransfer( this.#serverId, fileData.name, Messages.encodeFile( fileData.contents ) ) );
	}

}