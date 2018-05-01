const test = require( "ava" );
const proxyquire = require( "proxyquire" ).noCallThru().noPreserveCache();
const sinon = require( "sinon" );
const IconDescription = require( "../../../lib/icon-description" );
const Theme = require( "../../../lib/theme" );


test( "Lookup exact icon", async t => {
	const icon = new IconDescription({ name: "icon", size: 32 });
	const iconBig = new IconDescription({ name: "icon", size: 64 });
	const iconContext = new IconDescription({ name: "icon", size: 32, context: "devices" });
	const theme = new Theme( "foobar", new Map([
		[ "Icon Theme", new Map([
			[ "directories", "foo,bar,baz" ]
		]) ],
		[ "foo", new Map([
			[ "context", "applications" ],
			[ "type", "fixed" ],
			[ "size", 32 ]
		]) ],
		[ "bar", new Map([
			[ "context", "applications" ],
			[ "type", "fixed" ],
			[ "size", 32 ]
		]) ],
		[ "baz", new Map([
			[ "context", "devices" ],
			[ "type", "fixed" ],
			[ "size", 32 ]
		]) ]
	]) );
	const accessStub = sinon.stub();
	const lookupExactIcon = proxyquire( "../../../lib/icons/lookup/exact", {
		"./fs": {
			constants: {
				R_OK: 1
			},
			access: accessStub
		},
		"../../base-directories": [
			"/home/foo/.local/share/icons",
			"/usr/local/share/icons",
			"/usr/share/icons"
		]
	});

	accessStub.rejects();

	t.is( await lookupExactIcon( icon, theme, [ "png", "svg" ] ), null );
	t.deepEqual( accessStub.args, [
		[ "/home/foo/.local/share/icons/foobar/foo/icon.png", 1 ],
		[ "/home/foo/.local/share/icons/foobar/foo/icon.svg", 1 ],
		[ "/usr/local/share/icons/foobar/foo/icon.png", 1 ],
		[ "/usr/local/share/icons/foobar/foo/icon.svg", 1 ],
		[ "/usr/share/icons/foobar/foo/icon.png", 1 ],
		[ "/usr/share/icons/foobar/foo/icon.svg", 1 ],
		[ "/home/foo/.local/share/icons/foobar/bar/icon.png", 1 ],
		[ "/home/foo/.local/share/icons/foobar/bar/icon.svg", 1 ],
		[ "/usr/local/share/icons/foobar/bar/icon.png", 1 ],
		[ "/usr/local/share/icons/foobar/bar/icon.svg", 1 ],
		[ "/usr/share/icons/foobar/bar/icon.png", 1 ],
		[ "/usr/share/icons/foobar/bar/icon.svg", 1 ],
		[ "/home/foo/.local/share/icons/foobar/baz/icon.png", 1 ],
		[ "/home/foo/.local/share/icons/foobar/baz/icon.svg", 1 ],
		[ "/usr/local/share/icons/foobar/baz/icon.png", 1 ],
		[ "/usr/local/share/icons/foobar/baz/icon.svg", 1 ],
		[ "/usr/share/icons/foobar/baz/icon.png", 1 ],
		[ "/usr/share/icons/foobar/baz/icon.svg", 1 ]
	]);

	accessStub.resetHistory();
	accessStub.withArgs( "/usr/share/icons/foobar/bar/icon.svg", 1 ).resolves();

	t.is(
		await lookupExactIcon( icon, theme, [ "png", "svg" ] ),
		"/usr/share/icons/foobar/bar/icon.svg"
	);
	t.deepEqual( accessStub.args, [
		[ "/home/foo/.local/share/icons/foobar/foo/icon.png", 1 ],
		[ "/home/foo/.local/share/icons/foobar/foo/icon.svg", 1 ],
		[ "/usr/local/share/icons/foobar/foo/icon.png", 1 ],
		[ "/usr/local/share/icons/foobar/foo/icon.svg", 1 ],
		[ "/usr/share/icons/foobar/foo/icon.png", 1 ],
		[ "/usr/share/icons/foobar/foo/icon.svg", 1 ],
		[ "/home/foo/.local/share/icons/foobar/bar/icon.png", 1 ],
		[ "/home/foo/.local/share/icons/foobar/bar/icon.svg", 1 ],
		[ "/usr/local/share/icons/foobar/bar/icon.png", 1 ],
		[ "/usr/local/share/icons/foobar/bar/icon.svg", 1 ],
		[ "/usr/share/icons/foobar/bar/icon.png", 1 ],
		[ "/usr/share/icons/foobar/bar/icon.svg", 1 ]
	]);

	accessStub.resetHistory();

	t.is( await lookupExactIcon( iconBig, theme, [ "png", "svg" ] ), null );
	t.deepEqual( accessStub.args, [] );

	accessStub.resetHistory();

	t.is(
		await lookupExactIcon( icon, theme, [ "png", "svg" ] ),
		"/usr/share/icons/foobar/bar/icon.svg"
	);
	t.deepEqual( accessStub.args, [
		[ "/home/foo/.local/share/icons/foobar/foo/icon.png", 1 ],
		[ "/home/foo/.local/share/icons/foobar/foo/icon.svg", 1 ],
		[ "/usr/local/share/icons/foobar/foo/icon.png", 1 ],
		[ "/usr/local/share/icons/foobar/foo/icon.svg", 1 ],
		[ "/usr/share/icons/foobar/foo/icon.png", 1 ],
		[ "/usr/share/icons/foobar/foo/icon.svg", 1 ],
		[ "/home/foo/.local/share/icons/foobar/bar/icon.png", 1 ],
		[ "/home/foo/.local/share/icons/foobar/bar/icon.svg", 1 ],
		[ "/usr/local/share/icons/foobar/bar/icon.png", 1 ],
		[ "/usr/local/share/icons/foobar/bar/icon.svg", 1 ],
		[ "/usr/share/icons/foobar/bar/icon.png", 1 ],
		[ "/usr/share/icons/foobar/bar/icon.svg", 1 ]
	]);

	accessStub.resetHistory();

	t.is(
		await lookupExactIcon( iconContext, theme, [ "png", "svg" ] ),
		null
	);
	t.deepEqual( accessStub.args, [
		[ "/home/foo/.local/share/icons/foobar/baz/icon.png", 1 ],
		[ "/home/foo/.local/share/icons/foobar/baz/icon.svg", 1 ],
		[ "/usr/local/share/icons/foobar/baz/icon.png", 1 ],
		[ "/usr/local/share/icons/foobar/baz/icon.svg", 1 ],
		[ "/usr/share/icons/foobar/baz/icon.png", 1 ],
		[ "/usr/share/icons/foobar/baz/icon.svg", 1 ]
	]);
});
