import AttributesContainer from "./Test_Network/AttributesContainer.js";

export default class InstancesManger {
	#instances = new AttributesContainer( );
	#instanceName = this.#instances.addAttribute( "name" );
	#instanceUsers = this.#instances.addAttribute( "users" );
	#instanceFile = this.#instances.addAttribute( "file" );
	#instancesMap = new Map( );

	constructor ( ) {
        console.log( `InstancesManager - constructor` );

	}

	newInstance ( instanceName ) {
        console.log( `InstancesManager - newInstance` );

		const instance = this.#instances.newElement( );
		this.#instances.ref( instance );
		this.#instanceName[ instance ] = `${ instance }_${instanceName}`; /// quick fix for name collisions
		this.#instanceUsers[ instance ] = new Set( );
		this.#instanceFile[ instance ] = null;

		this.#instancesMap.set( this.#instanceName[ instance ], instance );
		
		return instance;
	}

	deleteInstance ( instanceName ) {
        console.log( `InstancesManager - deleteInstance` );
		
		const instance = this.getInstance( instanceName );
		this.#instances.unref( instance );
		this.#instancesMap.delete( instanceName );
	}

	addUser ( instance, user ) {
        console.log( `InstancesManager - addUser ${ instance } ${ user }` );

		this.#instanceUsers[ instance ].add( user );
	}

	removeUser ( instance, user ) {
        console.log( `InstancesManager - removeUser ${ instance } ${ user }` );

		this.#instanceUsers[ instance ].delete( user );
	}

	instanceUsers ( instance ) {
        console.log( `InstancesManager - instanceUsers ${ instance }` );

		return [ ...this.#instanceUsers[ instance ] ];
	}

	addFile ( instance, fileName ) {
        console.log( `InstancesManager - addFile ${ instance }` );

		this.#instanceFile[ instance ] = fileName;
	}

	getFile ( instance ) {
        console.log( `InstancesManager - getFile ${ instance }` );

		return this.#instanceFile[ instance ];
	}

	getInstance ( name ) {
		return this.#instancesMap.get( name );
	}

	getInstanceName ( instance ) {
		return this.#instanceName[ instance ];
	}

	getInstanceData ( instance, dataQuery = [] ) {
        // console.log( `InstancesManager - getInstanceData` );

		const data = { instance };
		for ( const label of dataQuery ) {
			data[ label ] = this.#instances.getAttribute( label )[ instance ];
			// data[ label ] = this.#properties[ label ][ instance ];
		}
		return data;
	}

	getInstancesData ( dataQuery = [] ) {
        // console.log( `InstancesManager - getInstancesData` );

		return Array.from( this.#instances.elements( ), 
			( instance ) => this.getInstanceData( instance, dataQuery ) );
	}
}