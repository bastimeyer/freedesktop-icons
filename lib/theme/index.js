const { join } = require( "path" );
const baseDirectories = require( "../base-directories" );
const parse = require( "./parse" );
const ThemeDirectory = require( "./directory" );


/** @type {Map<string,Theme>} */
const cache = new Map();


/**
 * @typedef {Map.<string,ThemeSection>} ThemeSections
 */
/**
 * @typedef {Map.<string,string>} ThemeSection
 */


/**
 * @class Theme
 * @property {string} name
 * @property {string[]} parents
 * @property {Map.<string,ThemeDirectory>} directories
 */
class Theme {
	static clearCache() {
		cache.clear();
	}

	/**
	 * @param {string} name
	 * @returns {(Theme|null)}
	 */
	static async get( name ) {
		if ( !cache.has( name ) ) {
			try {
				const sections = await this.getThemeDescription( name );
				const theme = new Theme( name, sections );
				cache.set( name, theme );

			} catch ( e ) {
				cache.set( name, null );
			}
		}

		return cache.get( name );
	}

	/**
	 * @param {string} name
	 * @returns {Promise.<ThemeSections>}
	 */
	static async getThemeDescription( name ) {
		for ( const base of baseDirectories ) {
			try {
				const file = join( base, name, "index.theme" );
				return await parse( file );
			} catch ( e ) {}
		}
		throw new Error( "Could not get theme description file" );
	}

	/**
	 * @param {string} name
	 * @param {ThemeSections} sections
	 */
	constructor( name, sections ) {
		if ( !sections.has( "Icon Theme" ) ) {
			throw new Error( "Missing 'Icon Theme' section" );
		}

		/** @type {ThemeSection} */
		const iconThemeSection = sections.get( "Icon Theme" );
		if ( !iconThemeSection.has( "directories" ) ) {
			throw new Error( "Missing directories property in theme description" );
		}

		this.name = name;
		this.parents = iconThemeSection.has( "inherits" )
			? iconThemeSection.get( "inherits" )
				.split( "," )
				.map( name => name.trim() )
				.filter( name => name !== "hicolor" )
			: [];

		this.directories = iconThemeSection.get( "directories" )
			.split( "," )
			.map( directory => directory.trim() )
			.filter( directory => directory !== "" )
			.reduce( ( directories, directory ) => {
				if ( !sections.has( directory ) ) {
					throw new Error( `Missing directory section for ${directory}` );
				}
				const themeDirectory = new ThemeDirectory( sections.get( directory ) );
				directories.set( directory, themeDirectory );

				return directories;
			}, new Map() );
	}
}


module.exports = Theme;
