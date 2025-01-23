// Native modules
const fs = require("node:fs/promises");
const { join } = require("node:path");

// 3rd party modules
const SVGFixer = require("oslllo-svg-fixer");
const { optimize } = require("svgo");

const SOURCE_DIRECTORY = join(__dirname, "icons/lucide");
const OUTPUT_DIRECTORY = join(__dirname, "dist/lucide");
const ENCODING = { encoding: "utf-8" };

async function run() {
  // Fix icons
  const fixer = new SVGFixer(SOURCE_DIRECTORY, OUTPUT_DIRECTORY, {
    showProgressBar: true,
    throwIfDestinationDoesNotExist: false,
  });
  await fixer.fix();

  // Optimize SVGs
  const svgPaths = await fs.readdir(OUTPUT_DIRECTORY, ENCODING);

  // We track how many characters were removed
  let prevCount = 0;
  let currCount = 0;

  const promises = svgPaths.map(async (svgPath) => {
    const path = join(OUTPUT_DIRECTORY, svgPath);
    return fs
      .readFile(path, ENCODING)
      .then((data) => {
        const optimizedSVG = optimize(data, {
          multipass: true,
          path,
        }).data;

        prevCount += data.length;
        currCount += optimizedSVG.length;
        console.log(`Characters removed: ${data.length - optimizedSVG.length}`);

        return fs.writeFile(path, optimizedSVG);
      })
      .catch(console.error);
  });
  await Promise.all(promises);

  console.log({ prevCount, currCount, diff: prevCount - currCount });
}
run();
