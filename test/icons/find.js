const test = require( "ava" );
const proxyquire = require( "proxyquire" ).noCallThru().noPreserveCache();
const sinon = require( "sinon" );
const IconDescription = require( "../../lib/icon-description" );
const Theme = require( "../../lib/theme" );


test.before( t => {
	t.context.themes = new Map([
		[ "theme-a", new Theme( "theme-a", new Map([
			[ "Icon Theme", new Map([
				[ "directories", "foo" ]
			]) ],
			[ "foo", new Map([
				[ "size", 64 ]
			]) ]
		]) ) ],
		[ "theme-b", new Theme( "theme-b", new Map([
			[ "Icon Theme", new Map([
				[ "inherits", "theme-a" ],
				[ "directories", "bar" ]
			]) ],
			[ "bar", new Map([
				[ "size", 64 ]
			]) ]
		]) ) ],
		[ "theme-c", new Theme( "theme-c", new Map([
			[ "Icon Theme", new Map([
				[ "inherits", "theme-b,theme-a" ],
				[ "directories", "baz" ]
			]) ],
			[ "baz", new Map([
				[ "size", 64 ]
			]) ]
		]) ) ],
		[ "theme-d", new Theme( "theme-d", new Map([
			[ "Icon Theme", new Map([
				[ "inherits", "theme-c" ],
				[ "directories", "qux" ]
			]) ],
			[ "qux", new Map([
				[ "size", 64 ]
			]) ]
		]) ) ]
	]);
	t.context.getThemeStub = sinon.stub().callsFake( themename => t.context.themes.has( themename )
		? t.context.themes.get( themename )
		: null
	);
});

test.beforeEach( t => {
	t.context.getThemeStub.resetHistory();
	t.context.lookupStub = sinon.stub().returns( null );
	t.context.lookupFallbackStub = sinon.stub().returns( null );
	t.context.subject = proxyquire( "../../lib/icons/find", {
		"./lookup": t.context.lookupStub,
		"./lookup/fallback": t.context.lookupFallbackStub,
		"../theme": {
			get: t.context.getThemeStub
		}
	});
});


test( "Invalid theme", async t => {
	t.is(
		await t.context.subject( [], [ "invalid" ], [], [] ),
		null
	);
	t.falsy( t.context.lookupStub.called );
	t.falsy( t.context.lookupFallbackStub.called );
});


test( "Fallback icons", async t => {
	const iconFoo = new IconDescription( "foo" );
	const iconBar = new IconDescription( "bar" );
	const themeA = t.context.themes.get( "theme-a" );
	const exts = [ "png" ];
	const fallback = [ "/foo", "/bar" ];

	t.is(
		await t.context.subject( [ iconFoo, iconBar ], [ "theme-a" ], exts, fallback ),
		null,
		"Returns null on failure"
	);
	t.deepEqual( t.context.lookupStub.args, [
		[ iconFoo, themeA, exts ],
		[ iconBar, themeA, exts ]
	]);
	t.deepEqual( t.context.lookupFallbackStub.args, [
		[ iconFoo, "/foo", exts ],
		[ iconBar, "/foo", exts ],
		[ iconFoo, "/bar", exts ],
		[ iconBar, "/bar", exts ]
	]);

	t.context.lookupStub.resetHistory();
	t.context.lookupFallbackStub.resetHistory();
	t.context.lookupFallbackStub.withArgs( iconBar, "/foo", exts ).resolves( "/foo/bar.png" );

	t.is(
		await t.context.subject( [ iconFoo, iconBar ], [ "theme-a" ], exts, fallback ),
		"/foo/bar.png",
		"Returns fallback path on success"
	);
	t.deepEqual( t.context.lookupStub.args, [
		[ iconFoo, themeA, exts ],
		[ iconBar, themeA, exts ]
	]);
	t.deepEqual( t.context.lookupFallbackStub.args, [
		[ iconFoo, "/foo", exts ],
		[ iconBar, "/foo", exts ]
	]);
	t.truthy( t.context.lookupFallbackStub.calledAfter( t.context.lookupStub ) );
});


test( "Icon lookup", async t => {
	const iconFoo = new IconDescription( "foo" );
	const iconBar = new IconDescription( "bar" );
	const themeA = t.context.themes.get( "theme-a" );
	const exts = [ "png" ];
	const fallback = [ "/foo" ];

	t.context.lookupStub.withArgs( iconBar, themeA, exts ).resolves( "/theme-a/foo/bar.png" );

	t.is(
		await t.context.subject( [ iconFoo, iconBar ], [ "theme-a" ], exts, fallback ),
		"/theme-a/foo/bar.png",
		"Returns icon path on success"
	);
	t.deepEqual( t.context.lookupStub.args, [
		[ iconFoo, themeA, exts ],
		[ iconBar, themeA, exts ]
	]);
	t.falsy( t.context.lookupFallbackStub.called );
});


test( "Recursive parent themes", async t => {
	const iconFoo = new IconDescription( "foo" );
	const iconBar = new IconDescription( "bar" );
	const themeA = t.context.themes.get( "theme-a" );
	const themeB = t.context.themes.get( "theme-b" );
	const themeC = t.context.themes.get( "theme-c" );
	const themeD = t.context.themes.get( "theme-d" );
	const exts = [ "png" ];
	const fallback = [ "/foo" ];

	t.is(
		await t.context.subject( [ iconFoo, iconBar ], [ "theme-d", "theme-b" ], exts, fallback ),
		null
	);
	t.deepEqual(
		t.context.lookupStub.args,
		[
			[ iconFoo, themeD, exts ],
			[ iconBar, themeD, exts ],
			[ iconFoo, themeC, exts ],
			[ iconBar, themeC, exts ],
			[ iconFoo, themeB, exts ],
			[ iconBar, themeB, exts ],
			[ iconFoo, themeA, exts ],
			[ iconBar, themeA, exts ]
		],
		"Doesn't look up icons in any theme twice (double inheritances and double queries)"
	);
	t.deepEqual( t.context.lookupFallbackStub.args, [
		[ iconFoo, "/foo", exts ],
		[ iconBar, "/foo", exts ]
	]);
	t.truthy( t.context.lookupFallbackStub.calledAfter( t.context.lookupStub ) );

	t.context.lookupFallbackStub.resetHistory();
	t.context.lookupStub.resetHistory();
	t.context.lookupStub.withArgs( iconBar, themeA, exts ).resolves( "/theme-a/foo/bar.png" );

	t.is(
		await t.context.subject( [ iconFoo, iconBar ], [ "theme-d" ], exts, fallback ),
		"/theme-a/foo/bar.png"
	);
	t.deepEqual(
		t.context.lookupStub.args,
		[
			[ iconFoo, themeD, exts ],
			[ iconBar, themeD, exts ],
			[ iconFoo, themeC, exts ],
			[ iconBar, themeC, exts ],
			[ iconFoo, themeB, exts ],
			[ iconBar, themeB, exts ],
			[ iconFoo, themeA, exts ],
			[ iconBar, themeA, exts ]
		],
		"Finds icon in parent themes (breadth-first)"
	);
	t.falsy( t.context.lookupFallbackStub.called );
});
