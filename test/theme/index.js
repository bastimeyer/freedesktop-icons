const test = require( "ava" );
const proxyquire = require( "proxyquire" ).noCallThru().noPreserveCache();
const sinon = require( "sinon" );


test( "Get theme description", async t => {
	const expected = {};
	const parseStub = sinon.stub();
	const error = new Error( "Could not find theme description file" );

	parseStub.rejects( error );
	parseStub.onThirdCall().resolves( expected );

	const Theme = proxyquire( "../../lib/theme", {
		"../base-directories": [
			"/foo",
			"/bar",
			"/baz",
			"/qux"
		],
		"./parse": parseStub
	});

	t.is( await Theme.getThemeDescription( "foobar" ), expected );
	t.is( parseStub.callCount, 3 );
	t.truthy( parseStub.getCall( 0 ).calledWithExactly( "/foo/foobar/index.theme" ) );
	t.truthy( parseStub.getCall( 1 ).calledWithExactly( "/bar/foobar/index.theme" ) );
	t.truthy( parseStub.getCall( 2 ).calledWithExactly( "/baz/foobar/index.theme" ) );

	parseStub.reset();
	parseStub.rejects( error );

	await t.throws(
		Theme.getThemeDescription( "foobar" ),
		{ instanceOf: Error, message: "Could not get theme description file" }
	);
	t.is( parseStub.callCount, 4 );
	t.truthy( parseStub.getCall( 0 ).calledWithExactly( "/foo/foobar/index.theme" ) );
	t.truthy( parseStub.getCall( 1 ).calledWithExactly( "/bar/foobar/index.theme" ) );
	t.truthy( parseStub.getCall( 2 ).calledWithExactly( "/baz/foobar/index.theme" ) );
	t.truthy( parseStub.getCall( 3 ).calledWithExactly( "/qux/foobar/index.theme" ) );
});


test( "Theme constructor", t => {
	const Theme = require( "../../lib/theme" );

	t.throws(
		() => new Theme( "foobar", new Map() ),
		{ instanceOf: Error, message: "Missing 'Icon Theme' section" }
	);
	t.throws(
		() => new Theme( "foobar", new Map([ [ "Icon Theme", new Map() ] ]) ),
		{ instanceOf: Error, message: "Missing directories property in theme description" }
	);
	t.throws(
		() => new Theme( "foobar", new Map([
			[ "Icon Theme", new Map([ [ "directories", "foo" ] ]) ]
		]) ),
		{ instanceOf: Error, message: "Missing directory section for foo" }
	);

	const theme = new Theme( "foobar", new Map([
		[ "Icon Theme", new Map([ [ "directories", " foo , bar " ] ]) ],
		[ "foo", new Map([ [ "size", 32 ] ]) ],
		[ "bar", new Map([ [ "size", 64 ] ]) ]
	]) );
	t.is( theme.name, "foobar" );
	t.deepEqual( theme.parents, [] );
	t.is( theme.directories.size, 2 );
	t.truthy( theme.directories.has( "foo" ) );
	t.truthy( theme.directories.has( "bar" ) );
	t.is( theme.directories.get( "foo" ).size, 32 );
	t.is( theme.directories.get( "bar" ).size, 64 );

	const themeWithParents = new Theme( "foobar", new Map([
		[ "Icon Theme", new Map([
			[ "inherits", "foo , bar , baz , hicolor" ],
			[ "directories", "qux" ]
		]) ],
		[ "qux", new Map([ [ "size", 32 ] ]) ]
	]) );
	t.deepEqual( themeWithParents.parents, [ "foo", "bar", "baz" ] );
});


test( "Theme creation and cache", async t => {
	const Theme = proxyquire( "../../lib/theme", {} );
	const getThemeDescriptionStub = sinon.stub( Theme, "getThemeDescription" );

	const sections = new Map([
		[ "Icon Theme", new Map([
			[ "directories", "foo" ]
		]) ],
		[ "foo", new Map([
			[ "size", 64 ]
		])]
	]);

	getThemeDescriptionStub.resolves( sections );
	const theme = await Theme.get( "foobar" );
	t.truthy( theme instanceof Theme, "Returns a theme on success" );
	t.truthy( getThemeDescriptionStub.calledOnce );

	getThemeDescriptionStub.resetHistory();
	t.is( await Theme.get( "foobar" ), theme, "Returns cached successful themes" );
	t.not( getThemeDescriptionStub.called );

	Theme.clearCache();
	const anotherTheme = await Theme.get( "foobar" );
	t.truthy( anotherTheme instanceof Theme );
	t.not( anotherTheme, theme );
	t.truthy( getThemeDescriptionStub.calledOnce );

	getThemeDescriptionStub.resetHistory();
	t.not( await Theme.get( "FOOBAR" ), anotherTheme, "Theme cache is case-sensitive" );
	t.truthy( getThemeDescriptionStub.calledOnce );

	getThemeDescriptionStub.reset();
	getThemeDescriptionStub.rejects();
	Theme.clearCache();
	t.is( await Theme.get( "foobar" ), null );
	t.truthy( getThemeDescriptionStub.calledOnce );

	getThemeDescriptionStub.resetHistory();
	t.is( await Theme.get( "foobar" ), null, "Returns cached unsuccessful themes" );
	t.not( getThemeDescriptionStub.called );
});
