const test = require( "ava" );
const proxyquire = require( "proxyquire" ).noCallThru().noPreserveCache();
const sinon = require( "sinon" );


test( "Promisified file access", async t => {
	const originalReadFlag = {};
	const accessStub = sinon.stub().callsFake( ( file, callback ) => callback( null, true ) );
	const { constants: { R_OK }, access } = proxyquire( "../../../lib/icons/lookup/fs", {
		fs: {
			constants: {
				R_OK: originalReadFlag
			},
			access: accessStub
		}
	});

	t.is( R_OK, originalReadFlag );
	t.is( await access( "foo" ), true );
	t.truthy( accessStub.calledWith( "foo" ) );
});
