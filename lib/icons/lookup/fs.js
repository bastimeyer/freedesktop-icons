const { constants, access: fsAccess } = require( "fs" );
const { promisify } = require( "util" );


const access = promisify( fsAccess );


module.exports = { constants, access };
