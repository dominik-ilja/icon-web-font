# Icons

This repository is a collection of icons that I use in icon web fonts.

## Build process

To make an SVG usable compatible with web fonts, we need to make sure that the SVG only has a single `<path>` tag within it. This is done through the use of the [`oslllo-svg-fixer`](https://github.com/oslllo/svg-fixer) package. The package will do the "fixing" of our SVGs.

All unprocessed icons are contained within the "icons" directory. Each icon set is contained within its own sub-directory within "icons". We can think of it like this:

```
# Syntax
icons/[icon-set]

# Example
icons/lucide
```

The SVG file sizes are more than likely going to be larger than their previous sives. We try to reduce that as much as we can using the [`svgo`](https://github.com/svg/svgo) package. Running svgo on the Lucide package removes between 121 bytes to 2,560 bytes per SVG.

The final step is to pick out the icons you want to use in the web font.

## Todo

- [ ] Update the `config.iconSets` to something like `fontIcons`, `iconsForFont`, or `iconsToIncludeInFont`
- [ ] Add formats to config so that we can automatically generates formats in our CSS
- [ ] Generate a simple HTML file that will be placed in `config.output.font` to see the icons we've generated. We could make a card that includes the following: icon, name, unicode. Allow the ability to copy the unicode by clicking the card
- [ ] Create a script that'll pull icons from a given repo
- [x] Look into library [svgicons2svgfont](https://github.com/nfroidure/svgicons2svgfont)
- [x] Figure out how to use [webfont](https://github.com/itgalaxy/webfont/tree/master)
- [x] Update script to automatically create the dist folder if it doesn't exist
- [x] Have it loop over each folder within icons

## Notes

We simply need to create a part of the application that generates the web font. We don't need to worry about anything that comes before it.

Icons need to be the same height and width as their viewbox. We were having an issue where we were doing the following:

```xml
<svg
  height="24"
  width="24"
  viewBox="0 0 48 48"
  xmlns="http://www.w3.org/2000/svg"
>
```

This caused our rendered icon to be a fourth of its original size. Updating height and width to `48` corrected the issue:

```xml
<svg
  height="48"
  width="48"
  viewBox="0 0 48 48"
  xmlns="http://www.w3.org/2000/svg"
>
```

## Issues

The "webfont" package relies upon the "svgicons2svgfont" library. svgicons2svgfont seems to be having issues rendering the icons. What I found is that setting the `fontHeight` to `1000` and `normalize` to `true` in the webfont fixes the rendering issues.
