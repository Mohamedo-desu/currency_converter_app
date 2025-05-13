const {
  withAndroidColors: _withAndroidColors,
} = require("@expo/config-plugins");

const withAndroidColors = (config) => {
  return _withAndroidColors(config, (config) => {
    const colors = config.modResults.resources.color;
    const primaryColor = "#069140";

    // Update all primary color related attributes
    const colorAttributes = ["colorPrimary", "colorPrimaryDark"];

    colorAttributes.forEach((attr) => {
      const colorIndex = colors.findIndex((color) => color.$.name === attr);
      if (colorIndex !== -1) {
        colors[colorIndex]._ = primaryColor;
      } else {
        colors.push({ $: { name: attr }, _: primaryColor });
      }
    });

    return config;
  });
};

module.exports = withAndroidColors;
