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

- [ ] Create a script that'll pull icons from a given repo
- [ ] Figure out how to use [webfont](https://github.com/itgalaxy/webfont/tree/master)
- [x] Update script to automatically create the dist folder if it doesn't exist
- [x] Have it loop over each folder within icons
