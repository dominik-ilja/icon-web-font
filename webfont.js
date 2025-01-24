const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const { join, basename } = require("node:path");

const webfont = require("webfont").default;

const { config } = require("./config.js");

/**
 * @param {import('webfont/dist/src/types/Result.js').Result} result
 */
function generateCSS(result) {
  let css = `@font-face {
  font-display: swap;
  font-family: "${config.fontName}";
  font-style: normal;
  font-weight: normal;
  src: url("./${config.fontName}.woff") format("woff");
}

[class^="icon-"],
[class*=" icon-"] {
  font-family: "${config.fontName}" !important;
  font-style: normal;
  font-variant: normal;
  font-weight: normal;
  line-height: 1;
  text-transform: none;
}

`;

  result.glyphsData.forEach((glyph) => {
    const { name, unicode } = glyph.metadata;
    const content = unicode[0].charCodeAt(0).toString(16);

    css += `.${config.iconPrefix}${name}:before {
  content: "\\${content}";
}

`;
  });

  const cssOutput = join(config.output.font, config.fontName + ".css");
  fs.writeFileSync(cssOutput, css.trim());
}

async function buildWebfont() {
  // copy the icons over to the config.output.fontIcons
  const paths = config.iconSets
    .map(({ iconSet, icons }) => {
      return icons.map((icon) => join(config.output.fixedIcons, iconSet, `${icon}.svg`));
    })
    .flat();

  const promises = paths.map((path) =>
    fsPromises.copyFile(path, join(config.output.fontIcons, basename(path)))
  );
  await Promise.all(promises);

  console.log(join(config.output.fontIcons, "**/*.svg"));

  const result = await webfont({
    files: "dist/icons/*.svg",
    formats: ["woff"],
    verbose: true,
    fontHeight: 1000,
    normalize: true,
    startUnicode: 59648, // e900 - this aligns with the starting point of icomoon
  });

  fs.writeFileSync(join(config.output.font, config.fontName + ".woff"), result.woff);

  generateCSS(result);
}
buildWebfont();
