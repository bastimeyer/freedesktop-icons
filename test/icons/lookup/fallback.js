const test = require( "ava" );
const proxyquire = require( "proxyquire" ).noCallThru().noPreserveCache();
const sinon = require( "sinon" );
const IconDescription = require( "../../../lib/icon-description" );


test( "Lookup fallback icon", async t => {
	const icon = new IconDescription({ name: "icon" });
	const accessStub = sinon.stub();
	const lookupFallbackIcon = proxyquire( "../../../lib/icons/lookup/fallback", {
		"./fs": {
			constants: {
				R_OK: 1
			},
			access: accessStub
		}
	});

	accessStub.rejects();

	t.is( await lookupFallbackIcon( icon, "/usr/share/pixmaps", [ "png", "svg" ] ), null );
	t.deepEqual( accessStub.args, [
		[ "/usr/share/pixmaps/icon.png", 1 ],
		[ "/usr/share/pixmaps/icon.svg", 1 ]
	]);

	accessStub.resetHistory();
	accessStub.withArgs( "/usr/share/pixmaps/icon.png", 1 ).resolves();

	t.is(
		await lookupFallbackIcon( icon, "/usr/share/pixmaps", [ "png", "svg" ] ),
		"/usr/share/pixmaps/icon.png"
	);
	t.deepEqual( accessStub.args, [
		[ "/usr/share/pixmaps/icon.png", 1 ]
	]);
});
