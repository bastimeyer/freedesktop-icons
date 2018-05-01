const test = require( "ava" );
const proxyquire = require( "proxyquire" ).noCallThru().noPreserveCache();
const sinon = require( "sinon" );


test( "Lookup icon", async t => {
	const icon = {};
	const theme = {};
	const exts = {};

	const lookupExactIconStub = sinon.stub();
	const lookupClosestIconStub = sinon.stub();
	const lookupIcon = proxyquire( "../../../lib/icons/lookup", {
		"./exact": lookupExactIconStub,
		"./closest": lookupClosestIconStub
	});

	lookupExactIconStub.resolves( "foo" );
	lookupClosestIconStub.resolves( "bar" );

	t.is( await lookupIcon( icon, theme, exts ), "foo" );
	t.truthy( lookupExactIconStub.calledWithExactly( icon, theme, exts ) );
	t.falsy( lookupClosestIconStub.called );

	lookupExactIconStub.reset();
	lookupExactIconStub.resolves( null );

	t.is( await lookupIcon( icon, theme, exts ), "bar" );
	t.truthy( lookupExactIconStub.calledWithExactly( icon, theme, exts ) );
	t.truthy( lookupClosestIconStub.calledWithExactly( icon, theme, exts ) );
	t.truthy( lookupClosestIconStub.calledImmediatelyAfter( lookupExactIconStub ) );

	lookupExactIconStub.resetHistory();
	lookupClosestIconStub.reset();
	lookupClosestIconStub.resolves( null );

	t.is( await lookupIcon( icon, theme, exts ), null );
	t.truthy( lookupExactIconStub.calledWithExactly( icon, theme, exts ) );
	t.truthy( lookupClosestIconStub.calledWithExactly( icon, theme, exts ) );
	t.truthy( lookupClosestIconStub.calledImmediatelyAfter( lookupExactIconStub ) );
});
