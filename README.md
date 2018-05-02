freedesktop-icons
===

![][badge-npm] ![][badge-travis] ![][badge-codecov]

Find icon paths according to the [freedesktop icon theme specification](https://specifications.freedesktop.org/icon-theme-spec/icon-theme-spec-latest.html).

- minimal dependencies
- fast
- asynchronous


## Install

Requires at least NodeJS `8.0.0`.

```bash
# via yarn
yarn add freedesktop-icons
# or via npm
npm install --save-prod freedesktop-icons
```


## API

```typescript
interface IconDescription {
	// required
	name: string;

	// optional, filters each theme's icon directories, case-insensitive
	type?: "fixed" | "scalable" | "threshold";
	context?: string;
	size?: number;
	scale?: number;
}

module.exports = function freedesktopIcons(
	// The icon query.
	// Can either be a simple string, matching only icon names,
	// or an icon description, including its name, type, context, size or scale.
	// More specific queries result in faster lookups, since theme directories will be filtered.
	// When searching for multiple icons, all queries will be applied to the current theme first
	// before moving on to the next theme.
	icons: ( IconDescription[] | IconDescription | string[] | string ),

	// The themes to use for looking up icons.
	// These have to be internal theme names, as opposed to theme display names.
	// Always adds "hicolor" as the last theme, as defined in the icon theme specification.
	// Looks up icons in the theme's parent themes first before continuing with the next one.
	themes?: ( string[] | string ) = [ "hicolor" ],

	// List of specific icon formats.
	// Searches for png and svg icons by default.
	fileExtensions?: ( string[] | string ) = [ "png", "svg" ],

	// List of non-theme fallback paths.
	// Icons are only being matched by name in fallback paths.
	// Always adds /usr/share/pixmaps as the last fallback path.
	fallbackPaths?: ( string[] | string ) = [ "/usr/share/pixmaps" ]

): ( string | null );

module.exports.clearCache = function clearCache(): void;
```


## Examples

```js
const freedesktopIcons = require( "freedesktop-icons" );

async () => {
	await freedesktopIcons( "some-icon" );
	await freedesktopIcons({ name: "my-app", context: "applications", size: 64 });
	await freedesktopIcons(
		[
			{ name: "my-primary-icon", context: "applications", size: 64 },
			{ name: "my-secondary-icon", context: "applications", size: 64 }
		],
		[
			"Papirus",
			"Paper",
			"Adwaita"
		],
		"png",
		"/path/to/my/app/icons"
	);
	freedesktopIcons.clearCache();
}
```


## Todo

- Implement theme directory caching, as mentioned in the freedesktop icon theme specification


  [badge-npm]: https://img.shields.io/npm/v/freedesktop-icons.svg?style=flat-square
  [badge-travis]: https://img.shields.io/travis/bastimeyer/freedesktop-icons.svg?style=flat-square
  [badge-codecov]: https://img.shields.io/codecov/c/github/bastimeyer/freedesktop-icons.svg?style=flat-square
