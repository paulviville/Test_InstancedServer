import AttributesContainer from "./Test_Network/AttributesContainer.js";


export default class UsersManager {
	#users = new AttributesContainer( );
    #socket = this.#users.addAttribute("socket");

	constructor ( ) {
        console.log(`UsersManager - constructor`);

	}

	addUser ( ) {
        console.log(`UsersManager - addUser`);

		const userId = this.#users.newElement( );
		this.#users.ref( userId );

		return userId;
	}

	removeUser ( userId ) {
        console.log(`UsersManager - userId ${ userId }`);

		this.#users.unref( userId );
	}

	setSocket ( userId, socket ) {
        console.log(`UsersManager - setSocket ${ userId }`);

		this.#socket[ userId ] = socket;
	}

	getSocket ( userId ) {
        console.log(`UsersManager - getSocket ${ userId }`);

		return this.#socket[ userId ];
	}

    *#usersIterator ( ) {
		for ( const user of this.#users.elements() ) {
			yield user;
		}
	}

	*users ( ) {
		for ( const user of this.#users.elements() ) {
			yield user;
		}
	}

	get sockets ( ) {
		return this.#socket;
	}
}