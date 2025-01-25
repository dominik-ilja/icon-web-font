const path = require("node:path");

const config = Object.freeze({
  accentHue: 210,
  fontName: "foxi-icons",
  fontFormat: "woff2",
  iconPrefix: "icon-",
  iconSets: [
    {
      icons: ["discord", "facebook", "twitter"],
      iconSet: "foxi",
    },
    {
      icons: [
        "bug",
        "candy",
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
      iconSet: "lucide",
    },
  ],
  output: {
    fixedIcons: path.resolve(__dirname, "./fixed-icons"),
    font: path.resolve(__dirname, "dist"),
    fontIcons: path.resolve(__dirname, "./dist/icons"),
  },
  source: {
    iconSets: path.resolve(__dirname, "./icons"),
  },
  unicodeStartIndex: 59648,
});

module.exports = config;
