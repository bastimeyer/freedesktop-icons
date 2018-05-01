const test = require( "ava" );
const proxyquire = require( "proxyquire" ).noCallThru().noPreserveCache();
const sinon = require( "sinon" );
const IconDescription = require( "../../../lib/icon-description" );
const Theme = require( "../../../lib/theme" );


test( "Lookup closest icon", async t => {
	const icon = new IconDescription({ name: "icon", size: 96 });
	const iconContext = new IconDescription({ name: "icon", size: 96, context: "devices" });
	const theme = new Theme( "foobar", new Map([
		[ "Icon Theme", new Map([
			[ "directories", "foo,bar,baz" ]
		]) ],
		[ "foo", new Map([
			[ "context", "devices" ],
			[ "type", "fixed" ],
			[ "size", 32 ]
		]) ],
		[ "bar", new Map([
			[ "context", "applications" ],
			[ "type", "fixed" ],
			[ "size", 64 ]
		]) ],
		[ "baz", new Map([
			[ "context", "devices" ],
			[ "type", "fixed" ],
			[ "size", 128 ]
		]) ]
	]) );
	const accessStub = sinon.stub();
	const lookupExactIcon = proxyquire( "../../../lib/icons/lookup/closest", {
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

	t.is(
		await lookupExactIcon( icon, theme, [ "png", "svg" ] ),
		null
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
		[ "/usr/share/icons/foobar/bar/icon.svg", 1 ],
		[ "/home/foo/.local/share/icons/foobar/baz/icon.png", 1 ],
		[ "/home/foo/.local/share/icons/foobar/baz/icon.svg", 1 ],
		[ "/usr/local/share/icons/foobar/baz/icon.png", 1 ],
		[ "/usr/local/share/icons/foobar/baz/icon.svg", 1 ],
		[ "/usr/share/icons/foobar/baz/icon.png", 1 ],
		[ "/usr/share/icons/foobar/baz/icon.svg", 1 ]
	]);

	accessStub.reset();
	accessStub.callsFake( async path => {
		if ( !path.startsWith( "/usr/share/icons" ) || !path.endsWith( ".png" ) ) {
			throw false;
		}
	});

	t.is(
		await lookupExactIcon( icon, theme, [ "png", "svg" ] ),
		"/usr/share/icons/foobar/bar/icon.png"
	);
	t.deepEqual( accessStub.args, [
		[ "/home/foo/.local/share/icons/foobar/foo/icon.png", 1 ],
		[ "/home/foo/.local/share/icons/foobar/foo/icon.svg", 1 ],
		[ "/usr/local/share/icons/foobar/foo/icon.png", 1 ],
		[ "/usr/local/share/icons/foobar/foo/icon.svg", 1 ],
		[ "/usr/share/icons/foobar/foo/icon.png", 1 ],
		[ "/home/foo/.local/share/icons/foobar/bar/icon.png", 1 ],
		[ "/home/foo/.local/share/icons/foobar/bar/icon.svg", 1 ],
		[ "/usr/local/share/icons/foobar/bar/icon.png", 1 ],
		[ "/usr/local/share/icons/foobar/bar/icon.svg", 1 ],
		[ "/usr/share/icons/foobar/bar/icon.png", 1 ]
	]);

	accessStub.reset();
	accessStub.resolves();

	t.is(
		await lookupExactIcon( iconContext, theme, [ "png", "svg" ] ),
		"/usr/share/icons/foobar/baz/icon.png"
	);
	t.deepEqual( accessStub.args, [
		[ "/home/foo/.local/share/icons/foobar/foo/icon.png", 1 ],
		[ "/usr/local/share/icons/foobar/foo/icon.png", 1 ],
		[ "/usr/share/icons/foobar/foo/icon.png", 1 ],
		[ "/home/foo/.local/share/icons/foobar/baz/icon.png", 1 ],
		[ "/usr/local/share/icons/foobar/baz/icon.png", 1 ],
		[ "/usr/share/icons/foobar/baz/icon.png", 1 ]
	]);
});
