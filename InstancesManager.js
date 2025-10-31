import AttributesContainer from "./Test_Network/AttributesContainer.js";

export default class InstancesManger {
	#users = new Set( );
	#instances = new AttributesContainer( );
	#instanceName = this.#instances.addAttribute( "name" );
	#instanceUsers = this.#instances.addAttribute( "users" );
	#instancesMap = new Map( );

	constructor ( ) {
        console.log( `InstancesManager - constructor` );

	}

	newInstance ( instanceName ) {
        console.log( `InstancesManager - newInstance` );

		const instance = this.#instances.newElement( );
		this.#instances.ref( instance );
		this.#instanceName[ instance ] = instanceName;
		this.#instanceUsers[ instance ] = new Set( );

		this.#instancesMap.set( instanceName, instance );
		console.log(this.#instancesMap)
		return instance;
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
		console.log(this.#instanceUsers[ instance ])
		return [ ...this.#instanceUsers[ instance ] ];
	}

	*#instancesDataIterator ( ) {
		for ( const instance of this.#instances.elements( ) ) {
			yield {
				instance: instance,
				name: this.#instanceName[ instance ],
				users: this.#instanceUsers[ instance ],
			}
		}
	}

	*#instancesListIterator ( ) {
		for ( const instance of this.#instances.elements( ) ) {
			yield {
				instance: instance,
				name: this.#instanceName[ instance ],
			}
		}
	}

	getInstance ( name ) {
		return this.#instancesMap.get( name );
	}

	get instancesData ( ) {
        console.log( `InstancesManager - instancesData` );

		return [ ...this.#instancesDataIterator( ) ];
	}

	get instancesList ( ) {
        console.log( `InstancesManager - instancesList` );

		return [ ...this.#instancesListIterator( ) ];
	}
}