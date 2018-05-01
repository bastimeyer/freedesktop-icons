const test = require( "ava" );
const proxyquire = require( "proxyquire" ).noCallThru().noPreserveCache();
const sinon = require( "sinon" );
const ID = require( "../lib/icon-description" );


test.beforeEach( t => {
	t.context.findIconsStub = sinon.stub();
	t.context.clearCacheStub = sinon.stub();
	t.context.subject = proxyquire( "../lib", {
		"./icons/find": t.context.findIconsStub,
		"./theme": {
			clearCache: t.context.clearCacheStub
		}
	});
});


test( "Clear cache", t => {
	t.context.subject.clearCache();
	t.truthy( t.context.clearCacheStub.calledOnce );
});


test( "Get icon failures", async t => {
	t.context.findIconsStub.rejects( new Error( "Fail" ) );

	await t.throws(
		t.context.subject(),
		{ instanceOf: Error, message: "Missing icon query" }
	);
	await t.throws(
		t.context.subject( [] ),
		{ instanceOf: Error, message: "Missing icon query" }
	);
	await t.throws(
		t.context.subject( {} ),
		{ instanceOf: Error, message: "Invalid icon query input" }
	);
	await t.throws(
		t.context.subject( { name: "" } ),
		{ instanceOf: Error, message: "Invalid icon query input" }
	);
	await t.throws(
		t.context.subject( "" ),
		{ instanceOf: Error, message: "Invalid icon query input" }
	);
	await t.throws(
		t.context.subject( 123 ),
		{ instanceOf: Error, message: "Invalid icon query input" }
	);

	await t.throws(
		t.context.subject( "foo", undefined, [] ),
		{ instanceOf: Error, message: "Missing icon file name extensions" }
	);

	await t.throws(
		t.context.subject( "foo" ),
		{ instanceOf: Error, message: "Fail" }
	);
});


test( "Get icon", async t => {
	const expected = "/foo/bar";
	const id = new ID({ name: "foo", size: 64 });
	t.context.findIconsStub.resolves( expected );

	t.is(
		await t.context.subject( "foo" ),
		expected
	);
	t.truthy(
		t.context.findIconsStub.calledWithExactly(
			[ new ID( "foo" ) ],
			[ "hicolor" ],
			[ "png", "svg" ],
			[ "/usr/share/pixmaps" ]
		),
		"icon string input"
	);

	t.context.findIconsStub.resetHistory();
	t.is(
		await t.context.subject( id ),
		expected
	);
	t.truthy(
		t.context.findIconsStub.calledWithExactly(
			[ id ],
			[ "hicolor" ],
			[ "png", "svg" ],
			[ "/usr/share/pixmaps" ]
		),
		"icon description input"
	);

	t.context.findIconsStub.resetHistory();
	t.is(
		await t.context.subject( [ id, "bar" ] ),
		expected
	);
	t.truthy(
		t.context.findIconsStub.calledWithExactly(
			[ id, new ID( "bar" ) ],
			[ "hicolor" ],
			[ "png", "svg" ],
			[ "/usr/share/pixmaps" ]
		),
		"array of mixed icon inputs"
	);

	t.context.findIconsStub.resetHistory();
	t.is(
		await t.context.subject( id, "qux", "png", "/foo" ),
		expected
	);
	t.truthy(
		t.context.findIconsStub.calledWithExactly(
			[ id ],
			[ "qux", "hicolor" ],
			[ "png" ],
			[ "/foo", "/usr/share/pixmaps" ]
		),
		"theme, ext and fallbackPath string input"
	);

	t.context.findIconsStub.resetHistory();
	t.is(
		await t.context.subject(
			id,
			[ "qux", "hicolor", "quux" ],
			[ "svg", "png" ],
			[ "/foo", "/bar" ]
		),
		expected
	);
	t.truthy(
		t.context.findIconsStub.calledWithExactly(
			[ id ],
			[ "qux", "quux", "hicolor" ],
			[ "svg", "png" ],
			[ "/foo", "/bar", "/usr/share/pixmaps" ]
		),
		"theme, ext and fallbackPath arrays"
	);
});
