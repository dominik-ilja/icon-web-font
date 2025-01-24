const fs = require("node:fs");
const { join, resolve } = require("node:path");

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
  src: url("./${config.fontName}.woff2") format("woff2");
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

  result.glyphsData.forEach(glyph => {
    const { name, unicode } = glyph.metadata;
    const content = unicode[0].charCodeAt(0).toString(16);

    css += `.${config.iconPrefix}${name}:before {
  content: "\\${content}";
}

`;
  })

  const cssOutput = join(config.output.font, config.fontName + ".css");
  fs.writeFileSync(cssOutput, css.trim());
}

async function buildWebfont() {
  const result = await webfont({
      files: join(config.output.fontIcons, "*.svg"),
      formats: ["woff2"],
      normalize: true,
      startUnicode: 59648, // e900 - this aligns with the starting point of icomoon
  })

  fs.writeFileSync(
    join(config.output.font, config.fontName + ".woff2"),
    result.woff2
  );

  generateCSS(result);
}
buildWebfont();


