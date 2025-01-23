// Native modules
const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const { basename, join } = require("node:path");

// 3rd party modules
const SVGFixer = require("oslllo-svg-fixer");
const { optimize } = require("svgo");
const webfont = require("webfont").default;

const SOURCE_DIRECTORY = join(__dirname, "icons");
const OUTPUT_DIRECTORY = join(__dirname, "dist");
const ENCODING = { encoding: "utf-8" };
const FONT_NAME = "foxi-icons";
const CLASS_PREFIX = "icon-";
const FONT_ICONS = [
  {
    iconSet: "foxi",
    icons: ["discord", "facebook", "twitter"],
  },
  {
    iconSet: "lucide",
    icons: [
      "chevron-down",
      "chevron-left",
      "chevron-right",
      "chevrons-left",
      "chevrons-right",
      "circle-play",
      "globe",
      "moon",
      "quote",
      "sun",
    ],
  },
];
const PRIVATE_USE_AREA_INDEX = 59648;

async function run() {
  let tempDir;
  try {
    // Fixer can't handle creating nested folders, so we have to do that ourself
    if (!fs.existsSync(OUTPUT_DIRECTORY)) {
      fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
    }
    tempDir = fs.mkdtempSync(join(__dirname, "temp-"), { encoding: "utf-8" });

    // get each sub-directory from source
    const iconSets = fs.readdirSync(SOURCE_DIRECTORY, {
      encoding: "utf-8",
      withFileTypes: true,
    });

    const promises = iconSets
      .filter((iconSet) => iconSet.isDirectory())
      .map((iconSet) => {
        const source = join(iconSet.parentPath, iconSet.name);
        const output = join(tempDir, iconSet.name);
        return buildIconSet(source, output);
      });
    await Promise.all(promises);

    await generateCSS(tempDir, OUTPUT_DIRECTORY);
  } catch (error) {
    console.error(error);
  } finally {
    if (tempDir != null) fs.rmSync(tempDir, { recursive: true });
  }
}
run();

async function buildIconSet(source, output) {
  console.log(`Building: ${basename(source)}`);

  if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true });
  }

  // Fix icons
  const fixer = new SVGFixer(source, output, {
    showProgressBar: true,
  });
  await fixer.fix();

  // Optimize SVGs
  const svgPaths = await fsPromises.readdir(output, ENCODING);

  // We track how many characters were removed
  let min = Infinity;
  let max = -Infinity;
  let prevCount = 0;
  let currCount = 0;

  const promises = svgPaths.map(async (svgPath) => {
    const path = join(output, svgPath);
    return fsPromises
      .readFile(path, ENCODING)
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

        // console.log(
        //   `Characters removed from "${svgPath}": ${prevSize} - ${currSize} = ${diff}`
        // );

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
