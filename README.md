# Icons

This repository is a collection of icons that I use in icon web fonts.

## Config file

The config file defines all the configuration for out project.

| Config                            | Type                                           | Description                                                                                                                                                                            |
| --------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accentHue`                       | Number                                         | A number between 0 and 360. This represents the hue in an HSL color. It allows you to customize the look of the output HTML file.                                                      |
| `fontName`                        | String                                         | The name of your icon font.                                                                                                                                                            |
| `fontFormat`                      | `"eot" \| "svg" \| "ttf" \| "woff" \| "woff2"` | The font type you wish your font to be in. The recommended value is `"woff2"`.                                                                                                         |
| `iconPrefix`                      | String                                         | The prefix that should be applied to all icon CSS classes. The recommended value is `"icon-"`.                                                                                         |
| `iconsToIncludeInFont`            | `{ icons: string[], iconSet: string }[]`       | Contains objects that map to different icon sets and the icons we want to use from them.                                                                                               |
| `iconsToIncludeInFont[i].icons`   | String[]                                       | An array of strings that map to the exact name of the icon within the icon set without the `.svg` extension.                                                                           |
| `iconsToIncludeInFont[i].iconSet` | String                                         | The name of the icon set. Must match the name of a directory within `config.source.iconSets`.                                                                                          |
| `output`                          | Object                                         | Contains the different paths to output files.                                                                                                                                          |
| `output.fixedIcons`               | String                                         | The path to where the processed icons should be output. The recommended value is `"fixed-icons"`                                                                                       |
| `output.font`                     | String                                         | The path to where the icon font should be output. The recommended value is `"dist"`.                                                                                                   |
| `output.fontIcons`                | String                                         | The path to where the icons used within the icon font should be output. The recommended value is `"dist/icons"`.                                                                       |
| `source`                          | Object                                         | Contains the different paths to source files.                                                                                                                                          |
| `source.iconSets`                 | String                                         | Path to the directory containing the icon sets to be built. The recommended value is `"icon-sets"`.                                                                                    |
| `unicodeStartIndex`               | Number                                         | This is the starting number for the internal unicode values for each icon. This value gets incremented for each icon. The recommended value is `59648` which is `e900` in hexadecimal. |

## Build process

### Step 1 - Make SVGs compatible with web fonts

To make an SVG compatible with web fonts, we need to make sure that the SVG only has a single `<path>` tag within it. The [`oslllo-svg-fixer`](https://github.com/oslllo/svg-fixer) package is used to make the our SVGs web font compatible.

All unprocessed icons are contained within the "icon-sets" directory. Each icon set is contained within its own sub-directory within "icon-sets". We can think of the directory structure like this:

```
# Syntax
icons/[icon-set]

# Example
icons/lucide
```

The processed icons are placed into a dfirectory called "fixed-icons".

### Step 2 - Optimize icons

The SVG file sizes are almost guaranteed to be larger than their previous sizes. To combat this, we optimize our SVGs with the [`svgo`](https://github.com/svg/svgo) package. Running svgo on the compatible Lucide icons removed between 121 bytes to 2,560 bytes per SVG. The optimized SVGs will write to their corresponding files in "fixed-icons".

### Step 3 - Generating web font

The build process can start at this step if we've already processed icons that we want to use.

We take all the icons that we want use from the "fixed-icons" directory and copy them to the output directory defined in the config. We use the [`webfont`]() package to handle the conversion.

We create the CSS file that defines all the mappings between the icons and CSS classes.

Lastly, an HTML file is generated that has a table listing all the icons, their names, and their unicode numbers.

## Gotchas

### SVG height, width, and viewbox

SVGs need to be the same height and width as their viewbox. If these attributes differ from the viewbox, then an unexpected result from the "oslllo-svg-fixer" package can happen.

I was doing the following.:

```xml
<svg
  height="24"
  width="24"
  viewBox="0 0 48 48"
  xmlns="http://www.w3.org/2000/svg"
>
```

This caused our rendered icon to be a fourth of its original size. Updating the height and width to `48` corrected the issue:

```xml
<svg
  height="48"
  width="48"
  viewBox="0 0 48 48"
  xmlns="http://www.w3.org/2000/svg"
>
```

### webfont package configuration

The "webfont" package relies upon the "svgicons2svgfont" library. I've encountered issues with the svgicons2svgfont library where rendered icons were distorted and ugly. What I found is that setting the `fontHeight` to `1000` and `normalize` to `true` in the webfont configuration fixes these issues.

### Overrides

Icons which share the same name, but belong to different icon sets will override each other. The icon set that comes last alphabetically will be the "winner".

Let's say we have the following in our config:

```js
const config = Object.freeze({
  iconsToIncludeInFont: [
    {
      icons: ["sun"],
      iconSet: "font-awesome",
    },
    {
      icons: ["sun"],
      iconSet: "foxi",
    },
    {
      icons: ["sun"],
      iconSet: "lucide",
    },
  ],
});
```

The alphabetical order would be font-awesome, foxi, then lucide. This means the sun icon from the Lucide library would be used.

## Todo

- [ ] Create a script that'll pull icons from a given repo
- [x] Update the `config.iconSets` to something like `fontIcons`, `iconsForFont`, or `iconsToIncludeInFont`
- [x] Add format to config so that we can automatically generates formats in our CSS
- [x] Generate a simple HTML file that will be placed in `config.output.font` to see the icons we've generated. We could make a card that includes the following: icon, name, unicode. Allow the ability to copy the unicode by clicking the card
- [x] Look into library [svgicons2svgfont](https://github.com/nfroidure/svgicons2svgfont)
- [x] Figure out how to use [webfont](https://github.com/itgalaxy/webfont/tree/master)
- [x] Update script to automatically create the dist folder if it doesn't exist
- [x] Have it loop over each folder within icons
