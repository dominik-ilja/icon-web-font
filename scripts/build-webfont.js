const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const { join, basename } = require("node:path");

const webfont = require("webfont").default;

const { buildOutputDirectories } = require("../utils/util.js");
const config = require("../config.js");

/**
 * @param {import('webfont/dist/src/types/Result.js').Result} result
 */
function generateCSS(result) {
  console.log("Building CSS for font");

  /* css  */
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

/**
 * @param {import('webfont/dist/src/types/Result.js').Result} result
 */
function generateHTML(result) {
  console.log("Building HTML");

  /* html  */
  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="preload" as="font" href="./foxi-icons.woff" crossorigin>
    <link rel="preload" as="style" href="./foxi-icons.css">

    <link rel="stylesheet" href="./foxi-icons.css" />
    <title>foxi-icons</title>

    <style>
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      body {
        background-color: hsl(180, 100%, 99%);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      table {
        width: 100%;
        max-width: 768px;
        margin-inline: auto;
        font-size: 1rem;
        border-collapse: collapse;
        border-spacing: 0;
      }

      th {
        border-bottom: 1px solid hsl(180, 100%, 96%);
      }

      th,
      td:first-child {
        text-align: left;
        padding: 1rem;
      }

      td:first-child {
        font-size: 1.5rem;
      }

      tbody tr:nth-child(odd) {
        background-color: #fff;
      }

      button {
        font-size: 1rem;
        cursor: pointer;
        background-color: transparent;
        border: 1px solid transparent;
        margin: 0;
        height: 100%;
        border-radius: 6px;
        padding: 1rem;
        display: flex;
        width: 100%;
        text-align: left;
        transition: all 0.175s;
      }

      button:is(:focus-visible, :hover) {
        background-color: hsl(180, 100%, 97%);
        border-color: hsl(180, 100%, 75%);
      }
    </style>

    <script>
      window.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        const text = button.textContent;

        navigator.clipboard.writeText(text);
        button.textContent = "Copied!";

        setTimeout(() => {
          button.textContent = text;
        }, 1500);
      })
    </script>
  </head>
  <body>
    <table>
      <thead>
        <tr>
          <th>Icon</th>
          <th>Name</th>
          <th>Unicode</th>
        </tr>
      </thead>
      <tbody>
      ${result.glyphsData
        .map((glyph) => {
          const iconClass = `${config.iconPrefix}${glyph.metadata.name}`;
          return `
          <tr>
            <td><span class="${iconClass}"></span></td>
            <td><button>${iconClass}</button></td>
            <td><button>${glyph.metadata.unicode[0]
              .charCodeAt(0)
              .toString(16)}</button></td>
          </tr>
          `.trim();
        })
        .join("\n")}
      </tbody>
    </table>
  </body>
</html>
`.trim();

  fs.writeFileSync(join(config.output.font, config.fontName + ".html"), html);
}

async function buildWebfont() {
  buildOutputDirectories();

  // copy the icons over to the config.output.fontIcons
  const paths = config.iconSets
    .map(({ iconSet, icons }) => {
      return icons.map((icon) => join(config.output.fixedIcons, iconSet, `${icon}.svg`));
    })
    .flat();

  console.log(`Copying icons to ${config.output.fontIcons}`);
  const promises = paths.map((path) =>
    fsPromises.copyFile(path, join(config.output.fontIcons, basename(path)))
  );
  await Promise.all(promises);

  console.log("Building webfont");
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
  generateHTML(result);
}
buildWebfont();
