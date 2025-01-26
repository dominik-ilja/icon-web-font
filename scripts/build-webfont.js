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
  src: url("./${config.fontName}.${config.fontFormat}") format("${config.fontFormat}");
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

    css += `
.${config.iconPrefix}${name}:before {
  content: "\\${content}";
}

`.trimStart();
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

  <link rel="preload" as="font" href="./${config.fontName}.${
    config.fontFormat
  }" crossorigin>
  <link rel="preload" as="style" href="./${config.fontName}.css">

  <link rel="stylesheet" href="./${config.fontName}.css" />
  <title>${config.fontName}</title>

  <style>
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    body {
      --accent-hue: ${config.accentHue};

      --background: #fff;
      --bg-interactive: hsl(var(--accent-hue), 100%, 90%);
      --border-interactive: hsl(var(--accent-hue), 100%, 75%);
      --foreground: hsl(var(--accent-hue), 60%, 20%);
      --gradient-stop-1: hsl(var(--accent-hue), 65%, 80%);
      --gradient-stop-2: hsl(calc(var(--accent-hue) + 7), 70%, 70%);
    }

    @media (prefers-color-scheme: dark) {
      body {
        --background: hsl(var(--accent-hue), 50%, 20%);
        --bg-interactive: hsl(var(--accent-hue), 50%, 28%);
        --border-interactive: hsl(var(--accent-hue), 100%, 32%);
        --foreground: hsl(var(--accent-hue), 50%, 96%);
        --gradient-stop-1: hsl(var(--accent-hue), 50%, 8%);
        --gradient-stop-2: hsl(calc(var(--accent-hue) + 7), 70%, 15%);
      }
    }

    body {
      background-image: linear-gradient(135deg, var(--gradient-stop-1), var(--gradient-stop-2));
      color: var(--foreground);
      display: grid;
      place-items: center;
      grid-template-rows: min(100%, 1fr);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      height: 100svh;
      padding: 2rem;
      /* overflow: hidden; */
    }

    button {
      background-color: transparent;
      border-radius: 6px;
      border: 1px solid transparent;
      color: var(--foreground);
      cursor: pointer;
      display: flex;
      font-size: 1rem;
      gap: 1rem;
      height: 100%;
      justify-content: space-between;
      margin: 0;
      padding: 1rem;
      position: relative;
      text-align: left;
      width: 100%;

      span {
        content: "copy";
        opacity: 0;
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
      }

      &:is(:focus-visible, :hover) {
        background-color: var(--bg-interactive);
        border-color: var(--border-interactive);

        span {
          opacity: 1;
        }
      }

    }

    table {
      border-collapse: collapse;
      width: 100%;
    }

    td:first-child,
    th {
      padding: 1rem;
      text-align: left;
    }

    thead {
      position: sticky;
      top: 0;
      z-index: 1;
      background-color: var(--background);
    }

    td {
      padding: 0;
    }

    [class^="icon-"] {
      font-size: 1.5rem;
    }

    .card {
      background-color: var(--background);
      border-radius: 6px;
      font-size: 1rem;
      margin-inline: auto;
      max-width: 768px;
      padding: 0 1rem 1rem 1rem;
      width: 100%;
      overflow-y: auto;
      height: fit-content;
      max-height: 100%;
    }
  </style>
</head>

<body>
  <div class="card">
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
          const unicode = glyph.metadata.unicode[0].charCodeAt(0).toString(16);

          return `
          <tr>
            <td><span class="${iconClass}"></span></td>
            <td><button data-copy="${iconClass}">${iconClass}<span>Copy</span></button></td>
            <td><button data-copy="${unicode}">${unicode}<span>Copy</span></button></td>
          </tr>
          `.trim();
        })
        .join("\n")}
      </tbody>
    </table>
  </div>

  <script defer>
    (
      () => {
        if (!navigator.clipboard) {
          alert('Copying is not available setting fallback. Please click on the name or unicode you wish to copy and use "Ctrl+C".');
          document.querySelectorAll("button").forEach(button => {
            button.setAttribute("contenteditable", "true");
            button.querySelector("span").remove();
          });
          return;
        }

        window.addEventListener("click", (event) => {
          const button = event.target.closest("button");
          const span = button.querySelector("span");

          navigator.clipboard.writeText(button.getAttribute("data-copy"));
          span.textContent = "Copied!";

          setTimeout(() => (span.textContent = "Copy"), 1500);
        });
      }
    )()
  </script>
</body>

</html>
`.trim();

  fs.writeFileSync(join(config.output.font, config.fontName + ".html"), html);
}

async function buildWebfont() {
  buildOutputDirectories();

  // copy the icons over to the config.output.fontIcons
  const paths = config.iconsToIncludeInFont
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
    formats: [config.fontFormat],
    verbose: true,
    fontHeight: 1000,
    normalize: true,
    startUnicode: config.unicodeStartIndex,
  });

  fs.writeFileSync(
    join(config.output.font, config.fontName + `.${config.fontFormat}`),
    result[config.fontFormat]
  );

  generateCSS(result);
  generateHTML(result);
}
buildWebfont();
