const test = require( "ava" );
const ID = require( "../../lib/icon-description" );
const ThemeDirectory = require( "../../lib/theme/directory" );


test( "Properties", t => {
	const valid = new ThemeDirectory( new Map([
		[ "size", "64" ],
		[ "scale", "2" ],
		[ "type", "Fixed" ],
		[ "context", "Applications" ],
		[ "minsize", "64" ],
		[ "maxsize", "64" ],
		[ "threshold", "0" ]
	]) );
	t.is( valid.size, 64 );
	t.is( valid.scale, 2 );
	t.is( valid.type, "fixed" );
	t.is( valid.context, "applications" );
	t.is( valid.minsize, 64 );
	t.is( valid.maxsize, 64 );
	t.is( valid.threshold, 0 );

	const empty = new ThemeDirectory( new Map([
		[ "size", "128" ],
		[ "foo", "bar" ]
	]) );
	t.is( empty.size, 128 );
	t.is( empty.scale, 1 );
	t.is( empty.type, "threshold" );
	t.is( empty.context, null );
	t.is( empty.minsize, 128 );
	t.is( empty.maxsize, 128 );
	t.is( empty.threshold, 2 );
	t.is( empty.foo, undefined );

	t.throws(
		() => new ThemeDirectory( new Map() ),
		{ instanceOf: Error, message: "Directory sections require a size property" }
	);

	t.throws(
		() => new ThemeDirectory( new Map([
			[ "type", "foo" ],
			[ "size", 64 ]
		]) ),
		{ instanceOf: Error, message: "Invalid directory section type: foo" }
	);
});


test( "Matches icon", t => {
	const appsFixed64One = new ThemeDirectory( new Map([
		[ "context", "Applications" ],
		[ "type", "Fixed" ],
		[ "size", 64 ],
		[ "scale", 1 ]
	]) );
	const appsFixed64Two = new ThemeDirectory( new Map([
		[ "context", "Applications" ],
		[ "type", "Fixed" ],
		[ "size", 64 ],
		[ "scale", 2 ]
	]) );
	const fixed = new ThemeDirectory( new Map([
		[ "type", "Fixed" ],
		[ "size", 64 ]
	]) );
	const scalable = new ThemeDirectory( new Map([
		[ "type", "Scalable" ],
		[ "size", 48 ],
		[ "minsize", 32 ],
		[ "maxsize", 64 ]
	]) );
	const threshold = new ThemeDirectory( new Map([
		[ "type", "Threshold" ],
		[ "size", 48 ],
		[ "threshold", 16 ]
	]) );

	// unspecific
	t.truthy( appsFixed64One.matchesIcon( new ID({ name: "a" }) ) );
	t.falsy( appsFixed64Two.matchesIcon( new ID({ name: "a" }) ), "Scale of 1 is implied" );
	// type
	t.truthy( appsFixed64One.matchesIcon( new ID({ name: "a", type: "fixed" }) ), "No size" );
	t.falsy( appsFixed64One.matchesIcon( new ID({ name: "a", type: "scalable" }) ) );
	t.falsy( appsFixed64One.matchesIcon( new ID({ name: "a", type: "threshold" }) ) );
	// context
	t.truthy( appsFixed64One.matchesIcon( new ID({ name: "a", context: "applications" }) ) );
	t.falsy( appsFixed64One.matchesIcon( new ID({ name: "a", context: "devices" }) ) );
	// scale
	t.truthy( appsFixed64One.matchesIcon( new ID({ name: "a", scale: 1 }) ) );
	t.falsy( appsFixed64Two.matchesIcon( new ID({ name: "a", scale: 1 }) ) );
	t.falsy( appsFixed64One.matchesIcon( new ID({ name: "a", scale: 2 }) ) );
	t.truthy( appsFixed64Two.matchesIcon( new ID({ name: "a", scale: 2 }) ) );
	// size (fixed)
	t.falsy( fixed.matchesIcon( new ID({ name: "a", type: "fixed", size: 32 }) ) );
	t.truthy( fixed.matchesIcon( new ID({ name: "a", type: "fixed", size: 64 }) ) );
	// size (scalable)
	t.falsy( scalable.matchesIcon( new ID({ name: "a", type: "scalable", size: 31 }) ) );
	t.truthy( scalable.matchesIcon( new ID({ name: "a", type: "scalable", size: 32 }) ) );
	t.truthy( scalable.matchesIcon( new ID({ name: "a", type: "scalable", size: 64 }) ) );
	t.falsy( scalable.matchesIcon( new ID({ name: "a", type: "scalable", size: 65 }) ) );
	// size (threshold)
	t.falsy( threshold.matchesIcon( new ID({ name: "a", type: "threshold", size: 31 }) ) );
	t.truthy( threshold.matchesIcon( new ID({ name: "a", type: "threshold", size: 32 }) ) );
	t.truthy( threshold.matchesIcon( new ID({ name: "a", type: "threshold", size: 64 }) ) );
	t.falsy( threshold.matchesIcon( new ID({ name: "a", type: "threshold", size: 65 }) ) );
});


test( "Get size difference", t => {
	const context = new ThemeDirectory( new Map([
		[ "context", "Applications" ],
		[ "size", 64 ]
	]) );
	const fixed = new ThemeDirectory( new Map([
		[ "type", "Fixed" ],
		[ "size", 64 ]
	]) );
	const scalable = new ThemeDirectory( new Map([
		[ "type", "Scalable" ],
		[ "size", 48 ],
		[ "minsize", 32 ],
		[ "maxsize", 64 ]
	]) );
	const threshold = new ThemeDirectory( new Map([
		[ "type", "Threshold" ],
		[ "size", 48 ],
		[ "minsize", 32 ],
		[ "maxsize", 64 ],
		[ "threshold", 8 ]
	]) );

	t.is( fixed.getSizeDiff( new ID({ name: "a", type: "scalable" }) ), null );
	t.is( context.getSizeDiff( new ID({ name: "a", context: "devices" }) ), null );

	t.is( fixed.getSizeDiff( new ID({ name: "a", size: 32 }) ), 32 );
	t.is( fixed.getSizeDiff( new ID({ name: "a", size: 96 }) ), 32 );

	t.is( scalable.getSizeDiff( new ID({ name: "a", size: 16 }) ), 16 );
	t.is( scalable.getSizeDiff( new ID({ name: "a", size: 31 }) ), 1 );
	t.is( scalable.getSizeDiff( new ID({ name: "a", size: 32 }) ), 0 );
	t.is( scalable.getSizeDiff( new ID({ name: "a", size: 64 }) ), 0 );
	t.is( scalable.getSizeDiff( new ID({ name: "a", size: 65 }) ), 1 );
	t.is( scalable.getSizeDiff( new ID({ name: "a", size: 80 }) ), 16 );

	t.is( threshold.getSizeDiff( new ID({ name: "a", size: 16 }) ), 16 );
	t.is( threshold.getSizeDiff( new ID({ name: "a", size: 39 }) ), -7 );
	t.is( threshold.getSizeDiff( new ID({ name: "a", size: 40 }) ), 0 );
	t.is( threshold.getSizeDiff( new ID({ name: "a", size: 56 }) ), 0 );
	t.is( threshold.getSizeDiff( new ID({ name: "a", size: 57 }) ), -7 );
	t.is( threshold.getSizeDiff( new ID({ name: "a", size: 80 }) ), 16 );
});
