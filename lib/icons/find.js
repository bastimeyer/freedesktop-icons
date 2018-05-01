const lookupIcon = require( "./lookup" );
const lookupFallbackIcon = require( "./lookup/fallback" );
const Theme = require( "../theme" );


/**
 * @param {IconDescription[]} icons
 * @param {string[]} themenames
 * @param {string[]} exts
 * @param {string[]} fallbackPaths
 * @returns {Promise.<(string|null)>}
 */
async function findBestIcon( icons, themenames, exts, fallbackPaths ) {
	const lookedUpThemes = new Map();

	for ( const themename of themenames ) {
		const file = await findBestIconHelper( icons, themename, exts, lookedUpThemes );
		if ( file !== null ) {
			return file;
		}
	}

	for ( const path of fallbackPaths ) {
		for ( const icon of icons ) {
			const file = await lookupFallbackIcon( icon, path, exts );
			if ( file !== null ) {
				return file;
			}
		}
	}

	return null;
}

/**
 * @param {IconDescription[]} icons
 * @param {string} themename
 * @param {string[]} exts
 * @param {Map.<string,boolean>} lookedUpThemes
 * @returns {Promise.<(string|null)>}
 */
async function findBestIconHelper( icons, themename, exts, lookedUpThemes ) {
	// don't look up icons in any theme twice
	if ( lookedUpThemes.has( themename ) ) {
		return null;
	}
	lookedUpThemes.set( themename, true );

	// always make sure first that the current theme exists
	const theme = await Theme.get( themename );
	if ( !theme ) {
		return null;
	}

	// look up icons in the current theme
	for ( const icon of icons ) {
		const file = await lookupIcon( icon, theme, exts );
		if ( file !== null ) {
			return file;
		}
	}

	// try the theme's parent themes afterwards
	for ( const parent of theme.parents ) {
		const file = await findBestIconHelper( icons, parent, exts, lookedUpThemes );
		if ( file !== null ) {
			return file;
		}
	}

	return null;
}


module.exports = findBestIcon;
