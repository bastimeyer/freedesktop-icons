const IconDescription = require( "./icon-description" );
const findIcons = require( "./icons/find" );
const Theme = require( "./theme" );


const { isArray } = Array;
const makeArray = input => input === undefined || input === null
	? []
	: isArray( input )
		? input
		: [ input ];

const THEME_HICOLOR = "hicolor";
const FALLBACK_PIXMAPS = "/usr/share/pixmaps";


/**
 * @param {(IconDescription[]|Object[]|string[]|IconDescription|Object|string)} icons
 * @param {(string[]|string)} [themes]
 * @param {(string[]|string)} [exts]
 * @param {(string[]|string)} [fallbackPaths]
 * @returns {Promise.<(string|null)>}
 */
async function freedesktopIcons(
	icons,
	themes = [],
	exts = [ "png", "svg"/*, "xpm"*/ ],
	fallbackPaths = []
) {
	// turn icon query into proper icon descriptions
	icons = makeArray( icons )
		.map( icon => icon instanceof IconDescription
			? icon
			: new IconDescription( icon )
		);
	if ( !icons.length ) {
		throw new Error( "Missing icon query" );
	}

	// file name extensions need to be an array
	exts = makeArray( exts );
	if ( !exts.length ) {
		throw new Error( "Missing icon file name extensions" );
	}

	// make sure that hicolor is always the last theme
	themes = [
		...makeArray( themes ).filter( name => name !== THEME_HICOLOR ),
		THEME_HICOLOR
	];

	// make sure that /usr/share/pixmaps is always the last fallback path
	fallbackPaths = [
		...makeArray( fallbackPaths ).filter( path => path !== FALLBACK_PIXMAPS ),
		FALLBACK_PIXMAPS
	];

	return await findIcons( icons, themes, exts, fallbackPaths );
}


module.exports = freedesktopIcons;
module.exports.clearCache = Theme.clearCache;
