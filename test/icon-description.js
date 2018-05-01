const test = require( "ava" );
const IconDescription = require( "../lib/icon-description" );


test( "Properties", t => {
	const valid = new IconDescription({
		name: "foo",
		type: "Fixed",
		context: "Applications",
		size: "64",
		scale: "2"
	});
	t.is( valid.name, "foo" );
	t.is( valid.type, "fixed" );
	t.is( valid.context, "applications" );
	t.is( valid.size, 64 );
	t.is( valid.scale, 2 );

	const invalid = new IconDescription({
		name: "foo",
		foo: "bar"
	});
	t.is( invalid.foo, undefined );

	const implicit = new IconDescription( "foo" );
	t.is( implicit.name, "foo" );
	t.is( implicit.type, null );
	t.is( implicit.context, null );
	t.is( implicit.size, null );
	t.is( implicit.scale, null );

	t.throws( () => new IconDescription( {} ), { message: "Invalid icon query input" } );
	t.throws( () => new IconDescription( 99 ), { message: "Invalid icon query input" } );
});
