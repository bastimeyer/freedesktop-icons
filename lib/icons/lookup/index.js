const lookupExactIcon = require( "./exact" );
const lookupClosestIcon = require( "./closest" );


/**
 * @param {IconDescription} icon
 * @param {Theme} theme
 * @param {string[]} exts
 * @returns {Promise.<(string|null)>}
 */
async function lookupIcon( icon, theme, exts ) {
	return await lookupExactIcon( icon, theme, exts )
	    || await lookupClosestIcon( icon, theme, exts );
}


module.exports = lookupIcon;
