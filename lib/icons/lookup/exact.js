const { join } = require( "path" );
const { constants: { R_OK }, access } = require( "./fs" );
const baseDirectories = require( "../../base-directories" );


/**
 * @param {IconDescription} icon
 * @param {Theme} theme
 * @param {string[]} exts
 * @returns {Promise.<(string|null)>}
 */
async function lookupExactIcon( icon, theme, exts ) {
	const { name: iconname } = icon;
	const { name: themename } = theme;

	for ( const [ directory, themeDirectory ] of theme.directories ) {
		if ( !themeDirectory.matchesIcon( icon ) ) {
			continue;
		}

		for ( const base of baseDirectories ) {
			for ( const ext of exts ) {
				const file = join( base, themename, directory, `${iconname}.${ext}` );
				try {
					await access( file, R_OK );
					return file;
				} catch ( e ) {}
			}
		}
	}

	return null;
}


module.exports = lookupExactIcon;
