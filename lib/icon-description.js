const { hasOwnProperty } = {};


const descriptionFields = new Map([
	[ "name", String ],
	[ "type", String ],
	[ "context", String ],
	[ "size", Number ],
	[ "scale", Number ]
]);


/**
 * @class IconDescription
 * @property {string} name
 * @property {(string|null)} type
 * @property {(string|null)} context
 * @property {(number|null)} size
 * @property {(number|null)} scale
 */
class IconDescription {
	/**
	 * @param {(Object|string)} icon
	 */
	constructor( icon ) {
		if ( typeof icon === "string" ) {
			icon = { name: icon };
		}
		if ( typeof icon !== "object" || !icon.name ) {
			throw new Error( "Invalid icon query input" );
		}

		for ( const [ prop, type ] of descriptionFields ) {
			this[ prop ] = hasOwnProperty.call( icon, prop )
				? type === String && prop !== "name"
					? type( icon[ prop ] ).toLowerCase()
					: type( icon[ prop ] )
				: null;
		}
	}
}


module.exports = IconDescription;
