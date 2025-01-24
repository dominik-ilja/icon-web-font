const fs = require("node:fs");
const config = require("../config");

function buildOutputDirectories() {
  Object.values(config.output).forEach((path) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  });
}

module.exports = {
  buildOutputDirectories,
};
