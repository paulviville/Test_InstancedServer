import AttributesContainer from "./Test_Network/AttributesContainer.js";

export default class FilesManager {
	#files = new AttributesContainer( );
	#fileName = this.#files.addAttribute( "name" );
	#fileContents = this.#files.addAttribute( "contents" );
	#filesMap = new Map( );

	constructor ( ) {
        console.log( `FilesManager - constructor` );
	}

	addFile ( name, contents ) {
        console.log( `FilesManager - addFile` );

		const file = this.#files.newElement( );
		this.#files.ref( file );
		this.#fileName[ file ] = `${ file }_${ name }`; // quick fix collisions
		this.#fileContents[ file ] = contents;

		this.#filesMap.set( this.#fileName[ file ], file );

		return file;
	}

	getFile ( name ) {
        console.log( `FilesManager - getFile ${ name }` );

		return this.#filesMap.get( name );
	}

	getFileData ( fileId, dataQuery = [] ) {
		console.log( `FilesManager - getFileData` );

		const data = { fileId };
		for ( const label of dataQuery ) {
			data[ label ] = this.#files.getAttribute( label )[ fileId ];
		}
		return data;
	}

	getFilesData ( dataQuery = [] ) {
		console.log( `InstancesManager - getFilesData` );

		return Array.from( this.#files.elements( ), 
			( file ) => this.getFileData( file, dataQuery ) );
	}
}