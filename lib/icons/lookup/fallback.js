const { join } = require( "path" );
const { constants: { R_OK }, access } = require( "./fs" );


/**
 * @param {IconDescription} icon
 * @param {string} directory
 * @param {string[]} exts
 * @returns {Promise.<(string|null)>}
 */
async function lookupFallbackIcon( icon, directory, exts ) {
	const { name: iconname } = icon;

	for ( const ext of exts ) {
		const file = join( directory, `${iconname}.${ext}` );
		try {
			await access( file, R_OK );
			return file;
		} catch ( e ) {}
	}

	return null;
}


module.exports = lookupFallbackIcon;
