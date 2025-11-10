import AttributesContainer from "./Test_Network/AttributesContainer.js";

import fs from 'fs';
import path, { join } from 'path';

export default class FilesManager {
	#files = new AttributesContainer( );
	#fileName = this.#files.addAttribute( "name" );
	#fileContents = this.#files.addAttribute( "contents" );
	#filesMap = new Map( );

	constructor ( ) {
        console.log( `FilesManager - constructor` );
	}

	addFile ( name, contents = undefined, save = false ) {
        console.log( `FilesManager - addFile` );

		const file = this.#files.newElement( );
		this.#files.ref( file );
		this.#fileName[ file ] = `${ file }_${ name }`; // quick fix collisions
		this.#fileContents[ file ] = contents; /// undefined for local non loaded files

		this.#filesMap.set( this.#fileName[ file ], file );

		if ( save  )
			this.saveFile( name, contents );

		return file;
	}

	getFile ( name ) {
        console.log( `FilesManager - getFile ${ name }` );

		return this.#filesMap.get( name );
	}

	getFileContent ( file ) {

	}

	getFileData ( file, dataQuery = [] ) {
		console.log( `FilesManager - getFileData` );

		const data = { file };
		for ( const label of dataQuery ) {
			data[ label ] = this.#files.getAttribute( label )[ file ];
		}
		return data;
	}

	getFilesData ( dataQuery = [] ) {
		console.log( `FilesManager - getFilesData` );

		return Array.from( this.#files.elements( ), 
			( file ) => this.getFileData( file, dataQuery ) );
	}

	async saveFile ( name, contents ) {
		console.log( `FilesManager - saveFile ${ name }` );

		const filesDir = path.resolve( './Files' );
		const filePath = path.join( filesDir, name );
		await fs.promises.writeFile( filePath, Buffer.from( contents ) );
		
	}

	async loadFiles ( ) {
		console.log( `FilesManager - loadLocalFiles` );

		const filesDir = path.resolve('./Files');

		const fileNames = await fs.promises.readdir( filesDir );
		for ( const fileName of fileNames ) {
			const filePath = path.join( filesDir, fileName );
			const fileContents = await fs.promises.readFile( filePath );

			this.addFile( fileName, fileContents );
		}
	}


}