const TYPE_FIXED = "fixed";
const TYPE_SCALABLE = "scalable";
const TYPE_THRESHOLD = "threshold";
const TYPES = [ TYPE_FIXED, TYPE_SCALABLE, TYPE_THRESHOLD ];


/**
 * @class ThemeDirectory
 * @property {number} size
 * @property {number} scale
 * @property {string} type
 * @property {string} context
 * @property {number} minsize
 * @property {number} maxsize
 * @property {number} threshold
 */
class ThemeDirectory {
	/**
	 * @param {ThemeSection} section
	 */
	constructor( section ) {
		if ( !section.has( "size" ) ) {
			throw new Error( "Directory sections require a size property" );
		}
		this.size = Number( section.get( "size" ) );

		this.scale = section.has( "scale" )
			? Number( section.get( "scale" ) )
			: 1;

		this.type = section.has( "type" )
			? section.get( "type" ).toLowerCase()
			: TYPE_THRESHOLD;
		if ( !TYPES.includes( this.type ) ) {
			throw new Error( `Invalid directory section type: ${this.type}` );
		}

		this.context = section.has( "context" )
			? section.get( "context" ).toLowerCase()
			: null;

		this.minsize = section.has( "minsize" )
			? Number( section.get( "minsize" ) )
			: this.size;
		this.maxsize = section.has( "maxsize" )
			? Number( section.get( "maxsize" ) )
			: this.size;

		this.threshold = section.has( "threshold" )
			? Number( section.get( "threshold" ) )
			: 2;
	}

	/**
	 * @param {IconDescription} icon
	 * @returns {boolean}
	 */
	matchesIcon( icon ) {
		if (
			   icon.type && icon.type !== this.type
			|| icon.context && icon.context !== this.context
			|| icon.scale && icon.scale !== this.scale
			|| !icon.scale && this.scale && this.scale !== 1
		) {
			return false;
		}

		if ( !icon.size ) {
			return true;
		}

		switch ( this.type ) {
			case TYPE_FIXED:
				return icon.size === this.size;
			case TYPE_SCALABLE:
				return icon.size >= this.minsize
				    && icon.size <= this.maxsize;
			case TYPE_THRESHOLD:
				return icon.size >= this.size - this.threshold
				    && icon.size <= this.size + this.threshold;
		}
	}

	/**
	 * @param {IconDescription} icon
	 * @returns {(number|null)}
	 */
	getSizeDiff( icon ) {
		if (
			   icon.type && icon.type !== this.type
			|| icon.context && icon.context !== this.context
		) {
			return null;
		}

		const scale = this.scale;
		const iconsize = icon.size * ( icon.scale || 1 );

		switch ( this.type ) {
			case TYPE_FIXED:
				return Math.abs( this.size * scale - iconsize );

			case TYPE_SCALABLE:
				if ( iconsize < this.minsize * scale ) {
					return this.minsize * scale - iconsize;
				}
				if ( iconsize > this.maxsize * scale ) {
					return iconsize - this.maxsize * scale;
				}
				return 0;

			case TYPE_THRESHOLD:
				if ( iconsize < ( this.size - this.threshold ) * scale ) {
					return this.minsize * scale - iconsize;
				}
				if ( iconsize > ( this.size + this.threshold ) * scale ) {
					return iconsize - this.maxsize * scale;
				}
				return 0;
		}
	}
}


module.exports = ThemeDirectory;
