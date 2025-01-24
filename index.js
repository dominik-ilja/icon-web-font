// Native modules
const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const { basename, join } = require("node:path");

// 3rd party modules

const SVGFixer = require("oslllo-svg-fixer");
const { optimize } = require("svgo");

// Local modules
const { config } = require("./config");

async function buildIconSet(source, output, name) {
  console.log(`Building: ${basename(source)}`);

  const fixer = new SVGFixer(source, output, {
    showProgressBar: true,
  });
  await fixer.fix();

  // Optimize SVGs
  const svgPaths = await fsPromises.readdir(output, { encoding: "utf-8" });

  // We track how many characters were removed
  let min = Infinity;
  let max = -Infinity;
  let prevCount = 0;
  let currCount = 0;

  const promises = svgPaths.map(async (svgPath) => {
    const path = join(output, svgPath);
    return fsPromises
      .readFile(path, { encoding: "utf-8" })
      .then((data) => {
        const optimizedSVG = optimize(data, {
          multipass: true,
          path,
        }).data;

        const prevSize = data.length;
        const currSize = optimizedSVG.length;
        const diff = prevSize - currSize;
        prevCount += prevSize;
        currCount += currSize;

        if (diff < min) min = diff;
        if (diff > max) max = diff;

        return fsPromises.writeFile(path, optimizedSVG);
      })
      .catch(console.error);
  });
  await Promise.all(promises);

  console.log({ prevCount, currCount, diff: prevCount - currCount, min, max });
}

async function generateCSS(source, output) {
  const iconOutput = join(output, "icons");
  const paths = FONT_ICONS.map(({ iconSet, icons }) => {
    return icons.map((icon) => join(source, iconSet, `${icon}.svg`));
  }).flat();
  console.log(paths);

  if (!fs.existsSync(iconOutput)) {
    fs.mkdirSync(iconOutput, { recursive: true });
  }

  const promises = paths.map((path) =>
    fsPromises.rename(path, join(iconOutput, basename(path)))
  );
  await Promise.all(promises);

  const cssPath = join(output, `${FONT_NAME}.css`);
  let css = `
@font-face {
  font-display: swap;
  font-family: "${FONT_NAME}";
  font-style: normal;
  font-weight: normal;
  src: url("${FONT_NAME}.woff") format("woff");
}

[class^="icon-"],
[class*=" icon-"] {
  font-family: "${FONT_NAME}" !important;
  font-style: normal;
  font-variant: normal;
  font-weight: normal;
  line-height: 1;
  text-transform: none;
}
`;

  console.log(result.glyphsData[0].metadata);

  //   let index = PRIVATE_USE_AREA_INDEX;
  //   FONT_ICONS.forEach((set) => {
  //     set.icons.forEach((icon) => {
  //       const code = (index++).toString(16);

  //       css += `
  // .icon-${icon}:before {
  //   content: "\e${code}";
  // }
  //       `;
  //     });
  //   });

  fs.writeFileSync(cssPath, css);
  console.log("CSS generated");
}

function buildOutputDirectories() {
  Object.values(config.output).forEach((path) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  });
}

// ---

async function run() {
  // placed here so we can remove the temp dir after finishing
  let tempDir;

  try {
    buildOutputDirectories();

    // get each sub-directory from source
    const iconSets = fs.readdirSync(config.source.iconSets, {
      encoding: "utf-8",
      withFileTypes: true,
    });

    const promises = iconSets
      // .filter((iconSet) => iconSet.isDirectory() && iconSet.name !== "lucide")
      .filter((iconSet) => iconSet.isDirectory())
      .map((iconSet) => {
        const source = join(iconSet.path, iconSet.name);
        const output = join(config.output.fixedIcons, iconSet.name);
        return buildIconSet(source, output, iconSet.name);
      });

    await Promise.all(promises);
  } catch (error) {
    console.error(error);
  } finally {
    if (tempDir != null) fs.rmSync(tempDir, { recursive: true });
  }
}
run();
