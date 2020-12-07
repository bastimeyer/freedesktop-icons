const test = require( "ava" );
const EventEmitter = require( "events" );
const proxyquire = require( "proxyquire" ).noCallThru().noPreserveCache();
const sinon = require( "sinon" );


test.beforeEach( t => {
	t.context.readStream = new EventEmitter();
	t.context.createReadStreamStub = sinon.stub().returns( t.context.readStream );
	t.context.subject = proxyquire( "../../lib/theme/parse", {
		fs: {
			createReadStream: t.context.createReadStreamStub
		}
	});
});


test( "Rejects on missing file", async t => {
	const promise = t.context.subject( "/foo/bar" );
	t.truthy( t.context.createReadStreamStub.calledWithExactly( "/foo/bar" ) );

	t.context.readStream.emit( "error", new Error( "failed" ) );
	await t.throwsAsync( promise, { instanceOf: Error, message: "failed" } );
});


test( "Parses", async t => {
	const promise = t.context.subject( "/foo/bar" );
	t.truthy( t.context.createReadStreamStub.calledWithExactly( "/foo/bar" ) );

	for ( const chunk of [
		" ; this is a comment\n",
		" # this is another comment\n",
		"invalid string\n",
		"ignored = string\n",
		"[FOO/bar@BAZ]\n",
		"Abc=Def\n",
		" 123 ",
		" = ",
		" 456 \n\n",
		"[ qux ]\nfoo=bar\nFOO=BAZ"
	]) {
		t.context.readStream.emit( "data", chunk );
	}
	t.context.readStream.emit( "end" );
	const result = await promise;

	t.is( result.size, 2 );
	t.is( result.get( "FOO/bar@BAZ" ).size, 2 );
	t.is( result.get( "FOO/bar@BAZ" ).get( "abc" ), "Def" );
	t.is( result.get( "FOO/bar@BAZ" ).get( "123" ), "456" );
	t.is( result.get( "qux" ).size, 1 );
	t.is( result.get( "qux" ).get( "foo" ), "BAZ" );
});
