const { join } = require( "path" );
const { constants: { R_OK }, access } = require( "./fs" );
const baseDirectories = require( "../../base-directories" );


const { MAX_SAFE_INTEGER } = Number;


/**
 * @param {IconDescription} icon
 * @param {Theme} theme
 * @param {string[]} exts
 * @returns {Promise.<(string|null)>}
 */
async function lookupClosestIcon( icon, theme, exts ) {
	const { name: iconname } = icon;
	const { name: themename } = theme;

	let closest = null;
	let threshold = MAX_SAFE_INTEGER;

	for ( const [ directory, themeDirectory ] of theme.directories ) {
		const diff = themeDirectory.getSizeDiff( icon );
		if ( diff === null || diff >= threshold ) {
			continue;
		}

		for ( const base of baseDirectories ) {
			for ( const ext of exts ) {
				const file = join( base, themename, directory, `${iconname}.${ext}` );
				try {
					await access( file, R_OK );
					closest = file;
					threshold = diff;
					break;
				} catch ( e ) {}
			}
		}
	}

	return closest;
}


module.exports = lookupClosestIcon;
