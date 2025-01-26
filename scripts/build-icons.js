// Native modules
const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const { basename, join } = require("node:path");

// 3rd party modules
const SVGFixer = require("oslllo-svg-fixer");
const { optimize } = require("svgo");

// Local modules
const { buildOutputDirectories } = require("../utils/util");
const config = require("../config");

async function buildIconSet(source, output) {
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

async function run() {
  try {
    buildOutputDirectories();

    // get each sub-directory from source
    const iconSets = fs.readdirSync(config.source.iconSets, {
      encoding: "utf-8",
      withFileTypes: true,
    });

    const promises = iconSets
      .filter((iconSet) => iconSet.isDirectory())
      .map((iconSet) => {
        const source = join(iconSet.path, iconSet.name);
        const output = join(config.output.fixedIcons, iconSet.name);
        return buildIconSet(source, output, iconSet.name);
      });

    await Promise.all(promises);
  } catch (error) {
    console.error(error);
  }
}
run();
