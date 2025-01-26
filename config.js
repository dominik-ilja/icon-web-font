const path = require("node:path");

const config = Object.freeze({
  accentHue: 210,
  fontName: "foxi-icons",
  fontFormat: "woff2",
  iconPrefix: "icon-",
  iconsToIncludeInFont: [
    {
      icons: ["discord", "facebook", "twitter"],
      iconSet: "foxi",
    },
    {
      icons: [
        "bug",
        "banana",
        "flame",
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
    iconSets: path.resolve(__dirname, "./icon-sets"),
  },
  unicodeStartIndex: 59648, // e900 - this aligns with the starting point of icomoon
});

module.exports = config;
