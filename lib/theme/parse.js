const { createReadStream } = require( "fs" );


const reComment = /^[#;]/;
const reSection = /^\[([^\]]+)]$/;
const reKeyValue = /^([^=]+)=(.+)$/;


/**
 * @param {string} file
 * @returns {Promise.<ThemeSections>}
 */
async function parse( file ) {
	const sections = new Map();
	let section = null;

	const onLine = line => {
		line = line.trim();
		if ( reComment.test( line ) ) {
			return;
		}

		const mSection = reSection.exec( line );
		if ( mSection ) {
			const [ , name ] = mSection;
			section = new Map();
			sections.set( name.trim(), section );
			return;
		}

		if ( section ) {
			const mKeyValue = reKeyValue.exec( line );
			if ( mKeyValue ) {
				const [ , key, value ] = mKeyValue;
				section.set( key.trim().toLowerCase(), value.trim() );
			}
		}
	};

	return await new Promise( ( resolve, reject ) => {
		const stream = createReadStream( file );
		let buffer = "";

		stream.on( "error", reject );
		stream.on( "data", chunk => {
			chunk = String( chunk );
			const lines = `${buffer}${chunk}`.split( "\n" );
			buffer = lines.pop();
			lines.forEach( onLine );
		});
		stream.on( "end", () => {
			onLine( buffer );
			resolve( sections );
		});
	});
}


module.exports = parse;
