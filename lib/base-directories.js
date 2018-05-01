const { dataDirs } = require( "xdg-basedir" );
const { join } = require( "path" );


const { env } = process;


const baseDirectories = dataDirs.map( dir => join( dir, "icons" ) );

// use ~/.icons first
if ( env[ "HOME" ] ) {
	const homeIcons = join( env[ "HOME" ], ".icons" );
	baseDirectories.unshift( homeIcons );
}


module.exports = baseDirectories;
