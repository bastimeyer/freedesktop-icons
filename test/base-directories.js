const test = require( "ava" );
const proxyquire = require( "proxyquire" ).noCallThru().noPreserveCache();


test.before( t => {
	t.context.env = process.env;
	process.env = {
		HOME: "/home/foo"
	};
});

test.after( t => {
	process.env = t.context.env;
	delete t.context.env;
});


test( "Base directories", t => {
	const deps = {
		"xdg-basedir": {
			dataDirs: [
				"/home/foo/.local/share",
				"/usr/local/share",
				"/usr/share"
			]
		}
	};
	t.deepEqual( proxyquire( "../lib/base-directories", deps ), [
		"/home/foo/.icons",
		"/home/foo/.local/share/icons",
		"/usr/local/share/icons",
		"/usr/share/icons"
	]);

	delete process.env.HOME;
	t.deepEqual( proxyquire( "../lib/base-directories", deps ), [
		"/home/foo/.local/share/icons",
		"/usr/local/share/icons",
		"/usr/share/icons"
	]);
});
